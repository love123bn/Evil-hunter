// ==================== GIAO DIEN NGUOI DUNG ====================

function renderTab(tab) {
  var main = document.getElementById('main-content');
  if (!main) return;
  if (!state.townName) {
    renderIntro(main);
    return;
  }
  switch(tab) {
    case 'overview': renderOverview(main); break;
    case 'hunters': renderHunters(main); break;
    case 'craft': renderCraft(main); break;
    case 'shop': renderShop(main); break;
    case 'town': renderTown(main); break;
    case 'quests': renderQuests(main); break;
    case 'storage': renderStorage(main); break;
    default: renderOverview(main);
  }
}

function headerHTML() {
  return '';
}

function updateHeaderBar() {
  var bar = document.getElementById('header-bar');
  if (!bar) return;
  bar.innerHTML =
    '<span>Thi tran: ' + (state.townName || 'PHO THO SAN') + '</span>' +
    '<span class="header-day">Ngay ' + state.currentDay + '</span>';
}

function updateStatsBar() {
  var bar = document.getElementById('stats-bar');
  if (!bar) return;
  var wc = BUILDING_DATA[6].effect(state.town.buildings.warehouse);
  var matCount = 0;
  for (var m in state.materials) matCount += state.materials[m];
  bar.innerHTML =
    '<span class="stat-vang">Vang: <b>' + fmt(state.town.gold) + '</b></span>' +
    '<span class="stat-cap">Cap: <b>' + state.town.level + '</b></span>' +
    '<span class="stat-ten">Ten: <b>' + state.town.reputation.toFixed(0) + '</b></span>' +
    '<span class="stat-kho">Kho: <b>' + matCount + '/' + wc.mat + '</b></span>';
}

function fmt(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'tr';
  if (n >= 1000) return (n/1000).toFixed(1) + 'k';
  return Math.floor(n);
}

// ========== GIOI THIEU ==========

function renderIntro(main) {
  var html =
    '<div class="intro-screen">' +
    '<div class="intro-title">PHO THO SAN</div>' +
    '<div class="intro-subtitle">Quan Ly Thi Tran - Kinh Te - Idle</div>' +
    '<div class="intro-story">' +
    'Sau dai hoa, Chua Te Bong Toi pha huy het tat ca. ' +
    'Nhung nguoi song sot tu tap, xay dung lai tu dong do nat. ' +
    'La nguoi dung dau, ban phai gay dung mot thi tran phon thinh,' +
    'thu hut cac tho san tai ba, che tao vu khi, va bien noi day ' +
    'tro thanh niem hy vong cuoi cung cua nhan loai.' +
    '</div>' +
    '<div class="intro-story">' +
    'Tho san se tu dong di san quai va mang ve tai nguyen. ' +
    'Nhieu vu cua ban la: mua nguyen lieu, che tao trang bi, ' +
    'ban lai cho tho san, nang cap thi tran, va mo rong quy mo.' +
    '</div>' +
    '<div class="intro-input-group">' +
    '<label class="intro-label">Dat ten cho thi tran cua ban:</label>' +
    '<input type="text" id="townNameInput" class="intro-input" placeholder="Nhap ten thi tran..." maxlength="20">' +
    '<button class="btn btn-start" onclick="setTownName()">Bat Dau</button>' +
    '</div>' +
    '<div class="intro-note">' +
    'Game chay offline, tu luu bang trinh duyet. ' +
    'Khong can internet. ' +
    '</div>' +
    '</div>';
  main.innerHTML = html;
  var input = document.getElementById('townNameInput');
  if (input) {
    input.focus();
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') setTownName();
    });
  }
}

function setTownName() {
  var input = document.getElementById('townNameInput');
  if (!input) return;
  var name = input.value.trim();
  if (!name) { showAlertModal('Vui long nhap ten thi tran.'); return; }
  state.townName = name;
  saveGame();
  renderAll();
}

// ========== TONG QUAN ==========

function renderOverview(main) {
  var html = headerHTML() + '<div class="tab-title">Tong Quan Thi Tran</div>';
  var hunterCount = state.hunters.length;
  html += '<div class="section"><div class="section-title">Tho San Trong Thi Tran (' + hunterCount + '/5)</div>';
  if (hunterCount === 0) {
    html += '<div class="empty-msg">Chua co tho san nao. Cho tho san moi xuat hien.</div>';
  } else {
    for (var i = 0; i < state.hunters.length; i++) {
      var h2 = state.hunters[i];
      var rd = RANK_DATA[h2.rank];
      var statusMapS = { hunting: 'dang san', resting: 'nghi ngoi', recovering: 'benh vien', eating: 'nha hang', drinking: 'quan ruou' };
      var statusText = statusMapS[h2.status] || h2.status;
      html += '<div class="hunter-card" style="border-left: 3px solid ' + rd.color + '">' +
        '<div class="hunter-name"><span style="color:' + rd.color + '">[' + h2.rank + ']</span> ' + h2.className + ' ' + h2.name +
        ' <span class="hunter-level">Lv.' + h2.level + (h2.awaken > 0 ? ' (+' + h2.awaken + ')' : '') + '</span></div>' +
        '<div class="hunter-status">' + statusText + ' | The luc: ' + bar(h2.stamina, h2.maxStamina, 8) + ' | Doi: ' + bar(h2.hunger, 100, 6) + '</div>' +
        '</div>';
    }
  }
  html += '</div>';

  var news = [];
  if (state.merchant) {
    var remaining = Math.max(0, Math.floor((state.merchant.departTime - Date.now()) / 60000));
    news.push('Thuong nhan dang trong thi tran (con ' + remaining + ' phut).');
  }
  var shopCount = 0;
  for (var s = 0; s < state.shop.slots.length; s++) { if (state.shop.slots[s]) shopCount++; }
  news.push('Cua hang co ' + shopCount + ' mon do dang ban.');
  var qCount = 0;
  for (var q = 0; q < state.dailyQuests.length; q++) { if (state.dailyQuests[q].completed && !state.dailyQuests[q].claimed) qCount++; }
  if (qCount > 0) news.push('Co ' + qCount + ' nhiem vu ngay san sang nhan thuong!');

  html += '<div class="section"><div class="section-title">Tin Tuc</div>';
  for (var n = 0; n < news.length; n++) {
    html += '<div class="news-item">- ' + news[n] + '</div>';
  }
  html += '</div>';
  main.innerHTML = html;
}

function bar(cur, max, len) {
  if (max <= 0) return '[||||||||||]';
  var filled = Math.round((cur / max) * len);
  if (filled < 0) filled = 0;
  if (filled > len) filled = len;
  var s = '[';
  for (var i = 0; i < len; i++) {
    s += (i < filled) ? '|' : ' ';
  }
  s += '] ' + Math.floor(cur) + '/' + Math.floor(max);
  return s;
}

// ========== THO SAN ==========

function renderHunters(main) {
  var html = headerHTML();
  html += '<div class="tab-title">Quan Ly Tho San</div>';

  for (var i = 0; i < state.hunters.length; i++) {
    var h = state.hunters[i];
    var rd = RANK_DATA[h.rank];
    var sel = (i === selectedHunterIdx) ? ' hunter-detail-active' : '';
    html += '<div class="hunter-detail' + sel + '" onclick="selectHunter(' + i + ')">' +
      '<div class="hunter-detail-header" style="border-left: 4px solid ' + rd.color + '">' +
      '<span style="color:' + rd.color + ';font-weight:bold">[' + h.rank + ']</span> ' + h.className + ' ' + h.name +
      ' <span class="lvl-badge">Lv.' + h.level + (h.awaken > 0 ? ' A+' + h.awaken : '') + '</span>' +
      '</div>';
    if (selectedHunterIdx === i) {
      html += renderHunterFull(h, i);
    } else {
      var statusMapS2 = { hunting: 'san', resting: 'nghi', recovering: 'benh vien', eating: 'an', drinking: 'uong' };
      var sText = statusMapS2[h.status] || h.status;
      html += '<div class="hunter-summary">' +
        'Cap: ' + h.level + ' | ' + sText + ' | The luc: ' + Math.floor(h.stamina) + '/' + Math.floor(h.maxStamina) +
        ' | Doi: ' + Math.floor(h.hunger) + ' | Vang: ' + fmt(h.gold) +
        '</div>';
    }
    html += '</div>';
  }
  html += '<div style="margin-top:12px;text-align:center;font-size:13px;color:#888">' +
    'Bam vao tho san de xem chi tiet | Toi da 5 tho san' +
    '</div>';
  if (selectedHunterIdx >= state.hunters.length) selectedHunterIdx = -1;
  main.innerHTML = html;
}

function renderHunterFull(h, idx) {
  var rd = RANK_DATA[h.rank];
  var statusMap = { hunting: 'Dang San', resting: 'Nghi Ngoi', recovering: 'Benh Vien', eating: 'Nha Hang', drinking: 'Quan Ruou', idle: 'Cho' };
  var html = '<div class="hunter-full">';
  html += '<div class="hunter-stat-row">Rank: <span style="color:' + rd.color + ';font-weight:bold">' + h.rank + '</span></div>';
  html += '<div class="hunter-stat-row">Trang thai: ' + (statusMap[h.status] || h.status) + '</div>';
  html += '<div class="hunter-stat-row">Cap do: ' + h.level + ' | EXP: ' + bar(h.exp, h.expToNext, 8) + '</div>';
  html += '<div class="hunter-stat-row">The Luc: ' + bar(h.stamina, h.maxStamina, 10) + '</div>';
  html += '<div class="hunter-stat-row">Doi: ' + bar(h.hunger, 100, 8) + '</div>';
  html += '<div class="hunter-stat-row">Tinh Than: ' + bar(h.morale, 100, 8) + '</div>';
  html += '<div class="hunter-stat-row">Vang ca nhan: ' + fmt(h.gold) + '</div>';
  html += '<div class="hunter-stat-row">Thuc Tinh: ' + h.awaken + '/5 | Tho gian: ' + Math.floor(h.daysInTown/24) + ' ngay</div>';

  html += '<div class="hunter-subtitle">Chi So</div>';
  html += '<div class="hunter-stat-row">Suc Manh: ' + h.stats.strength + ' | Nhanh Nhen: ' + h.stats.agility + '</div>';
  html += '<div class="hunter-stat-row">Tri Tue: ' + h.stats.intelligence + ' | The Luc: ' + h.stats.stamina + '</div>';

  html += '<div class="hunter-subtitle">Trang Bi</div>';
  var slotNames = { weapon: 'Vu Khi', armor: 'Giap', accessory: 'Phu Kien', boots: 'Ung' };
  for (var s in slotNames) {
    html += '<div class="hunter-stat-row">' + slotNames[s] + ': ';
    if (h.gear[s]) {
      var eq = findEquipmentById(h.gear[s]);
      if (eq) {
        html += eq.name + ' (Lv.' + eq.level + ', ' + eq.quality + ') Do ben: ' + bar(h.gearDurability[s], 100, 6);
      } else {
        h.gear[s] = null;
        html += 'Khong co';
      }
    } else {
      html += 'Khong co';
    }
    html += '</div>';
  }

  html += '<div class="hunter-subtitle">Nguyen Lieu Trong Tui</div>';
  var matHtml = '';
  var matCount = 0;
  for (var m in h.materials) {
    var mName = m;
    for (var mi = 0; mi < MAP_DATA.length; mi++) {
      if (MAP_DATA[mi].mat1Id === m) mName = MAP_DATA[mi].mat1Name;
      if (MAP_DATA[mi].mat2Id === m) mName = MAP_DATA[mi].mat2Name;
    }
    matHtml += '<span class="mat-tag">' + mName + ' x' + h.materials[m] + '</span> ';
    matCount++;
  }
  if (matCount === 0) matHtml = '<span class="gray">Khong co</span>';
  html += '<div class="hunter-stat-row">' + matHtml + '</div>';

  html += '<div class="hunter-actions">';
  if (h.level >= 100 && canAwaken(h)) {
    var cost = AWAKEN_COSTS[h.awaken];
    html += '<button class="btn btn-warning" onclick="event.stopPropagation();doAwaken(state.hunters[' + idx + '])">Thuc Tinh (' + cost.gold + ' vang)</button> ';
  } else if (h.level >= 100 && !canAwaken(h)) {
    html += '<span class="gray">Thieu nguyen lieu de thuc tinh</span> ';
  }
  html += '<button class="btn btn-danger" onclick="event.stopPropagation();confirmFire(' + idx + ')">Sa Thai</button>';
  html += '</div>';

  html += '<div class="hunter-subtitle">Mua Nguyen Lieu</div>';
  var availMats = [];
  for (var mm in h.materials) {
    availMats.push({ id: mm, qty: h.materials[mm] });
  }
  if (availMats.length > 0) {
    html += '<div class="mat-buy-grid">';
    for (var mi2 = 0; mi2 < availMats.length; mi2++) {
      var matInfo = availMats[mi2];
      var mName2 = matInfo.id;
      for (var mi3 = 0; mi3 < MAP_DATA.length; mi3++) {
        if (MAP_DATA[mi3].mat1Id === matInfo.id) mName2 = MAP_DATA[mi3].mat1Name;
        if (MAP_DATA[mi3].mat2Id === matInfo.id) mName2 = MAP_DATA[mi3].mat2Name;
      }
      var price = 5 + rand(0, 5);
      var repDiscount = Math.min(30, state.town.reputation * 0.15);
      var finalPrice = Math.max(1, Math.floor(price * (100 - repDiscount) / 100));
      html += '<div class="mat-buy-item">' +
        mName2 + ' x' + matInfo.qty + ' - ' + finalPrice + ' vang/mon ' +
        (finalPrice < price ? '<span class="rep-discount">(-' + Math.floor(repDiscount) + '%)</span>' : '') +
        '<button class="btn btn-sm" onclick="event.stopPropagation();buyHunterMaterials(state.hunters[' + idx + '],\'' + matInfo.id + '\',1,' + price + ')">Mua 1</button>' +
        '<button class="btn btn-sm" onclick="event.stopPropagation();buyHunterMaterials(state.hunters[' + idx + '],\'' + matInfo.id + '\',' + Math.min(matInfo.qty, 10) + ',' + price + ')">Mua 10</button>' +
        '</div>';
    }
    html += '</div>';
  } else {
    html += '<div class="gray">Tho san chua co nguyen lieu nao.</div>';
  }

  html += '</div>';
  return html;
}

function selectHunter(idx) {
  selectedHunterIdx = (selectedHunterIdx === idx) ? -1 : idx;
  renderAll();
}

function confirmFire(idx) {
  if (confirm('Ban chac chan muon sa thai ' + state.hunters[idx].name + '?')) {
    fireHunter(idx);
  }
}

// ========== CHE TAO ==========

function renderCraft(main) {
  var html = headerHTML();
  html += '<div class="tab-title">Xuong Che Tao</div>';
  html += '<div class="section-title">Xuong cap ' + state.town.buildings.workshop + ' | Giam ' + (100 - BUILDING_DATA[3].effect(state.town.buildings.workshop)) + '% nguyen lieu</div>';

  var recipes = getCraftRecipes();
  if (recipes.length === 0) {
    html += '<div class="empty-msg">Nang cap xuong de mo cong thuc che tao.</div>';
    main.innerHTML = html;
    return;
  }

  if (craftTimer !== null && craftRecipe) {
    var pct = Math.round((1 - craftRemaining / craftRecipe.time) * 100);
    html += '<div class="crafting-active">' +
      'Dang che tao: ' + craftRecipe.name + '... ' + bar(craftRemaining, craftRecipe.time, 10) +
      '</div>';
  }

  html += '<div class="recipe-grid">';
  for (var i = 0; i < recipes.length; i++) {
    var r = recipes[i];
    var can = canCraft(r);
    var sel = (i === selectedRecipeIdx) ? ' recipe-selected' : '';
    html += '<div class="recipe-card' + sel + '" onclick="selectRecipe(' + i + ')">' +
      '<div class="recipe-name">' + r.equipTypeName + ' - ' + r.name + '</div>' +
      '<div class="recipe-detail">Cap ' + r.level + ' | ' + r.cost + ' vang | ' + r.time + 's</div>' +
      '<div class="recipe-detail">Can: ';
    for (var m in r.mats) {
      var mName = m;
      for (var mi = 0; mi < MAP_DATA.length; mi++) {
        if (MAP_DATA[mi].mat1Id === m) mName = MAP_DATA[mi].mat1Name;
        if (MAP_DATA[mi].mat2Id === m) mName = MAP_DATA[mi].mat2Name;
      }
      var have = state.materials[m] || 0;
      html += mName + ' ' + have + '/' + r.mats[m] + ' ';
    }
    html += '</div>';
    if (selectedRecipeIdx === i) {
      html += '<button class="btn btn-craft" onclick="event.stopPropagation();startCraft(' + i + ')" ' +
        (!can || craftTimer ? 'disabled' : '') + '>' + (can ? 'Che Tao' : 'Thieu nguyen lieu') + '</button>';
    }
    html += '</div>';
  }
  html += '</div>';
  main.innerHTML = html;
}

function selectRecipe(idx) {
  selectedRecipeIdx = (selectedRecipeIdx === idx) ? -1 : idx;
  renderAll();
}

function startCraft(idx) {
  if (craftTimer) return;
  var recipes = getCraftRecipes();
  if (idx < 0 || idx >= recipes.length) return;
  var r = recipes[idx];
  if (!canCraft(r)) return;
  craftRecipe = r;
  craftRemaining = r.time;
  craftTimer = 1;
  showNotification('Bat dau che tao: ' + r.name);
  renderAll();
}

// ========== CUA HANG ==========

function renderShop(main) {
  var html = headerHTML();
  html += '<div class="tab-title">Cua Hang</div>';

  if (state.merchant) {
    var rem = Math.max(0, Math.floor((state.merchant.departTime - Date.now()) / 60000));
    html += '<div class="merchant-banner">Thuong nhan dang o lai ' + rem + ' phut | Gia x ' + state.merchant.priceMul.toFixed(2) +
      ' <button class="btn btn-sm" onclick="doMerchantDeal()">Ban Tat Ca</button></div>';
  }

  html += '<div class="section-title">Do Dang Ban (tu dong len ke sau khi che tao)</div>';
  var anyItem = false;
  for (var i = 0; i < state.shop.slots.length; i++) {
    var eq = state.shop.slots[i];
    if (eq) {
      anyItem = true;
      var qd = QUALITY_DATA[eq.quality];
      html += '<div class="shop-item" style="border-left: 3px solid ' + qd.color + '">' +
        '<div style="color:' + qd.color + '">' + eq.name + ' (Lv.' + eq.level + ', ' + qd.label + ')</div>' +
        '<div>' + eq.typeName + ' | Sat thuong: ' + eq.calcStat + ' | Do ben: ' + eq.durability + '</div>';
      if (eq.bonusStats.length > 0) {
        html += '<div class="bonus-stats">';
        for (var b = 0; b < eq.bonusStats.length; b++) {
          html += '<span class="bonus-tag">' + eq.bonusStats[b] + '</span> ';
        }
        html += '</div>';
      }
      html += '<div class="shop-price">Gia: ' + (eq.shopPrice || eq.price || 100) + ' vang (tu dong)</div>';
      if (eq._soldTo) {
        html += '<div class="gray">Da dat mua boi ' + eq._soldTo + '</div>';
      }
      html += '</div>';
    }
  }
  if (!anyItem) html += '<div class="empty-msg">Khong co do tren ke. Che tao o tab Che Tao.</div>';
  html += '<div style="font-size:11px;color:#555;margin-top:8px">Tho san tu dong ghe mua khi o trong thi tran.</div>';

  main.innerHTML = html;
}

function addToShopSlot(equipId) {
  renderAll();
}

// ========== THI TRAN ==========

function renderTown(main) {
  var html = headerHTML();
  html += '<div class="tab-title">Thi Tran</div>';
  html += '<div class="section-title">Cap thi tran: ' + state.town.level + '</div>';

  var repCap = 500;
  html += '<div class="town-info">';
  html += '<div class="hunter-stat-row">Vang: ' + fmt(state.town.gold) + '</div>';
  html += '<div class="hunter-stat-row">Danh Tieng: ' + bar(state.town.reputation, repCap, 10) + '</div>';
  html += '<div class="hunter-stat-row">Thue suat: ' + Math.min(40, BUILDING_DATA[5].effect(state.town.buildings.taxOffice)).toFixed(0) + '%</div>';

  var wc = BUILDING_DATA[6].effect(state.town.buildings.warehouse);
  var matCount = 0;
  for (var m in state.materials) matCount += state.materials[m];
  html += '<div class="hunter-stat-row">Kho: ' + matCount + '/' + wc.mat + ' nguyen lieu, ' + state.equipment.length + '/' + wc.equip + ' trang bi</div>';

  var repDiscount2 = Math.min(30, state.town.reputation * 0.15);
  html += '<div class="hunter-stat-row">Giam gia nguyen lieu: ' + repDiscount2.toFixed(0) + '%</div>';
  html += '<div class="hunter-stat-row">Rank thien vi: +' + Math.floor(state.town.reputation / 30) + ' trong so rank cao</div>';
  html += '</div>';

  html += '<div class="section-title">Danh Tieng - Co Che</div>';
  html += '<div class="building-card" style="font-size:11px;color:#999;line-height:1.6">';
  html += '<b style="color:#88dd88">Tang:</b> Mua nguyen lieu (+0.5), ban do (+1), nang thi tran (+5), nhan nhiem vu (+2-5)<br>';
  html += '<b style="color:#dd8888">Giam:</b> Tho san bo di (-2)<br>';
  html += '<b style="color:#88aacc">Anh huong:</b> Rank tho san xuat hien cao hon, gia nguyen lieu re hon, thuong nhan ghe nhieu hon, tho san o lau hon';

  html += '</div>';

  html += '<div class="section-title">Cong Trinh</div>';
  for (var i = 0; i < BUILDING_DATA.length; i++) {
    var bd = BUILDING_DATA[i];
    var lvl = state.town.buildings[bd.id];
    var maxLvl = Math.min(bd.maxLevel, state.town.level * 2);
    var effText = bd.effText(lvl);
    var canUp = lvl < maxLvl && lvl < bd.maxLevel;
    var upCost = Math.floor(bd.baseCost * Math.pow(bd.costMult, lvl));
      html += '<div class="building-card">' +
        '<div class="building-header">' + bd.name + ' (cap ' + lvl + '/' + bd.maxLevel + ')</div>' +
      '<div class="building-effect">' + bd.desc + ': ' + effText + '</div>';
    if (canUp) {
      var hasGold = state.town.gold >= upCost;
      html += '<div class="building-upgrade">' +
        'Nang cap: ' + upCost + ' vang ' +
        '<button class="btn btn-sm ' + (hasGold ? 'btn-upgrade' : 'btn-disabled') + '" onclick="upgradeBuilding(\'' + bd.id + '\')" ' +
        (hasGold ? '' : 'disabled') + '>Nang</button>' +
        '</div>';
    } else if (lvl >= bd.maxLevel) {
      html += '<div class="gray">Da dat cap toi da (' + bd.maxLevel + ').</div>';
    } else {
      html += '<div class="gray">Can thi tran cap ' + Math.ceil(lvl/2) + ' (toi da ' + maxLvl + ').</div>';
    }
    html += '</div>';
  }

  html += '<div class="section-title">Nang Cap Thi Tran</div>';
  var nextLvl = state.town.level + 1;
  var upCost2 = Math.floor(500 * Math.pow(1.5, state.town.level));
  var canUp2 = state.town.gold >= upCost2;
  html += '<div class="building-card">' +
    'Nang thi tran len cap ' + nextLvl + ': ' + upCost2 + ' vang' +
    ' <button class="btn btn-sm ' + (canUp2 ? 'btn-upgrade' : 'btn-disabled') + '" onclick="upgradeTown()" ' +
    (canUp2 ? '' : 'disabled') + '>Nang</button>' +
    '</div>';

  html += '<div style="margin-top:24px;padding-top:12px;border-top:1px solid #222;text-align:center">' +
    '<button class="btn btn-danger" onclick="resetGame()" style="font-size:11px">Xoa Du Lieu Game</button>' +
    '<div style="font-size:10px;color:#444;margin-top:4px">Xoa het tien trinh va bat dau lai</div>' +
    '</div>';

  main.innerHTML = html;
}

function upgradeBuilding(buildingId) {
  var bd = null;
  for (var i = 0; i < BUILDING_DATA.length; i++) {
    if (BUILDING_DATA[i].id === buildingId) { bd = BUILDING_DATA[i]; break; }
  }
  if (!bd) return;
  var lvl = state.town.buildings[buildingId];
  var maxLvl = Math.min(bd.maxLevel, state.town.level * 2);
  if (lvl >= maxLvl || lvl >= bd.maxLevel) return;
  var cost = Math.floor(bd.baseCost * Math.pow(bd.costMult, lvl));
  if (state.town.gold < cost) return;
  state.town.gold -= cost;
  state.town.buildings[buildingId]++;
  state.totalUpgrades++;
  addQuestProgress('upgrade', 1);
  saveGame();
  renderAll();
}

function upgradeTown() {
  var cost = Math.floor(500 * Math.pow(1.5, state.town.level));
  if (state.town.gold < cost) return;
  state.town.gold -= cost;
  state.town.level++;
  for (var b in state.town.buildings) {
    var maxLvl = Math.min(50, state.town.level * 2);
    if (state.town.buildings[b] > maxLvl) {
      state.town.buildings[b] = maxLvl;
    }
  }
  state.town.reputation = Math.min(500, state.town.reputation + 5);
  showNotification('Thi tran len cap ' + state.town.level + '!');
  saveGame();
  renderAll();
}

function showConfirmModal(title, body, onConfirm) {
  var overlay = document.getElementById('modal-overlay');
  var titleEl = document.getElementById('modal-title');
  var bodyEl = document.getElementById('modal-body');
  var actionsEl = document.getElementById('modal-actions');
  if (!overlay || !titleEl || !bodyEl || !actionsEl) return;
  titleEl.textContent = title;
  bodyEl.textContent = body;
  actionsEl.innerHTML =
    '<button class="modal-btn modal-btn-confirm" id="modal-confirm-btn">Xac Nhan</button>' +
    '<button class="modal-btn modal-btn-cancel" id="modal-cancel-btn">Huy</button>';
  overlay.style.display = 'flex';
  var confirmed = false;
  var cleanup = function() {
    overlay.style.display = 'none';
    var c = document.getElementById('modal-confirm-btn');
    var c2 = document.getElementById('modal-cancel-btn');
    if (c) c.replaceWith(c.cloneNode(true));
    if (c2) c2.replaceWith(c2.cloneNode(true));
  };
  document.getElementById('modal-confirm-btn').addEventListener('click', function() {
    cleanup();
    if (onConfirm) onConfirm();
  });
  document.getElementById('modal-cancel-btn').addEventListener('click', function() {
    cleanup();
  });
}

function showAlertModal(msg) {
  var overlay = document.getElementById('modal-overlay');
  var titleEl = document.getElementById('modal-title');
  var bodyEl = document.getElementById('modal-body');
  var actionsEl = document.getElementById('modal-actions');
  if (!overlay || !titleEl || !bodyEl || !actionsEl) return;
  titleEl.textContent = 'Thong Bao';
  bodyEl.textContent = msg;
  actionsEl.innerHTML = '<button class="modal-btn modal-btn-cancel" id="modal-alert-ok">Dong</button>';
  overlay.style.display = 'flex';
  var btn = document.getElementById('modal-alert-ok');
  if (btn) {
    btn.addEventListener('click', function() {
      overlay.style.display = 'none';
    });
  }
}

function resetGame() {
  showConfirmModal('Xoa Du Lieu Game?', 'Tat ca tien trinh se mat! Ban chac chan muon bat dau lai tu dau?', function() {
    showConfirmModal('Xac Nhan Lan Cuoi', 'Xoa toan bo du lieu va khoi dong lai game?', function() {
      localStorage.removeItem('phothosan_save');
      state = null;
      var gc = document.getElementById('game-container');
      if (gc) gc.innerHTML = '<div class="intro-screen" style="padding:40px 20px;text-align:center"><div class="intro-title">DA XOA</div><div class="intro-story">Da xoa toan bo du lieu. Trang se tai lai...</div></div>';
      setTimeout(function() { window.location.reload(); }, 1500);
    });
  });
}

// ========== NHIEM VU ==========

function renderQuests(main) {
  var html = headerHTML();
  html += '<div class="tab-title">Nhiem Vu Ngay</div>';
  html += '<div class="section-title">Hom nay: ' + state.questDay + '</div>';

  var quests = state.dailyQuests;
  if (quests.length === 0) {
    html += '<div class="empty-msg">Dang cap nhat nhiem vu...</div>';
  } else {
    for (var i = 0; i < quests.length; i++) {
      var q = quests[i];
      var barLen = 10;
      var filled = Math.round((q.progress / q.target) * barLen);
      if (filled > barLen) filled = barLen;
      var barStr = '[';
      for (var b = 0; b < barLen; b++) barStr += (b < filled) ? '|' : ' ';
      barStr += '] ' + q.progress + '/' + q.target;
      var status = '';
      if (q.claimed) {
        status = ' <span class="claimed-label">Da nhan</span>';
      } else if (q.completed) {
        status = ' <span class="completed-label">Hoan thanh!</span>';
      }
      html += '<div class="quest-card">' +
        '<div class="quest-desc">' + q.desc + status + '</div>' +
        '<div class="quest-progress">' + barStr + '</div>' +
        '<div class="quest-reward">Thuong: ' + fmt(q.reward.gold) + ' vang, +' + q.reward.rep + ' danh tieng</div>';
      if (q.completed && !q.claimed) {
        html += '<button class="btn btn-claim" onclick="claimQuest(' + i + ')">Nhan Thuong</button>';
      }
      html += '</div>';
    }
  }
  main.innerHTML = html;
}

// ========== KHO ==========

function renderStorage(main) {
  var html = headerHTML();
  html += '<div class="tab-title">Kho Bai</div>';

  html += '<div class="section-title">Nguyen Lieu Trong Kho</div>';
  var matCount = 0;
  var wc = BUILDING_DATA[6].effect(state.town.buildings.warehouse);
  for (var m in state.materials) {
    var mName = m;
    for (var mi = 0; mi < MAP_DATA.length; mi++) {
      if (MAP_DATA[mi].mat1Id === m) mName = MAP_DATA[mi].mat1Name;
      if (MAP_DATA[mi].mat2Id === m) mName = MAP_DATA[mi].mat2Name;
    }
    html += '<div class="mat-item"><span class="mat-name">' + mName + '</span> x' + state.materials[m] + '</div>';
    matCount += state.materials[m];
  }
  if (matCount === 0) html += '<div class="empty-msg">Kho trong. Mua nguyen lieu tu tho san.</div>';
  html += '<div class="gray">Tong: ' + matCount + '/' + wc.mat + ' cho</div>';

  html += '<div class="section-title">Trang Bi Trong Kho</div>';
  var wc2 = BUILDING_DATA[6].effect(state.town.buildings.warehouse);
  for (var j = 0; j < state.equipment.length; j++) {
    var eq = state.equipment[j];
    var qd = QUALITY_DATA[eq.quality];
    html += '<div class="storage-item" style="border-left:3px solid ' + qd.color + '">' +
      '<span style="color:' + qd.color + '">' + eq.name + ' (Lv.' + eq.level + ', ' + qd.label + ')</span>' +
      ' | ' + eq.typeName + ' | Sat thuong: ' + eq.calcStat +
      ' | Do ben: ' + eq.durability +
      ' | Gia: ' + (eq.shopPrice || eq.price || 100) + ' vang' +
      '</div>';
  }
  if (state.equipment.length === 0) html += '<div class="empty-msg">Khong co do trong kho. Che tao do o tab Che Tao.</div>';
  html += '<div class="gray">Tong: ' + state.equipment.length + '/' + wc2.equip + ' cho</div>';

  main.innerHTML = html;
}
