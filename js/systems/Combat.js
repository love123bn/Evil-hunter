/**
 * TOWN OF HUNTERS - COMBAT SYSTEM & BATTLE LOGIC
 */

class CombatSystem {
  static performAttack(hunter, monster) {
    if (!hunter || !monster || monster.hp <= 0) return;

    // Hunter attacks monster
    let hunterAtk = hunter.getTotalAtk();
    
    // Tech: Dragon Hunter (+40% DMG vs high level monsters)
    if (window.gameState.researched?.tech_dragon_hunter && (monster.templateId === 'm_young_dragon' || monster.templateId === 'm_dragon_warrior' || monster.templateId === 'm_dragon' || monster.templateId === 'm_elder_dragon')) {
      hunterAtk = Math.floor(hunterAtk * 1.4);
    }
    // Tech: Demon Slayer Aura (+50% DMG vs Malakor Boss)
    if (window.gameState.researched?.tech_demon_slayer_aura && monster.templateId === 'm_boss_demon') {
      hunterAtk = Math.floor(hunterAtk * 1.5);
    }

    const critChance = hunter.getCritRate ? hunter.getCritRate() : 0.15;
    const critMul = hunter.getCritDamage ? hunter.getCritDamage() : 1.8;

    const isCrit = Math.random() < critChance;
    let dmgToMonster = Math.max(1, hunterAtk - monster.def);
    if (isCrit) dmgToMonster = Math.floor(dmgToMonster * critMul);

    const monsterDied = monster.takeDamage(dmgToMonster);

    // Trigger visual float FX
    if (window.renderer) {
      window.renderer.spawnCombatFloat(`-${dmgToMonster}${isCrit ? ' CRIT!' : ''}`, monster.x, monster.y);
    }

    if (monsterDied) {
      CombatSystem.handleMonsterDeath(hunter, monster);
      return;
    }

    // Monster counter-attacks hunter
    const monsterAtk = monster.atk;
    const dmgToHunter = Math.max(1, monsterAtk - hunter.getTotalDef());
    hunter.hp = Math.max(0, hunter.hp - dmgToHunter);

    // Tech: Phoenix Rebirth (Revive 50% HP once per excursion)
    if (hunter.hp <= 0 && window.gameState.researched?.tech_phoenix_rebirth && !hunter.phoenixUsed) {
      hunter.phoenixUsed = true;
      hunter.hp = Math.floor(hunter.maxHp * 0.5);
      window.logTicker.add(`🔥 [HỒI SINH PHƯỢNG HOÀNG]: [${hunter.name}] bộc phát chân hỏa, hồi sinh 50% Máu tiếp tục chiến đấu!`, 'loot');
    }
  }

  static handleMonsterDeath(hunter, monster) {
    window.gameState.stats.monstersKilled++;
    
    // Hunter gains EXP and Gold (With Tech Bonuses)
    let expEarned = monster.exp;
    if (window.gameState.researched?.tech_void_tracker) expEarned = Math.floor(expEarned * 1.5);
    hunter.gainExp(expEarned);

    let goldEarned = monster.gold;
    if (window.gameState.researched?.tech_gold_merchant) goldEarned = Math.floor(goldEarned * 1.25);
    hunter.gold += goldEarned;

    // Reset phoenix used status when killing monster
    hunter.phoenixUsed = false;

    // Check Bounty Quests (Kill type)
    window.gameState.bounties.forEach(b => {
      if (!b.completed && b.type === 'kill' && (b.target === monster.templateId || b.target === monster.id)) {
        b.current = Math.min(b.count, b.current + 1);
        if (b.current >= b.count) {
          b.completed = true;
          window.logTicker.add(`📜 [HOÀN THÀNH QUEST]: [${b.title}] đã xong! Hãy vào Bảng Treo Thưởng nhận quà!`, 'loot');
        }
      }
    });

    // Golden Elite Monster Kill Reward (Gems 💠 + Extra Gold)
    if (monster.isElite) {
      const eliteGems = Math.floor(Math.random() * 2) + 1; // 1 to 2 gems
      window.gameState.gems += eliteGems;
      window.logTicker.add(`👑✨ [ĐỒ SÁT QUÁI HOÀNG KIM]: [${hunter.name}] đã hạ gục [${monster.name}]! Thợ săn nhận +${goldEarned}g (x5 Vàng) và thưởng ngay +${eliteGems} 💠 Ngọc Triệu Hồi cho Thị Trấn!`, 'special');
      if (window.soundFX) window.soundFX.playLevelUp();
    }
    // Boss Kill Chance to drop Gems 💎
    else if (monster.templateId === 'm_dragon' || monster.templateId === 'm_boss_demon') {
      const bossGems = monster.templateId === 'm_boss_demon' ? 5 : 2;
      window.gameState.gems += bossGems;
      window.logTicker.add(`💎 HUYỀN THOẠI: Hạ gục Boss ${monster.name}! Nhận ngay +${bossGems} 💠 Ngọc Triệu Hồi!`, 'loot');
      if (window.soundFX) window.soundFX.playLevelUp();
    }

    // Loot Drop (With Tech Eagle Eye bonus)
    let dropChance = monster.lootChance || 0.5;
    if (window.gameState.researched?.tech_eagle_eye) dropChance = Math.min(1.0, dropChance * 1.35);

    if (monster.loot && Math.random() < dropChance) {
      hunter.bag.push(monster.loot);
      const itemData = CONFIG.ITEMS[monster.loot];
      const itemName = itemData ? itemData.name : monster.loot;
      window.logTicker.add(`⚔️ [${hunter.name}] hạ gục [${monster.name}], nhặt được [${itemName}]!`, 'combat');

      // Check Bounty Quests (Collect type)
      window.gameState.bounties.forEach(b => {
        if (!b.completed && b.type === 'collect' && b.target === monster.loot) {
          b.current = Math.min(b.count, b.current + 1);
          if (b.current >= b.count) {
            b.completed = true;
            window.logTicker.add(`📜 [HOÀN THÀNH QUEST]: [${b.title}] đã xong! Nhận thưởng ngay!`, 'loot');
          }
        }
      });
    } else {
      window.logTicker.add(`⚔️ [${hunter.name}] tiêu diệt [${monster.name}] (+${expEarned} EXP, +${goldEarned}g)`, 'combat');
    }

    // Respawn monster in zone after delay
    const zone = CONFIG.ZONES.find(z => z.id === window.gameState.currentZoneId) || CONFIG.ZONES[0];
    const diff = CONFIG.DIFFICULTIES.find(d => d.id === window.gameState.currentDifficulty) || CONFIG.DIFFICULTIES[0];
    const template = zone.monsters[Math.floor(Math.random() * zone.monsters.length)];
    
    // Replace dead monster
    const idx = window.gameState.monsters.indexOf(monster);
    if (idx !== -1) {
      setTimeout(() => {
        window.gameState.monsters[idx] = new Monster(template, diff);
      }, 1500);
    }
  }
}

window.CombatSystem = CombatSystem;
