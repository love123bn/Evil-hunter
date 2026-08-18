/**
 * TOWN OF HUNTERS: ASCII CHRONICLES
 * Master Game Loop & Event Controller
 */

class App {
  constructor() {
    this.activeModal = null;
    this.gameSpeed = 1;
    this.introStep = 0;
    this.introDialogs = [
      { speaker: "Trưởng Lão Eldrin", text: "Khụ... mừng ngài tỉnh lại, thưa Tân Thị Trưởng! Chúa Quỷ Malakor đã biến lục địa thành tro tàn. Nơi này là pháo đài cuối cùng của nhân loại." },
      { speaker: "Trưởng Lão Eldrin", text: "Các Thợ Săn từ khắp nơi đang đổ về đây. Họ sẽ tự động ra bãi quái diệt quỷ, nhưng họ cần Quán Trọ để ngủ, Quán Ăn khi đói và Lò Rèn để sắm vũ khí!" },
      { speaker: "Trưởng Lão Eldrin", text: "Nhiệm vụ của ngài là thu mua loot của họ, rèn trang bị xịn và mở rộng thị trấn. Cứ mỗi chu kỳ, Đêm Trăng Máu sẽ ập tới... Hãy dẫn dắt chúng tôi!" }
    ];
  }

  init() {
    // 1. Load or Initialize Game State
    const hasSave = window.gameState.load();
    
    if (!hasSave) {
      // Starter Hunters for fresh new game
      window.gameState.hunters.push(new Hunter({
        name: "Kael",
        classKey: "BERSERKER",
        rankKey: "NORMAL",
        level: 1
      }));
      window.gameState.hunters.push(new Hunter({
        name: "Lyra",
        classKey: "RANGER",
        rankKey: "RARE",
        level: 1
      }));

      // Show intro tutorial
      this.showIntro();
      window.gameState.save();
      window.logTicker.add("🏰 Thị trấn đã sẵn sàng! Chúc Tân Thị Trưởng khởi đầu thuận lợi!", "system");
    }

    // 2. Spawn Starter Monsters in Active Zone
    this.spawnMonstersForZone(window.gameState.currentZoneId);

    // 3. Setup UI Event Listeners
    this.bindEvents();

    // 4. Run Initial Simulation Frame (Immediately engage monsters)
    this.simulationTick();

    // 5. Auto-save on page close / reload (F5)
    window.addEventListener('beforeunload', () => {
      if (!window.isResetting) {
        window.gameState.save();
      }
    });

    // 6. Start Master Loops
    setInterval(() => this.simulationTick(), CONFIG.TICK_INTERVAL_MS);
    setInterval(() => window.gameState.save(), CONFIG.SAVE_INTERVAL_MS);
  }

  spawnMonstersForZone(zoneId) {
    const zone = CONFIG.ZONES.find(z => z.id === zoneId) || CONFIG.ZONES[0];
    const diff = CONFIG.DIFFICULTIES.find(d => d.id === window.gameState.currentDifficulty) || CONFIG.DIFFICULTIES[0];

    window.gameState.monsters = [];
    for (let i = 0; i < 4; i++) {
      const template = zone.monsters[Math.floor(Math.random() * zone.monsters.length)];
      window.gameState.monsters.push(new Monster(template, diff));
    }
  }

  simulationTick() {
    try {
      const deltaSeconds = (CONFIG.TICK_INTERVAL_MS / 1000) * this.gameSpeed;
      window.gameState.gameTimeSeconds += deltaSeconds * 60; // 1 real sec = 1 in-game min

      // 1. Update Hunters
      if (window.gameState.hunters && Array.isArray(window.gameState.hunters)) {
        window.gameState.hunters.forEach(h => {
          try { h.update(deltaSeconds); } catch(e) { console.error("Hunter update error:", e); }
        });
      }

      // 2. Update Construction Timers
      Building.tickConstruction(deltaSeconds);

      // 3. Update Invasion System
      InvasionSystem.update(deltaSeconds);

      // 3b. Update Dungeon Boss Battle
      if (typeof DungeonSystem !== 'undefined') {
        DungeonSystem.updateBattle(deltaSeconds);
      }

      // 4. Render Views
      if (window.renderer) {
        window.renderer.renderAsciiMap();
        window.renderer.updateHeader();
      }

      // 5. If modal is open, refresh countdowns
      if (this.activeModal) {
        this.refreshActiveModal();
      }
    } catch(err) {
      console.error("Simulation tick error:", err);
    }
  }

  refreshActiveModal() {
    if (this.activeModal === 'modal-forge') this.populateForgeModal();
    else if (this.activeModal === 'modal-inn') this.populateInnModal();
    else if (this.activeModal === 'modal-tavern') this.populateTavernModal();
    else if (this.activeModal === 'modal-clinic') this.populateClinicModal();
    else if (this.activeModal === 'modal-hall') this.populateHallModal();
    else if (this.activeModal === 'modal-dungeon') this.renderDungeonTab();
  }

  showIntro() {
    const introLayer = document.getElementById('intro-dialog-layer');
    if (!introLayer) return;
    introLayer.classList.remove('hidden');
    this.introStep = 0;
    this.renderIntroStep();
  }

  renderIntroStep() {
    if (this.introStep >= this.introDialogs.length) {
      document.getElementById('intro-dialog-layer').classList.add('hidden');
      return;
    }
    const current = this.introDialogs[this.introStep];
    document.getElementById('intro-speaker').textContent = current.speaker + ":";
    document.getElementById('intro-text').textContent = current.text;
  }

  // BIND ALL DOM EVENTS
  bindEvents() {
    const self = this;

    // Intro actions
    document.getElementById('btn-intro-next')?.addEventListener('click', () => {
      self.introStep++;
      self.renderIntroStep();
    });
    document.getElementById('btn-intro-skip')?.addEventListener('click', () => {
      document.getElementById('intro-dialog-layer').classList.add('hidden');
    });

    // Clear log
    document.getElementById('btn-clear-log')?.addEventListener('click', () => {
      window.logTicker.clear();
    });

    // Building Grid click
    document.querySelectorAll('.grid-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-modal');
        self.openModal(modalId);
      });
    });

    // Sub-Tabs in Forge (Weapons, Armors, Rings, Amulets, Talismans)
    document.querySelectorAll('.sub-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        self.currentForgeCat = e.target.getAttribute('data-forge-cat');
        self.populateForgeModal();
      });
    });

    // Sub-Tabs in Research Tech Tree
    document.querySelectorAll('#research-subnav-bar .btn-subnav').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('#research-subnav-bar .btn-subnav').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        self.currentResearchBranch = e.target.getAttribute('data-filter') || 'all';
        self.populateResearchModal(self.currentResearchBranch);
      });
    });

    // Bottom Navigation Tabs click
    document.querySelectorAll('.tab-btn').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const tabKey = tab.getAttribute('data-tab');
        if (tabKey === 'tab-dungeon') self.openModal('modal-dungeon');
        else if (tabKey === 'tab-hunters') self.openModal('modal-hunters');
        else if (tabKey === 'tab-storage') self.openModal('modal-storage');
        else if (tabKey === 'tab-research') self.openModal('modal-research');
        else if (tabKey === 'tab-settings') self.openModal('modal-settings');
        else self.closeAllModals();
      });
    });

    // Modal Close buttons
    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => self.closeAllModals());
    });

    // Backdrop click
    document.getElementById('modal-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-backdrop') {
        self.closeAllModals();
      }
    });

    // Zone change modal
    document.getElementById('btn-change-zone')?.addEventListener('click', () => {
      self.openModal('modal-zone');
    });

    // Quick Hunter Pill click -> open Hunter Detail
    document.getElementById('hunter-mini-strip')?.addEventListener('click', (e) => {
      const pill = e.target.closest('.mini-hunter-pill');
      if (pill) {
        const hunterId = pill.getAttribute('data-hunter-id');
        self.openHunterDetail(hunterId);
      }
    });

    // Gacha Summon Buttons (1x & 10x - Gem Summon only)
    document.getElementById('btn-summon-special-1')?.addEventListener('click', () => self.performSummon(1));
    document.getElementById('btn-summon-special-10')?.addEventListener('click', () => self.performSummon(10));
    document.getElementById('btn-admit-all')?.addEventListener('click', () => self.admitAllWaiting());
    document.getElementById('btn-dismiss-all')?.addEventListener('click', () => self.dismissAllWaiting());
    
    // Toggle Rates Table
    document.getElementById('btn-toggle-rates')?.addEventListener('click', () => {
      const box = document.getElementById('gacha-rates-table');
      if (box) box.classList.toggle('hidden');
    });

    // Building Upgrade Buttons
    document.getElementById('btn-upgrade-forge')?.addEventListener('click', () => {
      Building.startUpgrade('forge');
      self.populateForgeModal();
    });
    document.getElementById('btn-upgrade-inn')?.addEventListener('click', () => {
      Building.startUpgrade('inn');
      self.populateInnModal();
    });
    document.getElementById('btn-upgrade-tavern')?.addEventListener('click', () => {
      Building.startUpgrade('tavern');
      self.populateTavernModal();
    });
    document.getElementById('btn-upgrade-clinic')?.addEventListener('click', () => {
      Building.startUpgrade('clinic');
      self.populateClinicModal();
    });
    document.getElementById('btn-upgrade-town')?.addEventListener('click', () => self.upgradeTown());

    // Settings actions
    document.getElementById('btn-save-game')?.addEventListener('click', () => {
      window.gameState.save();
      window.logTicker.add("💾 Đã lưu game thành công vào trình duyệt!", "system");
      window.showToast("Đã lưu game thành công vào trình duyệt!", "success", "LƯU TRỮ DỮ LIỆU");
    });
    document.getElementById('btn-reset-game')?.addEventListener('click', () => {
      window.showConfirm(
        "Bạn có chắc chắn muốn XÓA TOÀN BỘ dữ liệu thị trấn để chơi lại từ đầu không?\n\n⚠️ Mọi tiến trình, thợ săn, cấp độ và vàng/ngọc sẽ bị xóa sạch!",
        "XÁC NHẬN ĐẶT LẠI DỮ LIỆU",
        () => {
          window.isResetting = true;
          try {
            localStorage.removeItem("AHT_SAVE_DATA");
            localStorage.removeItem("AHT_SAVED_LOGS");
            localStorage.clear();
          } catch(e) {}
          window.location.reload();
        },
        null,
        "⚠️"
      );
    });
    document.getElementById('btn-setting-crt')?.addEventListener('click', (e) => {
      const crt = document.getElementById('crt-overlay');
      if (crt.classList.contains('scanlines')) {
        crt.classList.remove('scanlines');
        e.target.textContent = "Tắt";
      } else {
        crt.classList.add('scanlines');
        e.target.textContent = "Bật";
      }
    });

    // Offline Claim button
    document.getElementById('btn-claim-offline')?.addEventListener('click', () => {
      self.closeAllModals();
    });
  }

  openModal(modalId) {
    const backdrop = document.getElementById('modal-backdrop');
    if (!backdrop) return;
    
    // Hide all modals first
    document.querySelectorAll('.game-modal').forEach(m => m.classList.add('hidden'));

    const target = document.getElementById(modalId);
    if (target) {
      backdrop.classList.remove('hidden');
      target.classList.remove('hidden');
      this.activeModal = modalId;

      // Populate content dynamically based on modal
      if (modalId === 'modal-forge') this.populateForgeModal();
      if (modalId === 'modal-inn') this.populateInnModal();
      if (modalId === 'modal-tavern') this.populateTavernModal();
      if (modalId === 'modal-clinic') this.populateClinicModal();
      if (modalId === 'modal-trading') this.populateTradingModal();
      if (modalId === 'modal-bounty') this.populateBountyModal();
      if (modalId === 'modal-zone') this.populateZoneModal();
      if (modalId === 'modal-hunters') this.populateHuntersModal();
      if (modalId === 'modal-storage') this.populateStorageModal();
      if (modalId === 'modal-research') this.populateResearchModal();
      if (modalId === 'modal-hall') this.populateHallModal();
      if (modalId === 'modal-recruit') this.populateRecruitModal();
      if (modalId === 'modal-dungeon') this.renderDungeonTab();
    }
  }

  closeAllModals() {
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) backdrop.classList.add('hidden');
    document.querySelectorAll('.game-modal').forEach(m => m.classList.add('hidden'));
    this.activeModal = null;
  }

  // MODAL POPULATORS
  populateForgeModal() {
    const list = document.getElementById('forge-craft-list');
    if (!list) return;
    const cat = this.currentForgeCat || 'weapons';
    let html = "";

    if (cat === 'weapons') {
      CONFIG.RECIPES.weapons.forEach(r => {
        const matReq = Object.entries(r.materials).map(([m, c]) => {
          const has = window.gameState.storage[m] || 0;
          const color = has >= c ? '#39ff14' : '#ff3366';
          const mName = CONFIG.ITEMS[m] ? CONFIG.ITEMS[m].name : m;
          return `<span style="color:${color}">${c}x ${mName} (${has}/${c})</span>`;
        }).join(", ");

        const fee = r.craftFee || 10;
        const feeStr = CONFIG.formatNumber ? CONFIG.formatNumber(fee) : fee.toLocaleString();
        const costStr = CONFIG.formatNumber ? CONFIG.formatNumber(r.costGold) : r.costGold.toLocaleString();

        html += `
          <div class="item-card" style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; margin-bottom:8px;">
            <div class="item-info" style="flex:1;">
              <div class="item-name rarity-${r.rarity}" style="font-size:13px;">${r.icon} ${r.name}</div>
              <div class="item-stats" style="font-size:11px; margin-top:2px;">⚡ <b>+${r.atk}</b> Sát Thương | Yêu cầu: <b>Lv.${r.reqLvl}</b></div>
              <div class="item-cost" style="font-size:11px; margin-top:3px;">📦 Nguyên liệu trong kho: ${matReq}</div>
              <div style="font-size:11px; margin-top:2px; color:#b0bec5;">Phí chế tạo: 💰${feeStr} GOLD | Giá thợ săn tự mua: <b style="color:#ffd700;">💰${costStr} GOLD</b></div>
            </div>
            <div style="text-align:right; margin-left:10px;">
              <span style="font-size:10px; font-weight:bold; color:#39ff14; background:rgba(57,255,20,0.1); padding:4px 8px; border-radius:4px; border:1px solid rgba(57,255,20,0.3);">🤖 TỰ ĐỘNG MUA</span>
            </div>
          </div>
        `;
      });
    } else if (cat === 'armors') {
      CONFIG.RECIPES.armors.forEach(r => {
        const matReq = Object.entries(r.materials).map(([m, c]) => {
          const has = window.gameState.storage[m] || 0;
          const color = has >= c ? '#39ff14' : '#ff3366';
          const mName = CONFIG.ITEMS[m] ? CONFIG.ITEMS[m].name : m;
          return `<span style="color:${color}">${c}x ${mName} (${has}/${c})</span>`;
        }).join(", ");

        const fee = r.craftFee || 8;
        const feeStr = CONFIG.formatNumber ? CONFIG.formatNumber(fee) : fee.toLocaleString();
        const costStr = CONFIG.formatNumber ? CONFIG.formatNumber(r.costGold) : r.costGold.toLocaleString();

        html += `
          <div class="item-card" style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; margin-bottom:8px;">
            <div class="item-info" style="flex:1;">
              <div class="item-name rarity-${r.rarity}" style="font-size:13px;">${r.icon} ${r.name}</div>
              <div class="item-stats" style="font-size:11px; margin-top:2px;">🛡️ <b>+${r.def}</b> DEF | ❤️ <b>+${r.hp}</b> Máu | Yêu cầu: <b>Lv.${r.reqLvl}</b></div>
              <div class="item-cost" style="font-size:11px; margin-top:3px;">📦 Nguyên liệu trong kho: ${matReq}</div>
              <div style="font-size:11px; margin-top:2px; color:#b0bec5;">Phí chế tạo: 💰${feeStr} GOLD | Giá thợ săn tự mua: <b style="color:#ffd700;">💰${costStr} GOLD</b></div>
            </div>
            <div style="text-align:right; margin-left:10px;">
              <span style="font-size:10px; font-weight:bold; color:#39ff14; background:rgba(57,255,20,0.1); padding:4px 8px; border-radius:4px; border:1px solid rgba(57,255,20,0.3);">🤖 TỰ ĐỘNG MUA</span>
            </div>
          </div>
        `;
      });
    } else if (cat === 'rings') {
      (CONFIG.RECIPES.rings || []).forEach(r => {
        const matReq = Object.entries(r.materials).map(([m, c]) => {
          const has = window.gameState.storage[m] || 0;
          const color = has >= c ? '#39ff14' : '#ff3366';
          const mName = CONFIG.ITEMS[m] ? CONFIG.ITEMS[m].name : m;
          return `<span style="color:${color}">${c}x ${mName} (${has}/${c})</span>`;
        }).join(", ");

        const fee = r.craftFee || 10;
        const feeStr = CONFIG.formatNumber ? CONFIG.formatNumber(fee) : fee.toLocaleString();
        const costStr = CONFIG.formatNumber ? CONFIG.formatNumber(r.costGold) : r.costGold.toLocaleString();

        html += `
          <div class="item-card" style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; margin-bottom:8px;">
            <div class="item-info" style="flex:1;">
              <div class="item-name rarity-${r.rarity}" style="font-size:13px;">${r.icon} ${r.name}</div>
              <div class="item-stats" style="font-size:11px; margin-top:2px;">⚡ <b>+${r.atk}</b> ATK | 💥 <b>+${r.crit}%</b> Crit | Yêu cầu: <b>Lv.${r.reqLvl}</b></div>
              <div class="item-cost" style="font-size:11px; margin-top:3px;">📦 Nguyên liệu trong kho: ${matReq}</div>
              <div style="font-size:11px; margin-top:2px; color:#b0bec5;">Phí chế tạo: 💰${feeStr} GOLD | Giá thợ săn tự mua: <b style="color:#ffd700;">💰${costStr} GOLD</b></div>
            </div>
            <div style="text-align:right; margin-left:10px;">
              <span style="font-size:10px; font-weight:bold; color:#39ff14; background:rgba(57,255,20,0.1); padding:4px 8px; border-radius:4px; border:1px solid rgba(57,255,20,0.3);">🤖 TỰ ĐỘNG MUA</span>
            </div>
          </div>
        `;
      });
    } else if (cat === 'amulets') {
      (CONFIG.RECIPES.amulets || []).forEach(r => {
        const matReq = Object.entries(r.materials).map(([m, c]) => {
          const has = window.gameState.storage[m] || 0;
          const color = has >= c ? '#39ff14' : '#ff3366';
          const mName = CONFIG.ITEMS[m] ? CONFIG.ITEMS[m].name : m;
          return `<span style="color:${color}">${c}x ${mName} (${has}/${c})</span>`;
        }).join(", ");

        const fee = r.craftFee || 10;
        const feeStr = CONFIG.formatNumber ? CONFIG.formatNumber(fee) : fee.toLocaleString();
        const costStr = CONFIG.formatNumber ? CONFIG.formatNumber(r.costGold) : r.costGold.toLocaleString();

        html += `
          <div class="item-card" style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; margin-bottom:8px;">
            <div class="item-info" style="flex:1;">
              <div class="item-name rarity-${r.rarity}" style="font-size:13px;">${r.icon} ${r.name}</div>
              <div class="item-stats" style="font-size:11px; margin-top:2px;">🛡️ <b>+${r.def}</b> DEF | ❤️ <b>+${r.hp}</b> HP | 💥 <b>+${r.critDmg}%</b> Sát Thương Chí Mạng | Yêu cầu: <b>Lv.${r.reqLvl}</b></div>
              <div class="item-cost" style="font-size:11px; margin-top:3px;">📦 Nguyên liệu trong kho: ${matReq}</div>
              <div style="font-size:11px; margin-top:2px; color:#b0bec5;">Phí chế tạo: 💰${feeStr} GOLD | Giá thợ săn tự mua: <b style="color:#ffd700;">💰${costStr} GOLD</b></div>
            </div>
            <div style="text-align:right; margin-left:10px;">
              <span style="font-size:10px; font-weight:bold; color:#39ff14; background:rgba(57,255,20,0.1); padding:4px 8px; border-radius:4px; border:1px solid rgba(57,255,20,0.3);">🤖 TỰ ĐỘNG MUA</span>
            </div>
          </div>
        `;
      });
    } else if (cat === 'talismans') {
      (CONFIG.RECIPES.talismans || []).forEach(r => {
        const matReq = Object.entries(r.materials).map(([m, c]) => {
          const has = window.gameState.storage[m] || 0;
          const color = has >= c ? '#39ff14' : '#ff3366';
          const mName = CONFIG.ITEMS[m] ? CONFIG.ITEMS[m].name : m;
          return `<span style="color:${color}">${c}x ${mName} (${has}/${c})</span>`;
        }).join(", ");

        const fee = r.craftFee || 10;
        const feeStr = CONFIG.formatNumber ? CONFIG.formatNumber(fee) : fee.toLocaleString();
        const costStr = CONFIG.formatNumber ? CONFIG.formatNumber(r.costGold) : r.costGold.toLocaleString();

        html += `
          <div class="item-card" style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; margin-bottom:8px;">
            <div class="item-info" style="flex:1;">
              <div class="item-name rarity-${r.rarity}" style="font-size:13px;">${r.icon} ${r.name}</div>
              <div class="item-stats" style="font-size:11px; margin-top:2px;">⚡ <b>+${r.atk}</b> ATK | 🎯 <b>+${r.critRate}%</b> Tỉ Lệ Chí Mạng | Yêu cầu: <b>Lv.${r.reqLvl}</b></div>
              <div class="item-cost" style="font-size:11px; margin-top:3px;">📦 Nguyên liệu trong kho: ${matReq}</div>
              <div style="font-size:11px; margin-top:2px; color:#b0bec5;">Phí chế tạo: 💰${feeStr} GOLD | Giá thợ săn tự mua: <b style="color:#ffd700;">💰${costStr} GOLD</b></div>
            </div>
            <div style="text-align:right; margin-left:10px;">
              <span style="font-size:10px; font-weight:bold; color:#39ff14; background:rgba(57,255,20,0.1); padding:4px 8px; border-radius:4px; border:1px solid rgba(57,255,20,0.3);">🤖 TỰ ĐỘNG MUA</span>
            </div>
          </div>
        `;
      });
    }

    list.innerHTML = html;

    // Upgrade Button & Construction Status
    this.updateBuildingUpgradeButton('forge', 'btn-upgrade-forge');
  }

  populateInnModal() {
    const b = window.gameState.buildings.inn;
    const innLvl = b.level || 1;
    const innBeds = 3 + Math.floor(innLvl * 0.5);
    const rate = typeof Hunter !== 'undefined' && Hunter.getInnRecoveryRate ? Hunter.getInnRecoveryRate(innLvl) : (12 + (innLvl - 1) * 3);
    const minFee = 35 + 8 + (innLvl - 1) * 15; // Lv.1 Hunter min fee
    const guests = (window.gameState.hunters || []).filter(h => h.state === 'RESTING').length;

    const elBeds = document.getElementById('inn-beds');
    if (elBeds) elBeds.textContent = `${guests} / ${innBeds} Giường`;
    const elSpeed = document.getElementById('inn-speed');
    if (elSpeed) elSpeed.textContent = `+${rate} Thể lực/giây`;
    const elGuests = document.getElementById('inn-active-guests');
    if (elGuests) elGuests.textContent = `${guests} Thợ săn đang ngủ`;
    const elRev = document.getElementById('inn-revenue');
    if (elRev) elRev.textContent = `💰${CONFIG.formatNumber(b.revenue || 0)}`;

    const descEl = document.querySelector('#modal-inn .modal-desc');
    if (descEl) {
      descEl.innerHTML = `Nơi thợ săn nghỉ ngơi hồi phục Thể Lực (<b>+${rate} Thể lực/giây</b>) cho đến khi đạt đủ 100%. Thu phí phòng nghỉ từ <b>💰${minFee}g/lượt</b> (Tăng theo cấp độ & phẩm cấp Thợ Săn).`;
    }
    this.updateBuildingUpgradeButton('inn', 'upgrade-box-inn');
  }

  populateTavernModal() {
    const list = document.getElementById('tavern-menu-list');
    if (!list) return;
    let html = `
      <div class="item-card" style="background:#131f17; border-color:#2e593a; margin-bottom:6px;">
        <div class="item-info">
          <div class="item-name" style="color:#39ff14;">⚡ CHẾ ĐỘ BẾP TRƯỞNG TỰ ĐỘNG: [ĐANG BẬT]</div>
          <div style="font-size:11px; color:#d0f0c0;">
            Khi thợ săn đói (Hunger &lt; 30%), Quán Ăn sẽ <b>tự động chọn món cao cấp nhất</b> có đủ nguyên liệu để nấu, phục vụ thợ săn và thu tiền vàng về Ngân Khố!
          </div>
        </div>
      </div>
    `;

    CONFIG.FOODS.forEach(f => {
      const matReq = Object.entries(f.materials).map(([m, c]) => {
        const has = window.gameState.storage[m] || 0;
        const color = has >= c ? '#39ff14' : '#ff3366';
        const mName = CONFIG.ITEMS[m] ? CONFIG.ITEMS[m].name : m;
        return `<span style="color:${color}">${c}x ${mName} (${has}/${c})</span>`;
      }).join(", ");

      const fee = f.craftFee || Math.floor(f.costGold * 0.3);
      html += `
        <div class="item-card">
          <div class="item-info">
            <div class="item-name">${f.icon} ${f.name}</div>
            <div class="item-stats">🍖 Hồi ${f.hungerRestore}% Đói | Buff: +${f.buffAtk} ATK</div>
            <div class="item-cost">Cần: ${matReq} | Phí: 💰${fee}g | Bán: <b style="color:#ffd700">💰${f.costGold}g</b></div>
          </div>
          <button class="btn-primary btn-xs" onclick="EconomySystem.cookFood('${f.id}')">Nấu (💰${fee}g)</button>
        </div>
      `;
    });
    list.innerHTML = html;
    this.updateBuildingUpgradeButton('tavern', 'btn-upgrade-tavern');
  }

  populateClinicModal() {
    const list = document.getElementById('clinic-potion-list');
    if (!list) return;
    let html = `
      <div class="item-card" style="background:#1f1318; border-color:#592233; margin-bottom:6px;">
        <div class="item-info">
          <div class="item-name" style="color:#ff66aa;">⚡ CHẾ ĐỘ CẤP CỨU & BÀO CHẾ TỰ ĐỘNG: [ĐANG BẬT]</div>
          <div style="font-size:11px; color:#ffd0e0;">
            Khi thợ săn bị thương hoặc tử trận, Bác sĩ sẽ <b>tự động lấy nguyên liệu bào chế loại Tiên Dược hoặc Bùa Hồi Sinh</b> phù hợp nhất với Level để cứu mạng thợ săn!
          </div>
        </div>
      </div>
    `;

    CONFIG.POTIONS.forEach(p => {
      const matReq = Object.entries(p.materials).map(([m, c]) => {
        const has = window.gameState.storage[m] || 0;
        const color = has >= c ? '#39ff14' : '#ff3366';
        const mName = CONFIG.ITEMS[m] ? CONFIG.ITEMS[m].name : m;
        return `<span style="color:${color}">${c}x ${mName} (${has}/${c})</span>`;
      }).join(", ");

      const fee = p.craftFee || Math.floor(p.costGold * 0.35);
      html += `
        <div class="item-card">
          <div class="item-info">
            <div class="item-name">${p.icon} ${p.name}</div>
            <div class="item-stats">❤️ Hồi ${p.healHp >= 9999 ? 'HỒI SINH ĐẦY MÁU' : `+${p.healHp} HP`} | Yêu cầu: Lv.${p.reqLvl}</div>
            <div class="item-cost">Cần: ${matReq} | Phí: 💰${fee}g | Bán: <b style="color:#ffd700">💰${p.costGold}g</b></div>
          </div>
          <button class="btn-primary btn-xs" onclick="EconomySystem.brewPotion('${p.id}')">Bào Chế (💰${fee}g)</button>
        </div>
      `;
    });
    list.innerHTML = html;
    this.updateBuildingUpgradeButton('clinic', 'btn-upgrade-clinic');
  }

  updateBuildingUpgradeButton(bKey, targetId) {
    const b = window.gameState.buildings[bKey];
    let box = document.getElementById(targetId) || document.getElementById(`upgrade-box-${bKey}`);
    if (!box) {
      const modal = document.getElementById(`modal-${bKey}`);
      box = modal ? modal.querySelector('.building-upgrade-box') : null;
    }
    if (!box || !b) return;

    // Also update level in modal header if present
    const modal = document.getElementById(`modal-${bKey}`);
    if (modal) {
      const lvlSpan = modal.querySelector('.b-lvl');
      if (lvlSpan) {
        lvlSpan.textContent = b.isUpgrading ? `${b.level} ➔ ${b.targetLevel || (b.level + 1)}` : b.level;
      }
    }

    if (b.isUpgrading) {
      const secs = Math.max(0, Math.ceil(b.upgradeTimeLeft));
      const totalSecs = Math.max(1, b.upgradeTotalTime || secs || 1);
      const pct = Math.max(0, Math.min(100, Math.round(((totalSecs - b.upgradeTimeLeft) / totalSecs) * 100)));
      const gemCost = Math.max(1, Math.ceil(secs / 30));
      const formattedTime = Building.formatTime(secs);

      const existingCard = box.querySelector('.construction-hud-card');
      if (existingCard) {
        const timerBadge = existingCard.querySelector('.hud-timer-badge');
        if (timerBadge && timerBadge.textContent !== `⏱️ ${formattedTime}`) {
          timerBadge.textContent = `⏱️ ${formattedTime}`;
        }
        const fill = existingCard.querySelector('.construction-progress-bar-fill');
        if (fill) fill.style.width = `${pct}%`;
        const progText = existingCard.querySelector('.construction-progress-text');
        if (progText && progText.textContent !== `${pct}% (${formattedTime})`) {
          progText.textContent = `${pct}% (${formattedTime})`;
        }
        const gemBtn = existingCard.querySelector('.btn-instant-complete');
        if (gemBtn) {
          gemBtn.innerHTML = `<span class="bolt">⚡</span> Hoàn Thành Siêu Tốc Ngay (💎 <b>${gemCost}</b> Ngọc)`;
        }
        return;
      }

      box.innerHTML = `
        <div class="construction-hud-card">
          <div class="construction-hud-header">
            <div class="hud-status-left">
              <span class="hud-hammer-anim">🔨</span>
              <div>
                <div class="hud-title">ĐANG THI CÔNG NÂNG CẤP: CẤP ${b.targetLevel || (b.level + 1)}</div>
                <div class="hud-sub">Đội thợ đang tích cực xây dựng & hoàn thiện...</div>
              </div>
            </div>
            <div class="hud-timer-badge">⏱️ ${formattedTime}</div>
          </div>
          
          <div class="construction-progress-bar-wrap">
            <div class="construction-progress-bar-fill" style="width: ${pct}%"></div>
            <div class="construction-progress-bar-glow"></div>
            <span class="construction-progress-text">${pct}% (${formattedTime})</span>
          </div>

          <div class="construction-perk-box">
            <span class="perk-icon">✨</span>
            <span class="perk-text">${b.targetDesc || 'Gia tăng hiệu quả và mở khóa tính năng mới'}</span>
          </div>

          <button class="btn-instant-complete btn-block" onclick="Building.instantFinish('${bKey}')">
            <span class="bolt">⚡</span> Hoàn Thành Siêu Tốc Ngay (💎 <b>${gemCost}</b> Ngọc)
          </button>
        </div>
      `;
      return;
    }

    const existingCard = box.querySelector('.construction-hud-card');
    if (existingCard) {
      box.innerHTML = '';
    }

    const nextUp = Building.getUpgradeData(bKey, b.level + 1);
    if (nextUp) {
      const isLocked = nextUp.level > window.gameState.townLevel;
      const matEntries = Object.entries(nextUp.materials);
      let canAfford = window.gameState.gold >= nextUp.gold;
      
      const matHtml = matEntries.map(([m, c]) => {
        const has = window.gameState.storage[m] || 0;
        const ok = has >= c;
        if (!ok) canAfford = false;
        const color = ok ? '#39ff14' : '#ff5577';
        const mName = CONFIG.ITEMS[m]?.name || m;
        return `<span class="mat-req-tag" style="border-color:${color}; color:${color};">${CONFIG.ITEMS[m]?.icon || '📦'} ${c}x ${mName} (${has}/${c})</span>`;
      }).join(' ');

      const timeTxt = Building.formatTime(nextUp.timeSec);
      const goldOk = window.gameState.gold >= nextUp.gold;

      box.innerHTML = `
        <div class="upgrade-preview-card ${isLocked ? 'locked' : ''}">
          <div class="up-header">
            <div class="up-title">
              ${isLocked ? '🔒' : '⬆️'} NÂNG CẤP LÊN CẤP ${nextUp.level}
            </div>
            <div class="up-time">⏱️ Thời gian thi công: <b>${timeTxt}</b></div>
          </div>
          <div class="up-perk">
            <span class="up-perk-icon">🎯</span>
            <span>${nextUp.desc || 'Tăng cường hiệu năng công trình'}</span>
          </div>
          <div class="up-cost-row">
            <div class="up-gold" style="color: ${goldOk ? '#ffd700' : '#ff5577'}">
              💰 Chi phí: <b>${CONFIG.formatNumber(nextUp.gold)} GOLD</b> (Có: 💰${CONFIG.formatNumber(window.gameState.gold)})
            </div>
            <div class="up-materials">
              ${matHtml}
            </div>
          </div>
          ${isLocked ? `
            <div class="lock-notice">
              ⚠️ Yêu cầu Tòa Thị Chính đạt Cấp ${nextUp.level} (Hiện tại: Cấp ${window.gameState.townLevel})
            </div>
            <button class="btn-secondary btn-block" disabled>🔒 ĐÃ KHÓA (CẦN THỊ CHÍNH CẤP ${nextUp.level})</button>
          ` : `
            <button class="btn-primary btn-block ${canAfford ? 'btn-ready-pulse' : ''}" onclick="Building.startUpgrade('${bKey}')" ${canAfford ? '' : 'style="opacity:0.85;"'}>
              🚀 BẮT ĐẦU NÂNG CẤP LÊN CẤP ${nextUp.level} (⏱️ ${timeTxt})
            </button>
          `}
        </div>
      `;
    } else {
      box.innerHTML = `
        <div class="upgrade-max-card">
          👑 CÔNG TRÌNH ĐÃ ĐẠT CẤP TỐI ĐA (CẤP ${Building.MAX_LEVEL})
        </div>
      `;
    }
  }

  populateTradingModal() {
    const list = document.getElementById('trading-loot-table');
    if (!list) return;
    let html = "";
    Object.values(CONFIG.ITEMS).forEach(item => {
      const count = window.gameState.storage[item.id] || 0;
      html += `
        <div class="item-card">
          <div class="item-info">
            <div class="item-name">${item.icon} ${item.name}</div>
            <div class="item-stats">Giá niêm yết thu mua: 💰 ${item.basePrice}g</div>
          </div>
          <div>Trong kho: <b>${count}</b></div>
        </div>
      `;
    });
    list.innerHTML = html;
  }

  populateBountyModal() {
    const list = document.getElementById('bounty-quest-list');
    if (!list) return;

    const questTab = this.currentQuestTab || 'bounties';

    let html = `
      <div class="tabs-sub" style="margin-bottom:8px;">
        <button class="sub-tab ${questTab === 'bounties' ? 'active' : ''}" onclick="window.app.setQuestTab('bounties')">📜 Treo Thưởng (Hàng Ngày)</button>
        <button class="sub-tab ${questTab === 'achievements' ? 'active' : ''}" onclick="window.app.setQuestTab('achievements')">🏆 Thành Tựu Danh Vọng (💎)</button>
      </div>
    `;

    if (questTab === 'bounties') {
      const townLvl = window.gameState.townLevel || 1;
      const goldMul = 1 + (townLvl - 1) * 0.40;
      const gemsMul = 1 + Math.floor((townLvl - 1) / 2);

      html += `
        <div style="background:linear-gradient(90deg, rgba(0,229,255,0.12), rgba(0,0,0,0.4)); border:1px solid rgba(0,229,255,0.3); border-radius:5px; padding:6px 10px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; font-size:11px;">
          <span>🏰 <b>Thị Chính Cấp ${townLvl}</b>:</span>
          <span style="color:#ffd700; font-weight:bold;">Thưởng: +${Math.round((goldMul - 1) * 100)}% Vàng | x${gemsMul} Ngọc Triệu Hồi</span>
        </div>
        <div style="font-size:11px; color:var(--text-muted); margin-bottom:6px;">
          Hoàn thành nhiệm vụ săn quái và thu thập để nhận <b>Vàng 💰 và Ngọc Triệu Hồi 💠</b>:
        </div>
      `;

      window.gameState.bounties.forEach((b, idx) => {
        const isDone = b.current >= b.count;
        const pct = Math.min(100, Math.round((b.current / b.count) * 100));

        html += `
          <div class="item-card" style="${isDone ? 'border-color:#ffd700; background:rgba(255,215,0,0.06);' : ''}">
            <div class="item-info" style="flex:1;">
              <div style="font-weight:bold; font-size:12px; color:${isDone ? '#ffd700' : '#ffffff'};">
                ${isDone ? '✨ ' : '📜 '}${b.title}
              </div>
              <div class="bar-track" style="width:100%; height:5px; margin:3px 0;">
                <div class="bar-fill exp" style="width:${pct}%;"></div>
              </div>
              <div style="font-size:10px; color:var(--text-muted);">
                Tiến độ: <b style="color:${isDone ? '#39ff14' : '#00e5ff'};">${b.current}/${b.count}</b> | Thưởng: 💰+${CONFIG.formatNumber(b.rewardGold)} | <b style="color:#00e5ff;">💠+${CONFIG.formatNumber(b.rewardGems)}</b>
              </div>
            </div>
            <button class="${isDone ? 'btn-primary' : 'btn-secondary'} btn-xs" ${isDone ? '' : 'disabled'} onclick="window.app.claimBounty(${idx})">
              ${isDone ? '🎁 Nhận Quà' : 'Đang Làm'}
            </button>
          </div>
        `;
      });
    } else if (questTab === 'achievements') {
      html += `
        <div style="font-size:11px; color:var(--text-muted); margin-bottom:6px;">
          Thành tựu trọn đời của Thị Trưởng — Nhận một lượng lớn <b>Kim Cương 💎</b>:
        </div>
      `;

      CONFIG.ACHIEVEMENTS.forEach(ach => {
        let currentVal = 0;
        if (ach.type === 'kills') currentVal = window.gameState.stats?.monstersKilled || 0;
        else if (ach.type === 'crafts') currentVal = window.gameState.stats?.itemsCrafted || 0;
        else if (ach.type === 'townLvl') currentVal = window.gameState.townLevel || 1;
        else if (ach.type === 'dungeonFloor') currentVal = window.gameState.dungeonMaxFloor || 0;
        else if (ach.type === 'breakthroughStar') {
          currentVal = (window.gameState.hunters || []).length > 0 ? Math.max(0, ...(window.gameState.hunters || []).map(h => h.reincarnation || 0)) : 0;
        }
        else if (ach.type === 'totalPower') {
          currentVal = (window.gameState.hunters || []).reduce((s, h) => s + (h.getCombatPower ? h.getCombatPower() : 0), 0);
        }
        else if (ach.type === 'goldEarned') currentVal = window.gameState.gold || 0;
        else if (ach.type === 'techCount') currentVal = Object.keys(window.gameState.researched || {}).length;

        const isClaimed = window.gameState.claimedAchievements?.[ach.id];
        const isCompleted = currentVal >= ach.target;
        const pct = Math.min(100, Math.round((currentVal / ach.target) * 100));

        const curStr = CONFIG.formatNumber ? CONFIG.formatNumber(Math.min(currentVal, ach.target)) : Math.min(currentVal, ach.target);
        const tgtStr = CONFIG.formatNumber ? CONFIG.formatNumber(ach.target) : ach.target;

        html += `
          <div class="item-card" style="${isClaimed ? 'opacity:0.6;' : (isCompleted ? 'border-color:#39ff14; background:rgba(57,255,20,0.06);' : '')}">
            <div class="item-info" style="flex:1;">
              <div style="font-weight:bold; font-size:12px; color:${isClaimed ? '#6b8c70' : '#ffd700'};">
                ${isClaimed ? '✔ ' : '🏆 '}${ach.title}
              </div>
              <div style="font-size:11px; color:var(--text-main);">${ach.desc}</div>
              <div style="font-size:10px; color:var(--text-muted);">
                Tiến độ: ${curStr}/${tgtStr} (${pct}%) | Thưởng: <b style="color:#00e5ff;">💠+${ach.rewardGems} Ngọc Triệu Hồi</b>
              </div>
            </div>
            <button class="btn-primary btn-xs" ${isCompleted && !isClaimed ? '' : 'disabled'} onclick="window.app.claimAchievement('${ach.id}', ${ach.rewardGems})">
              ${isClaimed ? 'ĐÃ NHẬN' : (isCompleted ? '🎁 Nhận 💠' : 'Chưa Xong')}
            </button>
          </div>
        `;
      });
    }

    list.innerHTML = html;
  }

  setQuestTab(tabKey) {
    this.currentQuestTab = tabKey;
    this.populateBountyModal();
  }

  generateScaledBounty(tmpl, townLvl = 1) {
    const lvl = Math.max(1, townLvl);
    // Gold increases by +40% per Town Hall level (Lv.1 = x1.0, Lv.2 = x1.4, Lv.3 = x1.8, ..., Lv.10 = x4.6)
    const goldMul = 1 + (lvl - 1) * 0.40;
    // Gems increase by +1x every 2 Town Hall levels (Lv.1-2 = x1, Lv.3-4 = x2, Lv.5-6 = x3, Lv.7-8 = x4, Lv.9-10 = x5)
    const gemsMul = 1 + Math.floor((lvl - 1) / 2);

    const rewardGold = Math.round((tmpl.rewardGold * goldMul) / 10) * 10;
    const rewardGems = Math.max(1, Math.floor(tmpl.rewardGems * gemsMul));

    return {
      id: "b_" + Math.random().toString(36).substr(2, 6),
      type: tmpl.type,
      target: tmpl.target,
      title: tmpl.title,
      count: tmpl.reqCount,
      current: 0,
      rewardGold: rewardGold,
      rewardGems: rewardGems,
      completed: false
    };
  }

  claimBounty(idx) {
    const b = window.gameState.bounties[idx];
    if (!b || b.current < b.count) return;

    window.gameState.addGold(b.rewardGold);
    window.gameState.gems += b.rewardGems;
    window.logTicker.add(`🎁 [NHẬN THƯỞNG QUEST]: [${b.title}] hoàn thành! (💰+${CONFIG.formatNumber(b.rewardGold)}, +${CONFIG.formatNumber(b.rewardGems)} 💠 Ngọc Triệu Hồi)`, 'loot');
    if (window.soundFX) window.soundFX.playLevelUp();

    // Replace with a new random quest template scaled by Town Level
    const tmpl = CONFIG.QUEST_TEMPLATES[Math.floor(Math.random() * CONFIG.QUEST_TEMPLATES.length)];
    window.gameState.bounties[idx] = this.generateScaledBounty(tmpl, window.gameState.townLevel || 1);

    this.populateBountyModal();
  }

  claimAchievement(achId, gems) {
    if (window.gameState.claimedAchievements[achId]) return;
    window.gameState.claimedAchievements[achId] = true;
    window.gameState.gems += gems;
    window.logTicker.add(`👑 [THÀNH TỰU ĐẠT ĐƯỢC]: Nhận ngay +${gems} 💎 Kim Cương Thần Bí!`, 'loot');
    if (window.soundFX) window.soundFX.playLevelUp();
    this.populateBountyModal();
  }

  refreshBounties() {
    if (window.gameState.gems < 1) {
      alert("Cần 💎1 Kim Cương để làm mới danh sách nhiệm vụ!");
      return;
    }
    window.gameState.gems -= 1;
    window.gameState.bounties = [];
    for (let i = 0; i < 3; i++) {
      const tmpl = CONFIG.QUEST_TEMPLATES[Math.floor(Math.random() * CONFIG.QUEST_TEMPLATES.length)];
      window.gameState.bounties.push({
        id: "b_" + Math.random().toString(36).substr(2, 6),
        type: tmpl.type,
        target: tmpl.target,
        title: tmpl.title,
        count: tmpl.reqCount,
        current: 0,
        rewardGold: tmpl.rewardGold,
        rewardGems: tmpl.rewardGems,
        completed: false
      });
    }
    window.logTicker.add("📜 Đã làm mới toàn bộ Bảng Nhiệm Vụ Treo Thưởng!", "system");
    this.populateBountyModal();
  }

  populateZoneModal() {
    const list = document.getElementById('zone-list');
    if (!list) return;
    const currentDiff = CONFIG.DIFFICULTIES.find(d => d.id === window.gameState.currentDifficulty) || CONFIG.DIFFICULTIES[0];
    const diffMul = currentDiff.hpMul || 1.0;
    const townPower = (window.gameState.hunters || []).reduce((s, h) => s + (h.getCombatPower ? h.getCombatPower() : 0), 0);
    const townStr = CONFIG.formatNumber ? CONFIG.formatNumber(townPower) : townPower.toLocaleString();
    const hunterCount = window.gameState.hunters ? window.gameState.hunters.length : 0;

    let html = `
      <div style="margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <span style="font-weight:bold; font-size:12px; color:var(--accent-cyan);">⚡ CHỌN ĐỘ KHÓ VÙNG SĂN:</span>
          <span style="font-size:11px; color:#ffd700;">👑 Lực Chiến Toàn Thị Trấn (${hunterCount} Thợ Săn): <b>${townStr} CP</b></span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:6px;">
    `;

    // Render Difficulties with scaled CP requirements
    CONFIG.DIFFICULTIES.forEach(d => {
      const isSelected = d.id === window.gameState.currentDifficulty;
      html += `
        <button class="btn-secondary" style="border-color:${isSelected ? d.color : 'var(--border-color)'}; background:${isSelected ? 'rgba(255,255,255,0.08)' : 'var(--bg-primary)'}; padding:6px 8px; text-align:left; position:relative;" onclick="window.app.selectDifficulty('${d.id}')">
          <div style="color:${d.color}; font-weight:bold; font-size:11px; display:flex; justify-content:space-between;">
            <span>${isSelected ? '● ' : '○ '}${d.name}</span>
            <span style="font-size:10px; color:${d.color};">x${d.hpMul} CP</span>
          </div>
          <div style="font-size:9px; color:var(--text-muted); margin-top:2px;">${d.desc}</div>
        </button>
      `;
    });

    html += `
        </div>
      </div>
      <div style="background:rgba(255,215,0,0.08); border:1px solid rgba(255,215,0,0.3); border-radius:6px; padding:6px 10px; margin-bottom:8px; font-size:11px; display:flex; justify-content:space-between; align-items:center;">
        <span>👑 <b>Quái Tinh Anh Hoàng Kim</b>:</span>
        <span style="color:#ffd700;">8% Tỉ lệ xuất hiện, rơi <b>x5 Vàng</b> & <b>+1~2 💠 Ngọc</b></span>
      </div>
      <div style="font-weight:bold; font-size:12px; color:var(--accent-green); margin-bottom:4px;">🗺️ DANH SÁCH BÃI SĂN (YÊU CẦU LỰC CHIẾN TOÀN THỊ TRẤN):</div>
    `;

    // Render Zones with difficulty-scaled recommended CP for the whole town
    CONFIG.ZONES.forEach(z => {
      const isCurrent = z.id === window.gameState.currentZoneId;
      const isLocked = window.gameState.townLevel < z.reqTownLvl;
      const monsterNames = z.monsters.map(m => m.name).join(', ');
      const baseReqPower = z.reqPower || 500;
      const effectiveReqPower = Math.floor(baseReqPower * diffMul);
      const isSafe = townPower >= effectiveReqPower;
      const reqStr = CONFIG.formatNumber ? CONFIG.formatNumber(effectiveReqPower) : effectiveReqPower.toLocaleString();

      // Drops HTML tags
      const dropsHtml = (z.drops || []).map(matId => {
        const it = CONFIG.ITEMS[matId] || { name: matId, icon: "📦" };
        return `<span style="background:rgba(0,0,0,0.35); border:1px solid #334455; padding:1px 5px; border-radius:3px; font-size:10px; margin-right:4px;">${it.icon} ${it.name}</span>`;
      }).join('');

      html += `
        <div class="item-card ${isCurrent ? 'can-craft' : ''}" style="margin-bottom:8px; padding:8px 10px;">
          <div class="item-info" style="flex:1;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div class="item-name" style="color: ${isCurrent ? '#39ff14' : '#ffffff'}; font-size:12px; font-weight:bold;">${z.icon} ${z.name}</div>
              <span style="font-size:10px; color:${isSafe ? '#39ff14' : '#ff5577'}; font-weight:bold; background:rgba(0,0,0,0.4); padding:2px 6px; border-radius:4px; border:1px solid ${isSafe ? '#39ff14' : '#ff5577'};">
                ⚔️ Đề xuất Thị Trấn (${currentDiff.name.split(' ')[0]}): ${reqStr} CP ${isSafe ? '🟢 Đủ Lực' : '⚠️ Thiếu CP'}
              </span>
            </div>
            <div class="item-cost" style="margin:2px 0;">${z.desc}</div>
            <div class="item-stats" style="font-size:10px; color:var(--text-muted); margin-bottom:3px;">👾 Quái: ${monsterNames}</div>
            <div style="font-size:10px; display:flex; flex-wrap:wrap; align-items:center; margin-top:2px;">
              <span style="color:#ffd700; font-size:10px; margin-right:4px;">🎁 Rơi đồ:</span> ${dropsHtml}
            </div>
            <div class="item-stats" style="color:${isLocked ? '#ff9999' : '#00e5ff'}; font-size:10px; margin-top:2px;">
              Yêu cầu Thị Trấn: Cấp ${z.reqTownLvl} (Hiện tại: Cấp ${window.gameState.townLevel})
            </div>
          </div>
          <button class="btn-primary" ${isLocked ? 'disabled' : ''} style="margin-left:8px; min-width:80px;" onclick="window.app.selectZone('${z.id}')">
            ${isLocked ? '🔒 Khóa' : (isCurrent ? '✅ Đang Săn' : 'Xuất Quân')}
          </button>
        </div>
      `;
    });
    list.innerHTML = html;
  }

  selectDifficulty(diffId) {
    window.gameState.currentDifficulty = diffId;
    this.spawnMonstersForZone(window.gameState.currentZoneId);
    const d = CONFIG.DIFFICULTIES.find(x => x.id === diffId);
    window.logTicker.add(`⚡ Đã chuyển độ khó vùng săn sang [${d.name}]!`, 'system');
    this.populateZoneModal();
  }

  selectZone(zoneId) {
    const z = CONFIG.ZONES.find(x => x.id === zoneId);
    const d = CONFIG.DIFFICULTIES.find(x => x.id === window.gameState.currentDifficulty);
    const diffMul = d?.hpMul || 1.0;
    const effectiveReqPower = Math.floor((z?.reqPower || 500) * diffMul);
    const townPower = (window.gameState.hunters || []).reduce((s, h) => s + (h.getCombatPower ? h.getCombatPower() : 0), 0);

    if (townPower < effectiveReqPower) {
      const confirmMsg = `⚠️ CẢNH BÁO NGUY HIỂM:\nLực Chiến Toàn Thị Trấn (${CONFIG.formatNumber ? CONFIG.formatNumber(townPower) : townPower} CP) chưa đạt mức Đề Xuất (${CONFIG.formatNumber ? CONFIG.formatNumber(effectiveReqPower) : effectiveReqPower} CP) của [${z?.name}] (${d?.name})!\n\nThợ săn có nguy cơ tử trận liên tục. Bạn có chắc chắn muốn Xuất Quân?`;
      if (!confirm(confirmMsg)) return;
    }

    window.gameState.currentZoneId = zoneId;
    this.spawnMonstersForZone(zoneId);
    document.getElementById('txt-current-zone').textContent = `🗺️ ${z.icon} [${z.name}] (${d.name})`;
    window.logTicker.add(`🗺️ Đã chuyển toàn bộ thợ săn sang bãi săn [${z.name}]!`, 'system');
    this.closeAllModals();
  }

  populateHuntersModal() {
    const list = document.getElementById('hunters-full-list');
    if (!list) return;
    let html = "";
    if (window.gameState.hunters.length === 0) {
      list.innerHTML = `<div style="color:var(--text-muted); text-align:center; padding:15px;">Thị trấn chưa có thợ săn nào! Hãy chiêu mộ từ Đài Triệu Hồi.</div>`;
      return;
    }

    const totalTownPower = window.gameState.hunters.reduce((s, h) => s + (h.getCombatPower ? h.getCombatPower() : 0), 0);
    html += `
      <div style="background:linear-gradient(90deg, rgba(255,170,0,0.15), rgba(0,0,0,0.4)); border:1px solid rgba(255,170,0,0.3); border-radius:6px; padding:8px 12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
        <span style="color:#ffaa00; font-weight:bold; font-size:12px;">⚔️ TỔNG LỰC CHIẾN THỊ TRẤN:</span>
        <b style="color:#ffd700; font-size:14px; text-shadow:0 0 8px rgba(255,215,0,0.5);">${CONFIG.formatNumber(totalTownPower)} CP</b>
      </div>
    `;

    // Sort hunters by combat power descending
    const sortedHunters = [...window.gameState.hunters].sort((a, b) => (b.getCombatPower ? b.getCombatPower() : 0) - (a.getCombatPower ? a.getCombatPower() : 0));

    sortedHunters.forEach(h => {
      const rank = CONFIG.HUNTER_RANKS[h.rankKey];
      const cls = CONFIG.HUNTER_CLASSES[h.classKey];
      const starTxt = h.reincarnation > 0 ? `<span style="color:#ffd700;">${'⭐'.repeat(h.reincarnation)}</span> ` : '';
      const cp = h.getCombatPower ? h.getCombatPower() : 0;
      const cpStr = CONFIG.formatNumber(cp);

      html += `
        <div class="item-card" style="align-items:center; gap:8px;">
          <div class="item-info" onclick="window.app.openHunterDetail('${h.id}')" style="cursor:pointer; flex:1;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div class="item-name" style="color:${rank.color};">${cls.icon} ${starTxt}${h.name} [Lv.${h.level}] (${rank.name})</div>
              <span style="color:#ffaa00; font-weight:bold; font-size:11px; background:rgba(255,170,0,0.15); padding:2px 6px; border-radius:3px; border:1px solid rgba(255,170,0,0.3);" title="Lực Chiến: ${CONFIG.formatNumber(cp)} CP">⚔️ ${cpStr} CP</span>
            </div>
            <div class="item-stats">❤️ ${CONFIG.formatNumber(Math.round(h.hp))}/${CONFIG.formatNumber(h.maxHp)} | ⚡ ATK: ${CONFIG.formatNumber(h.getTotalAtk())} | 🛡️ DEF: ${CONFIG.formatNumber(h.getTotalDef())}</div>
            <div class="item-cost">
              Trang bị: 
              <span style="color:${h.weapon ? '#39ff14' : 'var(--text-muted)'};">${h.weapon ? `${h.weapon.icon} +${h.weaponPlus || 0}` : '🗡️ Trống'}</span> | 
              <span style="color:${h.armor ? '#39ff14' : 'var(--text-muted)'};">${h.armor ? `${h.armor.icon} +${h.armorPlus || 0}` : '🦺 Trống'}</span> | 
              <span style="color:${h.ring ? '#39ff14' : 'var(--text-muted)'};">${h.ring ? `${h.ring.icon} +${h.ringPlus || 0}` : '💍 Trống'}</span> | 
              <span style="color:${h.amulet ? '#39ff14' : 'var(--text-muted)'};">${h.amulet ? `${h.amulet.icon} +${h.amuletPlus || 0}` : '📿 Trống'}</span> | 
              <span style="color:${h.talisman ? '#39ff14' : 'var(--text-muted)'};">${h.talisman ? `${h.talisman.icon} +${h.talismanPlus || 0}` : '🔮 Trống'}</span>
            </div>
            <div class="item-cost" style="font-size:10px; color:var(--text-muted);">Đặc tính: ${h.trait.icon} ${h.trait.name} | Trạng thái: ${h.activityLog}</div>
          </div>
          <div style="display:flex; flex-direction:column; gap:4px;">
            <button class="btn-secondary btn-xs" onclick="window.app.openHunterDetail('${h.id}')">Chi Tiết 🔍</button>
            <button class="btn-danger btn-xs" onclick="window.app.dismissHunter('${h.id}')">Trục Xuất 🚪</button>
          </div>
        </div>
      `;
    });
    list.innerHTML = html;
  }

  populateStorageModal() {
    const list = document.getElementById('storage-item-grid');
    if (!list) return;

    const count = window.gameState.getStorageCount();
    const max = window.gameState.recalculateMaxStorage ? window.gameState.recalculateMaxStorage() : window.gameState.maxStorage;
    const pct = Math.min(100, Math.round((count / max) * 100));

    const isAutoOn = window.gameState.autoSellStorage !== false;
    const expTimes = window.gameState.storageExpansions || 0;
    const expCost = window.gameState.getStorageExpansionCost();
    const canAffordExp = window.gameState.gold >= expCost;

    let baseStorage = 60;
    if (window.gameState.townLevel > 1 && typeof Building !== 'undefined' && Building.getTownUpgradeData) {
      const td = Building.getTownUpgradeData(window.gameState.townLevel);
      if (td && td.storage) baseStorage = td.storage;
    }
    const manualBonus = expTimes * 30;
    const techBonus = (window.gameState.researched?.['tech_storage_expand'] ? 60 : 0) + (window.gameState.researched?.['tech_storage_expand_2'] ? 120 : 0);

    let html = `
      <div class="item-card" style="background:#131c26; border-color:#2a3f55; flex-direction:column; gap:6px; margin-bottom:6px;">
        <div style="display:flex; justify-content:space-between; width:100%; font-size:11px;">
          <span>📦 <b>TỔNG SỨC CHỨA KHO ĐỒ:</b></span>
          <span style="color:${pct > 85 ? '#ff3366' : '#39ff14'}; font-weight:bold;">${count} / ${max} Món (${pct}%)</span>
        </div>
        <div class="bar-track" style="width:100%; height:6px;">
          <div class="bar-fill exp" style="width:${pct}%; background:${pct > 85 ? '#ff3366' : '#00e5ff'};"></div>
        </div>
        <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:4px; width:100%; font-size:10px; color:var(--text-muted); background:rgba(0,0,0,0.25); padding:4px 6px; border-radius:3px;">
          <span>🏛️ Thị Chính Lv.${window.gameState.townLevel}: <b>${baseStorage}</b></span>
          <span>📦 Đã mở (${expTimes}x): <b style="color:#ffd700">+${manualBonus}</b></span>
          ${techBonus > 0 ? `<span>💡 Nghiên cứu: <b style="color:#00e5ff">+${techBonus}</b></span>` : ''}
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%; font-size:10px; margin-top:2px;">
          <span style="color:var(--text-muted);">Tự Động Xuất Khẩu khi kho đầy ≥90%:</span>
          <button class="btn-xs ${isAutoOn ? 'btn-primary' : 'btn-secondary'}" onclick="window.app.toggleAutoSellStorage()">
            ${isAutoOn ? '🟢 ĐANG BẬT' : '🔴 ĐÃ TẮT'}
          </button>
        </div>
        <div style="display:flex; gap:6px; width:100%; margin-top:4px;">
          <button class="btn-secondary btn-xs" style="flex:1;" onclick="window.app.expandStorage()">
            Mở Rộng Thêm (+30 ô: <b style="color:${canAffordExp ? '#ffd700' : '#ff5577'}">💰${CONFIG.formatNumber(expCost)}</b>)
          </button>
          <button class="btn-danger btn-xs" style="flex:1;" onclick="window.app.sellExcessLoot()">🚢 Xuất Khẩu 50% Cho Thương Đội</button>
        </div>
      </div>
    `;

    const entries = Object.entries(window.gameState.storage);
    if (entries.length === 0) {
      html += `<div style="color:var(--text-muted); text-align:center; padding:15px;">Kho đồ hiện đang trống rỗng! Thợ săn sẽ tự nhặt loot về.</div>`;
    } else {
      entries.forEach(([itemId, qty]) => {
        const item = CONFIG.ITEMS[itemId];
        if (item) {
          const totalVal = qty * item.basePrice;
          html += `
            <div class="item-card">
              <div class="item-info">
                <div class="item-name">${item.icon} ${item.name} <span style="color:#00e5ff;">x${qty}</span></div>
                <div class="item-stats">Giá trị: 💰${item.basePrice}g/cái | Tổng: 💰${totalVal}g</div>
              </div>
              <button class="btn-secondary btn-xs" onclick="window.app.sellSingleLoot('${itemId}')">Bán 1x (+${item.basePrice}g)</button>
            </div>
          `;
        }
      });
    }
    list.innerHTML = html;
  }

  sellSingleLoot(itemId) {
    const item = CONFIG.ITEMS[itemId];
    if (!item) return;
    if (window.gameState.consumeItem(itemId, 1)) {
      window.gameState.addGold(item.basePrice);
      window.logTicker.add(`📦 Đã bán 1x [${item.name}] (+${item.basePrice}g)!`, 'trade');
      this.populateStorageModal();
    }
  }

  sellExcessLoot() {
    let earned = 0;
    Object.entries(window.gameState.storage).forEach(([itemId, qty]) => {
      const item = CONFIG.ITEMS[itemId];
      if (item && qty > 2) {
        const sellCount = Math.floor(qty / 2);
        window.gameState.consumeItem(itemId, sellCount);
        const goldVal = sellCount * item.basePrice;
        earned += goldVal;
      }
    });

    if (earned > 0) {
      window.gameState.addGold(earned);
      window.logTicker.add(`🚢 [XUẤT KHẨU HOÀNG GIA]: Đã xuất khẩu nguyên liệu quái vật dư thừa cho Thương Đội Liên Tỉnh, thu về +${earned}g cho Ngân Khố!`, 'loot');
      this.populateStorageModal();
    } else {
      alert("Kho đồ không có nhiều nguyên liệu dư thừa để xuất khẩu!");
    }
  }

  expandStorage() {
    const cost = window.gameState.getStorageExpansionCost();
    if (window.gameState.spendGold(cost)) {
      window.gameState.storageExpansions = (window.gameState.storageExpansions || 0) + 1;
      if (window.gameState.recalculateMaxStorage) {
        window.gameState.recalculateMaxStorage();
      } else {
        window.gameState.maxStorage += 30;
      }
      const nextCost = window.gameState.getStorageExpansionCost();
      window.logTicker.add(`📦 [MỞ RỘNG KHO LẦN ${window.gameState.storageExpansions}]: +30 ô chứa đồ! (Sức chứa mới: ${window.gameState.maxStorage} món | Lần tới: 💰${CONFIG.formatNumber(nextCost)})`, 'system');
      if (window.showToast) window.showToast(`Mở rộng kho thành công! Sức chứa hiện tại: ${window.gameState.maxStorage} món (+30 ô).`, 'success', '📦 MỞ RỘNG KHO');
      if (window.soundFX) window.soundFX.playForge();
      this.populateStorageModal();
      if (window.renderer) window.renderer.updateHeader();
    } else {
      alert(`Thiếu vàng ngân khố: Cần 💰${CONFIG.formatNumber(cost)} (Hiện có: 💰${CONFIG.formatNumber(window.gameState.gold)})!`);
    }
  }

  toggleAutoSellStorage() {
    window.gameState.autoSellStorage = !window.gameState.autoSellStorage;
    const status = window.gameState.autoSellStorage ? "ĐÃ BẬT 🟢" : "ĐÃ TẮT 🔴";
    window.logTicker.add(`⚡ Tính năng Tự Động Xuất Khẩu khi đầy kho (≥90%): ${status}!`, 'system');
    this.populateStorageModal();
  }

  populateResearchModal() {
    const list = document.getElementById('research-tech-list');
    if (!list) return;

    const branchFilter = this.currentTechBranch || 'all';

    let html = `
      <div class="tabs-sub" style="margin-bottom:6px;">
        <button class="sub-tab ${branchFilter === 'all' ? 'active' : ''}" onclick="window.app.setTechBranch('all')">Tất Cả</button>
        <button class="sub-tab ${branchFilter === 'economy' ? 'active' : ''}" onclick="window.app.setTechBranch('economy')">🌾 Kinh Tế</button>
        <button class="sub-tab ${branchFilter === 'military' ? 'active' : ''}" onclick="window.app.setTechBranch('military')">⚒️ Quân Sự</button>
        <button class="sub-tab ${branchFilter === 'survival' ? 'active' : ''}" onclick="window.app.setTechBranch('survival')">🧬 Y Thuật</button>
        <button class="sub-tab ${branchFilter === 'hunting' ? 'active' : ''}" onclick="window.app.setTechBranch('hunting')">🐾 Săn Bắt</button>
      </div>
    `;

    const filteredTechs = branchFilter === 'all' 
      ? CONFIG.RESEARCH_TECHS 
      : CONFIG.RESEARCH_TECHS.filter(t => t.branch === branchFilter);

    filteredTechs.forEach(tech => {
      const isUnlocked = window.gameState.researched[tech.id];
      const isTownReqMet = window.gameState.townLevel >= tech.reqTownLvl;

      html += `
        <div class="item-card" style="${isUnlocked ? 'border-color:#2e593a; background:rgba(57,255,20,0.04);' : ''}">
          <div class="item-info">
            <div style="font-weight:bold; font-size:12px; color:${isUnlocked ? '#39ff14' : '#00e5ff'};">
              ${isUnlocked ? '✅ ' : '💡 '}${tech.name}
            </div>
            <div style="font-size:11px; color:var(--text-main);">${tech.desc}</div>
            <div style="font-size:10px; color:${isTownReqMet ? 'var(--text-muted)' : '#ff9999'};">
              Yêu cầu Thị Trấn: Cấp ${tech.reqTownLvl} (Hiện tại: Cấp ${window.gameState.townLevel})
            </div>
          </div>
          <button class="btn-primary btn-xs" ${isUnlocked || !isTownReqMet ? 'disabled' : ''} onclick="window.app.unlockTech('${tech.id}', ${tech.costGold})">
            ${isUnlocked ? 'ĐÃ MỞ' : (isTownReqMet ? `Nghiên Cứu (💰${tech.costGold}g)` : '🔒 Khóa')}
          </button>
        </div>
      `;
    });
    list.innerHTML = html;
  }

  setTechBranch(branch) {
    this.currentTechBranch = branch;
    this.populateResearchModal();
  }

  unlockTech(techId, cost) {
    const tech = CONFIG.RESEARCH_TECHS.find(t => t.id === techId);
    if (!tech) return;

    if (window.gameState.townLevel < tech.reqTownLvl) {
      alert(`Yêu cầu Thị Trấn Cấp ${tech.reqTownLvl}! Hãy nâng cấp Tòa Thị Chính trước.`);
      return;
    }

    if (window.gameState.spendGold(cost)) {
      window.gameState.researched[techId] = true;
      
      // Apply immediate permanent effects
      if (techId === 'tech_storage_expand' || techId === 'tech_storage_expand_2') {
        if (window.gameState.recalculateMaxStorage) {
          window.gameState.recalculateMaxStorage();
        }
      }

      window.logTicker.add(`💡 [NGHIÊN CỨU THÀNH CÔNG]: [${tech.name}]! (${tech.desc})`, 'loot');
      if (window.soundFX) window.soundFX.playLevelUp();
      this.populateResearchModal();
    } else {
      alert(`Không đủ vàng ngân khố (Cần 💰${cost}g)!`);
    }
  }

  populateHallModal() {
    const state = window.gameState;
    const curLvl = state.townLevel;
    const hallTownLvl = document.getElementById('hall-town-lvl');
    if (hallTownLvl) {
      hallTownLvl.textContent = state.townIsUpgrading ? `${curLvl} ➔ ${state.townTargetLevel || (curLvl + 1)} (🔨 Đang thi công)` : curLvl;
    }
    const hallMaxHunters = document.getElementById('hall-max-hunters');
    if (hallMaxHunters) hallMaxHunters.textContent = state.maxHunters;
    const hallTax = document.getElementById('hall-tax-rate');
    if (hallTax) hallTax.textContent = curLvl * 5;

    let box = document.getElementById('upgrade-box-hall');
    if (!box) {
      const modal = document.getElementById('modal-hall');
      box = modal ? modal.querySelector('.building-upgrade-box') : null;
    }
    if (!box) return;

    if (state.townIsUpgrading) {
      const secs = Math.max(0, Math.ceil(state.townUpgradeTimeLeft));
      const totalSecs = Math.max(1, state.townUpgradeTotalTime || secs || 1);
      const pct = Math.max(0, Math.min(100, Math.round(((totalSecs - state.townUpgradeTimeLeft) / totalSecs) * 100)));
      const gemCost = Math.max(1, Math.ceil(secs / 30));
      const formattedTime = Building.formatTime(secs);

      const existingCard = box.querySelector('.construction-hud-card');
      if (existingCard) {
        const timerBadge = existingCard.querySelector('.hud-timer-badge');
        if (timerBadge && timerBadge.textContent !== `⏱️ ${formattedTime}`) {
          timerBadge.textContent = `⏱️ ${formattedTime}`;
        }
        const fill = existingCard.querySelector('.construction-progress-bar-fill');
        if (fill) fill.style.width = `${pct}%`;
        const progText = existingCard.querySelector('.construction-progress-text');
        if (progText && progText.textContent !== `${pct}% (${formattedTime})`) {
          progText.textContent = `${pct}% (${formattedTime})`;
        }
        const gemBtn = existingCard.querySelector('.btn-instant-complete');
        if (gemBtn) {
          gemBtn.innerHTML = `<span class="bolt">⚡</span> Hoàn Thành Siêu Tốc Ngay (💎 <b>${gemCost}</b> Ngọc)`;
        }
        return;
      }

      box.innerHTML = `
        <div class="construction-hud-card">
          <div class="construction-hud-header">
            <div class="hud-status-left">
              <span class="hud-hammer-anim">👑</span>
              <div>
                <div class="hud-title">ĐANG ĐẠI TRÙNG TU THỊ TRẤN: LÊN CẤP ${state.townTargetLevel || (curLvl + 1)}</div>
                <div class="hud-sub">Toàn thể cư dân & thợ săn đang nâng cấp thị trấn...</div>
              </div>
            </div>
            <div class="hud-timer-badge">⏱️ ${formattedTime}</div>
          </div>
          
          <div class="construction-progress-bar-wrap">
            <div class="construction-progress-bar-fill" style="width: ${pct}%"></div>
            <div class="construction-progress-bar-glow"></div>
            <span class="construction-progress-text">${pct}% (${formattedTime})</span>
          </div>

          <div class="construction-perk-box">
            <span class="perk-icon">✨</span>
            <span class="perk-text">${state.townTargetDesc || 'Mở rộng thêm giới hạn Thợ Săn & Sức chứa Kho'}</span>
          </div>

          <button class="btn-instant-complete btn-block" onclick="Building.instantFinishTown()">
            <span class="bolt">⚡</span> Hoàn Thành Siêu Tốc Ngay (💎 <b>${gemCost}</b> Ngọc)
          </button>
        </div>
      `;
      return;
    }

    const existingCard = box.querySelector('.construction-hud-card');
    if (existingCard) {
      box.innerHTML = '';
    }

    const nextTown = Building.getTownUpgradeData(curLvl + 1);
    if (nextTown) {
      const matEntries = Object.entries(nextTown.materials);
      let canAfford = state.gold >= nextTown.gold;
      
      const matHtml = matEntries.map(([m, c]) => {
        const has = state.storage[m] || 0;
        const ok = has >= c;
        if (!ok) canAfford = false;
        const color = ok ? '#39ff14' : '#ff5577';
        const mName = CONFIG.ITEMS[m]?.name || m;
        return `<span class="mat-req-tag" style="border-color:${color}; color:${color};">${CONFIG.ITEMS[m]?.icon || '📦'} ${c}x ${mName} (${has}/${c})</span>`;
      }).join(' ');

      const timeTxt = Building.formatTime(nextTown.timeSec);
      const goldOk = state.gold >= nextTown.gold;

      box.innerHTML = `
        <div class="upgrade-preview-card">
          <div class="up-header">
            <div class="up-title">
              👑 ĐẠI KHÁNH THÀNH: CẤP ${nextTown.level}
            </div>
            <div class="up-time">⏱️ Thời gian thi công: <b>${timeTxt}</b></div>
          </div>
          <div class="up-perk">
            <span class="up-perk-icon">✨</span>
            <span>${nextTown.desc}</span>
          </div>
          <div class="up-cost-row">
            <div class="up-gold" style="color: ${goldOk ? '#ffd700' : '#ff5577'}">
              💰 Chi phí: <b>${CONFIG.formatNumber(nextTown.gold)} GOLD</b> (Có: 💰${CONFIG.formatNumber(state.gold)})
            </div>
            <div class="up-materials">
              ${matHtml}
            </div>
          </div>
          <button class="btn-primary btn-block ${canAfford ? 'btn-ready-pulse' : ''}" onclick="Building.startTownUpgrade()" ${canAfford ? '' : 'style="opacity:0.85;"'}>
            🚀 BẮT ĐẦU ĐẠI KHÁNH THÀNH LÊN CẤP ${nextTown.level} (⏱️ ${timeTxt})
          </button>
        </div>
      `;
    } else {
      box.innerHTML = `
        <div class="upgrade-max-card">
          👑 THỊ TRẤN ĐÃ ĐẠT CẤP ĐỈNH CAO TỐI THƯỢNG (CẤP ${Building.MAX_LEVEL})
        </div>
      `;
    }
  }

  upgradeTown() {
    Building.startTownUpgrade();
  }

  openHunterDetail(hunterId) {
    const hunter = window.gameState.hunters.find(h => h.id === hunterId);
    if (!hunter) return;

    const card = document.getElementById('hd-card-content');
    const rank = CONFIG.HUNTER_RANKS[hunter.rankKey];
    const cls = CONFIG.HUNTER_CLASSES[hunter.classKey];
    const starTxt = hunter.reincarnation > 0 ? `${'⭐'.repeat(hunter.reincarnation)} ` : '';

    const realmTitles = ["Tân Thủ", "Tinh Anh", "Tông Sư", "Thần Vương", "Chí Tôn Vô Thượng"];
    const realmName = realmTitles[Math.min(hunter.reincarnation || 0, realmTitles.length - 1)];

    document.getElementById('hd-name').textContent = `${cls.icon} Thợ Săn: ${starTxt}${hunter.name} [Lv.${hunter.level}]`;

    const hpPct = Math.round((hunter.hp / hunter.maxHp) * 100);
    const hungerPct = Math.round(hunter.hunger);
    const fatiguePct = Math.round(hunter.fatigue);
    const expPct = Math.round((hunter.exp / hunter.maxExp) * 100);

    const wpnStr = hunter.weapon ? `${hunter.weapon.name} ${hunter.weaponPlus ? `<span style="color:#00e5ff">(+${hunter.weaponPlus})</span>` : ''} (+${hunter.getTotalAtk() - hunter.atk} ATK)` : 'Tay Không';
    const amrStr = hunter.armor ? `${hunter.armor.name} ${hunter.armorPlus ? `<span style="color:#ffd700">(+${hunter.armorPlus})</span>` : ''} (+${hunter.getTotalDef() - hunter.def} DEF)` : 'Vải Rách';
    const ringStr = hunter.ring ? `${hunter.ring.name} ${hunter.ringPlus ? `<span style="color:#ffaa00">(+${hunter.ringPlus})</span>` : ''} (+${Math.floor(hunter.ring.atk * (1 + (hunter.ringPlus || 0) * 0.1))} ATK${hunter.ring.crit ? `, +${hunter.ring.crit}% Crit` : ''})` : 'Chưa có';
    const amulStr = hunter.amulet ? `${hunter.amulet.name} ${hunter.amuletPlus ? `<span style="color:#00e5ff">(+${hunter.amuletPlus})</span>` : ''} (+${Math.floor(hunter.amulet.def * (1 + (hunter.amuletPlus || 0) * 0.1))} DEF, +${Math.floor(hunter.amulet.hp * (1 + (hunter.amuletPlus || 0) * 0.1))} HP, +${Math.floor((hunter.amulet.critDmg || 15) * (1 + (hunter.amuletPlus || 0) * 0.1))}% Crit DMG)` : 'Chưa có';
    const talStr = hunter.talisman ? `${hunter.talisman.name} ${hunter.talismanPlus ? `<span style="color:#bd00ff">(+${hunter.talismanPlus})</span>` : ''} (+${Math.floor(hunter.talisman.atk * (1 + (hunter.talismanPlus || 0) * 0.1))} ATK, +${Math.floor((hunter.talisman.critRate || 6) * (1 + (hunter.talismanPlus || 0) * 0.1))}% Crit Rate)` : 'Chưa có';

    const cpVal = hunter.getCombatPower ? hunter.getCombatPower() : 0;
    const cpStr = CONFIG.formatNumber(cpVal);
    const critRatePct = Math.round((hunter.getCritRate ? hunter.getCritRate() : 0.05) * 100);
    const critDmgPct = Math.round((hunter.getCritDamage ? hunter.getCritDamage() : 1.50) * 100);

    card.innerHTML = `
      <div class="hd-header-row">
        <span>Hệ Phái: <b>${cls.name}</b></span>
        <span class="hd-rank-tag" style="background:${rank.color}; color:#000;">${rank.icon} ${rank.name}</span>
      </div>
      <div style="background:rgba(255,170,0,0.12); border:1px solid rgba(255,170,0,0.3); border-radius:4px; padding:4px 8px; display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <span style="color:#ffaa00; font-weight:bold; font-size:11px;">⚔️ Lực Chiến (CP):</span>
        <b style="color:#ffd700; font-size:14px; text-shadow:0 0 6px rgba(255,215,0,0.4);">${cpStr} CP</b>
      </div>

      <!-- COMBAT STATS 4-GRID (ATK, DEF, CRIT RATE, CRIT DAMAGE) -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin:6px 0;">
        <div style="background:rgba(255,51,102,0.12); border:1px solid rgba(255,51,102,0.3); border-radius:4px; padding:5px 6px; text-align:center;">
          <div style="font-size:9px; color:#ff88aa;">⚔️ SỨC TẤN CÔNG (ATK)</div>
          <div style="font-size:14px; font-weight:bold; color:#ff3366; text-shadow:0 0 6px rgba(255,51,102,0.4);">${CONFIG.formatNumber(hunter.getTotalAtk())}</div>
        </div>
        <div style="background:rgba(0,229,255,0.12); border:1px solid rgba(0,229,255,0.3); border-radius:4px; padding:5px 6px; text-align:center;">
          <div style="font-size:9px; color:#88eeff;">🛡️ PHÒNG NGỰ (DEF)</div>
          <div style="font-size:14px; font-weight:bold; color:#00e5ff; text-shadow:0 0 6px rgba(0,229,255,0.4);">${CONFIG.formatNumber(hunter.getTotalDef())}</div>
        </div>
        <div style="background:rgba(189,0,255,0.12); border:1px solid rgba(189,0,255,0.3); border-radius:4px; padding:5px 6px; text-align:center;">
          <div style="font-size:9px; color:#e088ff;">🎯 TỈ LỆ CHÍ MẠNG</div>
          <div style="font-size:14px; font-weight:bold; color:#bd00ff; text-shadow:0 0 6px rgba(189,0,255,0.4);">${critRatePct}%</div>
        </div>
        <div style="background:rgba(255,170,0,0.12); border:1px solid rgba(255,170,0,0.3); border-radius:4px; padding:5px 6px; text-align:center;">
          <div style="font-size:9px; color:#ffd088;">💥 SÁT THƯƠNG BẠO</div>
          <div style="font-size:14px; font-weight:bold; color:#ffaa00; text-shadow:0 0 6px rgba(255,170,0,0.4);">${critDmgPct}%</div>
        </div>
      </div>

      <div>Cảnh Giới Đột Phá: <b style="color:#ffd700;">${starTxt}[${realmName}]</b> (Chuyển Sinh Cấp ${hunter.reincarnation || 0})</div>
      <div>Đặc Tính: <b>${hunter.trait.icon} ${hunter.trait.name}</b> (${hunter.trait.desc})</div>
      <div>🗡️ Vũ Khí: <b>${wpnStr}</b></div>
      <div>🦺 Áo Giáp: <b>${amrStr}</b></div>
      <div>💍 Nhẫn Cổ Ngữ: <b>${ringStr}</b></div>
      <div>📿 Dây Chuyền: <b>${amulStr}</b></div>
      <div>🔮 Pháp Bảo: <b>${talStr}</b></div>
      <div>💰 Ví Tiền Cá Nhân: <b>💰${CONFIG.formatNumber(hunter.gold)}</b></div>

      <div class="stat-bars-block">
        <div class="bar-row">
          <span class="bar-label">Máu (HP):</span>
          <div class="bar-track"><div class="bar-fill hp" style="width: ${hpPct}%;"></div></div>
          <span>${CONFIG.formatNumber(Math.round(hunter.hp))}/${CONFIG.formatNumber(hunter.maxHp)}</span>
        </div>
        <div class="bar-row">
          <span class="bar-label">Đói Bụng:</span>
          <div class="bar-track"><div class="bar-fill hunger" style="width: ${hungerPct}%;"></div></div>
          <span>${hungerPct}%</span>
        </div>
        <div class="bar-row">
          <span class="bar-label">Thể Lực:</span>
          <div class="bar-track"><div class="bar-fill fatigue" style="width: ${fatiguePct}%;"></div></div>
          <span>${fatiguePct}%</span>
        </div>
        <div class="bar-row">
          <span class="bar-label">Kinh Nghiệm:</span>
          <div class="bar-track"><div class="bar-fill exp" style="width: ${expPct}%;"></div></div>
          <span>${expPct}%</span>
        </div>
      </div>
      
      <div style="font-size:11px; color:#6b8c70;">Trạng thái hiện tại: <i>${hunter.activityLog}</i></div>
      
      <!-- TẾ ĐÀN ĐỘT PHÁ CẢNH GIỚI (LV.100) -->
      ${(() => {
        const bkInfo = hunter.getBreakthroughInfo ? hunter.getBreakthroughInfo() : null;
        if (!bkInfo) return '';
        const canBk = hunter.canBreakthrough ? hunter.canBreakthrough() : { ok: false };
        const matEntries = Object.entries(bkInfo.materials || {});
        const matTags = matEntries.map(([mKey, count]) => {
          const has = window.gameState.storage[mKey] || 0;
          const ok = has >= count;
          const color = ok ? '#39ff14' : '#ff5577';
          const mName = CONFIG.ITEMS[mKey]?.name || mKey;
          const icon = CONFIG.ITEMS[mKey]?.icon || '💎';
          return `<span style="border:1px solid ${color}; color:${color}; padding:2px 6px; border-radius:3px; font-size:10px; background:rgba(0,0,0,0.3);">${icon} ${mName}: <b>${has}/${count}</b></span>`;
        }).join(' ');

        const goldOk = window.gameState.gold >= bkInfo.gold;
        const lvlOk = hunter.level >= 100;

        return `
          <div style="background:radial-gradient(circle, #2b1126 0%, #15091a 100%); border:1.5px solid #bd00ff; border-radius:6px; padding:10px; margin-top:10px; box-shadow:0 0 12px rgba(189,0,255,0.2);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <span style="color:#ff88ff; font-weight:bold; font-size:12px;">🔥 TẾ ĐÀN ĐỘT PHÁ: [${'⭐'.repeat((hunter.reincarnation || 0) + 1)} ${bkInfo.title}]</span>
              <span style="font-size:10px; color:${lvlOk ? '#39ff14' : '#ffaa00'}; font-weight:bold;">${lvlOk ? 'ĐỦ CẤP 100' : `Cần Lv.100 (${hunter.level}/100)`}</span>
            </div>
            <div style="font-size:10px; color:var(--text-muted); margin-bottom:6px; display:flex; justify-content:space-between;">
              <span>${bkInfo.desc}</span>
              <span style="color:#ffd700; font-weight:bold;">[Phẩm ${bkInfo.rankName}: x${bkInfo.rankMultiplier} Phí]</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:4px; margin-bottom:8px;">
              <div style="font-size:10px; display:flex; justify-content:space-between;">
                <span>Phí Ngân Khố: <b style="color:${goldOk ? '#ffd700' : '#ff5577'};">💰${CONFIG.formatNumber(bkInfo.gold)}</b> (Có: 💰${CONFIG.formatNumber(window.gameState.gold)})</span>
                <span style="color:#00e5ff; font-weight:bold;">🎲 Tỉ lệ thành công: <b style="color:#39ff14;">${Math.round((bkInfo.totalSuccessRate || 0.85) * 100)}%</b>${bkInfo.pityBonus > 0 ? ` <span style="color:#ffd700;">(+${Math.round(bkInfo.pityBonus * 100)}% May Mắn)</span>` : ''}</span>
              </div>
              <div style="display:flex; flex-wrap:wrap; gap:4px;">${matTags}</div>
            </div>
            <button class="btn-block ${canBk.ok ? 'btn-primary' : 'btn-secondary'}" 
                    style="${canBk.ok ? 'background:linear-gradient(90deg, #bd00ff, #ff3366); font-weight:bold; font-size:12px; box-shadow:0 0 10px rgba(255,51,102,0.5);' : 'opacity:0.7;'}"
                    onclick="window.app.performHunterBreakthrough('${hunter.id}')">
              ${canBk.ok ? `🔥 TIẾN HÀNH ĐẠI ĐỘT PHÁ (TỈ LỆ: ${Math.round((bkInfo.totalSuccessRate || 0.85) * 100)}%)` : `🔒 ${canBk.reason}`}
            </button>
          </div>
        `;
      })()}

      <button class="btn-danger btn-block" style="margin-top:10px; font-weight:bold;" onclick="window.app.dismissHunter('${hunter.id}')">🚪 Trục Xuất Thợ Săn Khỏi Thị Trấn</button>
    `;

    this.openModal('modal-hunter-detail');
  }

  dismissHunter(hunterId) {
    const hunter = window.gameState.hunters.find(h => h.id === hunterId);
    if (!hunter) return;

    window.showConfirm(
      `Bạn có chắc chắn muốn TRỤC XUẤT thợ săn [${hunter.name} - Lv.${hunter.level}] khỏi thị trấn không?\n\n⚠️ Thợ săn sẽ rời đi vĩnh viễn và giải phóng 1 chỗ ở trong thị trấn!`,
      "XÁC NHẬN TRỤC XUẤT",
      () => {
        window.gameState.hunters = window.gameState.hunters.filter(h => h.id !== hunterId);
        window.logTicker.add(`🚪 [TRỤC XUẤT]: Thợ săn [${hunter.name}] đã rời khỏi thị trấn!`, 'danger');
        window.showToast(`Đã trục xuất [${hunter.name}]! Thị trấn có thêm 1 chỗ trống.`, 'warning', 'TRỤC XUẤT THÀNH CÔNG');
        window.gameState.save();
        this.closeAllModals();
        if (window.renderer) window.renderer.renderAsciiMap();
      },
      null,
      "🚪"
    );
  }

  performHunterBreakthrough(hunterId) {
    const hunter = window.gameState.hunters.find(h => h.id === hunterId);
    if (!hunter) return;

    const res = hunter.performBreakthrough ? hunter.performBreakthrough() : { ok: false, reason: 'Chưa hỗ trợ!' };
    if (res.ok) {
      this.openHunterDetail(hunterId);
      if (window.renderer) window.renderer.updateHeader();
    } else {
      alert(res.reason || "Chưa đủ điều kiện Đột Phá!");
    }
  }

  // ==========================================
  // HẦM NGỤC LEO TẦNG & BOSS RAID CONTROLLER
  // ==========================================
  selectDungeonFloor(floorNum) {
    window.gameState.dungeonCurrentFloor = floorNum;
    this.renderDungeonTab();
  }

  startDungeonFloor(floorNum) {
    if (typeof DungeonSystem !== 'undefined') {
      DungeonSystem.startBattle(floorNum);
    }
  }

  retreatDungeon() {
    if (typeof DungeonSystem !== 'undefined') {
      DungeonSystem.retreat();
    }
  }

  dungeonVictoryProceed(nextFloor) {
    window.gameState.dungeonActiveBattle = null;
    window.gameState.dungeonCurrentFloor = nextFloor;
    this.renderDungeonTab();
    if (window.renderer) window.renderer.updateHeader();
  }

  renderDungeonTab() {
    const container = document.getElementById('dungeon-modal-content');
    if (!container) return;

    const state = window.gameState;
    const curFloor = state.dungeonCurrentFloor || 1;
    const maxFloor = state.dungeonMaxFloor || 0;
    const sweepsLeft = state.dungeonSweepsLeft !== undefined ? state.dungeonSweepsLeft : 5;
    const battle = state.dungeonActiveBattle;
    const entryFee = (typeof DungeonSystem !== 'undefined' && DungeonSystem.getEntryFee)
      ? DungeonSystem.getEntryFee(curFloor)
      : 300;

    // Floor Selector Pills
    let floorPillsHtml = '';
    const maxSelectable = Math.min(30, maxFloor + 1);
    for (let f = 1; f <= maxSelectable; f++) {
      const isCleared = f <= maxFloor;
      const isSelected = f === curFloor;
      let badgeClass = isSelected ? 'active' : (isCleared ? 'cleared' : 'available');
      floorPillsHtml += `
        <button class="dungeon-floor-pill ${badgeClass}" onclick="window.app.selectDungeonFloor(${f})">
          ${isCleared ? '✅' : (isSelected ? '🔥' : '⚔️')} Tầng ${f}
        </button>
      `;
    }

    if (battle) {
      // ACTIVE BATTLE VIEW
      const boss = battle.boss;
      const bossPct = Math.max(0, Math.min(100, Math.round((boss.hp / boss.maxHp) * 100)));

      let hunterTeamHtml = battle.hunters.map(h => {
        const hpPct = Math.max(0, Math.min(100, Math.round((h.hp / h.maxHp) * 100)));
        const starTxt = h.reincarnation > 0 ? '⭐'.repeat(h.reincarnation) : '';
        return `
          <div class="raid-hunter-card ${h.isAlive ? '' : 'dead'}" style="flex:1; min-width:85px; background:rgba(0,0,0,0.5); border:1px solid ${h.isAlive ? '#3a4b60' : '#ff3366'}; border-radius:4px; padding:4px 6px;">
            <div style="display:flex; justify-content:space-between; font-size:10px; font-weight:bold;">
              <span style="color:#00e5ff;">${starTxt}${h.name}</span>
              <span style="color:${h.isAlive ? '#39ff14' : '#ff5577'};">${h.isAlive ? `Lv.${h.level}` : '💀'}</span>
            </div>
            <div class="bar-track" style="height:4px; margin-top:2px;">
              <div class="bar-fill hp" style="width:${hpPct}%; background:${hpPct < 30 ? '#ff3366' : '#39ff14'};"></div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:9px; color:var(--text-muted); margin-top:2px;">
              <span style="color:#ffaa00; font-weight:bold;">⚔️${CONFIG.formatNumber(h.atk)}</span>
              <span>${CONFIG.formatNumber(Math.round(h.hp))}/${CONFIG.formatNumber(h.maxHp)}</span>
            </div>
          </div>
        `;
      }).join('');

      let logsHtml = battle.logs.map(l => `<div class="dungeon-log-row">${l}</div>`).join('');

      let actionBtnHtml = '';
      if (battle.state === 'VICTORY') {
        const nextFloor = battle.floor + 1;
        actionBtnHtml = `
          <button class="btn-primary btn-block" style="background:linear-gradient(90deg, #39ff14, #00e5ff); color:#000; font-weight:bold; padding:10px; font-size:13px;" onclick="window.app.dungeonVictoryProceed(${nextFloor})">
            🏆 THU HOẠCH CHIẾN LỢI PHẨM & LÊN TẦNG ${nextFloor} ⏩
          </button>
        `;
      } else if (battle.state === 'DEFEAT') {
        actionBtnHtml = `
          <button class="btn-danger btn-block" style="padding:10px; font-weight:bold;" onclick="window.app.retreatDungeon()">
            🔄 RÚT LUI VỀ LÀNG DƯỠNG THƯƠNG
          </button>
        `;
      } else {
        actionBtnHtml = `
          <button class="btn-secondary btn-block" onclick="window.app.retreatDungeon()">
            🏃 Rút Lui An Toàn
          </button>
        `;
      }

      container.innerHTML = `
        <div class="dungeon-arena-container">
          <!-- Boss Showcase in Arena -->
          <div class="dungeon-boss-arena-box" style="background:radial-gradient(circle at center, #360f22 0%, #120817 100%); border:1.5px solid #ff3366; border-radius:8px; padding:12px; text-align:center; box-shadow:0 0 15px rgba(255,51,102,0.3);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <span style="font-size:12px; font-weight:bold; color:#ff88aa;">👑 ${battle.floorData.name}</span>
              <span style="font-size:11px; font-weight:bold; color:#ffd700;">⏱️ Cuồng nộ: <b>${Math.ceil(battle.timeLeft)}s</b></span>
            </div>
            
            <div class="dungeon-boss-glyph" style="font-size:28px; margin:6px 0; letter-spacing:2px;">${boss.glyph}</div>
            <div style="font-size:16px; font-weight:bold; color:#ff3366; text-shadow:0 0 10px rgba(255,51,102,0.6);">${boss.name}</div>
            <div style="font-size:10px; color:var(--text-muted); margin-bottom:8px;">Độ khó Cấp ${boss.difficulty} | ⚔️ Công: ${boss.atk} | 🛡️ Thủ: ${boss.def}</div>

            <!-- Multi-layer Boss HP Bar -->
            <div class="boss-hp-bar-wrap" style="position:relative; width:100%; height:22px; background:#080d14; border:1.5px solid #ff3366; border-radius:4px; overflow:hidden; display:flex; align-items:center; box-shadow:0 0 8px rgba(255,51,102,0.4);">
              <div class="boss-hp-bar-fill" style="width:${bossPct}%; height:100%; background:linear-gradient(90deg, #ff0055, #ffaa00); transition:width 0.25s linear;"></div>
              <span class="boss-hp-bar-text" style="position:absolute; width:100%; text-align:center; font-size:11px; font-weight:bold; color:#fff; text-shadow:0 1px 3px #000;">${CONFIG.formatNumber(Math.round(boss.hp))} / ${CONFIG.formatNumber(boss.maxHp)} HP (${bossPct}%)</span>
            </div>
          </div>

          <!-- Raid Team Hunters Status -->
          <div style="margin-top:10px;">
            <div style="font-size:11px; font-weight:bold; color:#00e5ff; margin-bottom:4px;">👥 ĐỘI THỢ SĂN VIỄN CHINH (${battle.hunters.filter(h => h.isAlive).length}/${battle.hunters.length} SỐNG):</div>
            <div style="display:flex; gap:4px; flex-wrap:wrap;">
              ${hunterTeamHtml}
            </div>
          </div>

          <!-- Combat Action Log Feed -->
          <div class="dungeon-combat-logs" style="margin-top:8px; height:110px; overflow-y:auto; background:#080b10; border:1px solid #233142; border-radius:4px; padding:6px; font-size:11px; display:flex; flex-direction:column; gap:2px;">
            ${logsHtml}
          </div>

          <div style="margin-top:10px;">
            ${actionBtnHtml}
          </div>
        </div>
      `;
      return;
    }

    // IDLE FLOOR PREVIEW VIEW
    const floorData = DungeonSystem.getFloorData(curFloor);
    const isCleared = curFloor <= maxFloor;

    const firstMatsHtml = Object.entries(floorData.firstClear?.materials || {}).map(([mKey, count]) => {
      const mat = CONFIG.ITEMS[mKey];
      return `<span class="mat-req-tag" style="border-color:#bd00ff; color:#ff88ff; background:rgba(0,0,0,0.3);">${mat?.icon || '💎'} ${count}x ${mat?.name || mKey}</span>`;
    }).join(' ');

    const farmMatsHtml = Object.entries(floorData.farmReward?.materials || {}).map(([mKey, count]) => {
      const mat = CONFIG.ITEMS[mKey];
      return `<span class="mat-req-tag" style="border-color:#39ff14; color:#39ff14; background:rgba(0,0,0,0.3);">${mat?.icon || '💎'} ${count}x ${mat?.name || mKey}</span>`;
    }).join(' ');

    container.innerHTML = `
      <div class="dungeon-overview-container">
        <!-- Floor Selector Bar -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:12px; font-weight:bold; color:#00e5ff;">🗺️ CHỌN TẦNG HẦM NGỤC:</span>
          <span style="font-size:11px; color:#ffd700;">🗝️ Phí Mở Cổng Kết Giới: <b>💰${CONFIG.formatGold ? CONFIG.formatGold(entryFee) : `${entryFee} GOLD`}</b></span>
        </div>
        <div class="dungeon-floors-strip" style="display:flex; gap:6px; overflow-x:auto; padding-bottom:6px; margin-bottom:10px;">
          ${floorPillsHtml}
        </div>

        <!-- Boss Preview Card -->
        <div class="dungeon-boss-preview-card" style="background:radial-gradient(circle at center, #2b0f20 0%, #0d0814 100%); border:1.5px solid #ff3366; border-radius:8px; padding:12px; text-align:center; box-shadow:0 0 15px rgba(255,51,102,0.25);">
          <div style="font-size:12px; font-weight:bold; color:#ff88aa;">${floorData.icon} ${floorData.name}</div>
          <div class="dungeon-boss-glyph" style="font-size:28px; margin:8px 0; letter-spacing:2px;">${floorData.bossGlyph}</div>
          <div style="font-size:16px; font-weight:bold; color:#ff3366; text-shadow:0 0 8px rgba(255,51,102,0.5);">${floorData.bossName}</div>
          <div style="font-size:11px; color:var(--text-muted); margin:4px 0 8px 0;">${floorData.desc}</div>
          
          <div style="display:flex; justify-content:center; gap:16px; font-size:11px; background:rgba(0,0,0,0.3); padding:6px; border-radius:4px; margin-bottom:10px;">
            <span>❤️ Máu Boss: <b style="color:#ff5577;">${CONFIG.formatNumber(floorData.bossHp)} HP</b></span>
            <span>⚔️ Tấn Công: <b style="color:#ffaa00;">${CONFIG.formatNumber(floorData.bossAtk)}</b></span>
            <span>🛡️ Phòng Ngự: <b style="color:#00e5ff;">${CONFIG.formatNumber(floorData.bossDef)}</b></span>
          </div>

          <!-- Rewards Box -->
          <div style="display:flex; flex-direction:column; gap:6px; text-align:left; background:rgba(0,0,0,0.25); border:1px solid #3a4b60; border-radius:6px; padding:8px; margin-bottom:12px;">
            <div style="font-size:11px;">
              <b style="color:${isCleared ? 'var(--text-muted)' : '#ffd700'};">🎁 Thưởng Lần Đầu Vượt Tầng:</b>
              <span style="font-size:10px; color:${isCleared ? 'var(--text-muted)' : '#fff'};">💰${CONFIG.formatGold ? CONFIG.formatGold(floorData.firstClear.gold) : `${floorData.firstClear.gold} GOLD`}, 💎${floorData.firstClear.gems} Ngọc</span>
              <div style="display:flex; gap:4px; margin-top:2px; ${isCleared ? 'opacity:0.5;' : ''}">${firstMatsHtml} ${isCleared ? '<b style="color:#39ff14; font-size:10px;">(ĐÃ NHẬN)</b>' : ''}</div>
            </div>
            <div style="font-size:11px; border-top:1px dashed #2a3f55; padding-top:4px;">
              <b style="color:#39ff14;">🔁 Thưởng Tái Đấu / Farm Nguyên Liệu:</b>
              <span style="font-size:10px;">💰${CONFIG.formatGold ? CONFIG.formatGold(floorData.farmReward.gold) : `${floorData.farmReward.gold} GOLD`}</span>
              <div style="display:flex; gap:4px; margin-top:2px;">${farmMatsHtml}</div>
            </div>
          </div>

          <!-- Squad vs Boss Combat Power Matchup & Warning -->
          ${(() => {
            const raidTeam = (typeof DungeonSystem !== 'undefined' && DungeonSystem.getRaidTeam)
              ? DungeonSystem.getRaidTeam()
              : (window.gameState.hunters || []).slice(0, 5);
            const squadPower = raidTeam.reduce((s, h) => s + (h.getCombatPower ? h.getCombatPower() : 0), 0);
            const reqPower = floorData.reqPower || 3000;
            const squadStr = CONFIG.formatNumber(squadPower);
            const reqStr = CONFIG.formatNumber(reqPower);
            const isSafe = squadPower >= reqPower;
            const diff = reqPower - squadPower;
            const diffStr = CONFIG.formatNumber(diff);

            return `
              <div style="background:${isSafe ? 'rgba(57,255,20,0.08)' : 'rgba(255,51,102,0.15)'}; border:1px solid ${isSafe ? '#39ff14' : '#ff3366'}; border-radius:6px; padding:6px 10px; margin-bottom:10px; font-size:11px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                  <span>👥 Đội Viễn Chinh (Top 5 Mạnh Nhất: ${raidTeam.length}/5): <b style="color:#ffd700;">${squadStr} CP</b></span>
                  <span>⚠️ Yêu Cầu Tối Thiểu: <b style="color:#00e5ff;">${reqStr} CP</b></span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px;">
                  <span style="color:${isSafe ? '#39ff14' : '#ff5577'}; font-weight:bold;">
                    ${isSafe ? '🟢 ĐỦ LỰC CHIẾN (Đã mở khóa khiêu chiến)' : `🔒 KHÓA CỔNG KẾT GIỚI (Chưa đủ điều kiện - Thiếu ${diffStr} CP)`}
                  </span>
                  <span style="color:#ffaa00;">⏱️ Cuồng nộ: ${floorData.enrageSec || 45}s</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div style="display:flex; gap:8px;">
                ${isSafe ? `
                  <button class="btn-primary" style="flex:1; background:linear-gradient(90deg, #ff3366, #bd00ff); font-weight:bold; font-size:13px; padding:10px;" onclick="window.app.startDungeonFloor(${curFloor})">
                    ${isCleared ? `⚔️ TÁI CHIẾN FARM NGUYÊN LIỆU (💰 ${CONFIG.formatGold ? CONFIG.formatGold(entryFee) : `${entryFee} GOLD`})` : `⚔️ TIẾN VÀO KHIÊU CHIẾN BOSS (💰 ${CONFIG.formatGold ? CONFIG.formatGold(entryFee) : `${entryFee} GOLD`})`}
                  </button>
                ` : `
                  <button class="btn-secondary" style="flex:1; opacity:0.65; cursor:not-allowed; padding:10px; font-weight:bold; font-size:12px; background:#22151c; border-color:#ff3366; color:#ff88aa;" disabled title="Cần đạt tối thiểu ${reqStr} CP">
                    🔒 CHƯA ĐỦ LỰC CHIẾN (CẦN TỐI THIỂU ${reqStr} CP - THIẾU ${diffStr} CP)
                  </button>
                `}
              </div>
            `;
          })()}
        </div>
      </div>
    `;
  }

  populateRecruitModal() {
    const popInfo = document.getElementById('gacha-pop-info');
    const waitCount = document.getElementById('waiting-count');
    const waitList = document.getElementById('waiting-hunter-list');

    const curHunters = window.gameState.hunters.length;
    const maxHunters = window.gameState.maxHunters;
    const availableSlots = Math.max(0, maxHunters - curHunters);
    const waitingHunters = window.gameState.waitingHunters || [];

    if (popInfo) {
      popInfo.textContent = `${curHunters}/${maxHunters} (Trống: ${availableSlots})`;
      popInfo.style.color = availableSlots === 0 ? 'var(--accent-red)' : 'var(--accent-green)';
    }
    if (waitCount) waitCount.textContent = waitingHunters.length;

    // Render Waiting Queue List
    if (waitList) {
      if (waitingHunters.length === 0) {
        waitList.innerHTML = `<div style="font-size:10px; color:var(--text-muted); text-align:center; padding:12px; background:rgba(0,0,0,0.3); border-radius:4px;">Hàng chờ trống. Khi thị trấn đầy, thợ săn triệu hồi sẽ tự động xếp hàng tại đây!</div>`;
      } else {
        let wHtml = "";
        waitingHunters.forEach((h) => {
          const rank = CONFIG.HUNTER_RANKS[h.rankKey];
          const cls = CONFIG.HUNTER_CLASSES[h.classKey];
          wHtml += `
            <div class="item-card" style="padding:6px 8px; background:rgba(18, 25, 36, 0.9); border-color:#2a3d54; align-items:center;">
              <div class="item-info" style="flex:1;">
                <div style="font-size:11px; font-weight:bold; color:${rank.color};">
                  ${rank.icon} ${cls.icon} ${h.name} [${rank.name}]
                </div>
                <div style="font-size:9.5px; color:var(--text-muted);">
                  Hệ: <b>${cls.name}</b> | ❤️ HP: ${h.maxHp} | ⚡ ATK: ${h.atk} | 🛡️ DEF: ${h.def}
                </div>
                <div style="font-size:9px; color:var(--accent-cyan);">
                  Đặc tính: ${h.trait.icon} ${h.trait.name}
                </div>
              </div>
              <div style="display:flex; flex-direction:column; gap:3px;">
                <button class="btn-primary btn-xs" style="font-size:9px; padding:3px 6px;" onclick="window.app.admitHunterFromQueue('${h.id}')">➕ Vào Làng</button>
                <button class="btn-danger btn-xs" style="font-size:9px; padding:3px 6px;" onclick="window.app.dismissWaitingHunter('${h.id}')">🚪 Trục Xuất</button>
              </div>
            </div>
          `;
        });
        waitList.innerHTML = wHtml;
      }
    }
  }

  admitHunterFromQueue(hunterId) {
    if (window.gameState.hunters.length >= window.gameState.maxHunters) {
      window.showAlert(
        `Thị trấn đã đầy chỗ ở (${window.gameState.hunters.length}/${window.gameState.maxHunters})!\n\nHãy nâng cấp Tòa Thị Chính hoặc trục xuất thợ săn khác để lấy chỗ trống.`,
        "THỊ TRẤN ĐÃ ĐẦY",
        "🏰"
      );
      return;
    }

    const idx = (window.gameState.waitingHunters || []).findIndex(h => h.id === hunterId);
    if (idx === -1) return;

    const [hunter] = window.gameState.waitingHunters.splice(idx, 1);
    window.gameState.hunters.push(hunter);

    window.logTicker.add(`✨ [TIẾP NHẬN]: Thợ săn [${hunter.name}] đã chính thức gia nhập thị trấn!`, 'loot');
    window.showToast(`Đã tiếp nhận [${hunter.name}] vào thị trấn!`, 'success', 'TIẾP NHẬN THÀNH CÔNG');
    if (window.soundFX) window.soundFX.playLevelUp();

    window.gameState.save();
    this.populateRecruitModal();
    if (window.renderer) window.renderer.renderAsciiMap();
  }

  dismissWaitingHunter(hunterId) {
    const idx = (window.gameState.waitingHunters || []).findIndex(h => h.id === hunterId);
    if (idx === -1) return;

    const [hunter] = window.gameState.waitingHunters.splice(idx, 1);
    window.gameState.gold += 30;

    window.logTicker.add(`🚪 [TRỤC XUẤT]: Đã trục xuất thợ săn [${hunter.name}] khỏi hàng chờ (+30g đền bù)!`, 'system');
    window.showToast(`Đã trục xuất [${hunter.name}] khỏi hàng chờ (+30g)!`, 'warning', 'ĐÃ TRỤC XUẤT');

    window.gameState.save();
    this.populateRecruitModal();
  }

  admitAllWaiting() {
    const availableSlots = window.gameState.maxHunters - window.gameState.hunters.length;
    if (availableSlots <= 0) {
      window.showAlert(
        `Thị trấn đã đầy chỗ ở (${window.gameState.hunters.length}/${window.gameState.maxHunters})!\n\nHãy nâng cấp Tòa Thị Chính hoặc trục xuất thợ săn khác để lấy chỗ trống.`,
        "THỊ TRẤN ĐÃ ĐẦY",
        "🏰"
      );
      return;
    }

    if (!window.gameState.waitingHunters || window.gameState.waitingHunters.length === 0) {
      window.showToast("Hàng chờ chiêu mộ hiện đang trống!", "warning", "THÔNG BÁO");
      return;
    }

    // Rank priority order
    const rankWeight = { LEGEND: 4, HEROIC: 3, SUPERIOR: 2, RARE: 1, NORMAL: 0 };
    window.gameState.waitingHunters.sort((a, b) => (rankWeight[b.rankKey] || 0) - (rankWeight[a.rankKey] || 0));

    let count = 0;
    while (window.gameState.hunters.length < window.gameState.maxHunters && window.gameState.waitingHunters.length > 0) {
      const hunter = window.gameState.waitingHunters.shift();
      window.gameState.hunters.push(hunter);
      count++;
    }

    window.logTicker.add(`✨ [TIẾP NHẬN HÀNG LOẠT]: Đã tiếp nhận ${count} thợ săn ưu tú vào thị trấn!`, 'loot');
    window.showToast(`Đã tiếp nhận ${count} thợ săn vào thị trấn!`, 'success', 'THÀNH CÔNG');
    if (window.soundFX) window.soundFX.playLevelUp();

    window.gameState.save();
    this.populateRecruitModal();
    if (window.renderer) window.renderer.renderAsciiMap();
  }

  dismissAllWaiting() {
    const waitingHunters = window.gameState.waitingHunters || [];
    const count = waitingHunters.length;
    if (count === 0) {
      window.showToast("Hàng chờ chiêu mộ hiện đang trống!", "warning", "THÔNG BÁO");
      return;
    }

    const totalGold = count * 30;
    window.showConfirm(
      `Bạn có chắc chắn muốn TRỤC XUẤT TOÀN BỘ ${count} thợ săn đang trong hàng chờ không?\n\n💰 Tiền bồi thường nhận lại: +${totalGold} GOLD (${count} x 30g).`,
      "XÁC NHẬN TRỤC XUẤT HÀNG LOẠT",
      () => {
        window.gameState.waitingHunters = [];
        window.gameState.gold += totalGold;
        window.logTicker.add(`🚪 [TRỤC XUẤT HÀNG LOẠT]: Đã trục xuất toàn bộ ${count} thợ săn khỏi hàng chờ (+${totalGold}g đền bù)!`, 'system');
        window.showToast(`Đã trục xuất ${count} thợ săn (+${totalGold}g)!`, 'warning', 'ĐÃ TRỤC XUẤT');
        window.gameState.save();
        this.populateRecruitModal();
      },
      null,
      "🚪"
    );
  }

  performSummon(count = 1) {
    const waitingHunters = window.gameState.waitingHunters || [];

    // Max waiting queue limit (20)
    if (waitingHunters.length + count > 20) {
      window.showAlert(
        `Hàng chờ chiêu mộ đã đầy (${waitingHunters.length}/20 thợ săn)!\n\nHãy tiếp nhận hoặc trục xuất bớt thợ săn trong hàng chờ trước khi quay thêm.`,
        "HÀNG CHỜ ĐÃ ĐẦY",
        "📋"
      );
      return;
    }

    // Cost in Gems (10% discount for 10x: 45 gems instead of 50)
    const totalCost = count === 10 ? 45 : (count * 5);
    if (window.gameState.gems < totalCost) {
      window.showAlert(
        `Không đủ Ngọc Thần Bí (Cần 💎${totalCost} Ngọc)!\n\nHãy hoàn thành các nhiệm vụ Treo Thưởng hoặc Thành Tựu để kiếm thêm Kim Cương.`,
        "THIẾU NGỌC THẦN BÍ",
        "💎"
      );
      return;
    }
    window.gameState.gems -= totalCost;

    const results = [];
    let admittedCount = 0;
    let queuedCount = 0;

    for (let i = 0; i < count; i++) {
      let rankKey = "NORMAL";

      // Tỉ lệ phẩm cấp:
      // Huyền Thoại: 0.1%
      // Anh Hùng: 1.0%
      // Ưu Tú: 20.0%
      // Hiếm: 80.0%
      // Thường: 100% (cơ bản khi không trúng các phẩm cấp trên)
      if (Math.random() < 0.001) {
        rankKey = "LEGEND";
      } else if (Math.random() < 0.01) {
        rankKey = "HEROIC";
      } else if (Math.random() < 0.20) {
        rankKey = "SUPERIOR";
      } else if (Math.random() < 0.80) {
        rankKey = "RARE";
      } else {
        rankKey = "NORMAL";
      }

      // Random Class
      const classKeys = Object.keys(CONFIG.HUNTER_CLASSES);
      const classKey = classKeys[Math.floor(Math.random() * classKeys.length)];

      const newHunter = new Hunter({
        classKey: classKey,
        rankKey: rankKey,
        level: 1
      });

      // If town has free slot, directly admit to town! Otherwise, put in waiting queue!
      if (window.gameState.hunters.length < window.gameState.maxHunters) {
        window.gameState.hunters.push(newHunter);
        newHunter._admittedToTown = true;
        admittedCount++;
      } else {
        if (!window.gameState.waitingHunters) window.gameState.waitingHunters = [];
        window.gameState.waitingHunters.push(newHunter);
        newHunter._admittedToTown = false;
        queuedCount++;
      }

      results.push(newHunter);
    }

    // Render Summon Results
    const resultBox = document.getElementById('recruit-result-box');
    resultBox.classList.remove('hidden');

    let resHtml = `<div style="font-weight:bold; font-size:12px; color:#ffd700; margin-bottom:4px;">🎉 KẾT QUẢ TRIỆU HỒI (${results.length} ANH HÙNG - ${admittedCount} vào làng, ${queuedCount} vào hàng chờ):</div>`;
    
    results.forEach(h => {
      const rank = CONFIG.HUNTER_RANKS[h.rankKey];
      const cls = CONFIG.HUNTER_CLASSES[h.classKey];
      const cardClass = h.rankKey === 'LEGEND' ? 'legend-card' : 
        (h.rankKey === 'HEROIC' ? 'heroic-card' : 
        (h.rankKey === 'SUPERIOR' ? 'superior-card' : 
        (h.rankKey === 'RARE' ? 'rare-card' : 'normal-card')));
      const statusTag = h._admittedToTown ? `<span style="color:var(--accent-green);">[Đã vào thị trấn]</span>` : `<span style="color:var(--accent-cyan);">[Đang ở Hàng Chờ]</span>`;

      resHtml += `
        <div class="gacha-result-card ${cardClass}">
          <div class="item-info">
            <div style="font-weight:bold; font-size:12px; color:${rank.color};">
              ${rank.icon} ${cls.icon} ${h.name} [${rank.name.toUpperCase()}] ${statusTag}
            </div>
            <div style="font-size:10px; color:var(--text-main);">
              Hệ: <b>${cls.name}</b> | Đặc tính: <b>${h.trait.icon} ${h.trait.name}</b> (${h.trait.desc})
            </div>
            <div style="font-size:10px; color:var(--accent-green);">
              ❤️ HP: ${h.maxHp} | ⚡ ATK: ${h.atk} | 🛡️ DEF: ${h.def}
            </div>
          </div>
        </div>
      `;
    });

    resultBox.innerHTML = resHtml;

    if (queuedCount > 0) {
      window.logTicker.add(`🔮 Triệu hồi ${results.length} thợ săn (${admittedCount} vào làng, ${queuedCount} vào Hàng Chờ)!`, 'loot');
    } else {
      window.logTicker.add(`🔮 Đã chiêu mộ thành công ${results.length} thợ săn mới gia nhập thị trấn!`, 'loot');
    }

    if (window.soundFX) window.soundFX.playLevelUp();
    window.gameState.save();
    this.populateRecruitModal();
    if (window.renderer) window.renderer.renderAsciiMap();
  }

  // ==========================================
  // VIỆN NGHIÊN CỨU CÔNG NGHỆ (RESEARCH TECH TREE)
  // ==========================================
  populateResearchModal(branchFilter = 'all') {
    const list = document.getElementById('research-tech-list');
    const header = document.getElementById('research-progress-header');
    if (!list) return;

    if (!window.gameState.researched) {
      window.gameState.researched = {};
    }

    const allTechs = CONFIG.RESEARCH_TECHS || [];
    const researchedCount = Object.keys(window.gameState.researched).filter(k => window.gameState.researched[k]).length;
    const totalCount = allTechs.length;
    const progressPct = Math.round((researchedCount / Math.max(1, totalCount)) * 100);

    if (header) {
      header.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:16px;">🔬</span>
          <div>
            <span style="font-weight:bold; color:var(--accent-cyan);">Tiến Độ Nghiên Cứu:</span>
            <span style="color:#39ff14; font-weight:bold;">${researchedCount}/${totalCount} Công Nghệ (${progressPct}%)</span>
          </div>
        </div>
        <div style="color:#ffd700; font-weight:bold;">💰 Ngân Khố: 💰${CONFIG.formatNumber(window.gameState.gold)}</div>
      `;
    }

    const filteredTechs = branchFilter === 'all' 
      ? allTechs 
      : allTechs.filter(t => t.branch === branchFilter);

    const branchIcons = {
      economy: '💰',
      military: '⚔️',
      survival: '🧪',
      hunting: '🏹'
    };

    const branchNames = {
      economy: 'Kinh Tế & Thủ Thành',
      military: 'Quân Sự & Bạo Kích',
      survival: 'Y Thuật & Sinh Tồn',
      hunting: 'Hầm Ngục & Săn Bắt'
    };

    let html = "";
    filteredTechs.forEach(t => {
      const isResearched = !!window.gameState.researched[t.id];
      const townLvl = window.gameState.townLevel || 1;
      const reqLvl = t.reqTownLvl || 1;
      const isLevelMet = townLvl >= reqLvl;
      const costStr = CONFIG.formatNumber ? CONFIG.formatNumber(t.costGold) : t.costGold.toLocaleString();
      const canAfford = window.gameState.gold >= t.costGold;
      const bIcon = branchIcons[t.branch] || '💡';
      const bName = branchNames[t.branch] || t.branch;

      let actionBtn = "";
      if (isResearched) {
        actionBtn = `
          <span style="font-size:10px; font-weight:bold; color:#39ff14; background:rgba(57,255,20,0.12); padding:4px 8px; border-radius:4px; border:1px solid rgba(57,255,20,0.35);">
            ✅ ĐÃ NGHIÊN CỨU
          </span>
        `;
      } else if (!isLevelMet) {
        actionBtn = `
          <span style="font-size:10px; font-weight:bold; color:#ff5577; background:rgba(255,85,119,0.12); padding:4px 8px; border-radius:4px; border:1px solid rgba(255,85,119,0.35);">
            🔒 Cần Thị Trấn Cấp ${reqLvl}
          </span>
        `;
      } else {
        actionBtn = `
          <button class="btn-primary" style="font-size:11px; padding:5px 10px; font-weight:bold; ${canAfford ? '' : 'opacity:0.6;'}" onclick="window.app.performResearch('${t.id}')">
            🧪 Nghiên Cứu (💰${costStr})
          </button>
        `;
      }

      html += `
        <div class="item-card ${isResearched ? 'can-craft' : ''}" style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; border-color:${isResearched ? 'rgba(57,255,20,0.3)' : 'var(--border-color)'};">
          <div class="item-info" style="flex:1; margin-right:10px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:14px;">${bIcon}</span>
              <span style="font-size:12px; font-weight:bold; color:${isResearched ? '#39ff14' : '#00e5ff'};">${t.name}</span>
              <span style="font-size:9px; color:var(--text-muted); background:rgba(255,255,255,0.06); padding:1px 5px; border-radius:3px;">[${bName}]</span>
            </div>
            <div style="font-size:11px; color:#d0dbe5; margin-top:2px;">${t.desc}</div>
            <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">
              Yêu cầu: <b style="color:${isLevelMet ? '#39ff14' : '#ffaa00'};">Thị Trấn Cấp ${reqLvl}</b> (Hiện có: Cấp ${townLvl}) | Chi phí: <b style="color:#ffd700;">💰${costStr} GOLD</b>
            </div>
          </div>
          <div style="text-align:right; white-space:nowrap;">
            ${actionBtn}
          </div>
        </div>
      `;
    });

    list.innerHTML = html;
  }

  performResearch(techId) {
    const tech = (CONFIG.RESEARCH_TECHS || []).find(t => t.id === techId);
    if (!tech) return;

    const townLvl = window.gameState.townLevel || 1;
    if (townLvl < (tech.reqTownLvl || 1)) {
      alert(`Thị trấn cần đạt Cấp ${tech.reqTownLvl} để nghiên cứu công nghệ này!`);
      return;
    }

    if (window.gameState.gold < tech.costGold) {
      alert(`Không đủ vàng để nghiên cứu (Cần 💰${CONFIG.formatNumber(tech.costGold)} GOLD)!`);
      return;
    }

    // Deduct gold & mark researched
    window.gameState.spendGold(tech.costGold);
    if (!window.gameState.researched) window.gameState.researched = {};
    window.gameState.researched[techId] = true;

    // Recalculate town parameters if affected
    if (window.gameState.recalculateMaxStorage) {
      window.gameState.recalculateMaxStorage();
    }
    if (window.gameState.getGateMaxHp) {
      window.gameState.maxGateHp = window.gameState.getGateMaxHp();
    }

    window.logTicker.add(`💡 [ĐỘT PHÁ CÔNG NGHỆ]: Đã nghiên cứu thành công [${tech.name}]! (${tech.desc})`, 'special');
    if (window.soundFX && window.soundFX.playLevelUp) window.soundFX.playLevelUp();
    if (window.showToast) {
      window.showToast(`Nghiên cứu thành công [${tech.name}]!`, 'success', '💡 VIỆN NGHIÊN CỨU');
    }

    window.gameState.save();
    this.populateResearchModal(this.currentResearchBranch || 'all');
  }
}

// Global hook for offline modal
window.showOfflineModal = function(mins, gold, kills, loot) {
  document.getElementById('off-time').textContent = `${mins} phút`;
  document.getElementById('off-gold').textContent = gold;
  document.getElementById('off-kills').textContent = kills;
  document.getElementById('off-loot').textContent = loot;
  window.app.openModal('modal-offline');
};

// Initialize App on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
