/* ==========================================================
   UI.JS - Hệ thống Giao Diện: render tabs, subtabs, modal
   ========================================================== */

Game.UI = {

    /* ===== KHỞI TẠO UI ===== */
    init() {
        this.setupTabs();
        this.setupSubTabs();
        this.setupFilters();
        this.renderAll();
    },

    /* ===== SETUP MAIN TABS ===== */
    setupTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                this.switchTab(tabId);
            });
        });
    },

    switchTab(tabId) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(`tab-${tabId}`).classList.add('active');

        // Render tab content
        this.renderTab(tabId);
    },

    /* ===== SETUP SUB-TABS ===== */
    setupSubTabs() {
        document.querySelectorAll('.sub-tabs').forEach(container => {
            container.querySelectorAll('.sub-tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const subtabId = btn.dataset.subtab;
                    const parent = container.parentElement;
                    
                    container.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    parent.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));
                    document.getElementById(`subtab-${subtabId}`).classList.add('active');
                    
                    this.renderSubTab(subtabId);
                });
            });
        });
    },

    /* ===== SETUP FILTERS ===== */
    setupFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderInventory(filter);
            });
        });
    },

    /* ===== REFRESH ===== */
    refresh() {
        this.updateHeader();
    },

    renderAll() {
        this.updateHeader();
        this.renderTab('hunters');
    },

    renderTab(tabId) {
        switch(tabId) {
            case 'hunters': this.renderHuntersTab(); break;
            case 'town': this.renderTownTab(); break;
            case 'battle': this.renderBattleTab(); break;
            case 'inventory': this.renderInventoryTab(); break;
            case 'pets': this.renderPetsTab(); break;
            case 'shop': this.renderShopTab(); break;
        }
    },

    renderSubTab(subtabId) {
        const renderers = {
            hire: () => this.renderHireTab(),
            list: () => this.renderHunterList(),
            equip: () => this.renderEquipTab(),
            skills: () => this.renderSkillsTab(),
            buildings: () => this.renderBuildingsTab(),
            upgrade: () => this.renderTownUpgradeTab(),
            rebirth: () => this.renderRebirthTab(),
            stats: () => this.renderStatsTab(),
            explore: () => this.renderExploreTab(),
            boss: () => this.renderBossTab(),
            dungeon: () => this.renderDungeonTab(),
            log: () => this.renderLogTab(),
            items: () => this.renderInventory('all'),
            craft: () => this.renderCraftTab(),
            sell: () => this.renderSellTab(),
            materials: () => this.renderMaterialsTab(),
            ranch: () => this.renderPetsTab(),
            egg: () => {},
            'pet-equip': () => this.renderPetEquipTab(),
            general: () => this.renderShopGeneral(),
            daily: () => this.renderDailyQuests(),
            prestige: () => this.renderDailyCheckin()
        };
        if (renderers[subtabId]) renderers[subtabId]();
    },

    /* ===== UPDATE HEADER ===== */
    updateHeader() {
        document.getElementById('gold').textContent = Game.formatNumber(Game.state.gold);
        document.getElementById('gems').textContent = Game.state.gems;
        document.getElementById('materials').textContent = Game.Town.getTotalMaterials();
        document.getElementById('town-level').textContent = `TP Lv.${Game.state.townLevel}`;
        document.getElementById('hunter-count').textContent = 
            `Săn Thủ: ${Game.state.hunters.length}/${Game.getMaxHunters()}`;
        document.getElementById('day-count').textContent = `Ngày: ${Game.state.dayCount}`;
    },

    /* =========================================================
       TAB: HUNTERS
       ========================================================= */
    renderHuntersTab() {
        this.renderHireTab();
    },

    /* --- Sub-tab: Tuyển dụng --- */
    renderHireTab() {
        const container = document.getElementById('hire-candidates');
        const candidates = Game.state.hireCandidates;
        
        if (candidates.length === 0) {
            container.innerHTML = `
                <div class="text-center text-dim" style="padding: 20px">
                    <p>🚪 Chưa có ứng viên nào...</p>
                    <p class="text-sm mt-8">Ứng viên sẽ xuất hiện mỗi 30 giây</p>
                    <button class="btn btn-primary btn-full mt-8" onclick="Game.Hunters.refreshCandidates()">
                        🔄 Làm Mới (💰50)
                    </button>
                </div>`;
            return;
        }

        container.innerHTML = candidates.map((h, i) => `
            <div class="hunter-card ${h.quality} anim-slide-up">
                <div class="hc-header">
                    <span class="hc-name">${h.name}</span>
                    <span class="hc-class class-${h.classId}">${GAME_DATA.classes[h.classId].icon} ${GAME_DATA.classes[h.classId].name}</span>
                    <span class="hc-quality q-${h.quality}">${Game.Hunters.getQualityName(h.quality)}</span>
                </div>
                <div class="hc-level">Lv.${h.level}</div>
                <div class="hc-stats">
                    <span>❤️ ${h.maxHp}</span>
                    <span>⚔️ ${h.atk}</span>
                    <span>🛡️ ${h.def}</span>
                    <span>🎯 ${h.crit}%</span>
                    <span>💨 ${h.evasion}%</span>
                    <span>⚡ ${h.atkSpd.toFixed(2)}</span>
                </div>
                <div class="hc-actions">
                    <button class="btn btn-success btn-small" onclick="Game.Hunters.hireHunter(${i})">✅ Thuê</button>
                    <button class="btn btn-danger btn-small" onclick="Game.Hunters.fireHunter(${i})">❌ Đuổi</button>
                </div>
            </div>
        `).join('');
    },

    /* --- Sub-tab: Danh sách hunters --- */
    renderHunterList() {
        const container = document.getElementById('hunter-list');
        const detailPanel = document.getElementById('hunter-detail');
        detailPanel.classList.add('hidden');
        
        const hunters = Game.state.hunters;
        if (hunters.length === 0) {
            container.innerHTML = '<div class="text-center text-dim" style="padding: 20px"><p>Chưa có săn thủ nào. Hãy tuyển dụng!</p></div>';
            return;
        }

        container.innerHTML = hunters.map(h => {
            const stats = Game.Hunters.getEffectiveStats(h);
            const cls = GAME_DATA.classes[h.classId];
            const expNeeded = GAME_DATA.expTable(h.level);
            return `
            <div class="hunter-card ${h.quality} ${!h.alive ? 'hunter-dead' : ''}" onclick="Game.UI.showHunterDetail('${h.id}')">
                <div class="hc-header">
                    <span class="hc-name">${h.name}</span>
                    <span class="hc-class class-${h.classId}">${cls.icon} ${cls.name}</span>
                    <span class="hc-quality q-${h.quality}">${Game.Hunters.getQualityName(h.quality)}</span>
                </div>
                <div class="hc-level">Lv.${h.level} ${h.currentZone ? '| 🗺️ ' + GAME_DATA.zones.find(z => z.id === h.currentZone)?.name : '| 🏠 Thị trấn'}</div>
                <div class="hc-bars">
                    <div class="bar-row bar-hp">
                        <span class="bar-label">HP</span>
                        <div class="bar-track"><div class="bar-fill" style="width: ${(h.hp / stats.maxHp) * 100}%"></div></div>
                        <span class="bar-val">${h.hp}/${stats.maxHp}</span>
                    </div>
                    <div class="bar-row bar-exp">
                        <span class="bar-label">KN</span>
                        <div class="bar-track"><div class="bar-fill" style="width: ${(h.exp / expNeeded) * 100}%"></div></div>
                        <span class="bar-val">${h.exp}/${expNeeded}</span>
                    </div>
                    <div class="bar-row bar-sat">
                        <span class="bar-label">No</span>
                        <div class="bar-track"><div class="bar-fill" style="width: ${h.satiety}%"></div></div>
                        <span class="bar-val">${Math.floor(h.satiety)}%</span>
                    </div>
                </div>
            </div>`;
        }).join('');
    },

    /* --- Hunter Detail --- */
    showHunterDetail(hunterId) {
        const hunter = Game.state.hunters.find(h => h.id === hunterId);
        if (!hunter) return;

        const stats = Game.Hunters.getEffectiveStats(hunter);
        const cls = GAME_DATA.classes[hunter.classId];
        const rebirthPts = Game.state.rebirthPoints[hunterId] || 0;
        const eq = Game.state.equippedItems[hunterId] || {};

        document.getElementById('hunter-list').innerHTML = '';
        const detail = document.getElementById('hunter-detail');
        detail.classList.remove('hidden');

        const zonesHtml = GAME_DATA.zones
            .filter(z => Game.state.unlockedZones.includes(z.id))
            .map(z => `
                <button class="btn btn-small ${hunter.currentZone === z.id ? 'btn-primary' : 'btn-secondary'}" 
                    onclick="event.stopPropagation(); Game.Hunters.assignZone('${hunterId}', '${z.id}')">
                    ${z.icon} ${z.name} (Lv.${z.levelReq})
                </button>
            `).join(' ');

        document.getElementById('hunter-detail-content').innerHTML = `
            <div class="stat-block">
                <div class="stat-block-title">${cls.icon} ${cls.name} - ${Game.Hunters.getQualityName(hunter.quality)}${rebirthPts > 0 ? ` (♻️${rebirthPts})` : ''}</div>
                <div class="stat-row"><span>Tên</span><span class="stat-row-val">${hunter.name}</span></div>
                <div class="stat-row"><span>Cấp</span><span class="stat-row-val">${hunter.level}</span></div>
                <div class="stat-row"><span>Sống</span><span class="stat-row-val">${hunter.alive ? '✅' : '💀'}</span></div>
                <div class="stat-row"><span>Vị trí</span><span class="stat-row-val">${hunter.currentZone ? GAME_DATA.zones.find(z => z.id === hunter.currentZone)?.name : 'Thị trấn'}</span></div>
            </div>
            <div class="stat-block">
                <div class="stat-block-title">📊 Chỉ Số</div>
                <div class="stat-row"><span>❤️ HP</span><span class="stat-row-val">${hunter.hp}/${stats.maxHp}</span></div>
                <div class="stat-row"><span>⚔️ ATK</span><span class="stat-row-val">${stats.atk}</span></div>
                <div class="stat-row"><span>🛡️ DEF</span><span class="stat-row-val">${stats.def}</span></div>
                <div class="stat-row"><span>🎯 Crit</span><span class="stat-row-val">${stats.crit}%</span></div>
                <div class="stat-row"><span>💨 Né tránh</span><span class="stat-row-val">${stats.evasion}%</span></div>
                <div class="stat-row"><span>⚡ Tốc đánh</span><span class="stat-row-val">${hunter.atkSpd.toFixed(2)}</span></div>
            </div>
            <div class="stat-block">
                <div class="stat-block-title">🍖 Tình Trạng</div>
                <div class="stat-row"><span>No</span><span class="stat-row-val">${Math.floor(hunter.satiety)}%</span></div>
                <div class="stat-row"><span>Tâm trạng</span><span class="stat-row-val">${Math.floor(hunter.mood)}%</span></div>
                <div class="stat-row"><span>Thể lực</span><span class="stat-row-val">${Math.floor(hunter.stamina)}%</span></div>
            </div>
            <div class="stat-block">
                <div class="stat-block-title">⚔️ Trang Bị</div>
                <div class="stat-row"><span>🗡️ Vũ khí</span><span class="stat-row-val">${eq.weapon ? Game.getItemData(eq.weapon)?.name || '?' : 'Trống'}</span></div>
                <div class="stat-row"><span>🛡️ Giáp</span><span class="stat-row-val">${eq.armor ? Game.getItemData(eq.armor)?.name || '?' : 'Trống'}</span></div>
                <div class="stat-row"><span>💍 Phụ kiện</span><span class="stat-row-val">${eq.accessory ? Game.getItemData(eq.accessory)?.name || '?' : 'Trống'}</span></div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;margin:8px 0">
                ${!hunter.alive ? `<button class="btn btn-primary btn-small" onclick="Game.Hunters.reviveHunter('${hunterId}'); Game.UI.showHunterDetail('${hunterId}')">⛪ Hồi Sinh (${hunter.level * 5}💰)</button>` : ''}
                ${hunter.alive ? `<button class="btn btn-danger btn-small" onclick="Game.Hunters.removeHunter('${hunterId}'); Game.UI.renderHunterList()">🗑️ Xóa</button>` : ''}
            </div>
            <div class="stat-block">
                <div class="stat-block-title">🗺️ Đặt Khu Vực Săn</div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">${zonesHtml}</div>
                ${hunter.currentZone ? `<button class="btn btn-secondary btn-small btn-full mt-8" onclick="Game.Hunters.recallHunter('${hunterId}'); Game.UI.showHunterDetail('${hunterId}')">🏠 Gọi Về Thị Trấn</button>` : ''}
            </div>
        `;
    },

    hideHunterDetail() {
        document.getElementById('hunter-detail').classList.add('hidden');
        this.renderHunterList();
    },

    /* --- Sub-tab: Trang bị --- */
    renderEquipTab() {
        const container = document.getElementById('equip-select-hunter');
        const detail = document.getElementById('equip-slots');
        detail.classList.add('hidden');

        const hunters = Game.state.hunters.filter(h => h.alive);
        if (hunters.length === 0) {
            container.innerHTML = '<div class="text-center text-dim" style="padding: 20px"><p>Không có săn thủ nào để trang bị</p></div>';
            return;
        }

        container.innerHTML = hunters.map(h => {
            const eq = Game.state.equippedItems[h.id] || {};
            return `
            <div class="hunter-card ${h.quality}" onclick="Game.UI.showEquipSlots('${h.id}')">
                <div class="hc-header">
                    <span class="hc-name">${h.name}</span>
                    <span class="hc-class class-${h.classId}">${GAME_DATA.classes[h.classId].icon} ${GAME_DATA.classes[h.classId].name}</span>
                </div>
                <div class="hc-level">Lv.${h.level} | ${eq.weapon ? '🗡️' : '❌'} ${eq.armor ? '🛡️' : '❌'} ${eq.accessory ? '💍' : '❌'}</div>
            </div>`;
        }).join('');
    },

    showEquipSlots(hunterId) {
        this._selectedEquipHunter = hunterId;
        const hunter = Game.state.hunters.find(h => h.id === hunterId);
        if (!hunter) return;

        document.getElementById('equip-select-hunter').innerHTML = '';
        const detail = document.getElementById('equip-slots');
        detail.classList.remove('hidden');

        document.getElementById('equip-hunter-name').textContent = `${hunter.name} (${GAME_DATA.classes[hunter.classId].name})`;
        
        const eq = Game.state.equippedItems[hunterId] || {};
        ['weapon', 'armor', 'accessory'].forEach(slot => {
            const slotEl = document.getElementById(`slot-${slot}`);
            const itemId = eq[slot];
            if (itemId) {
                const itemData = Game.getItemData(itemId);
                slotEl.textContent = itemData ? itemData.name : '?';
                slotEl.closest('.equip-slot').classList.add('equipped');
            } else {
                slotEl.textContent = 'Trống';
                slotEl.closest('.equip-slot').classList.remove('equipped');
            }
        });
    },

    openEquipPicker(slot) {
        const hunterId = this._selectedEquipHunter;
        if (!hunterId) return;

        const hunter = Game.state.hunters.find(h => h.id === hunterId);
        if (!hunter) return;

        document.getElementById('equip-slots').classList.add('hidden');
        const picker = document.getElementById('equip-picker');
        picker.classList.remove('hidden');

        // Filter inventory by slot type and class requirement
        const items = Game.state.inventory.filter(inv => {
            const itemData = Game.getItemData(inv.id);
            if (!itemData || itemData.type !== slot) return false;
            if (slot === 'weapon' && itemData.classReq && itemData.classReq !== hunter.classId) return false;
            return true;
        });

        const list = document.getElementById('equip-picker-list');
        if (items.length === 0) {
            list.innerHTML = '<div class="text-center text-dim" style="padding: 20px"><p>Không có trang bị phù hợp</p></div>';
            return;
        }

        list.innerHTML = items.map(inv => {
            const itemData = Game.getItemData(inv.id);
            const rarityData = GAME_DATA.rarities.find(r => r.id === itemData.rarity);
            return `
            <div class="item-entry ${itemData.type}" onclick="Game.Hunters.equipItem('${hunterId}', '${inv.id}', '${slot}'); Game.UI.closeEquipPicker(); Game.UI.showEquipSlots('${hunterId}');">
                <div>
                    <div class="item-name item-rarity-${itemData.rarity}">${itemData.name}</div>
                    <div class="item-stat">${itemData.baseAtk ? `⚔️+${itemData.baseAtk} ` : ''}${itemData.baseDef ? `🛡️+${itemData.baseDef} ` : ''}${itemData.baseCrit ? `🎯+${itemData.baseCrit}% ` : ''}${itemData.baseHp ? `❤️+${itemData.baseHp} ` : ''}</div>
                </div>
                <div class="item-actions">
                    <span class="text-sm">x${inv.qty}</span>
                </div>
            </div>`;
        }).join('');
    },

    closeEquipPicker() {
        document.getElementById('equip-picker').classList.add('hidden');
        if (this._selectedEquipHunter) {
            this.showEquipSlots(this._selectedEquipHunter);
        }
    },

    /* --- Sub-tab: Kỹ năng --- */
    renderSkillsTab() {
        const container = document.getElementById('skill-select-hunter');
        const detail = document.getElementById('skill-detail');
        detail.classList.add('hidden');

        const hunters = Game.state.hunters.filter(h => h.alive);
        if (hunters.length === 0) {
            container.innerHTML = '<div class="text-center text-dim" style="padding: 20px"><p>Không có săn thủ nào</p></div>';
            return;
        }

        container.innerHTML = hunters.map(h => `
            <div class="hunter-card ${h.quality}" onclick="Game.UI.showSkillDetail('${h.id}')">
                <div class="hc-header">
                    <span class="hc-name">${h.name}</span>
                    <span class="hc-class class-${h.classId}">${GAME_DATA.classes[h.classId].icon} ${GAME_DATA.classes[h.classId].name}</span>
                </div>
            </div>
        `).join('');
    },

    showSkillDetail(hunterId) {
        const hunter = Game.state.hunters.find(h => h.id === hunterId);
        if (!hunter) return;

        document.getElementById('skill-select-hunter').innerHTML = '';
        document.getElementById('skill-detail').classList.remove('hidden');
        document.getElementById('skill-hunter-name').textContent = `${hunter.name} - Kỹ Năng`;

        const list = document.getElementById('skill-list');
        list.innerHTML = hunter.skills.map((skill, i) => {
            const cost = skill.level * 30;
            const maxed = skill.level >= 10;
            return `
            <div class="skill-entry">
                <div class="skill-name">${skill.name} <span class="skill-level">Lv.${skill.level}/10</span></div>
                <div class="skill-desc">${skill.desc}</div>
                <button class="btn btn-small ${maxed ? 'btn-secondary' : 'btn-primary'} mt-8" 
                    onclick="Game.Hunters.upgradeSkill('${hunterId}', ${i}); Game.UI.showSkillDetail('${hunterId}')"
                    ${maxed ? 'disabled' : ''}>
                    ${maxed ? '✅ Tối Đa' : `⬆️ Nâng Cấp (${cost}💰)`}
                </button>
            </div>`;
        }).join('');
    },

    closeSkillDetail() {
        document.getElementById('skill-detail').classList.add('hidden');
        this.renderSkillsTab();
    },

    /* =========================================================
       TAB: THỊ TRẤN
       ========================================================= */
    renderTownTab() {
        this.renderBuildingsTab();
    },

    /* --- Sub-tab: Tòa nhà --- */
    renderBuildingsTab() {
        const container = document.getElementById('building-list');
        container.innerHTML = GAME_DATA.buildings.map(bldg => {
            const level = Game.Town.getBuildingLevel(bldg.id);
            const cost = Game.getBuildingCost(bldg.id);
            const maxed = level >= bldg.maxLevel;
            const effect = bldg.baseEffect + (level - 1) * bldg.effectPerLevel;
            const nextEffect = level < bldg.maxLevel ? bldg.baseEffect + level * bldg.effectPerLevel : null;

            return `
            <div class="building-card">
                <div class="bld-header">
                    <span class="bld-icon">${bldg.icon}</span>
                    <span class="bld-name">${bldg.name}</span>
                    <span class="bld-level">Lv.${level}/${bldg.maxLevel}</span>
                </div>
                <div class="bld-desc">${bldg.desc}</div>
                <div class="bld-effect">Hiện tại: ${effect} ${bldg.effectUnit}${nextEffect ? ` | Cao nhất: ${nextEffect} ${bldg.effectUnit}` : ''}</div>
                <div class="bld-upgrade">
                    <span class="bld-cost">💰 ${Game.formatNumber(cost.gold)}</span>
                    <button class="btn btn-primary btn-small" onclick="Game.Town.upgradeBuilding('${bldg.id}')"
                        ${maxed ? 'disabled' : ''}>
                        ${maxed ? '✅ TỐI ĐA' : '⬆️ Nâng Cấp'}
                    </button>
                </div>
            </div>`;
        }).join('');
    },

    /* --- Sub-tab: Nâng cấp TP --- */
    renderTownUpgradeTab() {
        const container = document.getElementById('town-upgrade-info');
        const nextLevel = Game.state.townLevel + 1;
        const upgrade = GAME_DATA.townUpgrades.find(u => u.level === nextLevel);
        const currentUpgrade = GAME_DATA.townUpgrades.find(u => u.level === Game.state.townLevel);

        if (!upgrade) {
            container.innerHTML = `
                <div class="text-center" style="padding: 20px">
                    <h3 style="color: var(--accent)">🏙️ ${currentUpgrade?.name || 'Thị Trấn'}</h3>
                    <p class="text-dim">Đã đạt cấp tối đa!</p>
                    <p>Số vị trí săn thủ: ${Game.getMaxHunters()}</p>
                </div>`;
            return;
        }

        const totalMats = Game.Town.getTotalMaterials();
        container.innerHTML = `
            <div class="stat-block">
                <div class="stat-block-title">📍 Hiện Tại: Lv.${Game.state.townLevel} - ${currentUpgrade?.name || 'Thị Trấn Nhỏ'}</div>
                <div class="stat-row"><span>Số lượng săn thủ</span><span class="stat-row-val">${Game.getMaxHunters()}</span></div>
            </div>
            <div class="stat-block">
                <div class="stat-block-title">⬆️ Tiếp Theo: ${upgrade.name}</div>
                <div class="stat-row"><span>Số lượng săn thủ</span><span class="stat-row-val">${upgrade.hunterSlots}</span></div>
                <div class="stat-row"><span>💰 Vàng</span><span class="stat-row-val ${Game.state.gold >= upgrade.cost ? 'text-success' : 'text-danger'}">${Game.formatNumber(Game.state.gold)} / ${Game.formatNumber(upgrade.cost)}</span></div>
                <div class="stat-row"><span>📦 Nguyên liệu</span><span class="stat-row-val ${totalMats >= upgrade.matCost ? 'text-success' : 'text-danger'}">${totalMats} / ${upgrade.matCost}</span></div>
            </div>
            <button class="btn btn-primary btn-full" onclick="Game.Town.upgradeTown()">⬆️ Nâng Cấp Thị Trấn</button>
        `;
    },

    /* --- Sub-tab: Tái sinh --- */
    renderRebirthTab() {
        const container = document.getElementById('rebirth-select');
        const hunters = Game.state.hunters.filter(h => h.alive && h.level >= 10);

        if (hunters.length === 0) {
            container.innerHTML = '<div class="text-center text-dim" style="padding: 20px"><p>Không có hunter nào đủ điều kiện tái sinh (cần level 10+)</p></div>';
            return;
        }

        container.innerHTML = hunters.map(h => {
            const pts = Math.floor(h.level / 10) + 1;
            const currentPts = Game.state.rebirthPoints[h.id] || 0;
            return `
            <div class="hunter-card ${h.quality}">
                <div class="hc-header">
                    <span class="hc-name">${h.name}</span>
                    <span class="hc-class class-${h.classId}">${GAME_DATA.classes[h.classId].icon} Lv.${h.level}</span>
                </div>
                <div class="hc-level">♻️ Điểm tiềm năng hiện tại: ${currentPts} | Nhận thêm: +${pts}</div>
                <button class="btn btn-danger btn-small btn-full mt-8" onclick="if(confirm('Tái sinh ${h.name}? Level sẽ reset!')){Game.rebirthHunter('${h.id}'); Game.UI.renderRebirthTab();}">
                    ♻️ Tái Sinh (${pts} điểm tiềm năng)
                </button>
            </div>`;
        }).join('');
    },

    /* --- Sub-tab: Thống kê --- */
    renderStatsTab() {
        const stats = Game.Town.getStats();
        const container = document.getElementById('town-stats');
        container.innerHTML = `
            <div class="stat-block">
                <div class="stat-block-title">🏘️ Thị Trấn</div>
                <div class="stat-row"><span>Cấp độ</span><span class="stat-row-val">Lv.${Game.state.townLevel}</span></div>
                <div class="stat-row"><span>Ngày</span><span class="stat-row-val">${Game.state.dayCount}</span></div>
                <div class="stat-row"><span>Thời gian chơi</span><span class="stat-row-val">${Math.floor(stats.playTime / 60)} phút</span></div>
            </div>
            <div class="stat-block">
                <div class="stat-block-title">🧑‍🤝‍🧑 Săn Thủ</div>
                <div class="stat-row"><span>Tổng số</span><span class="stat-row-val">${stats.hunters}</span></div>
                <div class="stat-row"><span>Đang sống</span><span class="stat-row-val">${stats.aliveHunters}</span></div>
                <div class="stat-row"><span>Level TB</span><span class="stat-row-val">${stats.avgLevel}</span></div>
                <div class="stat-row"><span>Level cao nhất</span><span class="stat-row-val">${stats.topLevel}</span></div>
                <div class="stat-row"><span>Tổng cấp</span><span class="stat-row-val">${stats.totalLevels}</span></div>
            </div>
            <div class="stat-block">
                <div class="stat-block-title">⚔️ Chiến Đấu</div>
                <div class="stat-row"><span>Quái giết</span><span class="stat-row-val">${Game.formatNumber(stats.totalKills)}</span></div>
                <div class="stat-row"><span>Boss giết</span><span class="stat-row-val">${stats.totalBossKills}</span></div>
                <div class="stat-row"><span>Địa hạ</span><span class="stat-row-val">${stats.totalDungeons}</span></div>
                <div class="stat-row"><span>Vàng kiếm được</span><span class="stat-row-val text-gold">${Game.formatNumber(stats.totalGoldEarned)}</span></div>
            </div>
            <div class="stat-block">
                <div class="stat-block-title">📦 Kho</div>
                <div class="stat-row"><span>Vật phẩm</span><span class="stat-row-val">${stats.itemsInInventory}</span></div>
                <div class="stat-row"><span>Rèn đồ</span><span class="stat-row-val">${stats.totalCrafted}</span></div>
                <div class="stat-row"><span>Thú cưỡi</span><span class="stat-row-val">${stats.petsOwned}</span></div>
                <div class="stat-row"><span>Điểm tái sinh</span><span class="stat-row-val">${stats.rebirthPoints}</span></div>
            </div>
            <div class="stat-block">
                <div class="stat-row"><span>🗺️ Zones</span><span class="stat-row-val">${stats.zonesUnlocked}/${GAME_DATA.zones.length}</span></div>
            </div>
            <button class="btn btn-danger btn-full mt-8" onclick="Game.resetGame()">🗑️ Reset Game</button>
            <button class="btn btn-secondary btn-full mt-8" onclick="Game.forceSave()">💾 Lưu Game</button>
        `;
    },

    /* =========================================================
       TAB: SĂN ĐÁNH
       ========================================================= */
    renderBattleTab() {
        this.renderExploreTab();
    },

    /* --- Sub-tab: Khám phá --- */
    renderExploreTab() {
        const container = document.getElementById('zone-list');
        container.innerHTML = GAME_DATA.zones.map(zone => {
            const unlocked = Game.state.unlockedZones.includes(zone.id);
            const active = Game.state.currentZone === zone.id;
            const huntersHere = Game.state.hunters.filter(h => h.currentZone === zone.id);
            const zoneIdx = GAME_DATA.zones.indexOf(zone);

            let canUnlock = true;
            if (zoneIdx > 0) {
                const prevZone = GAME_DATA.zones[zoneIdx - 1];
                canUnlock = Game.state.unlockedZones.includes(prevZone.id);
            }

            return `
            <div class="zone-card ${unlocked ? '' : 'locked'} ${active ? 'active-zone' : ''}">
                <div class="zone-name">${zone.icon} ${zone.name}</div>
                <div class="zone-info">Cấp ${zone.levelReq}+ | Vàng/kill: ${zone.goldPerKill} | Drop nguyên liệu: ${Math.floor(zone.matDropChance * 100)}%</div>
                ${unlocked ? `
                    <div class="zone-reward">Hunter đang săn: ${huntersHere.length}</div>
                ` : `
                    <div class="zone-reward">🔒 ${canUnlock ? `Mở khóa: 💰${Game.formatNumber(zone.unlockCost)}` : 'Cần mở zone trước'}</div>
                    <button class="btn btn-primary btn-small btn-full mt-8" onclick="Game.Town.unlockZone('${zone.id}')"
                        ${!canUnlock ? 'disabled' : ''}>
                        🔓 Mở Khóa
                    </button>
                `}
            </div>`;
        }).join('');
    },

    /* --- Sub-tab: Boss --- */
    renderBossTab() {
        const container = document.getElementById('boss-summon');
        
        if (Game.Battle.currentBoss) {
            const boss = Game.Battle.currentBoss;
            const hpPct = (boss.currentHp / boss.hp) * 100;
            container.innerHTML = `
                <div class="boss-card">
                    <div style="font-size: 2rem">${boss.icon}</div>
                    <div class="boss-name">${boss.name} Lv.${boss.level}</div>
                    <div class="boss-hp-bar">
                        <div class="bar-row bar-hp">
                            <span class="bar-label">HP</span>
                            <div class="bar-track"><div class="bar-fill" style="width: ${hpPct}%"></div></div>
                            <span class="bar-val">${Game.formatNumber(boss.currentHp)}/${Game.formatNumber(boss.hp)}</span>
                        </div>
                    </div>
                    <div class="boss-reward">Phần thưởng: 💰${Game.formatNumber(boss.goldDrop)} | 📦${boss.matDrop} | EXP ${boss.expDrop}</div>
                </div>`;
            return;
        }

        container.innerHTML = `<div class="text-center text-dim mb-8"><p>Sừng Boss hiện có: <b class="text-gold">📯 ${Game.state.bossHorns}</b></p></div>
            <div class="zone-cards">
                ${GAME_DATA.bosses.map(boss => {
                    const unlocked = Game.state.unlockedZones.includes(boss.zone);
                    return `
                    <div class="zone-card ${!unlocked ? 'locked' : ''}">
                        <div class="zone-name">${boss.icon} Boss ${boss.name}</div>
                        <div class="zone-info">Lv.${boss.level} | HP: ${Game.formatNumber(boss.hp)} | ATK: ${boss.atk}</div>
                        <div class="zone-reward">💰${Game.formatNumber(boss.goldDrop)} | 📦${boss.matDrop}</div>
                        <button class="btn btn-danger btn-small btn-full mt-8" onclick="Game.Battle.summonBoss('${boss.id}')"
                            ${!unlocked || Game.state.bossHorns < boss.hornCost ? 'disabled' : ''}>
                            📯 Kêu Gọi (${boss.hornCost} Sừng)
                        </button>
                    </div>`;
                }).join('')}
            </div>`;
    },

    /* --- Sub-tab: Địa hạ --- */
    renderDungeonTab() {
        const container = document.getElementById('dungeon-list');
        container.innerHTML = GAME_DATA.dungeons.map(d => {
            const maxHunter = Game.state.hunters
                .filter(h => h.alive && h.level >= d.levelReq)
                .sort((a, b) => b.atk - a.atk)[0];
            const canEnter = !!maxHunter;

            return `
            <div class="zone-card">
                <div class="zone-name">🏚️ ${d.name}</div>
                <div class="zone-info">Cấp cần: ${d.levelReq} | ${d.monsterCount} quái | Multi: x${d.monsterLvMulti}</div>
                <div class="zone-reward">💰${d.rewardGold} | 📦${d.rewardMats} | Item: ${Math.floor(d.rewardItemChance * 100)}%</div>
                <button class="btn btn-primary btn-small btn-full mt-8" onclick="Game.Battle.startDungeon('${d.id}')"
                    ${!canEnter ? 'disabled' : ''}>
                    ${canEnter ? `🏚️ Vào (${maxHunter.name})` : '❌ Không đủ level'}
                </button>
            </div>`;
        }).join('');
    },

    /* --- Sub-tab: Nhật ký --- */
    renderLogTab() {
        const container = document.getElementById('battle-log');
        const logs = Game.state.battleLog.slice(0, 100);
        
        if (logs.length === 0) {
            container.innerHTML = '<div class="text-center text-dim" style="padding: 20px"><p>Chưa có nhật ký chiến đấu</p></div>';
            return;
        }

        container.innerHTML = logs.map(log => `
            <div class="log-entry ${log.type}">[${log.time}] ${log.message}</div>
        `).join('');
    },

    /* =========================================================
       TAB: KHO ĐỒ
       ========================================================= */
    renderInventoryTab() {
        this.renderInventory('all');
    },

    renderInventory(filter = 'all') {
        const container = document.getElementById('inventory-list');
        let items = Game.state.inventory.filter(inv => inv.qty > 0);

        if (filter !== 'all') {
            items = items.filter(inv => {
                const data = Game.getItemData(inv.id);
                return data && data.type === filter;
            });
        }

        if (items.length === 0) {
            container.innerHTML = '<div class="text-center text-dim" style="padding: 20px"><p>Kho trống</p></div>';
            return;
        }

        container.innerHTML = items.map(inv => {
            const data = Game.getItemData(inv.id);
            if (!data) return '';
            return `
            <div class="item-entry ${data.type}">
                <div>
                    <div class="item-name item-rarity-${data.rarity}">${data.name}</div>
                    <div class="item-stat">${data.baseAtk ? `⚔️+${data.baseAtk} ` : ''}${data.baseDef ? `🛡️+${data.baseDef} ` : ''}${data.baseCrit ? `🎯+${data.baseCrit}% ` : ''}${data.baseHp ? `❤️+${data.baseHp} ` : ''}${data.desc || ''}</div>
                </div>
                <div class="item-actions">
                    <span class="text-sm text-dim">x${inv.qty}</span>
                </div>
            </div>`;
        }).join('');
    },

    /* --- Sub-tab: Rèn --- */
    renderCraftTab() {
        const container = document.getElementById('craft-recipes');
        const blacksmithLevel = Game.Town.getBuildingLevel('blacksmith');

        const available = GAME_DATA.recipes.filter(r => r.reqLevel <= blacksmithLevel);
        const locked = GAME_DATA.recipes.filter(r => r.reqLevel > blacksmithLevel);

        container.innerHTML = '';

        if (available.length > 0) {
            container.innerHTML += '<h3 class="text-sm text-dim mb-8">Có thể rèn:</h3>';
            available.forEach(recipe => {
                const resultItem = Game.getItemData(recipe.result);
                if (!resultItem) return;

                const matsHtml = Object.entries(recipe.materials).map(([matId, qty]) => {
                    const mat = GAME_DATA.materials.find(m => m.id === matId);
                    const have = Game.state.materials[matId] || 0;
                    const enough = have >= qty;
                    return `<span class="${enough ? 'mat-req' : 'mat-missing'}">${mat?.icon || ''} ${mat?.name || matId}: ${have}/${qty}</span>`;
                }).join(' | ');

                const canCraft = Object.entries(recipe.materials).every(([matId, qty]) => 
                    (Game.state.materials[matId] || 0) >= qty
                );

                container.innerHTML += `
                <div class="recipe-entry">
                    <div class="recipe-name item-rarity-${resultItem.rarity}">${resultItem.name}</div>
                    <div class="recipe-mats">${matsHtml}</div>
                    <button class="btn btn-primary btn-small btn-full" onclick="Game.UI.craftItem('${recipe.id}')"
                        ${!canCraft ? 'disabled' : ''}>
                        🔨 Rèn
                    </button>
                </div>`;
            });
        }

        if (locked.length > 0) {
            container.innerHTML += '<h3 class="text-sm text-dim mb-8 mt-8">🔒 Chưa mở khóa:</h3>';
            locked.forEach(recipe => {
                const resultItem = Game.getItemData(recipe.result);
                container.innerHTML += `
                <div class="recipe-entry" style="opacity:0.5">
                    <div class="recipe-name">🔒 ${resultItem?.name || '?'} (Lò Rèn Lv.${recipe.reqLevel})</div>
                </div>`;
            });
        }
    },

    craftItem(recipeId) {
        const recipe = GAME_DATA.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        // Check materials
        for (const [matId, qty] of Object.entries(recipe.materials)) {
            if ((Game.state.materials[matId] || 0) < qty) {
                Game.notify('❌ Không đủ nguyên liệu!');
                return;
            }
        }

        // Consume materials
        for (const [matId, qty] of Object.entries(recipe.materials)) {
            Game.state.materials[matId] -= qty;
        }

        // Add item
        Game.Hunters.addItem(recipe.result, 1);
        Game.state.totalCrafted++;
        Game.Hunters.trackQuest('crafted');

        const resultItem = Game.getItemData(recipe.result);
        Game.addLog('loot', `🔨 Rèn thành công: ${resultItem.name}`);
        Game.notify(`🔨 Đã rèn ${resultItem.name}!`);
        this.renderCraftTab();
    },

    /* --- Sub-tab: Bán --- */
    renderSellTab() {
        const container = document.getElementById('sell-list');
        let items = Game.state.inventory.filter(inv => {
            const data = Game.getItemData(inv.id);
            return data && inv.qty > 0 && !data.bossDrop;
        });

        if (items.length === 0) {
            container.innerHTML = '<div class="text-center text-dim" style="padding: 20px"><p>Không có gì để bán</p></div>';
            return;
        }

        container.innerHTML = items.map(inv => {
            const data = Game.getItemData(inv.id);
            if (!data) return '';
            const price = Math.floor((data.cost || 10) * 0.6);
            return `
            <div class="item-entry ${data.type}">
                <div>
                    <div class="item-name item-rarity-${data.rarity}">${data.name}</div>
                    <div class="item-stat">Giá bán: 💰${price}</div>
                </div>
                <button class="btn btn-primary btn-small" onclick="Game.UI.sellItem('${inv.id}')">
                    Bán
                </button>
            </div>`;
        }).join('');
    },

    sellItem(itemId) {
        const data = Game.getItemData(itemId);
        if (!data) return;
        const price = Math.floor((data.cost || 10) * 0.6);
        Game.removeItem(itemId, 1);
        Game.state.gold += price;
        Game.notify(`💰 Bán ${data.name} +${price} vàng`);
        this.renderSellTab();
    },

    /* --- Sub-tab: Nguyên liệu --- */
    renderMaterialsTab() {
        const container = document.getElementById('materials-list');
        container.innerHTML = GAME_DATA.materials.map(mat => {
            const count = Game.state.materials[mat.id] || 0;
            return `
            <div class="mat-entry">
                <div style="font-size: 1.5rem">${mat.icon}</div>
                <div class="mat-count">${count}</div>
                <div class="mat-name">${mat.name}</div>
            </div>`;
        }).join('');
    },

    /* =========================================================
       TAB: THÚ CƯỠI
       ========================================================= */
    renderPetsTab() {
        const container = document.getElementById('pet-list');
        const pets = Game.state.pets;

        if (pets.length === 0) {
            container.innerHTML = '<div class="text-center text-dim" style="padding: 20px"><p>Chưa có thú cưỡi. Hãy mở Trứng Sáng!</p></div>';
            return;
        }

        container.innerHTML = pets.map(pet => {
            const petData = GAME_DATA.pets.find(p => p.id === pet.dataId);
            if (!petData) return '';
            const equippedHunter = pet.equippedBy 
                ? Game.state.hunters.find(h => h.id === pet.equippedBy) 
                : null;
            const starsHtml = '⭐'.repeat(pet.stars) + '☆'.repeat(5 - pet.stars);
            const upgradeCost = pet.stars * 3;

            return `
            <div class="pet-card ${pet.tier}">
                <div class="pet-header">
                    <span class="pet-name">${petData.icon} ${petData.name}</span>
                    <span class="pet-tier ${pet.tier}">Loại ${pet.tier}</span>
                </div>
                <div class="pet-stars">${starsHtml}</div>
                <div class="pet-bonus">${petData.bonusDesc} (x${(1 + (pet.stars - 1) * 0.2).toFixed(1)})</div>
                ${equippedHunter ? `<div class="text-sm text-dim mt-8">Gắn cho: ${equippedHunter.name}</div>` : ''}
                <div style="display:flex;gap:4px;margin-top:6px">
                    <button class="btn btn-primary btn-small" onclick="Game.Pets.upgradePet('${pet.id}'); Game.UI.renderPetsTab();"
                        ${pet.stars >= 5 ? 'disabled' : ''}>
                        ⭐ Nâng (${upgradeCost}💎)
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="Game.Pets.releasePet('${pet.id}'); Game.UI.renderPetsTab();"
                        ${equippedHunter ? 'disabled' : ''}>
                        🗑️ Thu Hồi
                    </button>
                </div>
            </div>`;
        }).join('');
    },

    /* --- Sub-tab: Gắn thú --- */
    renderPetEquipTab() {
        const container = document.getElementById('pet-equip-list');
        const assignPanel = document.getElementById('pet-assign-panel');

        if (Game.Pets._showPetList) {
            container.innerHTML = '';
            assignPanel.classList.remove('hidden');
            
            const hunterId = Game.Pets._assigningHunterId;
            const hunter = Game.state.hunters.find(h => h.id === hunterId);
            
            const availablePets = Game.state.pets.filter(p => !p.equippedBy || p.equippedBy === hunterId);
            const listContainer = document.getElementById('pet-assign-list');
            
            if (availablePets.length === 0) {
                listContainer.innerHTML = '<div class="text-center text-dim" style="padding: 20px"><p>Không có thú cưỡi khả dụng</p></div>';
                return;
            }

            listContainer.innerHTML = `<p class="mb-8">Chọn thú cho ${hunter?.name || '?'}:</p>` +
                availablePets.map(pet => {
                    const petData = GAME_DATA.pets.find(p => p.id === pet.dataId);
                    return `
                    <div class="pet-card ${pet.tier}" onclick="Game.Pets.confirmAssignPet('${pet.id}')">
                        <div class="pet-header">
                            <span class="pet-name">${petData.icon} ${petData.name}</span>
                            <span class="pet-tier ${pet.tier}">Loại ${pet.tier}</span>
                        </div>
                        <div class="pet-bonus">${petData.bonusDesc}</div>
                    </div>`;
                }).join('');
            return;
        }

        assignPanel.classList.add('hidden');
        const hunters = Game.state.hunters.filter(h => h.alive);

        if (hunters.length === 0) {
            container.innerHTML = '<div class="text-center text-dim" style="padding: 20px"><p>Không có săn thủ nào</p></div>';
            return;
        }

        container.innerHTML = hunters.map(h => {
            const pet = h.petId ? Game.state.pets.find(p => p.id === h.petId) : null;
            const petData = pet ? GAME_DATA.pets.find(p => p.id === pet.dataId) : null;
            return `
            <div class="hunter-card ${h.quality}" onclick="Game.Pets.assignPet('${h.id}')">
                <div class="hc-header">
                    <span class="hc-name">${h.name}</span>
                    <span class="hc-class class-${h.classId}">${GAME_DATA.classes[h.classId].icon} Lv.${h.level}</span>
                </div>
                <div class="hc-level">${petData ? `${petData.icon} ${petData.name} (${petData.bonusDesc})` : '❌ Chưa có thú cưỡi'}</div>
                <div class="text-sm text-dim">Nhấn để gắn thú</div>
            </div>`;
        }).join('');
    },

    /* =========================================================
       TAB: CỬA HÀNG
       ========================================================= */
    renderShopTab() {
        this.renderShopGeneral();
    },

    renderShopGeneral() {
        const container = document.getElementById('shop-general');
        container.innerHTML = GAME_DATA.shopItems.map(item => `
            <div class="shop-item">
                <div class="shop-item-info">
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-desc">${item.desc}</div>
                </div>
                <div style="display:flex;align-items:center;gap:6px">
                    <span class="shop-item-price">${item.currency === 'gold' ? `💰${item.price}` : item.price === 0 ? 'Miễn phí' : `💎${item.price}`}</span>
                    <button class="btn btn-primary btn-small" onclick="Game.UI.buyShopItem('${item.id}')">Mua</button>
                </div>
            </div>
        `).join('');
    },

    buyShopItem(itemId) {
        const item = GAME_DATA.shopItems.find(i => i.id === itemId);
        if (!item) return;

        if (item.currency === 'gold' && Game.state.gold < item.price) {
            Game.notify('❌ Không đủ vàng!');
            return;
        }

        if (item.currency === 'gems' && Game.state.gems < item.price) {
            Game.notify('❌ Không đủ ngọc!');
            return;
        }

        if (item.currency === 'gold') Game.state.gold -= item.price;
        if (item.currency === 'gems') Game.state.gems -= item.price;

        if (item.gives.item) {
            Game.Hunters.addItem(item.gives.item, item.gives.qty || 1);
        }
        if (item.gives.gem) {
            Game.state.gems += item.gives.gem;
        }
        if (item.gives.special === 'refresh') {
            Game.state.hireCandidates = [];
            for (let i = 0; i < 3; i++) Game.Hunters.spawnCandidate();
        }

        Game.notify(`🛒 Đã mua ${item.name}!`);
        this.renderShopGeneral();
    },

    /* --- Sub-tab: Nhiệm vụ --- */
    renderDailyQuests() {
        const container = document.getElementById('daily-quests');
        container.innerHTML = GAME_DATA.dailyQuests.map(quest => {
            const progress = Game.state.dailyQuestProgress[quest.type] || 0;
            const claimed = Game.state.dailyQuestsClaimed[quest.id];
            const pct = Math.min(100, (progress / quest.target) * 100);
            const done = progress >= quest.target;

            return `
            <div class="quest-entry ${claimed ? 'completed' : ''}">
                <div class="quest-desc">${quest.desc}</div>
                <div class="quest-progress">
                    <span class="text-sm">${Math.min(progress, quest.target)}/${quest.target}</span>
                    <div class="quest-bar"><div class="quest-bar-fill" style="width: ${pct}%"></div></div>
                    <button class="btn btn-small ${done && !claimed ? 'btn-success' : 'btn-secondary'}" 
                        onclick="Game.UI.claimDailyQuest('${quest.id}')"
                        ${!done || claimed ? 'disabled' : ''}>
                        ${claimed ? '✅' : done ? 'Nhận' : '...'}
                    </button>
                </div>
                <div class="quest-reward">Phần thưởng: 💰${quest.rewardGold}${quest.rewardGems > 0 ? ` + 💎${quest.rewardGems}` : ''}</div>
            </div>`;
        }).join('');
    },

    claimDailyQuest(questId) {
        const quest = GAME_DATA.dailyQuests.find(q => q.id === questId);
        if (!quest) return;
        if (Game.state.dailyQuestsClaimed[questId]) return;

        const progress = Game.state.dailyQuestProgress[quest.type] || 0;
        if (progress < quest.target) return;

        Game.state.dailyQuestsClaimed[questId] = true;
        Game.state.gold += quest.rewardGold;
        Game.state.gems += quest.rewardGems;

        Game.notify(`🎁 Nhận thưởng: +${quest.rewardGold}💰 +${quest.rewardGems}💎`);
        this.renderDailyQuests();
    },

    /* --- Sub-tab: Điểm danh --- */
    renderDailyCheckin() {
        const container = document.getElementById('daily-checkin');
        const today = Game.state.dayCount % 7 || 7;

        container.innerHTML = GAME_DATA.dailyRewards.map((reward, i) => {
            const dayNum = i + 1;
            const claimed = Game.state.dailyCheckin.includes(dayNum);
            const isToday = dayNum === today;

            return `
            <div class="checkin-day ${claimed ? 'claimed' : ''} ${isToday && !claimed ? 'today' : ''}" 
                 onclick="Game.UI.claimCheckin(${dayNum})" style="cursor:pointer">
                <div class="checkin-num">Ngày ${dayNum}</div>
                <div class="checkin-reward">💰${reward.gold}</div>
                <div style="font-size:0.6rem">💎${reward.gems}</div>
                ${reward.special ? `<div style="font-size:0.6rem;color:var(--accent)">${reward.special}</div>` : ''}
                ${claimed ? '<div style="font-size:0.6rem">✅</div>' : ''}
            </div>`;
        }).join('');
    },

    claimCheckin(dayNum) {
        const today = Game.state.dayCount % 7 || 7;
        if (dayNum > today) {
            Game.notify('❌ Chưa đến ngày này!');
            return;
        }
        if (Game.state.dailyCheckin.includes(dayNum)) {
            Game.notify('❌ Đã nhận rồi!');
            return;
        }

        const reward = GAME_DATA.dailyRewards.find(r => r.day === dayNum);
        if (!reward) return;

        Game.state.dailyCheckin.push(dayNum);
        Game.state.gold += reward.gold;
        Game.state.gems += reward.gems;

        Game.notify(`🎁 Điểm danh: +${reward.gold}💰 +${reward.gems}💎`);
        this.renderDailyCheckin();
    },

    /* =========================================================
       MODAL
       ========================================================= */
    showModal(title, content) {
        document.getElementById('modal-header').innerHTML = title;
        document.getElementById('modal-body').innerHTML = content;
        document.getElementById('modal-overlay').classList.remove('hidden');
    },

    closeModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
    },

    closeOfflinePopup() {
        document.getElementById('offline-popup').classList.add('hidden');
    }
};
