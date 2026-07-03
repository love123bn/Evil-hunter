// ============================================
// BOSS.JS - He thong Boss Battle (5 hero/doi)
// ============================================

// -------- THEM HERO VAO DOI DANH BOSS --------
function themVaoDoiBoss(heroId, slot) {
    if (slot < 0 || slot >= 5) return false;
    
    var hero = timHero(heroId);
    if (!hero) return false;
    
    if (!hero.conSong) {
        addLog('Hero nay da chet!', 'error');
        return false;
    }
    
    if (hero.trangThai !== 'nhanh') {
        addLog('Hero nay dang ban!', 'warning');
        return false;
    }
    
    // Kiem tra slot da co hero
    if (G.heroTrongDoi[slot] !== null) {
        addLog('Slot nay da co hero!', 'warning');
        return false;
    }
    
    // Kiem tra hero da o trong doi chua
    for (var i = 0; i < G.heroTrongDoi.length; i++) {
        if (G.heroTrongDoi[i] && G.heroTrongDoi[i].id === heroId) {
            addLog('Hero nay da o trong doi!', 'warning');
            return false;
        }
    }
    
    G.heroTrongDoi[slot] = hero;
    addLog('Da them ' + hero.className + ' vao doi danh boss!', 'info');
    return true;
}

// -------- BO HERO KHOI DOI BOSS --------
function boKhoiDoiBoss(slot) {
    if (slot < 0 || slot >= 5) return false;
    
    if (G.heroTrongDoi[slot]) {
        var name = G.heroTrongDoi[slot].className;
        G.heroTrongDoi[slot] = null;
        addLog('Da bo ' + name + ' khoi doi!', 'info');
        return true;
    }
    return false;
}

// -------- BAT DAU DANH BOSS --------
function batDauDanhBoss(bossId) {
    var bossData = BOSSES[bossId];
    if (!bossData) return false;
    
    // Dam bao doi co 5 slot
    while (G.heroTrongDoi.length < 5) {
        G.heroTrongDoi.push(null);
    }
    
    if (G.bosses[bossId].dangDanh) {
        addLog('Da co tran danh boss nay dang dien ra!', 'warning');
        return false;
    }
    
    if (G.bosses[bossId].defeated) {
        addLog('Boss nay da bi danh bai!', 'warning');
        return false;
    }
    
    // Kiem tra doi
    var soHeroTrongDoi = 0;
    for (var i = 0; i < G.heroTrongDoi.length; i++) {
        if (G.heroTrongDoi[i] !== null) soHeroTrongDoi++;
    }
    
    if (soHeroTrongDoi < 1) {
        addLog('Can it nhat 1 hero trong doi de danh boss!', 'error');
        return false;
    }
    
    // Kiem tra level yeu cau
    var levelTrungBinh = 0;
    for (var j = 0; j < G.heroTrongDoi.length; j++) {
        if (G.heroTrongDoi[j]) {
            levelTrungBinh += G.heroTrongDoi[j].level;
        }
    }
    levelTrungBinh = Math.floor(levelTrungBinh / soHeroTrongDoi);
    
    if (levelTrungBinh < bossData.levelReq) {
        addLog('Cap do trung binh cua doi la ' + levelTrungBinh + ', can ' + bossData.levelReq + '!', 'error');
        return false;
    }
    
    // Kiem tra stamina
    for (var k = 0; k < G.heroTrongDoi.length; k++) {
        var h = G.heroTrongDoi[k];
        if (h && h.stamina < 20) {
            addLog(h.className + ' khong du the luc de danh boss!', 'error');
            return false;
        }
    }
    
    // Tru stamina
    for (var m = 0; m < G.heroTrongDoi.length; m++) {
        var h2 = G.heroTrongDoi[m];
        if (h2) {
            h2.stamina -= 15;
            h2.trangThai = 'boss';
        }
    }
    
    // Khoi tao tran danh
    var diffMulti = DIFFICULTY_MULTI[G.doKho];
    G.bosses[bossId].dangDanh = true;
    G.bosses[bossId].hpHienTai = Math.floor(bossData.hp * diffMulti);
    
    addLog('Bat dau danh ' + bossData.name + '!', 'success');
    addLog('Doi gom ' + soHeroTrongDoi + ' hero da tien vao hang dong!', 'info');
    
    return true;
}

// -------- TICK BOSS BATTLE --------
function tickBossBattle() {
    for (var b = 0; b < G.bosses.length; b++) {
        var bossState = G.bosses[b];
        
        if (!bossState.dangDanh) continue;
        
        var bossData = BOSSES[b];
        if (!bossData) continue;
        
        // Moi 2 tick
        if (G.tickCount % 2 !== 0) continue;
        
        // Kiem tra doi con song
        var doiConSong = [];
        for (var i = 0; i < G.heroTrongDoi.length; i++) {
            var h = G.heroTrongDoi[i];
            if (h && h.conSong && h.trangThai === 'boss') {
                doiConSong.push(h);
            }
        }
        
        if (doiConSong.length === 0) {
            // That bai
            bossState.dangDanh = false;
            addLog('Tat ca hero da guc! Tran dau voi ' + bossData.name + ' that bai!', 'error');
            
            // Hoi phuc heroes
            for (var k = 0; k < G.heroTrongDoi.length; k++) {
                if (G.heroTrongDoi[k]) {
                    G.heroTrongDoi[k].trangThai = 'nhanh';
                }
            }
            continue;
        }
        
        // Hero danh boss
        var tongDmg = 0;
        for (var j = 0; j < doiConSong.length; j++) {
            var h2 = doiConSong[j];
            var atkResult = heroTanCong(h2);
            var dmg = Math.max(1, atkResult.dmg - Math.floor(bossData.def * DIFFICULTY_MULTI[G.doKho] / 2));
            tongDmg += dmg;
            
            if (atkResult.crit) {
                addLog(h2.className + ' chi mang ' + bossData.name + '! ' + dmg + ' sat thuong!', 'success');
            }
        }
        
        bossState.hpHienTai -= tongDmg;
        
        // Boss danh lai
        if (bossState.hpHienTai > 0) {
            var bossAtk = Math.floor(bossData.atk * DIFFICULTY_MULTI[G.doKho]);
            
            for (var m = 0; m < doiConSong.length; m++) {
                var h3 = doiConSong[m];
                var dmgToHero = Math.max(1, bossAtk - h3.def);
                var biTrung = heroBiThuong(h3, dmgToHero);
                
                if (biTrung.biTrung) {
                    if (!h3.conSong) {
                        addLog(h3.className + ' da tu tran trong tran dau voi ' + bossData.name + '!', 'error');
                    }
                } else {
                    addLog(h3.className + ' ne tranh don cua ' + bossData.name + '!', 'info');
                }
            }
        }
        
        // Kiem tra boss chet
        if (bossState.hpHienTai <= 0) {
            bossState.dangDanh = false;
            bossState.defeated = true;
            G.bosses[b].defeated = true;
            
            // Tinh thuong
            var vangThuong = Math.floor(bossData.vangThuong * DIFFICULTY_MULTI[G.doKho]);
            var expThuong = Math.floor(bossData.expThuong * DIFFICULTY_MULTI[G.doKho]);
            
            for (var n = 0; n < doiConSong.length; n++) {
                var h4 = doiConSong[n];
                h4.vangRieng += Math.floor(vangThuong / doiConSong.length);
                h4.vangDaKiem += Math.floor(vangThuong / doiConSong.length);
                themExp(h4, Math.floor(expThuong / doiConSong.length));
                h4.quaiDaGiet += 5;
                h4.trangThai = 'nhanh';
            }
            
            G.stats.bossDaDiet++;
            G.stats.tongVangKiem += vangThuong;
            
            // Kiem tra roi vat pham
            if (Math.random() < bossData.tileRoi) {
                var itemName = bossData.vatPham[Math.floor(Math.random() * bossData.vatPham.length)];
                addLog('Da nhan duoc vat pham hiem!', 'success');
            }
            
            // Hoi phuc heroes con lai
            for (var p = 0; p < G.heroTrongDoi.length; p++) {
                if (G.heroTrongDoi[p]) {
                    G.heroTrongDoi[p].trangThai = 'nhanh';
                }
            }
            
            addLog('DA DANH BAI ' + bossData.name + '! Nhan ' + vangThuong + ' vang, ' + expThuong + ' exp!', 'success');
        }
    }
}
