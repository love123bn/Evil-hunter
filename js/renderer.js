/**
 * TOWN OF HUNTERS - ASCII 2D RENDERER & UI CONTROLLER
 */

class Renderer {
  constructor() {
    this.mapPre = document.getElementById('ascii-grid');
    this.hunterStrip = document.getElementById('hunter-mini-strip');
    this.viewportContainer = document.getElementById('ascii-map-display');
  }

  // Render Live Hunter Information Cards Deck
  renderAsciiMap() {
    try {
      const state = window.gameState;
      if (!state) return;
      const deck = document.getElementById('hunter-live-deck');
      const countSpan = document.getElementById('txt-hunter-count');
      if (countSpan) countSpan.textContent = (state.hunters || []).length;
      if (!deck) return;

      if (!state.hunters || state.hunters.length === 0) {
        deck.innerHTML = `
          <div style="color:var(--text-muted); text-align:center; padding:15px;">
            Chưa có thợ săn nào! Hãy mở mục [🔮 Chiêu Mộ] để triệu hồi thợ săn đầu tiên.
          </div>
        `;
        return;
      }

      let html = "";
      state.hunters.forEach(h => {
        const clsKey = (h.classKey || "BERSERKER").toUpperCase();
        const rankKey = (h.rankKey || "NORMAL").toUpperCase();
        const cls = CONFIG.HUNTER_CLASSES[clsKey] || CONFIG.HUNTER_CLASSES.BERSERKER;
        const rank = CONFIG.HUNTER_RANKS[rankKey] || CONFIG.HUNTER_RANKS.NORMAL;
        
        const maxHp = Number(h.maxHp) || 100;
        const hp = h.hp !== undefined ? Number(h.hp) : maxHp;
        const hpPct = Math.max(0, Math.min(100, Math.round((hp / maxHp) * 100)));
        const hungerPct = Math.max(0, Math.min(100, Math.round(Number(h.hunger) || 100)));
        const fatiguePct = Math.max(0, Math.min(100, Math.round(Number(h.fatigue) || 100)));

        // Action Badge & Color
        let stateBadge = `<span class="h-state-badge hunting">⚔️ Đi Săn</span>`;
        if (h.state === 'RESTING') stateBadge = `<span class="h-state-badge resting">🏨 Quán Trọ</span>`;
        else if (h.state === 'EATING') stateBadge = `<span class="h-state-badge eating">🍲 Quán Ăn</span>`;
        else if (h.state === 'HEALING') stateBadge = `<span class="h-state-badge healing">🏥 Y Tế</span>`;
        else if (h.state === 'SHOPPING') stateBadge = `<span class="h-state-badge shopping">⚒️ Lò Rèn</span>`;
        else if (h.state === 'DEAD') stateBadge = `<span class="h-state-badge dead">💀 Gục Ngã</span>`;

        const starTxt = h.reincarnation > 0 ? `<b style="color:#ffd700;">${'⭐'.repeat(h.reincarnation)}</b> ` : '';
        const activityText = h.activityLog || "Đang săn quái vật...";
        const cp = h.getCombatPower ? h.getCombatPower() : 0;

        html += `
          <div class="hunter-live-card ${hpPct < 30 ? 'critical-hp' : ''}" onclick="window.app.openHunterDetail('${h.id}')">
            <!-- Top Row: Name, Class, Level, State, Combat Power -->
            <div class="hlc-top">
              <div class="hlc-identity">
                <span class="hlc-icon">${cls.icon}</span>
                <b class="hlc-name" style="color:${rank.color}">${starTxt}${h.name}</b>
                <span class="hlc-lvl">Lv.${h.level}</span>
                <span class="hlc-rank" style="color:${rank.color}">[${rank.name}]</span>
                <span class="hlc-power" style="color:#ffaa00; font-weight:bold; font-size:10px; background:rgba(255,170,0,0.15); padding:1px 5px; border-radius:3px; border:1px solid rgba(255,170,0,0.3); margin-left:4px;" title="Lực Chiến: ${cp.toLocaleString()} CP">⚔️ ${CONFIG.formatNumber ? CONFIG.formatNumber(cp) : cp.toLocaleString()}</span>
              </div>
              <div class="hlc-state-wrap">
                ${stateBadge}
              </div>
            </div>

            <!-- Middle Row: 3 Mini Status Bars (HP, Hunger, Fatigue) -->
            <div class="hlc-gauges">
              <div class="hlc-gauge" title="Máu">
                <span class="g-lbl">❤️ HP</span>
                <div class="g-track"><div class="g-fill hp" style="width:${hpPct}%"></div></div>
                <span class="g-val">${Math.round(hp)}/${maxHp}</span>
              </div>
              <div class="hlc-gauge" title="Độ no bụng">
                <span class="g-lbl">🍖 Đói</span>
                <div class="g-track"><div class="g-fill hunger" style="width:${hungerPct}%"></div></div>
                <span class="g-val">${hungerPct}%</span>
              </div>
              <div class="hlc-gauge" title="Thể lực">
                <span class="g-lbl">😴 Mệt</span>
                <div class="g-track"><div class="g-fill fatigue" style="width:${fatiguePct}%"></div></div>
                <span class="g-val">${fatiguePct}%</span>
              </div>
            </div>

            <!-- Bottom Row: Activity Text & Gear/Wallet -->
            <div class="hlc-bottom">
              <div class="hlc-activity">
                💬 <i>${activityText}</i>
              </div>
              <div class="hlc-inventory">
                <span>💰 ${h.gold || 0}g</span>
                <span>🎒 ${(h.bag || []).length}/4</span>
              </div>
            </div>
          </div>
        `;
      });

      deck.innerHTML = html;
    } catch(err) {
      console.error("Error in renderAsciiMap:", err);
    }
  }

  // Floating Combat Damage Text (Disabled for Clean Interface)
  spawnCombatFloat(text, x, y) {}

  // Render Mini Hunter Status Pills
  renderHunterStrip() {}

  // Update Top Bar & Building Badges
  updateHeader() {
    const state = window.gameState;
    document.getElementById('txt-town-name').textContent = `Thị Trấn Cấp ${state.townLevel}`;
    document.getElementById('val-gold').textContent = state.gold.toLocaleString();
    document.getElementById('val-gems').textContent = state.gems;
    document.getElementById('val-pop').textContent = `${state.hunters.length}/${state.maxHunters}`;
    document.getElementById('val-storage').textContent = `${state.getStorageCount()}/${state.maxStorage}`;

    const totalPower = (state.hunters || []).reduce((s, h) => s + (h.getCombatPower ? h.getCombatPower() : 0), 0);
    const pEl = document.getElementById('val-power');
    if (pEl) {
      pEl.textContent = CONFIG.formatNumber ? CONFIG.formatNumber(totalPower) : totalPower.toLocaleString();
      if (pEl.parentElement) pEl.parentElement.title = `Tổng Lực Chiến Toàn Thị Trấn: ${totalPower.toLocaleString()} CP`;
    }

    // Update Building Grid Badges & Progress Bars
    const updateGridBtnState = (btnId, badgeId, isUpgrading, timeLeft, totalTime, levelStr) => {
      const btn = document.getElementById(btnId);
      const badge = document.getElementById(badgeId);
      if (!btn) return;

      let progBar = btn.querySelector('.btn-mini-prog');
      if (!progBar) {
        progBar = document.createElement('div');
        progBar.className = 'btn-mini-prog';
        progBar.innerHTML = '<div class="mini-prog-fill"></div>';
        btn.appendChild(progBar);
      }
      const fill = progBar.querySelector('.mini-prog-fill');

      if (isUpgrading) {
        if (!btn.classList.contains('upgrading-active')) btn.classList.add('upgrading-active');
        const s = Math.max(0, Math.ceil(timeLeft));
        const total = Math.max(1, totalTime || s || 1);
        const p = Math.max(0, Math.min(100, ((total - timeLeft) / total) * 100));

        const timeTxt = `🔨 ${Building.formatTime(s)}`;
        if (badge && badge.textContent !== timeTxt) {
          badge.textContent = timeTxt;
          badge.classList.add('badge-upgrading');
        }
        if (fill) fill.style.width = `${p}%`;
        if (progBar.style.display !== 'block') progBar.style.display = 'block';
      } else {
        if (btn.classList.contains('upgrading-active')) btn.classList.remove('upgrading-active');
        if (badge && badge.textContent !== levelStr) {
          badge.textContent = levelStr;
          badge.classList.remove('badge-upgrading');
        }
        if (fill) fill.style.width = '0%';
        if (progBar.style.display !== 'none') progBar.style.display = 'none';
      }
    };

    const bForge = state.buildings.forge;
    const bInn = state.buildings.inn;
    const bTav = state.buildings.tavern;
    const bClin = state.buildings.clinic;

    updateGridBtnState('grid-btn-forge', 'badge-forge', bForge.isUpgrading, bForge.upgradeTimeLeft, bForge.upgradeTotalTime, `Lv.${bForge.level}`);
    updateGridBtnState('grid-btn-inn', 'badge-inn', bInn.isUpgrading, bInn.upgradeTimeLeft, bInn.upgradeTotalTime, `Lv.${bInn.level}`);
    updateGridBtnState('grid-btn-tavern', 'badge-tavern', bTav.isUpgrading, bTav.upgradeTimeLeft, bTav.upgradeTotalTime, `Lv.${bTav.level}`);
    updateGridBtnState('grid-btn-clinic', 'badge-clinic', bClin.isUpgrading, bClin.upgradeTimeLeft, bClin.upgradeTotalTime, `Lv.${bClin.level}`);
    updateGridBtnState('grid-btn-hall', 'badge-hall', state.townIsUpgrading, state.townUpgradeTimeLeft, state.townUpgradeTotalTime, `Cấp ${state.townLevel}`);

    const badgeDungeon = document.getElementById('badge-dungeon');
    if (badgeDungeon) {
      const nextF = Math.min(30, (state.dungeonMaxFloor || 0) + 1);
      badgeDungeon.textContent = `Tầng ${nextF}`;
    }

    // Threat progress
    const pct = Math.max(0, Math.min(100, (1 - state.threatTimer / state.threatMax) * 100));
    document.getElementById('threat-progress-fill').style.width = `${pct}%`;
    const mins = Math.floor(state.threatTimer / 60);
    const secs = Math.floor(state.threatTimer % 60);
    document.getElementById('threat-timer-text').textContent = 
      state.isBloodMoon ? "XÂM LĂNG!" : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    // Day/Night text
    const hrs = Math.floor((state.gameTimeSeconds / 3600) % 24);
    const minsT = Math.floor((state.gameTimeSeconds % 3600) / 60);
    const timeStr = `${hrs.toString().padStart(2, '0')}:${minsT.toString().padStart(2, '0')}`;
    const icon = (hrs >= 6 && hrs < 18) ? "☀️" : "🌙";
    document.getElementById('cycle-icon').textContent = icon;
    document.getElementById('txt-cycle-time').textContent = `Ngày ${state.dayCount} - ${timeStr}`;
  }
}

window.renderer = new Renderer();

// LOG TICKER MANAGER
class LogTicker {
  constructor() {
    this.container = document.getElementById('log-content');
    this.maxLogs = 30;
    this.loadLogs();
  }

  loadLogs() {
    try {
      const saved = localStorage.getItem("AHT_SAVED_LOGS");
      if (saved && this.container) {
        this.container.innerHTML = saved;
        this.container.scrollTop = this.container.scrollHeight;
      }
    } catch (e) {}
  }

  saveLogs() {
    try {
      if (this.container) {
        localStorage.setItem("AHT_SAVED_LOGS", this.container.innerHTML);
      }
    } catch (e) {}
  }

  add(message, type = 'system') {
    if (!this.container) return;
    const row = document.createElement('div');
    row.className = `log-entry ${type}`;
    
    const now = new Date();
    const timeStr = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
    
    row.innerHTML = `<span class="time">${timeStr}</span> ${message}`;
    this.container.appendChild(row);

    // Auto scroll down
    this.container.scrollTop = this.container.scrollHeight;

    // Prune old logs
    while (this.container.children.length > this.maxLogs) {
      this.container.removeChild(this.container.firstChild);
    }

    this.saveLogs();
  }

  clear() {
    if (this.container) {
      this.container.innerHTML = "";
      try { localStorage.removeItem("AHT_SAVED_LOGS"); } catch(e) {}
    }
  }
}

window.logTicker = new LogTicker();

// ==========================================================
// NOTIFICATION & IN-GAME DIALOG SYSTEM
// ==========================================================
class NotificationSystem {
  constructor() {
    this.toastContainer = null;
    this.dialogModal = null;
    this.dialogTitle = null;
    this.dialogIcon = null;
    this.dialogMessage = null;
    this.dialogOkBtn = null;
    this.dialogCancelBtn = null;
    this.dialogCloseBtn = null;
    this.confirmCallback = null;
    this.cancelCallback = null;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    this.toastContainer = document.getElementById('game-toast-container');
    this.dialogModal = document.getElementById('modal-game-alert');
    this.dialogTitle = document.getElementById('dialog-title-txt');
    this.dialogIcon = document.getElementById('dialog-icon');
    this.dialogMessage = document.getElementById('dialog-message');
    this.dialogOkBtn = document.getElementById('btn-dialog-ok');
    this.dialogCancelBtn = document.getElementById('btn-dialog-cancel');
    this.dialogCloseBtn = document.getElementById('btn-dialog-close');

    if (this.dialogOkBtn) {
      this.dialogOkBtn.addEventListener('click', () => {
        this.closeDialog();
        if (this.confirmCallback) {
          const cb = this.confirmCallback;
          this.confirmCallback = null;
          cb();
        }
      });
    }

    if (this.dialogCancelBtn) {
      this.dialogCancelBtn.addEventListener('click', () => {
        this.closeDialog();
        if (this.cancelCallback) {
          const cb = this.cancelCallback;
          this.cancelCallback = null;
          cb();
        }
      });
    }

    if (this.dialogCloseBtn) {
      this.dialogCloseBtn.addEventListener('click', () => {
        this.closeDialog();
        if (this.cancelCallback) {
          const cb = this.cancelCallback;
          this.cancelCallback = null;
          cb();
        }
      });
    }

    if (this.dialogModal) {
      this.dialogModal.addEventListener('click', (e) => {
        if (e.target === this.dialogModal) {
          this.closeDialog();
          if (this.cancelCallback) {
            const cb = this.cancelCallback;
            this.cancelCallback = null;
            cb();
          }
        }
      });
    }

    this.isInitialized = true;
  }

  closeDialog() {
    if (this.dialogModal) {
      this.dialogModal.classList.add('hidden');
    }
  }

  showAlert(message, title = 'THÔNG BÁO THỊ TRẤN', icon = '⚠️') {
    this.init();
    if (!this.dialogModal) return;

    if (this.dialogTitle) this.dialogTitle.textContent = title;
    if (this.dialogIcon) this.dialogIcon.textContent = icon;
    if (this.dialogMessage) this.dialogMessage.innerHTML = (message || '').replace(/\n/g, '<br>');
    if (this.dialogCancelBtn) this.dialogCancelBtn.classList.add('hidden');
    if (this.dialogOkBtn) {
      this.dialogOkBtn.textContent = 'ĐÃ HIỂU';
      this.dialogOkBtn.className = 'btn-primary';
    }

    this.confirmCallback = null;
    this.cancelCallback = null;
    this.dialogModal.classList.remove('hidden');

    if (window.soundFX) window.soundFX.playWarning();
  }

  showConfirm(message, title = 'XÁC NHẬN HÀNH ĐỘNG', onConfirm, onCancel, icon = '❓') {
    this.init();
    if (!this.dialogModal) return;

    if (this.dialogTitle) this.dialogTitle.textContent = title;
    if (this.dialogIcon) this.dialogIcon.textContent = icon;
    if (this.dialogMessage) this.dialogMessage.innerHTML = (message || '').replace(/\n/g, '<br>');
    if (this.dialogCancelBtn) this.dialogCancelBtn.classList.remove('hidden');
    if (this.dialogOkBtn) {
      this.dialogOkBtn.textContent = 'XÁC NHẬN';
      this.dialogOkBtn.className = 'btn-danger';
    }

    this.confirmCallback = onConfirm;
    this.cancelCallback = onCancel;
    this.dialogModal.classList.remove('hidden');

    if (window.soundFX) window.soundFX.playWarning();
  }

  showToast(message, type = 'warning', title = '') {
    this.init();
    if (!this.toastContainer) this.toastContainer = document.getElementById('game-toast-container');
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `game-toast toast-${type}`;

    let icon = '🔔';
    let defaultTitle = 'THÔNG BÁO';
    if (type === 'warning') { icon = '⚠️'; defaultTitle = 'CẢNH BÁO'; }
    else if (type === 'danger' || type === 'error') { icon = '❌'; defaultTitle = 'THIẾU TÀI NGUYÊN'; }
    else if (type === 'success' || type === 'loot') { icon = '✨'; defaultTitle = 'THÀNH CÔNG'; }
    else if (type === 'special' || type === 'magic') { icon = '💎'; defaultTitle = 'THẦN BÍ'; }

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-body">
        <div class="toast-title">${title || defaultTitle}</div>
        <div>${message}</div>
      </div>
    `;

    this.toastContainer.appendChild(toast);

    const removeToast = () => {
      if (toast.parentElement) {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 250);
      }
    };

    toast.addEventListener('click', removeToast);
    setTimeout(removeToast, 3800);

    // Keep max 3 toasts
    while (this.toastContainer.children.length > 3) {
      this.toastContainer.removeChild(this.toastContainer.firstChild);
    }
  }
}

window.notificationSystem = new NotificationSystem();

// Global Notification API
window.showAlert = (msg, title, icon) => window.notificationSystem.showAlert(msg, title, icon);
window.showConfirm = (msg, title, onConfirm, onCancel, icon) => window.notificationSystem.showConfirm(msg, title, onConfirm, onCancel, icon);
window.showToast = (msg, type, title) => window.notificationSystem.showToast(msg, type, title);

// Override default browser alert to route to in-game fantasy dialog
window.alert = function(msg) {
  window.showAlert(msg);
};

