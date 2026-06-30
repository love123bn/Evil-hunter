// ═══════════════════════════════════════════════════════════
// DARK REALM TYCOON — UI Rendering System
// ═══════════════════════════════════════════════════════════

function renderUI() {
  renderTopBar();
  renderNavButtons();
  renderEventBanner();

  switch (currentScreen) {
    case 'main': renderMainScreen(); break;
    case 'hunters': renderHuntersScreen(); break;
    case 'buildings': renderBuildingsScreen(); break;
    case 'crafting': renderCraftingScreen(); break;
    case 'inventory': renderInventoryScreen(); break;
    case 'map': renderMapScreen(); break;
    case 'quests': renderQuestsScreen(); break;
    case 'log': renderLogScreen(); break;
    case 'settings': renderSettingsScreen(); break;
    default: renderMainScreen(); break;
  }
}

// ─── TOP BAR ────────────────────────────────────────────────
function renderTopBar() {
  const bar = document.getElementById('top-bar');
  if (!bar) return;

  const gpt = getGoldPerTick();
  bar.innerHTML = `
    <div class="top-bar-inner">
      <div class="resource-group">
        <span class="resource gold" title="Vàng">💰 <b>${formatNumber(gameState.gold)}</b> <span class="tick-rate">+${formatNumber(gpt)}/tick</span></span>
        <span class="resource gems" title="Ngọc">💎 <b>${formatNumber(gameState.gems)}</b></span>
        <span class="resource elementals" title="Nguyên Tố">🌀 <b>${formatNumber(gameState.elementals)}</b></span>
      </div>
      <div class="resource-group">
        <span class="resource day">📅 Ngày <b>${gameState.day}</b></span>
        <span class="resource hunters">👥 <b>${getHunterCount()}/${getMaxHunters()}</b></span>
      </div>
    </div>
  `;
}

// ─── NAVIGATION ─────────────────────────────────────────────
function renderNavButtons() {
  const nav = document.getElementById('nav-bar');
  if (!nav) return;

  const buttons = [
    { id: 'main', icon: '🏛️', label: 'Làng' },
    { id: 'hunters', icon: '👥', label: 'Thợ Săn' },
    { id: 'buildings', icon: '🏗️', label: 'Xây Dựng' },
    { id: 'crafting', icon: '🔨', label: 'Chế Tạo' },
    { id: 'inventory', icon: '🎒', label: 'Kho' },
    { id: 'map', icon: '🗺️', label: 'Bản Đồ' },
    { id: 'quests', icon: '📜', label: 'Quest' },
    { id: 'log', icon: '📋', label: 'Nhật Ký' },
    { id: 'settings', icon: '⚙️', label: 'Cài Đặt' },
  ];

  nav.innerHTML = buttons.map(b =>
    `<button class="nav-btn ${currentScreen === b.id ? 'active' : ''}" onclick="navigateTo('${b.id}')">${b.icon} ${b.label}</button>`
  ).join('');
}

// ─── EVENT BANNER ───────────────────────────────────────────
function renderEventBanner() {
  const banner = document.getElementById('event-banner');
  if (!banner) return;

  if (gameState.eventPending) {
    const { event, options } = gameState.eventPending;
    banner.innerHTML = `
      <div class="event-popup">
        <div class="event-header">${event.icon} ${event.name}</div>
        <div class="event-options">
          ${options.map((opt, i) =>
            `<button class="event-option-btn" onclick="resolveEvent(${i})">${opt.text}</button>`
          ).join('')}
        </div>
      </div>
    `;
    banner.classList.add('visible');
  } else {
    banner.innerHTML = '';
    banner.classList.remove('visible');
  }
}

// ─── MAIN SCREEN (Town Overview) ───────────────────────────
function renderMainScreen() {
  const content = document.getElementById('content');
  if (!content) return;

  const summary = getCombatSummary();
  const innLevel = gameState.buildings.inn;
  const innEffects = innLevel > 0 ? GAME_DATA.buildings.inn.effects(innLevel) : null;

  content.innerHTML = `
    <div class="screen-main">
      <h2 class="section-title">🏛️ Tổng Quan Làng</h2>

      <div class="stats-grid">
        <div class="stat-card gold-card">
          <div class="stat-icon">💰</div>
          <div class="stat-value">${formatNumber(gameState.gold)}</div>
          <div class="stat-label">Vàng</div>
          <div class="stat-sub">+${formatNumber(getGoldPerTick())}/tick</div>
        </div>
        <div class="stat-card hunter-card">
          <div class="stat-icon">👥</div>
          <div class="stat-value">${summary.total}</div>
          <div class="stat-label">Thợ Săn</div>
          <div class="stat-sub">Tối đa: ${getMaxHunters()}</div>
        </div>
        <div class="stat-card kill-card">
          <div class="stat-icon">💀</div>
          <div class="stat-value">${formatNumber(gameState.stats.totalKills)}</div>
          <div class="stat-label">Quái Đã Giết</div>
        </div>
        <div class="stat-card boss-card">
          <div class="stat-icon">👹</div>
          <div class="stat-value">${gameState.stats.bossKills}</div>
          <div class="stat-label">Boss Đã Giết</div>
        </div>
      </div>

      <h3 class="section-title">⚔️ Tình Trạng Săn</h3>
      <div class="status-bar">
        <div class="status-item hunting">🗡️ Đang săn: <b>${summary.hunting}</b></div>
        <div class="status-item resting">😴 Đang nghỉ: <b>${summary.resting}</b></div>
        <div class="status-item recovering">💊 Đang hồi: <b>${summary.recovering}</b></div>
        <div class="status-item dead">☠️ Hy sinh: <b>${summary.dead}</b></div>
      </div>

      <div class="action-row">
        <button class="btn btn-primary" onclick="challengeBoss()" ${summary.hunting === 0 ? 'disabled' : ''}>
          👹 Thách Đấu Boss
        </button>
        <button class="btn btn-secondary" onclick="navigateTo('hunters')">
          👥 Quản Lý Thợ Săn
        </button>
      </div>

      ${innEffects ? `
        <h3 class="section-title">🏠 Nhà Trọ Lv.${innLevel}</h3>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${Math.min(100, (summary.resting / innEffects.maxCapacity) * 100)}%"></div>
        </div>
        <p class="progress-text">${summary.resting}/${innEffects.maxCapacity} chỗ — Hồi ${innEffects.healRate}% HP/tick</p>
      ` : ''}

      <h3 class="section-title">📊 Thống Kê</h3>
      <div class="info-grid">
        <div class="info-item">📅 Ngày chơi: <b>${gameState.stats.daysPlayed}</b></div>
        <div class="info-item">💰 Tổng vàng: <b>${formatNumber(gameState.stats.totalGoldEarned)}</b></div>
        <div class="info-item">⚔️ Tổng sát thương: <b>${formatNumber(gameState.stats.totalDamageDealt)}</b></div>
        <div class="info-item">🔨 Tổng chế tạo: <b>${gameState.stats.totalCrafts}</b></div>
        <div class="info-item">♻️ Tái sinh: <b>${gameState.stats.totalReincarnations}</b></div>
        <div class="info-item">🏆 Thành tựu: <b>${gameState.achievements.length}/${GAME_DATA.achievements.length}</b></div>
      </div>
    </div>
  `;
}

// ─── HUNTERS SCREEN ─────────────────────────────────────────
function renderHuntersScreen() {
  const content = document.getElementById('content');
  if (!content) return;

  const hunters = gameState.hunters;
  const maxHunters = getMaxHunters();

  let html = `
    <div class="screen-hunters">
      <h2 class="section-title">👥 Quản Lý Thợ Săn (${hunters.length}/${maxHunters})</h2>

      <div class="action-row">
        <button class="btn btn-primary" onclick="navigateTo('hire')" ${hunters.length >= maxHunters ? 'disabled' : ''}>
          ➕ Thuê Thợ Săn Mới
        </button>
      </div>
  `;

  if (hunters.length === 0) {
    html += `<div class="empty-state">📭 Chưa có Thợ Săn nào. Hãy thuê Thợ Săn đầu tiên!</div>`;
  } else {
    hunters.forEach(h => {
      const stats = getEffectiveStats(h);
      const xpPercent = h.level >= 100 ? 100 : (h.xp / h.xpToNext) * 100;
      const hpPercent = (h.hp / h.maxHp) * 100;
      const moodPercent = h.mood;
      const moodClass = moodPercent > 70 ? 'high' : moodPercent > 30 ? 'mid' : 'low';

      html += `
        <div class="hunter-card ${!h.alive ? 'dead' : ''}">
          <div class="hunter-header">
            <span class="hunter-icon">${h.classIcon}</span>
            <span class="hunter-name">${h.name}</span>
            <span class="hunter-class">${h.className}</span>
            <span class="hunter-level">Lv.${h.level}</span>
            ${h.reincarnationCount > 0 ? `<span class="reincarnation-badge">♻️${h.reincarnationCount}</span>` : ''}
            <span class="hunter-status status-${h.state}">${getStateLabel(h.state)}</span>
          </div>

          <div class="hunter-bars">
            <div class="bar-row">
              <span class="bar-label">❤️ HP</span>
              <div class="bar"><div class="bar-fill hp-bar" style="width:${hpPercent}%"></div></div>
              <span class="bar-text">${Math.floor(h.hp)}/${h.maxHp}</span>
            </div>
            <div class="bar-row">
              <span class="bar-label">⭐ XP</span>
              <div class="bar"><div class="bar-fill xp-bar" style="width:${xpPercent}%"></div></div>
              <span class="bar-text">${h.level >= 100 ? 'MAX' : `${h.xp}/${h.xpToNext}`}</span>
            </div>
            <div class="bar-row">
              <span class="bar-label">😊 Tâm Trạng</span>
              <div class="bar"><div class="bar-fill mood-bar mood-${moodClass}" style="width:${moodPercent}%"></div></div>
              <span class="bar-text">${Math.floor(moodPercent)}%</span>
            </div>
          </div>

          <div class="hunter-stats">
            <span>⚔️${Math.floor(stats.atk)}</span>
            <span>🛡️${Math.floor(stats.def)}</span>
            <span>💨${Math.floor(stats.spd)}</span>
            <span>🎯${Math.floor(stats.crit)}%</span>
            <span>💀${h.kills} kills</span>
          </div>

          <div class="hunter-equipment">
            ${renderHunterEquipment(h)}
          </div>

          <div class="hunter-actions">
            <button class="btn btn-sm" onclick="toggleHunterState('${h.id}')">
              ${h.state === 'hunting' ? '⏸️ Nghỉ' : '⚔️ Đi săn'}
            </button>
            ${h.level >= 50 && gameState.buildings.temple > 0 ? `
              <button class="btn btn-sm btn-warning" onclick="confirmReincarnate('${h.id}')">♻️ Tái Sinh</button>
            ` : ''}
            <button class="btn btn-sm btn-danger" onclick="confirmDismiss('${h.id}')">👋 Sa Thải</button>
          </div>
        </div>
      `;
    });
  }

  html += '</div>';
  content.innerHTML = html;
}

function getStateLabel(state) {
  const labels = {
    hunting: '⚔️ Đang săn',
    resting: '😴 Đang nghỉ',
    dead: '☠️ Hy sinh',
    recovering: '💊 Đang hồi',
  };
  return labels[state] || state;
}

function renderHunterEquipment(hunter) {
  const slots = ['weapon', 'armor', 'helmet', 'boots', 'accessory'];
  const slotIcons = { weapon: '⚔️', armor: '🛡️', helmet: '⛑️', boots: '👢', accessory: '💍' };
  const slotNames = { weapon: 'Vũ khí', armor: 'Giáp', helmet: 'Mũ', boots: 'Giày', accessory: 'Phụ kiện' };

  return `<div class="equipment-slots">` +
    slots.map(slot => {
      const item = hunter.equipment[slot];
      if (item) {
        return `<div class="equip-slot filled" title="${item.name}">
          ${item.icon}<span class="equip-name">${item.name}</span>
        </div>`;
      }
      return `<div class="equip-slot empty" title="${slotNames[slot]}">
        ${slotIcons[slot]}
      </div>`;
    }).join('') +
    `</div>`;
}

function toggleHunterState(hunterId) {
  const hunter = gameState.hunters.find(h => h.id === hunterId);
  if (!hunter || !hunter.alive) return;

  if (hunter.state === 'hunting') {
    hunter.state = 'resting';
    addLog(`⏸️ ${hunter.classIcon} ${hunter.name} nghỉ ngơi.`, 'info');
  } else if (hunter.state === 'resting' || hunter.state === 'recovering') {
    if (hunter.hp < hunter.maxHp * 0.2) {
      addLog(`❌ ${hunter.name} HP quá thấp để đi săn!`, 'error');
      return;
    }
    hunter.state = 'hunting';
    addLog(`⚔️ ${hunter.classIcon} ${hunter.name} lên đường săn!`, 'info');
  }
  renderUI();
}

function confirmReincarnate(hunterId) {
  const hunter = gameState.hunters.find(h => h.id === hunterId);
  if (!hunter) return;
  if (confirm(`♻️ Tái sinh ${hunter.name}?-Level sẽ reset nhưng nhận bonus vĩnh viễn!`)) {
    reincarnateHunter(hunterId);
    renderUI();
  }
}

function confirmDismiss(hunterId) {
  const hunter = gameState.hunters.find(h => h.id === hunterId);
  if (!hunter) return;
  if (confirm(`👋 Sa thải ${hunter.name}? Hành động này không thể hoàn tác!`)) {
    dismissHunter(hunterId);
    renderUI();
  }
}

// ─── HIRE SCREEN ────────────────────────────────────────────
function renderHireScreen() {
  const content = document.getElementById('content');
  if (!content) return;

  const guildLevel = gameState.buildings.guildBoard || 0;
  const hireCost = Math.max(10, 80 - guildLevel * 10);

  content.innerHTML = `
    <div class="screen-hire">
      <h2 class="section-title">➕ Thuê Thợ Săn Mới</h2>
      <p class="info-text">Chi phí: 💰 ${hireCost} gold | Bảng Đăng Ký Lv.${guildLevel}</p>

      <div class="class-grid">
        ${Object.entries(GAME_DATA.classes).map(([id, cls]) => `
          <div class="class-card" onclick="doHire('${id}')">
            <div class="class-icon">${cls.icon}</div>
            <div class="class-name">${cls.name}</div>
            <div class="class-desc">${cls.desc}</div>
            <div class="class-stats">
              ❤️${cls.baseStats.hp} ⚔️${cls.baseStats.atk} 🛡️${cls.baseStats.def} 💨${cls.baseStats.spd} 🎯${cls.baseStats.crit}
            </div>
            <button class="btn btn-primary btn-sm">Thuê</button>
          </div>
        `).join('')}
      </div>

      <button class="btn btn-secondary" onclick="navigateTo('hunters')">← Quay lại</button>
    </div>
  `;
}

function doHire(classId) {
  if (hireHunter(classId)) {
    renderUI();
  }
}

// ─── BUILDINGS SCREEN ───────────────────────────────────────
function renderBuildingsScreen() {
  const content = document.getElementById('content');
  if (!content) return;

  let html = `
    <div class="screen-buildings">
      <h2 class="section-title">🏗️ Xây Dựng & Nâng Cấp</h2>
  `;

  for (const [id, bd] of Object.entries(GAME_DATA.buildings)) {
    const level = gameState.buildings[id] || 0;
    const cost = getBuildingCost(id);
    const isMaxed = level >= bd.maxLevel;
    const canUp = !isMaxed && gameState.gold >= cost;

    html += `
      <div class="building-card ${isMaxed ? 'maxed' : ''}">
        <div class="building-header">
          <span class="building-icon">${bd.icon}</span>
          <span class="building-name">${bd.name}</span>
          <span class="building-level">Lv.${level}/${bd.maxLevel}</span>
        </div>
        <div class="building-desc">${bd.desc}</div>
        <div class="building-effect">${bd.upgradeBenefits(level)}</div>
        ${!isMaxed ? `
          <div class="building-upgrade">
            <span class="upgrade-cost">💰 ${formatNumber(cost)} gold</span>
            <button class="btn btn-primary btn-sm" onclick="upgradeBuilding('${id}')" ${canUp ? '' : 'disabled'}>
              ${canUp ? '⬆️ Nâng Cấp' : '❌ Không đủ vàng'}
            </button>
          </div>
        ` : '<div class="building-maxed">✅ ĐẠT MAX LEVEL</div>'}
      </div>
    `;
  }

  html += '</div>';
  content.innerHTML = html;
}

// ─── CRAFTING SCREEN ────────────────────────────────────────
function renderCraftingScreen() {
  const content = document.getElementById('content');
  if (!content) return;

  const bsLevel = gameState.buildings.blacksmith || 0;
  const alLevel = gameState.buildings.alchemist || 0;

  let html = `
    <div class="screen-crafting">
      <h2 class="section-title">🔨 Chế Tạo</h2>
  `;

  if (bsLevel <= 0 && alLevel <= 0) {
    html += `<div class="empty-state">⚠️ Bạn chưa có xưởng chế tạo! Hãy xây dựng Lò Rèn hoặc Nhà Thuốc.</div>`;
  }

  // Equipment Recipes
  if (bsLevel > 0) {
    html += `<h3 class="sub-title">⚔️ Vũ Khí & Giáp (Lò Rèn Lv.${bsLevel})</h3>`;
    const recipes = getAvailableEquipmentRecipes();
    recipes.forEach(r => {
      html += renderCraftingRecipe(r, 'equipment');
    });
  }

  // Potion Recipes
  if (alLevel > 0) {
    html += `<h3 class="sub-title">⚗️ Bình Thuốc (Nhà Thuốc Lv.${alLevel})</h3>`;
    const recipes = getAvailablePotionRecipes();
    recipes.forEach(r => {
      html += renderCraftingRecipe(r, 'potion');
    });
  }

  html += '</div>';
  content.innerHTML = html;
}

function renderCraftingRecipe(recipe, type) {
  const costHtml = Object.entries(recipe.cost).map(([matId, amount]) => {
    if (matId === 'gold') return `<span class="cost-item gold">💰 ${amount}</span>`;
    const mat = GAME_DATA.materials[matId];
    const has = gameState.inventory[matId] || 0;
    const enough = has >= amount;
    return `<span class="cost-item ${enough ? 'enough' : 'missing'}">${mat ? mat.icon : '❓'} ${has}/${amount}</span>`;
  }).join('');

  const craftFn = type === 'equipment' ? `craftEquipment('${recipe.id}')` : `craftPotion('${recipe.id}')`;

  return `
    <div class="recipe-card ${recipe.canCraft ? '' : 'locked'}">
      <div class="recipe-header">
        <span class="recipe-icon">${recipe.icon}</span>
        <span class="recipe-name">${recipe.name}</span>
        ${recipe.tier ? `<span class="recipe-tier">Tier ${recipe.tier}</span>` : ''}
        ${!recipe.meetsTier && recipe.meetsTier !== undefined ? '<span class="recipe-locked-badge">🔒</span>' : ''}
      </div>
      <div class="recipe-stats">${getRecipeStats(recipe)}</div>
      <div class="recipe-cost">${costHtml}</div>
      <button class="btn btn-sm ${recipe.canCraft ? 'btn-primary' : 'btn-disabled'}" onclick="${craftFn}" ${recipe.canCraft ? '' : 'disabled'}>
        🔨 Chế Tạo
      </button>
    </div>
  `;
}

function getRecipeStats(recipe) {
  const stats = [];
  if (recipe.atk) stats.push(`⚔️+${recipe.atk}`);
  if (recipe.def) stats.push(`🛡️+${recipe.def}`);
  if (recipe.hp) stats.push(`❤️+${recipe.hp}`);
  if (recipe.spd) stats.push(`💨+${recipe.spd}`);
  if (recipe.crit) stats.push(`🎯+${recipe.crit}`);
  if (recipe.healPercent) stats.push(`💗 Hồi ${recipe.healPercent}% HP`);
  if (recipe.buffStat) stats.push(`⬆️ +${recipe.buffPercent}% ${recipe.buffStat.toUpperCase()}`);
  return stats.join(' | ');
}

// ─── INVENTORY SCREEN ──────────────────────────────────────
function renderInventoryScreen() {
  const content = document.getElementById('content');
  if (!content) return;

  let html = `
    <div class="screen-inventory">
      <h2 class="section-title">🎒 Kho Vật Phẩm</h2>

      <div class="action-row">
        <button class="btn btn-warning" onclick="sellAllMaterials()">💰 Bán Tất Cả Vật Liệu</button>
      </div>
  `;

  // Materials
  const materials = Object.entries(gameState.inventory).filter(([_, count]) => count > 0);
  if (materials.length === 0) {
    html += `<div class="empty-state">📭 Kho trống.</div>`;
  } else {
    html += `<h3 class="sub-title">🧪 Nguyên Liệu (${materials.length} loại)</h3>`;
    html += '<div class="inventory-grid">';
    materials.forEach(([matId, count]) => {
      const mat = GAME_DATA.materials[matId];
      if (!mat) return;
      html += `
        <div class="inv-item rarity-${mat.rarity}">
          <span class="inv-icon">${mat.icon}</span>
          <span class="inv-name" style="color:${GAME_DATA.rarityColors[mat.rarity]}">${mat.name}</span>
          <span class="inv-count">x${count}</span>
          <div class="inv-actions">
            <button class="btn btn-xs" onclick="sellMaterial('${matId}', 1)">Bán 1</button>
            <button class="btn btn-xs" onclick="sellMaterial('${matId}', ${count})">Bán tất</button>
          </div>
        </div>
      `;
    });
    html += '</div>';
  }

  // Potions
  const potions = Object.entries(gameState.potions).filter(([_, count]) => count > 0);
  if (potions.length > 0) {
    html += `<h3 class="sub-title">⚗️ Bình Thuốc</h3>`;
    html += '<div class="inventory-grid">';
    potions.forEach(([potId, count]) => {
      const pot = GAME_DATA.potions[potId];
      if (!pot) return;
      html += `
        <div class="inv-item">
          <span class="inv-icon">${pot.icon}</span>
          <span class="inv-name">${pot.name}</span>
          <span class="inv-count">x${count}</span>
        </div>
      `;
    });
    html += '</div>';
  }

  // Crafted Equipment
  if (gameState.equipment.length > 0) {
    html += `<h3 class="sub-title">⚔️ Vật Phẩm Đã Chế Tạo (${gameState.equipment.length})</h3>`;
    html += '<div class="equipment-list">';
    gameState.equipment.forEach(eq => {
      html += `
        <div class="eq-item">
          <span class="eq-icon">${eq.icon}</span>
          <span class="eq-name">${eq.name}</span>
          <span class="eq-tier">T${eq.tier}</span>
          <span class="eq-stats">${getRecipeStats(eq)}</span>
          <button class="btn btn-xs btn-danger" onclick="sellEquipment('${eq.id}')">Bán</button>
        </div>
      `;
    });
    html += '</div>';
  }

  html += '</div>';
  content.innerHTML = html;
}

function sellEquipment(eqId) {
  const idx = gameState.equipment.findIndex(e => e.id === eqId);
  if (idx === -1) return;
  const eq = gameState.equipment[idx];
  const sellPrice = eq.tier * 50;
  gameState.gold += sellPrice;
  gameState.stats.totalGoldEarned += sellPrice;
  gameState.equipment.splice(idx, 1);
  addLog(`💰 Bán ${eq.icon} ${eq.name}: +${sellPrice} gold`, 'info');
  renderUI();
}

// ─── MAP SCREEN ─────────────────────────────────────────────
function renderMapScreen() {
  const content = document.getElementById('content');
  if (!content) return;

  const thLevel = gameState.buildings.townhall;

  let html = `
    <div class="screen-map">
      <h2 class="section-title">🗺️ Bản Đồ Săn</h2>
      <div class="current-zone">
        Zone hiện tại: <b>${GAME_DATA.zones[gameState.currentZone]?.icon || '❓'} ${GAME_DATA.zones[gameState.currentZone]?.name || 'Không rõ'}</b>
      </div>

      <div class="density-control">
        <label>🐛 Mật Độ Quái: ${gameState.mobDensity}</label>
        <input type="range" min="1" max="10" value="${gameState.mobDensity}" onchange="setMobDensity(this.value)">
        <span class="density-hint">(Cao hơn = nhiều loot hơn, nhưng Thợ Săn dễ chết)</span>
      </div>
  `;

  for (const [id, zone] of Object.entries(GAME_DATA.zones)) {
    const unlocked = thLevel >= zone.requiredTownhall;
    const isActive = gameState.currentZone === id;

    html += `
      <div class="zone-card ${isActive ? 'active' : ''} ${!unlocked ? 'locked' : ''}">
        <div class="zone-header">
          <span class="zone-icon">${zone.icon}</span>
          <span class="zone-name">${zone.name}</span>
          <span class="zone-diff">Difficulty ${zone.difficulty}</span>
          ${!unlocked ? `<span class="zone-require">🔒 Cần Nhà Làng Lv.${zone.requiredTownhall}</span>` : ''}
        </div>
        <div class="zone-info">
          <span>💰 Gold/tick: ${zone.baseGold}</span>
          <span>⭐ XP/tick: ${zone.baseXp}</span>
          <span>📦 Drop rate: ${(zone.baseDropRate * 100)}%</span>
        </div>
        <div class="zone-monsters">
          ${zone.monsters.map(mId => {
            const m = GAME_DATA.monsters[mId];
            return m ? `<span class="monster-tag" title="HP:${m.hp} ATK:${m.atk}">${m.icon} ${m.name}</span>` : '';
          }).join('')}
          <span class="monster-tag boss-tag" title="BOSS">👹 ${GAME_DATA.monsters[zone.boss]?.name || 'Boss'}</span>
        </div>
        ${unlocked && !isActive ? `<button class="btn btn-primary btn-sm" onclick="changeZone('${id}')">⚔️ Đến đây săn</button>` : ''}
        ${isActive ? '<span class="zone-active-badge">✅ ĐANG SỞ TẠI</span>' : ''}
      </div>
    `;
  }

  html += '</div>';
  content.innerHTML = html;
}

function setMobDensity(value) {
  gameState.mobDensity = parseInt(value);
  renderUI();
}

function changeZone(zoneId) {
  gameState.currentZone = zoneId;
  addLog(`🗺️ Chuyển sang ${GAME_DATA.zones[zoneId].icon} ${GAME_DATA.zones[zoneId].name}`, 'info');
  renderUI();
}

// ─── QUESTS SCREEN ──────────────────────────────────────────
function renderQuestsScreen() {
  const content = document.getElementById('content');
  if (!content) return;

  let html = `
    <div class="screen-quests">
      <h2 class="section-title">📜 Quest (${gameState.quests.active.length}/3)</h2>
      <button class="btn btn-primary" onclick="addQuest()" ${gameState.quests.active.length >= 3 ? 'disabled' : ''}>
        ➕ Nhận Quest Mới
      </button>
  `;

  if (gameState.quests.active.length === 0) {
    html += `<div class="empty-state">📭 Chưa có quest nào.</div>`;
  } else {
    gameState.quests.active.forEach(q => {
      const progress = Math.min(q.progress, q.amount);
      const percent = (progress / q.amount) * 100;

      html += `
        <div class="quest-card ${q.completed ? 'completed' : ''} ${q.claimed ? 'claimed' : ''}">
          <div class="quest-header">
            <span class="quest-icon">${q.icon}</span>
            <span class="quest-name">${q.name}</span>
            ${q.completed ? '<span class="quest-badge done">✅ Hoàn thành</span>' : ''}
            ${q.claimed ? '<span class="quest-badge claimed">🎁 Đã nhận</span>' : ''}
          </div>
          <div class="quest-desc">${q.desc}</div>
          <div class="quest-progress">
            <div class="bar"><div class="bar-fill quest-bar" style="width:${percent}%"></div></div>
            <span class="bar-text">${progress}/${q.amount}</span>
          </div>
          <div class="quest-reward">
            Phần thưởng:
            ${q.reward.gold ? `💰${q.reward.gold}` : ''}
            ${q.reward.gems ? ` 💎${q.reward.gems}` : ''}
            ${q.reward.xp ? ` ⭐${q.reward.xp} XP` : ''}
          </div>
          ${q.completed && !q.claimed ? `<button class="btn btn-primary btn-sm" onclick="claimQuest('${q.id}')">🎁 Nhận Thưởng</button>` : ''}
        </div>
      `;
    });
  }

  html += '</div>';
  content.innerHTML = html;
}

// ─── LOG SCREEN ─────────────────────────────────────────────
function renderLogScreen() {
  const content = document.getElementById('content');
  if (!content) return;

  let html = `
    <div class="screen-log">
      <h2 class="section-title">📋 Nhật Ký Hoạt Động</h2>
      <div class="log-list">
  `;

  if (gameState.log.length === 0) {
    html += `<div class="empty-state">📭 Chưa có hoạt động nào.</div>`;
  } else {
    gameState.log.forEach(entry => {
      html += `<div class="log-entry log-${entry.type}"><span class="log-day">[Ngày ${entry.time}]</span> ${entry.message}</div>`;
    });
  }

  html += '</div></div>';
  content.innerHTML = html;
}

// ─── SETTINGS SCREEN ────────────────────────────────────────
function renderSettingsScreen() {
  const content = document.getElementById('content');
  if (!content) return;

  html = `
    <div class="screen-settings">
      <h2 class="section-title">⚙️ Cài Đặt</h2>

      <div class="settings-group">
        <button class="btn btn-primary" onclick="togglePause()">
          ${isPaused ? '▶️ Tiếp Tục' : '⏸️ Tạm Dừng'}
        </button>
        <button class="btn btn-secondary" onclick="saveGame(); addLog('💾 Đã lưu!', 'system'); renderUI();">
          💾 Lưu Game
        </button>
        <button class="btn btn-secondary" onclick="exportGame()">
          📤 Xuất Dữ Liệu
        </button>
        <button class="btn btn-secondary" onclick="importGame()">
          📥 Nhập Dữ Liệu
        </button>
        <button class="btn btn-danger" onclick="resetGame()">
          🗑️ Reset Game
        </button>
      </div>

      <h3 class="sub-title">🏆 Thành Tựu (${gameState.achievements.length}/${GAME_DATA.achievements.length})</h3>
      <div class="achievements-grid">
        ${GAME_DATA.achievements.map(ach => {
          const unlocked = gameState.achievements.includes(ach.id);
          return `
            <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
              <span class="ach-icon">${ach.icon}</span>
              <span class="ach-name">${ach.name}</span>
              <span class="ach-desc">${ach.desc}</span>
            </div>
          `;
        }).join('')}
      </div>

      <div class="game-info">
        <p>Dark Realm Tycoon v1.0</p>
        <p>Inspired by Evil Hunter Tycoon</p>
      </div>
    </div>
  `;

  content.innerHTML = html;
}
