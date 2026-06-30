// ========== UI RENDERING & EVENTS ==========

let currentTab = 'town';
let currentSubTab = 'list';
let selectedHunter = null;
let selectedEquipment = null;
let selectedRecipe = null;
let dungeonSelection = [];
let messageTimeout = null;

const TABS = [
    { id: 'town', name: 'THỊ TRẤN' },
    { id: 'hunters', name: 'THỢ SĂN' },
    { id: 'equipment', name: 'TRANG BỊ' },
    { id: 'activities', name: 'HOẠT ĐỘNG' },
    { id: 'shop', name: 'CỬA HÀNG' },
    { id: 'quests', name: 'NHIỆM VỤ' },
    { id: 'settings', name: 'CÀI ĐẶT' }
];

const SUBTABS = {
    town: [
        { id: 'list', name: 'Danh Sách' },
        { id: 'build', name: 'Xây Dựng' }
    ],
    hunters: [
        { id: 'list', name: 'Danh Sách' },
        { id: 'detail', name: 'Chi Tiết' }
    ],
    equipment: [
        { id: 'inventory', name: 'Kho Đồ' },
        { id: 'craft', name: 'Chế Tạo' },
        { id: 'enhance', name: 'Cường Hóa' }
    ],
    activities: [
        { id: 'hunt', name: 'Săn Bắn' },
        { id: 'dungeon', name: 'Hầm Ngục' },
        { id: 'boss', name: 'Trùm' }
    ],
    shop: [
        { id: 'trade', name: 'Giao Dịch' },
        { id: 'specials', name: 'Đặc Biệt' }
    ],
    quests: [
        { id: 'quests', name: 'Nhiệm Vụ' },
        { id: 'achievements', name: 'Thành Tựu' }
    ]
};

function render() {
    const app = document.getElementById('app');
    if (!app) return;

    let html = renderHeader();
    html += renderTabs();
    
    if (SUBTABS[currentTab]) {
        html += renderSubTabs();
    }
    
    html += '<div class="content">';
    html += renderContent();
    html += '</div>';
    
    html += renderLog();
    
    app.innerHTML = html;
    
    // Bind events
    bindEvents();
}

function initModal() {
    if (document.getElementById('modalOverlay')) return;
    const div = document.createElement('div');
    div.className = 'modal-overlay';
    div.id = 'modalOverlay';
    div.style.display = 'none';
    div.innerHTML =
        '<div class="modal-box" id="modalBox">' +
        '<div class="modal-icon" id="modalIcon">⚠️</div>' +
        '<div class="modal-title" id="modalTitle">CẢNH BÁO</div>' +
        '<div class="modal-body" id="modalBody"></div>' +
        '<div class="modal-actions" id="modalActions"></div>' +
        '</div>';
    div.addEventListener('click', function(e) {
        if (e.target === div) hideModal();
    });
    document.body.appendChild(div);
    document.addEventListener('keydown', modalKeydown);
}

function modalKeydown(e) {
    if (e.key === 'Escape') hideModal();
}

function showModal(icon, title, body, buttons) {
    initModal();
    document.getElementById('modalIcon').textContent = icon;
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = body;
    const actions = document.getElementById('modalActions');
    actions.innerHTML = '';
    for (let btn of buttons) {
        const el = document.createElement('button');
        el.className = btn.cls || 'btn';
        el.textContent = btn.text;
        el.onclick = function() {
            hideModal();
            if (btn.cb) btn.cb();
        };
        actions.appendChild(el);
    }
    document.getElementById('modalOverlay').style.display = 'flex';
}

function hideModal() {
    const el = document.getElementById('modalOverlay');
    if (el) el.style.display = 'none';
}

function renderHeader() {
    if (!game) return '<div class="loading">Đang tải...</div>';
    
    const diff = DIFFICULTIES.find(d => d.id === game.difficulty);
    const diffName = diff ? diff.name : 'Dễ';
    const townName = game.townName || 'Thị Trấn Bóng Tối';
    
    return `
        <div class="header">
            <div class="header-title">${townName}</div>
            <div class="header-subtitle">EVIL HUNTER TYCOON</div>
            <div class="header-resources">
                <span class="res-gold">Vàng: ${fmt(game.gold)}</span>
                <span class="res-gems">Ngọc: ${game.gems}</span>
                <span class="res-diff">[${diffName}]</span>
            </div>
            <div class="header-info">
                <span>Thợ Săn: ${game.hunters.length}/${game.maxPopulation}</span>
                <span>Công Trình: ${Object.values(game.buildings).filter(b => b.level > 0).length}</span>
            </div>
        </div>
    `;
}

function renderTabs() {
    let html = '<div class="tabs">';
    for (let tab of TABS) {
        const active = tab.id === currentTab ? ' active' : '';
        html += `<button class="tab-btn${active}" data-tab="${tab.id}">${tab.name}</button>`;
    }
    html += '</div>';
    return html;
}

function renderSubTabs() {
    const subs = SUBTABS[currentTab] || [];
    let html = '<div class="subtabs">';
    for (let sub of subs) {
        const active = sub.id === currentSubTab ? ' active' : '';
        html += `<button class="subtab-btn${active}" data-tab="${currentTab}" data-sub="${sub.id}">${sub.name}</button>`;
    }
    html += '</div>';
    return html;
}

function renderContent() {
    switch (currentTab) {
        case 'town': return renderTown();
        case 'hunters': return renderHunters();
        case 'equipment': return renderEquipment();
        case 'activities': return renderActivities();
        case 'shop': return renderShop();
        case 'quests': return renderQuests();
        case 'settings': return renderSettings();
        default: return '<div>Chức năng đang phát triển</div>';
    }
}

// ========== TAB: CÀI ĐẶT ==========
function renderSettings() {
    const today = new Date().toISOString().split('T')[0];
    const dailyDone = game.lastDailyDate === today;
    const streak = game.dailyStreak || 0;
    
    let html = '<div class="section-title">CÀI ĐẶT</div>';
    
    // Thông tin game
    html += '<div class="info-card">';
    html += `<div>Thời gian chơi: ${Math.floor(game.gameTime / 60)} phút</div>`;
    html += `<div>Tổng số quái đã giết: ${game.totalKills}</div>`;
    html += `<div>Tổng số đồ đã chế: ${game.totalCrafts}</div>`;
    html += `<div>Hầm ngục đã hoàn thành: ${game.totalDungeons}</div>`;
    html += `<div>Boss đã tiêu diệt: ${game.totalBossKills}</div>`;
    html += `<div>Chuỗi điểm danh: ${streak}/7</div>`;
    html += '</div>';
    
    // Reset game
    html += '<div class="section-title">RESET GAME</div>';
    html += '<div class="settings-card danger">';
    html += '<div class="settings-warning">⚠️ Xóa toàn bộ tiến trình game! Hành động này không thể hoàn tác.</div>';
    html += '<button class="btn btn-danger" onclick="uiResetGame()">XÓA TẤT CẢ</button>';
    html += '</div>';
    
    // Hướng dẫn
    html += '<div class="section-title">HƯỚNG DẪN</div>';
    html += '<div class="info-card">';
    html += '<div>1. Xây dựng công trình để mở khóa chức năng</div>';
    html += '<div>2. Chiêu mộ thợ săn và gửi đi săn quái</div>';
    html += '<div>3. Thu thập nguyên liệu, chế tạo và cường hóa trang bị</div>';
    html += '<div>4. Lên cấp 100 và chuyển sinh để tăng hạng</div>';
    html += '<div>5. Mở khóa độ khó cao hơn để farm nguyên liệu hiếm</div>';
    html += '</div>';
    
    return html;
}

function renderLog() {
    if (!game || game.logs.length === 0) return '';
    let html = '<div class="log-section"><div class="log-title">NHẬT KÝ</div><div class="log-content">';
    for (let log of game.logs.slice(0, 10)) {
        html += `<div class="log-entry">${log.msg}</div>`;
    }
    html += '</div></div>';
    return html;
}

// ========== TAB: THỊ TRẤN ==========
function renderTown() {
    if (currentSubTab === 'list') return renderTownList();
    if (currentSubTab === 'build') return renderTownBuild();
    return '';
}

function renderTownList() {
    const today = new Date().toISOString().split('T')[0];
    const dailyDone = game.lastDailyDate === today;
    const streak = game.dailyStreak || 0;
    const nextReward = [0, 5, 10, 15, 20, 25, 30, 50][streak >= 7 ? 7 : streak + 1] || 5;
    
    let html = '<div class="section-title">ĐIỂM DANH</div>';
    html += `<div class="daily-card">
        <div class="daily-streak">🔥 Chuỗi: ${streak}/7 ngày</div>
        <div class="daily-status">${dailyDone ? `✅ Đã điểm danh hôm nay!` : `⬇️ Điểm danh nhận ${nextReward} ngọc!`}</div>
        <div class="daily-bar">`;
    for (let d = 1; d <= 7; d++) {
        const filled = d <= streak && dailyDone ? 'filled' : d <= streak ? 'filled-break' : '';
        html += `<span class="daily-dot ${filled}">${d === streak && !dailyDone ? '⬜' : d <= streak ? '✅' : '⬛'}</span>`;
    }
    html += '</div></div>';
    
    html += '<div class="section-title">DANH SÁCH CÔNG TRÌNH</div>';
    html += '<div class="building-grid">';
    
    for (let key in BUILDINGS) {
        const b = BUILDINGS[key];
        const state = game.buildings[key];
        if (!state || !state.unlocked) continue;
        const lv = state.level;
        const maxLv = b.maxLv;
        const isMaxed = lv >= maxLv;
        
        html += `<div class="building-card">
            <div class="building-name">${b.name}</div>
            <div class="building-desc">${b.desc}</div>
            <div class="building-level">Cấp ${lv}/${maxLv}</div>
            <div class="building-effect">${lv > 0 ? b.effect : 'Chưa xây'}</div>
        </div>`;
    }
    
    html += '</div>';
    return html;
}

function renderTownBuild() {
    let html = '<div class="section-title">XÂY DỰNG / NÂNG CẤP</div>';
    html += '<div class="building-grid">';
    
    for (let key in BUILDINGS) {
        const b = BUILDINGS[key];
        const state = game.buildings[key];
        if (!state || !state.unlocked) continue;
        const lv = state.level;
        const maxLv = b.maxLv;
        const isMaxed = lv >= maxLv;
        const cost = b.levels[lv];
        
        html += `<div class="building-card ${isMaxed ? 'maxed' : ''}">
            <div class="building-name">${b.name}</div>
            <div class="building-level">Cấp ${lv} → ${isMaxed ? 'MAX' : (lv + 1)}</div>`;
        
        if (!isMaxed && cost) {
            const canAfford = game.gold >= (cost.gold || 0) && game.gems >= (cost.gems || 0);
            html += `<div class="building-cost">
                ${cost.gold ? `Vàng: ${fmt(cost.gold)}` : ''} ${cost.gems ? `Ngọc: ${cost.gems}` : ''}
            </div>`;
            html += `<button class="btn ${canAfford ? 'btn-primary' : 'btn-disabled'}" 
                onclick="uiBuild('${key}')" ${canAfford ? '' : 'disabled'}>
                ${lv === 0 ? 'Xây Dựng' : 'Nâng Cấp'}
            </button>`;
        } else if (isMaxed) {
            html += '<div class="building-max">MAX LEVEL</div>';
        } else {
            html += '<div class="building-max">Đang khóa</div>';
        }
        
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}

// ========== TAB: THỢ SĂN ==========
function renderHunters() {
    if (currentSubTab === 'list') return renderHunterList();
    if (currentSubTab === 'detail') return renderHunterDetail();
    return '';
}

function renderHunterList() {
    let html = '<div class="section-title">DANH SÁCH THỢ SĂN</div>';
    
    // Thợ săn mđổi
    if (game.hunterQueue.length > 0) {
        const h = game.hunterQueue[0];
        const tierColor = game.getTierColor(h.tier);
        html += `<div class="hunter-arrival">
            <div class="arrival-title">THỢ SĂN MỚI ĐANG CHỜ (${h.tierName})</div>
            <div class="hunter-card compact" style="border-left: 3px solid ${tierColor}">
                <div class="hunter-header">
                    <span><b>${h.name}</b></span>
                    <span>${h.className}</span>
                    <span style="color:${tierColor}">${h.tierName}</span>
                </div>
                <div class="hunter-stats-mini">
                    ATK:${h.atk} DEF:${h.def} HP:${h.hp} CRT:${h.crit}% SPD:${h.atkSpd} EV:${h.evasion}%
                </div>
                ${game.canAddHunter() ? `<button class="btn btn-primary" onclick="uiHireHunter()">Chiêu Mộ (${game.getHireCost(h.tier)}v)</button>` : ''}
            </div>
        </div>`;
    } else if (game.newHunterAvailable) {
        html += `<div class="hunter-arrival">
            <div class="arrival-title">THỢ SĂN MỚI ĐÃ SẴN SÀNG!</div>
            <button class="btn btn-primary" onclick="uiCheckHunter()">Xem Thợ Săn Mới</button>
        </div>`;
    }
    
    if (game.hunters.length === 0) {
        html += '<div class="empty-msg">Chưa có thợ săn nào. Đợi thợ săn mới đến!</div>';
    } else {
        for (let h of game.hunters) {
            const tierColor = game.getTierColor(h.tier);
            const statusText = { idle: 'Nhàn rỗi', hunting: 'Đang săn', training: 'Tập luyện', dungeon: 'Hầm ngục', dead: 'Đã chết' };
            const statusColor = h.status === 'dead' ? '#f44336' : h.status === 'hunting' ? '#4caf50' : '#aaa';
            
            html += `<div class="hunter-card" style="border-left: 3px solid ${tierColor}" onclick="uiSelectHunter(${h.id})">
                <div class="hunter-header">
                    <span><b>${h.name}</b></span>
                    <span>${h.className}</span>
                    <span style="color:${tierColor}">${h.tierName}</span>
                    <span style="color:${statusColor}">${statusText[h.status] || h.status}</span>
                </div>
                <div class="hunter-level">Cấp ${h.level}${h.reincarnations > 0 ? ` [Chuyển Sinh ${h.reincarnations}]` : ''}</div>
                <div class="hunter-bars">
                    <div class="bar-container"><span class="bar-label">HP</span>
                        <div class="bar-bg"><div class="bar-fill" style="width:${(h.hp/h.maxHp*100)}%;background:#4caf50"></div></div>
                        <span class="bar-text">${Math.floor(h.hp)}/${h.maxHp}</span>
                    </div>
                    <div class="bar-container"><span class="bar-label">No</span>
                        <div class="bar-bg"><div class="bar-fill" style="width:${(h.satiety/100*100)}%;background:#ff9800"></div></div>
                        <span class="bar-text">${Math.floor(h.satiety)}</span>
                    </div>
                    <div class="bar-container"><span class="bar-label">TM</span>
                        <div class="bar-bg"><div class="bar-fill" style="width:${(h.mood/100*100)}%;background:#e91e63"></div></div>
                        <span class="bar-text">${Math.floor(h.mood)}</span>
                    </div>
                    <div class="bar-container"><span class="bar-label">TL</span>
                        <div class="bar-bg"><div class="bar-fill" style="width:${(h.stamina/100*100)}%;background:#2196f3"></div></div>
                        <span class="bar-text">${Math.floor(h.stamina)}</span>
                    </div>
                </div>
            </div>`;
        }
    }
    
    return html;
}

function renderHunterDetail() {
    if (!selectedHunter) {
        return '<div class="section-title">CHI TIẾT THỢ SĂN</div><div class="empty-msg">Chọn thợ săn tự danh sách</div>';
    }
    
    const h = game.hunters.find(hu => hu.id === selectedHunter);
    if (!h) return '<div class="empty-msg">Thợ săn không tồn tại</div>';
    
    const tierColor = game.getTierColor(h.tier);
    const statusText = { idle: 'Nhàn rỗi', hunting: 'Đang săn', training: 'Tập luyện', dungeon: 'Hầm ngục', dead: 'Đã chết' };
    const stats = game.getHunterStats(h);
    
    let html = `<div class="section-title">CHI TIẾT: ${h.name}</div>`;
    html += `<div class="hunter-detail" style="border-left: 3px solid ${tierColor}">
        <div class="detail-row"><span>Lớp:</span><span>${h.className}</span></div>
        <div class="detail-row"><span>Hạng:</span><span style="color:${tierColor}">${h.tierName}</span></div>
        <div class="detail-row"><span>Cấp:</span><span>${h.level}/100</span></div>
        <div class="detail-row"><span>Chuyển Sinh:</span><span>${h.reincarnations}/5</span></div>
        <div class="detail-row"><span>Trạng Thái:</span><span>${statusText[h.status] || h.status}</span></div>
        
        <div class="detail-section">CHỈ SỐ</div>
        <div class="detail-row"><span>HP:</span><span>${Math.floor(h.hp)}/${h.maxHp}</span></div>
        <div class="detail-row"><span>ATK:</span><span>${stats.atk}</span></div>
        <div class="detail-row"><span>DEF:</span><span>${stats.def}</span></div>
        <div class="detail-row"><span>CRIT:</span><span>${stats.crit}% (Tối đa 50%)</span></div>
        <div class="detail-row"><span>TỐC ĐỘ:</span><span>${stats.atkSpd}</span></div>
        <div class="detail-row"><span>NE TRÁNH:</span><span>${stats.evasion}% (Tối đa 40%)</span></div>
        
        <div class="detail-section">TÀI NGUYÊN</div>
        <div class="detail-row"><span>No:</span><span>${Math.floor(h.satiety)}/100</span></div>
        <div class="detail-row"><span>Tâm Trạng:</span><span>${Math.floor(h.mood)}/100</span></div>
        <div class="detail-row"><span>Thể Lực:</span><span>${Math.floor(h.stamina)}/100</span></div>
        ${h.shadowSouls > 0 ? `<div class="detail-row"><span>Hồn Bóng Tối:</span><span>${h.shadowSouls}</span></div>` : ''}
        
        <div class="detail-section">TÚI RIÊNG</div>
        <div class="detail-row"><span>Vàng:</span><span>${h.gold}</span></div>
        <div class="detail-row"><span>Nguyên Liệu:</span><span>${Object.keys(h.materials).length > 0 ? Object.entries(h.materials).map(([k,v]) => `${MATERIALS[k]?.name||k}:${v}`).join(', ') : 'Không có'}</span></div>
        
        <div class="detail-section">TRANG BỊ</div>`;
    
    for (let slot in h.equipment) {
        const eq = h.equipment[slot];
        if (eq) {
            const q = EQUIPMENT_QUALITY[eq.quality] || EQUIPMENT_QUALITY[0];
            html += `<div class="detail-row"><span>${slot}:</span><span style="color:${q.color}">${eq.name} [${eq.tier}]${eq.enhance > 0 ? ' +'+eq.enhance : ''} (${q.name})</span>
                <button class="btn btn-small" onclick="uiUnequip(${h.id},'${slot}')">Tháo</button>
                ${game.buildings.enhanceForge && game.buildings.enhanceForge.level > 0 ? `<button class="btn btn-small btn-primary" onclick="uiEnhance(${h.id},'${slot}')">CH+</button>` : ''}
            </div>`;
        } else {
            html += `<div class="detail-row"><span>${slot}:</span><span>Trống</span></div>`;
        }
    }
    
    html += `        <div class="detail-section">ĐẶC TÍNH</div>
        <div class="detail-row"><span>Điểm đặc tính:</span><span>${h.traitPoints}</span></div>`;
    
    if (h.learnedTraits.length > 0) {
        html += '<div class="detail-row"><span>Đã học:</span><span>' + h.learnedTraits.map(tid => {
            const t = TRAITS.find(tr => tr.id === tid);
            return t ? t.name : tid;
        }).join(', ') + '</span></div>';
    }
    
    if (h.traitPoints > 0 && game.buildings.academy && game.buildings.academy.level > 0) {
        html += '<div class="detail-actions">';
        for (let t of TRAITS) {
            if (h.learnedTraits.includes(t.id)) continue;
            html += `<button class="btn btn-small btn-primary" onclick="uiLearnTrait(${h.id},'${t.id}')">${t.name} (1000v)</button>`;
        }
        html += '</div>';
    }
    
    if (h.learnedTraits.length > 0) {
        html += `<button class="btn btn-small btn-danger" onclick="uiResetTraits(${h.id})">Reset Đặc Tính (50 ngọc)</button>`;
    }
    
    html += `<div class="detail-section">HÀNH ĐỘNG</div>
        <div class="detail-actions">`;
    
    if (game.canReincarnate(h)) {
        html += `<button class="btn btn-primary" onclick="uiReincarnate(${h.id})">Chuyển Sinh</button>`;
    }
    if (h.status === 'idle' && h.level < 100 && game.buildings.trainingGround && game.buildings.trainingGround.level > 0) {
        html += `<button class="btn btn-primary" onclick="uiTrain(${h.id})">Huấn Luyện (200 vàng)</button>`;
    }
    if (game.buildings.academy && game.buildings.academy.level > 0) {
        const cls = HUNTER_CLASSES[h.class];
        if (cls && cls.skills) {
            for (let sk of cls.skills) {
                if (!h.skills.includes(sk)) {
                    html += `<button class="btn btn-primary" onclick="uiLearnSkill(${h.id},'${sk}')">Học: ${sk} (500v)</button>`;
                }
            }
        }
    }
    html += `<button class="btn btn-danger" onclick="uiBanish(${h.id})">Trục Xuất</button>`;
    
    html += `</div></div>`;
    
    // Trang b? t? kho
    if (game.inventory.length > 0) {
        html += '<div class="section-title">TRANG BỊ TỪ KHO</div>';
        html += '<div class="equip-grid">';
        for (let item of game.inventory) {
            const canEquip = !item.class || item.class.includes(h.class);
            html += `<div class="equip-card ${canEquip ? '' : 'dimmed'}">
                <div>${item.name} [${item.tier}]</div>
                <div>Loại: ${item.slot}</div>
                ${item.stats ? `<div>ATK:${item.stats.atk||0} DEF:${item.stats.def||0} HP:${item.stats.hp||0} CRT:${item.stats.crit||0}%</div>` : ''}
                ${canEquip ? `<button class="btn btn-small btn-primary" onclick="uiEquip(${h.id},'${item.id}')">Trang Bị</button>` : '<span style="color:#666">Không phù hợp</span>'}
            </div>`;
        }
        html += '</div>';
    }
    
    return html;
}

// ========== TAB: TRANG BỊ ==========
function renderEquipment() {
    if (currentSubTab === 'inventory') return renderInventory();
    if (currentSubTab === 'craft') return renderCraft();
    if (currentSubTab === 'enhance') return renderEnhance();
    return '';
}

function renderInventory() {
    let html = '<div class="section-title">KHO ĐỒ (VẬT LiỆu)</div>';
    
    // V?t li?u
    html += '<div class="materials-grid">';
    for (let key in MATERIALS) {
        const mat = MATERIALS[key];
        const qty = game.materials[key] || 0;
        html += `<div class="material-item">${mat.name}: ${qty}</div>`;
    }
    html += '</div>';
    
    // Trang bị trong kho
    html += '<div class="section-title">KHO TRANG BỊ</div>';
    if (game.inventory.length === 0) {
        html += '<div class="empty-msg">Kho trống. Hãy chế tạo trang bị tại Lò Rèn!</div>';
    } else {
        html += '<div class="equip-grid">';
        for (let item of game.inventory) {
            const q = EQUIPMENT_QUALITY[item.quality] || EQUIPMENT_QUALITY[0];
            html += `<div class="equip-card">
                <div><b>${item.name}</b> [${item.tier}]</div>
                <div>Loại: ${item.slot}</div>
                <div style="color:${q.color}">${q.name} ${item.enhance > 0 ? '<span class="enhance">+'+item.enhance+'</span>' : ''}</div>
                ${item.stats ? `<div>ATK:${item.stats.atk||0} DEF:${item.stats.def||0} HP:${item.stats.hp||0} CRT:${item.stats.crit||0}%</div>` : ''}
            </div>`;
        }
        html += '</div>';
    }
    
    return html;
}

function renderCraft() {
    let html = '<div class="section-title">CHẾ TẠO TRANG BỊ - LÒ RÈN</div>';
    
    if (!game.buildings.blacksmith || game.buildings.blacksmith.level === 0) {
        html += '<div class="empty-msg">Cần xây Lò Rèn trước!</div>';
        return html;
    }
    
    // L?c theo độ khó
    const availableDiffs = ['easy'];
    if (game.difficulty !== 'easy') availableDiffs.push(game.difficulty);
    
    html += '<div class="craft-grid">';
    for (let diffKey of availableDiffs) {
        const recipes = EQUIPMENT_CRAFTS[diffKey] || [];
        for (let recipe of recipes) {
            const canCraft = game.gold >= recipe.gold && 
                Object.entries(recipe.materials).every(([k, v]) => (game.materials[k] || 0) >= v);
            
            html += `<div class="craft-card ${canCraft ? '' : 'dimmed'}">
                <div><b>${recipe.name}</b> [${recipe.tier}]</div>
                <div>Loại: ${recipe.slot} | Phù hợp: ${recipe.class.map(c => HUNTER_CLASSES[c].name).join(', ')}</div>
                <div class="craft-cost">
                    ${recipe.gold > 0 ? `Vàng: ${recipe.gold} ` : ''}
                    ${Object.entries(recipe.materials).map(([k, v]) => `${MATERIALS[k]?.name || k}: ${v}`).join(' ')}
                </div>
                <div class="craft-stats">ATK:${recipe.stats.atk||0} DEF:${recipe.stats.def||0} HP:${recipe.stats.hp||0} CRT:${recipe.stats.crit||0}%</div>
                <div class="craft-quality-hint">Chất lượng: 40% Vô Dụng, 30% Thường, 20% Phổ Biến, 8% Cao Cấp, 2% Tối Thượng</div>
                ${canCraft ? `<button class="btn btn-primary" onclick="uiCraft('${recipe.id}')">Chế Tạo</button>` : '<span style="color:#666">Thiếu nguyên liệu</span>'}
            </div>`;
        }
    }
    html += '</div>';
    
    // V?t ph?m tiêu hao
    html += '<div class="section-title">SẢN XUẤT VẬT PHẨM</div>';
    if (!game.buildings.restaurant || game.buildings.restaurant.level === 0) {
        html += '<div class="empty-msg">Cần xây Nhà Hàng trước!</div>';
    } else {
        html += '<div class="craft-grid">';
        for (let cat in CONSUMABLES) {
            for (let recipe of CONSUMABLES[cat]) {
                const canCraft = game.gold >= recipe.gold && 
                    Object.entries(recipe.materials).every(([k, v]) => (game.materials[k] || 0) >= v);
                html += `<div class="craft-card ${canCraft ? '' : 'dimmed'}">
                    <div><b>${recipe.name}</b></div>
                    <div>${recipe.desc}</div>
                    <div class="craft-cost">
                        Vàng: ${recipe.gold} ${Object.entries(recipe.materials).map(([k, v]) => `${MATERIALS[k]?.name || k}: ${v}`).join(' ')}
                    </div>
                    ${canCraft ? `<button class="btn btn-primary" onclick="uiCraftConsumable('${recipe.id}')">Sản Xuất</button>` : '<span style="color:#666">Thiếu nguyên liệu</span>'}
                </div>`;
            }
        }
        html += '</div>';
    }
    
    return html;
}

function renderEnhance() {
    let html = '<div class="section-title">CƯỜNG HÓA & NÂNG CẤP TRANG BỊ</div>';
    
    if (!game.buildings.enhanceForge || game.buildings.enhanceForge.level === 0) {
        html += '<div class="empty-msg">Cần xây Lò Cường Hóa trước!</div>';
        return html;
    }
    
    const forgeLv = game.buildings.enhanceForge.level;
    const forgeBonus = forgeLv > 0 ? BUILDINGS.enhanceForge.levels[forgeLv - 1].enhanceBonus || 0 : 0;
    
    html += `<div class="info-card">Lò Cường Hóa cấp ${forgeLv} | Tỷ lệ thành công +${forgeBonus}%</div>`;
    html += '<div class="section-title">Vật Liệu</div>';
    html += '<div class="materials-grid">';
    html += `<div class="material-item">Đá Cường Hóa: ${game.materials['đá cường hóa'] || 0}</div>`;
    html += `<div class="material-item">Đá Nâng Cấp: ${game.materials['đá nâng cấp'] || 0}</div>`;
    html += `<div class="material-item">Đá Sáng: ${game.materials['đá sáng'] || 0}</div>`;
    html += '</div>';
    
    // Chọn thợ săn để cường hóa
    html += '<div class="section-title">Chọn Thợ Săn Có Trang Bị</div>';
    
    for (let h of game.hunters) {
        const hasEquip = Object.values(h.equipment).some(e => e !== null);
        if (!hasEquip) continue;
        
        html += `<div class="hunter-card compact" onclick="uiSelectHunter(${h.id})">
            <span><b>${h.name}</b></span>
            <span>${h.className} Cấp ${h.level}</span>
        </div>`;
    }
    
    // Nếu đang chọn thợ săn, hiển thị trang bị để cường hóa
    if (selectedHunter) {
        const h = game.hunters.find(hu => hu.id === selectedHunter);
        if (h) {
            html += '<div class="section-title">Trang Bị Của ' + h.name + '</div>';
            for (let slot in h.equipment) {
                const eq = h.equipment[slot];
                if (!eq) continue;
                const q = EQUIPMENT_QUALITY[eq.quality] || EQUIPMENT_QUALITY[0];
                const maxEnhance = ENHANCE_MAX[eq.tier] || 5;
                const canEnhance = eq.enhance < maxEnhance && game.canEnhanceItem(h.id, slot);
                const rate = game.getEnhanceSuccessRate(eq.enhance) + forgeBonus;
                const stones = game.getItemEnhanceStones(eq);
                const gold = game.getEnhanceGoldCost(eq);
                
                html += `<div class="equip-card">
                    <div><b>${eq.name}</b> [${eq.tier}] <span style="color:${q.color}">${q.name}</span></div>
                    <div>Slot: ${slot} | Cường Hóa: +${eq.enhance}/${maxEnhance}</div>
                    <div>Tỷ lệ: ${Math.min(100, rate)}% | Cần: ${stones} đá CH, ${gold}v</div>
                    ${canEnhance ? `<button class="btn btn-primary" onclick="uiEnhance(${h.id},'${slot}')">Cường Hóa +1</button>` : 
                        eq.enhance >= maxEnhance ? '<span style="color:#4caf50">MAX</span>' : '<span style="color:#666">Thiếu nguyên liệu</span>'}
                </div>`;
            }
        }
    }
    
    // Nâng cấp chất lượng từ kho
    html += '<div class="section-title">Nâng Cấp Chất Lượng (Kho Đồ)</div>';
    if (game.inventory.length === 0) {
        html += '<div class="empty-msg">Kho trống</div>';
    } else {
        for (let item of game.inventory) {
            if (item.quality >= 4) continue;
            const q = EQUIPMENT_QUALITY[item.quality] || EQUIPMENT_QUALITY[0];
            const nextQ = EQUIPMENT_QUALITY[item.quality + 1];
            const cost = QUALITY_UPGRADE_COST[item.quality + 1] || 999999;
            const stones = QUALITY_UPGRADE_STONES[item.quality + 1] || 999;
            const canUpgrade = game.gold >= cost && (game.materials['đá nâng cấp'] || 0) >= stones;
            
            html += `<div class="equip-card">
                <div><b>${item.name}</b> <span style="color:${q.color}">${q.name}</span> → <span style="color:${nextQ.color}">${nextQ.name}</span></div>
                <div>Cần: ${cost}v + ${stones} đá nâng cấp</div>
                ${canUpgrade ? `<button class="btn btn-primary" onclick="uiUpgradeQuality('${item.id}')">Nâng Cấp</button>` : '<span style="color:#666">Thiếu nguyên liệu</span>'}
            </div>`;
        }
    }
    
    return html;
}

// ========== TAB: HOẠT ĐỘNG ==========
function renderActivities() {
    if (currentSubTab === 'hunt') return renderHunt();
    if (currentSubTab === 'dungeon') return renderDungeon();
    if (currentSubTab === 'boss') return renderBoss();
    return '';
}

function renderHunt() {
    let html = '<div class="section-title">SĂN BẮN TỰ ĐỘNG</div>';
    html += '<div class="info-card">Thợ săn tự động săn quái vật nếu ở trạng thái nhàn rỗi. Thu thập vàng và nguyên liệu!</div>';
    
    // Nhiệm vụ truy nã
    if (game.bounties.length > 0) {
        html += '<div class="section-title">NHIỆM VỤ TRUY NÃ</div>';
        for (let b of game.bounties) {
            if (!b.active) continue;
            const pct = Math.floor(b.progress / b.target * 100);
            html += `<div class="quest-card">
                <div class="quest-name">${b.monsterName}</div>
                <div class="bar-container"><span class="bar-label">${b.progress}/${b.target}</span>
                    <div class="bar-bg"><div class="bar-fill" style="width:${pct}%;background:#ff9800"></div></div>
                </div>
                <div class="quest-reward">Thưởng: ${b.goldReward}v ${b.gemReward}ng</div>
            </div>`;
        }
    }
    
    const monsters = game.getHuntableMonsters();
    html += '<div class="section-title">Quái Vật Khu Vực</div>';
    html += '<div class="monster-grid">';
    for (let m of monsters) {
        html += `<div class="monster-card">
            <div><b>${m.name}</b></div>
            <div>HP:${m.hp} ATK:${m.atk} DEF:${m.def}</div>
            <div>Kinh Nghiệm:${m.exp} Vàng:${m.gold}</div>
        </div>`;
    }
    html += '</div>';
    
    html += '<div class="section-title">Thợ Săn Đang Săn</div>';
    const hunting = game.hunters.filter(h => h.status === 'hunting');
    if (hunting.length === 0) {
        html += '<div class="empty-msg">Không có thợ săn nào đang săn</div>';
    } else {
        for (let h of hunting) {
            html += `<div class="hunter-card compact">
                <span><b>${h.name}</b></span>
                <span>HP:${Math.floor(h.hp)}/${h.maxHp}</span>
                <span>No:${Math.floor(h.satiety)}</span>
                <span>TL:${Math.floor(h.stamina)}</span>
            </div>`;
        }
    }
    
    return html;
}

function renderDungeon() {
    let html = '<div class="section-title">HẦM NGỤC - TẦNG ' + game.dungeonFloor + '</div>';
    
    if (!game.buildings.dungeonEntrance || game.buildings.dungeonEntrance.level === 0) {
        html += '<div class="empty-msg">Cần xây Cửa Vào Hầm Ngục trước!</div>';
        return html;
    }
    
    if (game.dungeonActive) {
        html += '<div class="info-card">Đang thám hiểm hầm ngục... Tiến độ: ' + game.dungeonProgress + '/10</div>';
        html += '<div class="info-card">Thành viên: ';
        for (let h of game.dungeonParty) {
            html += `${h.name} `;
        }
        html += '</div>';
        return html;
    }
    
    html += '<div class="section-title">Chọn Thợ Săn (1-5 người)</div>';
    html += '<div class="dungeon-select">';
    
    const available = game.hunters.filter(h => h.status === 'idle' || h.status === 'hunting');
    for (let h of available) {
        const selected = dungeonSelection.includes(h.id);
        html += `<div class="hunter-card compact ${selected ? 'selected' : ''}" onclick="uiToggleDungeon(${h.id})">
            <span><b>${h.name}</b></span>
            <span>${h.className} Cấp${h.level}</span>
            <span>HP:${Math.floor(h.hp)}/${h.maxHp}</span>
            ${selected ? '<span>✓</span>' : ''}
        </div>`;
    }
    
    html += '</div>';
    html += `<button class="btn btn-primary" onclick="uiStartDungeon()" ${dungeonSelection.length === 0 ? 'disabled' : ''}>
        Bắt Đầu Hầm Ngục (${dungeonSelection.length} thợ săn)
    </button>`;
    
    return html;
}

function renderBoss() {
    let html = '<div class="section-title">TRÙM CHIẾN</div>';
    
    if (!game.buildings.bossHorn || game.buildings.bossHorn.level === 0) {
        html += '<div class="empty-msg">Cần xây Tù Vật Triệu Hồi trước!</div>';
        return html;
    }
    
    if (game.bossActive) {
        const bossInfo = BOSSES.filter(b => b.diff === game.difficulty || 
            (game.difficulty === 'easy' && b.diff === 'easy') ||
            (game.difficulty === 'normal' && ['easy','normal'].includes(b.diff)) ||
            (game.difficulty === 'hard' && ['easy','normal','hard'].includes(b.diff)));
        const boss = bossInfo[bossInfo.length - 1];
        const pct = Math.max(0, Math.floor(game.bossHp / game.bossMaxHp * 100));
        
        html += `<div class="boss-fight">
            <div><b>${boss.name}</b></div>
            <div class="bar-container"><div class="bar-bg"><div class="bar-fill" style="width:${100-pct}%;background:#f44336"></div></div></div>
            <div>HP: ${Math.floor(game.bossHp)}/${game.bossMaxHp}</div>
            <div>Sát thương gây ra: ${game.bossDamage}</div>
        </div>`;
        return html;
    }
    
    const bossInfo = BOSSES.filter(b => b.diff === game.difficulty || 
        (game.difficulty === 'easy' && b.diff === 'easy') ||
        (game.difficulty === 'normal' && ['easy','normal'].includes(b.diff)) ||
        (game.difficulty === 'hard' && ['easy','normal','hard'].includes(b.diff)));
    const boss = bossInfo[bossInfo.length - 1];
    
    if (boss) {
        html += `<div class="boss-preview">
            <div><b>${boss.name}</b></div>
            <div>HP: ${boss.hp} | ATK: ${boss.atk} | DEF: ${boss.def}</div>
            <div>Phần thưởng: ${boss.gold} vàng, ${boss.gems} ngọc + vật liệu</div>
            <button class="btn btn-danger" onclick="uiStartBoss()">Triệu Hồi Trùm!</button>
        </div>`;
    } else {
        html += '<div class="empty-msg">Chưa có trùm cho độ khó này</div>';
    }
    
    return html;
}

// ========== TAB: CỬA HÀNG ==========
function renderShop() {
    if (currentSubTab === 'trade') return renderTrade();
    if (currentSubTab === 'specials') return renderSpecials();
    return '';
}

function renderTrade() {
    let html = '<div class="section-title">TRẠM GIAO DỊCH</div>';
    
    if (!game.buildings.tradingPost || game.buildings.tradingPost.level === 0) {
        html += '<div class="empty-msg">Cần xây Trạm Giao Dịch trước!</div>';
        return html;
    }
    
    html += '<div class="section-title">Vật Liệu Hiện Có</div>';
    html += '<div class="materials-grid">';
    for (let key in MATERIALS) {
        const mat = MATERIALS[key];
        const qty = game.materials[key] || 0;
        html += `<div class="material-item">${mat.name}: ${qty} (${mat.basePrice}v/cái)</div>`;
    }
    html += '</div>';
    
    html += '<div class="section-title">Giao Dịch Nhanh</div>';
    html += '<div class="trade-grid">';
    
    // Bán vật liệu lấy vàng
    const matKeys = Object.keys(MATERIALS);
    for (let key of matKeys) {
        if ((game.materials[key] || 0) >= 5) {
            const price = MATERIALS[key].basePrice;
            html += `<div class="trade-card">
                <div>Bán 5 ${MATERIALS[key].name}</div>
                <div>Nhận ${price * 5} vàng</div>
                <button class="btn btn-primary" onclick="uiSellMaterial('${key}', 5)">Bán</button>
            </div>`;
        }
    }
    
    html += '</div>';
    
    if (game.buildings.tradingPost.level >= 3) {
        html += '<div class="section-title">Đổi Vật Liệu</div>';
        html += '<div class="trade-grid">';
        html += `<div class="trade-card">
            <div>10 Gỗ → 5 Đá</div>
            <button class="btn btn-primary" onclick="uiTradeMaterial('gỗ', 10, 'đá', 5)">Đổi</button>
        </div>`;
        html += `<div class="trade-card">
            <div>5 Đá → 3 Sắt</div>
            <button class="btn btn-primary" onclick="uiTradeMaterial('đá', 5, 'sắt', 3)">đổi</button>
        </div>`;
        html += '</div>';
    }
    
    if (game.buildings.tradingPost.level >= 5) {
        html += '<div class="section-title">Trao Đổi Nâng Cao (Cấp 5+)</div>';
        html += '<div class="trade-grid">';
        html += `<div class="trade-card">
            <div>15 Sắt → 5 Bạc</div>
            <button class="btn btn-primary" onclick="uiTradeMaterial('sắt', 15, 'bạc', 5)">Đổi</button>
        </div>`;
        html += '</div>';
    }
    
    if (game.buildings.tradingPost.level >= 7) {
        html += '<div class="section-title">Trao Đổi Cao Cấp (Cấp 7+)</div>';
        html += '<div class="trade-grid">';
        html += `<div class="trade-card">
            <div>10 Bạc → 3 Đá Cường Hóa</div>
            <button class="btn btn-primary" onclick="uiTradeMaterial('bạc', 10, 'đá cường hóa', 3)">Đổi</button>
        </div>`;
        html += '</div>';
    }
    
    if (game.buildings.tradingPost.level >= 8) {
        html += '<div class="section-title">Trao Đổi Đặc Biệt (Cấp 8+)</div>';
        html += '<div class="trade-grid">';
        html += `<div class="trade-card">
            <div>5 Đá Cường Hóa → 2 Đá Nâng Cấp</div>
            <button class="btn btn-primary" onclick="uiTradeMaterial('đá cường hóa', 5, 'đá nâng cấp', 2)">Đổi</button>
        </div>`;
        html += '</div>';
    }
    
    if (game.buildings.tradingPost.level >= 9) {
        html += '<div class="section-title">Trao Đổi Huyền Thoại (Cấp 9+)</div>';
        html += '<div class="trade-grid">';
        html += `<div class="trade-card">
            <div>3 Đá Nâng Cấp → 1 Đá Sáng</div>
            <button class="btn btn-primary" onclick="uiTradeMaterial('đá nâng cấp', 3, 'đá sáng', 1)">Đổi</button>
        </div>`;
        html += '</div>';
    }
    
    if (game.buildings.tradingPost.level >= 10) {
        html += '<div class="section-title">Trao Đổi Thần Thoại (Cấp 10)</div>';
        html += '<div class="trade-grid">';
        html += `<div class="trade-card">
            <div>5 Đá Sáng → 1 Nước Mắt Thiên Thần</div>
            <button class="btn btn-primary" onclick="uiTradeMaterial('đá sáng', 5, 'nước mắt thiên thần', 1)">Đổi</button>
        </div>`;
        html += '</div>';
    }
    
    // Đổi nguyên liệu hiếm lấy ngọc (cấp 6+)
    if (game.buildings.tradingPost.level >= 6) {
        html += '<div class="section-title">Đổi Nguyên Liệu Lấy Ngọc (Cấp 6+)</div>';
        html += '<div class="trade-grid">';
        const gemExchange = [
            { mat: 'tinh thể', qty: 20, gem: 1 },
            { mat: 'hạt', qty: 10, gem: 1 },
            { mat: 'lông', qty: 8, gem: 1 },
            { mat: 'máu', qty: 5, gem: 1 },
            { mat: 'nước mắt thiên thần', qty: 3, gem: 5 }
        ];
        for (let ex of gemExchange) {
            const matName = MATERIALS[ex.mat]?.name || ex.mat;
            const has = (game.materials[ex.mat] || 0) >= ex.qty;
            html += `<div class="trade-card">
                <div>${ex.qty} ${matName} → ${ex.gem} Ngọc</div>
                <button class="btn ${has ? 'btn-primary' : 'btn-disabled'}" onclick="uiTradeGem('${ex.mat}', ${ex.qty})" ${has ? '' : 'disabled'}>Đổi</button>
            </div>`;
        }
        html += '</div>';
    }
    
    return html;
}

function renderSpecials() {
    let html = '<div class="section-title">CỬA HÀNG ĐẶC BIỆT</div>';
    html += '<div class="info-card">Sử dụng Ngọc (Gems) để mua các vẬT phẩm Đặc biệt.</div>';
    
    html += '<div class="shop-grid">';
    html += `<div class="shop-card">
        <div><b>Gói Vật Liệu</b></div>
        <div>Nhận 20 mỗi loại vật liệu cơ bản</div>
        <div>Giá: 10 Ngọc</div>
        <button class="btn btn-primary" onclick="uiBuyMaterialPack()" ${game.gems < 10 ? 'disabled' : ''}>Mua</button>
    </div>`;
    html += `<div class="shop-card">
        <div><b>Thẻ Mời Thường</b></div>
        <div>Triệu hồi thợ săn ngẫu nhiên</div>
        <div>Giá: 10 Ngọc</div>
        <button class="btn btn-primary" onclick="uiBuyInvitation('normal')" ${game.gems < 10 || !game.canAddHunter() ? 'disabled' : ''}>Mua</button>
    </div>`;
    html += `<div class="shop-card">
        <div><b>Thẻ Mời Hiếm</b></div>
        <div>Triệu hồi thợ săn Hiếm+</div>
        <div>Giá: 30 Ngọc</div>
        <button class="btn btn-primary" onclick="uiBuyInvitation('rare')" ${game.gems < 30 || !game.canAddHunter() ? 'disabled' : ''}>Mua</button>
    </div>`;
    html += `<div class="shop-card">
        <div><b>Thẻ Mời Xuất Sắc</b></div>
        <div>Triệu hồi thợ săn Xuất Sắc+</div>
        <div>Giá: 80 Ngọc</div>
        <button class="btn btn-primary" onclick="uiBuyInvitation('superior')" ${game.gems < 80 || !game.canAddHunter() ? 'disabled' : ''}>Mua</button>
    </div>`;
    html += `<div class="shop-card">
        <div><b>Thẻ Mời Huyền Thoại</b></div>
        <div>Triệu hồi thợ săn Huyền Thoại+</div>
        <div>Giá: 200 Ngọc</div>
        <button class="btn btn-primary" onclick="uiBuyInvitation('legendary')" ${game.gems < 200 || !game.canAddHunter() ? 'disabled' : ''}>Mua</button>
    </div>`;
    html += `<div class="shop-card">
        <div><b>Lông Phượng Hoàng</b></div>
        <div>Reset chỉ đặc tính</div>
        <div>Giá: 50 Ngọc</div>
        <button class="btn btn-primary" onclick="uiBuyPhoenixFeather()" ${game.gems < 50 ? 'disabled' : ''}>Mua</button>
    </div>`;
    html += '</div>';
    
    return html;
}

// ========== TAB: NHIỆM VỤ ==========
function renderQuests() {
    if (currentSubTab === 'quests') return renderQuestList();
    if (currentSubTab === 'achievements') return renderAchievementList();
    return '';
}

function renderQuestList() {
    let html = '<div class="section-title">NHIỆM VỤ</div>';
    
    const active = game.quests.filter(q => !game.completedQuests.includes(q.id));
    const completed = game.quests.filter(q => game.completedQuests.includes(q.id));
    
    if (active.length === 0) {
        html += '<div class="empty-msg">Tất cả nhiệm vụ đã hoàn thành!</div>';
    } else {
        for (let q of active) {
            html += `<div class="quest-card">
                <div class="quest-name">${q.name}</div>
                <div class="quest-desc">${q.desc}</div>
                <div class="quest-reward">Thưởng: ${q.reward.gold}v ${q.reward.gems ? q.reward.gems+'ngọc' : ''}</div>
            </div>`;
        }
    }
    
    if (completed.length > 0) {
        html += '<div class="section-title">Đã Hoàn Thành</div>';
        for (let q of completed) {
            html += `<div class="quest-card completed">
                <div class="quest-name">${q.name} ✓</div>
            </div>`;
        }
    }
    
    return html;
}

function renderAchievementList() {
    let html = '<div class="section-title">THÀNH TựU</div>';
    
    const completed = game.completedAchievements;
    
    for (let a of ACHIEVEMENTS) {
        const done = completed.includes(a.id);
        html += `<div class="quest-card ${done ? 'completed' : ''}">
            <div class="quest-name">${done ? '✓ ' : ''}${a.name}</div>
            <div class="quest-desc">${a.desc}</div>
            <div class="quest-reward">Thưởng: ${a.reward.gold}v ${a.reward.gems ? a.reward.gems+'ngọc' : ''}</div>
        </div>`;
    }
    
    return html;
}

// ========== UI ACTIONS ==========
function uiBuild(buildingId) {
    if (game.buildBuilding(buildingId)) {
        game.addLog(`Xây dựng/nâng cấp ${BUILDINGS[buildingId].name} thành công!`);
        render();
    }
}

function uiHireHunter() {
    if (game.hunterQueue.length > 0 && game.addHunter(game.hunterQueue.shift())) {
        render();
    }
}

function uiCheckHunter() {
    game.checkHunterArrival();
    render();
}

function uiSelectHunter(id) {
    selectedHunter = id;
    currentSubTab = 'detail';
    render();
}

function uiEquip(hunterId, itemId) {
    if (game.equipItem(hunterId, itemId)) render();
}

function uiUnequip(hunterId, slot) {
    if (game.unequipItem(hunterId, slot)) render();
}

function uiCraft(recipeId) {
    if (game.craftEquipment(recipeId)) {
        render();
    } else {
        game.addLog('Không thể chế tạo! Thiếu nguyên liệu hoặc vàng!');
        render();
    }
}

function uiCraftConsumable(recipeId) {
    if (game.craftConsumable(recipeId)) {
        render();
    } else {
        game.addLog('Không thể sản xuất! Thiếu nguyên liệu hoặc vàng!');
        render();
    }
}

function uiRevive(hunterId) {
    if (game.reviveHunter(hunterId)) render();
}

function uiReincarnate(hunterId) {
    if (game.reincarnateHunter(game.hunters.find(h => h.id === hunterId))) render();
}

function uiTrain(hunterId) {
    if (game.startTraining(hunterId)) render();
}

function uiLearnSkill(hunterId, skill) {
    if (game.learnSkill(hunterId, skill)) render();
}

function uiBanish(hunterId) {
    const h = game.hunters.find(hu => hu.id === hunterId);
    if (!h) return;
    const tierCost = game.getHireCost(h.tier);
    const refund = Math.floor(tierCost * 0.5) + h.level * 5;
    if (confirm(`Trục xuất ${h.name} (${h.tierName} cấp ${h.level})?\nNhận lại ${refund} vàng.`)) {
        game.removeHunter(hunterId);
        selectedHunter = null;
        render();
    }
}

function uiResetGame() {
    showModal('💀', 'RESET GAME',
        'Bạn có chắc chắn muốn <span class="danger">XÓA TOÀN BỘ</span> tiến trình game?<br><br>' +
        '📛 Tất cả dữ liệu sẽ <span class="warn">mất vĩnh viễn</span><br>' +
        '⚠️ Hành động này <span class="danger">KHÔNG THỂ</span> hoàn tác!',
        [
            { text: 'Hủy', cls: 'btn', cb: null },
            { text: 'Xóa', cls: 'btn btn-danger', cb: function() {
                showModal('💀', 'XÁC NHẬN LẦN CUỐI',
                    'Bạn <span class="danger">thực sự</span> muốn xóa <span class="warn">SẠCH</span> game<br>' +
                    'và bắt đầu lại từ đầu?<br><br>' +
                    '🔴 <span class="danger">Đây là cơ hội cuối để hủy!</span>',
                    [
                        { text: 'Giữ lại', cls: 'btn btn-primary', cb: null },
                        { text: 'Xóa sạch', cls: 'btn btn-danger', cb: function() {
                            deleteSave();
                            // Gỡ beforeunload trước khi reload để không lưu lại
                            window.removeEventListener('beforeunload', saveOnUnload);
                            location.reload();
                        }}
                    ]
                );
            }}
        ]
    );
}

function uiToggleDungeon(id) {
    const idx = dungeonSelection.indexOf(id);
    if (idx >= 0) {
        dungeonSelection.splice(idx, 1);
    } else {
        if (dungeonSelection.length < 5) {
            dungeonSelection.push(id);
        }
    }
    render();
}

function uiStartDungeon() {
    if (game.startDungeon(dungeonSelection)) {
        dungeonSelection = [];
        render();
    }
}

function uiStartBoss() {
    if (game.startBossBattle()) render();
}

function uiSellMaterial(matKey, qty) {
    const price = MATERIALS[matKey].basePrice;
    if ((game.materials[matKey] || 0) >= qty) {
        game.materials[matKey] -= qty;
        game.gold += price * qty;
        game.addLog(`Đã bán ${qty} ${MATERIALS[matKey].name} lấy ${price * qty} vàng`);
        render();
    }
}

function uiTradeMaterial(sellMat, sellQty, buyMat, buyQty) {
    if (game.tradeMaterial(sellMat, sellQty, buyMat, buyQty)) {
        game.addLog(`Đã trao đổi ${sellQty} ${MATERIALS[sellMat].name} lấy ${buyQty} ${MATERIALS[buyMat].name}`);
        render();
    }
}

function uiTradeGem(matKey, qty) {
    if (game.tradeMaterialForGems(matKey, qty)) {
        render();
    }
}

function uiBuyMaterialPack() {
    if (game.gems >= 10) {
        game.gems -= 10;
        for (let key of ['gỗ', 'đá', 'da']) {
            game.materials[key] = (game.materials[key] || 0) + 20;
        }
        game.addLog('Mua gói vật liệu thành công!');
        render();
    }
}

function uiBuyInvitation(minTier) {
    const costs = { normal: 10, rare: 30, superior: 80, legendary: 200 };
    const cost = costs[minTier] || 10;
    const tierOrder = ['normal', 'rare', 'superior', 'heroic', 'legendary', 'ultimate'];
    const minIdx = tierOrder.indexOf(minTier);
    
    if (game.gems < cost || !game.canAddHunter()) return;
    game.gems -= cost;
    
    let h = game.generateHunter();
    const curIdx = tierOrder.indexOf(h.tier);
    if (curIdx < minIdx) {
        // Roll lại đến khi đạt hạng tối thiểu
        let attempts = 0;
        while (tierOrder.indexOf(h.tier) < minIdx && attempts < 100) {
            h = game.generateHunter();
            attempts++;
        }
    }
    game.addHunter(h, true); // Miễn phí vàng vì đã trả ngọc
    game.addLog(`Dùng thẻ mời: ${h.name} (${h.tierName})!`);
    render();
}

function uiEnhance(hunterId, slot) {
    if (game.enhanceItem(hunterId, slot)) render();
}

function uiUpgradeQuality(itemId) {
    if (game.upgradeItemQuality(itemId)) render();
}

function uiLearnTrait(hunterId, traitId) {
    if (game.learnTrait(hunterId, traitId)) render();
}

function uiResetTraits(hunterId) {
    if (game.resetTraits(hunterId)) render();
}

function uiBuyPhoenixFeather() {
    if (game.gems >= 50 && selectedHunter) {
        game.resetTraits(selectedHunter);
        render();
    }
}

// ========== EVENTS ==========
function bindEvents() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = function() {
            currentTab = this.dataset.tab;
            const subs = SUBTABS[currentTab];
            currentSubTab = subs ? subs[0].id : 'list';
            selectedHunter = null;
            dungeonSelection = [];
            render();
        };
    });
    
    document.querySelectorAll('.subtab-btn').forEach(btn => {
        btn.onclick = function() {
            currentSubTab = this.dataset.sub;
            render();
        };
    });
}

// ========== UTILITY ==========
function fmt(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toString();
}

// ========== MAIN LOOP ==========
function gameLoop() {
    if (game) {
        game.tick();
        render();
    }
    setTimeout(gameLoop, 1000);
}

function showIntro() {
    initModal();
    showModal('🏰', 'EVIL HUNTER TYCOON',
        'Chào mừng đến với thế giới <b>Bóng Tối</b>!<br><br>' +
        'Sau trận đại chiến, thị trấn của bạn đã bị phá hủy.<br>' +
        'Giờ đây, với tư cách là <span class="warn">Tù Trưởng</span>, ' +
        'bạn phải xây dựng lại mọi thứ từ đống tro tàn.<br><br>' +
        'Hãy chiêu mộ <b>Thợ Săn</b>, tiêu diệt quái vật, ' +
        'thu thập tài nguyên và khôi phục lại vinh quang xưa!',
        [
            { text: 'BẮT ĐẦU ▶', cls: 'btn btn-primary', cb: function() { showIntroName(); } }
        ]
    );
}

function showIntroName() {
    const inputId = 'townNameInput';
    showModal('📝', 'ĐẶT TÊN THỊ TRẤN',
        'Hãy đặt tên cho thị trấn của bạn:<br><br>' +
        '<input type="text" id="' + inputId + '" placeholder="Nhập tên thị trấn..." ' +
        'style="padding:8px;width:80%;background:#222;color:#fff;border:1px solid #4fc3f7;border-radius:4px;text-align:center;font-size:14px;font-family:inherit;" ' +
        'maxlength="20"><br><br>' +
        '<span style="color:#888;font-size:11px;">(Tên sẽ hiển thị trên đầu game)</span>',
        [
            { text: 'BỎ QUA', cls: 'btn', cb: function() { showIntroTutorial(); } },
            { text: 'XÁC NHẬN', cls: 'btn btn-primary', cb: function() {
                const input = document.getElementById(inputId);
                game.townName = input && input.value.trim() ? input.value.trim() : 'Thị Trấn Bóng Tối';
                showIntroTutorial();
            }}
        ]
    );
    // Focus vào ô input sau khi modal hiện
    setTimeout(function() {
        const inp = document.getElementById(inputId);
        if (inp) inp.focus();
    }, 100);
}

function showIntroTutorial() {
    showModal('📖', 'HƯỚNG DẪN NHANH',
        '<b>🏛️ Xây dựng</b> - Nâng cấp công trình để mở khóa chức năng<br><br>' +
        '<b>⚔️ Thợ Săn</b> - Chiêu mộ và gửi đi săn quái<br><br>' +
        '<b>🔧 Trang bị</b> - Chế tạo và cường hóa vũ khí<br><br>' +
        '<b>🏆 Hoạt động</b> - Thám hiểm hầm ngục, tiêu diệt trùm<br><br>' +
        '<b>🔄 Chuyển sinh cấp 100</b> - Tăng hạng thợ săn<br><br>' +
        '<hr style="border-color:#2a2a4a;margin:8px 0;">' +
        '<span style="color:#888;font-size:11px;">Mỗi ngày hãy ghé game để nhận quà điểm danh!</span>',
        [
            { text: 'VÀO GAME ▶', cls: 'btn btn-danger', cb: function() {
                game.gameStarted = true;
                if (!game.townName) game.townName = 'Thị Trấn Bóng Tối';
                saveGame();
                render();
            }}
        ]
    );
}

function startGame() {
    initModal();
    initGame();
    render();
    gameLoop();
    if (!game.gameStarted) showIntro();
}
