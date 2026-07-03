// ============================================
// GAME.JS - Trang thai chinh, vong lap, save/load
// ============================================

var G = {
    // ---- Tai chinh ----
    vang: 100,
    
    // ---- Do kho ----
    doKho: 0, // 0=De, 1=Binh Thuong, 2=Kho
    tongCapHero: 0,
    lanTangHang: 0,
    
    // ---- Hero ----
    heroes: [],
    heroTrongDoi: [], // 5 slot cho doi danh boss
    hangChoHero: 0, // so luong hero cho
    
    // ---- Thi tran ----
    town: {
        buildings: {
            binhVien: { level: 1 },
            nhaHang: { level: 1 },
            quanRuou: { level: 1 },
            nhaTro: { level: 1 },
            xuongRen: { level: 1 },
            nhaTho: { level: 1 }
        },
        resources: {
            wood: 0, stone: 0, iron: 0,
            herb: 0, leather: 0, cloth: 0,
            gem: 0, essence: 0
        },
        necessities: {
            potion: 0, bandage: 0, ration: 0, bait: 0
        }
    },
    
    // ---- Khu san ----
    zones: [
        { id: 0, unlocked: true, heroesDangSan: [] },
        { id: 1, unlocked: false, heroesDangSan: [] },
        { id: 2, unlocked: false, heroesDangSan: [] }
    ],
    
    // ---- Boss ----
    bosses: [
        { id: 0, defeated: false, dangDanh: false, hpHienTai: 0 },
        { id: 1, defeated: false, dangDanh: false, hpHienTai: 0 },
        { id: 2, defeated: false, dangDanh: false, hpHienTai: 0 },
        { id: 3, defeated: false, dangDanh: false, hpHienTai: 0 }
    ],
    
    // ---- Gacha ----
    veGoi: 5,
    
    // ---- Thong ke ----
    stats: {
        quaiDaDiet: 0,
        bossDaDiet: 0,
        tongVangKiem: 0,
        tongGacha: 0,
        tongCheTao: 0
    },
    
    // ---- Thoi gian ----
    tickCount: 0,
    lastSave: Date.now()
};

// -------- SAVE / LOAD --------
function saveGame() {
    try {
        var data = JSON.stringify(G);
        localStorage.setItem('evilHunterSave', data);
        localStorage.setItem('evilHunterTime', Date.now().toString());
    } catch(e) {
        console.log('Loi save game:', e);
    }
}

function loadGame() {
    try {
        var data = localStorage.getItem('evilHunterSave');
        if (data) {
            var loaded = JSON.parse(data);
            // Merge de tranh mat data moi
            for (var key in loaded) {
                if (loaded.hasOwnProperty(key)) {
                    G[key] = loaded[key];
                }
            }
            // Dam bao cac zone
            for (var i = 0; i < G.zones.length; i++) {
                if (!G.zones[i].heroesDangSan) G.zones[i].heroesDangSan = [];
            }
            return true;
        }
    } catch(e) {
        console.log('Loi load game:', e);
    }
    return false;
}

function resetGame() {
    localStorage.removeItem('evilHunterSave');
    location.reload();
}

// -------- TINH TONG CAP HERO --------
function tinhTongCapHero() {
    var tong = 0;
    for (var i = 0; i < G.heroes.length; i++) {
        tong += G.heroes[i].level;
    }
    G.tongCapHero = tong;
    return tong;
}

// -------- KIEM TRA/KICH HOAT DO KHO --------
function kiemTraDoKho() {
    var soHero = G.heroes.length;
    G.lanTangHang = Math.floor(soHero / 100);
    var maxDoKho = Math.min(G.lanTangHang, 2);
    if (G.doKho > maxDoKho) {
        G.doKho = maxDoKho;
    }
}

function tangDoKho() {
    var maxDoKho = Math.min(G.lanTangHang, 2);
    if (G.doKho < maxDoKho) {
        G.doKho++;
        return true;
    }
    return false;
}

function giamDoKho() {
    if (G.doKho > 0) {
        G.doKho--;
        return true;
    }
    return false;
}

// -------- MAIN GAME LOOP --------
var gameInterval = null;
var gameRunning = false;

function startGame() {
    if (gameRunning) return;
    gameRunning = true;
    gameInterval = setInterval(gameTick, 1000);
}

function stopGame() {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    gameRunning = false;
}

function gameTick() {
    G.tickCount++;
    
    // Tinh tong cap hero
    tinhTongCapHero();
    
    // Kiem tra do kho
    kiemTraDoKho();
    
    // Auto heal heroes dang o nha
    tickAutoHeal();
    
    // Tick san quai
    tickHunting();
    
    // Tick boss battle
    tickBossBattle();
    
    // Tick thi tran - tu dong mua tai nguyen
    tickTownAutoBuy();
    
    // Auto save moi 10s
    if (G.tickCount % 10 === 0) {
        saveGame();
    }
    
    // Tick chat logs cleanup
    if (G.tickCount % 30 === 0 && chatLogs.length > 100) {
        chatLogs.splice(0, chatLogs.length - 50);
    }
    
    // Cap nhat UI
    renderAll();
}

// -------- CHAT LOG --------
var chatLogs = [];

function addLog(msg, type) {
    type = type || 'info';
    var time = new Date().toLocaleTimeString();
    chatLogs.push({ time: time, msg: msg, type: type });
    if (chatLogs.length > 200) {
        chatLogs.splice(0, chatLogs.length - 150);
    }
}

function getLogs(count) {
    count = count || 50;
    return chatLogs.slice(-count);
}

// -------- KHOI TAO --------
function initGame() {
    var loaded = loadGame();
    if (!loaded) {
        // Khoi tao game moi
        addLog('Chao mung den voi Evil Hunter Tyconn!', 'success');
        addLog('Day la phien ban tieng Viet, chuc ban choi vui ve!', 'info');
        addLog('Hay bat dau bang viec goi hero tu cong truyen tong.','info');
    } else {
        addLog('Da tai game thanh cong!', 'success');
        addLog('Chao mung tro lai!', 'info');
    }
    
    // Dam bao doi danh boss co 5 slot
    while (G.heroTrongDoi.length < 5) {
        G.heroTrongDoi.push(null);
    }
    
    renderAll();
}
