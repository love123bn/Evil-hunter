/**
 * TOWN OF HUNTERS - STATE MANAGEMENT & PERSISTENCE
 */

class GameState {
  constructor() {
    this.townName = "Thị Trấn Diệt Quỷ";
    this.townLevel = 1;
    this.gold = 350;
    this.gems = 15;
    this.maxHunters = 4;
    this.maxStorage = 60;
    this.storageExpansions = 0; // Number of times storage was expanded via gold
    this.autoSellStorage = true; // Auto-sell to caravan when storage >= 90%
    
    // Time & Day/Night Cycle
    this.gameTimeSeconds = 8 * 3600; // 08:00 AM start
    this.dayCount = 1;
    this.isDay = true;
    
    // Active Zone & Difficulty
    this.currentZoneId = "zone_1";
    this.currentDifficulty = "diff_normal";
    
    // Storage items: { item_id: quantity }
    this.storage = {
      slime_gel: 6,
      goblin_tooth: 2
    };

    // Ready crafted stock in shops
    this.shopStock = {
      weapons: {},
      armors: {},
      foods: {},
      potions: {}
    };

    // Buildings state: level & revenue
    this.buildings = {
      forge: { level: 1, revenue: 0 },
      inn: { level: 1, revenue: 0, activeGuests: 0 },
      tavern: { level: 1, revenue: 0 },
      clinic: { level: 1, revenue: 0 }
    };

    // Hunters list (instances)
    this.hunters = [];
    this.waitingHunters = []; // Queue of summoned hunters waiting for town slots

    // Monsters in current active zone
    this.monsters = [];

    // Researches unlocked & Claimed Achievements
    this.researched = {};
    this.claimedAchievements = {};

    // Gacha Pity Counters
    this.normalPity = 0;   // Guarantee Superior at 10
    this.specialPity = 0;  // Guarantee Legend at 30

    // Active Bounties (Earn Gold + Gems)
    this.bounties = [
      { id: "b1", type: "kill", target: "m_slime", title: "Tiêu diệt 8 Slime Nhầy", count: 8, current: 0, rewardGold: 80, rewardGems: 1, completed: false },
      { id: "b2", type: "collect", target: "wolf_pelt", title: "Thu thập 4 Da Sói Xám", count: 4, current: 0, rewardGold: 150, rewardGems: 2, completed: false },
      { id: "b3", type: "craft", target: "weapons", title: "Rèn 2 Món Vũ Khí Mới", count: 2, current: 0, rewardGold: 200, rewardGems: 2, completed: false }
    ];

    // Dungeon & Abyss Boss Progression
    this.dungeonMaxFloor = 0; // Highest cleared floor (0 = currently at Floor 1)
    this.dungeonCurrentFloor = 1;
    this.dungeonClearedFloors = {}; // { [floor]: true }
    this.dungeonActiveBattle = null;

    // Stats
    this.stats = {
      monstersKilled: 0,
      goldEarned: 0,
      itemsCrafted: 0,
      dungeonBossesKilled: 0
    };

    this.lastSaved = Date.now();
    this.soundOn = false;
    this.crtOn = true;
  }



  // Calculate maximum storage capacity based on Town Hall level
  getMaxStorage() {
    const curLvl = this.townLevel || 1;
    if (curLvl === 1) return 60;
    const upgradeData = CONFIG.TOWN_UPGRADES?.find(u => u.level === curLvl);
    if (upgradeData && upgradeData.storage) return upgradeData.storage;
    return 60 + (curLvl - 1) * 80;
  }

  // Safe alias for backward compatibility
  recalculateMaxStorage() {
    this.maxStorage = this.getMaxStorage();
    return this.maxStorage;
  }

  // Calculate current total storage count
  getStorageCount() {
    return Object.values(this.storage || {}).reduce((sum, q) => sum + q, 0);
  }

  // Add item to town storage (Auto-liquidates common excess loot down to ~85% if full)
  addItem(itemId, amount = 1) {
    const max = this.getMaxStorage();
    const curCount = this.getStorageCount();

    // If storage is full or will exceed max, auto-sell excess common loot to clear down to ~85%
    if (curCount + amount > max) {
      this.autoLiquidateExcessStorage(max);
    }

    this.storage[itemId] = (this.storage[itemId] || 0) + amount;
    return true;
  }

  // Smart Auto-Sell: Liquidates common excess monster loot to maintain storage at ~85%
  autoLiquidateExcessStorage(maxStorage) {
    const targetCount = Math.floor(maxStorage * 0.85);
    let curCount = this.getStorageCount();
    if (curCount <= targetCount) return;

    let soldCount = 0;
    let earnedGold = 0;

    // Prioritize liquidating common monster loot first (Never sell precious breakthrough relics mat_ or dragon_scale)
    const entries = Object.entries(this.storage);
    for (const [id, count] of entries) {
      if (id.startsWith('mat_') || id === 'dragon_scale') continue;

      if (count > 2) {
        const itemData = window.CONFIG?.ITEMS[id];
        if (itemData) {
          const neededToRemove = curCount - targetCount;
          const toSell = Math.min(count - 2, neededToRemove);
          if (toSell > 0) {
            this.storage[id] -= toSell;
            if (this.storage[id] <= 0) delete this.storage[id];
            const val = toSell * itemData.basePrice;
            earnedGold += val;
            soldCount += toSell;
            curCount -= toSell;
            if (curCount <= targetCount) break;
          }
        }
      }
    }

    if (soldCount > 0 && earnedGold > 0) {
      this.addGold(earnedGold);
      if (window.logTicker) {
        window.logTicker.add(`🚢 [TỰ ĐỘNG XUẤT KHẨU]: Kho đầy! Thương Đội đã tự thu mua ${soldCount}x nguyên liệu dư thừa, nạp 💰+${earnedGold} GOLD vào Ngân Khố!`, 'loot');
      }
    }
  }

  // Consume item from storage
  consumeItem(itemId, amount = 1) {
    if ((this.storage[itemId] || 0) >= amount) {
      this.storage[itemId] -= amount;
      if (this.storage[itemId] <= 0) delete this.storage[itemId];
      return true;
    }
    return false;
  }

  // Add gold
  addGold(amt) {
    this.gold += amt;
    this.stats.goldEarned += amt;
    if (window.soundFX) window.soundFX.playCoin();
  }

  // Spend gold
  spendGold(amt) {
    if (this.gold >= amt) {
      this.gold -= amt;
      return true;
    }
    return false;
  }

  // Save to LocalStorage
  save() {
    if (window.isResetting) return;
    try {
      const data = {
        townName: this.townName,
        townLevel: this.townLevel,
        gold: this.gold,
        gems: this.gems,
        maxHunters: this.maxHunters,
        maxStorage: this.maxStorage,
        storageExpansions: this.storageExpansions || 0,
        autoSellStorage: this.autoSellStorage,
        storage: this.storage,
        shopStock: this.shopStock,
        buildings: this.buildings,
        researched: this.researched,
        claimedAchievements: this.claimedAchievements,
        bounties: this.bounties,
        normalPity: this.normalPity,
        specialPity: this.specialPity,
        stats: this.stats,
        currentZoneId: this.currentZoneId,
        currentDifficulty: this.currentDifficulty,
        dayCount: this.dayCount,
        dungeonMaxFloor: this.dungeonMaxFloor || 0,
        dungeonCurrentFloor: this.dungeonCurrentFloor || 1,
        dungeonClearedFloors: this.dungeonClearedFloors || {},
        dungeonSweepsLeft: this.dungeonSweepsLeft !== undefined ? this.dungeonSweepsLeft : 5,
        rivalsData: this.rivalsData || null,
        hunters: this.hunters.map(h => h.serialize()),
        waitingHunters: (this.waitingHunters || []).map(h => h.serialize()),
        lastSaved: Date.now()
      };
      localStorage.setItem("AHT_SAVE_DATA", JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to save:", e);
    }
  }

  // Load from LocalStorage
  load() {
    try {
      const raw = localStorage.getItem("AHT_SAVE_DATA");
      if (!raw) return false;
      const data = JSON.parse(raw);
      
      this.townName = data.townName || this.townName;
      this.townLevel = data.townLevel || this.townLevel;
      this.gold = data.gold !== undefined ? data.gold : this.gold;
      this.gems = data.gems !== undefined ? data.gems : this.gems;
      this.maxHunters = data.maxHunters || this.maxHunters;
      this.maxStorage = data.maxStorage || this.maxStorage;
      this.storageExpansions = data.storageExpansions || 0;
      this.autoSellStorage = data.autoSellStorage !== undefined ? data.autoSellStorage : this.autoSellStorage;
      this.storage = data.storage || this.storage;
      this.shopStock = data.shopStock || this.shopStock;
      this.buildings = data.buildings || this.buildings;
      this.researched = data.researched || this.researched;
      this.claimedAchievements = data.claimedAchievements || this.claimedAchievements;
      this.bounties = data.bounties || this.bounties;
      this.normalPity = data.normalPity || 0;
      this.specialPity = data.specialPity || 0;
      this.stats = data.stats || this.stats;
      this.currentZoneId = data.currentZoneId || this.currentZoneId;
      this.currentDifficulty = data.currentDifficulty || this.currentDifficulty;
      this.dayCount = data.dayCount || this.dayCount;
      this.dungeonMaxFloor = data.dungeonMaxFloor || 0;
      this.dungeonCurrentFloor = data.dungeonCurrentFloor || 1;
      this.dungeonClearedFloors = data.dungeonClearedFloors || {};
      this.dungeonSweepsLeft = data.dungeonSweepsLeft !== undefined ? data.dungeonSweepsLeft : 5;
      this.rivalsData = data.rivalsData || null;

      // Restore hunters
      if (data.hunters && Array.isArray(data.hunters)) {
        this.hunters = data.hunters.map(hData => Hunter.deserialize(hData));
      }

      // Restore waiting hunters
      if (data.waitingHunters && Array.isArray(data.waitingHunters)) {
        this.waitingHunters = data.waitingHunters.map(hData => Hunter.deserialize(hData));
      } else {
        this.waitingHunters = [];
      }

      // Recalculate combined storage
      this.maxStorage = this.getMaxStorage();

      // Check offline progression
      const timeAwaySeconds = Math.floor((Date.now() - (data.lastSaved || Date.now())) / 1000);
      if (timeAwaySeconds > 30) {
        this.calculateOfflineRewards(timeAwaySeconds);
      }

      return true;
    } catch (e) {
      console.warn("Load error:", e);
      return false;
    }
  }

  calculateOfflineRewards(seconds) {
    const minutes = Math.min(Math.floor(seconds / 60), 480); // Cap at 8 hours (480 mins)
    if (minutes < 1) return;

    const hunterCount = this.hunters.length || 1;
    
    // Zone based multiplier
    const curZone = CONFIG.ZONES?.find(z => z.id === this.currentZoneId) || CONFIG.ZONES?.[0] || { monsters: [] };
    const zoneIdx = Math.max(0, CONFIG.ZONES?.findIndex(z => z.id === this.currentZoneId) || 0);
    const zoneMult = 1 + (zoneIdx * 0.45);

    const goldEarned = Math.floor(minutes * hunterCount * 3.2 * zoneMult);
    const kills = Math.floor(minutes * hunterCount * 1.5);
    const lootCount = Math.max(1, Math.min(30, Math.floor(minutes * 0.4 * (1 + zoneIdx * 0.2))));

    this.gold += goldEarned;
    this.stats.monstersKilled += kills;

    // Pick loot from current zone monster loot pool
    const zoneLoots = (curZone.monsters || []).map(m => m.loot).filter(Boolean);
    const chosenLoot = zoneLoots.length > 0 ? zoneLoots[Math.floor(Math.random() * zoneLoots.length)] : 'slime_gel';
    this.addItem(chosenLoot, lootCount);

    setTimeout(() => {
      if (window.showOfflineModal) {
        window.showOfflineModal(minutes, goldEarned, kills, lootCount);
      }
    }, 1000);
  }
}

window.gameState = new GameState();
