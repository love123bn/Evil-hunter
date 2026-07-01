/* ==========================================================
   GAME.JS - Engine chính: game loop, save/load, state, utils
   ========================================================== */

const Game = {
    state: null,
    timers: {},
    running: false,

    /* ===== TRẠNG THÁI MẶC ĐỊNH ===== */
    defaultState() {
        return {
            // Tiền tệ
            gold: 100,
            gems: 5,
            materials: {},      // { bone: 5, skin: 3, ... }
            
            // Thị trấn
            townLevel: 1,
            townName: 'Thị Trấn Nhỏ',
            buildings: {},      // { restaurant: 1, tavern: 1, ... }
            
            // Hunters
            hunters: [],        // mảng hunter objects
            hunterSlots: 3,
            hireCandidates: [],
            
            // Trang bị & Kho đồ
            inventory: [],      // mảng item objects
            equippedItems: {},  // { hunterId: { weapon: itemId, armor: ..., accessory: ... } }
            
            // Zones
            unlockedZones: ['forest'],
            currentZone: 'forest',
            
            // Pets
            pets: [],           // mảng pet objects
            petSlots: 2,
            
            // Chiến đấu
            battleLog: [],
            bossHorns: 0,
            
            // Theo dõi
            totalKills: 0,
            totalGoldEarned: 0,
            totalBossKills: 0,
            totalCrafted: 0,
            totalDungeons: 0,
            totalPlayTime: 0,
            
            // Daily
            dayCount: 1,
            lastLoginDate: null,
            dailyCheckin: [],
            dailyQuestProgress: {},
            dailyQuestsClaimed: {},
            
            // Rebirth
            rebirthPoints: {},
            
            // Time
            createdAt: Date.now(),
            lastSave: Date.now(),
            lastOffline: null
        };
    },

    /* ===== KHỞI TẠO ===== */
    init() {
        // Tải dữ liệu đã lưu
        const saved = localStorage.getItem('evilHunterTycoon');
        if (saved) {
            try {
                this.state = JSON.parse(saved);
                // Merge với defaultState để có các field mới
                const def = this.defaultState();
                for (const key of Object.keys(def)) {
                    if (!(key in this.state)) {
                        this.state[key] = def[key];
                    }
                }
            } catch (e) {
                console.error('Lỗi load save:', e);
                this.state = this.defaultState();
            }
        } else {
            this.state = this.defaultState();
        }

        // Xử lý offline time
        this.handleOffline();

        // Khởi tạo tòa nhà mặc định
        this.initBuildings();

        // Bắt đầu game loop
        this.running = true;
        this.startTimers();

        // Kiểm tra ngày mới
        this.checkNewDay();
    },

    /* ===== XỬ LÝ OFFLINE ===== */
    handleOffline() {
        if (this.state.lastOffline) {
            const now = Date.now();
            const elapsed = now - this.state.lastOffline;
            const seconds = Math.floor(elapsed / 1000);
            
            if (seconds > 30) {
                // Tính offline rewards
                const hunters = this.state.hunters.filter(h => h.alive && h.currentZone);
                let offlineGold = 0;
                let offlineMats = 0;
                let offlineExp = 0;
                let kills = 0;

                hunters.forEach(h => {
                    const zone = GAME_DATA.zones.find(z => z.id === h.currentZone);
                    if (zone) {
                        const baseRate = Math.max(1, Math.floor(seconds / 5));
                        const killsPerHunter = Math.floor(baseRate * 0.5);
                        kills += killsPerHunter;
                        offlineGold += killsPerHunter * zone.goldPerKill;
                        offlineExp += killsPerHunter * (h.level * 2);
                        
                        // Nguyên liệu
                        for (let i = 0; i < killsPerHunter; i++) {
                            if (Math.random() < zone.matDropChance * 0.5) {
                                offlineMats++;
                            }
                        }
                    }
                });

                // Giới hạn offline rewards (max 4 giờ)
                const maxSeconds = 4 * 60 * 60;
                const ratio = Math.min(1, seconds / maxSeconds);
                offlineGold = Math.floor(offlineGold * ratio);
                offlineMats = Math.floor(offlineMats * ratio);
                offlineExp = Math.floor(offlineExp * ratio);

                if (offlineGold > 0 || offlineMats > 0) {
                    this.state.gold += offlineGold;
                    this.state.materials.total = (this.state.materials.total || 0) + offlineMats;
                    
                    // Apply exp
                    hunters.forEach(h => {
                        const expGain = Math.floor(offlineExp / hunters.length);
                        this.gainExp(h, expGain);
                    });

                    // Show offline popup
                    this.showOfflinePopup(seconds, offlineGold, offlineMats, kills);
                }

                this.state.lastOffline = now;
            }
        }
    },

    showOfflinePopup(seconds, gold, mats, kills) {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const body = document.getElementById('offline-body');
        body.innerHTML = `
            <p>⏰ Thời gian offline: <b>${hours}h ${mins}m</b></p>
            <p>⚔️ Quái bị giết: <b>${kills}</b></p>
            <p>💰 Vàng nhận được: <b class="text-gold">${gold}</b></p>
            <p>📦 Nguyên liệu: <b>${mats}</b></p>
        `;
        document.getElementById('offline-popup').classList.remove('hidden');
    },

    /* ===== KHỞI TẠO TÒA NHÀ ===== */
    initBuildings() {
        GAME_DATA.buildings.forEach(b => {
            if (!(b.id in this.state.buildings)) {
                this.state.buildings[b.id] = 1;
            }
        });
    },

    /* ===== HỆ THỐNG LƯU / TẢI ===== */
    save() {
        this.state.lastSave = Date.now();
        this.state.lastOffline = Date.now();
        localStorage.setItem('evilHunterTycoon', JSON.stringify(this.state));
    },

    forceSave() {
        this.save();
        this.notify('💾 Đã lưu game!');
    },

    resetGame() {
        if (confirm('Bạn có chắc muốn reset toàn bộ game? Không thể hoàn tác!')) {
            localStorage.removeItem('evilHunterTycoon');
            location.reload();
        }
    },

    /* ===== GAME LOOP ===== */
    startTimers() {
        // Main tick - 1 giây
        this.timers.main = setInterval(() => {
            this.tick();
        }, GAME_DATA.tickRate);

        // Battle tick
        this.timers.battle = setInterval(() => {
            Game.Battle.tick();
        }, GAME_DATA.battleTickRate);

        // Auto save
        this.timers.save = setInterval(() => {
            this.save();
        }, GAME_DATA.saveInterval);

        // UI refresh
        this.timers.ui = setInterval(() => {
            Game.UI.refresh();
        }, 1000);

        // Spawn hire candidates
        this.timers.hire = setInterval(() => {
            Game.Hunters.spawnCandidate();
        }, GAME_DATA.hireInterval);
    },

    tick() {
        this.state.totalPlayTime++;
        
        // Update hunters stats
        this.state.hunters.forEach(h => {
            if (!h.alive) return;

            // Phục hồi ở thị trấn
            if (!h.inBattle && !h.currentZone) {
                const bldg = this.state.buildings;
                h.satiety = Math.min(100, h.satiety + (bldg.restaurant || 1) * 0.5);
                h.mood = Math.min(100, h.mood + (bldg.tavern || 1) * 0.4);
                h.stamina = Math.min(100, h.stamina + (bldg.inn || 1) * 0.5);
                h.hp = Math.min(h.maxHp, h.hp + (bldg.infirmary || 1) * 2);
            }
        });
    },

    /* ===== EXP SYSTEM ===== */
    gainExp(hunter, amount) {
        const trainingLevel = this.state.buildings.training || 1;
        const bonusMulti = 1 + (trainingLevel - 1) * 0.05;
        const finalExp = Math.floor(amount * bonusMulti);
        
        hunter.exp += finalExp;
        
        const needed = GAME_DATA.expTable(hunter.level);
        while (hunter.exp >= needed && hunter.level < GAME_DATA.maxHunterLevel) {
            hunter.exp -= GAME_DATA.expTable(hunter.level);
            hunter.level++;
            this.levelUp(hunter);
        }
    },

    levelUp(hunter) {
        const cls = GAME_DATA.classes[hunter.classId];
        const q = GAME_DATA.qualities.find(q => q.id === hunter.quality);
        const qualityMulti = q ? 1 + GAME_DATA.qualities.indexOf(q) * 0.2 : 1;
        const rebirthMulti = 1 + (this.state.rebirthPoints[hunter.id] || 0) * 0.05;
        const multi = qualityMulti * rebirthMulti;

        hunter.maxHp += Math.floor(cls.baseStats.hp * 0.12 * multi);
        hunter.atk += Math.floor(cls.baseStats.atk * 0.08 * multi);
        hunter.def += Math.floor(cls.baseStats.def * 0.06 * multi);
        hunter.hp = hunter.maxHp;
        hunter.satiety = 100;
        hunter.mood = 100;
        hunter.stamina = 100;

        this.addLog('levelup', `⬆️ ${hunter.name} lên level ${hunter.level}!`);
    },

    /* ===== NHẬT KÝ ===== */
    addLog(type, message) {
        const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        this.state.battleLog.unshift({ type, message, time });
        if (this.state.battleLog.length > 200) {
            this.state.battleLog = this.state.battleLog.slice(0, 200);
        }
    },

    /* ===== THÔNG BÁO ===== */
    notify(text) {
        const el = document.getElementById('notification');
        const textEl = document.getElementById('notification-text');
        textEl.textContent = text;
        el.classList.remove('hidden');
        clearTimeout(this._notifyTimer);
        this._notifyTimer = setTimeout(() => {
            el.classList.add('hidden');
        }, 2500);
    },

    /* ===== NGÀY MỚI ===== */
    checkNewDay() {
        const today = new Date().toDateString();
        if (this.state.lastLoginDate !== today) {
            this.state.lastLoginDate = today;
            this.state.dayCount++;
            
            // Reset daily quest progress
            this.state.dailyQuestProgress = {};
            this.state.dailyQuestsClaimed = {};
            
            // Reset hire candidates
            this.state.hireCandidates = [];
            
            this.notify('🌅 Ngày mới! Ngày ' + this.state.dayCount);
        }
    },

    /* ===== TÍNH TOÁN LƯƠNG HUNTER ===== */
    getMaxHunters() {
        const tl = this.state.townLevel;
        const upgrade = GAME_DATA.townUpgrades.find(u => u.level === tl);
        return upgrade ? upgrade.hunterSlots : 3;
    },

    /* ===== TÍNH TOÁN GIÁ BUILDING ===== */
    getBuildingCost(buildingId) {
        const bldg = GAME_DATA.buildings.find(b => b.id === buildingId);
        const level = this.state.buildings[buildingId] || 1;
        return {
            gold: Math.floor(bldg.baseCost * Math.pow(bldg.costMulti, level - 1))
        };
    },

    /* ===== UTILS ===== */
    formatNumber(n) {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n.toString();
    },

    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    // Inventory helpers
    addItem(itemId, qty = 1) {
        const existing = this.state.inventory.find(i => i.id === itemId);
        if (existing) {
            existing.qty += qty;
        } else {
            this.state.inventory.push({ id: itemId, qty });
        }
    },

    removeItem(itemId, qty = 1) {
        const idx = this.state.inventory.findIndex(i => i.id === itemId);
        if (idx !== -1) {
            this.state.inventory[idx].qty -= qty;
            if (this.state.inventory[idx].qty <= 0) {
                this.state.inventory.splice(idx, 1);
            }
            return true;
        }
        return false;
    },

    countItem(itemId) {
        const item = this.state.inventory.find(i => i.id === itemId);
        return item ? item.qty : 0;
    },

    // Material helpers
    addMaterial(matId, qty = 1) {
        if (!this.state.materials[matId]) this.state.materials[matId] = 0;
        this.state.materials[matId] += qty;
    },

    removeMaterial(matId, qty = 1) {
        if ((this.state.materials[matId] || 0) >= qty) {
            this.state.materials[matId] -= qty;
            return true;
        }
        return false;
    },

    countMaterial(matId) {
        return this.state.materials[matId] || 0;
    },

    getTotalMaterials() {
        let total = 0;
        for (const key in this.state.materials) {
            total += this.state.materials[key];
        }
        return total;
    },

    // Find item data
    getItemData(itemId) {
        return [...GAME_DATA.weapons, ...GAME_DATA.armors, ...GAME_DATA.accessories, ...GAME_DATA.consumables]
            .find(i => i.id === itemId);
    },

    // Daily quest tracking
    trackQuest(type, amount = 1) {
        if (!this.state.dailyQuestProgress[type]) {
            this.state.dailyQuestProgress[type] = 0;
        }
        this.state.dailyQuestProgress[type] += amount;
    },

    // Rebirth
    rebirthHunter(hunterId) {
        const idx = this.state.hunters.findIndex(h => h.id === hunterId);
        if (idx === -1) return;
        
        const hunter = this.state.hunters[idx];
        const points = Math.floor(hunter.level / 10) + 1;
        
        if (!this.state.rebirthPoints[hunterId]) {
            this.state.rebirthPoints[hunterId] = 0;
        }
        this.state.rebirthPoints[hunterId] += points;
        
        // Reset hunter
        hunter.level = 1;
        hunter.exp = 0;
        const cls = GAME_DATA.classes[hunter.classId];
        hunter.maxHp = cls.baseStats.hp;
        hunter.hp = hunter.maxHp;
        hunter.atk = cls.baseStats.atk;
        hunter.def = cls.baseStats.def;
        hunter.satiety = 100;
        hunter.mood = 100;
        hunter.stamina = 100;
        
        this.notify(`♻️ ${hunter.name} tái sinh! +${points} điểm tiềm năng`);
    }
};
