// ==================== THO SAN ====================

function getAvailableRanks() {
  var tl = state.town.level;
  var ranks = [];
  for (var r in RANK_DATA) {
    if (tl >= RANK_DATA[r].townReq) ranks.push(r);
  }
  if (ranks.length === 0) ranks.push('E');
  return ranks;
}

function rollRank() {
  var avail = getAvailableRanks();
  var repBonus = Math.floor(state.town.reputation / 30);

  // Sap xep rank tu cao den thap de cong don dan tien
  var sorted = avail.slice().sort(function(a, b) {
    var order = ['E','D','C','B','A','S','SS','SSS'];
    return order.indexOf(b) - order.indexOf(a);
  });

  // Danh tieng cang cao, ti le ra rank cao cang lon
  var totalW = 0;
  for (var i = 0; i < sorted.length; i++) {
    var w = RANK_DATA[sorted[i]].spawnWeight;
    if (i === 0) w += repBonus * 1.5;
    else if (i === 1) w += repBonus;
    else if (i === 2) w += repBonus * 0.5;
    totalW += w;
  }
  var roll = Math.random() * totalW;
  var cum = 0;
  for (var i = 0; i < sorted.length; i++) {
    cum += RANK_DATA[sorted[i]].spawnWeight;
    if (i === 0) cum += repBonus * 1.5;
    else if (i === 1) cum += repBonus;
    else if (i === 2) cum += repBonus * 0.5;
    if (roll <= cum) return sorted[i];
  }
  return sorted[sorted.length - 1];
}

function spawnHunter() {
  if (state.hunters.length >= 5) return null;
  var rank = rollRank();
  var cls = pickRandom(CLASS_DATA);
  var name = pickRandom(HUNTER_NAMES);
  var rd = RANK_DATA[rank];
  var baseStats = { strength: 5, agility: 5, intelligence: 5, stamina: 10 };
  var hunter = {
    id: getNextHunterId(),
    name: name,
    classId: cls.id,
    className: cls.name,
    rank: rank,
    level: 1,
    exp: 0,
    expToNext: 38,
    awaken: 0,
    gold: rand(10, 50) * (1 + (rd.statMul - 0.5)),
    maxStamina: Math.floor(100 * rd.statMul),
    stamina: Math.floor(100 * rd.statMul),
    morale: 100,
    hunger: 100,
    status: 'resting',
    huntProgress: 0,
    currentMap: 1,
    daysInTown: 0,
    maxDaysInTown: Math.floor(2 + BUILDING_DATA[2].effect(state.town.buildings.inn)),
    gear: { weapon: null, armor: null, accessory: null, boots: null },
    materials: {},
    gearDurability: { weapon: 100, armor: 100, accessory: 100, boots: 100 },
    stats: {
      strength: Math.floor((baseStats.strength + cls.bonusStr) * rd.statMul),
      agility: Math.floor((baseStats.agility + cls.bonusAgi) * rd.statMul),
      intelligence: Math.floor((baseStats.intelligence + cls.bonusInt) * rd.statMul),
      stamina: Math.floor((baseStats.stamina + cls.bonusStam) * rd.statMul)
    }
  };
  if (hunter.gold < 20) hunter.gold = 20;
  state.hunters.push(hunter);
  hunter.daysInTown++;
  state.totalRecruited++;
  addQuestProgress('recruit', 1);
  return hunter;
}

function getMapForHunter(h) {
  var maxMap = Math.min(5, h.awaken + 1);
  for (var m = maxMap; m >= 1; m--) {
    var mapData = MAP_DATA[m - 1];
    if (h.awaken >= mapData.reqAwaken) {
      return m;
    }
  }
  return 1;
}

function simulateHuntTick(h, isOffline) {
  var mapIdx = getMapForHunter(h) - 1;
  if (mapIdx < 0) mapIdx = 0;
  var mapData = MAP_DATA[mapIdx];
  var speedMul = 1;
  if (h.gear.boots && h.gearDurability.boots > 0) {
    var eq = findEquipmentById(h.gear.boots);
    if (eq) speedMul += eq.calcStat / 100;
  }
  if (h.gear.accessory && h.gearDurability.accessory > 0) {
    var eq2 = findEquipmentById(h.gear.accessory);
    if (eq2) speedMul += eq2.calcStat / 100;
  }
  var progress = Math.floor((isOffline ? 15 : 2) * speedMul);
  h.huntProgress += progress;
  var maxHp = mapData.huntTime;
  if (h.huntProgress >= maxHp) {
    completeHunt(h, mapData, mapIdx);
    h.huntProgress = 0;
    return true;
  }
  return false;
}

function completeHunt(h, mapData, mapIdx) {
  var rd = RANK_DATA[h.rank];
  var goldEarned = rand(mapData.goldMin, mapData.goldMax);
  goldEarned = Math.floor(goldEarned * rd.statMul);
  h.gold += goldEarned;

  var expGain = Math.floor(mapData.expGain * rd.statMul);
  h.exp += expGain;
  if (h.exp >= h.expToNext) {
    levelUpHunter(h);
  }

  var mat1qty = rand(mapData.mat1Qty[0], mapData.mat1Qty[1]);
  if (mat1qty > 0) {
    h.materials[mapData.mat1Id] = (h.materials[mapData.mat1Id] || 0) + mat1qty;
  }
  var mat2qty = rand(mapData.mat2Qty[0], mapData.mat2Qty[1]);
  if (mat2qty > 0) {
    h.materials[mapData.mat2Id] = (h.materials[mapData.mat2Id] || 0) + mat2qty;
  }

  var stamLoss = rand(8, 18) - Math.floor((state.town.buildings.hospital - 1) * 0.3);
  if (stamLoss < 3) stamLoss = 3;
  h.stamina -= stamLoss;
  if (h.stamina <= 0) {
    h.stamina = 0;
    h.status = 'resting';
  }

  for (var slot in h.gearDurability) {
    if (h.gear[slot]) {
      h.gearDurability[slot] -= rand(3, 10);
      if (h.gearDurability[slot] < 0) h.gearDurability[slot] = 0;
    }
  }

  var taxRate = Math.min(BUILDING_DATA[5].effect(state.town.buildings.taxOffice), 40) / 100;
  var tax = Math.floor(goldEarned * taxRate);
  if (tax > 0) {
    h.gold -= tax;
    state.town.gold += tax;
    state.totalTaxCollected += tax;
  }

  h.hunger -= rand(8, 18);
  if (h.hunger < 0) h.hunger = 0;
  h.morale -= rand(0, 3);
  if (h.morale < 0) h.morale = 0;

  state.totalHuntsDone++;
  addQuestProgress('tax', tax);
}

function levelUpHunter(h) {
  h.exp -= h.expToNext;
  h.level++;
  h.expToNext = Math.floor(30 + h.level * 8);
  h.stats.strength += 1;
  h.stats.agility += 1;
  h.stats.intelligence += 1;
  h.stats.stamina += 1;
  h.maxStamina += 5;
  h.stamina = Math.min(h.stamina + 10, h.maxStamina);
  if (h.exp >= h.expToNext && h.level < 100) {
    levelUpHunter(h);
  }
}

function canAwaken(h) {
  if (h.level < 100) return false;
  if (h.awaken >= 5) return false;
  var cost = AWAKEN_COSTS[h.awaken];
  if (state.town.gold < cost.gold) return false;
  for (var mat in cost.mats) {
    var have = state.materials[mat] || 0;
    if (have < cost.mats[mat]) return false;
  }
  return true;
}

function doAwaken(h) {
  if (!canAwaken(h)) return;
  var cost = AWAKEN_COSTS[h.awaken];
  state.town.gold -= cost.gold;
  for (var mat in cost.mats) {
    state.materials[mat] = (state.materials[mat] || 0) - cost.mats[mat];
    if (state.materials[mat] <= 0) delete state.materials[mat];
  }
  h.awaken++;
  h.level = 1;
  h.exp = 0;
  h.expToNext = 50;
  h.stats.strength = Math.floor(h.stats.strength * 1.2);
  h.stats.agility = Math.floor(h.stats.agility * 1.2);
  h.stats.intelligence = Math.floor(h.stats.intelligence * 1.2);
  h.stats.stamina = Math.floor(h.stats.stamina * 1.2);
  h.maxStamina = Math.floor(h.maxStamina * 1.2);
  h.stamina = h.maxStamina;
  h.morale = 100;
  saveGame();
  renderAll();
}

function findEquipmentById(id) {
  for (var i = 0; i < state.equipment.length; i++) {
    if (state.equipment[i].id === id) return state.equipment[i];
  }
  return null;
}

function getHunterByName(name) {
  for (var i = 0; i < state.hunters.length; i++) {
    if (state.hunters[i].name === name) return state.hunters[i];
  }
  return null;
}

function buyHunterMaterials(hunter, matId, qty, price) {
  var have = hunter.materials[matId] || 0;
  if (have < qty) return false;
  // Danh tieng cao giam gia mua nguyen lieu (-0.15%/rep)
  var repDiscount = Math.min(30, state.town.reputation * 0.15);
  var finalPrice = Math.max(1, Math.floor(price * (100 - repDiscount) / 100));
  var totalCost = finalPrice * qty;
  if (state.town.gold < totalCost) return false;
  hunter.materials[matId] -= qty;
  if (hunter.materials[matId] <= 0) delete hunter.materials[matId];
  hunter.gold += totalCost;
  state.town.gold -= totalCost;
  state.materials[matId] = (state.materials[matId] || 0) + qty;
  state.totalMatBought += qty;
  addQuestProgress('buyMat', qty);
  state.town.reputation = Math.min(500, state.town.reputation + 0.5);
  saveGame();
  renderAll();
  return true;
}

function processHunterNeeds(h) {
  if (h.stamina < 30 && h.gold >= 3) {
    var hospLvl = state.town.buildings.hospital;
    var cost = Math.floor(2 + 18 / (1 + hospLvl * 0.3));
    if (cost < 1) cost = 1;
    if (cost > h.gold) cost = h.gold;
    var recover = Math.floor(15 + hospLvl * 3);
    h.stamina = Math.min(h.maxStamina, h.stamina + recover);
    h.morale = Math.max(0, h.morale - 1);
    h.gold -= cost;
    state.town.gold += cost;
    h.status = 'recovering';
    return 'benh vien (-' + cost + ' vang)';
  }
  if (h.hunger < 30 && h.gold >= 2) {
    var innLvl = state.town.buildings.inn;
    var cost = Math.floor(1 + 12 / (1 + innLvl * 0.3));
    if (cost < 1) cost = 1;
    if (cost > h.gold) cost = h.gold;
    h.hunger = Math.min(100, h.hunger + 35 + innLvl * 3);
    h.gold -= cost;
    state.town.gold += cost;
    h.morale = Math.min(100, h.morale + 3);
    h.status = 'eating';
    return 'nha hang (-' + cost + ' vang)';
  }
  if (h.morale < 30 && h.gold >= 2) {
    var tavLvl = state.town.buildings.tavern;
    var cost = Math.floor(1 + 10 / (1 + tavLvl * 0.3));
    if (cost < 1) cost = 1;
    if (cost > h.gold) cost = h.gold;
    h.morale = Math.min(100, h.morale + 15 + tavLvl * 2);
    h.gold -= cost;
    state.town.gold += cost;
    h.hunger += 4;
    if (h.hunger > 100) h.hunger = 100;
    h.status = 'drinking';
    return 'quan ruou (-' + cost + ' vang)';
  }
  h.status = 'resting';
  return 'nghi ngoi';
}

function fireHunter(idx) {
  if (idx < 0 || idx >= state.hunters.length) return;
  state.hunters.splice(idx, 1);
  state.town.reputation = Math.max(0, state.town.reputation - 3);
  saveGame();
  renderAll();
}
