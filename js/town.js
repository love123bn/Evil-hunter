// ============================================
// TOWN.JS - He thong thi tran
// ============================================

// -------- NANG CAP TOA NHA --------
function nangCapToaNha(buildingId) {
    var building = BUILDINGS[buildingId];
    if (!building) return false;
    
    var currentLevel = G.town.buildings[buildingId].level;
    if (currentLevel >= building.maxLevel) {
        addLog('Toa nha ' + building.name + ' da dat cap toi da!', 'warning');
        return false;
    }
    
    var cost = tinhChiPhiNangCap(buildingId);
    if (G.vang < cost.gold) {
        addLog('Khong du vang de nang cap! Can ' + cost.gold + ' vang.', 'error');
        return false;
    }
    
    // Kiem tra tai nguyen
    if (cost.wood && G.town.resources.wood < cost.wood) {
        addLog('Khong du Go! Can ' + cost.wood + ' Go.', 'error');
        return false;
    }
    if (cost.stone && G.town.resources.stone < cost.stone) {
        addLog('Khong du Da! Can ' + cost.stone + ' Da.', 'error');
        return false;
    }
    if (cost.iron && G.town.resources.iron < cost.iron) {
        addLog('Khong du Sat! Can ' + cost.iron + ' Sat.', 'error');
        return false;
    }
    
    // Tru chi phi
    G.vang -= cost.gold;
    if (cost.wood) G.town.resources.wood -= cost.wood;
    if (cost.stone) G.town.resources.stone -= cost.stone;
    if (cost.iron) G.town.resources.iron -= cost.iron;
    
    // Nang cap
    currentLevel++;
    G.town.buildings[buildingId].level = currentLevel;
    
    addLog('Da nang cap ' + building.name + ' len cap ' + currentLevel + '!', 'success');
    return true;
}

// -------- TINH CHI PHI NANG CAP --------
function tinhChiPhiNangCap(buildingId) {
    var building = BUILDINGS[buildingId];
    var currentLevel = G.town.buildings[buildingId].level;
    
    var cost = {
        gold: Math.floor(building.baseCost.gold * Math.pow(building.costGrow.gold, currentLevel - 1))
    };
    
    // Them yeu cau tai nguyen theo cap
    if (currentLevel >= 3) {
        cost.wood = Math.floor(5 * Math.pow(1.3, currentLevel - 3));
    }
    if (currentLevel >= 5) {
        cost.stone = Math.floor(3 * Math.pow(1.3, currentLevel - 5));
    }
    if (currentLevel >= 8) {
        cost.iron = Math.floor(2 * Math.pow(1.2, currentLevel - 8));
    }
    
    return cost;
}

// -------- MO KHOA KHU SAN --------
function moKhoaKhuSan(zoneId) {
    var zone = HUNTING_ZONES[zoneId];
    if (!zone) return false;
    
    if (G.zones[zoneId].unlocked) {
        addLog('Khu san nay da duoc mo khoa!', 'warning');
        return false;
    }
    
    if (G.vang < zone.unlockCost) {
        addLog('Khong du vang! Can ' + zone.unlockCost + ' vang de mo khu san nay.', 'error');
        return false;
    }
    
    G.vang -= zone.unlockCost;
    G.zones[zoneId].unlocked = true;
    addLog('Da mo khoa: ' + zone.name + '!', 'success');
    return true;
}

// -------- THI TRAN TU DONG MUA NGUYEN LIEU --------
function tickTownAutoBuy() {
    // Moi 5 tick, thi tran mua tai nguyen tu hero
    if (G.tickCount % 5 !== 0) return;
    
    var heroes = G.heroes;
    if (heroes.length === 0) return;
    
    for (var i = 0; i < heroes.length; i++) {
        var h = heroes[i];
        if (!h.conSong || h.trangThai !== 'nhanh') continue;
        if (h.inventory.length > 0) {
            banTaiNguyen(h);
        }
    }
}

// -------- SAN XUAT NHU YEU PHAM --------
function sanXuatNhuYeuPham(necId) {
    var nec = NECESSITIES[necId];
    if (!nec) return false;
    
    // Kiem tra nguyen lieu
    for (var nl in nec.nguyenLieu) {
        if (nec.nguyenLieu.hasOwnProperty(nl)) {
            var current = G.town.resources[nl];
            if (!current || current < nec.nguyenLieu[nl]) {
                addLog('Khong du ' + RESOURCES[nl].name + '!', 'error');
                return false;
            }
        }
    }
    
    // Tieu thu nguyen lieu
    for (var nl2 in nec.nguyenLieu) {
        if (nec.nguyenLieu.hasOwnProperty(nl2)) {
            G.town.resources[nl2] -= nec.nguyenLieu[nl2];
        }
    }
    
    // San xuat
    var xuongRenLevel = G.town.buildings.xuongRen.level;
    var soLuong = 1 + Math.floor(xuongRenLevel / 3);
    G.town.necessities[necId] += soLuong;
    
    addLog('Da san xuat ' + soLuong + ' ' + nec.name + '!', 'success');
    return true;
}

// ------------- AUTO TU DONG HEAL HERO --------
function tickAutoHeal() {
    if (G.tickCount % 3 !== 0) return;
    
    for (var i = 0; i < G.heroes.length; i++) {
        var h = G.heroes[i];
        if (!h.conSong) continue;
        if (h.trangThai === 'nhanh') {
            heroNghi(h);
        }
    }
}

// -------- HOI SINH HERO --------
function hoiSinhHero(heroId) {
    var hero = timHero(heroId);
    if (!hero) return false;
    
    if (hero.conSong) {
        addLog('Hero nay van con song!', 'warning');
        return false;
    }
    
    var nhaThoLevel = G.town.buildings.nhaTho.level;
    var chiPhi = Math.floor(50 / (1 + nhaThoLevel * 0.2));
    
    if (G.vang < chiPhi) {
        addLog('Khong du vang de hoi sinh! Can ' + chiPhi + ' vang.', 'error');
        return false;
    }
    
    G.vang -= chiPhi;
    hero.conSong = true;
    hero.hp = Math.floor(hero.hpMax * 0.3);
    hero.stamina = Math.floor(hero.staminaMax * 0.5);
    hero.sucLuc = Math.floor(hero.sucLucMax * 0.5);
    hero.tinhThan = Math.floor(hero.tinhThanMax * 0.5);
    hero.trangThai = 'nhanh';
    
    addLog('Da hoi sinh ' + hero.className + '!', 'success');
    return true;
}

// -------- THONG TIN THI TRAN --------
function getTownInfo() {
    var info = [];
    
    for (var bId in BUILDINGS) {
        if (BUILDINGS.hasOwnProperty(bId)) {
            var bData = BUILDINGS[bId];
            var level = G.town.buildings[bId].level;
            info.push({
                id: bId,
                name: bData.name,
                moTa: bData.moTa,
                level: level,
                maxLevel: bData.maxLevel,
                cost: tinhChiPhiNangCap(bId)
            });
        }
    }
    
    return info;
}
