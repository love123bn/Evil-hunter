// ==================== NHIEM VU NGAY ====================

function generateDailyQuests() {
  var today = new Date().toDateString();
  if (state.questDay !== today) {
    state.questDay = today;
    state.dailyProgress = { sell: 0, tax: 0, craft: 0, buyMat: 0, upgrade: 0, merchant: 0, recruit: 0 };
    state.dailyQuests = [];
    var numQuests = 5;
    var shuffled = QUEST_TEMPLATES.sort(function() { return Math.random() - 0.5; });
    for (var i = 0; i < numQuests; i++) {
      var tmpl = shuffled[i % shuffled.length];
      var lvl = Math.min(4, Math.floor((state.town.level - 1) / 5));
      if (lvl < 0) lvl = 0;
      var tgt = tmpl.target[lvl];
      var goldReward = tmpl.rewardGold[lvl];
      state.dailyQuests.push({
        id: tmpl.id + '_' + i,
        type: tmpl.id,
        desc: tmpl.desc(tgt),
        target: tgt,
        progress: 0,
        reward: { gold: goldReward, rep: rand(2, 5) },
        completed: false,
        claimed: false
      });
    }
  }
}

function addQuestProgress(type, amount) {
  if (!state.dailyProgress) state.dailyProgress = { sell: 0, tax: 0, craft: 0, buyMat: 0, upgrade: 0, merchant: 0, recruit: 0 };
  state.dailyProgress[type] = (state.dailyProgress[type] || 0) + amount;
  for (var i = 0; i < state.dailyQuests.length; i++) {
    var q = state.dailyQuests[i];
    if (q.type === type && !q.completed && !q.claimed) {
      q.progress = state.dailyProgress[type] || 0;
      if (q.progress >= q.target) {
        q.completed = true;
      }
    }
  }
}

function claimQuest(idx) {
  if (idx < 0 || idx >= state.dailyQuests.length) return;
  var q = state.dailyQuests[idx];
  if (q.claimed) return;
  if (!q.completed) return;
  state.town.gold += q.reward.gold;
  state.town.reputation += q.reward.rep;
  if (state.town.reputation > 500) state.town.reputation = 500;
  q.claimed = true;
  state.dailyQuests[idx] = q;
  saveGame();
  renderAll();
}
