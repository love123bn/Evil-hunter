// ============================================
// HERO.JS - He thong hero
// ============================================

// -------- TAO HERO MOI --------
function taoHero(heroClass, tier, tinhCach) {
    var classData = HERO_CLASSES[heroClass];
    if (!classData) classData = HERO_CLASSES.berserker;
    
    if (tier === undefined || tier === null) {
        tier = 0;
    }
    var tierData = HERO_TIERS[tier];
    
    if (tinhCach === undefined) {
        tinhCach = chonTinhCachNgauNhien();
    }
    
    var hero = {
        id: generateHeroId(),
        classId: heroClass,
        className: classData.name,
        tier: tier,
        tierName: tierData.name,
        
        // Level va Kinh nghiem
        level: 1,
        exp: 0,
        expToNext: 20,
        
        // Stats co ban
        hpMax: classData.baseHp,
        hp: classData.baseHp,
        atk: classData.baseAtk,
        def: classData.baseDef,
        crit: classData.baseCrit,
        atkSpd: classData.baseAtkSpd,
        evasion: classData.baseEvasion,
        
        // Trang thai
        conSong: true,
        trangThai: 'nhanh', // 'nhanh', 'san', 'boss', 'chet'
        
        // Noi can
        stamina: 100,
        staminaMax: 100,
        tinhThan: 100,
        tinhThanMax: 100,
        sucLuc: 100,
        sucLucMax: 100,
        
        // Tinh cach
        tinhCach: tinhCach,
        
        // Tui do rieng
        vangRieng: 0,
        inventory: [],
        
        // Trang bi
        equipment: {
            vuKhi: null,
            giap: null,
            mu: null,
            giay: null,
            nhan: null,
            bua: null
        },
        
        // Thong ke
        quaiDaGiet: 0,
        vangDaKiem: 0
    };
    
    // Ap dung tinh cach
    apDungTinhCach(hero);
    
    // Ap dung tier multiplier
    apDungTier(hero, tierData);
    
    // Tinh lai stats
    tinhLaiStats(hero);
    
    return hero;
}

var heroIdCounter = 0;

function generateHeroId() {
    heroIdCounter++;
    return 'hero_' + Date.now() + '_' + heroIdCounter;
}

// -------- CHON TINH CACH NGAU NHIEN --------
function chonTinhCachNgauNhien() {
    var idx = Math.floor(Math.random() * CHARACTERISTICS.length);
    return CHARACTERISTICS[idx];
}

// -------- AP DUNG TINH CACH --------
function apDungTinhCach(hero) {
    var tc = hero.tinhCach;
    if (!tc) return;
    
    var bonus = tc.bonus;
    // Dieu chinh theo tier
    bonus = Math.floor(bonus * (1 + hero.tier * 0.2));
    
    switch (tc.effect) {
        case 'atk': hero.atk += bonus; break;
        case 'def': hero.def += bonus; break;
        case 'hp': hero.hpMax += bonus; hero.hp += bonus; break;
        case 'crit': hero.crit += bonus; break;
        case 'evasion': hero.evasion += bonus; break;
        case 'vang': hero.vangRieng += Math.max(0, bonus * 5); break;
        case 'exp': break; // Bonus exp duoc xu ly rieng
        case 'atkSpd': hero.atkSpd *= (1 + bonus / 100); break;
    }
}

// -------- AP DUNG TIER --------
function apDungTier(hero, tierData) {
    if (!tierData) tierData = HERO_TIERS[hero.tier || 0];
    var multi = tierData.statMulti;
    hero.hpMax = Math.floor(hero.hpMax * multi);
    hero.hp = Math.floor(hero.hp * multi);
    hero.atk = Math.floor(hero.atk * multi);
    hero.def = Math.floor(hero.def * multi);
    hero.crit = Math.floor(hero.crit * multi);
}

// -------- TINH LAI STATS (ke ca equipment) --------
function tinhLaiStats(hero) {
    var classData = HERO_CLASSES[hero.classId];
    if (!classData) return;
    
    // Stats co ban theo level
    var hpBase = classData.baseHp + classData.hpGrow * (hero.level - 1);
    var atkBase = classData.baseAtk + classData.atkGrow * (hero.level - 1);
    var defBase = classData.baseDef + classData.defGrow * (hero.level - 1);
    var critBase = classData.baseCrit + classData.critGrow * (hero.level - 1);
    var atkSpdBase = classData.baseAtkSpd + classData.atkSpdGrow * (hero.level - 1);
    var evaBase = classData.baseEvasion + classData.evasionGrow * (hero.level - 1);
    
    // Ap dung tier
    var tierMulti = HERO_TIERS[hero.tier].statMulti;
    
    hero.hpMax = Math.floor(hpBase * tierMulti);
    hero.atk = Math.floor(atkBase * tierMulti);
    hero.def = Math.floor(defBase * tierMulti);
    hero.crit = Math.floor(critBase * tierMulti);
    hero.atkSpd = Math.round(atkSpdBase * tierMulti * 100) / 100;
    hero.evasion = Math.floor(evaBase * tierMulti);
    
    // Ap dung equipment
    for (var slot in hero.equipment) {
        if (hero.equipment[slot]) {
            var eq = hero.equipment[slot];
            if (eq.stat === 'hp') hero.hpMax += eq.bonus;
            else if (eq.stat === 'atk') hero.atk += eq.bonus;
            else if (eq.stat === 'def') hero.def += eq.bonus;
            else if (eq.stat === 'crit') hero.crit += eq.bonus;
            else if (eq.stat === 'evasion') hero.evasion += eq.bonus;
        }
    }
    
    // Dam bao hp khong vuot max
    if (hero.hp > hero.hpMax) hero.hp = hero.hpMax;
    
    // Tinh lai exp to next
    hero.expToNext = Math.floor(20 * Math.pow(1.15, hero.level - 1));
}

// -------- THEM KINH NGHIEM --------
function themExp(hero, exp) {
    if (!hero.conSong) return false;
    
    // Bonus tu tinh cach
    if (hero.tinhCach && hero.tinhCach.effect === 'exp') {
        exp = Math.floor(exp * (1 + hero.tinhCach.bonus / 100));
    }
    
    hero.exp += exp;
    
    var tangLevel = false;
    while (hero.exp >= hero.expToNext) {
        hero.exp -= hero.expToNext;
        hero.level++;
        tinhLaiStats(hero);
        hero.hp = hero.hpMax; // Hoi phuc khi len level
        tangLevel = true;
    }
    
    return tangLevel;
}

// -------- KIEM TRA TU CACH DE HERO --------
function kiemTraSucKhoe(hero) {
    if (!hero.conSong) return 'chet';
    if (hero.hp <= 0) {
        hero.conSong = false;
        hero.trangThai = 'chet';
        return 'chet';
    }
    if (hero.stamina <= 0) return 'met';
    if (hero.sucLuc <= 0) return 'doi';
    if (hero.tinhThan <= 0) return 'buon';
    return 'khoe';
}

// ------------- HERO TON THAT --------
function heroBiThuong(hero, dmg) {
    var evasionCheck = Math.random() * 100;
    if (evasionCheck < hero.evasion) {
        return { biTrung: false, dmg: 0 };
    }
    
    var dmgSauGiam = Math.max(1, dmg - hero.def);
    hero.hp -= dmgSauGiam;
    if (hero.hp <= 0) {
        hero.hp = 0;
        hero.conSong = false;
        hero.trangThai = 'chet';
    }
    return { biTrung: true, dmg: dmgSauGiam };
}

// -------- HERO TAN CONG --------
function heroTanCong(hero) {
    var crit = Math.random() * 100 < hero.crit;
    var dmg = hero.atk;
    if (crit) dmg = Math.floor(dmg * 1.5);
    return { dmg: dmg, crit: crit };
}

// -------- TIM HERO THEO ID --------
function timHero(id) {
    for (var i = 0; i < G.heroes.length; i++) {
        if (G.heroes[i].id === id) return G.heroes[i];
    }
    return null;
}

// -------- LAY HERO KHOE MANH --------
function layHeroKhoe() {
    var ds = [];
    for (var i = 0; i < G.heroes.length; i++) {
        var h = G.heroes[i];
        if (h.conSong && h.trangThai === 'nhanh') ds.push(h);
    }
    return ds;
}

// -------- THEM VAT PHAM VAO TUI HERO --------
function themVatPham(hero, item) {
    if (hero.inventory.length >= 20) {
        addLog('Tui do cua ' + hero.className + ' da day!', 'warning');
        return false;
    }
    hero.inventory.push(item);
    return true;
}

// ------------- XOA VAT PHAM KHOI TUI --------
function xoaVatPham(hero, index) {
    if (index >= 0 && index < hero.inventory.length) {
        hero.inventory.splice(index, 1);
        return true;
    }
    return false;
}

// -------- BAN TAI NGUYEN TU HERO LEN THI TRAN --------
function banTaiNguyen(hero) {
    if (!hero.conSong || hero.inventory.length === 0) return 0;
    
    var tongVang = 0;
    var daBan = [];
    
    for (var i = hero.inventory.length - 1; i >= 0; i--) {
        var item = hero.inventory[i];
        if (item.loai === 'resource') {
            var resource = RESOURCES[item.id];
            if (resource) {
                var gia = resource.giaBan;
                // Nhan bonus tu tinh cach Giau Co
                if (hero.tinhCach && hero.tinhCach.effect === 'vang') {
                    gia = Math.floor(gia * (1 + hero.tinhCach.bonus / 100));
                }
                tongVang += gia;
                daBan.push(resource.name);
                hero.inventory.splice(i, 1);
            }
        }
    }
    
    if (tongVang > 0) {
        // 70% vang cho hero, 30% cho thi tran
        var vangHero = Math.floor(tongVang * 0.7);
        var vangTown = tongVang - vangHero;
        hero.vangRieng += vangHero;
        hero.vangDaKiem += vangHero;
        G.vang += vangTown;
        G.stats.tongVangKiem += tongVang;
        addLog(hero.className + ' da ban nguyen lieu: ' + daBan.join(', ') + ', nhan ' + vangHero + ' vang', 'success');
    }
    
    return tongVang;
}

// -------- HERO NGHI NGOI --------
function heroNghi(hero) {
    if (!hero.conSong) return;
    
    var binhVienLevel = G.town.buildings.binhVien.level;
    var nhaHangLevel = G.town.buildings.nhaHang.level;
    var quanRuouLevel = G.town.buildings.quanRuou.level;
    var nhaTroLevel = G.town.buildings.nhaTro.level;
    
    // Su dung necessity neu co
    if (hero.hp < hero.hpMax && G.town.necessities.potion > 0) {
        hero.hp = Math.min(hero.hpMax, hero.hp + 30);
        G.town.necessities.potion--;
    }
    
    if (hero.hp < hero.hpMax) {
        var hoiPhuc = 5 + binhVienLevel * 3;
        hero.hp = Math.min(hero.hpMax, hero.hp + hoiPhuc);
    }
    
    if (hero.stamina < hero.staminaMax) {
        var hoiPhuc = 3 + nhaHangLevel * 2;
        hero.stamina = Math.min(hero.staminaMax, hero.stamina + hoiPhuc);
    }
    
    if (hero.sucLuc < hero.sucLucMax) {
        var hoiPhuc = 3 + nhaTroLevel * 3;
        hero.sucLuc = Math.min(hero.sucLucMax, hero.sucLuc + hoiPhuc);
    }
    
    if (hero.tinhThan < hero.tinhThanMax) {
        var hoiPhuc = 3 + quanRuouLevel * 2;
        hero.tinhThan = Math.min(hero.tinhThanMax, hero.tinhThan + hoiPhuc);
    }
    
    hero.trangThai = 'nhanh';
}
