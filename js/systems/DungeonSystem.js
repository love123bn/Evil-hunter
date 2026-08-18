/**
 * TOWN OF HUNTERS - DUNGEON & ABYSS BOSS RAID SYSTEM
 */

class DungeonSystem {
  static getFloorData(floorNum) {
    return CONFIG.getDungeonFloorData(floorNum);
  }

  static canChallenge(floorNum) {
    const maxFloor = window.gameState?.dungeonMaxFloor || 0;
    return floorNum <= (maxFloor + 1);
  }

  static isFloorCleared(floorNum) {
    return (window.gameState?.dungeonMaxFloor || 0) >= floorNum;
  }

  static getRaidTeam() {
    const hunters = window.gameState?.hunters || [];
    // Pick living hunters, sorted by combat power descending, take top 5 strongest
    return hunters
      .filter(h => h.hp > 0 && h.state !== 'DEAD')
      .sort((a, b) => (b.getCombatPower ? b.getCombatPower() : 0) - (a.getCombatPower ? a.getCombatPower() : 0))
      .slice(0, 5);
  }

  // PHÍ MỞ CỔNG KẾT GIỚI HẦM NGỤC (TĂNG CAO LŨY TIẾN THEO CẤP TẦNG)
  static getEntryFee(floorNum) {
    const f = Number(floorNum) || 1;
    if (f === 1) return 300;
    if (f <= 5) {
      return Math.floor(300 * Math.pow(2.0, f - 1)); // 300g -> 4,800g ~ 5,000g
    } else if (f <= 10) {
      return Math.floor(5000 * Math.pow(1.52, f - 5)); // 5,000g -> 40,000g
    } else if (f <= 15) {
      return Math.floor(40000 * Math.pow(1.35, f - 10)); // 40,000g -> 180,000g
    } else if (f <= 20) {
      return Math.floor(180000 * Math.pow(1.33, f - 15)); // 180,000g -> 750,000g
    } else if (f <= 25) {
      return Math.floor(750000 * Math.pow(1.37, f - 20)); // 750,000g -> 3,600,000g
    } else {
      return Math.floor(3600000 * Math.pow(1.47, f - 25)); // 3.6M -> 25,000,000g (25M Gold!)
    }
  }

  // Bắt đầu khiêu chiến Boss Hầm Ngục (Tiêu hao phí Vàng mở Cổng Kết Giới)
  static startBattle(floorNum) {
    const floorData = this.getFloorData(floorNum);
    if (!floorData) return false;

    if (!this.canChallenge(floorNum)) {
      alert(`Bạn cần vượt qua Tầng ${floorNum - 1} trước khi khiêu chiến Tầng ${floorNum}!`);
      return false;
    }

    const entryFee = this.getEntryFee(floorNum);
    const feeStr = CONFIG.formatNumber ? CONFIG.formatNumber(entryFee) : entryFee.toLocaleString();
    if (window.gameState.gold < entryFee) {
      alert(`Ngân khố không đủ 💰${feeStr}g để chi trả phí mở Cổng Kết Giới Hầm Ngục Tầng ${floorNum}!`);
      return false;
    }

    const raidTeam = this.getRaidTeam();
    if (raidTeam.length === 0) {
      alert("Toàn bộ thợ săn đều đang bị thương hoặc kiệt sức! Hãy để họ hồi phục trước khi vào Hầm Ngục.");
      return false;
    }

    const squadPower = raidTeam.reduce((sum, h) => sum + (h.getCombatPower ? h.getCombatPower() : 0), 0);
    const reqPower = floorData.reqPower || 3000;
    if (squadPower < reqPower) {
      const diff = reqPower - squadPower;
      alert(`⚠️ CHƯA ĐỦ ĐIỀU KIỆN VÀO HẦM NGỤC:\n\nĐội thợ săn mạnh nhất (Top 5: ${CONFIG.formatNumber(squadPower)} CP) chưa đạt Lực Chiến Tối Thiểu (${CONFIG.formatNumber(reqPower)} CP) của [${floorData.name}]!\n\nBạn còn thiếu ${CONFIG.formatNumber(diff)} CP. Hãy cường hóa trang bị hoặc nâng cấp thợ săn trước khi khiêu chiến.`);
      return false;
    }

    // Spend Entry Fee
    window.gameState.spendGold(entryFee);
    window.logTicker.add(`🗝️ [VÀO HẦM NGỤC]: Đã chi 💰${feeStr}g mở Cổng Kết Giới Vực Thẳm Tầng ${floorNum}!`, 'trade');

    window.gameState.dungeonCurrentFloor = floorNum;
    window.gameState.dungeonActiveBattle = {
      floor: floorNum,
      floorData: floorData,
      boss: {
        name: floorData.bossName,
        glyph: floorData.bossGlyph,
        maxHp: floorData.bossHp,
        hp: floorData.bossHp,
        atk: floorData.bossAtk,
        def: floorData.bossDef,
        difficulty: floorData.difficulty
      },
      hunters: raidTeam.map(h => ({
        id: h.id,
        name: h.name,
        classKey: h.classKey,
        rankKey: h.rankKey,
        reincarnation: h.reincarnation || 0,
        level: h.level,
        maxHp: h.getTotalMaxHp ? h.getTotalMaxHp() : (h.maxHp || 100),
        hp: h.hp,
        atk: h.getTotalAtk ? h.getTotalAtk() : (h.atk || 20),
        def: h.getTotalDef ? h.getTotalDef() : (h.def || 10),
        critRate: h.getCritRate ? h.getCritRate() : 0.15,
        critDmg: h.getCritDamage ? h.getCritDamage() : 1.85,
        isAlive: true
      })),
      timer: 0,
      enrageSec: floorData.enrageSec || 60,
      timeLeft: floorData.enrageSec || 60,
      state: 'FIGHTING', // 'FIGHTING', 'VICTORY', 'DEFEAT'
      logs: [
        `⚔️ [BẮT ĐẦU KHIÊU CHIẾN]: Đội Thợ Săn (${raidTeam.length} dũng sĩ) tiến vào [${floorData.name}] đối đầu [${floorData.bossName}]!`
      ]
    };

    window.logTicker.add(`🗝️ [HẦM NGỤC TẦNG ${floorNum}]: Đội thợ săn bắt đầu đại chiến Boss [${floorData.bossName}]!`, 'special');
    if (window.soundFX) window.soundFX.playEncounter();

    // Rerender Dungeon UI
    if (window.app) window.app.renderDungeonTab();
    return true;
  }

  // Cập nhật từng tick trận đấu Hầm Ngục
  static updateBattle(deltaSeconds = 0.5) {
    const battle = window.gameState?.dungeonActiveBattle;
    if (!battle || battle.state !== 'FIGHTING') return;

    battle.timer += deltaSeconds;
    battle.timeLeft = Math.max(0, battle.enrageSec - battle.timer);

    const boss = battle.boss;
    const livingHunters = battle.hunters.filter(h => h.isAlive && h.hp > 0);

    // Boss Phase & Enrage Calculations
    const hpRatio = boss.hp / boss.maxHp;
    const isEnraged = hpRatio <= 0.50;
    const isApocalypse = hpRatio <= 0.20;

    // First time entering Phase 2
    if (isEnraged && !battle.loggedEnragePhase2) {
      battle.loggedEnragePhase2 = true;
      battle.logs.unshift(`🔥 [CẢNH BÁO BOSS BẠO NỘ!]: ${boss.name} bốc hỏa cuồng nộ! Nhận Khiên Thần Ma (Giảm 25% sát thương) và tăng +40% ATK!`);
    }
    // First time entering Phase 3
    if (isApocalypse && !battle.loggedApocalypse) {
      battle.loggedApocalypse = true;
      battle.logs.unshift(`⚡☠️ [TUYỆT CẢNH DIỆT THẾ!]: ${boss.name} bộc phát Chân Ma Tối Thượng! Bão sấm sét hủy diệt chuẩn bị quét sạch toàn đội!`);
    }

    // 1. Thợ săn tấn công Boss
    livingHunters.forEach(h => {
      if (boss.hp <= 0) return;
      if (h.stunnedTurns > 0) {
        h.stunnedTurns--;
        battle.logs.unshift(`💫 [${h.name}] đang bị choáng váng, không thể xuất chiêu!`);
        return;
      }

      const critRate = h.critRate || 0.15;
      const critDmg = h.critDmg || 1.85;
      const isCrit = Math.random() < critRate;
      let baseDmg = Math.max(8, Math.floor(h.atk - (boss.def * 0.45)));
      
      // Phase 2 Boss Shield reduces incoming damage by 25%
      if (isEnraged) baseDmg = Math.max(5, Math.floor(baseDmg * 0.75));

      // Tech: Dungeon Dominance (+25% Damage vs Dungeon Bosses)
      if (window.gameState?.researched?.tech_dungeon_dominance) {
        baseDmg = Math.floor(baseDmg * 1.25);
      }

      const dmg = isCrit ? Math.floor(baseDmg * critDmg) : baseDmg;
      boss.hp = Math.max(0, boss.hp - dmg);
      
      const starTxt = h.reincarnation > 0 ? '⭐'.repeat(h.reincarnation) : '';
      if (isCrit) {
        const critPct = Math.round(critDmg * 100);
        battle.logs.unshift(`💥 [BẠO KÍCH ${critPct}%!] ${starTxt}[${h.name}] tung đòn uy lực trúng ${boss.name} gây -${dmg} HP!`);
      } else if (Math.random() < 0.25) {
        battle.logs.unshift(`🗡️ [${h.name}] chém ${boss.name} gây -${dmg} HP`);
      }
    });

    // 2. Boss kiểm tra tử trận
    if (boss.hp <= 0) {
      this.handleVictory(battle);
      return;
    }

    // 3. Boss phản công với độ khó cao & kỹ năng đặc biệt
    const bossAtkMultiplier = isApocalypse ? 1.6 : (isEnraged ? 1.4 : 1.0);
    const effectiveBossAtk = Math.floor(boss.atk * bossAtkMultiplier);

    if (livingHunters.length > 0) {
      const rollSkill = Math.random();

      // Skill A: Sát Chiêu Diệt Thế Diện Rộng (AOE Storm)
      if (rollSkill < (isApocalypse ? 0.60 : (isEnraged ? 0.40 : 0.25))) {
        let aoeBase = Math.max(15, Math.floor(effectiveBossAtk * (isApocalypse ? 0.85 : 0.60)));
        if (window.gameState?.researched?.tech_dungeon_dominance) aoeBase = Math.floor(aoeBase * 0.85);

        battle.logs.unshift(`🔥 [BOSS ĐẠI DIỆT CHIÊU!] ${boss.name} gầm vang trời đất, phóng cuồng lốc sát thương diện rộng -${aoeBase} HP!`);
        
        livingHunters.forEach(h => {
          const actualDmg = Math.max(10, Math.floor(aoeBase - (h.def * 0.3)));
          h.hp = Math.max(0, h.hp - actualDmg);
          
          if (isEnraged && Math.random() < 0.25) {
            h.stunnedTurns = 1;
            battle.logs.unshift(`💫 [${h.name}] bị sóng xung kích làm choáng!`);
          }

          if (h.hp <= 0) {
            h.isAlive = false;
            battle.logs.unshift(`💀 [${h.name}] đã gục ngã trước bão lửa ma thần!`);
          }
        });
      }
      // Skill B: Đoạt Mệnh Kết Liễu (Execute) vào mục tiêu yếu nhất
      else if (isEnraged && Math.random() < 0.40) {
        const weakest = [...livingHunters].sort((a, b) => a.hp - b.hp)[0];
        if (weakest) {
          let executeDmg = Math.max(25, Math.floor(effectiveBossAtk * 1.5 - (weakest.def * 0.2)));
          if (window.gameState?.researched?.tech_dungeon_dominance) executeDmg = Math.floor(executeDmg * 0.85);

          weakest.hp = Math.max(0, weakest.hp - executeDmg);
          battle.logs.unshift(`⚡ [TRẢM SÁT KẾT LIỄU!] ${boss.name} tung trọng kích hủy diệt vào [${weakest.name}] gây -${executeDmg} HP!`);
          if (weakest.hp <= 0) {
            weakest.isAlive = false;
            battle.logs.unshift(`💀 [${weakest.name}] đã bị trảm sát tử trận!`);
          }
        }
      }
      // Skill C: Đòn đánh đơn mục tiêu thông thường
      else {
        const target = livingHunters[Math.floor(Math.random() * livingHunters.length)];
        let targetDmg = Math.max(15, Math.floor(effectiveBossAtk - (target.def * 0.4)));
        if (window.gameState?.researched?.tech_dungeon_dominance) targetDmg = Math.floor(targetDmg * 0.85);

        target.hp = Math.max(0, target.hp - targetDmg);
        battle.logs.unshift(`⚔️ ${boss.name} tung đòn mãnh liệt trúng [${target.name}], gây -${targetDmg} HP!`);
        if (target.hp <= 0) {
          target.isAlive = false;
          battle.logs.unshift(`💀 [${target.name}] đã kiệt sức và ngã gục!`);
        }
      }
    }

    // 4. Kiểm tra thất bại hoặc hết giờ cuồng nộ
    const remainingHunters = battle.hunters.filter(h => h.isAlive && h.hp > 0);
    if (remainingHunters.length === 0) {
      this.handleDefeat(battle, "Toàn bộ đội hình thợ săn đã gục ngã trước sức mạnh khủng khiếp của Boss!");
    } else if (battle.timeLeft <= 0) {
      this.handleDefeat(battle, `Hết thời gian khiêu chiến (${battle.enrageSec}s)! Boss cuồng nộ thiêu rụi toàn bộ chiến trường!`);
    }

    // Trim logs
    if (battle.logs.length > 25) {
      battle.logs.length = 25;
    }

    // Update real-time hunter HP in actual game state
    battle.hunters.forEach(bh => {
      const actualH = (window.gameState.hunters || []).find(h => h.id === bh.id);
      if (actualH) {
        actualH.hp = Math.max(1, bh.hp);
      }
    });

    if (window.app) {
      window.app.renderDungeonTab();
    }
  }

  // Xử lý thắng trận
  static handleVictory(battle) {
    battle.state = 'VICTORY';
    const floor = battle.floor;
    const floorData = battle.floorData;
    const isFirstClear = !window.gameState.dungeonClearedFloors[floor];

    window.gameState.dungeonClearedFloors[floor] = true;
    if (floor > (window.gameState.dungeonMaxFloor || 0)) {
      window.gameState.dungeonMaxFloor = floor;
    }

    // Phân phát phần thưởng
    const reward = isFirstClear ? floorData.firstClear : floorData.farmReward;
    if (reward.gold) window.gameState.addGold(reward.gold);
    if (reward.gems) window.gameState.gems += reward.gems;
    
    let rewardText = `💰 +${reward.gold}g` + (reward.gems ? `, 💎 +${reward.gems} Ngọc` : '');

    if (reward.materials) {
      for (let [mKey, qty] of Object.entries(reward.materials)) {
        // Tech: Relic Harvest (+50% Breakthrough materials from Bosses)
        if (window.gameState?.researched?.tech_relic_harvest && mKey.startsWith('mat_')) {
          qty += Math.max(1, Math.floor(qty * 0.5));
        }
        window.gameState.addItem(mKey, qty);
        const matName = CONFIG.ITEMS[mKey]?.name || mKey;
        const icon = CONFIG.ITEMS[mKey]?.icon || '💎';
        rewardText += `, ${icon} +${qty}x ${matName}`;
      }
    }

    window.gameState.stats.dungeonBossesKilled = (window.gameState.stats.dungeonBossesKilled || 0) + 1;

    battle.logs.unshift(`🎉 [CHIẾN THẮNG HUY HOÀNG]: Đã tiêu diệt ${floorData.bossName}! Nhận thưởng: ${rewardText}`);
    window.logTicker.add(`🏆 [ĐẠI THẮNG HẦM NGỤC TẦNG ${floor}]: Tiêu diệt Boss [${floorData.bossName}]! (${rewardText})`, 'loot');

    if (window.soundFX) window.soundFX.playLevelUp();
    if (window.showToast) window.showToast(`Hạ gục Boss Tầng ${floor}! Nhận: ${rewardText}`, 'special', '🏆 CHIẾN THẮNG HẦM NGỤC');

    if (window.app) window.app.renderDungeonTab();
  }

  // Xử lý thua trận
  static handleDefeat(battle, reason) {
    battle.state = 'DEFEAT';
    battle.logs.unshift(`❌ [THẤT BẠI]: ${reason}`);
    window.logTicker.add(`💀 [THẤT BẠI HẦM NGỤC TẦNG ${battle.floor}]: Đội thợ săn buộc phải rút lui về thị trấn!`, 'danger');

    if (window.showToast) window.showToast(`Khiếu chiến Tầng ${battle.floor} thất bại! Hãy nâng cấp trang bị và thử lại.`, 'warning', '⚠️ RÚT LUI KHỎI HẦM NGỤC');

    if (window.app) window.app.renderDungeonTab();
  }

  // Rút lui khỏi Hầm Ngục
  static retreat() {
    window.gameState.dungeonActiveBattle = null;
    if (window.app) window.app.renderDungeonTab();
  }
}

window.DungeonSystem = DungeonSystem;
