// ═══════════════════════════════════════════════════════════
// DARK REALM TYCOON — Combat System
// ═══════════════════════════════════════════════════════════

// ─── COMBAT ENGINE ──────────────────────────────────────────
function runCombat(hunter, monster) {
  const hStats = getEffectiveStats(hunter);
  let hHp = hStats.hp;
  let mHp = monster.hp;

  const combatLog = [];
  let rounds = 0;
  const maxRounds = 20;

  while (hHp > 0 && mHp > 0 && rounds < maxRounds) {
    rounds++;

    // Hunter attacks
    const hDmg = calcDamage(hStats, monster.def, hStats.crit);
    mHp -= hDmg.damage;
    gameState.stats.totalDamageDealt += hDmg.damage;
    hunter.damageDealt += hDmg.damage;
    const hCritText = hDmg.isCrit ? ' 💥CHÍ MẠNG!' : '';
    combatLog.push(`${hunter.classIcon} ${hunter.name} tấn công ${monster.icon} ${monster.name}: -${hDmg.damage} HP${hCritText}`);

    // Use skill chance (20% per round)
    if (hunter.skills.length > 0 && Math.random() < 0.2) {
      const skillIdx = Math.floor(Math.random() * hunter.skills.length);
      const skill = useSkill(hunter, skillIdx);
      if (skill) {
        const skillResult = applySkill(hunter, monster, skill, hStats);
        mHp -= skillResult.damage;
        combatLog.push(`  🌀 ${skill.name}: -${skillResult.damage} HP ${skillResult.message || ''}`);
      }
    }

    if (mHp <= 0) {
      combatLog.push(`${monster.icon} ${monster.name} bị tiêu diệt!`);
      break;
    }

    // Monster attacks
    const mDmg = calcDamage({ atk: monster.atk, crit: 3 }, hStats.def, 3);
    hHp -= mDmg.damage;
    hunter.damageTaken += mDmg.damage;
    combatLog.push(`${monster.icon} ${monster.name} tấn công: -${mDmg.damage} HP`);

    if (hHp <= 0) {
      combatLog.push(`${hunter.classIcon} ${hunter.name} ngã xuống!`);
      break;
    }
  }

  // Determine result
  const victory = mHp <= 0;

  // Update hunter HP
  if (victory) {
    hunter.hp = Math.max(1, hHp);
  } else {
    hunter.hp = Math.max(0, hHp);
  }

  // Process skill cooldowns
  processSkillCooldowns(hunter);

  // Log combat for important fights (boss, near-death)
  if (monster.isBoss || !victory) {
    combatLog.forEach(log => addLog(`  ⚔️ ${log}`, victory ? 'combat' : 'warning'));
  }

  return {
    victory,
    damageDealt: hStats.hp - hHp > 0 ? hStats.hp - hHp : 0,
    rounds,
    log: combatLog,
  };
}

// ─── DAMAGE CALCULATION ────────────────────────────────────
function calcDamage(attacker, defenderDef, critChance) {
  const baseDmg = attacker.atk;
  const defense = defenderDef;

  // Base damage formula: ATK * (100 / (100 + DEF))
  let damage = Math.max(1, Math.floor(baseDmg * (100 / (100 + defense))));

  // Add randomness ±20%
  const variance = 0.8 + Math.random() * 0.4;
  damage = Math.floor(damage * variance);

  // Critical hit
  const isCrit = Math.random() * 100 < critChance;
  if (isCrit) {
    damage = Math.floor(damage * 1.8);
  }

  return { damage: Math.max(1, damage), isCrit };
}

// ─── SKILL APPLICATION ─────────────────────────────────────
function applySkill(hunter, monster, skill, hStats) {
  let damage = 0;
  let message = '';

  switch (skill.type) {
    case 'multi_hit':
      // Two hits
      damage = Math.floor(hStats.atk * skill.power * 2);
      damage = Math.floor(damage * (0.8 + Math.random() * 0.4));
      message = '(2 đòn)';
      break;

    case 'heavy_strike':
      damage = Math.floor(hStats.atk * skill.power);
      damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
      break;

    case 'aoe':
    case 'aoe_heavy':
      damage = Math.floor(hStats.atk * skill.power);
      damage = Math.floor(damage * (0.8 + Math.random() * 0.4));
      message = '(Diện rộng)';
      break;

    case 'armor_pierce':
      damage = Math.floor(hStats.atk * skill.power);
      // Ignore 30% defense
      damage = Math.floor(damage * 1.3);
      break;

    case 'dot':
      damage = Math.floor(hStats.atk * skill.power);
      message = '(DOT 3 turn)';
      // Simulate DOT as instant damage
      damage = Math.floor(damage * 2.5);
      break;

    case 'freeze':
      damage = Math.floor(hStats.atk * skill.power);
      message = '(Đóng băng!)';
      break;

    case 'guaranteed_crit':
      damage = Math.floor(hStats.atk * skill.power);
      damage = Math.floor(damage * 1.8);
      message = '(CRITICAL!)';
      break;

    case 'ultimate':
      damage = Math.floor(hStats.atk * skill.power);
      damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
      message = '(HỦY DIỆT!)';
      break;

    case 'buff_atk':
      // Self buff
      hunter.activePotions = hunter.activePotions || [];
      hunter.activePotions.push({ stat: 'atk', percent: skill.power * 100, ticksLeft: 3 });
      damage = 0;
      message = `(+${skill.power * 100}% ATK)`;
      break;

    case 'heal':
      const healAmt = Math.floor(hunter.maxHp * skill.power);
      hunter.hp = Math.min(hunter.maxHp, hunter.hp + healAmt);
      damage = 0;
      message = `(+${healAmt} HP)`;
      break;

    case 'defense':
    case 'taunt':
    case 'protect':
      damage = 0;
      message = '(Buff phòng thủ)';
      break;

    default:
      damage = Math.floor(hStats.atk * skill.power);
      break;
  }

  return { damage: Math.max(0, damage), message };
}

// ─── COMBAT SUMMARY (for UI) ───────────────────────────────
function getCombatSummary() {
  if (!gameState || !gameState.hunters) return null;

  const hunting = gameState.hunters.filter(h => h.state === 'hunting' && h.alive);
  const resting = gameState.hunters.filter(h => h.state === 'resting' && h.alive);
  const dead = gameState.hunters.filter(h => !h.alive);
  const recovering = gameState.hunters.filter(h => h.state === 'recovering' && h.alive);

  return {
    hunting: hunting.length,
    resting: resting.length,
    recovering: recovering.length,
    dead: dead.length,
    total: gameState.hunters.length,
  };
}

// ─── BOSS CHALLENGE ─────────────────────────────────────────
function challengeBoss() {
  const zone = GAME_DATA.zones[gameState.currentZone];
  if (!zone || !zone.boss) {
    addLog('❌ Không có boss trong zone này!', 'error');
    return;
  }

  const bossData = GAME_DATA.monsters[zone.boss];
  if (!bossData) return;

  const difficultyScale = 1 + zone.difficulty * 0.3;
  const boss = {
    ...bossData,
    hp: Math.floor(bossData.hp * difficultyScale),
    maxHp: Math.floor(bossData.hp * difficultyScale),
    atk: Math.floor(bossData.atk * difficultyScale),
    def: Math.floor(bossData.def * difficultyScale),
    isBoss: true,
  };

  addLog(`👹 BOSS ${boss.icon} ${boss.name} xuất hiện!`, 'epic');

  // All hunting hunters fight the boss together
  const fighters = gameState.hunters.filter(h => h.alive && h.state === 'hunting');
  if (fighters.length === 0) {
    addLog('❌ Không có Thợ Săn nào đang săn!', 'error');
    return;
  }

  let bossHp = boss.hp;
  let totalDamage = 0;

  fighters.forEach(hunter => {
    if (bossHp <= 0) return;
    const hStats = getEffectiveStats(hunter);
    const dmg = calcDamage(hStats, boss.def, hStats.crit);
    bossHp -= dmg.damage;
    totalDamage += dmg.damage;
    hunter.damageDealt += dmg.damage;
    gameState.stats.totalDamageDealt += dmg.damage;

    // Boss hits back
    const bossDmg = calcDamage({ atk: boss.atk, crit: 5 }, hStats.def, 5);
    hunter.hp -= bossDmg.damage;
    hunter.damageTaken += bossDmg.damage;

    if (hunter.hp <= 0) {
      hunterDeath(hunter);
    }
  });

  if (bossHp <= 0) {
    // Victory!
    const xpReward = Math.floor(boss.xp / fighters.length);
    const goldReward = Math.floor(boss.gold / fighters.length);

    fighters.forEach(h => {
      if (h.alive) {
        gainXp(h, xpReward);
        h.hp = Math.max(1, h.hp);
      }
    });

    gameState.gold += boss.gold;
    gameState.stats.totalGoldEarned += boss.gold;
    gameState.stats.bossKills++;
    gameState.stats.totalKills++;

    // Boss drops
    if (boss.drops) {
      boss.drops.forEach(d => {
        const count = Math.floor(Math.random() * 3) + 1;
        gameState.inventory[d] = (gameState.inventory[d] || 0) + count;
      });
    }

    addLog(`🎉 Đánh bại BOSS ${boss.name}! +${boss.gold} gold, +${xpReward} XP mỗi người!`, 'epic');
  } else {
    addLog(`💀 Không đánh bại được BOSS. Boss còn ${formatNumber(bossHp)} HP.`, 'warning');
  }
}
