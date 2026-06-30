// ═══════════════════════════════════════════════════════════
// DARK REALM TYCOON — Core Game Engine
// ═══════════════════════════════════════════════════════════

const SAVE_KEY = 'dark_realm_tycoon_save';
const TICK_INTERVAL = 1500; // ms per tick
const MAX_LOG_ENTRIES = 80;

// ─── GAME STATE ─────────────────────────────────────────────
let gameState = null;
let gameTick = null;
let isPaused = false;
let currentScreen = 'main';

function createNewGame() {
  return {
    day: 1,
    tickCount: 0,
    gold: 100,
    gems: 10,
    elementals: 0,

    buildings: {
      townhall: 1,
      inn: 1,
      restaurant: 0,
      blacksmith: 0,
      alchemist: 0,
      jeweler: 0,
      temple: 0,
      guildBoard: 0,
    },

    hunters: [],
    currentZone: 'normal',
    mobDensity: 5, // 1-10

    inventory: {},   // { materialId: count }
    equipment: [],   // crafted equipment waiting to be assigned
    potions: {},     // { potionId: count }

    globalBuffs: [], // [{ stat, percent, ticksLeft }]

    quests: {
      active: [],
      completed: [],
    },

    stats: {
      totalGoldEarned: 0,
      totalKills: 0,
      bossKills: 0,
      totalCrafts: 0,
      totalReincarnations: 0,
      totalHuntersHired: 0,
      totalDamageDealt: 0,
      daysPlayed: 0,
    },

    achievements: [],
    log: [],
    eventPending: null,
  };
}

// ─── INITIALIZATION ─────────────────────────────────────────
function initGame() {
  const saved = localStorage.getItem(SAVE_KEY);
  if (saved) {
    try {
      gameState = JSON.parse(saved);
      addLog('💾 Đã tải dữ liệu lưu trữ!', 'system');
    } catch (e) {
      gameState = createNewGame();
      addLog('⚔️ Chào mừng đến Dark Realm Tycoon!', 'system');
    }
  } else {
    gameState = createNewGame();
    addLog('⚔️ Chào mừng đến Dark Realm Tycoon!', 'system');
    addLog('Bạn là Trưởng Làng mới. Hãy xây dựng làng và tuyển Thợ Săn!', 'info');
    addLog('💡 Nhấn vào các nút bên dưới để bắt đầu.', 'hint');
  }

  if (typeof renderUI === 'function') renderUI();
  startGameLoop();
}

// ─── GAME LOOP ──────────────────────────────────────────────
function startGameLoop() {
  if (gameTick) clearInterval(gameTick);
  gameTick = setInterval(() => {
    if (!isPaused) {
      processTick();
      gameState.tickCount++;
      if (gameState.tickCount % 20 === 0) {
        gameState.day++;
        gameState.stats.daysPlayed++;
      }
      saveGame();
      if (typeof renderUI === 'function') renderUI();
    }
  }, TICK_INTERVAL);
}

function processTick() {
  // 1. Process hunters (idle combat + recovery)
  if (typeof processHunters === 'function') processHunters();

  // 2. Process global buffs
  processBuffs();

  // 3. Process potions
  processPotions();

  // 4. Check random events
  if (typeof checkRandomEvent === 'function') checkRandomEvent();

  // 5. Process food consumption
  processFood();

  // 6. Check achievements
  checkAchievements();
}

// ─── BUFFS ──────────────────────────────────────────────────
function processBuffs() {
  if (!gameState.globalBuffs) return;
  gameState.globalBuffs = gameState.globalBuffs.filter(b => {
    b.ticksLeft--;
    return b.ticksLeft > 0;
  });
}

function processPotions() {
  if (!gameState.hunters) return;
  gameState.hunters.forEach(h => {
    if (!h.alive) return;
    if (h.activePotions) {
      h.activePotions = h.activePotions.filter(p => {
        p.ticksLeft--;
        return p.ticksLeft > 0;
      });
    }
  });
}

// ─── FOOD CONSUMPTION ───────────────────────────────────────
function processFood() {
  if (gameState.buildings.restaurant <= 0) return;
  const hunters = gameState.hunters.filter(h => h.alive);
  const foodPerTick = hunters.length;
  if (gameState.potions['tiny_herb'] && gameState.potions['tiny_herb'] >= foodPerTick) {
    gameState.potions['tiny_herb'] -= foodPerTick;
    // Buff hunters when fed
    hunters.forEach(h => {
      if (!h.fed) {
        h.fed = true;
        h.foodBuff = { stat: 'atk', percent: 5 + gameState.buildings.restaurant * 2, ticksLeft: 15 };
      }
    });
  } else {
    hunters.forEach(h => { h.fed = false; h.foodBuff = null; });
  }
}

// ─── ACHIEVEMENTS ───────────────────────────────────────────
function checkAchievements() {
  if (!GAME_DATA.achievements) return;
  GAME_DATA.achievements.forEach(ach => {
    if (!gameState.achievements.includes(ach.id) && ach.check(gameState)) {
      gameState.achievements.push(ach.id);
      addLog(`🏆 Thành tựu: ${ach.icon} ${ach.name} — ${ach.desc}`, 'achievement');
    }
  });
}

// ─── LOGGING ────────────────────────────────────────────────
function addLog(message, type = 'normal') {
  gameState.log.unshift({
    message,
    type,
    time: gameState.day,
    tick: gameState.tickCount,
  });
  if (gameState.log.length > MAX_LOG_ENTRIES) {
    gameState.log = gameState.log.slice(0, MAX_LOG_ENTRIES);
  }
}

// ─── SAVE / LOAD ────────────────────────────────────────────
function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
  } catch (e) {
    console.warn('Save failed:', e);
  }
}

function loadGame() {
  const saved = localStorage.getItem(SAVE_KEY);
  if (saved) {
    try {
      gameState = JSON.parse(saved);
      addLog('💾 Đã tải dữ liệu!', 'system');
      if (typeof renderUI === 'function') renderUI();
    } catch (e) {
      addLog('❌ Lỗi tải dữ liệu!', 'error');
    }
  }
}

function resetGame() {
  if (confirm('⚠️ Bạn có chắc muốn reset toàn bộ game? Dữ liệu sẽ bị xóa!')) {
    localStorage.removeItem(SAVE_KEY);
    gameState = createNewGame();
    addLog('🔄 Game đã được reset!', 'system');
    if (typeof renderUI === 'function') renderUI();
  }
}

function exportGame() {
  const data = JSON.stringify(gameState);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dark_realm_tycoon_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  addLog('📤 Đã xuất dữ liệu game!', 'system');
}

function importGame() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        gameState = JSON.parse(ev.target.result);
        addLog('📥 Đã nhập dữ liệu thành công!', 'system');
        saveGame();
        if (typeof renderUI === 'function') renderUI();
      } catch (err) {
        addLog('❌ File không hợp lệ!', 'error');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// ─── PAUSE / RESUME ─────────────────────────────────────────
function togglePause() {
  isPaused = !isPaused;
  addLog(isPaused ? '⏸️ Tạm dừng' : '▶️ Tiếp tục', 'system');
  if (typeof renderUI === 'function') renderUI();
}

// ─── SCREEN NAVIGATION ─────────────────────────────────────
function navigateTo(screen) {
  currentScreen = screen;
  if (typeof renderUI === 'function') renderUI();
}

// ─── UTILITY ────────────────────────────────────────────────
function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

function getBuildingCost(buildingId) {
  const bd = GAME_DATA.buildings[buildingId];
  if (!bd) return 0;
  const level = gameState.buildings[buildingId] || 0;
  return Math.floor(bd.baseCost * Math.pow(bd.costMultiplier, level));
}

function canAffordBuilding(buildingId) {
  return gameState.gold >= getBuildingCost(buildingId);
}

function upgradeBuilding(buildingId) {
  const bd = GAME_DATA.buildings[buildingId];
  if (!bd) return;
  const level = gameState.buildings[buildingId] || 0;
  if (level >= bd.maxLevel) {
    addLog(`❌ ${bd.name} đã đạt max level!`, 'error');
    return;
  }
  const cost = getBuildingCost(buildingId);
  if (gameState.gold < cost) {
    addLog(`❌ Không đủ gold! Cần ${formatNumber(cost)} gold.`, 'error');
    return;
  }
  gameState.gold -= cost;
  gameState.buildings[buildingId] = level + 1;
  addLog(`🔨 Nâng cấp ${bd.icon} ${bd.name} lên Lv.${level + 1}!`, 'success');
  if (typeof renderUI === 'function') renderUI();
}

function getGoldPerTick() {
  let income = 0;
  gameState.hunters.forEach(h => {
    if (h.alive && h.state === 'hunting') {
      income += GAME_DATA.zones[gameState.currentZone].baseGold;
    }
  });
  return income;
}

function getHunterCount() {
  return gameState.hunters.length;
}

function getMaxHunters() {
  return GAME_DATA.buildings.townhall.effects(gameState.buildings.townhall).maxHunters;
}
