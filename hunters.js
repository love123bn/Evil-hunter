/* ==========================================================
   HUNTERS.JS - Hệ thống quản lý Hunters
   Tuyển dụng, stats, equip, skills, rebirth
   ========================================================== */

Game.Hunters = {

    /* ===== TẠO HUNTER MỚI ===== */
    createHunter(classId, quality) {
        const cls = GAME_DATA.classes[classId];
        const q = GAME_DATA.qualities.find(q => q.id === quality);
        const qualityMulti = 1 + GAME_DATA.qualities.indexOf(q) * 0.2;
        const rebirthBonus = 0;

        // Random stats variation (+-10%)
        const vary = () => 0.9 + Math.random() * 0.2;

        const hunter = {
            id: 'h_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            name: this.generateName(),
            classId: classId,
            quality: quality,
            level: 1,
            exp: 0,
            alive: true,
            inBattle: false,
            currentZone: null,

            // Base stats
            maxHp: Math.floor(cls.baseStats.hp * qualityMulti * vary()),
            hp: 0,
            atk: Math.floor(cls.baseStats.atk * qualityMulti * vary()),
            def: Math.floor(cls.baseStats.def * qualityMulti * vary()),
            crit: Math.min(50, cls.baseStats.crit + Math.floor(Math.random() * 5)),
            atkSpd: Math.max(0.25, cls.baseStats.atkSpd + (Math.random() * 0.2 - 0.1)),
            evasion: Math.min(40, cls.baseStats.evasion + Math.floor(Math.random() * 5)),

            // Vitals
            satiety: 100,
            mood: 100,
            stamina: 100,

            // Skills
            skills: cls.skills.map((s, i) => ({
                ...s,
                level: i === 0 ? 1 : 0,
                cooldown: 0
            })),

            // Combat stats
            totalDamageDealt: 0,
            totalKills: 0,

            // Pet
            petId: null,

            // Timestamp
            createdAt: Date.now()
        };

        hunter.hp = hunter.maxHp;
        return hunter;
    },

    /* ===== TẠO TÊN NGẪU NHIÊN ===== */
    generateName() {
        const prefixes = ['Hỏa', 'Băng', 'Thổ', 'Phong', 'Lôi', 'Ánh', 'Bóng', 'Thánh', 'Ma', 'Huyết',
            'Thiên', 'Địa', 'Vũ', 'Sơn', 'Hải', 'Cốt', 'Hồn', 'Tâm', 'Linh', 'Đại',
            'Tiểu', 'Trung', 'Cực', 'Siêu', 'Vô', 'Cực', 'Vạn', 'Cổ', 'Tân', 'Mạt'];
        const suffixes = ['Minh', 'Quang', 'Đông', 'Tây', 'Nam', 'Bắc', 'Phong', 'Vân',
            'Sơn', 'Hải', 'Tinh', 'Hỏa', 'Băng', 'Thạch', 'Mộc', 'Kim',
            'Long', 'Hổ', 'Phượng', 'Lân', 'Xà', 'Hạc', 'Cuồng', 'Tĩnh',
            'Diệu', 'Anh', 'Cường', 'Vĩnh', 'Dương', 'Huy'];
        return Game.pickRandom(prefixes) + Game.pickRandom(suffixes);
    },

    /* ===== TÍNH CHẤT LƯỢNG HUNTER ===== */
    calculateQuality(stats) {
        let points = 0;
        const cls = GAME_DATA.classes[stats.classId];
        
        // Kiểm tra từng stat so với base
        ['hp', 'atk', 'def', 'crit'].forEach(stat => {
            const ratio = stats[stat] / cls.baseStats[stat];
            if (ratio > 1.3) points += 2;
            else if (ratio > 1.1) points += 1;
        });

        for (const q of GAME_DATA.qualities) {
            if (points >= q.minPoints) return q.id;
        }
        return 'normal';
    },

    /* ===== TẠO ỨNG VIÊN TUYỂN DỤNG ===== */
    refreshCandidates() {
        if (Game.state.gold < 50) {
            Game.notify('❌ Không đủ vàng! (Cần 50)');
            return;
        }
        Game.state.gold -= 50;
        Game.state.hireCandidates = [];
        for (let i = 0; i < 3; i++) {
            this.spawnCandidate();
        }
        Game.UI.renderHireTab();
        Game.notify('🔄 Đã làm mới danh sách!');
    },

    spawnCandidate() {
        if (Game.state.hireCandidates.length >= 3) return;
        if (Game.state.hunters.length >= Game.getMaxHunters()) return;

        const classIds = Object.keys(GAME_DATA.classes);
        const classId = Game.pickRandom(classIds);
        
        // Random quality distribution
        const rand = Math.random();
        let quality;
        if (rand < 0.06) quality = 'legendary';
        else if (rand < 0.20) quality = 'heroic';
        else if (rand < 0.45) quality = 'superior';
        else if (rand < 0.75) quality = 'rare';
        else quality = 'normal';

        const hunter = this.createHunter(classId, quality);
        Game.state.hireCandidates.push(hunter);
    },

    /* ===== Thuê HUNTER ===== */
    hireHunter(candidateIndex) {
        if (Game.state.hunters.length >= Game.getMaxHunters()) {
            Game.notify('❌ Đã đủ số lượng săn thủ! Nâng cấp thị trấn.');
            return;
        }

        const candidate = Game.state.hireCandidates[candidateIndex];
        if (!candidate) return;

        Game.state.hunters.push(candidate);
        Game.state.hireCandidates.splice(candidateIndex, 1);
        
        Game.addLog('info', `✅ Thuê ${candidate.name} (${GAME_DATA.classes[candidate.classId].name} - ${this.getQualityName(candidate.quality)})`);
        Game.notify(`✅ Đã thuê ${candidate.name}!`);
        Game.UI.renderHireTab();
        Game.UI.renderHunterList();
    },

    /* ===== ĐUỔI HUNTER ===== */
    fireHunter(candidateIndex) {
        const candidate = Game.state.hireCandidates[candidateIndex];
        if (!candidate) return;
        Game.state.hireCandidates.splice(candidateIndex, 1);
        Game.notify(`👋 Đã đuổi ${candidate.name}`);
        Game.UI.renderHireTab();
    },

    /* ===== XÓA HUNTER ===== */
    removeHunter(hunterId) {
        const idx = Game.state.hunters.findIndex(h => h.id === hunterId);
        if (idx === -1) return;
        const h = Game.state.hunters[idx];
        if (!confirm(`Bạn có chắc muốn xóa ${h.name}?`)) return;
        Game.state.hunters.splice(idx, 1);
        delete Game.state.equippedItems[hunterId];
        Game.notify(`🗑️ Đã xóa ${h.name}`);
        Game.UI.renderHunterList();
    },

    /* ===== Tên Chất Lượng ===== */
    getQualityName(qualityId) {
        const q = GAME_DATA.qualities.find(q => q.id === qualityId);
        return q ? q.name : 'Thường';
    },

    /* ===== TÍNH STATS THỰC TẾ ===== */
    getEffectiveStats(hunter) {
        let atk = hunter.atk;
        let def = hunter.def;
        let crit = hunter.crit;
        let evasion = hunter.evasion;
        let maxHp = hunter.maxHp;

        // Equipment bonus
        const eq = Game.state.equippedItems[hunter.id];
        if (eq) {
            ['weapon', 'armor', 'accessory'].forEach(slot => {
                if (eq[slot]) {
                    const itemData = Game.getItemData(eq[slot]);
                    if (itemData) {
                        if (itemData.baseAtk) atk += itemData.baseAtk;
                        if (itemData.baseDef) def += itemData.baseDef;
                        if (itemData.baseCrit) crit += itemData.baseCrit;
                        if (itemData.baseHp) maxHp += itemData.baseHp;
                    }
                }
            });
        }

        // Pet bonus
        if (hunter.petId) {
            const pet = Game.state.pets.find(p => p.id === hunter.petId);
            if (pet) {
                const petData = GAME_DATA.pets.find(p => p.id === pet.dataId);
                if (petData) {
                    const starMulti = 1 + (pet.stars - 1) * 0.2;
                    switch (petData.bonusType) {
                        case 'atk': atk += Math.floor(petData.bonusVal * starMulti); break;
                        case 'def': def += Math.floor(petData.bonusVal * starMulti); break;
                        case 'hp': maxHp += Math.floor(petData.bonusVal * starMulti); break;
                        case 'crit': crit += Math.floor(petData.bonusVal * starMulti); break;
                        case 'evasion': evasion += Math.floor(petData.bonusVal * starMulti); break;
                        case 'all':
                            atk += Math.floor(petData.bonusVal * starMulti);
                            def += Math.floor(petData.bonusVal * starMulti);
                            maxHp += Math.floor(petData.bonusVal * starMulti);
                            crit += Math.floor(petData.bonusVal * starMulti);
                            break;
                    }
                }
            }
        }

        // Cap stats
        crit = Math.min(50, crit);
        evasion = Math.min(40, evasion);

        return { atk, def, crit, evasion, maxHp };
    },

    /* ===== TRANG BỊ ===== */
    equipItem(hunterId, itemId, slot) {
        if (!Game.state.equippedItems[hunterId]) {
            Game.state.equippedItems[hunterId] = {};
        }
        
        // Bỏ item cũ (nếu có)
        const oldItemId = Game.state.equippedItems[hunterId][slot];
        if (oldItemId) {
            Game.addItem(oldItemId, 1);
        }
        
        // Mặc item mới
        Game.removeItem(itemId, 1);
        Game.state.equippedItems[hunterId][slot] = itemId;
        
        const itemData = Game.getItemData(itemId);
        Game.notify(`✅ Đã trang bị ${itemData.name}`);
    },

    unequipItem(hunterId, slot) {
        const eq = Game.state.equippedItems[hunterId];
        if (!eq || !eq[slot]) return;
        
        Game.addItem(eq[slot], 1);
        delete eq[slot];
        Game.notify('🗑️ Đã tháo trang bị');
    },

    /* ===== KỸ NĂNG ===== */
    upgradeSkill(hunterId, skillIndex) {
        const hunter = Game.state.hunters.find(h => h.id === hunterId);
        if (!hunter) return;
        
        const skill = hunter.skills[skillIndex];
        if (!skill || skill.level >= 10) return;
        
        const cost = skill.level * 30;
        if (Game.state.gold < cost) {
            Game.notify(`❌ Cần ${cost} vàng`);
            return;
        }
        
        Game.state.gold -= cost;
        skill.level++;
        Game.notify(`⬆️ ${skill.name} lên cấp ${skill.level}!`);
    },

    /* ===== ĐẶT ZONE CHO HUNTER ===== */
    assignZone(hunterId, zoneId) {
        const hunter = Game.state.hunters.find(h => h.id === hunterId);
        if (!hunter || !hunter.alive) return;
        
        if (!Game.state.unlockedZones.includes(zoneId)) {
            Game.notify('❌ Khu vực chưa mở khóa!');
            return;
        }
        
        const zone = GAME_DATA.zones.find(z => z.id === zoneId);
        if (hunter.level < zone.levelReq) {
            Game.notify(`❌ Cần level ${zone.levelReq}!`);
            return;
        }
        
        hunter.currentZone = zoneId;
        hunter.inBattle = false;
        Game.addLog('info', `🗺️ ${hunter.name} đến ${zone.name}`);
        Game.notify(`🗺️ ${hunter.name} → ${zone.name}`);
    },

    /* ===== HỦY SĂN ===== */
    recallHunter(hunterId) {
        const hunter = Game.state.hunters.find(h => h.id === hunterId);
        if (!hunter) return;
        hunter.currentZone = null;
        hunter.inBattle = false;
        Game.notify(`🏠 ${hunter.name} trở về thị trấn`);
    },

    /* ===== HỒI SINH ===== */
    reviveHunter(hunterId) {
        const hunter = Game.state.hunters.find(h => h.id === hunterId);
        if (!hunter || hunter.alive) return;
        
        const sanctuaryLevel = Game.state.buildings.sanctuary || 1;
        const reviveTime = 5000 / sanctuaryLevel;
        const cost = hunter.level * 5;
        
        if (Game.state.gold < cost) {
            Game.notify(`❌ Cần ${cost} vàng để hồi sinh`);
            return;
        }
        
        Game.state.gold -= cost;
        setTimeout(() => {
            hunter.alive = true;
            hunter.hp = Math.floor(hunter.maxHp * 0.3);
            hunter.satiety = 50;
            hunter.mood = 50;
            hunter.stamina = 50;
            Game.addLog('info', `✨ ${hunter.name} đã hồi sinh!`);
            Game.notify(`✨ ${hunter.name} hồi sinh!`);
        }, reviveTime);
        
        Game.notify(`⏳ Đang hồi sinh ${hunter.name}...`);
    },

    /* ===== SỬ DỤNG TIÊU HАО ===== */
    useConsumable(hunterId, itemId) {
        const hunter = Game.state.hunters.find(h => h.id === hunterId);
        if (!hunter || !hunter.alive) return;
        
        if (!Game.removeItem(itemId, 1)) {
            Game.notify('❌ Không đủ vật phẩm!');
            return;
        }
        
        const itemData = Game.getItemData(itemId);
        if (itemData.healPct) {
            hunter.hp = Math.min(hunter.maxHp, hunter.hp + Math.floor(hunter.maxHp * itemData.healPct));
            Game.notify(`💚 ${hunter.name} hồi ${itemData.healPct * 100}% HP`);
        }
        if (itemData.satRestore) {
            hunter.satiety = Math.min(100, hunter.satiety + itemData.satRestore * 100);
            Game.notify(`🍖 ${hunter.name} hồi no`);
        }
    }
};
