// ==================== KINH TE ====================

function getCraftRecipes() {
  var wl = state.town.buildings.workshop;
  var recipes = [];
  var nameParts = ['Go', 'Sat', 'Dong', 'Bac', 'Vang', 'Hac Kim', 'Tinh Anh', 'Long Gam', 'Huy Diet', 'Than'],
      nameTypes = ['Dao', 'Kiem', 'Bua', 'Riu', 'Gay', 'Cung', 'Phap Trang', 'Khieng', 'Quat', 'Don'];

  for (var i = 1; i <= 20; i++) {
    if (wl < i) break;
    var mapIdx = Math.min(4, Math.floor((i - 1) / 4));
    var md = MAP_DATA[mapIdx];
    var cost = 10 + i * 15;
    var time = 5 + i * 3;
    var mats = {};
    mats[md.mat1Id] = 2 + Math.floor(i / 2);
    if (i > 4) mats[md.mat2Id] = Math.floor(i / 3);

    for (var t = 0; t < EQUIP_TYPES.length; t++) {
      var et = EQUIP_TYPES[t];
      var np1 = nameParts[(i - 1) % nameParts.length];
      var np2 = nameTypes[(i - 1) % nameTypes.length];
      recipes.push({
        id: 'r' + i + '_' + t,
        level: i,
        name: np1 + ' ' + np2 + ' ' + et.name,
        equipType: et.id,
        equipTypeName: et.name,
        cost: cost,
        time: time,
        mats: JSON.parse(JSON.stringify(mats)),
        lvlReq: i
      });
    }
  }
  return recipes;
}

function canCraft(recipe) {
  var wl = state.town.buildings.workshop;
  if (wl < recipe.lvlReq) return false;
  if (state.town.gold < recipe.cost) return false;
  for (var m in recipe.mats) {
    if ((state.materials[m] || 0) < recipe.mats[m]) return false;
  }
  for (var si = 0; si < state.shop.slots.length; si++) {
    if (!state.shop.slots[si]) return true;
  }
  return false;
}

function doCraft(recipe) {
  if (!canCraft(recipe)) return null;
  state.town.gold -= recipe.cost;
  for (var m in recipe.mats) {
    state.materials[m] -= recipe.mats[m];
    if (state.materials[m] <= 0) delete state.materials[m];
  }
  var qualityRoll = Math.random() * 100;
  var cum = 0;
  var chosenQuality = 'Common';
  var wsBonus = Math.min(25, (state.town.buildings.workshop - 1) * 1.3);
  for (var q in QUALITY_DATA) {
    var weight = QUALITY_DATA[q].weight;
    if (q === 'Rare') weight += wsBonus * 0.5;
    else if (q === 'Epic') weight += wsBonus * 0.3;
    else if (q === 'Legendary') weight += wsBonus * 0.2;
    cum += weight;
    if (qualityRoll <= cum) { chosenQuality = q; break; }
  }
  var baseStat = recipe.level * 4 + rand(1, recipe.level + 2);
  var equip = {
    id: 'eq_' + (++state.equipmentIdCounter),
    type: recipe.equipType,
    typeName: recipe.equipTypeName,
    name: recipe.name,
    level: recipe.level,
    quality: chosenQuality,
    baseStat: baseStat,
    calcStat: baseStat,
    bonusStats: [],
    durability: 100,
    maxDurability: 100,
    price: Math.floor(baseStat * (recipe.level + 1) * 2.5 * (1 + [0, 0.4, 1.2, 3][['Common','Rare','Epic','Legendary'].indexOf(chosenQuality)]))
  };
  var lines = QUALITY_DATA[chosenQuality].bonusLines;
  var bonusNames = ['Suc Manh +', 'Nhanh Nhen +', 'Tri Tue +', 'The Luc +', 'Sat Thuong +', 'Phong Thu +'];
  for (var l = 0; l < lines; l++) {
    var bName = pickRandom(bonusNames);
    var bVal = rand(1, recipe.level + 3);
    equip.bonusStats.push(bName + bVal);
    if (bName.indexOf('Suc Manh') >= 0) equip.calcStat += Math.floor(bVal * 0.5);
    else if (bName.indexOf('Sat Thuong') >= 0) equip.calcStat += bVal;
    else if (bName.indexOf('Phong Thu') >= 0) equip.calcStat += Math.floor(bVal * 0.3);
  }
  if (equip.calcStat < 1) equip.calcStat = 1;
  equip.shopPrice = equip.price;

  // Tu dong day len ke
  var placed = false;
  for (var si = 0; si < state.shop.slots.length; si++) {
    if (!state.shop.slots[si]) {
      state.shop.slots[si] = equip;
      placed = true; break;
    }
  }
  if (!placed) state.shop.slots[0] = equip;

  state.totalCrafted++;
  addQuestProgress('craft', 1);
  saveGame();
  renderAll();
  return equip;
}

function addToShop(equipId, price) {
  for (var i = 0; i < state.shop.slots.length; i++) {
    if (!state.shop.slots[i]) {
      var eq = findEquipmentById(equipId);
      if (!eq) return false;
      for (var j = 0; j < state.equipment.length; j++) {
        if (state.equipment[j].id === equipId) {
          state.equipment.splice(j, 1);
          break;
        }
      }
      eq.shopPrice = price || eq.price || 100;
      state.shop.slots[i] = eq;
      saveGame();
      renderAll();
      return true;
    }
  }
  return false;
}

function removeFromShop(slotIdx) {
  if (slotIdx < 0 || slotIdx >= state.shop.slots.length) return;
  var eq = state.shop.slots[slotIdx];
  if (!eq) return;
  state.shop.slots[slotIdx] = null;
  state.equipment.push(eq);
  saveGame();
  renderAll();
}

function hunterTryBuy(hunter) {
  if (!hunter || hunter.status === 'hunting') return false;
  var bestSlot = -1;
  var bestScore = -1;
  for (var i = 0; i < state.shop.slots.length; i++) {
    var eq = state.shop.slots[i];
    if (!eq) continue;
    var price = eq.shopPrice || eq.price || 100;
    if (hunter.gold < price) continue;
    var targetSlot = 'weapon';
    if (eq.type === 'armor') targetSlot = 'armor';
    else if (eq.type === 'accessory') targetSlot = 'accessory';
    else if (eq.type === 'boots') targetSlot = 'boots';
    var currentDur = 0;
    if (hunter.gear[targetSlot]) {
      var curEq = findEquipmentById(hunter.gear[targetSlot]);
      if (curEq) currentDur = hunter.gearDurability[targetSlot] || 0;
    }
    var score = eq.level * 10 + (hunter.gear[targetSlot] ? (100 - currentDur) : 200);
    if (score > bestScore) { bestScore = score; bestSlot = i; }
  }
  if (bestSlot < 0) return false;
  var eq = state.shop.slots[bestSlot];
  if (!eq) return false;
  var price = eq.shopPrice || eq.price || 100;
  if (hunter.gold < price) return false;
  var slot = 'weapon';
  if (eq.type === 'armor') slot = 'armor';
  else if (eq.type === 'accessory') slot = 'accessory';
  else if (eq.type === 'boots') slot = 'boots';
  if (hunter.gear[slot]) {
    var oldId = hunter.gear[slot];
    hunter.gear[slot] = null;
    hunter.gearDurability[slot] = 0;
    var oldEq = findEquipmentById(oldId);
    if (oldEq) {
      oldEq.durability = hunter.gearDurability[slot];
      state.equipment.push(oldEq);
    }
  }
  hunter.gear[slot] = eq.id;
  hunter.gearDurability[slot] = 100;
  hunter.gold -= price;
  state.town.gold += price;
  state.totalSold++;
  addQuestProgress('sell', 1);
  state.shop.slots[bestSlot] = null;
  state.town.reputation = Math.min(500, state.town.reputation + 1);
  eq._soldTo = hunter.name;
  saveGame();
  renderAll();
  return true;
}

function spawnMerchant() {
  if (state.merchant) return;
  var rareItems = [];
  for (var i = 0; i < state.shop.slots.length; i++) {
    var eq = state.shop.slots[i];
    if (eq && (eq.quality === 'Rare' || eq.quality === 'Epic' || eq.quality === 'Legendary')) {
      rareItems.push(eq);
    }
  }
  if (rareItems.length < 2) return;
  var chance = 0.005 + state.town.buildings.tavern * 0.0005 + state.town.reputation * 0.0005;
  if (state.town.reputation >= 150) chance += 0.01;
  if (Math.random() > chance) return;
  var wantCount = rand(2, Math.min(5, rareItems.length));
  var wants = [];
  var shuffled = rareItems.sort(function() { return Math.random() - 0.5; });
  for (var j = 0; j < wantCount; j++) wants.push(shuffled[j].id);
  var mul = 1.3 + state.town.buildings.market * 0.008 + Math.random() * 0.3;
  state.merchant = { items: wants, priceMul: mul, departTime: Date.now() + 120000 };
  showNotification('Thuong nhan ghe tham thi tran!');
  saveGame();
  renderAll();
}

function doMerchantDeal() {
  if (!state.merchant) return;
  var totalGold = 0;
  var soldIds = [];
  for (var i = 0; i < state.merchant.items.length; i++) {
    var eqId = state.merchant.items[i];
    for (var j = 0; j < state.shop.slots.length; j++) {
      var eq = state.shop.slots[j];
      if (eq && eq.id === eqId) {
        var price = Math.floor((eq.shopPrice || eq.price || 100) * state.merchant.priceMul);
        totalGold += price;
        state.shop.slots[j] = null;
        break;
      }
    }
  }
  if (soldIds.length === 0 && totalGold === 0) {
    state.merchant = null;
    saveGame();
    renderAll();
    showNotification('Thuong nhan khong mua duoc mon nao.');
    return;
  }
  state.town.gold += totalGold;
  state.town.reputation = Math.min(500, state.town.reputation + 3);
  state.totalMerchantDeals++;
  addQuestProgress('merchant', 1);
  state.merchant = null;
  saveGame();
  renderAll();
  showNotification('Giao dich voi thuong nhan thanh cong! Thu ' + fmt(totalGold) + ' vang.');
  return totalGold;
}
