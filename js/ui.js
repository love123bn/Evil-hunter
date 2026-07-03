// ============================================
// UI.JS - Render giao dien nguoi dung
// ============================================

var currentTab = 'town';
var currentSubTab = null;
var heroDetailId = null;
var bossTabView = 'team'; // 'team' or 'list'

// -------- RENDER TAT CA --------
function renderAll() {
    renderHeader();
    renderTabs();
    renderContent();
    renderLog();
}

// -------- RENDER HEADER --------
function renderHeader() {
    var html = '<div class="header">';
    html += '<div class="game-title">EVIL HUNTER TYCONN</div>';
    html += '<div class="header-stats">';
    html += '<span class="stat">Vang: <b id="vangDisplay">' + formatNumber(G.vang) + '</b></span>';
    html += '<span class="stat">Ve Goi: <b id="veDisplay">' + G.veGoi + '</b></span>';
    html += '<span class="stat">Hero: <b>' + G.heroes.length + '</b></span>';
    html += '<span class="stat">Do Kho: <b>' + DIFFICULTY_NAMES[G.doKho] + '</b></span>';
    html += '<span class="stat">Tong Cap: <b>' + G.tongCapHero + '</b></span>';
    html += '</div>';
    html += '</div>';
    document.getElementById('header').innerHTML = html;
}

// -------- RENDER TABS --------
function renderTabs() {
    var tabs = [
        { id: 'town', name: 'Thi Tran' },
        { id: 'heroes', name: 'Hero' },
        { id: 'hunting', name: 'San Quai' },
        { id: 'gacha', name: 'Trieu Hoi' },
        { id: 'craft', name: 'Che Tao' },
        { id: 'boss', name: 'Boss' },
        { id: 'stats', name: 'Thong Ke' }
    ];
    
    var html = '<div class="tabs">';
    for (var i = 0; i < tabs.length; i++) {
        var active = tabs[i].id === currentTab ? ' active' : '';
        html += '<button class="tab-btn' + active + '" onclick="switchTab(\'' + tabs[i].id + '\')">' + tabs[i].name + '</button>';
    }
    html += '</div>';
    
    document.getElementById('tabs').innerHTML = html;
}

function switchTab(tabId) {
    currentTab = tabId;
    currentSubTab = null;
    heroDetailId = null;
    renderAll();
}

// -------- RENDER CONTENT --------
function renderContent() {
    var container = document.getElementById('content');
    
    switch (currentTab) {
        case 'town': renderTown(container); break;
        case 'heroes': renderHeroes(container); break;
        case 'hunting': renderHunting(container); break;
        case 'gacha': renderGacha(container); break;
        case 'craft': renderCraft(container); break;
        case 'boss': renderBoss(container); break;
        case 'stats': renderStats(container); break;
        default: renderTown(container); break;
    }
}

// ======== TAB: THI TRAN ========
function renderTown(container) {
    var html = '<div class="panel">';
    
    // Subtabs
    html += '<div class="subtabs">';
    html += '<button class="subtab-btn' + (currentSubTab === null || currentSubTab === 'buildings' ? ' active' : '') + '" onclick="switchSubTab(\'buildings\')">Nha Cua</button>';
    html += '<button class="subtab-btn' + (currentSubTab === 'resources' ? ' active' : '') + '" onclick="switchSubTab(\'resources\')">Tai Nguyen</button>';
    html += '<button class="subtab-btn' + (currentSubTab === 'necessities' ? ' active' : '') + '" onclick="switchSubTab(\'necessities\')">Nhu Yeu Pham</button>';
    html += '</div>';
    
    var subTab = currentSubTab || 'buildings';
    
    if (subTab === 'buildings') {
        html += renderTownBuildings();
    } else if (subTab === 'resources') {
        html += renderTownResources();
    } else if (subTab === 'necessities') {
        html += renderTownNecessities();
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function renderTownBuildings() {
    var html = '<div class="section-title">Cac Toa Nha Trong Thi Tran</div>';
    html += '<div class="buildings-grid">';
    
    for (var bId in BUILDINGS) {
        if (BUILDINGS.hasOwnProperty(bId)) {
            var bData = BUILDINGS[bId];
            var level = G.town.buildings[bId].level;
            var cost = tinhChiPhiNangCap(bId);
            var maxed = level >= bData.maxLevel;
            
            html += '<div class="building-card">';
            html += '<div class="building-name">' + bData.name + '</div>';
            html += '<div class="building-desc">' + bData.moTa + '</div>';
            html += '<div class="building-level">Cap: ' + level + '/' + bData.maxLevel + '</div>';
            
            if (!maxed) {
                html += '<div class="building-cost">Phi: ' + cost.gold + ' vang';
                if (cost.wood) html += ' | Go: ' + cost.wood;
                if (cost.stone) html += ' | Da: ' + cost.stone;
                if (cost.iron) html += ' | Sat: ' + cost.iron;
                html += '</div>';
                html += '<button class="btn btn-sm" onclick="nangCapToaNha(\'' + bId + '\')">Nang Cap</button>';
            } else {
                html += '<div class="text-muted">Da dat cap toi da</div>';
            }
            
            html += '</div>';
        }
    }
    
    html += '</div>';
    return html;
}

function renderTownResources() {
    var html = '<div class="section-title">Tai Nguyen Trong Kho</div>';
    html += '<div class="resources-grid">';
    
    for (var rId in RESOURCES) {
        if (RESOURCES.hasOwnProperty(rId)) {
            var rData = RESOURCES[rId];
            var soLuong = G.town.resources[rId] || 0;
            var giaMua = getResourceBuyPrice(rId);
            
            html += '<div class="resource-item">';
            html += '<span class="resource-name">' + rData.name + '</span>';
            html += '<span class="resource-count">' + soLuong + '</span>';
            html += '<span class="resource-price">' + giaMua + ' vang/cai</span>';
            html += '<button class="btn btn-xs" onclick="muaTaiNguyen(\'' + rId + '\')" ' + (G.vang >= giaMua ? '' : 'disabled') + '>Mua 1</button>';
            html += '<button class="btn btn-xs" onclick="muaTaiNguyenNhieu(\'' + rId + '\')" ' + (G.vang >= giaMua * 10 ? '' : 'disabled') + '>Mua 10</button>';
            html += '</div>';
        }
    }
    
    html += '</div>';
    return html;
}

function renderTownNecessities() {
    var html = '<div class="section-title">Nhu Yeu Pham - San Xuat tu Tai Nguyen</div>';
    html += '<div class="resources-grid">';
    
    for (var nId in NECESSITIES) {
        if (NECESSITIES.hasOwnProperty(nId)) {
            var nData = NECESSITIES[nId];
            var soLuong = G.town.necessities[nId] || 0;
            
            html += '<div class="resource-item">';
            html += '<span class="resource-name">' + nData.name + '</span>';
            html += '<span class="resource-count">' + soLuong + '</span>';
            html += '<div class="resource-desc">' + nData.moTa + '</div>';
            html += '<div class="resource-cost">Can: ';
            var first = true;
            for (var nl in nData.nguyenLieu) {
                if (nData.nguyenLieu.hasOwnProperty(nl)) {
                    if (!first) html += ', ';
                    var rName = RESOURCES[nl] ? RESOURCES[nl].name : nl;
                    html += rName + ': ' + nData.nguyenLieu[nl];
                    first = false;
                }
            }
            html += '</div>';
            html += '<button class="btn btn-xs" onclick="sanXuatNhuYeuPham(\'' + nId + '\')">San Xuat</button>';
            html += '</div>';
        }
    }
    
    html += '</div>';
    return html;
}

function switchSubTab(subTab) {
    currentSubTab = subTab;
    renderAll();
}

// -------- MUA TAI NGUYEN --------
function muaTaiNguyen(resourceId) {
    var gia = getResourceBuyPrice(resourceId);
    if (G.vang < gia) {
        addLog('Khong du vang!', 'error');
        return;
    }
    G.vang -= gia;
    G.town.resources[resourceId] = (G.town.resources[resourceId] || 0) + 1;
    addLog('Da mua 1 ' + RESOURCES[resourceId].name + '!', 'info');
    renderAll();
}

function muaTaiNguyenNhieu(resourceId) {
    var gia = getResourceBuyPrice(resourceId) * 10;
    if (G.vang < gia) {
        addLog('Khong du vang!', 'error');
        return;
    }
    G.vang -= gia;
    G.town.resources[resourceId] = (G.town.resources[resourceId] || 0) + 10;
    addLog('Da mua 10 ' + RESOURCES[resourceId].name + '!', 'info');
    renderAll();
}

// ======== TAB: HERO ========
function renderHeroes(container) {
    var html = '<div class="panel">';
    
    if (heroDetailId) {
        html += renderHeroDetail(heroDetailId);
    } else {
        html += '<div class="section-title">Danh Sach Hero (' + G.heroes.length + ')</div>';
        
        if (G.heroes.length === 0) {
            html += '<div class="empty-state">Chua co hero nao. Hay den Cong Truyen Tong de goi hero!</div>';
        } else {
            html += '<div class="hero-list">';
            for (var i = 0; i < G.heroes.length; i++) {
                html += renderHeroCard(G.heroes[i]);
            }
            html += '</div>';
        }
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function renderHeroCard(hero) {
    var tierColor = HERO_TIERS[hero.tier].color;
    var statusText = '';
    var statusClass = '';
    
    if (!hero.conSong) { statusText = 'CHET'; statusClass = 'status-dead'; }
    else if (hero.trangThai === 'san') { statusText = 'DANG SAN'; statusClass = 'status-hunt'; }
    else if (hero.trangThai === 'boss') { statusText = 'DANH BOSS'; statusClass = 'status-boss'; }
    else if (hero.trangThai === 'nhanh') { statusText = 'SANH SANG'; statusClass = 'status-idle'; }
    
    var hpPct = Math.floor(hero.hp / hero.hpMax * 100);
    
    var html = '<div class="hero-card" onclick="showHeroDetail(\'' + hero.id + '\')">';
    html += '<div class="hero-card-header">';
    html += '<span class="hero-class" style="color:' + tierColor + '">[' + hero.tierName + '] ' + hero.className + '</span>';
    html += '<span class="hero-level">Cap ' + hero.level + '</span>';
    html += '<span class="' + statusClass + '">' + statusText + '</span>';
    html += '</div>';
    html += '<div class="hero-card-body">';
    html += '<div class="stat-bar"><span>HP</span><div class="bar-bg"><div class="bar-fill" style="width:' + hpPct + '%"></div></div><span>' + hero.hp + '/' + hero.hpMax + '</span></div>';
    html += '<div class="hero-stats-mini">ATK:' + hero.atk + ' DEF:' + hero.def + ' Crit:' + hero.crit + '%</div>';
    html += '<div class="hero-stats-mini">Vang:' + hero.vangRieng + ' | Stamina:' + hero.stamina + '/' + hero.staminaMax + '</div>';
    if (hero.tinhCach) {
        html += '<div class="hero-trait">' + hero.tinhCach.name + ' (' + (hero.tinhCach.loai === 'tot' ? '+' : '') + hero.tinhCach.bonus + ' ' + hero.tinhCach.effect + ')</div>';
    }
    html += '</div>';
    html += '</div>';
    
    return html;
}

function renderHeroDetail(heroId) {
    var hero = timHero(heroId);
    if (!hero) {
        heroDetailId = null;
        return '<div>Khong tim thay hero</div>';
    }
    
    var tierColor = HERO_TIERS[hero.tier].color;
    var hpPct = Math.floor(hero.hp / hero.hpMax * 100);
    var staminaPct = Math.floor(hero.stamina / hero.staminaMax * 100);
    var sucLucPct = Math.floor(hero.sucLuc / hero.sucLucMax * 100);
    var tinhThanPct = Math.floor(hero.tinhThan / hero.tinhThanMax * 100);
    
    var html = '<button class="btn btn-sm" onclick="heroDetailId=null;renderAll()">Quay Lai</button>';
    html += '<div class="hero-detail">';
    html += '<div class="detail-name" style="color:' + tierColor + '">[' + hero.tierName + '] ' + hero.className + ' - Cap ' + hero.level + '</div>';
    html += '<div class="detail-trait">Tinh cach: ' + (hero.tinhCach ? hero.tinhCach.name : 'Khong co') + '</div>';
    html += '<div class="detail-exp">EXP: ' + hero.exp + '/' + hero.expToNext + '</div>';
    
    html += '<div class="detail-section">Chi So</div>';
    html += '<div class="detail-stats">';
    html += '<div>HP: ' + hero.hp + '/' + hero.hpMax + ' (ATK: ' + hero.atk + ')</div>';
    html += '<div>DEF: ' + hero.def + ' | Crit: ' + hero.crit + '% | Toc Do: ' + hero.atkSpd + '</div>';
    html += '<div>Ne Tranh: ' + hero.evasion + '%</div>';
    html += '</div>';
    
    html += '<div class="stat-bar"><span>The Luc</span><div class="bar-bg"><div class="bar-fill" style="width:' + staminaPct + '%"></div></div><span>' + hero.stamina + '/' + hero.staminaMax + '</span></div>';
    html += '<div class="stat-bar"><span>Suc Luc</span><div class="bar-bg"><div class="bar-fill" style="width:' + sucLucPct + '%"></div></div><span>' + hero.sucLuc + '/' + hero.sucLucMax + '</span></div>';
    html += '<div class="stat-bar"><span>Tinh Than</span><div class="bar-bg"><div class="bar-fill" style="width:' + tinhThanPct + '%"></div></div><span>' + hero.tinhThan + '/' + hero.tinhThanMax + '</span></div>';
    
    // Trang bi
    html += '<div class="detail-section">Trang Bi</div>';
    html += '<div class="equipment-list">';
    for (var slot in hero.equipment) {
        if (hero.equipment.hasOwnProperty(slot)) {
            var eq = hero.equipment[slot];
            var slotName = getSlotName(slot);
            html += '<div class="eq-item">' + slotName + ': ';
            if (eq) {
                html += '<span style="color:' + eq.rarityColor + '">' + eq.rarityName + ' ' + eq.name + ' (+' + eq.bonus + ' ' + getStatName(eq.stat) + ')</span> ';
                html += '<button class="btn btn-xs" onclick="thaoTrangBi(\'' + hero.id + '\',\'' + slot + '\')">Thao</button>';
            } else {
                html += '<span class="text-muted">Trong</span>';
            }
            html += '</div>';
        }
    }
    html += '</div>';
    
    // Tui do
    html += '<div class="detail-section">Tui Do (Vang: ' + hero.vangRieng + ')</div>';
    if (hero.inventory.length === 0) {
        html += '<div class="text-muted">Tui do trong</div>';
    } else {
        for (var i = 0; i < hero.inventory.length; i++) {
            var item = hero.inventory[i];
            html += '<div class="inv-item">';
            if (item.slot) {
                html += '<span style="color:' + (item.rarityColor || '#fff') + '">' + item.rarityName + ' ' + item.name + ' (+' + item.bonus + ' ' + getStatName(item.stat) + ')</span>';
                html += ' <button class="btn btn-xs" onclick="trangBiChoHero(\'' + hero.id + '\',' + i + ')">Mac</button>';
            } else {
                html += item.name;
            }
            html += ' <button class="btn btn-xs btn-danger" onclick="xoaVatPham(timHero(\'' + hero.id + '\'),' + i + ');renderAll()">Xoa</button>';
            html += '</div>';
        }
    }
    
    // Hanh dong
    html += '<div class="detail-section">Hanh Dong</div>';
    html += '<div class="hero-actions">';
    
    if (!hero.conSong) {
        html += '<button class="btn btn-sm" onclick="hoiSinhHero(\'' + hero.id + '\')">Hoi Sinh</button>';
    } else if (hero.trangThai === 'nhanh') {
        html += '<button class="btn btn-sm" onclick="guiHeroDiSanTuChiTiet(\'' + hero.id + '\')">Di San</button>';
        html += '<button class="btn btn-sm" onclick="banTaiNguyen(timHero(\'' + hero.id + '\'));renderAll()">Ban Tai Nguyen</button>';
        
        // Them vao doi boss
        html += '<div style="margin-top:8px">Them vao doi danh boss: ';
        for (var s = 0; s < 5; s++) {
            var occupied = G.heroTrongDoi[s] !== null;
            html += '<button class="btn btn-xs" onclick="themVaoDoiBoss(\'' + hero.id + '\',' + s + ');renderAll()" ' + (occupied ? 'disabled' : '') + '>' + (s + 1) + '</button> ';
        }
        html += '</div>';
    } else if (hero.trangThai === 'san') {
        html += '<button class="btn btn-sm" onclick="goiHeroVe(\'' + hero.id + '\');renderAll()">Goi Ve</button>';
    }
    
    html += '</div>';
    
    html += '</div>';
    
    return html;
}

function showHeroDetail(heroId) {
    heroDetailId = heroId;
    renderAll();
}

function guiHeroDiSanTuChiTiet(heroId) {
    // Chon zone cao nhat co the
    var hero = timHero(heroId);
    if (!hero) return;
    
    for (var z = HUNTING_ZONES.length - 1; z >= 0; z--) {
        if (G.zones[z].unlocked && hero.level >= HUNTING_ZONES[z].levelMin) {
            guiHeroDiSan(heroId, z);
            renderAll();
            return;
        }
    }
    
    addLog('Khong co khu san phu hop!', 'error');
}

// ======== TAB: SAN QUAI ========
function renderHunting(container) {
    var html = '<div class="panel">';
    
    html += '<div class="section-title">Khu San Quai</div>';
    
    for (var z = 0; z < HUNTING_ZONES.length; z++) {
        var zoneData = HUNTING_ZONES[z];
        var zoneState = G.zones[z];
        var dangSan = zoneState.heroesDangSan.length;
        
        html += '<div class="zone-card">';
        html += '<div class="zone-name">' + zoneData.name + '</div>';
        html += '<div class="zone-desc">' + zoneData.moTa + '</div>';
        html += '<div class="zone-info">Cap: ' + zoneData.levelMin + '-' + zoneData.levelMax;
        html += ' | Vang: ' + zoneData.vangCoBan + ' | EXP: ' + zoneData.expCoBan + '</div>';
        html += '<div class="zone-info">Tai nguyen: ';
        var resources = [];
        for (var r = 0; r < zoneData.resources.length; r++) {
            var rn = RESOURCES[zoneData.resources[r]];
            if (rn) resources.push(rn.name);
        }
        html += resources.join(', ');
        html += '</div>';
        
        if (zoneState.unlocked) {
            html += '<div class="zone-heroes">Hero dang san: ' + dangSan + '</div>';
            if (dangSan > 0) {
                html += '<div class="zone-hero-list">';
                for (var i = 0; i < zoneState.heroesDangSan.length; i++) {
                    var h = timHero(zoneState.heroesDangSan[i]);
                    if (h) {
                        html += '<span class="zone-hero-tag">' + h.className + ' (Lv.' + h.level + ')</span> ';
                    }
                }
                html += '</div>';
            }
        } else {
            html += '<div class="zone-lock">Khoa - Can ' + zoneData.unlockCost + ' vang de mo</div>';
            html += '<button class="btn btn-sm" onclick="moKhoaKhuSan(' + z + ');renderAll()"' + (G.vang >= zoneData.unlockCost ? '' : ' disabled') + '>Mo Khoa</button>';
        }
        html += '</div>';
    }
    
    html += '<div style="margin-top:10px">';
    html += '<button class="btn" onclick="tuDongDiSan();renderAll()">Tu Dong Di San</button>';
    html += '<button class="btn btn-secondary" onclick="goiTatCaVe();renderAll()">Goi Tat Ca Ve</button>';
    html += '</div>';
    
    html += '</div>';
    container.innerHTML = html;
}

function goiTatCaVe() {
    for (var i = 0; i < G.heroes.length; i++) {
        if (G.heroes[i].trangThai === 'san') {
            goiHeroVe(G.heroes[i].id);
        }
    }
    addLog('Da goi tat ca hero ve!', 'info');
}

// ======== TAB: GACHA ========
function renderGacha(container) {
    var html = '<div class="panel">';
    
    html += '<div class="section-title">Cong Truyen Tong</div>';
    html += '<div class="gacha-info">';
    html += '<p>Su dung Ve Goi de trieu hoi hero moi. Moi ve can 20 vang.</p>';
    html += '<p>So ve: <b>' + G.veGoi + '</b></p>';
    html += '</div>';
    
    // Ti le
    html += '<div class="section-title">Ti Le Goi Hero</div>';
    html += '<div class="gacha-rates">';
    var rates = getGachaRateInfo();
    for (var i = 0; i < rates.length; i++) {
        html += '<div class="rate-row"><span>' + rates[i].tier + '</span><span>' + rates[i].rate + '</span><span>' + rates[i].multi + '</span></div>';
    }
    html += '</div>';
    
    html += '<div class="gacha-actions">';
    html += '<button class="btn btn-lg" onclick="goiHero(true);renderAll()">Goi 1 Hero (20 vang)</button>';
    html += '<button class="btn btn-lg" onclick="goi10Hero();renderAll()">Goi 10 Hero (200 vang)</button>';
    html += '</div>';
    
    // Hero moi nhat
    if (G.heroes.length > 0) {
        html += '<div class="section-title">Hero Moi Nhat</div>';
        var lastHero = G.heroes[G.heroes.length - 1];
        var tierColor = HERO_TIERS[lastHero.tier].color;
        html += '<div class="gacha-result" style="border-color:' + tierColor + '">';
        html += '<div style="color:' + tierColor + ';font-weight:bold">[' + lastHero.tierName + '] ' + lastHero.className + '</div>';
        html += '<div>Cap ' + lastHero.level + ' | Tinh cach: ' + (lastHero.tinhCach ? lastHero.tinhCach.name : 'Khong co') + '</div>';
        html += '<div>ATK:' + lastHero.atk + ' DEF:' + lastHero.def + ' HP:' + lastHero.hpMax + '</div>';
        html += '</div>';
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// ======== TAB: CHE TAO ========
function renderCraft(container) {
    var html = '<div class="panel">';
    
    // Subtabs
    html += '<div class="subtabs">';
    html += '<button class="subtab-btn' + (currentSubTab === null || currentSubTab === 'chetao' ? ' active' : '') + '" onclick="switchSubTab(\'chetao\')">Che Tao</button>';
    html += '<button class="subtab-btn' + (currentSubTab === 'kho' ? ' active' : '') + '" onclick="switchSubTab(\'kho\')">Kho Trang Bi</button>';
    html += '</div>';
    
    var subTab = currentSubTab || 'chetao';
    
    if (subTab === 'kho') {
        html += renderTownStorage();
        html += '</div>';
        container.innerHTML = html;
        return;
    }
    
    html += '<div class="section-title">Xuong Ren - Che Tao Trang Bi</div>';
    html += '<div class="craft-info">Chon hero de che tao trang bi cho ho, hoac che tao khong chon de bo vao kho.</div>';
    
    // Chon hero
    html += '<div class="section-title">Chon Hero (Neu co)</div>';
    html += '<select id="craftHeroSelect" class="select-input" onchange="renderAll()">';
    html += '<option value="">-- Khong chon --</option>';
    for (var i = 0; i < G.heroes.length; i++) {
        var h = G.heroes[i];
        var selected = (heroDetailId === h.id) ? 'selected' : '';
        html += '<option value="' + h.id + '" ' + selected + '>' + h.className + ' (Lv.' + h.level + ')</option>';
    }
    html += '</select>';
    
    // Danh sach trang bi
    html += '<div class="section-title">Cong Thuc Che Tao</div>';
    html += '<div class="craft-list">';
    
    var craftables = getCraftableItems();
    var selectedHeroId = document.getElementById('craftHeroSelect') ? document.getElementById('craftHeroSelect').value : '';
    
    for (var j = 0; j < craftables.length; j++) {
        var item = craftables[j];
        var duNguyenLieu = true;
        for (var nl in item.nguyenLieu) {
            if (item.nguyenLieu.hasOwnProperty(nl)) {
                if ((G.town.resources[nl] || 0) < item.nguyenLieu[nl]) {
                    duNguyenLieu = false;
                    break;
                }
            }
        }
        var phi = item.base * 3;
        
        html += '<div class="craft-item">';
        html += '<div class="craft-name">' + item.slotName + ': ' + item.name + '</div>';
        html += '<div class="craft-stats">+' + item.base + ' ' + getStatName(item.stat) + ' | Yeu cau cap: ' + item.levelReq + '</div>';
        html += '<div class="craft-cost">Nguyen lieu: ';
        var first = true;
        for (var nl2 in item.nguyenLieu) {
            if (item.nguyenLieu.hasOwnProperty(nl2)) {
                if (!first) html += ', ';
                var rName = RESOURCES[nl2] ? RESOURCES[nl2].name : nl2;
                var co = G.town.resources[nl2] || 0;
                html += rName + ': ' + co + '/' + item.nguyenLieu[nl2];
                first = false;
            }
        }
        html += ' | Phi: ' + phi + ' vang';
        html += '</div>';
        
        // Tim index
        var idx = -1;
        var templates = EQUIPMENT_TEMPLATES[item.slot];
        for (var k = 0; k < templates.length; k++) {
            if (templates[k].name === item.name) {
                idx = k;
                break;
            }
        }
        
        html += '<button class="btn btn-xs" onclick="cheTaoTrangBi(\'' + item.slot + '\',' + idx + ',\'' + selectedHeroId + '\');renderAll()"' + (duNguyenLieu && G.vang >= phi ? '' : ' disabled') + '>Che Tao</button>';
        html += '</div>';
    }
    
    html += '</div>';
    html += '</div>';
    
    container.innerHTML = html;
}

// ======== TAB: BOSS ========
function renderBoss(container) {
    var html = '<div class="panel">';
    
    html += '<div class="section-title">Dai Chien Boss</div>';
    
    // Doi hinh
    html += '<div class="section-title">Doi Danh Boss (toi da 5 hero)</div>';
    html += '<div class="boss-team">';
    for (var i = 0; i < 5; i++) {
        var hero = G.heroTrongDoi[i];
        html += '<div class="team-slot">';
        html += '<div class="slot-number">' + (i + 1) + '</div>';
        if (hero) {
            var tierColor = HERO_TIERS[hero.tier].color;
            html += '<div style="color:' + tierColor + '">' + hero.className + '</div>';
            html += '<div class="text-small">Lv.' + hero.level + ' | HP:' + hero.hp + '/' + hero.hpMax + '</div>';
            html += '<button class="btn btn-xs btn-danger" onclick="boKhoiDoiBoss(' + i + ');renderAll()">Bo</button>';
        } else {
            html += '<div class="text-muted">Trong</div>';
        }
        html += '</div>';
    }
    html += '</div>';
    
    // Danh sach boss
    html += '<div class="section-title">Danh Sach Boss</div>';
    html += '<div class="boss-list">';
    
    for (var b = 0; b < BOSSES.length; b++) {
        var bossData = BOSSES[b];
        var bossState = G.bosses[b];
        
        html += '<div class="boss-card">';
        html += '<div class="boss-name">' + bossData.name + '</div>';
        html += '<div class="boss-desc">' + bossData.moTa + '</div>';
        html += '<div class="boss-info">Yeu cau cap: ' + bossData.levelReq + ' | HP: ' + bossData.hp + ' | ATK: ' + bossData.atk + '</div>';
        html += '<div class="boss-info">Thuong: ' + bossData.vangThuong + ' vang, ' + bossData.expThuong + ' exp</div>';
        
        if (bossState.defeated) {
            html += '<div class="boss-defeated">DA DANH BAI</div>';
        } else if (bossState.dangDanh) {
            html += '<div class="boss-fighting">DANG CHIEN DAU... HP con: ' + bossState.hpHienTai + '</div>';
        } else {
            // Kiem tra co hero trong doi
            var coHero = false;
            for (var s = 0; s < G.heroTrongDoi.length; s++) {
                if (G.heroTrongDoi[s] !== null) { coHero = true; break; }
            }
            html += '<button class="btn btn-sm" onclick="batDauDanhBoss(' + b + ');renderAll()"' + (coHero ? '' : ' disabled') + '>Tan Cong</button>';
        }
        
        html += '</div>';
    }
    
    html += '</div>';
    html += '</div>';
    
    container.innerHTML = html;
}

// ======== TAB: THONG KE ========
function renderStats(container) {
    var html = '<div class="panel">';
    
    html += '<div class="section-title">Thong Ke Game</div>';
    html += '<div class="stats-grid">';
    html += '<div class="stat-item"><span class="stat-label">Quai da diet:</span><span class="stat-value">' + G.stats.quaiDaDiet + '</span></div>';
    html += '<div class="stat-item"><span class="stat-label">Boss da diet:</span><span class="stat-value">' + G.stats.bossDaDiet + '</span></div>';
    html += '<div class="stat-item"><span class="stat-label">Tong vang kiem:</span><span class="stat-value">' + formatNumber(G.stats.tongVangKiem) + '</span></div>';
    html += '<div class="stat-item"><span class="stat-label">So lan goi hero:</span><span class="stat-value">' + G.stats.tongGacha + '</span></div>';
    html += '<div class="stat-item"><span class="stat-label">So lan che tao:</span><span class="stat-value">' + G.stats.tongCheTao + '</span></div>';
    html += '<div class="stat-item"><span class="stat-label">Tong hero:</span><span class="stat-value">' + G.heroes.length + '</span></div>';
    html += '<div class="stat-item"><span class="stat-label">Tong cap hero:</span><span class="stat-value">' + G.tongCapHero + '</span></div>';
    html += '<div class="stat-item"><span class="stat-label">Do kho:</span><span class="stat-value">' + DIFFICULTY_NAMES[G.doKho] + '</span></div>';
    html += '<div class="stat-item"><span class="stat-label">Co the tang do kho:</span><span class="stat-value">' + (G.doKho < Math.min(G.lanTangHang, 2) ? 'Co' : 'Khong') + '</span></div>';
    html += '</div>';
    
    // Dieu chinh do kho
    html += '<div class="section-title">Dieu Chinh Do Kho</div>';
    html += '<div class="difficulty-control">';
    html += '<p>Tang do kho yeu cau 100 hero moi tang 1 lan (hien tai: ' + G.lanTangHang + ' lan).</p>';
    html += '<button class="btn btn-sm" onclick="tangDoKho();renderAll()"' + (G.doKho < Math.min(G.lanTangHang, 2) ? '' : ' disabled') + '>Tang Do Kho</button> ';
    html += '<button class="btn btn-sm" onclick="giamDoKho();renderAll()"' + (G.doKho > 0 ? '' : ' disabled') + '>Giam Do Kho</button>';
    html += '</div>';
    
    // Save/Load
    html += '<div class="section-title">Luu Game</div>';
    html += '<button class="btn btn-sm" onclick="saveGame();renderAll()">Luu Game</button> ';
    html += '<button class="btn btn-sm btn-danger" onclick="if(confirm(\'Ban co chac muon reset game?\'))resetGame()">Reset Game</button>';
    
    html += '</div>';
    container.innerHTML = html;
}

// ======== RENDER LOG ========
function renderLog() {
    var logs = getLogs(30);
    var html = '';
    
    for (var i = logs.length - 1; i >= 0; i--) {
        var log = logs[i];
        var typeClass = 'log-' + log.type;
        html += '<div class="log-item ' + typeClass + '"><span class="log-time">[' + log.time + ']</span> ' + log.msg + '</div>';
    }
    
    document.getElementById('log').innerHTML = html;
}

// -------- HELPERS --------
// ======== RENDER KHO TRANG BI ========
function renderTownStorage() {
    var html = '<div class="section-title">Kho Trang Bi Cua Thi Tran (' + townStorage.length + ')</div>';
    
    if (townStorage.length === 0) {
        html += '<div class="empty-state">Kho trong. Hay che tao trang bi va khong chon hero de bo vao kho.</div>';
        return html;
    }
    
    html += '<div class="section-title">Chon Hero de Nhan Do</div>';
    html += '<select id="storageHeroSelect" class="select-input" onchange="renderAll()">';
    html += '<option value="">-- Chon hero --</option>';
    for (var si = 0; si < G.heroes.length; si++) {
        var hSel = G.heroes[si];
        if (hSel.conSong) {
            html += '<option value="' + hSel.id + '">' + hSel.className + ' (Lv.' + hSel.level + ')</option>';
        }
    }
    html += '</select>';
    
    html += '<div class="craft-list">';
    for (var tj = 0; tj < townStorage.length; tj++) {
        var itemT = townStorage[tj];
        html += '<div class="craft-item">';
        html += '<div class="craft-name" style="color:' + itemT.rarityColor + '">' + itemT.rarityName + ' ' + itemT.name + '</div>';
        html += '<div class="craft-stats">+' + itemT.bonus + ' ' + getStatName(itemT.stat) + ' | Yeu cau cap: ' + itemT.levelReq + '</div>';
        
        var selHeroId = document.getElementById('storageHeroSelect') ? document.getElementById('storageHeroSelect').value : '';
        var coTheLay = false;
        if (selHeroId) {
            var selHero = timHero(selHeroId);
            if (selHero && selHero.level >= itemT.levelReq && selHero.inventory.length < 20) {
                coTheLay = true;
            }
        }
        
        html += '<button class="btn btn-xs" onclick="layVatPhamTuKhoChoHero(' + tj + ');renderAll()"' + (selHeroId && coTheLay ? '' : ' disabled') + '>Lay cho Hero</button>';
        html += '</div>';
    }
    html += '</div>';
    
    return html;
}

// -------- HELPERS --------
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}
