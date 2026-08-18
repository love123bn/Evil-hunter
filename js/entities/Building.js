/**
 * TOWN OF HUNTERS - BUILDING ENTITY & UPGRADES
 */

class Building {
  static MAX_LEVEL = 50; // CẤP ĐỘ CÔNG TRÌNH TỐI ĐA CHUẨN XÁC LÀ 50 (MAX LEVEL 50)

  // DYNAMIC FORMULA GENERATOR FOR LEVELS 1 TO 50
  static getUpgradeData(buildingKey, targetLevel) {
    if (targetLevel > Building.MAX_LEVEL) return null;

    const staticData = CONFIG.BUILDING_UPGRADES?.[buildingKey]?.find(u => u.level === targetLevel);
    if (staticData) return staticData;

    // Gold cost scales steeply across 50 levels
    let gold = 350;
    if (targetLevel <= 10) {
      gold = Math.floor(350 * Math.pow(1.28, targetLevel - 1));
    } else if (targetLevel <= 25) {
      gold = Math.floor(3200 * Math.pow(1.24, targetLevel - 6));
    } else if (targetLevel <= 40) {
      gold = Math.floor(120000 * Math.pow(1.18, targetLevel - 25));
    } else {
      gold = Math.floor(1500000 * Math.pow(1.15, targetLevel - 40));
    }

    // Construction time scales progressively (up to several hours at high levels)
    let timeSec = 30;
    if (targetLevel <= 10) {
      timeSec = Math.floor(30 * Math.pow(1.25, targetLevel - 1));
    } else if (targetLevel <= 25) {
      timeSec = Math.min(3600, Math.floor(600 * Math.pow(1.12, targetLevel - 6)));
    } else if (targetLevel <= 40) {
      timeSec = Math.min(14400, Math.floor(3600 * Math.pow(1.09, targetLevel - 25)));
    } else {
      timeSec = Math.min(28800, Math.floor(14400 * Math.pow(1.07, targetLevel - 40)));
    }

    // Dynamic Materials strictly matching unlocked zones 1 to 10
    const materials = {};
    if (targetLevel <= 3) {
      materials.slime_gel = 8 + Math.floor(targetLevel * 2.5);
      materials.goblin_tooth = 6 + Math.floor(targetLevel * 2.0);
      if (targetLevel >= 2) materials.wolf_pelt = 6 + Math.floor(targetLevel * 1.5);
    } else if (targetLevel <= 5) {
      materials.cursed_bone = 14 + Math.floor((targetLevel - 3) * 3.0);
      materials.dark_cloth = 12 + Math.floor((targetLevel - 3) * 2.5);
      if (targetLevel >= 4) materials.spirit_dust = 10 + Math.floor((targetLevel - 3) * 2.0);
    } else if (targetLevel <= 7) {
      materials.lava_ore = 20 + Math.floor((targetLevel - 5) * 4.0);
      materials.spirit_dust = 18 + Math.floor((targetLevel - 5) * 3.5);
      materials.dark_cloth = 15 + Math.floor((targetLevel - 5) * 3.0);
    } else if (targetLevel <= 15) {
      materials.dragon_scale = 15 + Math.floor((targetLevel - 7) * 3.0);
      materials.lava_ore = 35 + Math.floor((targetLevel - 7) * 4.5);
      materials.spirit_dust = 30 + Math.floor((targetLevel - 7) * 4.0);
    } else {
      // Levels 16 to 50 (Endgame expansion)
      materials.dragon_scale = 40 + Math.floor((targetLevel - 15) * 3.5);
      materials.lava_ore = 60 + Math.floor((targetLevel - 15) * 4.5);
      materials.spirit_dust = 50 + Math.floor((targetLevel - 15) * 4.0);
    }

    // Dynamic Description & Perks
    let desc = "";
    const isMax = targetLevel === Building.MAX_LEVEL;
    if (buildingKey === 'inn') {
      const beds = Math.min(35, 3 + Math.floor(targetLevel * 0.7));
      const rate = 12 + (targetLevel - 1) * 5;
      desc = `Quán Trọ Cấp ${targetLevel}${isMax ? ' (TỐI THƯỢNG MAX)' : ''}: ${beds} Giường ngủ (+${rate} Thể lực/s & Tăng giá phòng)`;
    } else if (buildingKey === 'forge') {
      const eff = Math.min(60, targetLevel * 1.3);
      const maxPlus = Math.min(30, targetLevel * 5);
      desc = `Lò Nung Cấp ${targetLevel}${isMax ? ' (TỐI THƯỢNG MAX)' : ''}: Giảm ${eff.toFixed(0)}% hao phí rèn & Mở khóa Cường Hóa +${maxPlus}`;
    } else if (buildingKey === 'tavern') {
      const buff = targetLevel * 6;
      desc = `Bàn Tiệc Cấp ${targetLevel}${isMax ? ' (TỐI THƯỢNG MAX)' : ''}: Món ăn gia tăng buff +${buff} Sát Thương toàn diện`;
    } else if (buildingKey === 'clinic') {
      const heal = targetLevel * 60;
      desc = `Trạm Y Tế Cấp ${targetLevel}${isMax ? ' (TỐI THƯỢNG MAX)' : ''}: Hồi phục siêu tốc & cộng thêm +${heal} Máu tức thì`;
    }

    return {
      level: targetLevel,
      gold: gold,
      timeSec: timeSec,
      materials: materials,
      desc: desc
    };
  }

  // GET MAX ENCHANT LEVEL BASED ON FORGE BUILDING LEVEL (Lv.1: +5, Lv.2: +10, ..., Lv.6+: +30)
  static getMaxEnchantLevel(forgeLvl) {
    const lvl = Number(forgeLvl) || 1;
    return Math.min(30, Math.max(5, lvl * 5));
  }

  // TOWN HALL DYNAMIC DATA FOR LEVELS 1 TO 50
  static getTownUpgradeData(targetLevel) {
    if (targetLevel > Building.MAX_LEVEL) return null;
    const staticData = CONFIG.TOWN_UPGRADES?.find(u => u.level === targetLevel);
    if (staticData) return staticData;

    // Dynamic steep scaling for levels 11-50
    let gold = 300000;
    let timeSec = 2400;
    if (targetLevel <= 25) {
      gold = Math.floor(300000 * Math.pow(1.22, targetLevel - 10));
      timeSec = Math.min(7200, Math.floor(2400 * Math.pow(1.10, targetLevel - 10)));
    } else if (targetLevel <= 40) {
      gold = Math.floor(5000000 * Math.pow(1.18, targetLevel - 25));
      timeSec = Math.min(28800, Math.floor(7200 * Math.pow(1.08, targetLevel - 25)));
    } else {
      gold = Math.floor(45000000 * Math.pow(1.16, targetLevel - 40));
      timeSec = Math.min(86400, Math.floor(28800 * Math.pow(1.07, targetLevel - 40)));
    }

    const hunters = Math.min(50, 20 + Math.floor((targetLevel - 10) * 0.75));
    const storage = 900 + (targetLevel - 10) * 105;
    const dragonScale = 100 + (targetLevel - 10) * 12;
    const lavaOre = 150 + (targetLevel - 10) * 18;
    const spiritDust = 120 + (targetLevel - 10) * 15;

    const isMax = targetLevel === Building.MAX_LEVEL;
    const desc = isMax 
      ? `ĐẾ CHẾ VĨNH HẰNG CẤP 50 (MAX LEVEL): Tuyển mộ 50 Thợ Săn, ${storage} Kho Đồ, Đỉnh Cao Tuyệt Đối!`
      : `Mở rộng Đại Sảnh Cấp ${targetLevel} | Max ${hunters} Thợ Săn, ${storage} Kho Đồ`;

    return {
      level: targetLevel,
      gold: gold,
      timeSec: timeSec,
      materials: { dragon_scale: dragonScale, lava_ore: lavaOre, spirit_dust: spiritDust },
      hunters: hunters,
      storage: storage,
      desc: desc
    };
  }

  // START CONSTRUCTION / UPGRADE (LV.1 TO LV.50)
  static startUpgrade(buildingKey) {
    const b = window.gameState.buildings[buildingKey];
    if (!b) return false;

    if (b.isUpgrading) {
      alert(`Công trình [${Building.getName(buildingKey)}] đang trong quá trình thi công xây dựng!`);
      return false;
    }

    if (b.level >= Building.MAX_LEVEL) {
      alert(`Công trình [${Building.getName(buildingKey)}] đã đạt cấp tối thượng (Max Cấp 50)!`);
      return false;
    }

    // Town Hall Level Constraint: Sub-buildings cannot exceed Town Hall level
    if (b.level >= window.gameState.townLevel) {
      alert(`⚠️ Tòa Thị Chính hiện tại ở Cấp ${window.gameState.townLevel}! Bạn cần nâng cấp Tòa Thị Chính lên Cấp ${b.level + 1} trước khi có thể nâng cấp [${Building.getName(buildingKey)}].`);
      return false;
    }

    const targetUpgrade = Building.getUpgradeData(buildingKey, b.level + 1);
    if (!targetUpgrade) return false;

    // Check materials
    for (const [matId, count] of Object.entries(targetUpgrade.materials)) {
      if ((window.gameState.storage[matId] || 0) < count) {
        const matName = CONFIG.ITEMS[matId] ? CONFIG.ITEMS[matId].name : matId;
        alert(`Thiếu nguyên liệu: Cần ${count}x [${matName}] (Hiện có: ${window.gameState.storage[matId] || 0})! Hãy để thợ săn đi săn thêm.`);
        return false;
      }
    }

    // Check Gold
    if (window.gameState.gold < targetUpgrade.gold) {
      alert(`Thiếu vàng ngân khố: Cần 💰${targetUpgrade.gold.toLocaleString()}g (Hiện có: 💰${window.gameState.gold.toLocaleString()}g)!`);
      return false;
    }

    // Consume Gold & Materials upfront
    window.gameState.spendGold(targetUpgrade.gold);
    for (const [matId, count] of Object.entries(targetUpgrade.materials)) {
      window.gameState.consumeItem(matId, count);
    }

    // Start construction timer
    b.isUpgrading = true;
    b.upgradeTimeLeft = targetUpgrade.timeSec;
    b.upgradeTotalTime = targetUpgrade.timeSec;
    b.targetLevel = targetUpgrade.level;
    b.targetDesc = targetUpgrade.desc;

    const formattedTime = Building.formatTime(targetUpgrade.timeSec);
    window.logTicker.add(`🔨 [KHỞI CÔNG]: Bắt đầu nâng cấp [${Building.getName(buildingKey)}] lên Cấp ${targetUpgrade.level} (Thời gian thi công: ${formattedTime})!`, 'system');
    if (window.soundFX) window.soundFX.playForge();
    if (window.showToast) window.showToast(`Bắt đầu nâng cấp [${Building.getName(buildingKey)}] lên Cấp ${targetUpgrade.level}!`, 'warning', '🔨 KHỞI CÔNG THI CÔNG');
    if (window.app) window.app.refreshActiveModal();
    return true;
  }

  // START TOWN HALL UPGRADE (LV.1 TO LV.50)
  static startTownUpgrade() {
    const state = window.gameState;
    if (!state) return false;

    if (state.townIsUpgrading) {
      alert("Tòa Thị Chính đang trong quá trình thi công xây dựng!");
      return false;
    }

    if (state.townLevel >= Building.MAX_LEVEL) {
      alert("Thị trấn đã đạt cấp tối thượng (Max Cấp 50)!");
      return false;
    }

    const nextTown = Building.getTownUpgradeData(state.townLevel + 1);
    if (!nextTown) return false;

    // Check materials
    for (const [matId, count] of Object.entries(nextTown.materials)) {
      if ((state.storage[matId] || 0) < count) {
        const matName = CONFIG.ITEMS[matId] ? CONFIG.ITEMS[matId].name : matId;
        alert(`Thiếu nguyên liệu mở rộng thị trấn: Cần ${count}x [${matName}] (Hiện có: ${state.storage[matId] || 0})! Hãy để thợ săn đi săn thêm.`);
        return false;
      }
    }

    // Check Gold
    if (state.gold < nextTown.gold) {
      alert(`Thiếu vàng ngân khố: Cần 💰${nextTown.gold.toLocaleString()}g (Hiện có: 💰${state.gold.toLocaleString()}g)!`);
      return false;
    }

    // Consume Gold & Materials upfront
    state.spendGold(nextTown.gold);
    for (const [matId, count] of Object.entries(nextTown.materials)) {
      state.consumeItem(matId, count);
    }

    // Start construction timer
    state.townIsUpgrading = true;
    state.townUpgradeTimeLeft = nextTown.timeSec;
    state.townUpgradeTotalTime = nextTown.timeSec;
    state.townTargetLevel = nextTown.level;
    state.townTargetHunters = nextTown.hunters;
    state.townTargetStorage = nextTown.storage;
    state.townTargetDesc = nextTown.desc;

    const formattedTime = Building.formatTime(nextTown.timeSec);
    window.logTicker.add(`🔨 [KHỞI CÔNG ĐẠI TRƯỜNG]: Bắt đầu đại tu nâng cấp [Tòa Thị Chính] lên Cấp ${nextTown.level} (Thời gian thi công: ${formattedTime})!`, 'system');
    if (window.soundFX) window.soundFX.playForge();
    if (window.showToast) window.showToast(`Bắt đầu đại tu nâng cấp [Tòa Thị Chính] lên Cấp ${nextTown.level}!`, 'warning', '👑 ĐẠI THI CÔNG');
    if (window.app) window.app.refreshActiveModal();
    return true;
  }

  // TICK CONSTRUCTION TIMERS EVERY SIMULATION STEP
  static tickConstruction(deltaSeconds) {
    const state = window.gameState;
    if (!state) return;

    // Check 4 Town Buildings
    if (state.buildings) {
      Object.entries(state.buildings).forEach(([key, b]) => {
        if (b && b.isUpgrading) {
          b.upgradeTimeLeft -= deltaSeconds;
          if (b.upgradeTimeLeft <= 0) {
            b.isUpgrading = false;
            b.upgradeTimeLeft = 0;
            b.level = b.targetLevel || (b.level + 1);
            const bName = Building.getName(key);
            window.logTicker.add(`🎉 [HOÀN THÀNH THI CÔNG]: [${bName}] đã chính thức đạt Cấp ${b.level}! (${b.targetDesc || ''})`, 'loot');
            if (window.soundFX) window.soundFX.playLevelUp();
            if (window.showToast) window.showToast(`[${bName}] đã chính thức đạt Cấp ${b.level}!`, 'success', '🎉 NÂNG CẤP HOÀN TẤT');
            if (window.app) window.app.refreshActiveModal();
          }
        }
      });
    }

    // Check Town Hall Construction
    if (state.townIsUpgrading) {
      state.townUpgradeTimeLeft -= deltaSeconds;
      if (state.townUpgradeTimeLeft <= 0) {
        state.townIsUpgrading = false;
        state.townUpgradeTimeLeft = 0;
        state.townLevel = state.townTargetLevel || (state.townLevel + 1);
        if (state.townTargetHunters) state.maxHunters = state.townTargetHunters;
        if (state.recalculateMaxStorage) {
          state.recalculateMaxStorage();
        } else if (state.townTargetStorage) {
          state.maxStorage = state.townTargetStorage;
        }

        // Automatically boost active bounty rewards with new Town Level multiplier
        if (window.app && window.app.generateScaledBounty && Array.isArray(state.bounties)) {
          state.bounties.forEach(b => {
            const tmpl = CONFIG.QUEST_TEMPLATES.find(t => t.type === b.type && t.target === b.target) || CONFIG.QUEST_TEMPLATES[0];
            const updated = window.app.generateScaledBounty(tmpl, state.townLevel);
            b.rewardGold = updated.rewardGold;
            b.rewardGems = updated.rewardGems;
          });
        }

        window.logTicker.add(`👑 [HOÀN THÀNH]: Đại lễ khánh thành! Thị Trấn đã lên Cấp ${state.townLevel}! (${state.townTargetDesc || ''})`, 'loot');
        if (window.soundFX) window.soundFX.playLevelUp();
        if (window.showToast) window.showToast(`Thị Trấn đã chính thức đạt Cấp ${state.townLevel}! Thưởng nhiệm vụ hàng ngày tăng vọt!`, 'special', '👑 ĐẠI LỄ KHÁNH THÀNH');
        if (window.app) window.app.refreshActiveModal();
      }
    }
  }

  // INSTANT FINISH WITH GEMS
  static instantFinish(buildingKey) {
    const b = window.gameState?.buildings?.[buildingKey];
    if (!b || !b.isUpgrading) return;

    const gemCost = Math.max(1, Math.ceil(b.upgradeTimeLeft / 30));
    if (window.gameState.gems < gemCost) {
      alert(`Không đủ Ngọc Thần Bí (Cần 💎${gemCost})!`);
      return;
    }

    window.gameState.gems -= gemCost;
    b.upgradeTimeLeft = 0;
    Building.tickConstruction(1);
  }

  // INSTANT FINISH TOWN HALL WITH GEMS
  static instantFinishTown() {
    const state = window.gameState;
    if (!state || !state.townIsUpgrading) return;

    const gemCost = Math.max(1, Math.ceil(state.townUpgradeTimeLeft / 30));
    if (state.gems < gemCost) {
      alert(`Không đủ Ngọc Thần Bí (Cần 💎${gemCost})!`);
      return;
    }

    state.gems -= gemCost;
    state.townUpgradeTimeLeft = 0;
    Building.tickConstruction(1);
  }

  static getName(key) {
    const names = {
      forge: "Lò Rèn",
      inn: "Quán Trọ",
      tavern: "Quán Ăn",
      clinic: "Trạm Y Tế",
      hall: "Tòa Thị Chính"
    };
    return names[key] || key;
  }

  static formatTime(totalSeconds) {
    const s = Math.max(0, Math.ceil(totalSeconds));
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const remS = s % 60;
    if (m < 60) return `${m}p ${remS > 0 ? `${remS}s` : ''}`;
    const h = Math.floor(m / 60);
    const remM = m % 60;
    return `${h}h ${remM > 0 ? `${remM}p` : ''}`;
  }
}

Building.upgrade = Building.startUpgrade;
window.Building = Building;
