/* ==========================================================
   MAIN.JS - Khởi tạo game Evil Hunter Tycoon tiếng Việt
   Entry point - chạy khi trang load xong
   ========================================================== */

(function() {
    'use strict';

    // Chờ DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGame);
    } else {
        initGame();
    }

    function initGame() {
        console.log('⚔️ Săn Thủ Ác Quỷ - Đang khởi tạo...');
        
        // Khởi tạo engine
        Game.init();
        
        // Khởi tạo UI
        Game.UI.init();
        
        // Spawn initial candidates if empty
        if (Game.state.hireCandidates.length === 0) {
            for (let i = 0; i < 3; i++) {
                Game.Hunters.spawnCandidate();
            }
            Game.UI.renderHireTab();
        }

        // Spawn initial hire candidates periodically
        setInterval(() => {
            if (Game.state.hireCandidates.length < 3 && Game.state.hunters.length < Game.getMaxHunters()) {
                Game.Hunters.spawnCandidate();
                Game.UI.renderHireTab();
            }
        }, 30000);

        console.log('✅ Game đã sẵn sàng!');
        Game.notify('⚔️ Chào mừng đến Săn Thủ Ác Quỷ!');
    }
})();
