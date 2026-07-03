// ==================== KHOI TAO VA GAME LOOP ====================

var currentTab = 'overview';
var craftTimer = null;
var craftRecipe = null;
var craftRemaining = 0;
var selectedHunterIdx = -1;
var selectedRecipeIdx = -1;
var selectedShopSlot = -1;
var buyMatHunterIdx = -1;
var buyMatSelection = null;

function initGame() {
  var loaded = loadGame();
  if (!loaded) {
    newGame();
  }
  generateDailyQuests();
  setupTabButtons();
  startGameLoop();
  if (state.offlineEarned > 0) {
    setTimeout(function() {
      showNotification('Vang mat ' + state.offlineEarned + ' chuyen san da duoc xu ly.');
      state.offlineEarned = 0;
    }, 500);
  }
}

function startGameLoop() {
  setInterval(function() {
    gameTick();
  }, 2000);
  setInterval(function() {
    saveGame();
  }, 30000);
  setInterval(function() {
    generateDailyQuests();
    spawnMerchant();
  }, 60000);
  window.addEventListener('beforeunload', function() { saveGame(); });
}

function gameTick() {
  if (!state) return;
  state.tickCounter = (state.tickCounter || 0) + 1;
  var isNewDay = (state.tickCounter % state.ticksPerDay === 0);
  if (isNewDay) state.currentDay++;

  for (var i = 0; i < state.hunters.length; i++) {
    var h = state.hunters[i];

    // Dang di san
    if (h.status === 'hunting') {
      var completed = simulateHuntTick(h, false);
      if (completed) {
        // Sau chuyen san, kiem tra nhu cau
        if (h.stamina < 30 || h.hunger < 30 || h.morale < 30) {
          processHunterNeeds(h);
        } else {
          h.status = 'resting';
        }
        h.huntProgress = 0;
      }
    }
    // Dang o trong thi tran: uu tien xu ly nhu cau
    else {
      // Kiem tra va xu ly nhu cau (benh vien, nha hang, quan ruou)
      var need = processHunterNeeds(h);

      // Con doi giam dan theo thoi gian
      h.hunger = Math.max(0, h.hunger - 0.5);

      // Neu nhu cau da duoc dap ung hoac khong co nhu cau, nghi ngoi nhe
      if (h.stamina >= h.maxStamina * 0.8 && h.hunger > 40 && h.morale > 60) {
        // Neu du dieu kien, quay lai di san
        h.status = 'hunting';
        h.currentMap = getMapForHunter(h);
      }
      // Khi dang nghi ngoi thuan tuy, hoi phuc nhe
      else if (h.status === 'resting') {
        h.stamina = Math.min(h.maxStamina, h.stamina + 5);
        h.morale = Math.min(100, h.morale + 1);
      }
    }

    // Tho san tu ghe cua hang mua do
    if (Math.random() < 0.08 && h.status !== 'hunting') {
      hunterTryBuy(h);
    }

    // New day: kiem tra tho san o lau ngay
    // Danh tieng anh huong: cang cao, tho san cang o lau
    var repStayBonus = Math.floor(state.town.reputation / 20);
    if (isNewDay) {
      h.daysInTown++;
      var leaveChance = 0.15 - repStayBonus * 0.02;
      if (leaveChance < 0.02) leaveChance = 0.02;
      if (h.daysInTown > h.maxDaysInTown + repStayBonus && Math.random() < leaveChance) {
        showNotification(h.name + ' (' + h.rank + ') da roi khoi thi tran.');
        state.town.reputation = Math.max(0, state.town.reputation - 2);
        state.hunters.splice(i, 1);
        i--;
      }
    }
  }

  if (state.hunters.length < 5) {
    var spawnChance = 0.003 + state.town.buildings.tavern * 0.0005;
    if (isNewDay) spawnChance = 1.0;
    if (Math.random() < spawnChance) {
      var spawned = spawnHunter();
      if (spawned) {
        showNotification('Tho san moi xuat hien: ' + spawned.name + ' (rank ' + spawned.rank + ')');
      }
    }
  }

  if (craftTimer !== null && craftRecipe) {
    craftRemaining -= 2;
    if (craftRemaining <= 0) {
      doCraft(craftRecipe);
      craftTimer = null;
      craftRecipe = null;
      craftRemaining = 0;
      showNotification('Che tao hoan tat!');
      renderAll();
    }
  }
  if (state.merchant && Date.now() >= state.merchant.departTime) {
    state.merchant = null;
    saveGame();
  }
  renderTab(currentTab);
  updateNavIndicators();
}

function showNotification(msg) {
  var el = document.getElementById('notification');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  clearTimeout(el._hide);
  el._hide = setTimeout(function() { el.style.display = 'none'; }, 4000);
}

function setupTabButtons() {
  var tabs = document.querySelectorAll('.tab-btn');
  for (var i = 0; i < tabs.length; i++) {
    (function(tab) {
      tab.addEventListener('click', function() {
        currentTab = this.getAttribute('data-tab');
        renderAll();
      });
    })(tabs[i]);
  }
  document.addEventListener('click', function(e) {
    var target = e.target;
    if (target.classList.contains('nav-link')) {
      currentTab = target.getAttribute('data-tab');
      renderAll();
    }
  });
}

function renderAll() {
  generateDailyQuests();
  updateHeaderBar();
  updateStatsBar();
  renderTab(currentTab);
  updateNavIndicators();
  highlightActiveTab();
}

function highlightActiveTab() {
  var links = document.querySelectorAll('.nav-link');
  for (var i = 0; i < links.length; i++) {
    links[i].classList.remove('nav-active');
    if (links[i].getAttribute('data-tab') === currentTab) {
      links[i].classList.add('nav-active');
    }
  }
}

function updateNavIndicators() {
  var quests = state.dailyQuests || [];
  var anyReady = false;
  for (var i = 0; i < quests.length; i++) {
    if (quests[i].completed && !quests[i].claimed) { anyReady = true; break; }
  }
  var nav = document.getElementById('nav-nhiemvu');
  if (nav) nav.textContent = 'Nhiem Vu' + (anyReady ? ' (!)' : '');
}

document.addEventListener('DOMContentLoaded', initGame);
