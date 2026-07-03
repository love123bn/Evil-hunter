// ==================== TRANG THAI GAME ====================

const GAME = { version: '1.0' };

function createInitialState() {
  return {
    town: {
      level: 1,
      gold: 500,
      reputation: 50,
      buildings: {
        hospital: 1,
        tavern: 1,
        inn: 1,
        workshop: 1,
        market: 1,
        taxOffice: 1,
        warehouse: 1
      }
    },
    hunters: [],
    materials: {},
    equipment: [],
    equipmentIdCounter: 0,
    shop: {
      slots: [null, null, null, null, null, null, null, null, null, null]
    },
    merchant: null,
    merchantTimer: 0,
    dailyProgress: { sell: 0, tax: 0, craft: 0, buyMat: 0, upgrade: 0, merchant: 0, recruit: 0 },
    dailyQuests: [],
    questDay: '',
    currentDay: 1,
    lastSaveTime: Date.now(),
    totalHuntsDone: 0,
    totalCrafted: 0,
    totalTaxCollected: 0,
    totalSold: 0,
    totalMatBought: 0,
    totalUpgrades: 0,
    totalMerchantDeals: 0,
    totalRecruited: 0,
    offlineEarned: 0,
    tickCounter: 0,
    ticksPerDay: 600,
    setupComplete: true,
    townName: ''
  };
}

let state = null;

function newGame() {
  state = createInitialState();
  generateDailyQuests();
  spawnInitialHunters();
  saveGame();
  renderAll();
}

function loadGame() {
  try {
    var raw = localStorage.getItem('phothosan_save');
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.setupComplete) {
        state = parsed;
        if (state.merchant && state.merchant.departTime && Date.now() >= state.merchant.departTime) {
          state.merchant = null;
        }
        processOfflineTime();
        renderAll();
        return true;
      }
    }
  } catch(e) {}
  return false;
}

function saveGame() {
  try {
    state.lastSaveTime = Date.now();
    localStorage.setItem('phothosan_save', JSON.stringify(state));
  } catch(e) {}
}

function processOfflineTime() {
  var elapsed = Math.floor((Date.now() - state.lastSaveTime) / 1000);
  if (elapsed < 5) return;
  var minutes = Math.floor(elapsed / 60);
  if (minutes > 480) minutes = 480;
  if (minutes < 1) return;
  var totalHunts = 0;
  for (var i = 0; i < state.hunters.length; i++) {
    var h = state.hunters[i];
    if (h.status === 'hunting' || h.status === 'resting') {
      var cycles = Math.floor(minutes / 2);
      for (var c = 0; c < cycles && c < 30; c++) {
        if (h.stamina > 0) {
          simulateHuntTick(h, true);
          totalHunts++;
        } else {
          h.stamina = Math.min(h.maxStamina, h.stamina + 10);
        }
      }
    }
  }
  if (totalHunts > 0) {
    state.offlineEarned = totalHunts;
    state.totalHuntsDone += totalHunts;
  }
  if (state.merchantTimer > 0) {
    state.merchantTimer = Math.max(0, state.merchantTimer - minutes * 60);
  }
}

function spawnInitialHunters() {
  for (var i = 0; i < 2; i++) {
    spawnHunter();
  }
}

function getNextHunterId() {
  if (!state._hunterIdCounter) state._hunterIdCounter = 1;
  return state._hunterIdCounter++;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
