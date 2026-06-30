// ========== LƯU / TẠI GAME ==========

const SAVE_KEY = 'evilHunterTycoonSave';

function saveGame() {
    if (!game) return;
    try {
        const data = {
            gold: game.gold,
            gems: game.gems,
            difficulty: game.difficulty,
            maxPopulation: game.maxPopulation,
            hunters: game.hunters,
            buildings: game.buildings,
            inventory: game.inventory,
            materials: game.materials,
            completedQuests: game.completedQuests,
            completedAchievements: game.completedAchievements,
            totalKills: game.totalKills,
            totalCrafts: game.totalCrafts,
            totalDungeons: game.totalDungeons,
            totalBossKills: game.totalBossKills,
            totalTrades: game.totalTrades,
            dungeonFloor: game.dungeonFloor,
            bountyProgress: game.bountyProgress,
            gameTime: game.gameTime,
            hunterQueue: game.hunterQueue,
            hunterArrivalTimer: game.hunterArrivalTimer,
            newHunterAvailable: game.newHunterAvailable,
            dailyStreak: game.dailyStreak,
            lastDailyDate: game.lastDailyDate,
            townName: game.townName,
            gameStarted: game.gameStarted
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Lưu game thất bại:', e);
        return false;
    }
}

function loadGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (!data) return false;
        
        game = new Game();
        game.gold = data.gold || 200;
        game.gems = data.gems || 10;
        game.difficulty = data.difficulty || 'easy';
        game.maxPopulation = data.maxPopulation || 5;
        game.hunters = (data.hunters || []).map(h => {
            if (h.gold === undefined) h.gold = 0;
            if (h.materials === undefined) h.materials = {};
            if (h.currentMonster === undefined) h.currentMonster = null;
            if (h.currentMonsterHp === undefined) h.currentMonsterHp = 0;
            return h;
        });
        game.inventory = data.inventory || [];
        game.materials = data.materials || {};
        game.completedQuests = data.completedQuests || [];
        game.completedAchievements = data.completedAchievements || [];
        game.totalKills = data.totalKills || 0;
        game.totalCrafts = data.totalCrafts || 0;
        game.totalDungeons = data.totalDungeons || 0;
        game.totalBossKills = data.totalBossKills || 0;
        game.totalTrades = data.totalTrades || 0;
        game.dungeonFloor = data.dungeonFloor || 1;
        game.bountyProgress = data.bountyProgress || 0;
        game.gameTime = data.gameTime || 0;
        game.hunterQueue = data.hunterQueue || [];
        game.hunterArrivalTimer = data.hunterArrivalTimer || 0;
        game.newHunterAvailable = data.newHunterAvailable || false;
        game.dailyStreak = data.dailyStreak || 0;
        game.lastDailyDate = data.lastDailyDate || '';
        game.townName = data.townName || '';
        game.gameStarted = data.gameStarted || false;
        
        // Khôi phục trạng thái buildings
        if (data.buildings) {
            for (let key in data.buildings) {
                if (game.buildings[key]) {
                    game.buildings[key].level = data.buildings[key].level;
                    game.buildings[key].unlocked = data.buildings[key].unlocked;
                }
            }
        }
        
        game.addLog('Game đã được tải!');
        return true;
    } catch (e) {
        console.error('Tải game thất bại:', e);
        return false;
    }
}

function deleteSave() {
    localStorage.removeItem(SAVE_KEY);
}

function autoSave() {
    if (game) {
        saveGame();
    }
    setTimeout(autoSave, 30000); // Lưu mỗi 30 giây
}

function startWithSave() {
    const loaded = loadGame();
    const isNew = !loaded;
    if (isNew) {
        initGame();
        game.addLog('Bắt đầu game mới!');
    }
    initModal();
    render();
    gameLoop();
    autoSave();
    // Lưu game khi thoát/refresh để không mất dữ liệu
    window.addEventListener('beforeunload', saveOnUnload);
    // Hiển thị intro cho game mới
    if (isNew || !game.gameStarted) showIntro();
}

function saveOnUnload() { saveGame(); }

// Nếu muốn reset, gọi deleteSave() rồi reload
function resetGame() {
    if (confirm('Bạn chắc chắn muốn xóa toàn bộ tiến trình?')) {
        deleteSave();
        location.reload();
    }
}
