// ═══════════════════════════════════════════════════════════
// DARK REALM TYCOON — Random Events System
// ═══════════════════════════════════════════════════════════

function checkRandomEvent() {
  if (gameState.eventPending) return; // Already have a pending event
  if (gameState.tickCount % 10 !== 0) return; // Check every 10 ticks

  for (const event of GAME_DATA.events) {
    if (Math.random() < event.chance) {
      triggerEvent(event);
      return; // Only one event per check
    }
  }
}

function triggerEvent(event) {
  // Filter options by conditions
  const availableOptions = event.options.filter(opt => {
    if (opt.condition) return opt.condition(gameState);
    return true;
  });

  if (availableOptions.length === 0) return;

  gameState.eventPending = {
    event: event,
    options: availableOptions,
  };

  addLog(`🎲 Sự kiện: ${event.icon} ${event.name}`, 'event');
}

function resolveEvent(optionIndex) {
  if (!gameState.eventPending) return;

  const { event, options } = gameState.eventPending;
  const option = options[optionIndex];

  if (!option) return;

  const result = option.effect(gameState);
  addLog(`  → ${result}`, 'event');

  gameState.eventPending = null;
  if (typeof renderUI === 'function') renderUI();
}

// ─── QUESTS ─────────────────────────────────────────────────
const QUEST_TEMPLATES = [
  {
    id: 'kill_slimes',
    name: 'Diệt Slime',
    desc: 'Giết 10 Slime',
    icon: '🟢',
    type: 'kill',
    target: 'slime',
    amount: 10,
    reward: { gold: 50, xp: 30 },
  },
  {
    id: 'kill_goblins',
    name: 'Trừ Cướp Goblin',
    desc: 'Giết 15 Goblin',
    icon: '👺',
    type: 'kill',
    target: 'goblin',
    amount: 15,
    reward: { gold: 80, xp: 50 },
  },
  {
    id: 'craft_weapon',
    name: 'Rèn Vũ Khí',
    desc: 'Chế tạo 3 vũ khí',
    icon: '⚔️',
    type: 'craft',
    target: 'weapon',
    amount: 3,
    reward: { gold: 100, gems: 5 },
  },
  {
    id: 'hire_hunter',
    name: 'Tuyển Dụng',
    desc: 'Thuê 2 Thợ Săn mới',
    icon: '👥',
    type: 'hire',
    target: 'any',
    amount: 2,
    reward: { gold: 120, gems: 8 },
  },
  {
    id: 'earn_gold',
    name: 'Kiếm Vàng',
    desc: 'Kiếm được 500 gold',
    icon: '💰',
    type: 'earn',
    target: 'gold',
    amount: 500,
    reward: { gold: 100, gems: 10 },
  },
  {
    id: 'level_up',
    name: 'Rèn Luyện',
    desc: 'Thợ Săn lên level 10 lần',
    icon: '⬆️',
    type: 'levelup',
    target: 'any',
    amount: 10,
    reward: { gold: 150, gems: 12 },
  },
  {
    id: 'kill_boss',
    name: 'Sát Thủ Boss',
    desc: 'Giết 3 boss',
    icon: '👹',
    type: 'kill_boss',
    target: 'any',
    amount: 3,
    reward: { gold: 300, gems: 20 },
  },
];

function generateQuest() {
  const template = QUEST_TEMPLATES[Math.floor(Math.random() * QUEST_TEMPLATES.length)];
  const quest = {
    ...template,
    id: template.id + '_' + Date.now(),
    progress: 0,
    completed: false,
    claimed: false,
    startedAt: gameState.day,
  };
  return quest;
}

function addQuest() {
  if (gameState.quests.active.length >= 3) {
    addLog('❌ Đã có 3 quest đang thực hiện!', 'error');
    return;
  }

  const quest = generateQuest();
  gameState.quests.active.push(quest);
  addLog(`📜 Quest mới: ${quest.icon} ${quest.name} — ${quest.desc}`, 'quest');
}

function updateQuestProgress(type, target, amount = 1) {
  gameState.quests.active.forEach(quest => {
    if (quest.completed || quest.claimed) return;

    if (quest.type === type) {
      if (quest.type === 'kill' && quest.target === target) {
        quest.progress += amount;
      } else if (quest.type === 'kill_boss') {
        quest.progress += amount;
      } else if (quest.type === 'craft' && target.includes(quest.target)) {
        quest.progress += amount;
      } else if (quest.type === 'hire') {
        quest.progress += amount;
      } else if (quest.type === 'earn') {
        quest.progress += amount;
      } else if (quest.type === 'levelup') {
        quest.progress += amount;
      }

      if (quest.progress >= quest.amount && !quest.completed) {
        quest.completed = true;
        addLog(`✅ Quest hoàn thành: ${quest.icon} ${quest.name}!`, 'success');
      }
    }
  });
}

function claimQuest(questId) {
  const quest = gameState.quests.active.find(q => q.id === questId);
  if (!quest || !quest.completed || quest.claimed) return;

  quest.claimed = true;

  // Give rewards
  if (quest.reward.gold) {
    gameState.gold += quest.reward.gold;
    gameState.stats.totalGoldEarned += quest.reward.gold;
  }
  if (quest.reward.gems) {
    gameState.gems += quest.reward.gems;
  }
  if (quest.reward.xp) {
    gameState.hunters.forEach(h => {
      if (h.alive) gainXp(h, quest.reward.xp);
    });
  }

  addLog(`🎁 Nhận phần thưởng: ${quest.icon} ${quest.name}`, 'success');
}
