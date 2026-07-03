// ============================================
// GACHA.JS - He thong trieu hoi hero (Gacha)
// ============================================

// ------------- GOI HERO --------
function goiHero(muaVe) {
    // Kiem tra ve goi
    var veCan = 1;
    if (muaVe) {
        if (G.vang < 20) {
            addLog('Khong du vang de mua ve! Can 20 vang.', 'error');
            return null;
        }
        G.vang -= 20;
        G.veGoi++;
    }
    
    if (G.veGoi <= 0) {
        addLog('Khong co ve goi! Mua ve goi tai cong truyen tong (20 vang).', 'error');
        return null;
    }
    
    G.veGoi--;
    
    // Xac dinh tier ngau nhien
    var tier = rollTier();
    
    // Xac dinh class ngau nhien
    var classKeys = Object.keys(HERO_CLASSES);
    var classKey = classKeys[Math.floor(Math.random() * classKeys.length)];
    
    // Chon tinh cach ngau nhien
    var tinhCach = chonTinhCachNgauNhien();
    
    // Tao hero
    var hero = taoHero(classKey, tier, tinhCach);
    
    // Them vao danh sach
    G.heroes.push(hero);
    G.stats.tongGacha++;
    
    var tierData = HERO_TIERS[tier];
    
    addLog('Da goi duoc ' + hero.className + ' [' + tierData.name + '] cap ' + hero.level + '!', 'success');
    addLog('Tinh cach: ' + hero.tinhCach.name + ' (' + (hero.tinhCach.loai === 'tot' ? 'Tot' : 'Xau') + ')', 'info');
    
    return hero;
}

// -------- GOI 10 HERO --------
function goi10Hero() {
    if (G.veGoi < 10) {
        var canMua = 10 - G.veGoi;
        var chiPhi = canMua * 20;
        if (G.vang < chiPhi) {
            addLog('Khong du vang! Can ' + chiPhi + ' vang de mua ' + canMua + ' ve.', 'error');
            return false;
        }
        G.vang -= chiPhi;
        G.veGoi += canMua;
    }
    
    for (var i = 0; i < 10; i++) {
        goiHero(false);
    }
    
    addLog('Da goi 10 hero!', 'success');
    return true;
}

// -------- ROLL TIER (ty le) --------
function rollTier() {
    var rand = Math.random() * 100;
    
    // Ty le: Thuong 45%, Tot 30%, Xuat Sac 15%, Huyen Thoai 7%, Bat Tu 3%
    if (rand < 3) return 4;     // Bat Tu 3%
    if (rand < 10) return 3;    // Huyen Thoai 7%
    if (rand < 25) return 2;    // Xuat Sac 15%
    if (rand < 55) return 1;    // Tot 30%
    return 0;                    // Thuong 45%
}

// ------------- THONG TIN TI LE GACHA --------
function getGachaRateInfo() {
    return [
        { tier: 'Bat Tu', rate: '3%', multi: 'x2.5' },
        { tier: 'Huyen Thoai', rate: '7%', multi: 'x2.0' },
        { tier: 'Xuat Sac', rate: '15%', multi: 'x1.6' },
        { tier: 'Tot', rate: '30%', multi: 'x1.3' },
        { tier: 'Thuong', rate: '45%', multi: 'x1.0' }
    ];
}
