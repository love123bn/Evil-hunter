// ============================================
// CRAFTING.JS - He thong che tao trang bi
// ============================================

// ------------- DANH SACH TRANG BI CO THE CHE TAO --------
function getCraftableItems() {
    var danhSach = [];
    
    for (var slot in EQUIPMENT_TEMPLATES) {
        if (EQUIPMENT_TEMPLATES.hasOwnProperty(slot)) {
            var items = EQUIPMENT_TEMPLATES[slot];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                danhSach.push({
                    slot: slot,
                    slotName: getSlotName(slot),
                    name: item.name,
                    stat: item.stat,
                    base: item.base,
                    nguyenLieu: item.nguyenLieu,
                    levelReq: item.levelReq
                });
            }
        }
    }
    
    // Sap xep theo levelReq
    danhSach.sort(function(a, b) { return a.levelReq - b.levelReq; });
    
    return danhSach;
}

function getSlotName(slot) {
    var names = {
        vuKhi: 'Vu Khi',
        giap: 'Giap',
        mu: 'Mu',
        giay: 'Giay',
        nhan: 'Nhan',
        bua: 'Bua'
    };
    return names[slot] || slot;
}

function getStatName(stat) {
    var names = {
        atk: 'Tan Cong',
        def: 'Phong Thu',
        hp: 'Mau',
        crit: 'Chi Mang',
        evasion: 'Ne Tranh'
    };
    return names[stat] || stat;
}

// ------------- CHE TAO TRANG BI --------
function cheTaoTrangBi(slot, itemIndex, heroId) {
    var hero = null;
    if (heroId) {
        hero = timHero(heroId);
    }
    
    var items = EQUIPMENT_TEMPLATES[slot];
    if (!items || itemIndex < 0 || itemIndex >= items.length) {
        addLog('Trang bi khong ton tai!', 'error');
        return false;
    }
    
    var template = items[itemIndex];
    
    // Kiem tra cap do yeu cau
    if (hero && hero.level < template.levelReq) {
        addLog('Hero can dat cap ' + template.levelReq + '+ de che tao trang bi nay!', 'error');
        return false;
    }
    
    // Kiem tra nguyen lieu
    for (var nl in template.nguyenLieu) {
        if (template.nguyenLieu.hasOwnProperty(nl)) {
            var can = template.nguyenLieu[nl];
            var co = G.town.resources[nl] || 0;
            if (co < can) {
                addLog('Khong du ' + RESOURCES[nl].name + '! Can ' + can + ', co ' + co + '.', 'error');
                return false;
            }
        }
    }
    
    // Kiem tra vang
    var phiCheTao = Math.floor(template.base * 3);
    if (G.vang < phiCheTao) {
        addLog('Khong du vang de che tao! Can ' + phiCheTao + ' vang.', 'error');
        return false;
    }
    
    // Tru nguyen lieu
    for (var nl2 in template.nguyenLieu) {
        if (template.nguyenLieu.hasOwnProperty(nl2)) {
            G.town.resources[nl2] -= template.nguyenLieu[nl2];
        }
    }
    
    G.vang -= phiCheTao;
    
    // Tao trang bi
    var rarity = rollRarity();
    var rarityData = EQUIPMENT_RARITY[rarity];
    var bonus = Math.floor(template.base * rarityData.multi);
    
    var equipment = {
        slot: slot,
        name: template.name,
        rarity: rarity,
        rarityName: rarityData.name,
        rarityColor: rarityData.color,
        stat: template.stat,
        bonus: bonus,
        levelReq: template.levelReq
    };
    
    // Neu co hero, trang bi cho hero
    if (hero) {
        // Neu da co trang bi o slot do, bo vao inventory
        if (hero.equipment[slot]) {
            themVatPham(hero, hero.equipment[slot]);
        }
        hero.equipment[slot] = equipment;
        tinhLaiStats(hero);
        addLog('Da che tao ' + equipment.rarityName + ' ' + equipment.name + ' cho ' + hero.className + '! (+' + bonus + ' ' + getStatName(equipment.stat) + ')', 'success');
    } else {
        // Bo vao kho thi tran
        themVatPhamThiTran(equipment);
        addLog('Da che tao ' + equipment.rarityName + ' ' + equipment.name + '! Trang bi da duoc cat vao kho.', 'success');
    }
    
    G.stats.tongCheTao++;
    return true;
}

// ------------- ROLL DO HIEM --------
function rollRarity() {
    var rand = Math.random() * 100;
    // Thuong 50%, Cao Cap 30%, Huyen Thoai 15%, Thanh 5%
    if (rand < 5) return 3;
    if (rand < 20) return 2;
    if (rand < 50) return 1;
    return 0;
}

// ------------- KHO THI TRAN --------
var townStorage = [];

function themVatPhamThiTran(item) {
    townStorage.push(item);
    if (townStorage.length > 100) {
        townStorage.splice(0, townStorage.length - 80);
    }
}

function layVatPhamTuKho(index) {
    if (index >= 0 && index < townStorage.length) {
        return townStorage.splice(index, 1)[0];
    }
    return null;
}

// ------------- LAY VAT PHAM TU KHO CHO HERO --------
function layVatPhamTuKhoChoHero(index) {
    var heroInput = document.getElementById('storageHeroSelect');
    if (!heroInput) {
        addLog('Loi: Khong tim thay giao dien!', 'error');
        return false;
    }
    
    var heroId = heroInput.value;
    if (!heroId) {
        addLog('Chua chon hero!', 'error');
        return false;
    }
    
    var item = layVatPhamTuKho(index);
    if (!item) {
        addLog('Khong tim thay trang bi!', 'error');
        return false;
    }
    
    var hero = timHero(heroId);
    if (!hero) {
        addLog('Khong tim thay hero!', 'error');
        townStorage.splice(index, 0, item);
        return false;
    }
    
    if (!hero.conSong) {
        addLog('Hero nay da chet!', 'error');
        townStorage.splice(index, 0, item);
        return false;
    }
    
    if (hero.level < item.levelReq) {
        addLog('Hero can dat cap ' + item.levelReq + '+ de su dung trang bi nay!', 'error');
        townStorage.splice(index, 0, item);
        return false;
    }
    
    if (hero.inventory.length >= 20) {
        addLog('Tui do hero da day!', 'error');
        townStorage.splice(index, 0, item);
        return false;
    }
    
    // Neu hero da co trang bi o slot nay, thao ra
    if (hero.equipment[item.slot]) {
        hero.inventory.push(hero.equipment[item.slot]);
    }
    hero.equipment[item.slot] = item;
    tinhLaiStats(hero);
    
    addLog('Da trang bi ' + item.name + ' cho ' + hero.className + '!', 'success');
    return true;
}

// ------------- TRANG BI CHO HERO --------
function trangBiChoHero(heroId, equipmentIndex) {
    var hero = timHero(heroId);
    if (!hero) return false;
    
    if (equipmentIndex < 0 || equipmentIndex >= hero.inventory.length) return false;
    
    var item = hero.inventory[equipmentIndex];
    if (!item.slot) return false; // Khong phai trang bi
    
    // Kiem tra level
    if (hero.level < item.levelReq) {
        addLog('Hero can dat cap ' + item.levelReq + '+ de trang bi nay!', 'error');
        return false;
    }
    
    // Neu da co trang bi o slot do
    if (hero.equipment[item.slot]) {
        hero.inventory.push(hero.equipment[item.slot]);
    }
    
    hero.equipment[item.slot] = item;
    hero.inventory.splice(equipmentIndex, 1);
    tinhLaiStats(hero);
    
    addLog('Da trang bi ' + item.name + ' cho ' + hero.className + '!', 'success');
    return true;
}

// ------------- THAO TRANG BI --------
function thaoTrangBi(heroId, slot) {
    var hero = timHero(heroId);
    if (!hero) return false;
    
    if (!hero.equipment[slot]) {
        addLog('Khong co trang bi o slot nay!', 'warning');
        return false;
    }
    
    var item = hero.equipment[slot];
    hero.equipment[slot] = null;
    var ok = themVatPham(hero, item);
    
    if (!ok) {
        // Tui day, cho vao kho
        hero.equipment[slot] = item;
        addLog('Tui do day!', 'error');
        return false;
    }
    
    tinhLaiStats(hero);
    addLog('Da thao ' + item.name + ' khoi ' + hero.className + '!', 'info');
    return true;
}
