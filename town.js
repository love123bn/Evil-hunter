/* ==========================================================
   TOWN.JS - Hệ thống Thị Trấn: tòa nhà, nâng cấp, kinh tế
   ========================================================== */

Game.Town = {

    /* ===== LÂY LEVEL TÒA NHÀ ===== */
    getBuildingLevel(buildingId) {
        return Game.state.buildings[buildingId] || 1;
    },

    /* ===== NÂNG CẤP TÒA NHÀ ===== */
    upgradeBuilding(buildingId) {
        const bldgData = GAME_DATA.buildings.find(b => b.id === buildingId);
        if (!bldgData) return;

        const currentLevel = this.getBuildingLevel(buildingId);
        if (currentLevel >= bldgData.maxLevel) {
            Game.notify('⚠️ Đã đạt cấp tối đa!');
            return;
        }

        const cost = Game.getBuildingCost(buildingId);
        if (Game.state.gold < cost.gold) {
            Game.notify(`❌ Cần ${cost.gold} vàng`);
            return;
        }

        Game.state.gold -= cost.gold;
        Game.state.buildings[buildingId] = currentLevel + 1;

        const newLevel = currentLevel + 1;
        const effect = bldgData.baseEffect + (newLevel - 1) * bldgData.effectPerLevel;
        Game.addLog('info', `🏗️ ${bldgData.name} nâng cấp lên Lv.${newLevel}`);
        Game.notify(`⬆️ ${bldgData.name} → Lv.${newLevel}`);
        Game.UI.renderBuildingsTab();
    },

    /* ===== NÂNG CẤP THỊ TRẤN ===== */
    upgradeTown() {
        const nextLevel = Game.state.townLevel + 1;
        const upgradeData = GAME_DATA.townUpgrades.find(u => u.level === nextLevel);

        if (!upgradeData) {
            Game.notify('⚠️ Thị trấn đã đạt tối đa!');
            return;
        }

        if (Game.state.gold < upgradeData.cost) {
            Game.notify(`❌ Cần ${Game.formatNumber(upgradeData.cost)} vàng`);
            return;
        }

        if (Game.Town.getTotalMaterials() < upgradeData.matCost) {
            Game.notify(`❌ Cần ${upgradeData.matCost} nguyên liệu tổng`);
            return;
        }

        Game.state.gold -= upgradeData.cost;
        // Trừ nguyên liệu từ các loại
        let remaining = upgradeData.matCost;
        for (const matId in Game.state.materials) {
            const take = Math.min(Game.state.materials[matId], remaining);
            Game.state.materials[matId] -= take;
            remaining -= take;
            if (remaining <= 0) break;
        }

        Game.state.townLevel = nextLevel;
        Game.state.hunterSlots = upgradeData.hunterSlots;

        Game.addLog('info', `🏙️ Thị trấn nâng cấp lên: ${upgradeData.name}`);
        Game.notify(`🏙️ Thị trấn → ${upgradeData.name}!`);
        Game.UI.renderTownUpgradeTab();
    },

    /* ===== TỔNG NGUYÊN LIỆU ===== */
    getTotalMaterials() {
        let total = 0;
        for (const key in Game.state.materials) {
            total += Game.state.materials[key];
        }
        return total;
    },

    /* ===== THỐNG KÊ ===== */
    getStats() {
        return {
            hunters: Game.state.hunters.length,
            aliveHunters: Game.state.hunters.filter(h => h.alive).length,
            totalLevels: Game.state.hunters.reduce((s, h) => s + h.level, 0),
            avgLevel: Game.state.hunters.length > 0 
                ? Math.floor(Game.state.hunters.reduce((s, h) => s + h.level, 0) / Game.state.hunters.length) 
                : 0,
            topLevel: Game.state.hunters.length > 0 
                ? Math.max(...Game.state.hunters.map(h => h.level)) 
                : 0,
            totalKills: Game.state.totalKills,
            totalGoldEarned: Game.state.totalGoldEarned,
            totalBossKills: Game.state.totalBossKills,
            totalCrafted: Game.state.totalCrafted,
            totalDungeons: Game.state.totalDungeons,
            playTime: Game.state.totalPlayTime,
            zonesUnlocked: Game.state.unlockedZones.length,
            itemsInInventory: Game.state.inventory.reduce((s, i) => s + i.qty, 0),
            petsOwned: Game.state.pets.length,
            rebirthPoints: Object.values(Game.state.rebirthPoints).reduce((s, v) => s + v, 0)
        };
    },

    /* ===== MỞ KHÓA ZONE ===== */
    unlockZone(zoneId) {
        if (Game.state.unlockedZones.includes(zoneId)) return;
        const zone = GAME_DATA.zones.find(z => z.id === zoneId);
        if (!zone) return;

        if (Game.state.gold < zone.unlockCost) {
            Game.notify(`❌ Cần ${Game.formatNumber(zone.unlockCost)} vàng`);
            return;
        }

        // Kiểm tra zone trước đó đã mở
        const zoneIdx = GAME_DATA.zones.findIndex(z => z.id === zoneId);
        if (zoneIdx > 0) {
            const prevZone = GAME_DATA.zones[zoneIdx - 1];
            if (!Game.state.unlockedZones.includes(prevZone.id)) {
                Game.notify(`❌ Cần mở ${prevZone.name} trước!`);
                return;
            }
        }

        Game.state.gold -= zone.unlockCost;
        Game.state.unlockedZones.push(zoneId);
        Game.addLog('info', `🗺️ Mở khóa ${zone.name}!`);
        Game.notify(`🗺️ Đã mở ${zone.name}!`);
        Game.UI.renderExploreTab();
    }
};
