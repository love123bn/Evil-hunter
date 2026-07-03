// ============================================
// HUNTING.JS - He thong san quai
// ============================================

// ------------ GUI HERO DI SAN --------
function guiHeroDiSan(heroId, zoneId) {
    var hero = timHero(heroId);
    if (!hero) {
        addLog('Khong tim thay hero!', 'error');
        return false;
    }
    
    var zone = HUNTING_ZONES[zoneId];
    if (!zone) {
        addLog('Khu san khong ton tai!', 'error');
        return false;
    }
    
    if (!G.zones[zoneId].unlocked) {
        addLog('Khu san nay chua duoc mo khoa!', 'error');
        return false;
    }
    
    if (!hero.conSong) {
        addLog('Hero nay da chet! Hay hoi sinh truoc.', 'error');
        return false;
    }
    
    if (hero.trangThai !== 'nhanh') {
        addLog('Hero nay dang ban!', 'warning');
        return false;
    }
    
    if (hero.level < zone.levelMin) {
        addLog('Hero can dat cap ' + zone.levelMin + '+ de vao khu nay!', 'error');
        return false;
    }
    
    if (hero.stamina < 10) {
        addLog('Hero khong du the luc de di san!', 'error');
        return false;
    }
    
    // Kiem tra xem da co hero o khu nay chua
    if (G.zones[zoneId].heroesDangSan.indexOf(hero.id) === -1) {
        G.zones[zoneId].heroesDangSan.push(hero.id);
    }
    
    hero.trangThai = 'san';
    hero.stamina -= 10;
    
    addLog(hero.className + ' da di san tai ' + zone.name + '!', 'info');
    return true;
}

// -------- GOI HERO VE --------
function goiHeroVe(heroId) {
    var hero = timHero(heroId);
    if (!hero) return false;
    
    if (hero.trangThai !== 'san') return false;
    
    // Xoa khoi zone
    for (var i = 0; i < G.zones.length; i++) {
        var idx = G.zones[i].heroesDangSan.indexOf(hero.id);
        if (idx > -1) {
            G.zones[i].heroesDangSan.splice(idx, 1);
            break;
        }
    }
    
    hero.trangThai = 'nhanh';
    addLog(hero.className + ' da tro ve thi tran!', 'info');
    return true;
}

// -------- TICK SAN QUAI (goi moi giay) --------
function tickHunting() {
    for (var z = 0; z < G.zones.length; z++) {
        var zoneData = HUNTING_ZONES[z];
        var zoneState = G.zones[z];
        
        if (!zoneState.unlocked) continue;
        if (zoneState.heroesDangSan.length === 0) continue;
        
        // Moi hero san trong zone
        for (var i = zoneState.heroesDangSan.length - 1; i >= 0; i--) {
            var heroId = zoneState.heroesDangSan[i];
            var hero = timHero(heroId);
            
            if (!hero || !hero.conSong) {
                zoneState.heroesDangSan.splice(i, 1);
                continue;
            }
            
            if (hero.stamina <= 0 || hero.sucLuc <= 0) {
                // Het suc luc, tu dong ve
                hero.trangThai = 'nhanh';
                zoneState.heroesDangSan.splice(i, 1);
                addLog(hero.className + ' het suc luc, da ve thi tran!', 'warning');
                continue;
            }
            
            // San quai - moi 3 tick
            if (G.tickCount % 3 !== 0) continue;
            
            var result = tickHeroSan(hero, zoneData, z);
            if (result) {
                hero.stamina -= 2;
                hero.sucLuc -= 3;
                hero.tinhThan -= 1;
            }
        }
    }
}

// -------- TICK MOT HERO SAN --------
function tickHeroSan(hero, zoneData, zoneIndex) {
    // Chon quai ngau nhien
    var quai = zoneData.quai[Math.floor(Math.random() * zoneData.quai.length)];
    
    // Dieu chinh quai theo do kho
    var diffMulti = DIFFICULTY_MULTI[G.doKho];
    var quaiHp = Math.floor(quai.hp * diffMulti);
    var quaiAtk = Math.floor(quai.atk * diffMulti);
    var quaiDef = Math.floor(quai.def * diffMulti);
    
    // Chien dau
    var heroDmg = heroTanCong(hero);
    var dmgToQuai = Math.max(1, heroDmg.dmg - quaiDef);
    
    var quaiDmgToHero = Math.max(1, quaiAtk - hero.def);
    var hitResult = heroBiThuong(hero, quaiDmgToHero);
    
    var logStr = hero.className + ' san ' + quai.name + ' tai ' + zoneData.name;
    
    if (heroDmg.crit) {
        logStr += ' [CHI MANG!]';
    }
    
    // Quai chet
    if (dmgToQuai >= quaiHp) {
        // Nhan thuong
        var vang = zoneData.vangCoBan + Math.floor(Math.random() * zoneData.vangCoBan);
        var exp = zoneData.expCoBan + Math.floor(Math.random() * zoneData.expCoBan);
        
        // Dieu chinh theo do kho
        vang = Math.floor(vang * (1 + G.doKho * 0.5));
        exp = Math.floor(exp * (1 + G.doKho * 0.3));
        
        hero.vangRieng += vang;
        hero.vangDaKiem += vang;
        hero.quaiDaGiet++;
        G.stats.quaiDaDiet++;
        G.stats.tongVangKiem += vang;
        
        var tangLevel = themExp(hero, exp);
        
        // Nhan nguyen lieu
        var resourceId = zoneData.resources[Math.floor(Math.random() * zoneData.resources.length)];
        var resource = RESOURCES[resourceId];
        if (resource) {
            themVatPham(hero, {
                loai: 'resource',
                id: resourceId,
                name: resource.name
            });
            logStr += ', diet ' + quai.name + ', nhan ' + resource.name;
        } else {
            logStr += ', diet ' + quai.name;
        }
        
        logStr += ', +' + vang + ' vang, +' + exp + ' exp';
        
        if (tangLevel) {
            logStr += ' [LEN CAP ' + hero.level + '!]';
        }
        
        addLog(logStr, 'success');
        return true;
    } else {
        // Quai khong chet, hero bi thuong
        logStr += ', gay ' + dmgToQuai + ' sat thuong';
        if (hitResult.biTrung) {
            logStr += ', bi quai danh mat ' + hitResult.dmg + ' HP';
        } else {
            logStr += ', ne tranh thanh cong!';
        }
        addLog(logStr, 'info');
        return true;
    }
}

// -------- TU DONG DUA HERO DI SAN (auto assign) --------
function tuDongDiSan() {
    var heroesRanh = layHeroKhoe();
    if (heroesRanh.length === 0) {
        addLog('Khong co hero ranh roi de di san!', 'warning');
        return;
    }
    
    var daGui = 0;
    for (var i = 0; i < heroesRanh.length; i++) {
        for (var z = 0; z < HUNTING_ZONES.length; z++) {
            if (G.zones[z].unlocked && heroesRanh[i].level >= HUNTING_ZONES[z].levelMin) {
                var ok = guiHeroDiSan(heroesRanh[i].id, z);
                if (ok) {
                    daGui++;
                    break;
                }
            }
        }
    }
    
    if (daGui > 0) {
        addLog('Da gui ' + daGui + ' hero di san tu dong!', 'info');
    } else {
        addLog('Khong the gui hero di san!', 'warning');
    }
}
