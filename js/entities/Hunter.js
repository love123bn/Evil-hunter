/**
 * TOWN OF HUNTERS - AUTONOMOUS HUNTER AI ENTITY
 */

const HUNTER_NAMES = [
  // Danh xưng Dũng Tướng & Hiệp Khách (Nam)
  "Thanh Phong", "Huyền Vũ", "Bạch Hổ", "Chu Tước", "Minh Vương", "Vô Cực", "Lâm Phong", "Hải Đăng", 
  "Quang Khải", "Bảo Long", "Hoàng Nam", "Tuấn Kiệt", "Thiên Ân", "Văn Hùng", "Tiến Dũng", "Chí Kiên", 
  "Anh Dũng", "Mạnh Hùng", "Đức Trọng", "Trường Giang", "Bá Đạo", "Quốc Bảo", "Nhật Minh", "Thái Sơn", 
  "Long Ẩn", "Hắc Báo", "Vũ Ca", "Phong Vân", "Bá Vương", "Độc Cô", "Lạc Long", "Bạch Long", 
  "Hắc Hổ", "Kim Cang", "Lôi Thần", "Viêm Đế", "Thiên Lang", "Phi Long", "Cuồng Phong", "Bắc Đẩu", 
  "Tử Long", "Dực Đức", "Vân Trường", "Trọng Đạt", "Bá Ước", "Phụng Tiên", "Khắc Cường", "Đăng Khoa",
  "Tấn Tài", "Hữu Nghĩa", "Gia Bảo", "Minh Triết", "Hải Triều", "Phong Thần", "Liệt Hỏa", "Băng Ma",

  // Danh xưng Hiệp Nữ & Nữ Thần (Nữ)
  "Tuyết Mai", "Ngọc Bích", "Bích Dao", "Linh Nhi", "Ánh Nguyệt", "Thanh Hà", "Diệu Huyền", "Hồng Loan", 
  "Thục Quyên", "Mỹ Duyên", "Mai Hoa", "Thu Thảo", "Bảo Trâm", "Tuyết Nhi", "Cẩm Tú", "Kim Ngân", 
  "Yến Vy", "Thanh Vân", "Mộng Điệp", "Ngọc Hân", "Băng Tâm", "Khánh Linh", "Bảo Ngọc", "Phương Thảo", 
  "Hồng Hạnh", "Bạch Tuyết", "Nguyệt Nga", "Bích Thủy", "Thanh Trúc", "Tử Lan", "Hải Yến", "Thảo My",
  "Khánh Thi", "Minh Châu", "Bảo Châu", "Diễm My", "Thúy Kiều", "Hoàng Yến", "Tố Nga", "Thục Đoan"
];

class Hunter {
  constructor(options = {}) {
    this.id = options.id || "h_" + Math.random().toString(36).substr(2, 9);
    this.name = options.name || HUNTER_NAMES[Math.floor(Math.random() * HUNTER_NAMES.length)];
    
    // Normalize classKey and rankKey to uppercase with safe fallback
    const rawClass = (options.classKey || "BERSERKER").toUpperCase();
    this.classKey = CONFIG.HUNTER_CLASSES[rawClass] ? rawClass : "BERSERKER";

    const rawRank = (options.rankKey || "NORMAL").toUpperCase();
    this.rankKey = CONFIG.HUNTER_RANKS[rawRank] ? rawRank : "NORMAL";

    const allTraits = CONFIG.HUNTER_TRAITS || [
      { id: "brave", name: "Dũng Cảm", desc: "+15% Sát thương khi máu dưới 30%", icon: "🔥" }
    ];
    const randomTrait = allTraits[Math.floor(Math.random() * allTraits.length)];
    this.trait = options.trait && options.trait.id ? options.trait : randomTrait;
    
    const classData = CONFIG.HUNTER_CLASSES[this.classKey] || CONFIG.HUNTER_CLASSES.BERSERKER;
    const rankData = CONFIG.HUNTER_RANKS[this.rankKey] || CONFIG.HUNTER_RANKS.NORMAL;
    const multiplier = rankData.multiplier || 1.0;

    this.level = Number(options.level) || 1;
    this.reincarnation = Number(options.reincarnation) || 0; // Cảnh giới chuyển sinh (⭐)
    this.exp = Number(options.exp) || 0;
    this.maxExp = options.maxExp || Hunter.getMaxExpForLevel(this.level);

    const minBaseHp = Math.floor(classData.baseHp * multiplier);
    const minBaseAtk = Math.floor(classData.baseAtk * multiplier);
    const minBaseDef = Math.floor(classData.baseDef * multiplier);

    this.maxHp = options.maxHp !== undefined ? Math.max(minBaseHp, Number(options.maxHp)) : minBaseHp;
    this.hp = options.hp !== undefined ? Math.min(this.maxHp, Math.max(1, Number(options.hp))) : this.maxHp;
    this.atk = options.atk !== undefined ? Math.max(minBaseAtk, Number(options.atk)) : minBaseAtk;
    this.def = options.def !== undefined ? Math.max(minBaseDef, Number(options.def)) : minBaseDef;
    this.atkSpeed = classData.atkSpeed || 1.0;

    // Survival gauges (0 to 100)
    this.hunger = options.hunger !== undefined ? Number(options.hunger) : 100;
    this.fatigue = options.fatigue !== undefined ? Number(options.fatigue) : 100;

    // Food Buffs
    this.foodBuffAtk = Number(options.foodBuffAtk) || 0;
    this.foodBuffTimer = Number(options.foodBuffTimer) || 0;

    // Economy & Inventory
    this.gold = Number(options.gold) || 30; // Hunter's personal wallet
    this.bag = Array.isArray(options.bag) ? options.bag : []; // Raw loot items they are carrying

    // Equipment (5 slots: Weapon, Armor, Ring, Amulet, Talisman)
    this.weapon = options.weapon || null;     // e.g. { id, name, atk }
    this.armor = options.armor || null;       // e.g. { id, name, def, hp }
    this.ring = options.ring || null;         // e.g. { id, name, atk, crit }
    this.amulet = options.amulet || null;     // e.g. { id, name, def, hp, critDmg }
    this.talisman = options.talisman || null; // e.g. { id, name, atk, critRate }
    this.weaponPlus = Number(options.weaponPlus) || 0;     // +1 to +30
    this.armorPlus = Number(options.armorPlus) || 0;       // +1 to +30
    this.ringPlus = Number(options.ringPlus) || 0;         // +1 to +30
    this.amuletPlus = Number(options.amuletPlus) || 0;     // +1 to +30
    this.talismanPlus = Number(options.talismanPlus) || 0; // +1 to +30

    // AI State Machine: 'HUNTING', 'FIGHTING', 'RETURNING', 'SELLING', 'EATING', 'RESTING', 'HEALING', 'SHOPPING', 'DEAD'
    this.state = options.state || 'HUNTING';
    this.targetMonster = null;
    this.stateTimer = 0;
    this.hasInnBed = options.hasInnBed || false;
    this.activityLog = options.activityLog || "Đang săn quái vật...";

    // Visual position on ASCII 2D field
    this.x = options.x || Math.floor(Math.random() * 8) + 12;
    this.y = options.y || Math.floor(Math.random() * 4) + 1;
  }

  // Get total ATK including weapon, ring, talisman, plus bonuses & buffs
  getTotalAtk() {
    let wpnAtk = 0;
    if (this.weapon && this.weapon.atk) {
      const bonusPct = 1 + ((this.weaponPlus || 0) * 0.1);
      wpnAtk = Math.floor(this.weapon.atk * bonusPct);
    }
    let ringAtk = 0;
    if (this.ring && this.ring.atk) {
      let bonusPct = 1 + ((this.ringPlus || 0) * 0.1);
      if (window.gameState?.researched?.tech_talisman_craft) bonusPct *= 1.20;
      ringAtk = Math.floor(this.ring.atk * bonusPct);
    }
    let talAtk = 0;
    if (this.talisman && this.talisman.atk) {
      let bonusPct = 1 + ((this.talismanPlus || 0) * 0.1);
      if (window.gameState?.researched?.tech_talisman_craft) bonusPct *= 1.20;
      talAtk = Math.floor(this.talisman.atk * bonusPct);
    }
    let val = (this.atk || 10) + wpnAtk + ringAtk + talAtk;
    if (this.foodBuffTimer > 0 && this.foodBuffAtk > 0) {
      val += this.foodBuffAtk;
    }
    if (this.trait && this.trait.id === "brave" && (this.hp / (this.maxHp || 1)) < 0.3) {
      val = Math.floor(val * 1.15);
    }
    if (window.gameState.researched?.tech_sharp_blade) {
      val = Math.floor(val * 1.15);
    }
    if (window.gameState?.researched?.tech_divine_smith) {
      val = Math.floor(val * 1.25);
    }
    if (window.gameState?.researched?.tech_ballista_towers) {
      val += 100;
    }
    return val;
  }

  // Get total DEF including armor, amulet, plus bonuses & tech
  getTotalDef() {
    let amrDef = 0;
    if (this.armor && this.armor.def) {
      const bonusPct = 1 + ((this.armorPlus || 0) * 0.1);
      amrDef = Math.floor(this.armor.def * bonusPct);
    }
    let amuletDef = 0;
    if (this.amulet && this.amulet.def) {
      let bonusPct = 1 + ((this.amuletPlus || 0) * 0.1);
      if (window.gameState?.researched?.tech_talisman_craft) bonusPct *= 1.20;
      amuletDef = Math.floor(this.amulet.def * bonusPct);
    }
    let val = (this.def || 5) + amrDef + amuletDef;
    if (window.gameState?.researched?.tech_divine_smith) {
      val = Math.floor(val * 1.25);
    }
    if (window.gameState?.researched?.tech_fortified_bastion) {
      val = Math.floor(val * 1.20);
    }
    return val;
  }

  // Get total Max HP including gear bonus
  getTotalMaxHp() {
    let bonusHp = 0;
    if (this.armor && this.armor.hp) {
      const bonusPct = 1 + ((this.armorPlus || 0) * 0.1);
      bonusHp += Math.floor(this.armor.hp * bonusPct);
    }
    if (this.amulet && this.amulet.hp) {
      const bonusPct = 1 + ((this.amuletPlus || 0) * 0.1);
      bonusHp += Math.floor(this.amulet.hp * bonusPct);
    }
    return (this.maxHp || 100) + bonusHp;
  }

  // TÍNH TỔNG TỈ LỆ CHÍ MẠNG (CRIT RATE - Giá trị từ 0.05 đến 0.95)
  getCritRate() {
    const rankData = CONFIG.HUNTER_RANKS[this.rankKey] || CONFIG.HUNTER_RANKS.NORMAL;
    let rate = 0.05 + (rankData.critRate || 0); // Base 5% + Phẩm cấp thiên phú

    if (this.classKey === 'assassin' || this.classKey === 'RANGER') rate += 0.10; // +10% cho Cung thủ / Sát thủ

    // Talisman (Pháp Bảo)
    if (this.talisman && this.talisman.critRate) {
      let bonusPct = 1 + ((this.talismanPlus || 0) * 0.1);
      if (window.gameState?.researched?.tech_talisman_craft) bonusPct *= 1.20;
      rate += (this.talisman.critRate * bonusPct) / 100;
    }
    // Ring (Nhẫn)
    if (this.ring && this.ring.crit) {
      let bonusPct = 1 + ((this.ringPlus || 0) * 0.1);
      if (window.gameState?.researched?.tech_talisman_craft) bonusPct *= 1.20;
      rate += (this.ring.crit * bonusPct) / 100;
    }
    // Trait bonus
    if (this.trait && (this.trait.id === 'eagle' || this.trait.id === 'crit')) {
      rate += 0.10;
    }
    // Tech: Crit Mastery (+10% Crit Rate)
    if (window.gameState?.researched?.tech_crit_mastery) {
      rate += 0.10;
    }
    // Tech: Godly Armory (+20% Crit Rate)
    if (window.gameState?.researched?.tech_godly_armory) {
      rate += 0.20;
    }
    return Math.min(0.95, Math.max(0.05, rate));
  }

  // TÍNH TỔNG SÁT THƯƠNG CHÍ MẠNG (CRIT DAMAGE - Khởi điểm 1.5x)
  getCritDamage() {
    const rankData = CONFIG.HUNTER_RANKS[this.rankKey] || CONFIG.HUNTER_RANKS.NORMAL;
    let mul = 1.50 + (rankData.critDmg || 0); // 150% Base + Phẩm cấp thiên phú

    // Amulet (Dây Chuyền)
    if (this.amulet && this.amulet.critDmg) {
      let bonusPct = 1 + ((this.amuletPlus || 0) * 0.1);
      if (window.gameState?.researched?.tech_talisman_craft) bonusPct *= 1.20;
      mul += (this.amulet.critDmg * bonusPct) / 100;
    }
    // Trait bonus
    if (this.trait && this.trait.id === 'berserk') {
      mul += 0.35;
    }
    // Tech: Crit Mastery (+35% Crit Damage)
    if (window.gameState?.researched?.tech_crit_mastery) {
      mul += 0.35;
    }
    // Tech: Godly Armory (+50% Crit Damage)
    if (window.gameState?.researched?.tech_godly_armory) {
      mul += 0.50;
    }
    return Math.max(1.50, mul);
  }

  // TÍNH TOÁN LỰC CHIẾN (COMBAT POWER / CP)
  getCombatPower() {
    const totalAtk = this.getTotalAtk();
    const totalDef = this.getTotalDef();
    const maxHp = this.getTotalMaxHp();
    const critRate = this.getCritRate();
    const critDmg = this.getCritDamage();
    const star = this.reincarnation || 0;
    const rankData = CONFIG.HUNTER_RANKS[this.rankKey] || CONFIG.HUNTER_RANKS.NORMAL;
    const rankCpMultiplier = rankData.cpMul || 1.0;
    
    // Công thức: (Sát Thương * 3.0 + Giáp * 3.5 + Máu * 1.0) * Hệ Số Bạo Kích * Hệ Số Sao * Hệ Số Phẩm Cấp
    const basePower = (totalAtk * 3.0) + (totalDef * 3.5) + (maxHp * 1.0);
    const critMultiplier = 1 + (critRate * (critDmg - 1.0));
    const starMult = 1 + (star * 0.4);
    
    return Math.floor(basePower * critMultiplier * starMult * rankCpMultiplier);
  }

  // AI Update Tick
  update(delta) {
    if (this.state === 'DEAD') {
      this.handleDeadState();
      return;
    }

    // Decrement hunger & fatigue slowly
    this.hunger = Math.max(0, this.hunger - 0.05);
    this.fatigue = Math.max(0, this.fatigue - 0.04);

    // Decrement food buff duration
    if (this.foodBuffTimer > 0) {
      this.foodBuffTimer = Math.max(0, this.foodBuffTimer - 0.05);
      if (this.foodBuffTimer <= 0) {
        this.foodBuffAtk = 0;
      }
    }

    // Urgent needs evaluation
    if (this.hp <= 0) {
      this.die();
      return;
    }

    // Check critical triggers
    if (this.state === 'HUNTING' || this.state === 'FIGHTING') {
      if (this.hp < this.maxHp * 0.25) {
        this.changeState('HEALING', 'Máu thấp! Chạy về Trạm Y Tế');
        return;
      }
      if (this.hunger < 20) {
        this.changeState('EATING', 'Bụng réo đói! Về Quán Ăn');
        return;
      }
      if (this.fatigue < 15) {
        this.changeState('RESTING', 'Quá mệt mỏi! Về Quán Trọ ngủ');
        return;
      }
      if (this.bag.length >= 4) {
        this.changeState('SELLING', 'Túi đồ đầy! Về Sàn Giao Dịch bán loot');
        return;
      }
    }

    // State Handlers
    switch (this.state) {
      case 'HUNTING':
        this.handleHunting();
        break;
      case 'FIGHTING':
        this.handleFighting();
        break;
      case 'SELLING':
        this.handleSelling();
        break;
      case 'EATING':
        this.handleEating();
        break;
      case 'RESTING':
        this.handleResting();
        break;
      case 'HEALING':
        this.handleHealing();
        break;
      case 'SHOPPING':
        this.handleShopping();
        break;
    }
  }

  changeState(newState, logMsg) {
    this.state = newState;
    this.stateTimer = 0;
    if (logMsg) {
      this.activityLog = logMsg;
    }
  }

  handleHunting() {
    this.stateTimer++;
    this.activityLog = "Đang tìm quái vật...";

    // Periodically check if hunter can upgrade gear/enchant while wandering
    if (this.stateTimer >= 6 && typeof EconomySystem !== 'undefined' && EconomySystem.canHunterUpgradeEquipment(this)) {
      this.changeState('SHOPPING', 'Đủ tiền và nguyên liệu! Ghé Lò Rèn sắm trang bị');
      return;
    }

    // Search target monster
    const activeMonsters = window.gameState.monsters.filter(m => m.hp > 0);
    if (activeMonsters.length > 0) {
      this.targetMonster = activeMonsters[Math.floor(Math.random() * activeMonsters.length)];
      this.changeState('FIGHTING', `Tấn công [${this.targetMonster.name}]!`);
    } else {
      // Wander
      this.x = Math.max(10, Math.min(22, this.x + (Math.random() > 0.5 ? 1 : -1)));
    }
  }

  handleFighting() {
    if (!this.targetMonster || this.targetMonster.hp <= 0) {
      this.targetMonster = null;
      this.changeState('HUNTING', 'Quái đã chết! Tìm mục tiêu mới');
      return;
    }

    this.activityLog = `Đang giao tranh với ${this.targetMonster.name}`;
    CombatSystem.performAttack(this, this.targetMonster);
  }

  handleSelling() {
    this.stateTimer++;

    // Initial inspection delay (first 2 ticks = 1.0s)
    if (this.stateTimer <= 2) {
      this.activityLog = `Đang kiểm kê ${this.bag.length} món đồ tại Sàn Giao Dịch...`;
      return;
    }

    // Process selling 1 item every 2 ticks (1.0s delay per item)
    if (this.bag.length > 0) {
      if (this.stateTimer % 2 === 0) {
        const itemKey = this.bag[this.bag.length - 1];
        const itemData = CONFIG.ITEMS[itemKey];
        if (itemData) {
          const price = itemData.basePrice;

          // Check if Town Treasury has enough gold to buy the loot
          if (window.gameState.gold >= price) {
            if (window.gameState.addItem(itemKey, 1)) {
              this.bag.pop(); // Remove item from hunter's bag
              this.gold += price; // Hunter gets paid
              window.gameState.gold -= price; // Town pays for raw material
              window.logTicker.add(`⚖️ [GIAO DỊCH]: Thị Trấn thu mua 1x [${itemData.name}] từ [${this.name}] (-${price} GOLD Thị trấn, +${price} GOLD Thợ săn)`, 'trade');
            } else {
              // Town storage is full
              delete this._finishSellingTimer;
              this.changeState('HUNTING', 'Kho thị trấn đầy! Tiếp tục đi săn');
              window.logTicker.add(`⚠️ Kho Thị Trấn đã đầy! Không thể thu mua thêm từ [${this.name}]`, 'danger');
              return;
            }
          } else {
            // Town is broke
            delete this._finishSellingTimer;
            this.changeState('HUNTING', 'Thị trấn hết tiền thu mua! Tạm giữ loot');
            window.logTicker.add(`⚠️ Ngân khố không đủ ${price} GOLD để mua [${itemData.name}] từ [${this.name}]!`, 'danger');
            return;
          }
        } else {
          this.bag.pop();
        }
      }
      this.activityLog = `Đang giao nộp nguyên liệu vào Kho (${this.bag.length} món còn lại)...`;
      return;
    }

    // Final settlement delay (1.0s wrap-up after all items sold)
    if (!this._finishSellingTimer) {
      this._finishSellingTimer = this.stateTimer;
    }

    this.activityLog = "Đã nhận đủ tiền! Chuẩn bị xuất phát...";

    if (this.stateTimer - this._finishSellingTimer >= 2) {
      delete this._finishSellingTimer;
      // Check if hunter can upgrade weapon/armor/enchant
      if (typeof EconomySystem !== 'undefined' && EconomySystem.canHunterUpgradeEquipment(this)) {
        this.changeState('SHOPPING', 'Đủ tiền và nguyên liệu! Ghé Lò Rèn sắm trang bị');
      } else {
        this.changeState('HUNTING', 'Tiếp tục ra bãi săn quái kiếm vàng');
      }
    }
  }

  handleEating() {
    this.stateTimer++;
    const tavernLvl = window.gameState.buildings.tavern?.level || 1;
    const requiredTimer = Math.max(4, 8 - (tavernLvl - 1)); // Lv.1: 4s (8 ticks), Lv.3: 3s, Lv.5+: 2s
    this.activityLog = `Đang dùng bữa tại Quán Ăn (${Math.min(100, Math.round((this.stateTimer / requiredTimer) * 100))}%)...`;
    if (this.stateTimer >= requiredTimer) {
      // EconomySystem handles gourmet meal or scaled basic meal + atk buff
      EconomySystem.autoServeFood(this);
      if (typeof EconomySystem !== 'undefined' && EconomySystem.canHunterUpgradeEquipment(this)) {
        this.changeState('SHOPPING', 'No bụng rồi! Ghé Lò Rèn nâng cấp trang bị');
      } else {
        this.changeState('HUNTING', 'Đã no bụng, quay lại bãi săn');
      }
    }
  }

  // Calculate progressive exponential Inn resting fee based on hunter level, rank and inn level
  static calculateInnFee(hunter, innLvl = 1) {
    const lvl = Number(hunter?.level) || 1;
    // Exponential formula: 30 * (1.045 ^ lvl) + 15 * (1.06 ^ innLvl)
    let base = Math.floor(30 * Math.pow(1.045, lvl) + 15 * Math.pow(1.06, innLvl));
    
    // Rank multiplier: Higher rank hunters pay premium for luxury suite
    const rankMultipliers = {
      NORMAL: 1.0,
      SUPERIOR: 1.3,
      RARE: 1.6,
      EPIC: 2.0,
      LEGEND: 2.5,
      MYTHIC: 3.2
    };
    const rKey = (hunter?.rankKey || 'NORMAL').toUpperCase();
    const mult = rankMultipliers[rKey] || 1.0;
    
    return Math.max(45, Math.floor(base * mult));
  }

  // Calculate Inn fatigue recovery rate per tick (every 0.5s)
  static getInnRecoveryRate(innLvl = 1) {
    // Base rate: 4 fatigue / tick, +1 per Inn Level (~10-12s sleep at Lv.1)
    let rate = 4 + (innLvl - 1) * 1;
    if (window.gameState?.researched?.tech_feather_bed) {
      rate += 3; // Tech bonus: Giường Lông Vũ +3/tick
    }
    return rate;
  }

  handleResting() {
    const innLvl = window.gameState?.buildings?.inn?.level || 1;
    const baseRate = Hunter.getInnRecoveryRate(innLvl);

    // On first tick entering Quán Trọ: charge fee upfront
    if (this.stateTimer === 0) {
      const fee = Hunter.calculateInnFee(this, innLvl);
      if (this.gold >= fee) {
        this.gold -= fee; // Hunter pays
        let earned = fee;
        if (window.gameState?.researched?.tech_tax_master) earned = Math.floor(earned * 1.15);
        window.gameState.addGold(earned);
        window.gameState.buildings.inn.revenue = (window.gameState.buildings.inn.revenue || 0) + earned;
        this.hasInnBed = true;
        window.logTicker.add(`🏨 [${this.name}] thuê phòng Quán Trọ (-${fee} GOLD Thợ săn, +${earned} GOLD Ngân khố | Tốc độ hồi: +${baseRate * 2} Thể lực/s)...`, 'system');
      } else {
        // Sleep on bench/porch: slower recovery
        const paid = Math.max(0, this.gold);
        this.gold = 0;
        if (paid > 0) {
          window.gameState.addGold(paid);
          window.gameState.buildings.inn.revenue = (window.gameState.buildings.inn.revenue || 0) + paid;
        }
        this.hasInnBed = false;
        const benchRate = Math.max(2, Math.floor(baseRate * 0.5));
        window.logTicker.add(`🏨 [${this.name}] không đủ tiền thuê phòng Quán Trọ (Cần 💰${fee} GOLD), ngủ tạm ghế gỗ (+${benchRate * 2} Thể lực/s)...`, 'system');
      }
    }

    this.stateTimer++;

    // Recover fatigue gradually over time based on recovery speed
    const recoverySpeed = this.hasInnBed ? baseRate : Math.max(2, Math.floor(baseRate * 0.5));
    this.fatigue = Math.min(100, (Number(this.fatigue) || 0) + recoverySpeed);
    this.activityLog = `Đang ngủ tại Quán Trọ (${Math.round(this.fatigue)}/100 Thể lực)...`;

    // Only wake up and leave once fatigue reaches 100%!
    if (this.fatigue >= 100) {
      this.fatigue = 100;
      this.hasInnBed = false;
      window.logTicker.add(`🏨 [${this.name}] đã ngủ đủ giấc, hồi phục 100% Thể Lực và sẵn sàng xuất kích!`, 'system');

      if (typeof EconomySystem !== 'undefined' && EconomySystem.canHunterUpgradeEquipment(this)) {
        this.changeState('SHOPPING', 'Thể lực đầy 100%! Ghé Lò Rèn sắm trang bị');
      } else {
        this.changeState('HUNTING', 'Thể lực đầy 100%, tiếp tục đi săn');
      }
    }
  }

  handleHealing() {
    this.stateTimer++;
    const clinicLvl = window.gameState.buildings.clinic?.level || 1;
    const requiredTimer = Math.max(6, 16 - (clinicLvl - 1) * 2); // Lv.1: 8s (16 ticks), Lv.2: 7s, Lv.3: 6s, Lv.4: 5s, Lv.5: 4s, Lv.6+: 3s
    this.activityLog = `Đang điều trị tại Trạm Y Tế (${Math.min(100, Math.round((this.stateTimer / requiredTimer) * 100))}%)...`;
    if (this.stateTimer >= requiredTimer) {
      EconomySystem.autoServeClinic(this);
      if (typeof EconomySystem !== 'undefined' && EconomySystem.canHunterUpgradeEquipment(this)) {
        this.changeState('SHOPPING', 'Đã hồi phục sức khỏe! Ghé Lò Rèn nâng cấp trang bị');
      } else {
        this.changeState('HUNTING', 'Đã hồi phục sức khỏe, xuất kích');
      }
    }
  }

  handleDeadState() {
    this.stateTimer++;
    // Try instant revive via scroll first
    const revived = EconomySystem.autoServeClinic(this);
    if (revived) return;

    this.activityLog = `💀 Tử trận! Đang chờ cứu hộ (${Math.max(1, Math.ceil((20 - this.stateTimer) * 0.5))}s)...`;

    if (this.stateTimer >= 20) { // Natural rescue after 10.0 seconds (20 ticks)
      this.hp = Math.floor(this.maxHp * 0.5);
      this.hunger = 40;
      this.fatigue = 40;
      this.changeState('HEALING', 'Được cứu hộ về Trạm Y Tế');
    }
  }

  handleShopping() {
    this.activityLog = "Đang sắm trang bị tại Lò Rèn...";
    this.stateTimer++;
    if (this.stateTimer >= 2) {
      try {
        EconomySystem.autoServeEquipment(this);
      } catch(err) {
        console.error("autoServeEquipment error:", err);
      }
      this.changeState('HUNTING', 'Tiếp tục ra bãi săn quái kiếm vàng');
    }
  }

  // ĐỊNH NGHĨA ĐƯỜNG CONG EXP LŨY THỪA (Exponential RPG Curve - Càng lên cao càng thử thách)
  static getMaxExpForLevel(level) {
    const lvl = Math.max(1, Number(level) || 1);
    if (lvl <= 100) {
      // Đường cong tăng trưởng kinh nghiệm lũy thừa theo cấp độ
      return Math.floor(60 + (lvl * 65) + Math.pow(lvl, 2.25) * 8.5);
    } else {
      // Cấp độ Cực Hạn Vô Cực (Lv.101+) yêu cầu lượng kinh nghiệm khổng lồ
      const over = lvl - 100;
      const base100 = Math.floor(60 + (100 * 65) + Math.pow(100, 2.25) * 8.5); // ~280,000 EXP
      return Math.floor(base100 + (over * 35000) + Math.pow(over, 2.2) * 6000);
    }
  }

  gainExp(amt) {
    this.exp += amt;
    if (this.exp >= this.maxExp) {
      this.levelUp();
    }
  }

  levelUp() {
    this.exp -= this.maxExp;
    this.level++;
    this.maxExp = Hunter.getMaxExpForLevel(this.level);

    // TĂNG TRƯỞNG CHỈ SỐ THEO PHẨM CẤP (Rank Growth Scaling)
    const maxStars = (CONFIG.BREAKTHROUGH_COSTS && CONFIG.BREAKTHROUGH_COSTS.length) ? CONFIG.BREAKTHROUGH_COSTS.length : 5;
    const isMaxBreakthrough = (this.reincarnation || 0) >= maxStars;

    const rankGrowth = {
      NORMAL:   { hp: 20,  atk: 4,  def: 2 },
      RARE:     { hp: 38,  atk: 8,  def: 4 },
      SUPERIOR: { hp: 65,  atk: 16, def: 8 },
      HEROIC:   { hp: 110, atk: 30, def: 15 },
      LEGEND:   { hp: 220, atk: 65, def: 32 }
    };
    let growth = { ...(rankGrowth[this.rankKey] || rankGrowth.NORMAL) };

    // NẾU ĐÃ ĐỘT PHÁ CẢNH GIỚI TỐI THƯỢNG (MAX BREAKTHROUGH) -> THƯỞNG THÊM CHỈ SỐ CƠ BẢN ĐỈNH PHONG
    if (isMaxBreakthrough) {
      const maxParagonBonus = {
        NORMAL:   { hp: 50,  atk: 10,  def: 5 },
        RARE:     { hp: 90,  atk: 18,  def: 9 },
        SUPERIOR: { hp: 150, atk: 32,  def: 16 },
        HEROIC:   { hp: 260, atk: 60,  def: 30 },
        LEGEND:   { hp: 500, atk: 120, def: 60 }
      };
      const extra = maxParagonBonus[this.rankKey] || maxParagonBonus.NORMAL;
      growth.hp += extra.hp;
      growth.atk += extra.atk;
      growth.def += extra.def;
    }

    this.maxHp += growth.hp;
    this.hp = this.maxHp;
    this.atk += growth.atk;
    this.def += growth.def;

    if (isMaxBreakthrough) {
      window.logTicker.add(`🌌 [THẦN MA ĐỈNH PHONG]: [${this.name}] thăng cấp Lv.${this.level} (+${growth.hp} HP, +${growth.atk} ATK, +${growth.def} DEF cơ bản)!`, 'special');
    } else {
      window.logTicker.add(`⭐ [${this.name}] đã thăng cấp Level ${this.level} (+${growth.hp} HP, +${growth.atk} ATK, +${growth.def} DEF)!`, 'loot');
    }

    // NẾU CHƯA MAX ĐỘT PHÁ -> CHẠM MỐC LV.100 THÌ DỪNG LẠI CHỜ ĐỘT PHÁ
    if (!isMaxBreakthrough && this.level >= 100) {
      this.level = 100;
      this.exp = this.maxExp;
      window.logTicker.add(`🔥 [CỰC HẠN CẢNH GIỚI]: [${this.name}] đã đạt Đỉnh Phong Lv.100! Hãy thu thập Nguyên Liệu Hầm Ngục để ĐỘT PHÁ CẢNH GIỚI!`, 'special');
      if (window.showToast) window.showToast(`[${this.name}] đã đạt Cấp 100! Sẵn sàng Đột Phá Cảnh Giới!`, 'special', '🔥 CỰC HẠN ĐỈNH PHONG');
    }
  }

  // Lấy thông tin yêu cầu của Cảnh Giới tiếp theo (Tùy biến theo Độ Hiếm Thợ Săn)
  getBreakthroughInfo() {
    const nextStar = (this.reincarnation || 0) + 1;
    const costs = CONFIG.BREAKTHROUGH_COSTS || [];
    const baseReq = costs.find(c => c.star === nextStar) || {
      star: nextStar,
      title: "Chí Tôn Vô Thượng",
      gold: 500000,
      materials: { mat_chaos_shard: 5 },
      successRate: 0.20,
      bonusHp: 0.45,
      bonusAtk: 0.40,
      bonusDef: 0.40,
      rewardGems: 100,
      desc: "Cảnh giới tối thượng vượt ngưỡng Thần Ma!"
    };

    // Hệ số Độ Hiếm Thợ Săn (Rank Multiplier)
    const rankData = CONFIG.HUNTER_RANKS[this.rankKey] || CONFIG.HUNTER_RANKS.NORMAL;
    const rankMul = rankData.breakthroughMul || (
      this.rankKey === 'NORMAL' ? 0.8 :
      this.rankKey === 'RARE' ? 1.0 :
      this.rankKey === 'SUPERIOR' ? 1.3 :
      this.rankKey === 'HEROIC' ? 1.8 :
      this.rankKey === 'LEGEND' ? 2.5 : 1.0
    );

    // Tính toán lượng Vàng theo Độ Hiếm (làm tròn tới 10g)
    const scaledGold = Math.round((baseReq.gold * rankMul) / 10) * 10;

    // Tính toán lượng Nguyên Liệu theo Độ Hiếm (tối thiểu 1)
    const scaledMaterials = {};
    for (const [matKey, count] of Object.entries(baseReq.materials || {})) {
      scaledMaterials[matKey] = Math.max(1, Math.round(count * rankMul));
    }

    const baseRate = baseReq.successRate !== undefined ? baseReq.successRate : 0.85;
    const totalRate = Math.min(1.0, baseRate + (this.breakthroughPity || 0));

    return {
      ...baseReq,
      gold: scaledGold,
      materials: scaledMaterials,
      rankMultiplier: rankMul,
      rankName: rankData.name,
      baseSuccessRate: baseRate,
      totalSuccessRate: totalRate,
      pityBonus: this.breakthroughPity || 0
    };
  }

  // Kiểm tra có đủ điều kiện Đột Phá hay không
  canBreakthrough() {
    const maxStars = (CONFIG.BREAKTHROUGH_COSTS && CONFIG.BREAKTHROUGH_COSTS.length) ? CONFIG.BREAKTHROUGH_COSTS.length : 5;
    if ((this.reincarnation || 0) >= maxStars) {
      return { ok: false, reason: "Đã đạt Cảnh Giới Tối Thượng (Max 5 Sao ⭐)! Đang mở khóa Sức Mạnh Đỉnh Phong cộng dồn chỉ số cơ bản mỗi cấp!" };
    }
    if (this.level < 100) return { ok: false, reason: `Cần đạt Lv.100 (Hiện tại: Lv.${this.level})` };
    const req = this.getBreakthroughInfo();
    if (window.gameState.gold < req.gold) {
      return { ok: false, reason: `Thiếu Vàng Ngân Khố (Cần 💰${CONFIG.formatNumber(req.gold)})` };
    }
    for (const [matKey, count] of Object.entries(req.materials)) {
      const has = window.gameState.storage[matKey] || 0;
      if (has < count) {
        const matName = CONFIG.ITEMS[matKey]?.name || matKey;
        return { ok: false, reason: `Thiếu ${count - has}x ${matName} (Đi Hầm Ngục để săn)` };
      }
    }
    return { ok: true, req };
  }

  // Thực hiện Đột Phá Cảnh Giới (Tiêu hao nguyên liệu Hầm Ngục & Vàng theo Tỉ Lệ Thành Công)
  performBreakthrough() {
    const check = this.canBreakthrough();
    if (!check.ok) return check;

    const req = check.req;

    // Deduct gold & materials
    window.gameState.spendGold(req.gold);
    for (const [matKey, count] of Object.entries(req.materials)) {
      window.gameState.storage[matKey] -= count;
      if (window.gameState.storage[matKey] <= 0) {
        delete window.gameState.storage[matKey];
      }
    }

    // Check Success Rate Roll
    const roll = Math.random();
    const totalRate = req.totalSuccessRate || 0.85;

    if (roll <= totalRate) {
      // SUCCESS!
      this.breakthroughPity = 0; // Reset pity
      this.reincarnation = (this.reincarnation || 0) + 1;
      this.level = 1;
      this.exp = 0;
      this.maxExp = Hunter.getMaxExpForLevel(1);

      const hpMul = 1 + (req.bonusHp || 0.40);
      const atkMul = 1 + (req.bonusAtk || 0.35);
      const defMul = 1 + (req.bonusDef || 0.35);

      this.maxHp = Math.floor(this.maxHp * hpMul);
      this.hp = this.maxHp;
      this.atk = Math.floor(this.atk * atkMul);
      this.def = Math.floor(this.def * defMul);

      // Reward Gems
      const gemsReward = req.rewardGems || 10;
      window.gameState.gems += gemsReward;

      const starIcons = "⭐".repeat(this.reincarnation);
      const realmTitle = req.title || `Cảnh Giới ${this.reincarnation}`;

      window.logTicker.add(`👑 [ĐẠI ĐỘT PHÁ THÀNH CÔNG]: Chúc mừng [${this.name}] đã ĐỘT PHÁ THÀNH CÔNG lên [${starIcons} ${realmTitle}]! Tăng vọt +${Math.round((hpMul - 1)*100)}% HP, +${Math.round((atkMul - 1)*100)}% ATK/DEF (+${gemsReward} 💠 Ngọc Triệu Hồi cho Thị Trấn)!`, 'special');
      
      if (window.showToast) window.showToast(`[${this.name}] Đột Phá THÀNH CÔNG lên [${starIcons} ${realmTitle}]!`, 'special', '👑 ĐẠI ĐỘT PHÁ THÀNH CÔNG');
      return { ok: true, success: true, req };
    } else {
      // FAILURE! (Thất bại không mất thợ săn, nhận +10% tỉ lệ may mắn cho lần sau)
      this.breakthroughPity = (this.breakthroughPity || 0) + 0.10;
      const curTotalPct = Math.round(Math.min(1.0, (req.baseSuccessRate || 0.85) + this.breakthroughPity) * 100);

      window.logTicker.add(`💔 [ĐỘT PHÁ THẤT BẠI]: [${this.name}] đột phá không thành công do linh khí dao động! Nhận +10% Tỉ lệ may mắn cho lần sau (Hiện đạt: ${curTotalPct}%). Thợ săn vẫn an toàn ở Lv.100.`, 'danger');
      if (window.showToast) window.showToast(`Đột phá thất bại! Nhận +10% May Mắn lần sau (${curTotalPct}%).`, 'warning', '💔 ĐỘT PHÁ THẤT BẠI');
      return { ok: true, success: false, reason: `Đột phá thất bại! Nhận +10% May Mắn lần sau (Tỉ lệ tăng lên ${curTotalPct}%).`, req };
    }
  }

  die() {
    this.hp = 0;
    this.state = 'DEAD';
    this.stateTimer = 0;
    this.activityLog = "💀 Đã gục ngã ngoài chiến trường!";
    window.logTicker.add(`⚠️ [${this.name}] đã tử trận! Cần cứu thương về Trạm Y Tế!`, 'danger');
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      classKey: this.classKey,
      rankKey: this.rankKey,
      trait: this.trait,
      level: this.level,
      reincarnation: this.reincarnation || 0,
      exp: this.exp,
      maxExp: this.maxExp,
      hp: this.hp,
      maxHp: this.maxHp,
      atk: this.atk,
      def: this.def,
      hunger: this.hunger,
      fatigue: this.fatigue,
      gold: this.gold,
      bag: this.bag,
      weapon: this.weapon,
      armor: this.armor,
      ring: this.ring,
      amulet: this.amulet,
      talisman: this.talisman,
      weaponPlus: this.weaponPlus || 0,
      armorPlus: this.armorPlus || 0,
      ringPlus: this.ringPlus || 0,
      amuletPlus: this.amuletPlus || 0,
      talismanPlus: this.talismanPlus || 0,
      state: this.state,
      hasInnBed: this.hasInnBed || false,
      breakthroughPity: this.breakthroughPity || 0,
      activityLog: this.activityLog
    };
  }

  static deserialize(data) {
    return new Hunter(data);
  }
}

window.Hunter = Hunter;
