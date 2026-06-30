// ═══════════════════════════════════════════════════════════
// DARK REALM TYCOON — Hunter Management System
// ═══════════════════════════════════════════════════════════

function createHunter(name, classId) {
  const cls = GAME_DATA.classes[classId];
  if (!cls) return null;

  const hunter = {
    id: 'h_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    name: name,
    classId: classId,
    className: cls.name,
    classIcon: cls.icon,
    level: 1,
    xp: 0,
    xpToNext: 20,
    alive: true,
    state: 'resting', // resting, hunting, dead, recovering
    reincarnationCount: 0,

    // Base stats
    hp: cls.baseStats.hp,
    maxHp: cls.baseStats.hp,
    atk: cls.baseStats.atk,
    def: cls.baseStats.def,
    spd: cls.baseStats.spd,
    crit: cls.baseStats.crit,

    // Equipment
    equipment: {
      weapon: null,
      armor: null,
      helmet: null,
      boots: null,
      accessory: null,
    },

    // Potions
    potions: {
      heal: 0,
    },
    activePotions: [],

    // Skills (unlocked by level)
    skills: [],
    skillCooldowns: {},

    // Status
    fed: false,
    foodBuff: null,
    mood: 100, // 0-100, affects performance

    // Stats
    kills: 0,
    damageDealt: 0,
    damageTaken: 0,
    deaths: 0,
  };

  return hunter;
}

// ─── HUNTER PROCESSING (per tick) ──────────────────────────
function processHunters() {
  if (!gameState || !gameState.hunters) return;

  gameState.hunters.forEach(hunter => {
    if (!hunter.alive) {
      // Dead hunter — try to revive
      reviveHunter(hunter);
      return;
    }

    switch (hunter.state) {
      case 'hunting':
        processHunting(hunter);
        break;
      case 'resting':
        processResting(hunter);
        break;
      case 'recovering':
        processRecovery(hunter);
        break;
    }

    // Update mood
    updateHunterMood(hunter);

    // Unlock skills based on level
    unlockSkills(hunter);
  });

  // Remove dead hunters that have been dead too long (optional: keep for resurrection)
  // gameState.hunters = gameState.hunters.filter(h => h.alive || h.state !== 'dead');
}

function processHunting(hunter) {
  const zone = GAME_DATA.zones[gameState.currentZone];
  if (!zone) return;

  // Spawn monster(s) based on mob density
  const monsterCount = Math.min(gameState.mobDensity, 3);
  for (let i = 0; i < monsterCount; i++) {
    if (!hunter.alive) break;

    // Pick random monster from zone
    const monsterIds = zone.monsters;
    const monsterId = monsterIds[Math.floor(Math.random() * monsterIds.length)];
    const monsterData = GAME_DATA.monsters[monsterId];

    if (!monsterData) continue;

    // Scale monster with difficulty
    const difficultyScale = 1 + zone.difficulty * 0.3;
    const monster = {
      ...monsterData,
      hp: Math.floor(monsterData.hp * difficultyScale),
      maxHp: Math.floor(monsterData.hp * difficultyScale),
      atk: Math.floor(monsterData.atk * difficultyScale),
      def: Math.floor(monsterData.def * difficultyScale),
    };

    // Run combat
    if (typeof runCombat === 'function') {
      const result = runCombat(hunter, monster);
      if (result.victory) {
        // Gain XP and gold
        const xpGain = Math.floor(monster.xp * (1 + hunter.level * 0.05));
        const goldGain = Math.floor(monster.gold * (1 + gameState.buildings.restaurant * 0.1));

        gainXp(hunter, xpGain);
        gameState.gold += goldGain;
        gameState.stats.totalGoldEarned += goldGain;
        gameState.stats.totalKills++;
        hunter.kills++;

        // Drop materials
        if (monster.drops && Math.random() < zone.baseDropRate) {
          const dropId = monster.drops[Math.floor(Math.random() * monster.drops.length)];
          gameState.inventory[dropId] = (gameState.inventory[dropId] || 0) + 1;
        }

        // Boss kill
        if (monster.isBoss) {
          gameState.stats.bossKills++;
          addLog(`👹 ${hunter.classIcon} ${hunter.name} đã tiêu diệt BOSS ${monster.name}!`, 'epic');
          // Extra drops for boss
          if (monster.drops) {
            monster.drops.forEach(d => {
              gameState.inventory[d] = (gameState.inventory[d] || 0) + Math.floor(Math.random() * 2) + 1;
            });
          }
        }

        // Check if hunter needs healing
        if (hunter.hp < hunter.maxHp * 0.3) {
          // Try to use potion
          if (hunter.potions.heal > 0) {
            useHealPotion(hunter);
          } else {
            hunter.state = 'resting';
            addLog(`😴 ${hunter.classIcon} ${hunter.name} về nhà nghỉ ngơi (HP thấp)`, 'info');
          }
        }
      } else {
        // Defeated — retreat
        hunter.hp = Math.max(1, hunter.hp);
        hunter.state = 'resting';
        hunter.mood = Math.max(0, hunter.mood - 15);
        addLog(`💀 ${hunter.classIcon} ${hunter.name} bị thương nặng, rút lui!`, 'warning');
      }
    }
  }

  // Check death
  if (hunter.hp <= 0) {
    hunterDeath(hunter);
  }
}

function processResting(hunter) {
  const innLevel = gameState.buildings.inn;
  if (innLevel <= 0) {
    // No inn — very slow recovery
    hunter.hp = Math.min(hunter.maxHp, hunter.hp + 1);
  } else {
    const innData = GAME_DATA.buildings.inn.effects(innLevel);
    const healAmount = Math.floor(hunter.maxHp * innData.healRate / 100);
    hunter.hp = Math.min(hunter.maxHp, hunter.hp + healAmount);
  }

  // Restore mood
  hunter.mood = Math.min(100, hunter.mood + 2);

  // Auto-start hunting when healed
  if (hunter.hp >= hunter.maxHp * 0.8) {
    hunter.state = 'hunting';
  }
}

function processRecovery(hunter) {
  // Same as resting but for post-revival
  processResting(hunter);
}

function reviveHunter(hunter) {
  if (hunter.state !== 'dead') return;
  const reviveCost = Math.floor(50 * Math.pow(1.5, hunter.level));
  if (gameState.gold >= reviveCost) {
    gameState.gold -= reviveCost;
    hunter.alive = true;
    hunter.hp = Math.floor(hunter.maxHp * 0.5);
    hunter.state = 'recovering';
    hunter.mood = 30;
    addLog(`💖 ${hunter.classIcon} ${hunter.name} được hồi sinh! (-${reviveCost} gold)`, 'success');
  }
}

function hunterDeath(hunter) {
  hunter.alive = false;
  hunter.state = 'dead';
  hunter.hp = 0;
  hunter.deaths++;
  hunter.mood = 0;
  addLog(`☠️ ${hunter.classIcon} ${hunter.name} đã hy sinh! (cần ${formatNumber(Math.floor(50 * Math.pow(1.5, hunter.level)))} gold để hồi sinh)`, 'error');
}

// ─── XP & LEVELING ─────────────────────────────────────────
function gainXp(hunter, amount) {
  // Apply global buffs
  let finalAmount = amount;
  if (gameState.globalBuffs) {
    gameState.globalBuffs.forEach(b => {
      if (b.stat === 'xp') finalAmount = Math.floor(finalAmount * (1 + b.percent / 100));
    });
  }

  hunter.xp += finalAmount;

  while (hunter.xp >= hunter.xpToNext && hunter.level < 100) {
    hunter.xp -= hunter.xpToNext;
    levelUp(hunter);
  }

  if (hunter.level >= 100) {
    hunter.xp = 0;
    hunter.xpToNext = Infinity;
  }
}

function levelUp(hunter) {
  const cls = GAME_DATA.classes[hunter.classId];
  hunter.level++;

  // Apply growth stats
  hunter.maxHp += cls.growthPerLevel.hp;
  hunter.hp = Math.min(hunter.hp + cls.growthPerLevel.hp, hunter.maxHp);
  hunter.atk += cls.growthPerLevel.atk;
  hunter.def += cls.growthPerLevel.def;
  hunter.spd += cls.growthPerLevel.spd;
  hunter.crit += cls.growthPerLevel.crit;

  // XP to next level increases
  hunter.xpToNext = Math.floor(20 + hunter.level * 10 + hunter.level * hunter.level * 0.5);

  addLog(`⬆️ ${hunter.classIcon} ${hunter.name} lên Lv.${hunter.level}!`, 'success');
}

// ─── SKILLS ─────────────────────────────────────────────────
function unlockSkills(hunter) {
  const cls = GAME_DATA.classes[hunter.classId];
  cls.skills.forEach(skill => {
    if (hunter.level >= skill.level && !hunter.skills.find(s => s.name === skill.name)) {
      hunter.skills.push({ ...skill });
      addLog(`🆕 ${hunter.classIcon} ${hunter.name} học kỹ năng: ${skill.name}!`, 'skill');
    }
  });
}

function useSkill(hunter, skillIndex) {
  const skill = hunter.skills[skillIndex];
  if (!skill) return null;

  const cooldown = hunter.skillCooldowns[skill.name] || 0;
  if (cooldown > 0) return null;

  // Set cooldown
  hunter.skillCooldowns[skill.name] = skill.cooldown;
  return skill;
}

function processSkillCooldowns(hunter) {
  for (const key in hunter.skillCooldowns) {
    if (hunter.skillCooldowns[key] > 0) {
      hunter.skillCooldowns[key]--;
    }
  }
}

// ─── MOOD ───────────────────────────────────────────────────
function updateHunterMood(hunter) {
  if (hunter.state === 'hunting') {
    // Mood decreases while hunting
    hunter.mood = Math.max(0, hunter.mood - 0.5);

    // Food buff helps
    if (hunter.fed) {
      hunter.mood = Math.min(100, hunter.mood + 0.3);
    }

    // Low HP reduces mood
    if (hunter.hp < hunter.maxHp * 0.3) {
      hunter.mood = Math.max(0, hunter.mood - 1);
    }
  }
}

// ─── POTIONS ────────────────────────────────────────────────
function useHealPotion(hunter) {
  if (hunter.potions.heal <= 0) return;

  hunter.potions.heal--;
  const healAmount = Math.floor(hunter.maxHp * 0.3);
  hunter.hp = Math.min(hunter.maxHp, hunter.hp + healAmount);
  addLog(`🧪 ${hunter.classIcon} ${hunter.name} sử dụng bình máu! (+${healAmount} HP)`, 'info');
}

function givePotion(hunter, potionId, count = 1) {
  if (potionId === 'small_hp_potion' || potionId === 'medium_hp_potion' || potionId === 'large_hp_potion') {
    hunter.potions.heal += count;
  }
}

// ─── EQUIPMENT ──────────────────────────────────────────────
function equipItem(hunter, equipmentId) {
  const item = gameState.equipment.find(e => e.id === equipmentId);
  if (!item) return false;

  const slot = item.slot;
  const currentEquip = hunter.equipment[slot];

  // Unequip current
  if (currentEquip) {
    gameState.equipment.push(currentEquip);
  }

  // Equip new
  hunter.equipment[slot] = item;
  gameState.equipment = gameState.equipment.filter(e => e.id !== equipmentId);

  // Recalculate stats
  recalcHunterStats(hunter);

  addLog(`⚔️ ${hunter.classIcon} ${hunter.name} trang bị ${item.icon} ${item.name}!`, 'info');
  return true;
}

function unequipItem(hunter, slot) {
  const item = hunter.equipment[slot];
  if (!item) return false;

  gameState.equipment.push(item);
  hunter.equipment[slot] = null;
  recalcHunterStats(hunter);
  addLog(`📤 ${hunter.classIcon} ${hunter.name} tháo ${item.icon} ${item.name}`, 'info');
  return true;
}

function recalcHunterStats(hunter) {
  const cls = GAME_DATA.classes[hunter.classId];

  // Reset to base + level growth
  hunter.maxHp = cls.baseStats.hp + cls.growthPerLevel.hp * (hunter.level - 1);
  hunter.atk = cls.baseStats.atk + cls.growthPerLevel.atk * (hunter.level - 1);
  hunter.def = cls.baseStats.def + cls.growthPerLevel.def * (hunter.level - 1);
  hunter.spd = cls.baseStats.spd + cls.growthPerLevel.spd * (hunter.level - 1);
  hunter.crit = cls.baseStats.crit + cls.growthPerLevel.crit * (hunter.level - 1);

  // Add equipment stats
  for (const slot in hunter.equipment) {
    const item = hunter.equipment[slot];
    if (!item) continue;
    if (item.atk) hunter.atk += item.atk;
    if (item.def) hunter.def += item.def;
    if (item.hp) hunter.maxHp += item.hp;
    if (item.spd) hunter.spd += item.spd;
    if (item.crit) hunter.crit += item.crit;
  }

  // Reincarnation bonus
  const reincBonus = 1 + hunter.reincarnationCount * 0.1;
  hunter.maxHp = Math.floor(hunter.maxHp * reincBonus);
  hunter.atk = Math.floor(hunter.atk * reincBonus);
  hunter.def = Math.floor(hunter.def * reincBonus);

  // Cap HP
  hunter.hp = Math.min(hunter.hp, hunter.maxHp);
}

// ─── REINCARNATION ──────────────────────────────────────────
function reincarnateHunter(hunterId) {
  const templeLevel = gameState.buildings.temple;
  if (templeLevel <= 0) {
    addLog('❌ Cần nâng cấp Đền Thờ!', 'error');
    return;
  }

  const hunter = gameState.hunters.find(h => h.id === hunterId);
  if (!hunter) return;
  if (hunter.level < 50) {
    addLog('❌ Thợ Săn cần tối thiểu level 50 để tái sinh!', 'error');
    return;
  }

  const templeData = GAME_DATA.buildings.temple.effects(templeLevel);
  if (hunter.reincarnationCount >= templeData.maxReincarnation) {
    addLog(`❌ ${hunter.name} đã tái sinh tối đa ${templeData.maxReincarnation} lần!`, 'error');
    return;
  }

  hunter.reincarnationCount++;

  // Reset level and stats but keep reincarnation bonus
  const name = hunter.name;
  const classId = hunter.classId;
  const reincCount = hunter.reincarnationCount;

  // Recreate hunter
  const newHunter = createHunter(name, classId);
  newHunter.reincarnationCount = reincCount;

  // Replace
  const idx = gameState.hunters.findIndex(h => h.id === hunterId);
  gameState.hunters[idx] = newHunter;

  gameState.stats.totalReincarnations++;
  addLog(`♻️ ${newHunter.classIcon} ${name} tái sinh lần ${reincCount}! (Bonus: +${reincCount * 10}% stats)`, 'epic');
}

// ─── HIRE HUNTER ────────────────────────────────────────────
function hireHunter(classId) {
  const maxHunters = getMaxHunters();
  if (gameState.hunters.length >= maxHunters) {
    addLog('❌ Đã đạt số lượng Thợ Săn tối đa! Nâng cấp Nhà Làng.', 'error');
    return false;
  }

  const guildLevel = gameState.buildings.guildBoard || 0;
  const hireCost = Math.max(10, 80 - guildLevel * 10);

  if (gameState.gold < hireCost) {
    addLog(`❌ Không đủ gold để thuê! Cần ${hireCost} gold.`, 'error');
    return false;
  }

  gameState.gold -= hireCost;
  const name = GAME_DATA.hunterNames[Math.floor(Math.random() * GAME_DATA.hunterNames.length)];
  const hunter = createHunter(name, classId);
  if (hunter) {
    hunter.state = 'resting';
    gameState.hunters.push(hunter);
    gameState.stats.totalHuntersHired++;
    addLog(`👥 Thuê thành công ${hunter.classIcon} ${name} (${hunter.className})!`, 'success');
    return true;
  }
  return false;
}

function dismissHunter(hunterId) {
  const idx = gameState.hunters.findIndex(h => h.id === hunterId);
  if (idx === -1) return;
  const hunter = gameState.hunters[idx];
  gameState.hunters.splice(idx, 1);
  addLog(`👋 ${hunter.classIcon} ${hunter.name} rời đi.`, 'info');
}

// ─── GET EFFECTIVE STATS ────────────────────────────────────
function getEffectiveStats(hunter) {
  let stats = {
    hp: hunter.maxHp,
    atk: hunter.atk,
    def: hunter.def,
    spd: hunter.spd,
    crit: hunter.crit,
  };

  // Food buff
  if (hunter.foodBuff) {
    stats[hunter.foodBuff.stat] = Math.floor(stats[hunter.foodBuff.stat] * (1 + hunter.foodBuff.percent / 100));
  }

  // Active potions
  if (hunter.activePotions) {
    hunter.activePotions.forEach(p => {
      stats[p.stat] = Math.floor(stats[p.stat] * (1 + p.percent / 100));
    });
  }

  // Global buffs
  if (gameState.globalBuffs) {
    gameState.globalBuffs.forEach(b => {
      if (stats[b.stat] !== undefined) {
        stats[b.stat] = Math.floor(stats[b.stat] * (1 + b.percent / 100));
      }
    });
  }

  // Mood modifier
  const moodModifier = 0.7 + (hunter.mood / 100) * 0.3;
  stats.atk = Math.floor(stats.atk * moodModifier);
  stats.spd = Math.floor(stats.spd * moodModifier);

  return stats;
}
