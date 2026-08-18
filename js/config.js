/**
 * TOWN OF HUNTERS - MASTER CONFIGURATION & GAME DATA
 */

const CONFIG = {
  VERSION: "1.0.0",
  TICK_INTERVAL_MS: 500, // Simulation step
  SAVE_INTERVAL_MS: 5000,

  // FORMAT SỐ RÚT GỌN (K, M, B) CHO LỰC CHIẾN VÀ TIỀN VÀNG
  formatNumber(num) {
    const n = Number(num) || 0;
    if (n >= 1000000000) {
      return (n / 1000000000).toFixed(2).replace(/\.00$/, '') + 'B';
    }
    if (n >= 1000000) {
      return (n / 1000000).toFixed(2).replace(/\.00$/, '') + 'M';
    }
    if (n >= 10000) {
      return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return n.toLocaleString();
  },

  // FORMAT ĐƠN VỊ TIỀN VÀNG CHUẨN (GOLD)
  formatGold(num) {
    const n = Number(num) || 0;
    return `${CONFIG.formatNumber(n)} GOLD`;
  },
  
  // RANKS & RARITIES (Hệ số chỉ số và độ tốn tài nguyên Đột Phá)
  HUNTER_RANKS: {
    NORMAL: { id: "normal", name: "Thường", color: "#ffffff", multiplier: 1.0, breakthroughMul: 0.8, icon: "⚪" },
    RARE: { id: "rare", name: "Hiếm", color: "#00e5ff", multiplier: 1.25, breakthroughMul: 1.0, icon: "🔵" },
    SUPERIOR: { id: "superior", name: "Ưu Tú", color: "#bd00ff", multiplier: 1.6, breakthroughMul: 1.3, icon: "🟣" },
    HEROIC: { id: "heroic", name: "Anh Hùng", color: "#ffd700", multiplier: 2.1, breakthroughMul: 1.8, icon: "🟡" },
    LEGEND: { id: "legend", name: "Huyền Thoại", color: "#ff3366", multiplier: 3.0, breakthroughMul: 2.5, icon: "🔴" }
  },

  // HUNTER CLASSES
  HUNTER_CLASSES: {
    BERSERKER: {
      id: "berserker",
      name: "Cuồng Chiến Binh",
      icon: "⚔️",
      baseHp: 120,
      baseAtk: 18,
      baseDef: 8,
      atkSpeed: 1.2,
      desc: "Cận chiến dũng mãnh, sát thương vật lý cao."
    },
    RANGER: {
      id: "ranger",
      name: "Cung Thủ",
      icon: "🏹",
      baseHp: 85,
      baseAtk: 22,
      baseDef: 4,
      atkSpeed: 1.5,
      desc: "Tầm xa, tốc độ đánh nhanh, tỷ lệ bạo kích cao."
    },
    SORCERER: {
      id: "sorcerer",
      name: "Pháp Sư",
      icon: "🧙",
      baseHp: 75,
      baseAtk: 28,
      baseDef: 3,
      atkSpeed: 1.0,
      desc: "Sát thương phép cực mạnh, máu mỏng."
    },
    PALADIN: {
      id: "paladin",
      name: "Thánh Kỵ Sĩ",
      icon: "🛡️",
      baseHp: 150,
      baseAtk: 14,
      baseDef: 12,
      atkSpeed: 0.9,
      desc: "Phòng ngự kiên cố, khả năng sống sót cao nhất."
    }
  },

  // HUNTER TRAITS
  HUNTER_TRAITS: [
    { id: "glutton", name: "Ham Ăn", desc: "Nhanh đói nhưng tăng 20% Tốc Đánh", icon: "🍖" },
    { id: "frugal", name: "Tiết Kiệm", desc: "Giữ nhiều vàng hơn khi đi săn", icon: "🪙" },
    { id: "brave", name: "Dũng Cảm", desc: "+15% Sát thương khi máu dưới 30%", icon: "🔥" },
    { id: "lucky", name: "Thần Tài", desc: "+25% Tỷ lệ rơi vật phẩm hiếm", icon: "🍀" },
    { id: "swift", name: "Nhanh Nhẹn", desc: "+30% Tốc độ di chuyển", icon: "⚡" }
  ],

  // DIFFICULTY MODES (Hệ số Độ Khó toàn vùng săn)
  DIFFICULTIES: [
    { id: "diff_normal", name: "Thường (Normal)", color: "#39ff14", hpMul: 1.0, atkMul: 1.0, expMul: 1.0, dropMul: 1.0, desc: "Quái vật cơ bản, an toàn cho thợ săn tân thủ." },
    { id: "diff_hard", name: "Khó (Hard)", color: "#ffd700", hpMul: 1.8, atkMul: 1.5, expMul: 2.0, dropMul: 1.4, desc: "+100% EXP, +40% Tỷ lệ rơi đồ hiếm." },
    { id: "diff_nightmare", name: "Ác Mộng (Nightmare)", color: "#ff9900", hpMul: 2.8, atkMul: 2.2, expMul: 4.0, dropMul: 2.0, desc: "+300% EXP, x2 Vàng và rơi Trang bị Cực phẩm!" },
    { id: "diff_torment", name: "Địa Ngục (Torment)", color: "#ff3366", hpMul: 4.0, atkMul: 3.2, expMul: 8.0, dropMul: 3.5, desc: "Thử thách tử thần! Rơi nguyên liệu Thần Thoại & Đá Cường Hóa." }
  ],

  // HUNTING ZONES (10 VÙNG SĂN CHUẨN TỪ LEVEL 1 ĐẾN LEVEL 100 - YÊU CẦU THỊ TRẤN CẤP 1 ĐẾN CẤP 10)
  ZONES: [
    {
      id: "zone_1",
      name: "Rừng Yếu Ớt (Lv.1 - 10)",
      reqTownLvl: 1,
      reqPower: 300,
      drops: ["slime_gel", "goblin_tooth"],
      icon: "🌲",
      desc: "Khu rừng ngoại ô yên bình. Thu thập Slime và Răng Goblin để rèn đồ Lv.1 - 10.",
      monsters: [
        { id: "m_slime", name: "Slime Nhầy", glyph: "(o.o)", hp: 45, atk: 6, def: 1, exp: 12, gold: 6, loot: "slime_gel", lootChance: 0.8 },
        { id: "m_goblin", name: "Goblin Trộm", glyph: "[ò_ó]", hp: 75, atk: 10, def: 3, exp: 20, gold: 10, loot: "goblin_tooth", lootChance: 0.65 }
      ]
    },
    {
      id: "zone_2",
      name: "Hang Sói Rừng Sâu (Lv.11 - 20)",
      reqTownLvl: 2,
      reqPower: 1200,
      drops: ["wolf_pelt", "goblin_tooth", "slime_gel"],
      icon: "🐺",
      desc: "Lãnh địa bầy sói hoang hung hãn. Thu thập Da Sói Xám và Răng quái rèn đồ Lv.10 - 20.",
      monsters: [
        { id: "m_wolf", name: "Sói Xám Rừng", glyph: "/^w^/", hp: 130, atk: 16, def: 6, exp: 35, gold: 18, loot: "wolf_pelt", lootChance: 0.6 },
        { id: "m_goblin_warrior", name: "Goblin Chiến Binh", glyph: "[⚔️ò_ó]", hp: 160, atk: 20, def: 7, exp: 45, gold: 22, loot: "goblin_tooth", lootChance: 0.6 }
      ]
    },
    {
      id: "zone_3",
      name: "Nghĩa Địa Cổ (Lv.21 - 30)",
      reqTownLvl: 3,
      reqPower: 4000,
      drops: ["cursed_bone", "dark_cloth", "wolf_pelt"],
      icon: "🪦",
      desc: "Phế tích u ám ngập tràn xác sống. Khai thác Xương Quỷ rèn đồ Lv.20 - 30.",
      monsters: [
        { id: "m_skeleton", name: "Chiến Binh Xương", glyph: "💀-|-", hp: 220, atk: 28, def: 10, exp: 60, gold: 30, loot: "cursed_bone", lootChance: 0.6 },
        { id: "m_zombie", name: "Xác Sống Khát Máu", glyph: "[z_Z]", hp: 300, atk: 34, def: 12, exp: 80, gold: 40, loot: "dark_cloth", lootChance: 0.55 }
      ]
    },
    {
      id: "zone_4",
      name: "Lăng Mộ Oán Linh (Lv.31 - 40)",
      reqTownLvl: 4,
      reqPower: 12000,
      drops: ["spirit_dust", "dark_cloth", "cursed_bone"],
      icon: "👻",
      desc: "Sào huyệt hồn ma u tối. Khai thác Vải Hắc Ám và Bột Linh Hồn rèn đồ Lv.30 - 40.",
      monsters: [
        { id: "m_ghost", name: "U Hồn Oán Linh", glyph: "{~.~}", hp: 350, atk: 45, def: 8, exp: 110, gold: 55, loot: "spirit_dust", lootChance: 0.5 },
        { id: "m_dark_knight", name: "Kỵ Sĩ Hắc Ám", glyph: "♞[†]", hp: 420, atk: 52, def: 18, exp: 140, gold: 70, loot: "dark_cloth", lootChance: 0.55 }
      ]
    },
    {
      id: "zone_5",
      name: "Núi Lửa Quỷ (Lv.41 - 50)",
      reqTownLvl: 5,
      reqPower: 35000,
      drops: ["lava_ore", "spirit_dust", "dark_cloth"],
      icon: "🌋",
      desc: "Vùng đất nham thạch bỏng rát. Khai thác Quặng Nham Thạch rèn đồ Lv.40 - 50.",
      monsters: [
        { id: "m_golem", name: "Golem Nham Thạch", glyph: "[[#]]", hp: 580, atk: 62, def: 28, exp: 180, gold: 95, loot: "lava_ore", lootChance: 0.55 },
        { id: "m_fire_hound", name: "Hỏa Khuyển Địa Ngục", glyph: "🔥(v_v)", hp: 650, atk: 72, def: 22, exp: 220, gold: 115, loot: "lava_ore", lootChance: 0.55 }
      ]
    },
    {
      id: "zone_6",
      name: "Vực Thẳm Dung Nham (Lv.51 - 60)",
      reqTownLvl: 6,
      reqPower: 90000,
      drops: ["lava_ore", "spirit_dust", "cursed_bone"],
      icon: "🔥",
      desc: "Hỏa diệm bất diệt ngút trời. Săn Hỏa Ma đoạt Quặng rèn đồ Lv.50 - 60.",
      monsters: [
        { id: "m_fire_demon", name: "Hỏa Ma Vực Thẳm", glyph: "ψ(▼皿▼)ψ", hp: 850, atk: 88, def: 28, exp: 290, gold: 150, loot: "lava_ore", lootChance: 0.6 },
        { id: "m_lava_beast", name: "Cự Thú Nham Ma", glyph: "[👹]", hp: 980, atk: 98, def: 35, exp: 350, gold: 180, loot: "lava_ore", lootChance: 0.6 }
      ]
    },
    {
      id: "zone_7",
      name: "Hang Long Tộc (Lv.61 - 70)",
      reqTownLvl: 7,
      reqPower: 220000,
      drops: ["dragon_scale", "lava_ore", "spirit_dust"],
      icon: "🐉",
      desc: "Vùng sào huyệt rồng cổ xưa. Đoạt Vảy Hắc Long rèn đồ Lv.60 - 70.",
      monsters: [
        { id: "m_young_dragon", name: "Hắc Long Ấu Thú", glyph: "><((°>", hp: 1200, atk: 115, def: 42, exp: 450, gold: 240, loot: "dragon_scale", lootChance: 0.5 },
        { id: "m_dragon_warrior", name: "Long Thần Chiến Binh", glyph: "🛡️[DRG]", hp: 1450, atk: 135, def: 50, exp: 550, gold: 290, loot: "dragon_scale", lootChance: 0.55 }
      ]
    },
    {
      id: "zone_8",
      name: "Thành Cổ Hư Không (Lv.71 - 80)",
      reqTownLvl: 8,
      reqPower: 550000,
      drops: ["dragon_scale", "spirit_dust", "lava_ore"],
      icon: "🏰",
      desc: "Đô thành huyền bí rơi vào hư vô. Săn Hư Không Kỵ Sĩ rèn đồ Lv.70 - 80.",
      monsters: [
        { id: "m_void_knight", name: "Kỵ Sĩ Hư Không", glyph: "⚔️[VOID]", hp: 1750, atk: 160, def: 58, exp: 700, gold: 380, loot: "dragon_scale", lootChance: 0.55 },
        { id: "m_void_demon", name: "Ác Thần Hư Không", glyph: "ψ[VOID]ψ", hp: 2000, atk: 185, def: 62, exp: 850, gold: 460, loot: "spirit_dust", lootChance: 0.6 }
      ]
    },
    {
      id: "zone_9",
      name: "Vực Sâu Hỗn Độn (Lv.81 - 90)",
      reqTownLvl: 9,
      reqPower: 1400000,
      drops: ["dragon_scale", "spirit_dust", "dark_cloth"],
      icon: "🌌",
      desc: "Tận cùng của bóng tối ma thần. Đoạt Vảy Rồng Cực Phẩm rèn đồ Lv.80 - 90.",
      monsters: [
        { id: "m_elder_dragon", name: "Hắc Long Thần Tộc Trưởng", glyph: "🐉[ELDER]", hp: 2500, atk: 220, def: 75, exp: 1100, gold: 600, loot: "dragon_scale", lootChance: 0.65 },
        { id: "m_reaper", name: "Tử Thần Hỗn Độn", glyph: "☠️[DEATH]☠️", hp: 2800, atk: 250, def: 80, exp: 1350, gold: 750, loot: "dragon_scale", lootChance: 0.7 }
      ]
    },
    {
      id: "zone_10",
      name: "Điện Thần Ma Malakor (Lv.91 - 100)",
      reqTownLvl: 10,
      reqPower: 3000000,
      drops: ["dragon_scale", "lava_ore", "spirit_dust"],
      icon: "👑",
      desc: "Thánh đường Ma Vương! Thử thách diệt Boss tối thượng rèn Thần Khí Lv.100.",
      monsters: [
        { id: "m_dragon", name: "Hắc Long Vương Thần Cổ", glyph: "🐉[GOD_DRG]", hp: 3500, atk: 300, def: 95, exp: 1800, gold: 1000, loot: "dragon_scale", lootChance: 0.75 },
        { id: "m_boss_demon", name: "Chúa Quỷ Malakor (Tối Thượng)", glyph: "☠️[LORD_MALAKOR]☠️", hp: 6000, atk: 420, def: 120, exp: 3000, gold: 2000, loot: "dragon_scale", lootChance: 1.0 }
      ]
    }
  ],

  // ITEMS & LOOT
  ITEMS: {
    // RAW LOOT (Thợ săn bán cho làng)
    slime_gel: { id: "slime_gel", name: "Chất Nhầy Slime", icon: "🟢", basePrice: 4, type: "material" },
    goblin_tooth: { id: "goblin_tooth", name: "Răng Goblin", icon: "🦷", basePrice: 7, type: "material" },
    wolf_pelt: { id: "wolf_pelt", name: "Da Sói Xám", icon: "🐺", basePrice: 12, type: "material" },
    cursed_bone: { id: "cursed_bone", name: "Xương Nguyền Rủa", icon: "🦴", basePrice: 20, type: "material" },
    dark_cloth: { id: "dark_cloth", name: "Vải Hắc Ám", icon: "🧣", basePrice: 28, type: "material" },
    spirit_dust: { id: "spirit_dust", name: "Bột Linh Hồn", icon: "✨", basePrice: 38, type: "material" },
    lava_ore: { id: "lava_ore", name: "Quặng Nham Thạch", icon: "🌋", basePrice: 65, type: "material" },
    dragon_scale: { id: "dragon_scale", name: "Vảy Hắc Long", icon: "🛡️", basePrice: 150, type: "material" },

    // BREAKTHROUGH RELICS (Nguyên liệu Đột Phá Cảnh Giới rơi độc quyền từ Hầm Ngục Boss)
    mat_breakthrough_stone: { id: "mat_breakthrough_stone", name: "Đá Đột Phá Cổ", icon: "🪨", basePrice: 200, type: "material", desc: "Đá phong ấn linh khí cổ xưa từ Boss Hầm Ngục Tầng 1-4, dùng để Đột Phá Thợ Săn Lv.100." },
    mat_divine_core: { id: "mat_divine_core", name: "Lõi Thần Ma Cổ Đại", icon: "🔮", basePrice: 500, type: "material", desc: "Lõi năng lượng cổ đại từ Boss Hầm Ngục Tầng 5+, dùng để Đột Phá Thợ Săn Cảnh Giới 2+." },
    mat_astral_essence: { id: "mat_astral_essence", name: "Tinh Hoa Tinh Tú", icon: "🌟", basePrice: 1200, type: "material", desc: "Tinh hoa vũ trụ rớt từ Boss Hầm Ngục Tầng 12+, dùng để Đột Phá Thần Vương." },
    mat_dragon_heart: { id: "mat_dragon_heart", name: "Trái Tim Cổ Long", icon: "🫀", basePrice: 3000, type: "material", desc: "Trái tim rồng cổ đại từ Boss Hầm Ngục Tầng 20+, dùng để Đột Phá Chí Tôn." },
    mat_chaos_shard: { id: "mat_chaos_shard", name: "Mảnh Hỗn Độn Sáng Thế", icon: "🌌", basePrice: 8000, type: "material", desc: "Mảnh vỡ không gian nguyên sơ từ Boss Hầm Ngục Tầng 25+, dùng để Đột Phá Thần Ma Tối Thượng." }
  },

  // COMPREHENSIVE RECIPES FOR LEVELS 1 TO 100 (CHI PHÍ CHẾ TẠO VÀ MUA BÁN LŨY TIẾN HÀM SỐ MŨ)
  RECIPES: {
    weapons: [
      { id: "wpn_lvl_1", name: "Kiếm Gỗ Tập Sự", icon: "🗡️", rarity: "normal", atk: 10, reqLvl: 1, craftFee: 15, costGold: 50, materials: { slime_gel: 5 } },
      { id: "wpn_lvl_10", name: "Kiếm Sắt Rừng Sâu", icon: "🗡️", rarity: "rare", atk: 28, reqLvl: 10, craftFee: 45, costGold: 180, materials: { goblin_tooth: 10, slime_gel: 8 } },
      { id: "wpn_lvl_20", name: "Đoản Kiếm Xương Quỷ", icon: "🗡️", rarity: "rare", atk: 58, reqLvl: 20, craftFee: 120, costGold: 500, materials: { cursed_bone: 14, wolf_pelt: 10 } },
      { id: "wpn_lvl_30", name: "Trảm Ma Kiếm Cổ", icon: "⚔️", rarity: "superior", atk: 105, reqLvl: 30, craftFee: 320, costGold: 1400, materials: { cursed_bone: 22, dark_cloth: 18 } },
      { id: "wpn_lvl_40", name: "Đại Đao Nham Thạch", icon: "🔥", rarity: "superior", atk: 175, reqLvl: 40, craftFee: 850, costGold: 3800, materials: { lava_ore: 20, spirit_dust: 18, dark_cloth: 15 } },
      { id: "wpn_lvl_50", name: "Trảm Hồn Kiếm Hỏa Ma", icon: "⚔️", rarity: "heroic", atk: 270, reqLvl: 50, craftFee: 2200, costGold: 9800, materials: { lava_ore: 32, spirit_dust: 25, cursed_bone: 25 } },
      { id: "wpn_lvl_60", name: "Hắc Long Thần Kiếm", icon: "🐉", rarity: "heroic", atk: 390, reqLvl: 60, craftFee: 5600, costGold: 25000, materials: { dragon_scale: 18, lava_ore: 40, spirit_dust: 30 } },
      { id: "wpn_lvl_70", name: "Long Hồn Thánh Thương", icon: "🔱", rarity: "legend", atk: 550, reqLvl: 70, craftFee: 14000, costGold: 62000, materials: { dragon_scale: 30, lava_ore: 55, spirit_dust: 45 } },
      { id: "wpn_lvl_80", name: "Chúa Quỷ Diệt Thế Đao", icon: "🪓", rarity: "legend", atk: 780, reqLvl: 80, craftFee: 35000, costGold: 155000, materials: { dragon_scale: 50, lava_ore: 80, spirit_dust: 65 } },
      { id: "wpn_lvl_90", name: "Hư Không Thần Trượng", icon: "✨", rarity: "legend", atk: 1100, reqLvl: 90, craftFee: 88000, costGold: 390000, materials: { dragon_scale: 80, spirit_dust: 95, lava_ore: 90 } },
      { id: "wpn_lvl_100", name: "Sáng Thế Thánh Kiếm (Tối Thượng)", icon: "👑", rarity: "legend", atk: 1600, reqLvl: 100, craftFee: 220000, costGold: 1000000, materials: { dragon_scale: 140, lava_ore: 160, spirit_dust: 140 } }
    ],

    armors: [
      { id: "amr_lvl_1", name: "Áo Vải Thô Tập Sự", icon: "🦺", rarity: "normal", def: 5, hp: 35, reqLvl: 1, craftFee: 12, costGold: 40, materials: { slime_gel: 5 } },
      { id: "amr_lvl_10", name: "Giáp Da Sói Rừng", icon: "🦺", rarity: "rare", def: 15, hp: 90, reqLvl: 10, craftFee: 35, costGold: 150, materials: { wolf_pelt: 8, slime_gel: 8 } },
      { id: "amr_lvl_20", name: "Khôi Giáp Xương Quỷ", icon: "🛡️", rarity: "rare", def: 30, hp: 190, reqLvl: 20, craftFee: 95, costGold: 420, materials: { cursed_bone: 14, wolf_pelt: 10 } },
      { id: "amr_lvl_30", name: "Áo Choàng Hắc Ám", icon: "🥋", rarity: "superior", def: 55, hp: 340, reqLvl: 30, craftFee: 260, costGold: 1150, materials: { dark_cloth: 20, cursed_bone: 18 } },
      { id: "amr_lvl_40", name: "Giáp Golem Nham Thạch", icon: "🛡️", rarity: "superior", def: 90, hp: 580, reqLvl: 40, craftFee: 700, costGold: 3100, materials: { lava_ore: 18, cursed_bone: 22, dark_cloth: 15 } },
      { id: "amr_lvl_50", name: "Chiến Giáp Hỏa Thần", icon: "🥋", rarity: "heroic", def: 140, hp: 920, reqLvl: 50, craftFee: 1800, costGold: 8000, materials: { lava_ore: 30, spirit_dust: 24, cursed_bone: 22 } },
      { id: "amr_lvl_60", name: "Long Lân Khôi Giáp", icon: "🛡️", rarity: "heroic", def: 205, hp: 1450, reqLvl: 60, craftFee: 4600, costGold: 20500, materials: { dragon_scale: 16, lava_ore: 35, spirit_dust: 25 } },
      { id: "amr_lvl_70", name: "Hắc Long Hộ Thể Giáp", icon: "🥋", rarity: "legend", def: 290, hp: 2150, reqLvl: 70, craftFee: 11500, costGold: 51000, materials: { dragon_scale: 26, dark_cloth: 45, lava_ore: 45 } },
      { id: "amr_lvl_80", name: "Hư Không Thần Ma Giáp", icon: "🛡️", rarity: "legend", def: 410, hp: 3100, reqLvl: 80, craftFee: 29000, costGold: 128000, materials: { dragon_scale: 42, lava_ore: 70, spirit_dust: 55 } },
      { id: "amr_lvl_90", name: "Minh Vương Chiến Giáp", icon: "👑", rarity: "legend", def: 580, hp: 4400, reqLvl: 90, craftFee: 72000, costGold: 320000, materials: { dragon_scale: 70, spirit_dust: 80, lava_ore: 75 } },
      { id: "amr_lvl_100", name: "Thần Ma Bất Diệt Giáp (Tối Thượng)", icon: "🌟", rarity: "legend", def: 850, hp: 7000, reqLvl: 100, craftFee: 180000, costGold: 800000, materials: { dragon_scale: 120, lava_ore: 140, dark_cloth: 100 } }
    ]
  },

  // TAVERN FOOD RECIPES (Quán ăn phục vụ thợ săn đói - chi phí tăng lũy tiến hàm số mũ)
  FOODS: [
    { id: "food_slime_jelly", name: "Thạch Slime Mật Ong", icon: "🍮", craftFee: 10, costGold: 35, materials: { slime_gel: 4 }, hungerRestore: 40, buffAtk: 4 },
    { id: "food_wolf_steak", name: "Bít Tết Sói Rừng Nướng", icon: "🥩", craftFee: 35, costGold: 130, materials: { wolf_pelt: 4, goblin_tooth: 4 }, hungerRestore: 60, buffAtk: 12 },
    { id: "food_dark_soup", name: "Canh Thảo Dược Hắc Ám", icon: "🍲", craftFee: 120, costGold: 480, materials: { dark_cloth: 5, cursed_bone: 5 }, hungerRestore: 80, buffAtk: 28 },
    { id: "food_lava_grill", name: "Bò Nướng Đá Nham Thạch", icon: "🍢", craftFee: 450, costGold: 1800, materials: { lava_ore: 6, spirit_dust: 6 }, hungerRestore: 90, buffAtk: 55 },
    { id: "food_dragon_roast", name: "Đại Tiệc Thịt Rồng Nướng", icon: "🍖", craftFee: 1600, costGold: 6800, materials: { dragon_scale: 5, lava_ore: 8 }, hungerRestore: 100, buffAtk: 95 },
    { id: "food_immortal_feast", name: "Yến Tiệc Bất Diệt Malakor", icon: "👑", craftFee: 5500, costGold: 25000, materials: { dragon_scale: 10, spirit_dust: 12, lava_ore: 10 }, hungerRestore: 100, buffAtk: 180 }
  ],

  // CLINIC POTIONS (Trạm Y Tế bán cho thợ săn hồi máu theo cấp độ - chi phí tăng lũy tiến hàm số mũ)
  POTIONS: [
    { id: "pot_small_heal", name: "Thuốc Trị Thương Thô Sơ", icon: "🧪", craftFee: 12, costGold: 40, materials: { slime_gel: 4 }, healHp: 90, reqLvl: 1 },
    { id: "pot_wolf_salve", name: "Cao Dược Bầy Sói", icon: "🧴", craftFee: 40, costGold: 140, materials: { goblin_tooth: 5, wolf_pelt: 3 }, healHp: 240, reqLvl: 15 },
    { id: "pot_spirit_elixir", name: "Tiên Dược Hồi Phục Oán Linh", icon: "⚗️", craftFee: 135, costGold: 520, materials: { cursed_bone: 6, dark_cloth: 5 }, healHp: 550, reqLvl: 30 },
    { id: "pot_magma_elixir", name: "Linh Dược Nham Thạch", icon: "🍶", craftFee: 480, costGold: 1950, materials: { spirit_dust: 6, lava_ore: 6 }, healHp: 1300, reqLvl: 45 },
    { id: "pot_dragon_blood", name: "Huyết Dược Long Thần", icon: "🍷", craftFee: 1700, costGold: 7200, materials: { dragon_scale: 5, lava_ore: 6 }, healHp: 2800, reqLvl: 65 },
    { id: "pot_void_nectar", name: "Thần Dược Cực Phẩm Hư Không", icon: "✨", craftFee: 6000, costGold: 28000, materials: { dragon_scale: 10, spirit_dust: 10 }, healHp: 6500, reqLvl: 85 },
    { id: "pot_revive_scroll", name: "Bùa Hồi Sinh Tức Thì", icon: "📜", craftFee: 3500, costGold: 15000, materials: { cursed_bone: 10, dark_cloth: 8, spirit_dust: 6 }, healHp: 99999, reqLvl: 1 }
  ],

  // PROGRESSIVE SCALING & CONSTRUCTION TIME FOR BUILDING UPGRADES (CÂN BẰNG CÀY CUỐC THEO VÙNG SĂN)
  BUILDING_UPGRADES: {
    inn: [
      { level: 2, gold: 350, timeSec: 30, materials: { slime_gel: 10, goblin_tooth: 8 }, desc: "Mở rộng 6 Giường ngủ (+30% Tốc độ hồi thể lực)" },
      { level: 3, gold: 1100, timeSec: 75, materials: { wolf_pelt: 15, cursed_bone: 12, slime_gel: 15 }, desc: "Quán Trọ Lông Sói 9 Giường (+60% Tốc độ hồi)" },
      { level: 4, gold: 3200, timeSec: 180, materials: { dark_cloth: 20, cursed_bone: 22, spirit_dust: 15 }, desc: "Quán Trọ Quý Tộc 12 Giường (Hồi thể lực cực nhanh)" },
      { level: 5, gold: 9500, timeSec: 360, materials: { lava_ore: 25, spirit_dust: 25, dark_cloth: 20 }, desc: "Cung Điện Nghỉ Dưỡng Thần Thoại 16 Giường" },
      { level: 6, gold: 26000, timeSec: 600, materials: { lava_ore: 45, spirit_dust: 40, cursed_bone: 35 }, desc: "Thiên Đường Nghỉ Dưỡng Vĩnh Hằng 20 Giường" }
    ],
    forge: [
      { level: 2, gold: 400, timeSec: 35, materials: { goblin_tooth: 12, slime_gel: 12 }, desc: "Lò Nung Cấp 2: Giảm 15% hao phí rèn & Mở khóa Cường Hóa +10" },
      { level: 3, gold: 1300, timeSec: 90, materials: { cursed_bone: 18, wolf_pelt: 15, goblin_tooth: 15 }, desc: "Lò Rèn Cổ Xưa: Giảm 25% hao phí rèn & Mở khóa Cường Hóa +15" },
      { level: 4, gold: 3800, timeSec: 200, materials: { dark_cloth: 22, cursed_bone: 22, spirit_dust: 18 }, desc: "Lò Nung Nham Thạch: Giảm 35% hao phí rèn & Mở khóa Cường Hóa +20" },
      { level: 5, gold: 11000, timeSec: 420, materials: { lava_ore: 30, spirit_dust: 30, dark_cloth: 25 }, desc: "Lò Luyện Long Hồn: Giảm 45% hao phí rèn & Mở khóa Cường Hóa +25" },
      { level: 6, gold: 32000, timeSec: 720, materials: { lava_ore: 55, spirit_dust: 50, cursed_bone: 40 }, desc: "Lò Thần Sáng Thế: Giảm 60% hao phí rèn & Mở khóa Cường Hóa +30 Tối Thượng" }
    ],
    tavern: [
      { level: 2, gold: 300, timeSec: 25, materials: { slime_gel: 14, goblin_tooth: 8 }, desc: "Bếp Lớn Cấp 2: Phục vụ 4 thợ săn cùng lúc (+20% No)" },
      { level: 3, gold: 950, timeSec: 70, materials: { wolf_pelt: 15, goblin_tooth: 12, slime_gel: 15 }, desc: "Bàn Tiệc Đại Ngàn: Món ăn buff thêm +15 Sát thương" },
      { level: 4, gold: 2800, timeSec: 160, materials: { spirit_dust: 20, cursed_bone: 20, dark_cloth: 18 }, desc: "Ẩm Thực Quỷ Tộc: Tự động hồi 100% Đói + 50 Máu" },
      { level: 5, gold: 8500, timeSec: 320, materials: { lava_ore: 25, spirit_dust: 25, dark_cloth: 20 }, desc: "Đại Tiệc Rồng Thiêng: Buff siêu cấp toàn diện" },
      { level: 6, gold: 24000, timeSec: 540, materials: { lava_ore: 45, spirit_dust: 40, cursed_bone: 35 }, desc: "Yến Tiệc Thần Ma Bất Diệt: Buff +150 ATK toàn diện" }
    ],
    clinic: [
      { level: 2, gold: 350, timeSec: 30, materials: { slime_gel: 12, goblin_tooth: 10 }, desc: "Phòng Cấp Cứu 2 Giường: Giảm 30% thời gian điều trị" },
      { level: 3, gold: 1100, timeSec: 80, materials: { cursed_bone: 16, dark_cloth: 14, wolf_pelt: 12 }, desc: "Phòng Phẫu Thuật: Tự động bào chế Tiên Dược Cấp Cao" },
      { level: 4, gold: 3400, timeSec: 180, materials: { dark_cloth: 22, spirit_dust: 20, cursed_bone: 20 }, desc: "Viện Y Học Hắc Ám: Tự dùng Bùa Hồi Sinh khi ngã gục" },
      { level: 5, gold: 10000, timeSec: 380, materials: { lava_ore: 25, spirit_dust: 30, dark_cloth: 25 }, desc: "Thánh Đường Thánh Quang: Hồi sinh tức thì 100% Máu" },
      { level: 6, gold: 28000, timeSec: 650, materials: { lava_ore: 50, spirit_dust: 50, cursed_bone: 40 }, desc: "Thần Điện Bất Tử: Hồi sinh không tốn thời gian" }
    ]
  },

  // TOWN HALL PROGRESSIVE UPGRADES (10 CẤP THỊ TRẤN MỞ KHÓA 10 VÙNG SĂN - THỬ THÁCH CÀY CUỐC DÀI HẠN)
  TOWN_UPGRADES: [
    { level: 2, gold: 450, timeSec: 45, materials: { slime_gel: 12, goblin_tooth: 8 }, hunters: 5, storage: 90, desc: "Mở khóa Hang Sói Rừng Sâu (Lv.11-20) | Max 5 Thợ Săn, 90 Kho" },
    { level: 3, gold: 1200, timeSec: 90, materials: { wolf_pelt: 15, goblin_tooth: 15, slime_gel: 20 }, hunters: 6, storage: 130, desc: "Mở khóa Nghĩa Địa Cổ (Lv.21-30) | Max 6 Thợ Săn, 130 Kho" },
    { level: 4, gold: 2800, timeSec: 180, materials: { cursed_bone: 22, dark_cloth: 18, wolf_pelt: 20 }, hunters: 7, storage: 180, desc: "Mở khóa Lăng Mộ Oán Linh (Lv.31-40) | Max 7 Thợ Săn, 180 Kho" },
    { level: 5, gold: 6500, timeSec: 300, materials: { spirit_dust: 25, cursed_bone: 30, dark_cloth: 25 }, hunters: 8, storage: 240, desc: "Mở khóa Núi Lửa Quỷ (Lv.41-50) | Max 8 Thợ Săn, 240 Kho" },
    { level: 6, gold: 14000, timeSec: 480, materials: { lava_ore: 30, spirit_dust: 30, cursed_bone: 30 }, hunters: 10, storage: 320, desc: "Mở khóa Vực Thẳm Dung Nham (Lv.51-60) | Max 10 Thợ Săn, 320 Kho" },
    { level: 7, gold: 30000, timeSec: 720, materials: { lava_ore: 45, spirit_dust: 40, dark_cloth: 35 }, hunters: 12, storage: 420, desc: "Mở khóa Hang Long Tộc (Lv.61-70) | Max 12 Thợ Săn, 420 Kho" },
    { level: 8, gold: 65000, timeSec: 1100, materials: { dragon_scale: 25, lava_ore: 60, spirit_dust: 50 }, hunters: 14, storage: 540, desc: "Mở khóa Thành Cổ Hư Không (Lv.71-80) | Max 14 Thợ Săn, 540 Kho" },
    { level: 9, gold: 140000, timeSec: 1600, materials: { dragon_scale: 50, lava_ore: 90, spirit_dust: 75 }, hunters: 16, storage: 700, desc: "Mở khóa Vực Sâu Hỗn Độn (Lv.81-90) | Max 16 Thợ Săn, 700 Kho" },
    { level: 10, gold: 300000, timeSec: 2400, materials: { dragon_scale: 100, lava_ore: 150, spirit_dust: 120 }, hunters: 20, storage: 900, desc: "Mở khóa Điện Thần Ma Malakor (Lv.91-100) | ĐẾ CHẾ TỐI THƯỢNG" }
  ],

  // BOUNTY QUEST TEMPLATES & REWARDS (Vàng + Kim Cương 💎 - Đầy đủ các vùng săn)
  QUEST_TEMPLATES: [
    { type: "kill", target: "m_slime", title: "Tiêu diệt 10 Slime Nhầy", reqCount: 10, rewardGold: 100, rewardGems: 1 },
    { type: "kill", target: "m_goblin", title: "Săn lùng 8 Goblin Trộm", reqCount: 8, rewardGold: 150, rewardGems: 1 },
    { type: "kill", target: "m_wolf", title: "Trừ khử 8 Sói Xám Rừng", reqCount: 8, rewardGold: 240, rewardGems: 2 },
    { type: "kill", target: "m_skeleton", title: "Thanh tẩy 8 Chiến Binh Xương", reqCount: 8, rewardGold: 360, rewardGems: 2 },
    { type: "kill", target: "m_ghost", title: "Trừ Tà 8 U Hồn Oán Linh", reqCount: 8, rewardGold: 500, rewardGems: 3 },
    { type: "kill", target: "m_golem", title: "Đập Tan 6 Golem Nham Thạch", reqCount: 6, rewardGold: 750, rewardGems: 3 },
    { type: "kill", target: "m_fire_demon", title: "Diệt Trừ 6 Hỏa Ma Vực Thẳm", reqCount: 6, rewardGold: 1100, rewardGems: 4 },
    { type: "kill", target: "m_young_dragon", title: "Săn 4 Hắc Long Ấu Thú", reqCount: 4, rewardGold: 1600, rewardGems: 5 },
    { type: "kill", target: "m_void_knight", title: "Hạ Gục 4 Kỵ Sĩ Hư Không", reqCount: 4, rewardGold: 2200, rewardGems: 6 },
    { type: "kill", target: "m_dragon", title: "Đồ Sát 3 Hắc Long Vương", reqCount: 3, rewardGold: 3500, rewardGems: 8 },
    { type: "kill", target: "m_boss_demon", title: "Trảm Sát Chúa Quỷ Malakor", reqCount: 1, rewardGold: 6000, rewardGems: 15 },
    
    { type: "collect", target: "slime_gel", title: "Thu thập 12 Chất Nhầy Slime", reqCount: 12, rewardGold: 120, rewardGems: 1 },
    { type: "collect", target: "wolf_pelt", title: "Thu thập 8 Da Sói Xám", reqCount: 8, rewardGold: 250, rewardGems: 2 },
    { type: "collect", target: "cursed_bone", title: "Thu thập 10 Xương Nguyền Rủa", reqCount: 10, rewardGold: 400, rewardGems: 2 },
    { type: "collect", target: "dark_cloth", title: "Thu thập 8 Vải Hắc Ám", reqCount: 8, rewardGold: 550, rewardGems: 3 },
    { type: "collect", target: "spirit_dust", title: "Thu thập 8 Bột Linh Hồn", reqCount: 8, rewardGold: 700, rewardGems: 3 },
    { type: "collect", target: "lava_ore", title: "Khai thác 10 Quặng Nham Thạch", reqCount: 10, rewardGold: 1000, rewardGems: 4 },
    { type: "collect", target: "dragon_scale", title: "Thu thập 6 Vảy Hắc Long", reqCount: 6, rewardGold: 2000, rewardGems: 6 },

    { type: "craft", target: "weapons", title: "Rèn 3 Món Vũ Khí Mới", reqCount: 3, rewardGold: 400, rewardGems: 2 },
    { type: "craft", target: "armors", title: "Rèn 3 Bộ Áo Giáp Mới", reqCount: 3, rewardGold: 400, rewardGems: 2 }
  ],

  // LIFETIME ACHIEVEMENTS (Hệ thống thành tựu đồ sộ thưởng cực nhiều Ngọc Triệu Hồi 💠 / Kim Cương 💎)
  ACHIEVEMENTS: [
    // 1. NHÁNH DIỆT QUÁI (MONSTER HUNTER)
    { id: "ach_kills_10", title: "Dũng Sĩ Diệt Quỷ I", desc: "Hạ gục tổng cộng 10 quái vật", target: 10, type: "kills", rewardGems: 5 },
    { id: "ach_kills_50", title: "Dũng Sĩ Diệt Quỷ II", desc: "Hạ gục tổng cộng 50 quái vật", target: 50, type: "kills", rewardGems: 10 },
    { id: "ach_kills_200", title: "Huyền Thoại Trảm Ma I", desc: "Hạ gục tổng cộng 200 quái vật", target: 200, type: "kills", rewardGems: 25 },
    { id: "ach_kills_500", title: "Huyền Thoại Trảm Ma II", desc: "Hạ gục tổng cộng 500 quái vật", target: 500, type: "kills", rewardGems: 50 },
    { id: "ach_kills_1500", title: "Chiến Thần Diệt Quỷ", desc: "Hạ gục tổng cộng 1,500 quái vật", target: 1500, type: "kills", rewardGems: 100 },
    { id: "ach_kills_5000", title: "Đấng Cứu Thế Tối Cao", desc: "Hạ gục tổng cộng 5,000 quái vật", target: 5000, type: "kills", rewardGems: 250 },
    { id: "ach_kills_15000", title: "Bá Chủ Tru Thần Vạn Cõi", desc: "Hạ gục tổng cộng 15,000 quái vật", target: 15000, type: "kills", rewardGems: 600 },
    
    // 2. NHÁNH LUYỆN KIM RÈN ĐỒ (FORGE MASTER)
    { id: "ach_craft_5", title: "Thợ Rèn Tập Sự", desc: "Chế tạo thành công 5 trang bị", target: 5, type: "crafts", rewardGems: 5 },
    { id: "ach_craft_20", title: "Đại Sư Luyện Kim", desc: "Chế tạo thành công 20 trang bị", target: 20, type: "crafts", rewardGems: 20 },
    { id: "ach_craft_50", title: "Thợ Rèn Thần Thoại", desc: "Chế tạo thành công 50 trang bị", target: 50, type: "crafts", rewardGems: 50 },
    { id: "ach_craft_150", title: "Thần Binh Sáng Thế Gia", desc: "Chế tạo thành công 150 trang bị", target: 150, type: "crafts", rewardGems: 150 },
    { id: "ach_craft_400", title: "Vũ Khí Đại Sư Vô Song", desc: "Chế tạo thành công 400 trang bị", target: 400, type: "crafts", rewardGems: 400 },

    // 3. NHÁNH PHÁT TRIỂN THỊ TRẤN (TOWN EMPIRE)
    { id: "ach_town_2", title: "Khai Phá Thị Trấn", desc: "Nâng cấp Thị Trấn lên Cấp 2", target: 2, type: "townLvl", rewardGems: 5 },
    { id: "ach_town_3", title: "Pháo Đài Kiên Cố", desc: "Nâng cấp Thị Trấn lên Cấp 3", target: 3, type: "townLvl", rewardGems: 10 },
    { id: "ach_town_5", title: "Kinh Đô Thợ Săn", desc: "Nâng cấp Thị Trấn lên Cấp 5", target: 5, type: "townLvl", rewardGems: 35 },
    { id: "ach_town_7", title: "Vương Quốc Bất Khả Xâm Phạm", desc: "Nâng cấp Thị Trấn lên Cấp 7", target: 7, type: "townLvl", rewardGems: 70 },
    { id: "ach_town_10", title: "Đại Đế Quốc Tối Thượng", desc: "Nâng cấp Thị Trấn lên Cấp 10", target: 10, type: "townLvl", rewardGems: 200 },
    { id: "ach_town_20", title: "Thần Điện Thiên Giới Vĩnh Hằng", desc: "Nâng cấp Thị Trấn lên Cấp 20", target: 20, type: "townLvl", rewardGems: 500 },
    { id: "ach_town_30", title: "Đại Đế Chế Sáng Thế", desc: "Nâng cấp Thị Trấn lên Cấp 30", target: 30, type: "townLvl", rewardGems: 1000 },
    { id: "ach_town_40", title: "Vương Triều Bất Diệt Vạn Cõi", desc: "Nâng cấp Thị Trấn lên Cấp 40", target: 40, type: "townLvl", rewardGems: 1800 },
    { id: "ach_town_50", title: "ĐẾ CHẾ VĨNH HẰNG SÁNG THẾ (MAX)", desc: "Nâng cấp Thị Trấn lên Cấp 50 (Đỉnh Cao Tối Thượng)", target: 50, type: "townLvl", rewardGems: 3000 },

    // 4. NHÁNH CHINH PHỤC HẦM NGỤC (ABYSS CONQUEROR)
    { id: "ach_dungeon_1", title: "Thám Hiểm Hầm Ngục", desc: "Vượt qua Hầm Ngục Tầng 1 (Đầm Lầy Slime)", target: 1, type: "dungeonFloor", rewardGems: 10 },
    { id: "ach_dungeon_5", title: "Trảm Diệt Dạ Xoa", desc: "Vượt qua Hầm Ngục Tầng 5 (Sào Huyệt Dạ Xoa)", target: 5, type: "dungeonFloor", rewardGems: 25 },
    { id: "ach_dungeon_10", title: "Thanh Trừ Infernal Diablo", desc: "Vượt qua Hầm Ngục Tầng 10 (Vực Sâu Địa Ngục)", target: 10, type: "dungeonFloor", rewardGems: 50 },
    { id: "ach_dungeon_15", title: "Băng Long Đồ Sát Giả", desc: "Vượt qua Hầm Ngục Tầng 15 (Cung Điện Băng Đen)", target: 15, type: "dungeonFloor", rewardGems: 90 },
    { id: "ach_dungeon_20", title: "Hộ Mệnh Tinh Tú Trừ Khử", desc: "Vượt qua Hầm Ngục Tầng 20 (Thánh Vực Tinh Tú)", target: 20, type: "dungeonFloor", rewardGems: 150 },
    { id: "ach_dungeon_25", title: "Khai Tử Thủy Tổ Bahamut", desc: "Vượt qua Hầm Ngục Tầng 25 (Động Hắc Long)", target: 25, type: "dungeonFloor", rewardGems: 250 },
    { id: "ach_dungeon_30", title: "BÁ CHỦ HƯ KHÔNG MALAKOR", desc: "Vượt qua Hầm Ngục Tầng 30 (Phá Đảo Tối Thượng)", target: 30, type: "dungeonFloor", rewardGems: 600 },

    // 5. NHÁNH ĐỘT PHÁ CẢNH GIỚI (BREAKTHROUGH REALM)
    { id: "ach_star_1", title: "Khai Mở Tinh Anh ⭐", desc: "Có ít nhất 1 thợ săn Đột Phá ⭐ Cảnh Giới 1", target: 1, type: "breakthroughStar", rewardGems: 15 },
    { id: "ach_star_2", title: "Đại Sư Tông Sư ⭐⭐", desc: "Có ít nhất 1 thợ săn Đột Phá ⭐⭐ Cảnh Giới 2", target: 2, type: "breakthroughStar", rewardGems: 40 },
    { id: "ach_star_3", title: "Vương Giả Thần Vương ⭐⭐⭐", desc: "Có ít nhất 1 thợ săn Đột Phá ⭐⭐⭐ Cảnh Giới 3", target: 3, type: "breakthroughStar", rewardGems: 100 },
    { id: "ach_star_4", title: "Chí Tôn Vô Thượng ⭐⭐⭐⭐", desc: "Có ít nhất 1 thợ săn Đột Phá ⭐⭐⭐⭐ Cảnh Giới 4", target: 4, type: "breakthroughStar", rewardGems: 250 },
    { id: "ach_star_5", title: "THẦN MA SÁNG THẾ ⭐⭐⭐⭐⭐", desc: "Có ít nhất 1 thợ săn đạt Cảnh Giới Tối Thượng 5 Sao", target: 5, type: "breakthroughStar", rewardGems: 650 },

    // 6. NHÁNH TỔNG LỰC CHIẾN (COMBAT POWER)
    { id: "ach_power_10k", title: "Lực Lượng Hùng Hậu I", desc: "Tổng Lực Chiến thị trấn đạt 10,000 CP", target: 10000, type: "totalPower", rewardGems: 10 },
    { id: "ach_power_100k", title: "Lực Lượng Hùng Hậu II", desc: "Tổng Lực Chiến thị trấn đạt 100,000 CP", target: 100000, type: "totalPower", rewardGems: 30 },
    { id: "ach_power_500k", title: "Binh Đoàn Vô Song", desc: "Tổng Lực Chiến thị trấn đạt 500,000 CP", target: 500000, type: "totalPower", rewardGems: 80 },
    { id: "ach_power_2m", title: "Quân Đoàn Thần Thánh", desc: "Tổng Lực Chiến thị trấn đạt 2,000,000 CP", target: 2000000, type: "totalPower", rewardGems: 200 },
    { id: "ach_power_10m", title: "SỨC MẠNH HỦY THIÊN DIỆT ĐỊA", desc: "Tổng Lực Chiến thị trấn đạt 10,000,000 CP", target: 10000000, type: "totalPower", rewardGems: 500 },

    // 7. NHÁNH KHO TÀNG & CÔNG NGHỆ (WEALTH & TECH)
    { id: "ach_gold_50k", title: "Triệu Phú Làng", desc: "Ngân Khố thị trấn tích lũy đạt 50,000 Vàng", target: 50000, type: "goldEarned", rewardGems: 20 },
    { id: "ach_gold_500k", title: "Tỷ Phú Đế Chế", desc: "Ngân Khố thị trấn tích lũy đạt 500,000 Vàng", target: 500000, type: "goldEarned", rewardGems: 100 },
    { id: "ach_gold_5m", title: "Vương Khố Kim Ngân Vô Tận", desc: "Ngân Khố thị trấn tích lũy đạt 5,000,000 Vàng", target: 5000000, type: "goldEarned", rewardGems: 350 },
    { id: "ach_tech_5", title: "Nhà Nghiên Cứu", desc: "Nghiên cứu thành công 5 công nghệ", target: 5, type: "techCount", rewardGems: 25 },
    { id: "ach_tech_15", title: "Viện Hàn Lâm Thần Học", desc: "Nghiên cứu thành công 15 công nghệ", target: 15, type: "techCount", rewardGems: 120 }
  ],

  // COMPREHENSIVE 4-BRANCH RESEARCH TECH TREE (5 BẬC CÔNG NGHỆ CHUYÊN SÂU TỪ LEVEL 1 ĐẾN LEVEL 10)
  RESEARCH_TECHS: [
    // NHÁNH 1: KINH TẾ & THỊ TRẤN
    { id: "tech_tax_master", branch: "economy", name: "Bậc Thầy Thuế Vụ", desc: "Tăng +15% vàng thu được từ mọi dịch vụ Quán Trọ, Quán Ăn, Y Tế", costGold: 350, reqTownLvl: 1 },
    { id: "tech_storage_expand", branch: "economy", name: "Mở Rộng Hầm Chứa I", desc: "Tăng vĩnh viễn +60 Sức chứa Kho Đồ Thị Trấn", costGold: 750, reqTownLvl: 2 },
    { id: "tech_gold_merchant", branch: "economy", name: "Hiệp Hội Thương Gia", desc: "Thợ săn kiếm thêm +25% Vàng khi hạ gục quái vật", costGold: 2200, reqTownLvl: 3 },
    { id: "tech_storage_expand_2", branch: "economy", name: "Mở Rộng Hầm Chứa II", desc: "Tăng vĩnh viễn thêm +120 Sức chứa Kho Đồ", costGold: 6000, reqTownLvl: 5 },
    { id: "tech_imperial_treasury", branch: "economy", name: "Ngân Khố Đế Vương", desc: "Tăng +35% vàng từ mọi nguồn thu trong toàn bộ Thị Trấn", costGold: 35000, reqTownLvl: 8 },

    // NHÁNH 2: LUYỆN KIM & QUÂN SỰ
    { id: "tech_master_forge", branch: "military", name: "Luyện Kim Siêu Bền", desc: "Giảm 25% nguyên liệu khi rèn vũ khí và áo giáp", costGold: 450, reqTownLvl: 1 },
    { id: "tech_sharp_blade", branch: "military", name: "Thuật Mài Kiếm Bí Truyền", desc: "Tăng vĩnh viễn +15% Sát Thương (ATK) cho toàn bộ thợ săn", costGold: 1200, reqTownLvl: 2 },
    { id: "tech_enchant_blessing", branch: "military", name: "Phúc Lành Lò Rèn", desc: "Tăng +20% tỷ lệ cường hóa thành công từ +1 đến +30", costGold: 3500, reqTownLvl: 4 },
    { id: "tech_divine_smith", branch: "military", name: "Kỹ Nghệ Rèn Thần Thoại", desc: "Tăng thêm +25% Sát Thương và +25% Phòng ngự cho toàn bộ trang bị", costGold: 12000, reqTownLvl: 6 },
    { id: "tech_godly_armory", branch: "military", name: "Vũ Khí Thánh Sáng Thế", desc: "Kích hoạt hiệu ứng x2 Bạo Kích (Critical) cho toàn bộ Thợ Săn", costGold: 50000, reqTownLvl: 9 },

    // NHÁNH 3: Y THUẬT & SINH TỒN
    { id: "tech_feather_bed", branch: "survival", name: "Đệm Ngủ Lông Vũ", desc: "Giảm 50% thời gian ngủ hồi phục thể lực tại Quán Trọ", costGold: 300, reqTownLvl: 1 },
    { id: "tech_gourmet_chef", branch: "survival", name: "Gia Vị Hoàng Cung", desc: "Món ăn hồi phục thêm +30% Đói và buff +15 Sát thương", costGold: 900, reqTownLvl: 2 },
    { id: "tech_vitality_boost", branch: "survival", name: "Huyết Thanh Sinh Lực", desc: "Tăng vĩnh viễn +25% Máu (HP) tối đa cho toàn bộ thợ săn", costGold: 2800, reqTownLvl: 3 },
    { id: "tech_immortal_medicine", branch: "survival", name: "Bí Truyền Trường Sinh", desc: "Tăng +50% hiệu quả hồi máu từ toàn bộ Tiên Dược & Bác Sĩ", costGold: 9500, reqTownLvl: 5 },
    { id: "tech_phoenix_rebirth", branch: "survival", name: "Huyết Mạch Phượng Hoàng", desc: "Thợ săn tự động hồi sinh 50% Máu một lần mỗi chuyến đi săn", costGold: 45000, reqTownLvl: 8 },

    // NHÁNH 4: THÁM HIỂM & SĂN BẮT
    { id: "tech_eagle_eye", branch: "hunting", name: "Mắt Chim Đại Bàng", desc: "Tăng +35% Tỷ lệ rơi chiến lợi phẩm hiếm từ quái vật", costGold: 800, reqTownLvl: 2 },
    { id: "tech_speed_boots", branch: "hunting", name: "Thuật Phong Hành", desc: "Tăng +30% Tốc độ di chuyển và tốc độ đánh của thợ săn", costGold: 2400, reqTownLvl: 3 },
    { id: "tech_dragon_hunter", branch: "hunting", name: "Kỹ Năng Đồ Long", desc: "Tăng +40% Sát thương của thợ săn khi chiến đấu với Quái Vật Vùng Cao (Lv.60+)", costGold: 8000, reqTownLvl: 5 },
    { id: "tech_void_tracker", branch: "hunting", name: "La Bàn Hư Không", desc: "Nhận thêm +50% EXP kinh nghiệm cho toàn bộ thợ săn khi diệt quái", costGold: 22000, reqTownLvl: 7 },
    { id: "tech_demon_slayer_aura", branch: "hunting", name: "Hào Quang Diệt Quỷ Tối Thượng", desc: "Toàn bộ Thợ Săn gây thêm +50% Sát thương lên Boss Chúa Quỷ", costGold: 60000, reqTownLvl: 9 }
  ],

  // BREAKTHROUGH REALM REQUIREMENTS (Yêu cầu Đột Phá Cảnh Giới khi Thợ Săn đạt Lv.100 - CHI PHÍ LŨY TIẾN HÀM SỐ MŨ)
  BREAKTHROUGH_COSTS: [
    {
      star: 1,
      title: "Tinh Anh",
      gold: 5000,
      materials: { mat_breakthrough_stone: 5 },
      successRate: 0.85, // 85%
      bonusHp: 0.40,
      bonusAtk: 0.35,
      bonusDef: 0.35,
      rewardGems: 5,
      desc: "Mở khóa Hào Quang Tinh Anh ⭐ (Tỉ lệ: 85%), tăng vọt +40% HP, +35% ATK, +35% DEF vĩnh viễn! (Săn tại Hầm Ngục Tầng 1-4)"
    },
    {
      star: 2,
      title: "Tông Sư",
      gold: 25000,
      materials: { mat_breakthrough_stone: 10, mat_divine_core: 3 },
      successRate: 0.70, // 70%
      bonusHp: 0.40,
      bonusAtk: 0.35,
      bonusDef: 0.35,
      rewardGems: 10,
      desc: "Mở khóa Hào Quang Tông Sư ⭐⭐ (Tỉ lệ: 70%), tăng vọt +40% HP, +35% ATK, +35% DEF vĩnh viễn! (Săn tại Hầm Ngục Tầng 5-11)"
    },
    {
      star: 3,
      title: "Thần Vương",
      gold: 125000,
      materials: { mat_divine_core: 8, mat_astral_essence: 3 },
      successRate: 0.55, // 55%
      bonusHp: 0.40,
      bonusAtk: 0.35,
      bonusDef: 0.35,
      rewardGems: 20,
      desc: "Mở khóa Hào Quang Thần Vương ⭐⭐⭐ (Tỉ lệ: 55%), tăng vọt +40% HP, +35% ATK, +35% DEF vĩnh viễn! (Săn tại Hầm Ngục Tầng 12-19)"
    },
    {
      star: 4,
      title: "Chí Tôn",
      gold: 650000,
      materials: { mat_astral_essence: 10, mat_dragon_heart: 4 },
      successRate: 0.40, // 40%
      bonusHp: 0.40,
      bonusAtk: 0.35,
      bonusDef: 0.35,
      rewardGems: 40,
      desc: "Mở khóa Hào Quang Chí Tôn ⭐⭐⭐⭐ (Tỉ lệ: 40%), tăng vọt +40% HP, +35% ATK, +35% DEF vĩnh viễn! (Săn tại Hầm Ngục Tầng 20-24)"
    },
    {
      star: 5,
      title: "Thần Ma Sáng Thế",
      gold: 3500000,
      materials: { mat_dragon_heart: 10, mat_chaos_shard: 5 },
      successRate: 0.25, // 25%
      bonusHp: 0.45,
      bonusAtk: 0.40,
      bonusDef: 0.40,
      rewardGems: 100,
      desc: "CẢNH GIỚI TỐI THƯỢNG ⭐⭐⭐⭐⭐ (Tỉ lệ: 25%)! Hào Quang Thần Ma Sáng Thế! (Săn tại Hầm Ngục Tầng 25-30)"
    }
  ],

  // 30-FLOOR ABYSS DUNGEON (HỆ THỐNG HẦM NGỤC SIÊU KHÓ - CẦN CƯỜNG HÓA & ĐỘT PHÁ CẢNH GIỚI)
  DUNGEON_FLOORS: [
    {
      floor: 1,
      name: "Tầng 1: Đầm Lầy Slime Vua",
      icon: "🟢",
      bossName: "Vua Slime Khổng Lồ",
      bossGlyph: "👑(◉_◉)👑",
      difficulty: 1,
      bossHp: 600,
      bossAtk: 18,
      bossDef: 4,
      reqPower: 600,
      enrageSec: 45,
      firstClear: { gold: 500, gems: 5, materials: { mat_breakthrough_stone: 3 } },
      farmReward: { gold: 100, materials: { mat_breakthrough_stone: 1 } },
      desc: "Chúa tể loài Slime chất độc hại. Yêu cầu thợ săn trang bị vũ khí cơ bản."
    },
    {
      floor: 2,
      name: "Tầng 2: Hang Goblin Bạo Chúa",
      icon: "👺",
      bossName: "Tù Trưởng Goblin Hắc Ám",
      bossGlyph: "🗡️[ò_ó]🛡️",
      difficulty: 2,
      bossHp: 1200,
      bossAtk: 28,
      bossDef: 8,
      reqPower: 1500,
      enrageSec: 45,
      firstClear: { gold: 800, gems: 8, materials: { mat_breakthrough_stone: 4 } },
      farmReward: { gold: 180, materials: { mat_breakthrough_stone: 1 } },
      desc: "Tên thủ lĩnh Goblin tàn bạo với đòn chém chí mạng xuyên thủng giáp."
    },
    {
      floor: 3,
      name: "Tầng 3: Hang Sói Băng Giá",
      icon: "🐺",
      bossName: "Bạch Lang Chúa Tuyết Sơn",
      bossGlyph: "❄️/^W^/❄️",
      difficulty: 3,
      bossHp: 2200,
      bossAtk: 40,
      bossDef: 14,
      reqPower: 3200,
      enrageSec: 45,
      firstClear: { gold: 1200, gems: 10, materials: { mat_breakthrough_stone: 5 } },
      farmReward: { gold: 280, materials: { mat_breakthrough_stone: 1 } },
      desc: "Sói tuyết vĩ đại với hơi thở băng giá làm chậm và sát thương liên tục."
    },
    {
      floor: 4,
      name: "Tầng 4: Hầm Mộ Xương Nguyền",
      icon: "💀",
      bossName: "Đại Tướng Xương Bất Tử",
      bossGlyph: "⚔️💀(†)💀⚔️",
      difficulty: 4,
      bossHp: 3800,
      bossAtk: 58,
      bossDef: 22,
      reqPower: 6500,
      enrageSec: 45,
      firstClear: { gold: 1800, gems: 12, materials: { mat_breakthrough_stone: 6 } },
      farmReward: { gold: 400, materials: { mat_breakthrough_stone: 2 } },
      desc: "Tử thần cổ xưa thức tỉnh, triệu hồi sóng xương hắc ám càn quét toàn đội."
    },
    {
      floor: 5,
      name: "Tầng 5: Sào Huyệt Dạ Xoa",
      icon: "👹",
      bossName: "Dạ Xoa Quỷ Vương (6 Tay)",
      bossGlyph: "🔱[◣_◢]🔱",
      difficulty: 5,
      bossHp: 6500,
      bossAtk: 80,
      bossDef: 32,
      reqPower: 12000,
      enrageSec: 50,
      firstClear: { gold: 3000, gems: 15, materials: { mat_breakthrough_stone: 8, mat_divine_core: 1 } },
      farmReward: { gold: 600, materials: { mat_breakthrough_stone: 2 } },
      desc: "MỐC NGHẸT THỞ: Quỷ vương bộc phát nộ cuồng sát chiêu diện rộng! Mở khóa Lõi Thần Ma Đột Phá ⭐ Tinh Anh."
    },
    {
      floor: 6,
      name: "Tầng 6: Phế Tích Oán Linh",
      icon: "👻",
      bossName: "Nữ Hoàng U Hồn Bất Diệt",
      bossGlyph: "✨{~_~}✨",
      difficulty: 6,
      bossHp: 9500,
      bossAtk: 105,
      bossDef: 42,
      reqPower: 18000,
      enrageSec: 50,
      firstClear: { gold: 4500, gems: 18, materials: { mat_breakthrough_stone: 10, mat_divine_core: 1 } },
      farmReward: { gold: 800, materials: { mat_breakthrough_stone: 2 } },
      desc: "Tiếng rít u hồn xuyên thấu tâm can, gây sát thương chuẩn bỏ qua giáp."
    },
    {
      floor: 7,
      name: "Tầng 7: Huyết Trì Cổ",
      icon: "🩸",
      bossName: "Bá Tước Ma Cà Rồng",
      bossGlyph: "🦇[▼_▼]🦇",
      difficulty: 7,
      bossHp: 14000,
      bossAtk: 135,
      bossDef: 55,
      reqPower: 26000,
      enrageSec: 50,
      firstClear: { gold: 6000, gems: 20, materials: { mat_breakthrough_stone: 12, mat_divine_core: 2 } },
      farmReward: { gold: 1100, materials: { mat_breakthrough_stone: 2, mat_divine_core: 1 } },
      desc: "Hút máu dũng sĩ hồi phục bản thân và tung đòn kết liễu cực độc."
    },
    {
      floor: 8,
      name: "Tầng 8: Đền Thờ Golem Đá",
      icon: "🗿",
      bossName: "Cự Thần Titan Cổ Đại",
      bossGlyph: "🛡️[[■_■]]🛡️",
      difficulty: 8,
      bossHp: 20000,
      bossAtk: 170,
      bossDef: 70,
      reqPower: 35000,
      enrageSec: 55,
      firstClear: { gold: 8000, gems: 22, materials: { mat_breakthrough_stone: 14, mat_divine_core: 2 } },
      farmReward: { gold: 1500, materials: { mat_breakthrough_stone: 2, mat_divine_core: 1 } },
      desc: "Giáp đá hộ thể giảm 40% sát thương nhận vào, yêu cầu DPS bạo kích khủng khiếp."
    },
    {
      floor: 9,
      name: "Tầng 9: Núi Lửa Dung Nham",
      icon: "🔥",
      bossName: "Hỏa Long Bạo Tướng",
      bossGlyph: "🔥🐉[Ò_Ó]🐉🔥",
      difficulty: 9,
      bossHp: 28000,
      bossAtk: 210,
      bossDef: 90,
      reqPower: 45000,
      enrageSec: 55,
      firstClear: { gold: 10000, gems: 25, materials: { mat_breakthrough_stone: 16, mat_divine_core: 3 } },
      farmReward: { gold: 2000, materials: { mat_breakthrough_stone: 3, mat_divine_core: 1 } },
      desc: "Bão lửa địa ngục thiêu đốt toàn sàn đấu, trừ máu theo % mỗi giây."
    },
    {
      floor: 10,
      name: "Tầng 10: Vực Sâu Địa Ngục",
      icon: "😈",
      bossName: "Ma Thần Infernal Diablo",
      bossGlyph: "⚡👑[☠️◣_◢☠️]👑⚡",
      difficulty: 10,
      bossHp: 38000,
      bossAtk: 260,
      bossDef: 110,
      reqPower: 60000,
      enrageSec: 55,
      firstClear: { gold: 15000, gems: 35, materials: { mat_divine_core: 5, mat_astral_essence: 1 } },
      farmReward: { gold: 2800, materials: { mat_breakthrough_stone: 3, mat_divine_core: 1 } },
      desc: "MỐC TỬ THẦN TẦNG 10: Yêu cầu đội thợ săn Đột Phá ⭐⭐ Tông Sư và Cường Hóa cao cấp!"
    },
    {
      floor: 15,
      name: "Tầng 15: Cung Điện Băng Đen",
      icon: "🧊",
      bossName: "Băng Long Vương Nidhogg",
      bossGlyph: "❄️🐉[▼_▼]🐉❄️",
      difficulty: 15,
      bossHp: 85000,
      bossAtk: 440,
      bossDef: 180,
      reqPower: 150000,
      enrageSec: 60,
      firstClear: { gold: 25000, gems: 50, materials: { mat_divine_core: 8, mat_astral_essence: 3 } },
      farmReward: { gold: 4500, materials: { mat_divine_core: 2, mat_astral_essence: 1 } },
      desc: "Hàn băng ngàn năm đóng băng đội hình, sát thương bùng nổ khi Boss dưới 50% HP."
    },
    {
      floor: 20,
      name: "Tầng 20: Thánh Vực Tinh Tú",
      icon: "🌟",
      bossName: "Thần Hộ Mệnh Tinh Vân",
      bossGlyph: "🌌✨[۞_۞]✨🌌",
      difficulty: 20,
      bossHp: 380000,
      bossAtk: 1300,
      bossDef: 500,
      reqPower: 2000000,
      enrageSec: 60,
      firstClear: { gold: 45000, gems: 75, materials: { mat_astral_essence: 6, mat_dragon_heart: 2 } },
      farmReward: { gold: 8000, materials: { mat_astral_essence: 2, mat_dragon_heart: 1 } },
      desc: "MỐC ĐẠI HẠN TẦNG 20: Bão sao băng hủy diệt! Mở khóa Trái Tim Cổ Long Đột Phá Thần Vương ⭐⭐⭐!"
    },
    {
      floor: 25,
      name: "Tầng 25: Động Hắc Long Tổ",
      icon: "🐉",
      bossName: "Thủy Tổ Hắc Long Bahamut",
      bossGlyph: "🔥👑🐉[☠️_☠️]🐉👑🔥",
      difficulty: 25,
      bossHp: 550000,
      bossAtk: 1600,
      bossDef: 550,
      reqPower: 3200000,
      enrageSec: 60,
      firstClear: { gold: 80000, gems: 120, materials: { mat_dragon_heart: 6, mat_chaos_shard: 2 } },
      farmReward: { gold: 14000, materials: { mat_dragon_heart: 2, mat_chaos_shard: 1 } },
      desc: "MỐC KHAI PHÁ TẦNG 25: Thử thách bằng đội hình Chí Tôn ⭐⭐⭐⭐ để đoạt Mảnh Hỗn Độn mở đường Đột Phá Thần Ma ⭐⭐⭐⭐⭐!"
    },
    {
      floor: 30,
      name: "Tầng 30: Hư Không Tối Thượng",
      icon: "👑",
      bossName: "Hỗn Độn Ma Tôn Malakor (Tối Cường)",
      bossGlyph: "🌌👑⚔️[☠️MALAKOR☠️]⚔️👑🌌",
      difficulty: 30,
      bossHp: 1200000,
      bossAtk: 2600,
      bossDef: 850,
      reqPower: 6500000,
      enrageSec: 60,
      firstClear: { gold: 200000, gems: 300, materials: { mat_chaos_shard: 8 } },
      farmReward: { gold: 30000, materials: { mat_dragon_heart: 3, mat_chaos_shard: 2 } },
      desc: "ĐỈNH CAO HẦM NGỤC TẦNG 30: Thử thách tối thượng hạ gục Ma Tôn Malakor bằng đội hình Chí Tôn ⭐⭐⭐⭐ đỉnh phong hoặc Thần Ma ⭐⭐⭐⭐⭐!"
    }
  ],

  getDungeonFloorData(floorNum) {
    const f = Number(floorNum) || 1;
    const explicit = this.DUNGEON_FLOORS.find(df => df.floor === f);
    if (explicit) return explicit;

    // Procedural scaling for intermediate floors
    const prev = this.DUNGEON_FLOORS.reduce((acc, curr) => (curr.floor <= f && curr.floor > acc.floor ? curr : acc), this.DUNGEON_FLOORS[0]);
    const diff = f;
    const hp = Math.floor(1800 * Math.pow(1.23, f - 1));
    const atk = Math.floor(35 * Math.pow(1.15, f - 1));
    const def = Math.floor(12 + Math.pow(f, 1.6) * 1.8);
    const reqPower = Math.floor(3000 * Math.pow(1.26, f - 1));
    
    // Choose appropriate breakthrough material drop
    let matKey = "mat_breakthrough_stone";
    let matCount = Math.min(10, 1 + Math.floor(f / 3));
    let extraMat = null;

    if (f >= 25) {
      matKey = "mat_chaos_shard";
      extraMat = "mat_dragon_heart";
    } else if (f >= 18) {
      matKey = "mat_dragon_heart";
      extraMat = "mat_astral_essence";
    } else if (f >= 12) {
      matKey = "mat_astral_essence";
      extraMat = "mat_divine_core";
    } else if (f >= 5) {
      matKey = "mat_divine_core";
      extraMat = "mat_breakthrough_stone";
    }

    const firstMats = { [matKey]: matCount };
    if (extraMat) firstMats[extraMat] = Math.max(1, Math.floor(matCount / 2));

    const farmMats = { [matKey]: Math.max(1, Math.floor(matCount / 3)) };

    return {
      floor: f,
      name: `Tầng ${f}: ${prev.name.split(':')[1] || 'Vực Thẳm Thử Thách'} (Độ Khó Cấp ${f})`,
      icon: prev.icon || "🗝️",
      bossName: `Thủ Lĩnh Hầm Ngục Tầng ${f}`,
      bossGlyph: prev.bossGlyph || "⚔️[☠️_☠️]⚔️",
      difficulty: diff,
      bossHp: hp,
      bossAtk: atk,
      bossDef: def,
      reqPower: reqPower,
      enrageSec: Math.min(60, 45 + Math.floor(f * 0.5)),
      firstClear: { gold: f * 1000, gems: Math.min(150, 5 + f * 4), materials: firstMats },
      farmReward: { gold: f * 200, materials: farmMats },
      desc: `Độ khó Cấp ${diff}. Thử thách hiểm nguy tầng sâu Hầm Ngục!`
    };
  },

  // TỈ LỆ THÀNH CÔNG CƯỜNG HÓA TỪ +1 ĐẾN +30 (ENCHANTMENT SUCCESS RATES)
  getEnchantRate(targetPlus) {
    const plus = Math.max(1, Math.min(30, Number(targetPlus) || 1));
    const rates = [
      0,
      1.00, // +1: 100%
      0.95, // +2: 95%
      0.90, // +3: 90%
      0.85, // +4: 85%
      0.80, // +5: 80%
      0.75, // +6: 75%
      0.70, // +7: 70%
      0.65, // +8: 65%
      0.60, // +9: 60%
      0.55, // +10: 55%
      0.50, // +11: 50%
      0.45, // +12: 45%
      0.40, // +13: 40%
      0.35, // +14: 35%
      0.30, // +15: 30%
      0.26, // +16: 26%
      0.23, // +17: 23%
      0.20, // +18: 20%
      0.18, // +19: 18%
      0.15, // +20: 15%
      0.13, // +21: 13%
      0.11, // +22: 11%
      0.09, // +23: 9%
      0.08, // +24: 8%
      0.07, // +25: 7%
      0.06, // +26: 6%
      0.05, // +27: 5%
      0.04, // +28: 4%
      0.03, // +29: 3%
      0.02  // +30: 2% (Tối Thượng)
    ];
    let baseRate = rates[plus] || 0.02;
    if (window.gameState?.researched?.tech_enchant_blessing) {
      baseRate = Math.min(1.0, baseRate + 0.15); // +15% buff từ Công nghệ Lò Rèn
    }
    return baseRate;
  }
};

window.CONFIG = CONFIG;
