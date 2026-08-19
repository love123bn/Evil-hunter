/**
 * TOWN OF HUNTERS - CIRCULAR ECONOMY & CRAFTING SYSTEM
 */

class EconomySystem {
  // Craft weapon or armor at Forge
  static craftEquipment(type, recipeId) {
    const recipes = CONFIG.RECIPES[type];
    if (!recipes) return false;
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return false;

    // Check materials
    for (const [matId, count] of Object.entries(recipe.materials)) {
      if ((window.gameState.storage[matId] || 0) < count) {
        window.logTicker.add(`❌ Thiếu nguyên liệu rèn [${recipe.name}]!`, 'danger');
        return false;
      }
    }

    // Check gold fee to craft
    const fee = recipe.craftFee || 10;
    if (window.gameState.gold < fee) {
      window.logTicker.add(`❌ Ngân khố thiếu ${fee}g để chi trả thợ rèn [${recipe.name}]!`, 'danger');
      return false;
    }

    // Consume craft fee & materials from town
    window.gameState.spendGold(fee);
    for (const [matId, count] of Object.entries(recipe.materials)) {
      window.gameState.consumeItem(matId, count);
    }

    window.gameState.stats.itemsCrafted++;
    window.logTicker.add(`🔨 Đã rèn [${recipe.name}] (-${fee}g phí rèn)! Đang bày bán giá 💰${recipe.costGold}g cho thợ săn.`, 'loot');
    if (window.soundFX) window.soundFX.playForge();

    // Check Bounty Quests (Craft type)
    window.gameState.bounties.forEach(b => {
      if (!b.completed && b.type === 'craft') {
        b.current = Math.min(b.count, b.current + 1);
        if (b.current >= b.count) {
          b.completed = true;
          window.logTicker.add(`📜 [HOÀN THÀNH QUEST]: [${b.title}] đã xong! Nhận thưởng ngay!`, 'loot');
        }
      }
    });

    // Auto-equip or sell to highest level hunter without gear
    for (const h of window.gameState.hunters) {
      if (type === 'weapons' && (!h.weapon || h.weapon.atk < recipe.atk)) {
        h.weapon = { id: recipe.id, name: recipe.name, atk: recipe.atk };
        h.weaponPlus = 0;
        if (h.gold >= recipe.costGold) {
          h.gold -= recipe.costGold;
          window.gameState.addGold(recipe.costGold);
          window.gameState.buildings.forge.revenue += recipe.costGold;
        }
        window.logTicker.add(`✨ [${h.name}] đã mua và trang bị [${recipe.name}]!`, 'trade');
        break;
      }
      if (type === 'armors' && (!h.armor || h.armor.def < recipe.def)) {
        h.armor = { id: recipe.id, name: recipe.name, def: recipe.def, hp: recipe.hp };
        h.armorPlus = 0;
        if (h.gold >= recipe.costGold) {
          h.gold -= recipe.costGold;
          window.gameState.addGold(recipe.costGold);
          window.gameState.buildings.forge.revenue += recipe.costGold;
        }
        window.logTicker.add(`✨ [${h.name}] đã mua và mặc [${recipe.name}]!`, 'trade');
        break;
      }
    }

    return true;
  }

  // Cook food at Tavern
  static cookFood(foodId) {
    const food = CONFIG.FOODS.find(f => f.id === foodId);
    if (!food) return false;

    // Check materials
    for (const [matId, count] of Object.entries(food.materials)) {
      if ((window.gameState.storage[matId] || 0) < count) {
        window.logTicker.add(`❌ Thiếu nguyên liệu nấu [${food.name}]!`, 'danger');
        return false;
      }
    }

    const fee = food.craftFee || Math.floor(food.costGold * 0.3);
    if (window.gameState.gold < fee) {
      window.logTicker.add(`❌ Ngân khố thiếu ${fee}g để chi trả đầu bếp nấu [${food.name}]!`, 'danger');
      return false;
    }

    window.gameState.spendGold(fee);
    for (const [matId, count] of Object.entries(food.materials)) {
      window.gameState.consumeItem(matId, count);
    }
    window.gameState.stats.itemsCrafted++;
    window.logTicker.add(`🍲 Đã nấu món ngon [${food.name}] (-${fee}g phí nấu)! Bày sẵn tại Quán Ăn giá 💰${food.costGold}g.`, 'trade');
    if (window.soundFX && window.soundFX.playTavern) window.soundFX.playTavern();
    return true;
  }

  // Brew potion at Clinic
  static brewPotion(potionId) {
    const pot = CONFIG.POTIONS.find(p => p.id === potionId);
    if (!pot) return false;

    for (const [matId, count] of Object.entries(pot.materials)) {
      if ((window.gameState.storage[matId] || 0) < count) {
        window.logTicker.add(`❌ Thiếu nguyên liệu bào chế [${pot.name}]!`, 'danger');
        return false;
      }
    }

    const fee = pot.craftFee || Math.floor(pot.costGold * 0.35);
    if (window.gameState.gold < fee) {
      window.logTicker.add(`❌ Ngân khố thiếu ${fee}g để chi trả bào chế [${pot.name}]!`, 'danger');
      return false;
    }

    window.gameState.spendGold(fee);
    for (const [matId, count] of Object.entries(pot.materials)) {
      window.gameState.consumeItem(matId, count);
    }
    window.gameState.stats.itemsCrafted++;
    window.logTicker.add(`⚗️ Đã bào chế [${pot.name}] (-${fee}g phí điều chế)! Bày sẵn tại Trạm Y Tế giá 💰${pot.costGold}g.`, 'trade');
    if (window.soundFX && window.soundFX.playClinic) window.soundFX.playClinic();
    return true;
  }

  // CHECK IF HUNTER HAS ENOUGH GOLD AND TOWN HAS MATERIALS TO UPGRADE GEAR OR ENCHANT
  static canHunterUpgradeEquipment(hunter) {
    if (!hunter) return false;

    // 1. Check weapon upgrades
    const curWpnAtk = hunter.weapon ? (hunter.weapon.atk || 0) : 0;
    const validWeapons = CONFIG.RECIPES.weapons
      .filter(w => w.reqLvl <= hunter.level && w.atk > curWpnAtk)
      .sort((a, b) => b.atk - a.atk);

    for (const wpn of validWeapons) {
      if (hunter.gold >= wpn.costGold) {
        let hasMats = true;
        for (const [matId, count] of Object.entries(wpn.materials)) {
          if ((window.gameState.storage[matId] || 0) < count) {
            hasMats = false;
            break;
          }
        }
        if (hasMats) return true;
      }
    }

    // 2. Check armor upgrades
    const curAmrDef = hunter.armor ? (hunter.armor.def || 0) : 0;
    const validArmors = (CONFIG.RECIPES.armors || [])
      .filter(a => a.reqLvl <= hunter.level && a.def > curAmrDef)
      .sort((a, b) => b.def - a.def);

    for (const amr of validArmors) {
      if (hunter.gold >= amr.costGold) {
        let hasMats = true;
        for (const [matId, count] of Object.entries(amr.materials)) {
          if ((window.gameState.storage[matId] || 0) < count) {
            hasMats = false;
            break;
          }
        }
        if (hasMats) return true;
      }
    }

    // 3. Check ring upgrades
    const curRingAtk = hunter.ring ? (hunter.ring.atk || 0) : 0;
    const validRings = (CONFIG.RECIPES.rings || [])
      .filter(r => r.reqLvl <= hunter.level && r.atk > curRingAtk)
      .sort((a, b) => b.atk - a.atk);

    for (const ring of validRings) {
      if (hunter.gold >= ring.costGold) {
        let hasMats = true;
        for (const [matId, count] of Object.entries(ring.materials)) {
          if ((window.gameState.storage[matId] || 0) < count) {
            hasMats = false;
            break;
          }
        }
        if (hasMats) return true;
      }
    }

    // 4. Check amulet upgrades
    const curAmuletDef = hunter.amulet ? (hunter.amulet.def || 0) : 0;
    const validAmulets = (CONFIG.RECIPES.amulets || [])
      .filter(a => a.reqLvl <= hunter.level && a.def > curAmuletDef)
      .sort((a, b) => b.def - a.def);

    for (const amul of validAmulets) {
      if (hunter.gold >= amul.costGold) {
        let hasMats = true;
        for (const [matId, count] of Object.entries(amul.materials)) {
          if ((window.gameState.storage[matId] || 0) < count) {
            hasMats = false;
            break;
          }
        }
        if (hasMats) return true;
      }
    }

    // 5. Check talisman upgrades
    const curTalAtk = hunter.talisman ? (hunter.talisman.atk || 0) : 0;
    const validTalismans = (CONFIG.RECIPES.talismans || [])
      .filter(t => t.reqLvl <= hunter.level && t.atk > curTalAtk)
      .sort((a, b) => b.atk - a.atk);

    for (const tal of validTalismans) {
      if (hunter.gold >= tal.costGold) {
        let hasMats = true;
        for (const [matId, count] of Object.entries(tal.materials)) {
          if ((window.gameState.storage[matId] || 0) < count) {
            hasMats = false;
            break;
          }
        }
        if (hasMats) return true;
      }
    }

    // 6. Check Enchantments (+1 to +30) based on Gear Req Level (Lv.1-100) and Forge Level Limit
    const forgeLvl = window.gameState.buildings.forge?.level || 1;
    const maxEnchant = typeof Building !== 'undefined' && Building.getMaxEnchantLevel ? Building.getMaxEnchantLevel(forgeLvl) : Math.min(30, forgeLvl * 5);

    if (hunter.weapon && (hunter.weaponPlus || 0) < maxEnchant) {
      const wpnReqLvl = hunter.weapon.reqLvl || hunter.level || 1;
      const enchantCost = Math.floor(60 * Math.pow(1.18, hunter.weaponPlus || 0) + Math.pow(1.045, wpnReqLvl) * 20);
      if (hunter.gold >= enchantCost) return true;
    }
    if (hunter.armor && (hunter.armorPlus || 0) < maxEnchant) {
      const amrReqLvl = hunter.armor.reqLvl || hunter.level || 1;
      const enchantCost = Math.floor(50 * Math.pow(1.18, hunter.armorPlus || 0) + Math.pow(1.045, amrReqLvl) * 16);
      if (hunter.gold >= enchantCost) return true;
    }
    if (hunter.ring && (hunter.ringPlus || 0) < maxEnchant) {
      const ringReqLvl = hunter.ring.reqLvl || hunter.level || 1;
      const enchantCost = Math.floor(45 * Math.pow(1.18, hunter.ringPlus || 0) + Math.pow(1.045, ringReqLvl) * 15);
      if (hunter.gold >= enchantCost) return true;
    }
    if (hunter.amulet && (hunter.amuletPlus || 0) < maxEnchant) {
      const amulReqLvl = hunter.amulet.reqLvl || hunter.level || 1;
      const enchantCost = Math.floor(45 * Math.pow(1.18, hunter.amuletPlus || 0) + Math.pow(1.045, amulReqLvl) * 15);
      if (hunter.gold >= enchantCost) return true;
    }
    if (hunter.talisman && (hunter.talismanPlus || 0) < maxEnchant) {
      const talReqLvl = hunter.talisman.reqLvl || hunter.level || 1;
      const enchantCost = Math.floor(45 * Math.pow(1.18, hunter.talismanPlus || 0) + Math.pow(1.045, talReqLvl) * 15);
      if (hunter.gold >= enchantCost) return true;
    }

    return false;
  }

  // AUTO-CRAFT ON DEMAND FOR HUNTER SHOPPING (LEVEL 1 TO 100 SCALING)
  static autoServeEquipment(hunter) {
    if (!hunter) return false;
    let upgraded = false;

    // 1. Check weapon upgrade (Sort best available weapon for hunter level first)
    const availableWeapons = (CONFIG.RECIPES.weapons || [])
      .filter(w => w.reqLvl <= hunter.level)
      .sort((a, b) => b.reqLvl - a.reqLvl);

    for (const wpn of availableWeapons) {
      const currentTier = hunter.weapon ? (hunter.weapon.reqLvl || 1) : 0;
      if (wpn.reqLvl > currentTier) {
        if (hunter.gold >= wpn.costGold) {
          let hasMats = true;
          for (const [matId, count] of Object.entries(wpn.materials)) {
            if ((window.gameState.storage[matId] || 0) < count) {
              hasMats = false;
              break;
            }
          }

          if (hasMats) {
            for (const [matId, count] of Object.entries(wpn.materials)) {
              window.gameState.consumeItem(matId, count);
            }
            hunter.gold -= wpn.costGold;
            let earned = wpn.costGold;
            if (window.gameState.researched?.tech_tax_master) earned = Math.floor(earned * 1.15);
            window.gameState.addGold(earned);
            window.gameState.buildings.forge.revenue += earned;
            
            hunter.weapon = { ...wpn };
            hunter.weaponPlus = 0;
            window.logTicker.add(`⚔️ [TỰ ĐỘNG]: Lò Rèn đã rèn [${wpn.name}] cho [${hunter.name}] (+${earned} GOLD cho Thị Trấn)!`, 'loot');
            if (window.soundFX && window.soundFX.playForge) window.soundFX.playForge();
            upgraded = true;
            break;
          }
        }
      }
    }

    // 2. Check armor upgrade
    const availableArmors = (CONFIG.RECIPES.armors || [])
      .filter(a => a.reqLvl <= hunter.level)
      .sort((a, b) => b.reqLvl - a.reqLvl);

    for (const amr of availableArmors) {
      const currentTier = hunter.armor ? (hunter.armor.reqLvl || 1) : 0;
      if (amr.reqLvl > currentTier) {
        if (hunter.gold >= amr.costGold) {
          let hasMats = true;
          for (const [matId, count] of Object.entries(amr.materials)) {
            if ((window.gameState.storage[matId] || 0) < count) {
              hasMats = false;
              break;
            }
          }

          if (hasMats) {
            for (const [matId, count] of Object.entries(amr.materials)) {
              window.gameState.consumeItem(matId, count);
            }
            hunter.gold -= amr.costGold;
            let earned = amr.costGold;
            if (window.gameState.researched?.tech_tax_master) earned = Math.floor(earned * 1.15);
            window.gameState.addGold(earned);
            window.gameState.buildings.forge.revenue += earned;

            hunter.armor = { ...amr };
            hunter.armorPlus = 0;
            window.logTicker.add(`🛡️ [TỰ ĐỘNG]: Lò Rèn đã rèn [${amr.name}] cho [${hunter.name}] (+${earned} GOLD cho Thị Trấn)!`, 'loot');
            if (window.soundFX && window.soundFX.playForge) window.soundFX.playForge();
            upgraded = true;
            break;
          }
        }
      }
    }

    // 3. Check ring upgrade
    const availableRings = (CONFIG.RECIPES.rings || [])
      .filter(r => r.reqLvl <= hunter.level)
      .sort((a, b) => b.reqLvl - a.reqLvl);

    for (const ring of availableRings) {
      const currentTier = hunter.ring ? (hunter.ring.reqLvl || 1) : 0;
      if (ring.reqLvl > currentTier) {
        if (hunter.gold >= ring.costGold) {
          let hasMats = true;
          for (const [matId, count] of Object.entries(ring.materials)) {
            if ((window.gameState.storage[matId] || 0) < count) {
              hasMats = false;
              break;
            }
          }

          if (hasMats) {
            for (const [matId, count] of Object.entries(ring.materials)) {
              window.gameState.consumeItem(matId, count);
            }
            hunter.gold -= ring.costGold;
            let earned = ring.costGold;
            if (window.gameState.researched?.tech_tax_master) earned = Math.floor(earned * 1.15);
            window.gameState.addGold(earned);
            window.gameState.buildings.forge.revenue += earned;

            hunter.ring = { ...ring };
            hunter.ringPlus = 0;
            window.logTicker.add(`💍 [TỰ ĐỘNG]: Lò Rèn đã rèn [${ring.name}] cho [${hunter.name}] (+${earned} GOLD cho Thị Trấn)!`, 'loot');
            if (window.soundFX && window.soundFX.playForge) window.soundFX.playForge();
            upgraded = true;
            break;
          }
        }
      }
    }

    // 4. Check amulet upgrade
    const availableAmulets = (CONFIG.RECIPES.amulets || [])
      .filter(a => a.reqLvl <= hunter.level)
      .sort((a, b) => b.reqLvl - a.reqLvl);

    for (const amul of availableAmulets) {
      const currentTier = hunter.amulet ? (hunter.amulet.reqLvl || 1) : 0;
      if (amul.reqLvl > currentTier) {
        if (hunter.gold >= amul.costGold) {
          let hasMats = true;
          for (const [matId, count] of Object.entries(amul.materials)) {
            if ((window.gameState.storage[matId] || 0) < count) {
              hasMats = false;
              break;
            }
          }

          if (hasMats) {
            for (const [matId, count] of Object.entries(amul.materials)) {
              window.gameState.consumeItem(matId, count);
            }
            hunter.gold -= amul.costGold;
            let earned = amul.costGold;
            if (window.gameState.researched?.tech_tax_master) earned = Math.floor(earned * 1.15);
            window.gameState.addGold(earned);
            window.gameState.buildings.forge.revenue += earned;

            hunter.amulet = { ...amul };
            hunter.amuletPlus = 0;
            window.logTicker.add(`📿 [TỰ ĐỘNG]: Lò Rèn đã rèn [${amul.name}] cho [${hunter.name}] (+${earned} GOLD cho Thị Trấn)!`, 'loot');
            if (window.soundFX && window.soundFX.playForge) window.soundFX.playForge();
            upgraded = true;
            break;
          }
        }
      }
    }

    // 5. Check talisman upgrade (Pháp Bảo)
    const availableTalismans = (CONFIG.RECIPES.talismans || [])
      .filter(t => t.reqLvl <= hunter.level)
      .sort((a, b) => b.reqLvl - a.reqLvl);

    for (const tal of availableTalismans) {
      const currentTier = hunter.talisman ? (hunter.talisman.reqLvl || 1) : 0;
      if (tal.reqLvl > currentTier) {
        if (hunter.gold >= tal.costGold) {
          let hasMats = true;
          for (const [matId, count] of Object.entries(tal.materials)) {
            if ((window.gameState.storage[matId] || 0) < count) {
              hasMats = false;
              break;
            }
          }

          if (hasMats) {
            for (const [matId, count] of Object.entries(tal.materials)) {
              window.gameState.consumeItem(matId, count);
            }
            hunter.gold -= tal.costGold;
            let earned = tal.costGold;
            if (window.gameState.researched?.tech_tax_master) earned = Math.floor(earned * 1.15);
            window.gameState.addGold(earned);
            window.gameState.buildings.forge.revenue += earned;

            hunter.talisman = { ...tal };
            hunter.talismanPlus = 0;
            window.logTicker.add(`🔮 [TỰ ĐỘNG]: Lò Rèn đã chế tạo Pháp Bảo [${tal.name}] cho [${hunter.name}] (+${earned} GOLD cho Thị Trấn)!`, 'loot');
            if (window.soundFX && window.soundFX.playForge) window.soundFX.playForge();
            upgraded = true;
            break;
          }
        }
      }
    }

    // 6. Check Auto-Enchantment (+1 to +30) with RNG Success Rate & Forge Level Limit
    const forgeLvl = window.gameState.buildings.forge?.level || 1;
    const maxEnchant = typeof Building !== 'undefined' && Building.getMaxEnchantLevel ? Building.getMaxEnchantLevel(forgeLvl) : Math.min(30, forgeLvl * 5);

    // Auto-enchant Weapon
    if (hunter.weapon && (hunter.weaponPlus || 0) < maxEnchant) {
      const wpnPlus = hunter.weaponPlus || 0;
      const targetPlus = wpnPlus + 1;
      const wpnReqLvl = hunter.weapon.reqLvl || hunter.level || 1;
      const enchantCost = Math.floor(60 * Math.pow(1.18, wpnPlus) + Math.pow(1.045, wpnReqLvl) * 20);
      if (hunter.gold >= enchantCost) {
        hunter.gold -= enchantCost;
        let earned = enchantCost;
        if (window.gameState.researched?.tech_tax_master) earned = Math.floor(earned * 1.15);
        window.gameState.addGold(earned);
        window.gameState.buildings.forge.revenue += earned;

        const rate = CONFIG.getEnchantRate ? CONFIG.getEnchantRate(targetPlus) : 0.8;
        if (Math.random() <= rate) {
          hunter.weaponPlus = targetPlus;
          window.logTicker.add(`✨ [CƯỜNG HÓA THÀNH CÔNG]: [${hunter.name}] đã tự đập [${hunter.weapon.name} +${hunter.weaponPlus}] (+${earned} GOLD cho Thị Trấn)!`, 'loot');
          if (window.soundFX && window.soundFX.playLevelUp) window.soundFX.playLevelUp();
        } else {
          let penalty = "Giữ nguyên cấp";
          if (wpnPlus >= 20 && Math.random() < 0.25) {
            hunter.weaponPlus = Math.max(0, wpnPlus - 1);
            penalty = `Bị tụt xuống +${hunter.weaponPlus}`;
          } else if (wpnPlus >= 10 && Math.random() < 0.10) {
            hunter.weaponPlus = Math.max(0, wpnPlus - 1);
            penalty = `Bị tụt xuống +${hunter.weaponPlus}`;
          }
          window.logTicker.add(`💨 [CƯỜNG HÓA THẤT BẠI]: [${hunter.name}] tự đập [${hunter.weapon.name} +${targetPlus}] thất bại (${penalty})!`, 'system');
        }
        upgraded = true;
      }
    }

    // Auto-enchant Armor
    if (hunter.armor && (hunter.armorPlus || 0) < maxEnchant) {
      const amrPlus = hunter.armorPlus || 0;
      const targetPlus = amrPlus + 1;
      const amrReqLvl = hunter.armor.reqLvl || hunter.level || 1;
      const enchantCost = Math.floor(50 * Math.pow(1.18, amrPlus) + Math.pow(1.045, amrReqLvl) * 16);
      if (hunter.gold >= enchantCost) {
        hunter.gold -= enchantCost;
        let earned = enchantCost;
        if (window.gameState.researched?.tech_tax_master) earned = Math.floor(earned * 1.15);
        window.gameState.addGold(earned);
        window.gameState.buildings.forge.revenue += earned;

        const rate = CONFIG.getEnchantRate ? CONFIG.getEnchantRate(targetPlus) : 0.8;
        if (Math.random() <= rate) {
          hunter.armorPlus = targetPlus;
          window.logTicker.add(`✨ [CƯỜNG HÓA THÀNH CÔNG]: [${hunter.name}] đã tự đập [${hunter.armor.name} +${hunter.armorPlus}] (+${earned} GOLD cho Thị Trấn)!`, 'loot');
          if (window.soundFX && window.soundFX.playLevelUp) window.soundFX.playLevelUp();
        } else {
          let penalty = "Giữ nguyên cấp";
          if (amrPlus >= 20 && Math.random() < 0.25) {
            hunter.armorPlus = Math.max(0, amrPlus - 1);
            penalty = `Bị tụt xuống +${hunter.armorPlus}`;
          } else if (amrPlus >= 10 && Math.random() < 0.10) {
            hunter.armorPlus = Math.max(0, amrPlus - 1);
            penalty = `Bị tụt xuống +${hunter.armorPlus}`;
          }
          window.logTicker.add(`💨 [CƯỜNG HÓA THẤT BẠI]: [${hunter.name}] tự đập [${hunter.armor.name} +${targetPlus}] thất bại (${penalty})!`, 'system');
        }
        upgraded = true;
      }
    }

    // Auto-enchant Ring
    if (hunter.ring && (hunter.ringPlus || 0) < maxEnchant) {
      const ringPlus = hunter.ringPlus || 0;
      const targetPlus = ringPlus + 1;
      const ringReqLvl = hunter.ring.reqLvl || hunter.level || 1;
      const enchantCost = Math.floor(45 * Math.pow(1.18, ringPlus) + Math.pow(1.045, ringReqLvl) * 15);
      if (hunter.gold >= enchantCost) {
        hunter.gold -= enchantCost;
        let earned = enchantCost;
        if (window.gameState.researched?.tech_tax_master) earned = Math.floor(earned * 1.15);
        window.gameState.addGold(earned);
        window.gameState.buildings.forge.revenue += earned;

        const rate = CONFIG.getEnchantRate ? CONFIG.getEnchantRate(targetPlus) : 0.8;
        if (Math.random() <= rate) {
          hunter.ringPlus = targetPlus;
          window.logTicker.add(`✨ [CƯỜNG HÓA THÀNH CÔNG]: [${hunter.name}] đã tự đập [${hunter.ring.name} +${hunter.ringPlus}] (+${earned} GOLD cho Thị Trấn)!`, 'loot');
          if (window.soundFX && window.soundFX.playLevelUp) window.soundFX.playLevelUp();
        } else {
          let penalty = "Giữ nguyên cấp";
          if (ringPlus >= 20 && Math.random() < 0.25) {
            hunter.ringPlus = Math.max(0, ringPlus - 1);
            penalty = `Bị tụt xuống +${hunter.ringPlus}`;
          } else if (ringPlus >= 10 && Math.random() < 0.10) {
            hunter.ringPlus = Math.max(0, ringPlus - 1);
            penalty = `Bị tụt xuống +${hunter.ringPlus}`;
          }
          window.logTicker.add(`💨 [CƯỜNG HÓA THẤT BẠI]: [${hunter.name}] tự đập [${hunter.ring.name} +${targetPlus}] thất bại (${penalty})!`, 'system');
        }
        upgraded = true;
      }
    }

    // Auto-enchant Amulet
    if (hunter.amulet && (hunter.amuletPlus || 0) < maxEnchant) {
      const amulPlus = hunter.amuletPlus || 0;
      const targetPlus = amulPlus + 1;
      const amulReqLvl = hunter.amulet.reqLvl || hunter.level || 1;
      const enchantCost = Math.floor(45 * Math.pow(1.18, amulPlus) + Math.pow(1.045, amulReqLvl) * 15);
      if (hunter.gold >= enchantCost) {
        hunter.gold -= enchantCost;
        let earned = enchantCost;
        if (window.gameState.researched?.tech_tax_master) earned = Math.floor(earned * 1.15);
        window.gameState.addGold(earned);
        window.gameState.buildings.forge.revenue += earned;

        const rate = CONFIG.getEnchantRate ? CONFIG.getEnchantRate(targetPlus) : 0.8;
        if (Math.random() <= rate) {
          hunter.amuletPlus = targetPlus;
          window.logTicker.add(`✨ [CƯỜNG HÓA THÀNH CÔNG]: [${hunter.name}] đã tự đập [${hunter.amulet.name} +${hunter.amuletPlus}] (+${earned} GOLD cho Thị Trấn)!`, 'loot');
          if (window.soundFX && window.soundFX.playLevelUp) window.soundFX.playLevelUp();
        } else {
          let penalty = "Giữ nguyên cấp";
          if (amulPlus >= 20 && Math.random() < 0.25) {
            hunter.amuletPlus = Math.max(0, amulPlus - 1);
            penalty = `Bị tụt xuống +${hunter.amuletPlus}`;
          } else if (amulPlus >= 10 && Math.random() < 0.10) {
            hunter.amuletPlus = Math.max(0, amulPlus - 1);
            penalty = `Bị tụt xuống +${hunter.amuletPlus}`;
          }
          window.logTicker.add(`💨 [CƯỜNG HÓA THẤT BẠI]: [${hunter.name}] tự đập [${hunter.amulet.name} +${targetPlus}] thất bại (${penalty})!`, 'system');
        }
        upgraded = true;
      }
    }

    // Auto-enchant Talisman
    if (hunter.talisman && (hunter.talismanPlus || 0) < maxEnchant) {
      const talPlus = hunter.talismanPlus || 0;
      const targetPlus = talPlus + 1;
      const talReqLvl = hunter.talisman.reqLvl || hunter.level || 1;
      const enchantCost = Math.floor(45 * Math.pow(1.18, talPlus) + Math.pow(1.045, talReqLvl) * 15);
      if (hunter.gold >= enchantCost) {
        hunter.gold -= enchantCost;
        let earned = enchantCost;
        if (window.gameState.researched?.tech_tax_master) earned = Math.floor(earned * 1.15);
        window.gameState.addGold(earned);
        window.gameState.buildings.forge.revenue += earned;

        const rate = CONFIG.getEnchantRate ? CONFIG.getEnchantRate(targetPlus) : 0.8;
        if (Math.random() <= rate) {
          hunter.talismanPlus = targetPlus;
          window.logTicker.add(`✨ [CƯỜNG HÓA THÀNH CÔNG]: [${hunter.name}] đã tự đập [${hunter.talisman.name} +${hunter.talismanPlus}] (+${earned} GOLD cho Thị Trấn)!`, 'loot');
          if (window.soundFX && window.soundFX.playLevelUp) window.soundFX.playLevelUp();
        } else {
          let penalty = "Giữ nguyên cấp";
          if (talPlus >= 20 && Math.random() < 0.25) {
            hunter.talismanPlus = Math.max(0, talPlus - 1);
            penalty = `Bị tụt xuống +${hunter.talismanPlus}`;
          } else if (talPlus >= 10 && Math.random() < 0.10) {
            hunter.talismanPlus = Math.max(0, talPlus - 1);
            penalty = `Bị tụt xuống +${hunter.talismanPlus}`;
          }
          window.logTicker.add(`💨 [CƯỜNG HÓA THẤT BẠI]: [${hunter.name}] tự đập [${hunter.talisman.name} +${targetPlus}] thất bại (${penalty})!`, 'system');
        }
        upgraded = true;
      }
    }

    return upgraded;
  }

  // MANUAL ENCHANTMENT BUTTON TRIGGER (Hỗ trợ đập riêng Vũ Khí, Áo Giáp, Nhẫn, Dây Chuyền & Pháp Bảo)
  static autoEnchantHunter(hunterId, type = 'weapon') {
    const hunter = window.gameState.hunters.find(h => h.id === hunterId);
    if (!hunter) return;

    let item = null;
    let plus = 0;
    let baseCost = 60;
    let baseMultiplier = 20;
    let typeName = "Vũ Khí";
    let icon = "🗡️";

    if (type === 'armor') {
      item = hunter.armor;
      plus = hunter.armorPlus || 0;
      baseCost = 50;
      baseMultiplier = 16;
      typeName = "Áo Giáp";
      icon = "🦺";
    } else if (type === 'ring') {
      item = hunter.ring;
      plus = hunter.ringPlus || 0;
      baseCost = 45;
      baseMultiplier = 15;
      typeName = "Nhẫn Cổ Ngữ";
      icon = "💍";
    } else if (type === 'amulet') {
      item = hunter.amulet;
      plus = hunter.amuletPlus || 0;
      baseCost = 45;
      baseMultiplier = 15;
      typeName = "Dây Chuyền";
      icon = "📿";
    } else if (type === 'talisman') {
      item = hunter.talisman;
      plus = hunter.talismanPlus || 0;
      baseCost = 45;
      baseMultiplier = 15;
      typeName = "Pháp Bảo";
      icon = "🔮";
    } else {
      item = hunter.weapon;
      plus = hunter.weaponPlus || 0;
      baseCost = 60;
      baseMultiplier = 20;
      typeName = "Vũ Khí";
      icon = "🗡️";
    }

    if (!item) {
      alert(`Thợ săn này chưa trang bị ${typeName} để cường hóa!`);
      return;
    }

    if (plus >= 30) {
      alert(`${typeName} của thợ săn đã đạt cấp Cường Hóa tối đa (+30)!`);
      return;
    }

    const targetPlus = plus + 1;
    const reqLvl = item.reqLvl || hunter.level || 1;
    const cost = Math.floor(baseCost * Math.pow(1.18, plus) + Math.pow(1.045, reqLvl) * baseMultiplier);
    const costStr = CONFIG.formatNumber ? CONFIG.formatNumber(cost) : cost.toLocaleString();

    if (hunter.gold >= cost || window.gameState.gold >= cost) {
      if (hunter.gold >= cost) hunter.gold -= cost;
      else window.gameState.spendGold(cost);

      const rate = CONFIG.getEnchantRate ? CONFIG.getEnchantRate(targetPlus) : 0.8;
      const ratePct = Math.round(rate * 100);

      if (Math.random() <= rate) {
        if (type === 'armor') hunter.armorPlus = targetPlus;
        else if (type === 'ring') hunter.ringPlus = targetPlus;
        else if (type === 'amulet') hunter.amuletPlus = targetPlus;
        else if (type === 'talisman') hunter.talismanPlus = targetPlus;
        else hunter.weaponPlus = targetPlus;

        window.logTicker.add(`✨ [CƯỜNG HÓA ${typeName.toUpperCase()} THÀNH CÔNG (${ratePct}%)]: [${hunter.name}] đã lên [${item.name} +${targetPlus}]! (+10% Chỉ số)`, 'special');
        if (window.soundFX && window.soundFX.playLevelUp) window.soundFX.playLevelUp();
        if (window.showToast) window.showToast(`[${hunter.name}] Đập ${typeName} lên +${targetPlus} thành công!`, 'success', `✨ CƯỜNG HÓA ${typeName.toUpperCase()}`);
      } else {
        let penalty = "Giữ nguyên cấp";
        let newPlus = plus;
        if (plus >= 20 && Math.random() < 0.25) {
          newPlus = Math.max(0, plus - 1);
          penalty = `Bị tụt xuống +${newPlus}`;
        } else if (plus >= 10 && Math.random() < 0.10) {
          newPlus = Math.max(0, plus - 1);
          penalty = `Bị tụt xuống +${newPlus}`;
        }

        if (type === 'armor') hunter.armorPlus = newPlus;
        else if (type === 'ring') hunter.ringPlus = newPlus;
        else if (type === 'amulet') hunter.amuletPlus = newPlus;
        else if (type === 'talisman') hunter.talismanPlus = newPlus;
        else hunter.weaponPlus = newPlus;

        window.logTicker.add(`💨 [CƯỜNG HÓA ${typeName.toUpperCase()} THẤT BẠI (${ratePct}%)]: Đập [${item.name} +${targetPlus}] thất bại (${penalty})!`, 'warning');
        if (window.showToast) window.showToast(`Cường hóa ${typeName} +${targetPlus} thất bại (${penalty})!`, 'warning', `💨 ĐẬP ${typeName.toUpperCase()} THẤT BẠI`);
      }
    }
  }

  // AUTO COOK & SERVE FOOD AT TAVERN
  static autoServeFood(hunter) {
    // Sort foods from highest tier to lowest tier
    const sortedFoods = [...CONFIG.FOODS].sort((a, b) => b.costGold - a.costGold);

    for (const food of sortedFoods) {
      if (hunter.gold >= food.costGold) {
        let hasMats = true;
        for (const [matId, count] of Object.entries(food.materials)) {
          if ((window.gameState.storage[matId] || 0) < count) {
            hasMats = false;
            break;
          }
        }

        if (hasMats) {
          // Consume raw materials from town storage
          for (const [matId, count] of Object.entries(food.materials)) {
            window.gameState.consumeItem(matId, count);
          }
          // Hunter pays gold to town
          hunter.gold -= food.costGold;
          let earned = food.costGold;
          if (window.gameState.researched?.tech_tax_master) earned = Math.floor(earned * 1.15);
          window.gameState.addGold(earned);
          window.gameState.buildings.tavern.revenue += earned;

          hunter.hunger = 100;
          const tavernLvl = window.gameState.buildings.tavern?.level || 1;
          const bonusBuff = (tavernLvl - 1) * 3 + (window.gameState.researched?.tech_gourmet_chef ? 10 : 0);
          hunter.foodBuffAtk = (food.buffAtk || 0) + bonusBuff;
          hunter.foodBuffTimer = 25; // Active for combat

          window.logTicker.add(`🍲 [TỰ ĐỘNG]: Quán Ăn nấu [${food.name}] cho [${hunter.name}] (+${earned} GOLD Thị Trấn, +${hunter.foodBuffAtk} ATK)!`, 'trade');
          if (window.soundFX && window.soundFX.playTavern) window.soundFX.playTavern();
          return true;
        }
      }
    }

    // If no raw materials for gourmet food, serve Standard Town Bread & Soup (Exponential Scaling)
    const tavernLvl = window.gameState.buildings.tavern?.level || 1;
    const standardCost = Math.max(25, Math.floor(20 * Math.pow(1.045, hunter.level || 1) + 10 * Math.pow(1.06, tavernLvl || 1)));
    if (hunter.gold >= standardCost) {
      hunter.gold -= standardCost;
      let earned = standardCost;
      if (window.gameState.researched?.tech_tax_master) earned = Math.floor(earned * 1.15);
      window.gameState.addGold(earned);
      window.gameState.buildings.tavern.revenue += earned;
      hunter.hunger = 100;
      window.logTicker.add(`🍞 [TỰ ĐỘNG]: Quán Ăn phục vụ Bánh Mì & Súp Dã Chiến cho [${hunter.name}] (-${standardCost} GOLD Thợ săn, +${earned} GOLD Thị Trấn)!`, 'trade');
      return true;
    } else {
      const paid = Math.max(0, hunter.gold);
      hunter.gold = 0;
      if (paid > 0) {
        window.gameState.addGold(paid);
        window.gameState.buildings.tavern.revenue += paid;
      }
      hunter.hunger = 60;
      window.logTicker.add(`🍲 [${hunter.name}] thiếu tiền, ăn cháo từ thiện tại Quán Ăn (+60% Đói${paid > 0 ? `, trả ${paid}g` : ''})`, 'system');
      return true;
    }
  }

  // AUTO HEAL & SERVE POTIONS AT CLINIC
  static autoServeClinic(hunter) {
    // 1. If Dead, try Revive Scroll
    if (hunter.state === 'DEAD') {
      const revScroll = CONFIG.POTIONS.find(p => p.id === 'pot_revive_scroll');
      if (revScroll && hunter.gold >= revScroll.costGold) {
        let hasMats = true;
        for (const [matId, count] of Object.entries(revScroll.materials)) {
          if ((window.gameState.storage[matId] || 0) < count) {
            hasMats = false;
            break;
          }
        }
        if (hasMats) {
          for (const [matId, count] of Object.entries(revScroll.materials)) {
            window.gameState.consumeItem(matId, count);
          }
          hunter.gold -= revScroll.costGold;
          let earned = revScroll.costGold;
          if (window.gameState.researched?.tech_tax_master) earned = Math.floor(earned * 1.15);
          window.gameState.addGold(earned);
          window.gameState.buildings.clinic.revenue += earned;
          hunter.hp = hunter.getTotalMaxHp ? hunter.getTotalMaxHp() : (hunter.maxHp || 100);
          hunter.changeState('HUNTING', 'Hồi sinh tức thì bằng Bùa Thần!');
          window.logTicker.add(`📜 [TỰ ĐỘNG]: Trạm Y Tế dùng [Bùa Hồi Sinh] cứu mạng [${hunter.name}] (+${earned} GOLD cho Thị Trấn)!`, 'loot');
          if (window.soundFX && window.soundFX.playClinic) window.soundFX.playClinic();
          return true;
        }
      }
      return false;
    }

    // 2. If Injured, find best matching potion for hunter's level & materials
    const healPotions = CONFIG.POTIONS.filter(p => p.id !== 'pot_revive_scroll' && p.reqLvl <= hunter.level)
      .sort((a, b) => b.costGold - a.costGold);

    const clinicLvl = window.gameState.buildings.clinic?.level || 1;
    for (const pot of healPotions) {
      if (hunter.gold >= pot.costGold) {
        let hasMats = true;
        for (const [matId, count] of Object.entries(pot.materials)) {
          if ((window.gameState.storage[matId] || 0) < count) {
            hasMats = false;
            break;
          }
        }
        if (hasMats) {
          for (const [matId, count] of Object.entries(pot.materials)) {
            window.gameState.consumeItem(matId, count);
          }
          hunter.gold -= pot.costGold;
          let earned = pot.costGold;
          if (window.gameState.researched?.tech_tax_master) earned = Math.floor(earned * 1.15);
          window.gameState.addGold(earned);
          window.gameState.buildings.clinic.revenue += earned;
          const healBonus = (clinicLvl - 1) * 35;
          const totalHealed = pot.healHp + healBonus;
          const maxHpCap = hunter.getTotalMaxHp ? hunter.getTotalMaxHp() : (hunter.maxHp || 100);
          hunter.hp = Math.min(maxHpCap, hunter.hp + totalHealed);
          window.logTicker.add(`🧪 [TỰ ĐỘNG]: Bác sĩ cấp [${pot.name}] cho [${hunter.name}] (+${earned} GOLD cho Thị Trấn, +${totalHealed} HP)!`, 'trade');
          if (window.soundFX && window.soundFX.playClinic) window.soundFX.playClinic();
          return true;
        }
      }
    }

    // Standard Emergency First-Aid (Exponential Scaling)
    const basicFee = Math.max(35, Math.floor(25 * Math.pow(1.045, hunter.level || 1) + 12 * Math.pow(1.06, clinicLvl || 1)));
    if (hunter.gold >= basicFee) {
      hunter.gold -= basicFee;
      let earned = basicFee;
      if (window.gameState.researched?.tech_tax_master) earned = Math.floor(earned * 1.15);
      window.gameState.addGold(earned);
      window.gameState.buildings.clinic.revenue += earned;
      hunter.hp = hunter.getTotalMaxHp ? hunter.getTotalMaxHp() : (hunter.maxHp || 100);
      window.logTicker.add(`🏥 [TỰ ĐỘNG]: Trạm Y Tế điều trị vết thương cho [${hunter.name}] (-${basicFee} GOLD Thợ săn, +${earned} GOLD Thị Trấn)!`, 'system');
      if (window.soundFX && window.soundFX.playClinic) window.soundFX.playClinic();
      return true;
    } else {
      const paid = Math.max(0, hunter.gold);
      hunter.gold = 0;
      if (paid > 0) {
        window.gameState.addGold(paid);
        window.gameState.buildings.clinic.revenue += paid;
      }
      const maxHpCap = hunter.getTotalMaxHp ? hunter.getTotalMaxHp() : (hunter.maxHp || 100);
      hunter.hp = Math.floor(maxHpCap * 0.75);
      window.logTicker.add(`🏥 [${hunter.name}] băng bó tạm thời vì thiếu tiền (+75% HP${paid > 0 ? `, trả ${paid} GOLD` : ''})`, 'system');
      return true;
    }
  }
}

window.EconomySystem = EconomySystem;
