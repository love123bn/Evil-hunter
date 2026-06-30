// ========== CORE GAME STATE & LOGIC ==========

let game = null;

class Game {
    constructor() {
        this.gold = 200;
        this.gems = 10;
        this.difficulty = 'easy';
        this.townLevel = 1;
        this.maxPopulation = 5;
        this.hunters = [];
        this.buildings = {};
        this.inventory = [];
        this.materials = {};
        this.quests = JSON.parse(JSON.stringify(QUESTS));
        this.achievements = JSON.parse(JSON.stringify(ACHIEVEMENTS));
        this.completedQuests = [];
        this.completedAchievements = [];
        this.bounties = [];
        this.bountyProgress = 0;
        this.totalKills = 0;
        this.totalCrafts = 0;
        this.totalDungeons = 0;
        this.totalBossKills = 0;
        this.totalTrades = 0;
        this.dungeonFloor = 1;
        this.dungeonProgress = 0;
        this.dungeonParty = [];
        this.dungeonActive = false;
        this.bossActive = false;
        this.bossHp = 0;
        this.bossMaxHp = 0;
        this.bossDamage = 0;
        this.hunterQueue = [];
        this.hunterArrivalTimer = 0;
        this.gameTime = 0;
        this.lastTick = Date.now();
        this.newHunterAvailable = false;
        this.logs = [];
        this.questHunterLevelCheck = {};
        this.firstHunterHired = false;
        this.lastDailyDate = '';
        this.dailyStreak = 0;
        this.townName = '';
        this.gameStarted = false;
        this.initBuildings();
        this.initMaterials();
    }

    initBuildings() {
        for (let key in BUILDINGS) {
            this.buildings[key] = { level: 0, unlocked: key === 'townHall' };
        }
        this.buildings.townHall.level = 1;
        // Tòa thị chính level 1 mở commonHouse và infirmary
        this.applyBuildingUnlocks(1);
    }

    initMaterials() {
        for (let key in MATERIALS) {
            this.materials[key] = 0;
        }
        this.materials.gỗ = 15;
        this.materials.đá = 10;
        this.materials.da = 5;
    }

    applyBuildingUnlocks(townLevel) {
        const lvData = BUILDINGS.townHall.levels[townLevel - 1];
        if (lvData && lvData.unlock) {
            for (let id of lvData.unlock) {
                if (this.buildings[id]) this.buildings[id].unlocked = true;
            }
        }
    }

    getUnlockedBuildings() {
        let list = [];
        for (let key in this.buildings) {
            if (this.buildings[key].unlocked) list.push(key);
        }
        return list;
    }

    canBuild(buildingId) {
        const b = BUILDINGS[buildingId];
        const state = this.buildings[buildingId];
        if (!b || !state || !state.unlocked) return false;
        if (state.level >= b.maxLv) return false;
        const cost = b.levels[state.level];
        if (!cost) return false;
        if (this.gold < (cost.gold || 0)) return false;
        if ((cost.gems || 0) > 0 && this.gems < cost.gems) return false;
        return true;
    }

    buildBuilding(buildingId) {
        const b = BUILDINGS[buildingId];
        const state = this.buildings[buildingId];
        if (!this.canBuild(buildingId)) return false;
        const cost = b.levels[state.level];
        this.gold -= (cost.gold || 0);
        this.gems -= (cost.gems || 0);
        state.level++;
        
        // Áp dụng hiệu ứng
        if (cost.population) this.maxPopulation += 2;
        if (buildingId === 'townHall') this.applyBuildingUnlocks(state.level);
        
        this.checkQuests();
        return true;
    }

    // === THỢ SĂN ===
    generateHunter() {
        const classKeys = Object.keys(HUNTER_CLASSES);
        const clsKey = classKeys[Math.floor(Math.random() * classKeys.length)];
        const cls = HUNTER_CLASSES[clsKey];
        const name = HUNTER_NAMES[Math.floor(Math.random() * HUNTER_NAMES.length)];
        
        // Roll chỉ số: 58% thường, 33% cao, 6% cao nhất, 3% tím
        const statKeys = ['atk', 'def', 'crit', 'atkSpd', 'evasion', 'hp'];
        const rolls = {};
        let totalPoints = 0;
        
        for (let key of statKeys) {
            const r = Math.random();
            if (r < 0.03) {
                rolls[key] = 3; // Tím (Ultimate)
                totalPoints += 3;
            } else if (r < 0.09) {
                rolls[key] = 2; // Cao nhất
                totalPoints += 2;
            } else if (r < 0.42) {
                rolls[key] = 1; // Cao
                totalPoints += 1;
            } else {
                rolls[key] = 0; // Thường
            }
        }
        
        // Xác định tier
        let tier = HUNTER_TIERS[0];
        for (let t of HUNTER_TIERS) {
            if (totalPoints >= t.minPoints && totalPoints <= t.maxPoints) {
                tier = t;
                break;
            }
        }
        
        const baseStats = {
            hp: Math.floor(cls.baseStats.hp * (1 + rolls.hp * 0.15)),
            atk: Math.floor(cls.baseStats.atk * (1 + rolls.atk * 0.2)),
            def: Math.floor(cls.baseStats.def * (1 + rolls.def * 0.2)),
            crit: Math.floor(cls.baseStats.crit * (1 + rolls.crit * 0.2)),
            atkSpd: parseFloat((cls.baseStats.atkSpd * (1 - rolls.atkSpd * 0.05)).toFixed(2)),
            evasion: Math.floor(cls.baseStats.evasion * (1 + rolls.evasion * 0.2))
        };
        
        // Bonus tier
        const bonus = tier.statBonus;
        
        const hunter = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: name,
            class: clsKey,
            className: cls.name,
            tier: tier.id,
            tierName: tier.name,
            level: 1,
            exp: 0,
            maxHp: Math.floor(baseStats.hp * (1 + bonus / 100)),
            hp: Math.floor(baseStats.hp * (1 + bonus / 100)),
            maxSatiety: 100,
            satiety: 100,
            maxMood: 100,
            mood: 100,
            maxStamina: 100,
            stamina: 100,
            atk: Math.floor(baseStats.atk * (1 + bonus / 100)),
            def: Math.floor(baseStats.def * (1 + bonus / 100)),
            crit: Math.min(50, Math.floor(baseStats.crit * (1 + bonus / 100))),
            atkSpd: Math.max(0.25, parseFloat((baseStats.atkSpd * (1 - bonus / 200)).toFixed(2))),
            evasion: Math.min(40, Math.floor(baseStats.evasion * (1 + bonus / 100))),
            reincarnations: 0,
            gold: 1000,
            materials: {},
            currentMonster: null,
            currentMonsterHp: 0,
            equipment: { 'vũ khí': null, 'áo giáp': null, 'nón': null, 'găng': null, 'giày': null, 'dây chuyền': null, 'nhẫn': null, 'thắt lưng': null },
            status: 'idle',
            skills: [],
            traits: [],
            statPoints: 0,
            kills: 0,
            bountyWorking: false,
            training: false,
            trainingProgress: 0,
            shadowSouls: 0,
            traitPoints: 0,
            learnedTraits: []
        };
        
        return hunter;
    }

    getTierColor(tierId) {
        const colors = { normal: '#aaa', rare: '#4fc3f7', superior: '#ab47bc', heroic: '#ff9800', legendary: '#f44336', ultimate: '#ffd700' };
        return colors[tierId] || '#fff';
    }

    canAddHunter() {
        return this.hunters.length < this.maxPopulation;
    }

    getHireCost(tierId) {
        const costs = { normal: 100, rare: 500, superior: 2000, heroic: 5000, legendary: 10000, ultimate: 20000 };
        return costs[tierId] || 100;
    }

    addHunter(hunter, free) {
        if (!this.canAddHunter()) return false;
        if (!free) {
            const cost = this.getHireCost(hunter.tier);
            if (this.gold < cost) return false;
            this.gold -= cost;
        }
        this.hunters.push(hunter);
        this.newHunterAvailable = false;
        this.checkQuests();
        this.autoEquipHunter(hunter);
        return true;
    }

    removeHunter(hunterId) {
        const idx = this.hunters.findIndex(h => h.id === hunterId);
        if (idx === -1) return false;
        // Trả lại trang bị vào kho
        const h = this.hunters[idx];
        for (let slot in h.equipment) {
            if (h.equipment[slot]) {
                this.inventory.push(h.equipment[slot]);
                h.equipment[slot] = null;
            }
        }
        // Nhận lại vàng theo cấp độ và hạng
        const tierCost = this.getHireCost(h.tier);
        const refund = Math.floor(tierCost * 0.5) + h.level * 5;
        this.gold += refund;
        this.addLog(`Trục xuất ${h.name} (${h.tierName}), nhận lại ${refund} vàng`);
        this.hunters.splice(idx, 1);
        return true;
    }

    levelUpHunter(hunter) {
        if (hunter.level >= 100) return false;
        hunter.level++;
        hunter.statPoints += 3;
        // Tăng nhẹ chỉ số
        hunter.maxHp += 5;
        hunter.hp = Math.min(hunter.hp + 5, hunter.maxHp);
        hunter.atk += 1;
        hunter.def += 0.5;
        if (hunter.level === 100) {
            this.addLog(`${hunter.name} đã đạt cấp tối đa! Có thể chuyển sinh!`);
        }
        return true;
    }

    addExp(hunter, amount) {
        if (hunter.level >= 100) {
            if (hunter.reincarnations >= 5) {
                hunter.shadowSouls += amount;
            }
            return;
        }
        hunter.exp += amount;
        const needed = this.expForLevel(hunter.level);
        while (hunter.exp >= needed && hunter.level < 100) {
            hunter.exp -= needed;
            this.levelUpHunter(hunter);
            this.checkQuests();
        }
    }

    expForLevel(level) {
        return Math.floor(100 * Math.pow(1.1, level - 1));
    }

    canReincarnate(hunter) {
        return hunter.level >= 100 && hunter.reincarnations < 5;
    }

    rankUpHunter(hunter) {
        const tierOrder = ['normal', 'rare', 'superior', 'heroic', 'legendary', 'ultimate'];
        const idx = tierOrder.indexOf(hunter.tier);
        if (idx >= 0 && idx < tierOrder.length - 1) {
            const newTierId = tierOrder[idx + 1];
            const newTier = HUNTER_TIERS.find(t => t.id === newTierId);
            if (newTier) {
                hunter.tier = newTier.id;
                hunter.tierName = newTier.name;
                this.addLog(`${hunter.name} đã thăng hạng lên ${newTier.name}!`);
            }
        }
    }

    reincarnateHunter(hunter) {
        if (!this.canReincarnate(hunter)) return false;
        hunter.reincarnations++;
        hunter.traitPoints++;
        this.rankUpHunter(hunter);
        hunter.level = 1;
        hunter.exp = 0;
        // Tăng chỉ số sau chuyển sinh
        const mult = 1 + hunter.reincarnations * 0.1;
        hunter.maxHp = Math.floor(hunter.maxHp * mult);
        hunter.hp = hunter.maxHp;
        hunter.atk = Math.floor(hunter.atk * mult);
        hunter.def = Math.floor(hunter.def * mult);
        hunter.crit = Math.min(50, Math.floor(hunter.crit * mult));
        hunter.evasion = Math.min(40, Math.floor(hunter.evasion * mult));
        if (hunter.reincarnations >= 5) {
            this.addLog(`${hunter.name} đã chuyển sinh 5 lần! Bắt đầu thu thập Hồn Bóng Tối!`);
        } else {
            this.addLog(`${hunter.name} đã chuyển sinh lần ${hunter.reincarnations}!`);
        }
        this.checkQuests();
        return true;
    }

    // === ĐIỂM DANH HẰNG NGÀY ===
    checkDailyReward() {
        const today = new Date().toISOString().split('T')[0];
        if (this.lastDailyDate !== today) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            this.dailyStreak = this.lastDailyDate === yesterday ? this.dailyStreak + 1 : 1;
            if (this.dailyStreak > 7) this.dailyStreak = 1;
            const rewards = [0, 5, 10, 15, 20, 25, 30, 50];
            const gems = rewards[this.dailyStreak] || 5;
            this.gems += gems;
            this.lastDailyDate = today;
            this.addLog(`Điểm danh ngày ${this.dailyStreak}: Nhận ${gems} ngọc!`);
        }
    }

    // === ĐẶC TÍNH ===
    learnTrait(hunterId, traitId) {
        const h = this.hunters.find(hu => hu.id === hunterId);
        if (!h) return false;
        if (!this.buildings.academy || this.buildings.academy.level === 0) return false;
        if (h.traitPoints <= 0) return false;
        if (h.learnedTraits.includes(traitId)) return false;
        const trait = TRAITS.find(t => t.id === traitId);
        if (!trait) return false;
        if (this.gold < 1000) return false;
        this.gold -= 1000;
        h.traitPoints--;
        h.learnedTraits.push(traitId);
        this.addLog(`${h.name} đã học đặc tính: ${trait.name}!`);
        return true;
    }

    resetTraits(hunterId) {
        const h = this.hunters.find(hu => hu.id === hunterId);
        if (!h) return false;
        if (this.gems < 50) return false;
        this.gems -= 50;
        // Trả lại điểm đặc tính
        h.traitPoints += h.learnedTraits.length;
        h.learnedTraits = [];
        this.addLog(`${h.name} đã reset đặc tính!`);
        return true;
    }

    getTraitEffects(hunter) {
        const effects = { hp: 0, atk: 0, def: 0, crit: 0, evasion: 0, lifeSteal: 0, goldBonus: 0, expBonus: 0, dmgReduction: 0, berserk: 0 };
        for (const tid of hunter.learnedTraits) {
            const t = TRAITS.find(tr => tr.id === tid);
            if (t) {
                if (t.type === 'special') {
                    effects[t.stat] += t.mult;
                } else {
                    effects[t.stat] += t.mult;
                }
            }
        }
        return effects;
    }

    // === TRANG BỊ ===
    craftEquipment(recipeId) {
        // Tìm recipe
        for (let diffKey in EQUIPMENT_CRAFTS) {
            const recipes = EQUIPMENT_CRAFTS[diffKey];
            const recipe = recipes.find(r => r.id === recipeId);
            if (recipe) {
                // Kiểm tra nguyên liệu
                for (let matKey in recipe.materials) {
                    if ((this.materials[matKey] || 0) < recipe.materials[matKey]) return false;
                }
                if (this.gold < recipe.gold) return false;
                
                // Trừ nguyên liệu
                for (let matKey in recipe.materials) {
                    this.materials[matKey] -= recipe.materials[matKey];
                }
                this.gold -= recipe.gold;
                
                // Tạo item với chất lượng ngẫu nhiên
                const item = JSON.parse(JSON.stringify(recipe));
                item.id = recipe.id + '_' + Date.now();
                // Random quality: 40% Poor, 30% Common, 20% Uncommon, 8% Advanced, 2% Ultimate
                const r = Math.random();
                item.quality = r < 0.40 ? 0 : r < 0.70 ? 1 : r < 0.90 ? 2 : r < 0.98 ? 3 : 4;
                item.enhance = 0;
                this.inventory.push(item);
                this.totalCrafts++;
                this.addLog(`Chế tạo: ${recipe.name} (${EQUIPMENT_QUALITY[item.quality].name})`);
                this.checkQuests();
                this.autoEquipAll();
                return true;
            }
        }
        return false;
    }

    getEnhanceSuccessRate(currentEnhance) {
        return Math.max(5, 100 - currentEnhance * 8);
    }

    getEnhanceStoneCost(currentEnhance, tier) {
        const tierMult = { C: 1, B: 2, A: 4, S: 8, SS: 15 };
        return (currentEnhance + 1) * (tierMult[tier] || 1);
    }

    canEnhanceItem(hunterId, slot) {
        const h = this.hunters.find(hu => hu.id === hunterId);
        if (!h || !h.equipment[slot]) return false;
        if (!this.buildings.enhanceForge || this.buildings.enhanceForge.level === 0) return false;
        const eq = h.equipment[slot];
        const maxEnhance = ENHANCE_MAX[eq.tier] || 5;
        if (eq.enhance >= maxEnhance) return false;
        const stones = this.getItemEnhanceStones(eq);
        if ((this.materials['đá cường hóa'] || 0) < stones) return false;
        if (this.gold < this.getEnhanceGoldCost(eq)) return false;
        return true;
    }

    getItemEnhanceStones(eq) {
        const baseCost = { C: 1, B: 2, A: 4, S: 8, SS: 15 };
        return (eq.enhance + 1) * (baseCost[eq.tier] || 1);
    }

    getEnhanceGoldCost(eq) {
        return 100 + (eq.enhance + 1) * 50;
    }

    enhanceItem(hunterId, slot) {
        const h = this.hunters.find(hu => hu.id === hunterId);
        if (!h || !h.equipment[slot]) return false;
        if (!this.buildings.enhanceForge || this.buildings.enhanceForge.level === 0) return false;
        const eq = h.equipment[slot];
        const maxEnhance = ENHANCE_MAX[eq.tier] || 5;
        if (eq.enhance >= maxEnhance) return false;
        
        const stones = this.getItemEnhanceStones(eq);
        const gold = this.getEnhanceGoldCost(eq);
        if ((this.materials['đá cường hóa'] || 0) < stones) return false;
        if (this.gold < gold) return false;
        
        this.materials['đá cường hóa'] -= stones;
        this.gold -= gold;
        
        // Tính tỷ lệ thành công
        const baseRate = this.getEnhanceSuccessRate(eq.enhance);
        const forgeLv = this.buildings.enhanceForge.level;
        const forgeBonus = forgeLv > 0 ? BUILDINGS.enhanceForge.levels[forgeLv - 1].enhanceBonus || 0 : 0;
        const rate = Math.min(100, baseRate + forgeBonus);
        
        // Có thể dùng đá sáng để tăng thêm 10%
        const useLight = this.materials['đá sáng'] > 0 && Math.random() < 0.5;
        const finalRate = rate + (useLight ? 10 : 0);
        if (useLight) this.materials['đá sáng'] = (this.materials['đá sáng'] || 0) - 1;
        
        if (Math.random() < finalRate / 100) {
            eq.enhance++;
            this.addLog(`Cường hóa thành công! ${eq.name} +${eq.enhance}`);
        } else {
            this.addLog(`Cường hóa thất bại! ${eq.name} +${eq.enhance}`);
            // Từ +10 trở lên thất bại giảm cấp
            if (eq.enhance >= 10) {
                eq.enhance = Math.max(0, eq.enhance - 1);
                this.addLog(`Trang bị giảm xuống +${eq.enhance}!`);
            }
        }
        return true;
    }

    upgradeItemQuality(itemId) {
        const idx = this.inventory.findIndex(i => i.id === itemId);
        if (idx === -1) return false;
        const item = this.inventory[idx];
        if (item.quality >= 4) return false; // Đã tối thượng
        
        const cost = QUALITY_UPGRADE_COST[item.quality + 1] || 999999;
        const stones = QUALITY_UPGRADE_STONES[item.quality + 1] || 999;
        if (this.gold < cost) return false;
        if ((this.materials['đá nâng cấp'] || 0) < stones) return false;
        
        this.gold -= cost;
        this.materials['đá nâng cấp'] -= stones;
        item.quality++;
        this.addLog(`Nâng cấp chất lượng thành công! ${item.name} → ${EQUIPMENT_QUALITY[item.quality].name}`);
        return true;
    }

    equipItem(hunterId, itemId) {
        const hunter = this.hunters.find(h => h.id === hunterId);
        if (!hunter) return false;
        const idx = this.inventory.findIndex(i => i.id === itemId);
        if (idx === -1) return false;
        const item = this.inventory[idx];
        
        // Kiểm tra class
        if (item.class && !item.class.includes(hunter.class)) return false;
        
        // Bỏ trang bị cũ vào kho
        const slot = item.slot;
        if (hunter.equipment[slot]) {
            this.inventory.push(hunter.equipment[slot]);
        }
        
        // Trang bị mới
        hunter.equipment[slot] = item;
        this.inventory.splice(idx, 1);
        this.addLog(`${hunter.name} đã trang bị ${item.name}`);
        this.checkQuests();
        return true;
    }

    unequipItem(hunterId, slot) {
        const hunter = this.hunters.find(h => h.id === hunterId);
        if (!hunter || !hunter.equipment[slot]) return false;
        this.inventory.push(hunter.equipment[slot]);
        hunter.equipment[slot] = null;
        return true;
    }

    getItemMainStat(item) {
        if (!item || !item.stats) return 0;
        if (item.slot === 'vũ khí' || item.slot === 'găng') return item.stats.atk || 0;
        if (item.slot === 'áo giáp' || item.slot === 'nón' || item.slot === 'thắt lưng') return item.stats.def || 0;
        if (item.slot === 'dây chuyền' || item.slot === 'nhẫn') return item.stats.hp || 0;
        if (item.slot === 'giày') return item.stats.evasion || 0;
        return 0;
    }

    getItemScore(item) {
        const tierVal = EQUIPMENT_TIERS[item.tier] || 1;
        const qMult = EQUIPMENT_QUALITY[item.quality] ? EQUIPMENT_QUALITY[item.quality].statMult : 1;
        let totalStats = 0;
        for (let k in item.stats) totalStats += item.stats[k];
        return Math.floor(tierVal * 100000 + qMult * 10000 + (item.enhance || 0) * 1000 + totalStats);
    }

    autoEquipHunter(hunter) {
        if (!hunter || hunter.status === 'dead') return;
        for (let slot in hunter.equipment) {
            const candidates = this.inventory.filter(item =>
                item.slot === slot &&
                (!item.class || item.class.includes(hunter.class))
            );
            if (candidates.length === 0) continue;
            const best = candidates.reduce((a, b) => this.getItemScore(a) > this.getItemScore(b) ? a : b);
            const current = hunter.equipment[slot];
            if (!current || this.getItemScore(best) > this.getItemScore(current)) {
                // Trang bị món tốt nhất
                if (current) this.inventory.push(current);
                this.inventory.splice(this.inventory.indexOf(best), 1);
                hunter.equipment[slot] = best;
            }
        }
    }

    autoEquipAll() {
        for (const h of this.hunters) {
            if (h.status !== 'dead') this.autoEquipHunter(h);
        }
    }

    // === KINH TẾ HERO ===
    craftConsumable(recipeId) {
        for (let cat in CONSUMABLES) {
            const recipe = CONSUMABLES[cat].find(r => r.id === recipeId);
            if (!recipe) continue;
            for (let mat in recipe.materials) {
                if ((this.materials[mat] || 0) < recipe.materials[mat]) return false;
            }
            if (this.gold < recipe.gold) return false;
            for (let mat in recipe.materials) this.materials[mat] -= recipe.materials[mat];
            this.gold -= recipe.gold;
            const item = { ...recipe };
            delete item.materials;
            this.inventory.push(item);
            this.addLog(`Sản xuất: ${recipe.name}`);
            return true;
        }
        return false;
    }

    getConsumableValue(item) {
        if (!item || !item.restore) return 0;
        return item.value || 0;
    }

    heroAutoSell(hunter) {
        if (!hunter || hunter.status === 'dead') return;
        if (!this.buildings.tradingPost || this.buildings.tradingPost.level === 0) return;
        const mats = Object.keys(hunter.materials);
        if (mats.length === 0) return;
        const matKey = mats[0];
        const qty = hunter.materials[matKey];
        if (qty <= 0) return;
        const price = MATERIALS[matKey] ? Math.floor(MATERIALS[matKey].basePrice * 0.5) : 1;
        const maxSell = Math.min(qty, 5);
        const total = price * maxSell;
        if (this.gold < total) return;
        hunter.materials[matKey] -= maxSell;
        if (hunter.materials[matKey] <= 0) delete hunter.materials[matKey];
        this.materials[matKey] = (this.materials[matKey] || 0) + maxSell;
        hunter.gold += total;
        this.gold -= total;
        this.addLog(`${hunter.name} bán ${maxSell} ${MATERIALS[matKey].name} cho thị trấn (${total}v)`);
    }

    heroAutoBuy(hunter) {
        if (!hunter || hunter.status === 'dead') return;
        const needs = [];
        if (hunter.hp < hunter.maxHp * 0.4) needs.push('hp');
        if (hunter.satiety < 30) needs.push('satiety');
        if (hunter.mood < 30) needs.push('mood');
        if (hunter.stamina < 30) needs.push('stamina');
        if (needs.length === 0) return;
        
        const need = needs[Math.floor(Math.random() * needs.length)];
        const restoreKey = need;
        
        for (let item of this.inventory) {
            if (item.restore === restoreKey) {
                const price = Math.floor((item.gold || 50) * 1.5);
                if (hunter.gold < price) continue;
                hunter.gold -= price;
                this.gold += price;
                if (restoreKey === 'hp') {
                    hunter.hp = Math.min(hunter.maxHp, hunter.hp + item.value);
                } else if (restoreKey === 'satiety') {
                    hunter.satiety = Math.min(hunter.maxSatiety, hunter.satiety + item.value);
                } else if (restoreKey === 'mood') {
                    hunter.mood = Math.min(hunter.maxMood, hunter.mood + item.value);
                } else if (restoreKey === 'stamina') {
                    hunter.stamina = Math.min(hunter.maxStamina, hunter.stamina + item.value);
                }
                const idx = this.inventory.indexOf(item);
                if (idx !== -1) this.inventory.splice(idx, 1);
                this.addLog(`${hunter.name} mua ${item.name} (${price}v)`);
                return;
            }
        }
    }

    getItemEnhancedStat(item) {
        if (!item || !item.stats) return 0;
        const baseStat = this.getItemMainStat(item);
        if (baseStat === 0) return 0;
        // Mỗi cấp cường hóa +20% chỉ số chính
        return Math.floor(baseStat * item.enhance * 0.2);
    }

    getHunterStats(hunter) {
        let atk = hunter.atk;
        let def = hunter.def;
        let crit = hunter.crit;
        let evasion = hunter.evasion;
        let atkSpd = hunter.atkSpd;
        let maxHp = hunter.maxHp;
        
        // Cộng từ trang bị
        for (let slot in hunter.equipment) {
            const eq = hunter.equipment[slot];
            if (eq) {
                const q = EQUIPMENT_QUALITY[eq.quality] || EQUIPMENT_QUALITY[0];
                if (eq.stats) {
                    atk += Math.floor((eq.stats.atk || 0) * q.statMult) + (slot === 'vũ khí' || slot === 'găng' ? this.getItemEnhancedStat(eq) : 0);
                    def += Math.floor((eq.stats.def || 0) * q.statMult) + (slot === 'áo giáp' || slot === 'nón' || slot === 'thắt lưng' ? this.getItemEnhancedStat(eq) : 0);
                    crit += eq.stats.crit || 0;
                    evasion += Math.floor((eq.stats.evasion || 0) * q.statMult) + (slot === 'giày' ? this.getItemEnhancedStat(eq) : 0);
                    maxHp += Math.floor((eq.stats.hp || 0) * q.statMult) + (slot === 'dây chuyền' || slot === 'nhẫn' ? this.getItemEnhancedStat(eq) : 0);
                    if (eq.stats.atkSpd) atkSpd = Math.max(0.25, atkSpd - eq.stats.atkSpd * 0.05);
                }
            }
        }
        
        // Ảnh hưởng đặc tính
        const te = this.getTraitEffects(hunter);
        atk = Math.floor(atk * (1 + te.atk));
        def = Math.floor(def * (1 + te.def));
        crit = Math.min(50, crit + te.crit * 100);
        evasion = Math.min(40, evasion + te.evasion * 100);
        maxHp = Math.floor(maxHp * (1 + te.hp));
        
        // Đặc tính Cuồng Bạo: HP càng thấp ATK càng cao
        if (te.berserk > 0 && hunter.hp > 0) {
            const hpPct = hunter.hp / hunter.maxHp;
            const bonus = te.berserk * (1 - hpPct);
            atk = Math.floor(atk * (1 + bonus));
        }
        
        // Ảnh hưởng tâm trạng (mood thấp = giảm stats)
        const moodMult = 0.5 + (hunter.mood / hunter.maxMood) * 0.5;
        atk = Math.floor(atk * moodMult);
        def = Math.floor(def * moodMult);
        
        return { atk, def, crit: Math.min(50, crit), evasion: Math.min(40, evasion), atkSpd, maxHp, lifeSteal: te.lifeSteal, goldBonus: te.goldBonus, expBonus: te.expBonus, dmgReduction: te.dmgReduction };
    }

    // === SĂN BẮN ===
    getHuntableMonsters() {
        return MONSTERS[this.difficulty] || MONSTERS.easy;
    }

    calculateDamage(atk, def, crit, evasion, monster) {
        const pwr = this.getPowerLevel();
        const scaledDef = Math.floor(monster.def * pwr);
        const scaledAtk = Math.floor(monster.atk * pwr);
        let baseDmg = Math.max(1, atk - scaledDef);
        if (Math.random() < crit / 100) baseDmg = Math.floor(baseDmg * 1.5);
        const monsterDmg = Math.max(1, scaledAtk - def);
        const dodged = Math.random() < evasion / 100;
        return { playerDmg: baseDmg, monsterDmg: dodged ? 0 : monsterDmg, dodged, critted: baseDmg > Math.max(1, atk - scaledDef) };
    }

    hunterHunt(hunter) {
        if (hunter.status !== 'idle' && hunter.status !== 'hunting') return;
        if (hunter.hp <= 0 || hunter.satiety <= 0 || hunter.stamina <= 0 || hunter.mood <= 0) {
            hunter.status = 'idle';
            return;
        }
        
        const pwr = this.getPowerLevel();
        
        // Chọn quái hoặc tiếp tục chiến đấu với quái hiện tại
        if (!hunter.currentMonster || hunter.currentMonsterHp <= 0) {
            const monsters = this.getHuntableMonsters();
            hunter.currentMonster = monsters[Math.floor(Math.random() * monsters.length)];
            hunter.currentMonsterHp = Math.floor(hunter.currentMonster.hp * pwr);
        }
        const monster = hunter.currentMonster;
        
        const stats = this.getHunterStats(hunter);
        
        // Tốc độ tấn công quyết định số lần tấn công mỗi tick
        const attacksPerTick = Math.max(1, Math.floor(1 / stats.atkSpd));
        
        for (let i = 0; i < attacksPerTick; i++) {
            const dmgReduction = stats.dmgReduction || 0;
            const result = this.calculateDamage(stats.atk, stats.def, stats.crit, stats.evasion, monster);
            hunter.currentMonsterHp -= result.playerDmg;
            
            if (!result.dodged) {
                const reducedDmg = Math.floor(result.monsterDmg * (1 - dmgReduction));
                hunter.hp -= reducedDmg;
                // Hút máu
                if (stats.lifeSteal > 0) {
                    const heal = Math.floor(result.playerDmg * stats.lifeSteal);
                    hunter.hp = Math.min(hunter.maxHp, hunter.hp + heal);
                }
                hunter.mood = Math.max(0, hunter.mood - MOOD_DRAIN_RATE);
            }
            
            hunter.satiety = Math.max(0, hunter.satiety - SATIETY_DRAIN_RATE);
            
            if (hunter.currentMonsterHp <= 0) {
                // Tiêu diệt quái
                const goldBonus = stats.goldBonus || 0;
                const expBonus = stats.expBonus || 0;
                const earnedGold = Math.floor(monster.gold * (1 + goldBonus) * pwr);
                hunter.gold += earnedGold;
                this.totalKills++;
                hunter.kills++;
                this.addExp(hunter, Math.floor(monster.exp * (1 + expBonus) * pwr));
                
                // Rơi vật liệu vào túi hero (scale theo sức mạnh)
                if (monster.drops) {
                    for (let matKey in monster.drops) {
                        const bonus = Math.random() < (pwr - 1) ? 1 : 0;
                        const qty = monster.drops[matKey] + bonus;
                        hunter.materials[matKey] = (hunter.materials[matKey] || 0) + qty;
                    }
                }
                
                this.checkBountyProgress(monster.name);
                this.addLog(`${hunter.name} đã tiêu diệt ${monster.name}!`);
                this.checkQuests();
                return;
            }
            
            if (hunter.hp <= 0) {
                hunter.hp = 0;
                hunter.status = 'dead';
                hunter.currentMonster = null;
                hunter.currentMonsterHp = 0;
                this.addLog(`${hunter.name} đã chết! Cần hồi sinh tại Thánh Địa!`);
                return;
            }
        }
        
        hunter.status = 'hunting';
    }

    damageMonster(monster, dmg) {
        monster.hp -= dmg;
    }

    // === THỂ LỰC ===
    drainStamina() {
        for (let hunter of this.hunters) {
            if (hunter.status === 'hunting' || hunter.status === 'dungeon') {
                hunter.stamina = Math.max(0, hunter.stamina - STAMINA_DRAIN_RATE);
                if (hunter.stamina <= 0) {
                    hunter.status = 'idle';
                    hunter.currentMonster = null;
                    hunter.currentMonsterHp = 0;
                    this.addLog(`${hunter.name} đã kiệt sức!`);
                }
            }
        }
    }

    recoverResources() {
        const b = this.buildings;
        for (let hunter of this.hunters) {
            if (hunter.status === 'dead') continue;
            if (hunter.hp <= 0) continue;
            
            // Hồi phục cơ bản (dù chưa xây công trình)
            const passive = 3;
            if (hunter.hp < hunter.maxHp) {
                hunter.hp = Math.min(hunter.maxHp, hunter.hp + passive / 3);
            }
            if (hunter.satiety < hunter.maxSatiety) {
                hunter.satiety = Math.min(hunter.maxSatiety, hunter.satiety + passive / 3);
            }
            if (hunter.mood < hunter.maxMood) {
                hunter.mood = Math.min(hunter.maxMood, hunter.mood + passive / 3);
            }
            if (hunter.stamina < hunter.maxStamina) {
                hunter.stamina = Math.min(hunter.maxStamina, hunter.stamina + passive / 3);
            }
            
            // Hồi phục tăng cường từ công trình
            const infirmaryLv = b.infirmary ? b.infirmary.level : 0;
            const restaurantLv = b.restaurant ? b.restaurant.level : 0;
            const tavernLv = b.tavern ? b.tavern.level : 0;
            const innLv = b.inn ? b.inn.level : 0;
            
            if (infirmaryLv > 0 && hunter.hp < hunter.maxHp && hunter.hp > 0) {
                const rate = BUILDINGS.infirmary.levels[infirmaryLv - 1].healRate;
                hunter.hp = Math.min(hunter.maxHp, hunter.hp + rate);
            }
            if (restaurantLv > 0 && hunter.satiety < hunter.maxSatiety) {
                const rate = BUILDINGS.restaurant.levels[restaurantLv - 1].satietyRate;
                hunter.satiety = Math.min(hunter.maxSatiety, hunter.satiety + rate);
            }
            if (tavernLv > 0 && hunter.mood < hunter.maxMood) {
                const rate = BUILDINGS.tavern.levels[tavernLv - 1].moodRate;
                hunter.mood = Math.min(hunter.maxMood, hunter.mood + rate);
            }
            if (innLv > 0 && hunter.stamina < hunter.maxStamina) {
                const rate = BUILDINGS.inn.levels[innLv - 1].staminaRate;
                hunter.stamina = Math.min(hunter.maxStamina, hunter.stamina + rate);
            }
        }
    }

    // === THỢ SĂN MỚI ===
    checkHunterArrival() {
        if (this.hunterQueue.length > 0) {
            // Nếu có thể đến, thêm vào queue trên UI
            this.newHunterAvailable = true;
            return;
        }
        
        // Tạo thợ săn mới chờ
        if (!this.canAddHunter()) return;
        const hunter = this.generateHunter();
        this.hunterQueue.push(hunter);
        this.addLog(`Thợ săn mới ${hunter.name} (${hunter.tierName} ${hunter.className}) đang chờ!`);
        saveGame(); // Lưu ngay để không mất khi F5
    }

    // === NHIỆM VỤ ===
    checkQuests() {
        for (let q of this.quests) {
            if (this.completedQuests.includes(q.id)) continue;
            let done = false;
            const req = q.req;
            switch (req.type) {
                case 'build':
                    done = this.buildings[req.id] && this.buildings[req.id].level > 0;
                    break;
                case 'hunterCount':
                    done = this.hunters.length >= req.count;
                    break;
                case 'hunterLevel':
                    done = this.hunters.some(h => h.level >= req.level);
                    break;
                case 'buildingLevel':
                    done = this.buildings[req.id] && this.buildings[req.id].level >= req.level;
                    break;
                case 'kill':
                case 'killCount':
                    done = this.totalKills >= req.count;
                    break;
                case 'craft':
                case 'craftCount':
                    done = this.totalCrafts >= req.count;
                    break;
                case 'equip':
                    done = this.hunters.some(h => {
                        let count = 0;
                        for (let s in h.equipment) { if (h.equipment[s]) count++; }
                        return count >= req.count;
                    });
                    break;
                case 'skill':
                    done = this.hunters.some(h => h.skills.length >= req.count);
                    break;
                case 'trade':
                    done = this.totalTrades >= req.count;
                    break;
                case 'bounty':
                    done = this.bountyProgress >= req.count;
                    break;
                case 'dungeon':
                case 'dungeonCount':
                    done = this.totalDungeons >= req.count;
                    break;
                case 'reincarnate':
                    done = this.hunters.some(h => h.reincarnations >= req.count);
                    break;
                case 'gold':
                    done = this.gold >= req.count;
                    break;
                case 'bossKill':
                    done = this.totalBossKills >= req.count;
                    break;
                case 'legendaryHunter':
                    done = this.hunters.some(h => h.tier === 'legendary');
                    break;
            }
            if (done) {
                this.completeQuest(q);
            }
        }
        
        // Kiểm tra thành tựu
        for (let a of this.achievements) {
            if (this.completedAchievements.includes(a.id)) continue;
            const req = a.req;
            let done = false;
            switch (req.type) {
                case 'buildCount':
                    done = Object.values(this.buildings).filter(b => b.level > 0).length >= req.count;
                    break;
                case 'hunterCount':
                    done = this.hunters.length >= req.count;
                    break;
                case 'hunterLevel':
                    done = this.hunters.some(h => h.level >= req.level);
                    break;
                case 'craftCount':
                    done = this.totalCrafts >= req.count;
                    break;
                case 'killCount':
                    done = this.totalKills >= req.count;
                    break;
                case 'dungeonCount':
                    done = this.totalDungeons >= req.count;
                    break;
                case 'reincarnate':
                    done = this.hunters.some(h => h.reincarnations >= req.count);
                    break;
                case 'gold':
                    done = this.gold >= req.count;
                    break;
                case 'bossKill':
                    done = this.totalBossKills >= req.count;
                    break;
                case 'legendaryHunter':
                    done = this.hunters.some(h => h.tier === 'legendary');
                    break;
            }
            if (done) {
                this.completeAchievement(a);
            }
        }
    }

    completeQuest(q) {
        if (this.completedQuests.includes(q.id)) return;
        this.completedQuests.push(q.id);
        if (q.reward.gold) this.gold += q.reward.gold;
        if (q.reward.gems) this.gems += q.reward.gems;
        this.addLog(`Hoàn thành nhiệm vụ: ${q.name}! Nhận ${q.reward.gold} vàng, ${q.reward.gems} ngọc!`);
    }

    completeAchievement(a) {
        if (this.completedAchievements.includes(a.id)) return;
        this.completedAchievements.push(a.id);
        if (a.reward.gold) this.gold += a.reward.gold;
        if (a.reward.gems) this.gems += a.reward.gems;
        this.addLog(`THÀNH TỰU: ${a.name}! Nhận ${a.reward.gold} vàng, ${a.reward.gems} ngọc!`);
    }

    // === NHIỆM VỤ TRUY NÃ ===
    generateBounty() {
        if (!this.buildings.bountyHut || this.buildings.bountyHut.level === 0) return;
        if (this.bounties.length >= 3) return; // Tối đa 3 bounty
        const lv = this.buildings.bountyHut.level;
        const monsterList = this.getHuntableMonsters();
        const monster = monsterList[Math.floor(Math.random() * monsterList.length)];
        const count = 5 + lv * 2;
        const goldReward = monster.gold * count * 3;
        const gemReward = lv;
        this.bounties.push({
            id: Date.now(),
            monsterName: monster.name,
            target: count,
            progress: 0,
            goldReward,
            gemReward,
            active: true
        });
        this.addLog(`Nhiệm vụ truy nã: Tiêu diệt ${count} ${monster.name}!`);
    }

    checkBountyProgress(monsterName) {
        for (let b of this.bounties) {
            if (!b.active) continue;
            if (b.monsterName === monsterName) {
                b.progress++;
                this.bountyProgress++;
                if (b.progress >= b.target) {
                    b.active = false;
                    this.gold += b.goldReward;
                    this.gems += b.gemReward;
                    this.addLog(`Hoàn thành truy nã! Nhận ${b.goldReward} vàng, ${b.gemReward} ngọc!`);
                    this.checkQuests();
                }
                break;
            }
        }
    }

    // === HẦM NGỤC ===
    startDungeon(partyHunterIds) {
        if (this.dungeonActive) return false;
        if (partyHunterIds.length < 1 || partyHunterIds.length > 5) return false;
        
        this.dungeonParty = [];
        for (let id of partyHunterIds) {
            const h = this.hunters.find(hu => hu.id === id);
            if (!h || h.status === 'dead' || h.status === 'dungeon') return false;
            this.dungeonParty.push(h);
            h.status = 'dungeon';
        }
        
        this.dungeonActive = true;
        this.dungeonProgress = 0;
        this.addLog('Bắt đầu thám hiểm hầm ngục!');
        return true;
    }

    tickDungeon() {
        if (!this.dungeonActive) return;
        this.dungeonProgress++;
        
        const floor = this.dungeonFloor;
        const monsterHp = 50 + floor * 20 + (this.difficulty === 'easy' ? 0 : this.difficulty === 'normal' ? 50 : this.difficulty === 'hard' ? 150 : 300);
        const monsterAtk = 5 + floor * 2 + (this.difficulty === 'easy' ? 0 : this.difficulty === 'normal' ? 5 : 15);
        
        let totalDmg = 0;
        let totalDef = 0;
        
        for (let h of this.dungeonParty) {
            const stats = this.getHunterStats(h);
            totalDmg += stats.atk;
            totalDef += stats.def;
            h.stamina = Math.max(0, h.stamina - 1);
            h.satiety = Math.max(0, h.satiety - 1);
            
            if (Math.random() < stats.evasion / 100) continue;
            const dmg = Math.max(1, monsterAtk - stats.def);
            h.hp -= dmg;
            h.mood = Math.max(0, h.mood - 1);
        }
        
        const partyDmg = totalDmg / Math.max(1, this.dungeonParty.length);
        const monsterDmg = Math.max(1, monsterAtk - totalDef / Math.max(1, this.dungeonParty.length));
        
        if (this.dungeonProgress >= 10) {
            // Hoàn thành tầng
            const goldReward = 50 + floor * 10;
            const gemReward = Math.floor(floor / 5) + 1;
            this.gold += goldReward;
            this.gems += gemReward;
            if (floor >= 10) this.materials['bạc'] = (this.materials['bạc'] || 0) + 1;
            if (floor >= 20) this.materials['đá cường hóa'] = (this.materials['đá cường hóa'] || 0) + 1;
            if (floor >= 40) this.materials['đá nâng cấp'] = (this.materials['đá nâng cấp'] || 0) + 1;
            if (floor >= 60) this.materials['đá sáng'] = (this.materials['đá sáng'] || 0) + 1;
            if (floor >= 80) this.materials['nước mắt thiên thần'] = (this.materials['nước mắt thiên thần'] || 0) + 1;
            this.totalDungeons++;
            
            for (let h of this.dungeonParty) {
                h.status = 'idle';
                this.addExp(h, 20 + floor * 2);
            }
            
            this.addLog(`Hoàn thành hầm ngục tầng ${floor}! Nhận ${goldReward} vàng, ${gemReward} ngọc!`);
            this.dungeonActive = false;
            this.dungeonParty = [];
            this.dungeonFloor++;
            this.checkQuests();
        }
        
        // Kiểm tra chết
        for (let h of this.dungeonParty) {
            if (h.hp <= 0) {
                h.hp = 0;
                h.status = 'dead';
                this.addLog(`${h.name} đã chết trong hầm ngục!`);
            }
        }
    }

    // === BOSS ===
    startBossBattle() {
        if (this.bossActive) return false;
        const bosses = BOSSES.filter(b => b.diff === this.difficulty || 
            (this.difficulty === 'easy' && b.diff === 'easy') ||
            (this.difficulty === 'normal' && ['easy','normal'].includes(b.diff)) ||
            (this.difficulty === 'hard' && ['easy','normal','hard'].includes(b.diff)));
        
        if (bosses.length === 0) return false;
        const boss = bosses[bosses.length - 1];
        this.bossMaxHp = boss.hp;
        this.bossHp = boss.hp;
        this.bossActive = true;
        this.bossDamage = 0;
        this.addLog(`Trùm ${boss.name} đã xuất hiện!`);
        return true;
    }

    tickBoss() {
        if (!this.bossActive) return;
        
        const bossInfo = BOSSES.filter(b => b.diff === this.difficulty || 
            (this.difficulty === 'easy' && b.diff === 'easy') ||
            (this.difficulty === 'normal' && ['easy','normal'].includes(b.diff)) ||
            (this.difficulty === 'hard' && ['easy','normal','hard'].includes(b.diff)));
        const boss = bossInfo[bossInfo.length - 1];
        if (!boss) { this.bossActive = false; return; }
        
        const bossDmg = boss.atk;
        let totalDmg = 0;
        const activeHunters = this.hunters.filter(h => h.status === 'idle' || h.status === 'hunting');
        
        for (let h of activeHunters) {
            const stats = this.getHunterStats(h);
            totalDmg += stats.atk;
            
            if (Math.random() < stats.evasion / 100) continue;
            const dmg = Math.max(1, bossDmg - stats.def);
            h.hp -= dmg;
            h.mood = Math.max(0, h.mood - 3);
            h.satiety = Math.max(0, h.satiety - 2);
            
            if (h.hp <= 0) {
                h.hp = 0;
                h.status = 'dead';
            }
        }
        
        this.bossHp -= totalDmg;
        this.bossDamage += totalDmg;
        
        if (this.bossHp <= 0) {
            // Chiến thắng
            const bonus = this.buildings.bossHorn.level > 0 ? BUILDINGS.bossHorn.levels[this.buildings.bossHorn.level - 1].bossDmgBonus || 0 : 0;
            const goldReward = Math.floor(boss.gold * (1 + bonus / 100));
            const gemReward = boss.gems;
            this.gold += goldReward;
            this.gems += gemReward;
            this.totalBossKills++;
            
            for (let matKey in boss.drops) {
                this.materials[matKey] = (this.materials[matKey] || 0) + boss.drops[matKey];
            }
            
            for (let h of activeHunters) {
                this.addExp(h, 100);
            }
            
            this.addLog(`Đánh bại trùm ${boss.name}! Nhận ${goldReward} vàng, ${gemReward} ngọc!`);
            this.bossActive = false;
            this.checkQuests();
        }
    }

    // === GIAO DỊCH ===
    tradeMaterial(sellMat, sellQty, buyMat, buyQty) {
        if (!this.buildings.tradingPost || this.buildings.tradingPost.level === 0) return false;
        if ((this.materials[sellMat] || 0) < sellQty) return false;
        this.materials[sellMat] -= sellQty;
        this.materials[buyMat] = (this.materials[buyMat] || 0) + buyQty;
        this.totalTrades++;
        this.checkQuests();
        return true;
    }

    tradeMaterialForGems(matKey, qty) {
        const rates = {
            'tinh thể': 20, 'hạt': 10, 'máu': 5, 'lông': 8,
            'nước mắt thiên thần': 3
        };
        const gemRewards = {
            'tinh thể': 1, 'hạt': 1, 'máu': 1, 'lông': 1,
            'nước mắt thiên thần': 5
        };
        const need = rates[matKey];
        const gem = gemRewards[matKey];
        if (!need || !gem) return false;
        if (!this.buildings.tradingPost || this.buildings.tradingPost.level < 6) return false;
        if ((this.materials[matKey] || 0) < qty || qty < need || qty % need !== 0) return false;
        const times = Math.floor(qty / need);
        this.materials[matKey] -= qty;
        this.gems += gem * times;
        this.totalTrades++;
        this.addLog(`Đổi ${qty} ${MATERIALS[matKey].name} lấy ${gem * times} ngọc!`);
        this.checkQuests();
        return true;
    }

    // === HỒI SINH ===
    reviveHunter(hunterId) {
        const h = this.hunters.find(hu => hu.id === hunterId);
        if (!h || h.status !== 'dead') return false;
        if (h.gold < 100) return false;
        h.gold -= 100;
        this.gold += 100;
        h.hp = Math.floor(h.maxHp * 0.5);
        h.satiety = 50;
        h.mood = 50;
        h.stamina = 50;
        h.status = 'idle';
        this.addLog(`${h.name} đã được hồi sinh!`);
        return true;
    }

    // === HỌC KỸ NĂNG ===
    learnSkill(hunterId, skillName) {
        const h = this.hunters.find(hu => hu.id === hunterId);
        if (!h || !this.buildings.academy || this.buildings.academy.level === 0) return false;
        if (this.gold < 500) return false;
        if (h.skills.includes(skillName)) return false;
        this.gold -= 500;
        h.skills.push(skillName);
        this.addLog(`${h.name} đã học kỹ năng: ${skillName}!`);
        this.checkQuests();
        return true;
    }

    // === HUẤN LUYỆN ===
    startTraining(hunterId) {
        const h = this.hunters.find(hu => hu.id === hunterId);
        if (!h || !this.buildings.trainingGround || this.buildings.trainingGround.level === 0) return false;
        if (h.status !== 'idle' || h.level >= 100) return false;
        if (this.gold < 200) return false;
        this.gold -= 200;
        h.status = 'training';
        h.training = true;
        h.trainingProgress = 0;
        return true;
    }

    tickTraining() {
        const lv = this.buildings.trainingGround.level;
        const speed = lv > 0 ? BUILDINGS.trainingGround.levels[lv - 1].trainSpeed : 1;
        for (let h of this.hunters) {
            if (h.status === 'training' && h.level < 100) {
                h.trainingProgress += speed;
                if (h.trainingProgress >= 10) {
                    h.trainingProgress = 0;
                    this.addExp(h, this.expForLevel(h.level) * 2);
                    if (h.level >= 100) {
                        h.status = 'idle';
                        h.training = false;
                        this.addLog(`${h.name} đã hoàn thành huấn luyện!`);
                    }
                }
            }
        }
    }

    // === DI CHUYỂN ĐỘ KHÓ ===
    getTotalReincarnations() {
        return this.hunters.reduce((sum, h) => sum + h.reincarnations, 0);
    }

    getPowerLevel() {
        const total = this.getTotalReincarnations();
        // Mỗi điểm chuyển sinh = 2% sức mạnh
        return 1 + total * 0.02;
    }

    canChangeDifficulty(diffId) {
        const diff = DIFFICULTIES.find(d => d.id === diffId);
        if (!diff) return false;
        return this.getTotalReincarnations() >= diff.totalReincarnations;
    }

    changeDifficulty(diffId) {
        if (!this.canChangeDifficulty(diffId)) return false;
        this.difficulty = diffId;
        this.addLog(`Chuyển sang độ khó: ${DIFFICULTIES.find(d => d.id === diffId).name}`);
        return true;
    }

    // === LOG ===
    addLog(msg) {
        this.logs.unshift({ msg, time: this.gameTime });
        if (this.logs.length > 50) this.logs.pop();
    }

    // === MAIN TICK ===
    tick() {
        const now = Date.now();
        const dt = now - this.lastTick;
        this.lastTick = now;
        this.gameTime++;
        
        // Thợ săn săn bắn tự động
        for (let h of this.hunters) {
            if (h.status === 'idle' && h.hp > 0 && h.satiety > 0 && h.stamina > 0 && h.mood > 0 && h.level < 100) {
                h.status = 'hunting';
            }
            if (h.status === 'hunting' && this.gameTime % 3 === 0) {
                this.hunterHunt(h);
            }
        }
        
        // Tự động trang bị (mỗi 10 giây)
        if (this.gameTime % 10 === 0) this.autoEquipAll();
        
        // Tự động hồi sinh (mỗi 30 giây) - trừ vàng hero
        if (this.gameTime % 30 === 0) {
            for (let h of this.hunters) {
                if (h.status === 'dead' && h.gold >= 100) {
                    this.reviveHunter(h.id);
                }
            }
        }
        
        // Hero bán nguyên liệu (mỗi 15 giây)
        if (this.gameTime % 15 === 0) {
            for (let h of this.hunters) {
                if (h.status !== 'dead') this.heroAutoSell(h);
            }
        }
        
        // Hero mua đồ tiêu hao (mỗi 20 giây)
        if (this.gameTime % 20 === 0) {
            for (let h of this.hunters) {
                if (h.status !== 'dead') this.heroAutoBuy(h);
            }
        }
        
        // Thoát săn nếu không đủ điều kiện
        for (let h of this.hunters) {
            if (h.status === 'hunting' && (h.hp <= 0 || h.satiety <= 0 || h.stamina <= 0 || h.mood <= 0)) {
                h.status = 'idle';
                h.currentMonster = null;
                h.currentMonsterHp = 0;
            }
        }
        
        // Thuế thu nhập hero (mỗi giây) - chống lạm phát
        for (let h of this.hunters) {
            if (h.status !== 'dead' && h.gold > 0) {
                const tax = Math.max(1, Math.floor(h.gold * 0.0001));
                if (tax > 0) {
                    h.gold -= tax;
                    this.gold += tax;
                }
            }
        }
        
        // Tiêu hao thể lực
        if (this.gameTime % 5 === 0) this.drainStamina();
        
        // Hồi phục
        if (this.gameTime % 3 === 0) this.recoverResources();
        
        // Huấn luyện
        if (this.gameTime % 3 === 0) this.tickTraining();
        
        // Hầm ngục
        if (this.dungeonActive && this.gameTime % 3 === 0) this.tickDungeon();
        
        // Boss
        if (this.bossActive && this.gameTime % 2 === 0) this.tickBoss();
        
        // Nhiệm vụ truy nã (mỗi 60 tick)
        if (this.gameTime % 60 === 0 && this.buildings.bountyHut && this.buildings.bountyHut.level > 0) {
            this.generateBounty();
        }
        
        // Kiểm tra thợ săn mới
        this.hunterArrivalTimer++;
        if (this.hunterArrivalTimer >= 1800 && this.hunterQueue.length === 0 && this.canAddHunter()) {
            this.hunterArrivalTimer = 0;
            this.checkHunterArrival();
        }
        
        // Điểm danh hàng ngày (kiểm tra mỗi 60 giây)
        if (this.gameTime % 60 === 0) this.checkDailyReward();
        
        // Đấu Trường tạo ngọc thụ động (mỗi 200 giây)
        if (this.gameTime % 200 === 0 && this.buildings.colosseum && this.buildings.colosseum.level > 0) {
            const lv = this.buildings.colosseum.level;
            const data = BUILDINGS.colosseum.levels[lv - 1];
            const gemAmt = Math.floor(data.pvpReward || 1);
            this.gems += gemAmt;
            this.addLog(`Đấu Trường tạo ra ${gemAmt} ngọc!`);
        }
    }
}

// === KHỞI TẠO GAME ===
function initGame() {
    game = new Game();
    // Tạo 2 thợ săn ban đầu (miễn phí)
    for (let i = 0; i < 2; i++) {
        const h = game.generateHunter();
        game.addHunter(h, true);
    }
    game.addLog('Chào mừng đến với Evil Hunter Tycoon!');
    game.addLog('Bạn là Tù Trưởng, hãy xây dựng lại thị trấn!');
}
