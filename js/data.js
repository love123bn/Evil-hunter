// ═══════════════════════════════════════════════════════════
// DARK REALM TYCOON — Game Data Database
// ═══════════════════════════════════════════════════════════

const GAME_DATA = {

  // ─── HUNTER CLASSES ───────────────────────────────────────
  classes: {
    paladin: {
      id: 'paladin', name: 'Hiệp Sĩ', icon: '🛡️',
      desc: 'Tank tuyến đầu, HP cao, giáp vững chắc',
      baseStats: { hp: 150, atk: 12, def: 18, spd: 8, crit: 5 },
      growthPerLevel: { hp: 18, atk: 2.0, def: 3.0, spd: 0.3, crit: 0.2 },
      skills: [
        { level: 5, name: 'Khiên Phòng Thủ', desc: 'Giảm 30% sát thương trong 3 turn', type: 'defense', power: 0.7, cooldown: 4 },
        { level: 15, name: 'Thánh Quang', desc: 'Hồi phục 25% HP', type: 'heal', power: 0.25, cooldown: 5 },
        { level: 30, name: 'Thách Thức', desc: 'Khiêu khích kẻ thù mạnh nhất, giảm DEF 20%', type: 'taunt', power: 0.8, cooldown: 6 },
        { level: 50, name: 'Lời Thề Bảo Hộ', desc: 'Bảo vệ đồng đội yếu nhất, nhận thay sát thương', type: 'protect', power: 0.5, cooldown: 8 },
      ]
    },
    berserker: {
      id: 'berserker', name: 'Chiến Binh', icon: '⚔️',
      desc: 'Sát thương cận chiến cao, chí mạng mạnh',
      baseStats: { hp: 100, atk: 22, def: 10, spd: 12, crit: 12 },
      growthPerLevel: { hp: 12, atk: 3.5, def: 1.5, spd: 0.5, crit: 0.5 },
      skills: [
        { level: 5, name: 'Phe Đấu', desc: 'Tấn công 2 lần liên tiếp', type: 'multi_hit', power: 0.6, cooldown: 3 },
        { level: 15, name: 'Cuồng怒', desc: 'Tăng ATK 50% trong 3 turn', type: 'buff_atk', power: 0.5, cooldown: 5 },
        { level: 30, name: 'Chém LiỀn', desc: 'Sát thương cực lớn 1 mục tiêu', type: 'heavy_strike', power: 2.0, cooldown: 6 },
        { level: 50, name: 'Berserk Mode', desc: 'HP giảm 30%, ATK tăng 100%', type: 'berserk', power: 1.0, cooldown: 10 },
      ]
    },
    ranger: {
      id: 'ranger', name: 'Cung Thủ', icon: '🏹',
      desc: 'Tấn công từ xa, tốc độ cao, né tránh tốt',
      baseStats: { hp: 80, atk: 18, def: 8, spd: 18, crit: 15 },
      growthPerLevel: { hp: 10, atk: 2.8, def: 1.0, spd: 0.8, crit: 0.6 },
      skills: [
        { level: 5, name: 'Mũi Tên Lửa', desc: 'Sát thương bỏ qua 30% giáp', type: 'armor_pierce', power: 1.1, cooldown: 3 },
        { level: 15, name: 'Bẫy Sắt', desc: 'Giảm SPD kẻ thù 40% trong 3 turn', type: 'slow', power: 0.4, cooldown: 4 },
        { level: 30, name: 'Mưa Tên', desc: 'Tấn công tất cả kẻ thù', type: 'aoe', power: 0.7, cooldown: 5 },
        { level: 50, name: 'Phóng Xạ', desc: 'Critical hit đảm bảo, sát thương x3', type: 'guaranteed_crit', power: 3.0, cooldown: 8 },
      ]
    },
    sorcerer: {
      id: 'sorcerer', name: 'Pháp Sư', icon: '🔮',
      desc: 'Sát thương phép thuật diện rộng, debuff kẻ thù',
      baseStats: { hp: 70, atk: 25, def: 5, spd: 10, crit: 8 },
      growthPerLevel: { hp: 8, atk: 4.0, def: 0.8, spd: 0.4, crit: 0.3 },
      skills: [
        { level: 5, name: 'Lửa Hades', desc: 'Sát thương lửa theo thời gian', type: 'dot', power: 0.8, cooldown: 3 },
        { level: 15, name: 'Băng Giá', desc: 'Đóng băng kẻ thù 2 turn', type: 'freeze', power: 0.5, cooldown: 5 },
        { level: 30, name: 'Sấm Sét', desc: 'Sát thương diện rộng cực lớn', type: 'aoe_heavy', power: 1.5, cooldown: 6 },
        { level: 50, name: 'Hủy Diệt', desc: 'Sát thương phép thuật x5', type: 'ultimate', power: 5.0, cooldown: 12 },
      ]
    }
  },

  // ─── BUILDINGS ─────────────────────────────────────────────
  buildings: {
    townhall: {
      id: 'townhall', name: 'Nhà Làng', icon: '🏛️',
      desc: 'Trụ sở chính. Nâng cấp mở khóa features mới',
      maxLevel: 10,
      baseCost: 100,
      costMultiplier: 2.5,
      effects: (level) => ({
        maxHunters: 5 + level * 2,
        unlockDifficulty: Math.floor(level / 2),
      }),
      upgradeBenefits: (level) => `Mở khóa ${Math.floor(level/2)} difficulty tiers, ${5 + level*2} slots thợ săn`
    },
    inn: {
      id: 'inn', name: 'Nhà Trọ', icon: '🏠',
      desc: 'Thợ Săn hồi phục HP khi nghỉ ngơi',
      maxLevel: 8,
      baseCost: 80,
      costMultiplier: 2.0,
      effects: (level) => ({
        healRate: 5 + level * 3,
        maxCapacity: 3 + level,
        restSpeed: 1 + level * 0.15,
      }),
      upgradeBenefits: (level) => `Hồi ${(5+level*3)}% HP/tick, chứa ${3+level} thợ săn`
    },
    restaurant: {
      id: 'restaurant', name: 'Nhà Hàng', icon: '🍖',
      desc: 'Cung cấp thức ăn — buff stats tạm thời cho Thợ Săn',
      maxLevel: 8,
      baseCost: 60,
      costMultiplier: 2.0,
      effects: (level) => ({
        foodQuality: level,
        maxBuff: 5 + level * 5,
        foodCapacity: 10 + level * 5,
      }),
      upgradeBenefits: (level) => `Buff tối đa ${5+level*5}%, chứa ${10+level*5} suất`
    },
    blacksmith: {
      id: 'blacksmith', name: 'Lò Rèn', icon: '🔨',
      desc: 'Chế tạo vũ khí và giáp cho Thợ Săn',
      maxLevel: 10,
      baseCost: 120,
      costMultiplier: 2.2,
      effects: (level) => ({
        craftQuality: level,
        craftSpeed: 1 + level * 0.2,
        unlockTier: Math.floor(level / 2) + 1,
      }),
      upgradeBenefits: (level) => `Chất lượng Lv.${level}, mở khóa Tier ${Math.floor(level/2)+1}`
    },
    alchemist: {
      id: 'alchemist', name: 'Nhà Thuốc', icon: '⚗️',
      desc: 'Chế tạo bình máu, bình buff, thuốc hỗ trợ',
      maxLevel: 8,
      baseCost: 90,
      costMultiplier: 2.0,
      effects: (level) => ({
        potionQuality: level,
        potionCapacity: 5 + level * 3,
        unlockTier: Math.floor(level / 2) + 1,
      }),
      upgradeBenefits: (level) => `Chất lượng Lv.${level}, chứa ${5+level*3} bình`
    },
    jeweler: {
      id: 'jeweler', name: 'Tiệm Trang Sức', icon: '💎',
      desc: 'Chế tạo nhẫn, dây chuyền — buff vĩnh viễn',
      maxLevel: 8,
      baseCost: 150,
      costMultiplier: 2.5,
      effects: (level) => ({
        jewelQuality: level,
        unlockTier: Math.floor(level / 2) + 1,
      }),
      upgradeBenefits: (level) => `Chất lượng Lv.${level}, mở khóa Tier ${Math.floor(level/2)+1}`
    },
    temple: {
      id: 'temple', name: 'Đền Thờ', icon: '⛩️',
      desc: 'Tái sinh Thợ Săn max level — nhận điểm kỹ năng vĩnh viễn',
      maxLevel: 5,
      baseCost: 500,
      costMultiplier: 3.0,
      effects: (level) => ({
        reincarnationBonus: level * 0.1,
        maxReincarnation: level,
      }),
      upgradeBenefits: (level) => `Bonus +${level*10}% stats sau tái sinh, max ${level} lần`
    },
    guildBoard: {
      id: 'guildBoard', name: 'Bảng Đăng Ký', icon: '📋',
      desc: 'Thuê Thợ Săn mới — chọn class và rarity',
      maxLevel: 5,
      baseCost: 200,
      costMultiplier: 2.5,
      effects: (level) => ({
        hunterRarityChance: level * 5,
        refreshCost: Math.max(10, 50 - level * 5),
      }),
      upgradeBenefits: (level) => `+${level*5}%几率 nhận rare hunter, chi phí refresh ${Math.max(10,50-level*5)} gold`
    },
  },

  // ─── ZONES ──────────────────────────────────────────────────
  zones: {
    normal: {
      id: 'normal', name: 'Rừng Bình Thường', icon: '🌲',
      difficulty: 0, requiredTownhall: 1,
      monsters: ['slime', 'goblin', 'wolf', 'bandit'],
      boss: 'troll_chief',
      baseGold: 5, baseXp: 3, baseDropRate: 0.3,
    },
    hard: {
      id: 'hard', name: 'Đầm Lầy Tử Thần', icon: '🐊',
      difficulty: 1, requiredTownhall: 2,
      monsters: ['orc', 'dark_wizard', 'dire_wolf', 'troll'],
      boss: 'orc_warlord',
      baseGold: 15, baseXp: 10, baseDropRate: 0.4,
    },
    curse: {
      id: 'curse', name: 'Rừng Nguyền Rủa', icon: '☠️',
      difficulty: 2, requiredTownhall: 4,
      monsters: ['wraith', 'vampire', 'banshee', 'lich'],
      boss: 'death_knight',
      baseGold: 40, baseXp: 25, baseDropRate: 0.5,
    },
    torment: {
      id: 'torment', name: 'Địa Ngục Hoả Ngục', icon: '🔥',
      difficulty: 3, requiredTownhall: 6,
      monsters: ['demon', 'inferno_golem', 'shadow_lord', 'dragon_whelp'],
      boss: 'demon_lord',
      baseGold: 100, baseXp: 60, baseDropRate: 0.6,
    }
  },

  // ─── MONSTERS ──────────────────────────────────────────────
  monsters: {
    // Normal zone
    slime:     { name: 'Slime',      icon: '🟢', hp: 30, atk: 5,  def: 2,  xp: 3,  gold: 3,  drops: ['green_slime_gel', 'tiny_herb'] },
    goblin:    { name: 'Goblin',     icon: '👺', hp: 50, atk: 10, def: 5,  xp: 5,  gold: 5,  drops: ['iron_scrap', 'goblin_ear'] },
    wolf:      { name: 'Sói hoang',  icon: '🐺', hp: 45, atk: 14, def: 4,  xp: 6,  gold: 4,  drops: ['wolf_fang', 'wolf_pelt'] },
    bandit:    { name: 'Cướp',       icon: '🗡️', hp: 60, atk: 12, def: 7,  xp: 7,  gold: 10, drops: ['iron_scrap', 'stolen_coin'] },
    troll_chief: { name: 'Tộc Trưởng Troll', icon: '👹', hp: 300, atk: 25, def: 15, xp: 50, gold: 50, drops: ['troll_blood', 'iron_ore', 'rare_gem'], isBoss: true },
    // Hard zone
    orc:         { name: 'Orc',          icon: '🐷', hp: 120, atk: 22, def: 12, xp: 12, gold: 15, drops: ['orc_bone', 'steel_scrap'] },
    dark_wizard: { name: 'Pháp Sư Đen', icon: '🧙', hp: 80,  atk: 30, def: 6,  xp: 15, gold: 18, drops: ['dark_essence', 'magic_dust'] },
    dire_wolf:   { name: 'Sói Dữ',     icon: '🐺', hp: 100, atk: 28, def: 8,  xp: 13, gold: 12, drops: ['dire_fang', 'dark_pelt'] },
    troll:       { name: 'Troll',       icon: '👹', hp: 180, atk: 20, def: 18, xp: 14, gold: 16, drops: ['troll_blood', 'thick_hide'] },
    orc_warlord: { name: 'Tướng Quân Orc', icon: '⚔️', hp: 600, atk: 45, def: 25, xp: 100, gold: 120, drops: ['warlord_axe', 'orc_blood', 'steel_ore'], isBoss: true },
    // Curse zone
    wraith:    { name: 'Hồn Ma',    icon: '👻', hp: 150, atk: 35, def: 10, xp: 25, gold: 35, drops: ['ectoplasm', 'soul_shard'] },
    vampire:   { name: 'Ma Cà Rồng', icon: '🧛', hp: 200, atk: 40, def: 15, xp: 30, gold: 45, drops: ['vampire_fang', 'blood_essence'] },
    banshee:   { name: 'Banshee',    icon: '💀', hp: 130, atk: 45, def: 5,  xp: 28, gold: 38, drops: ['wailing_soul', 'spectral_cloth'] },
    lich:      { name: 'Lich',       icon: '☠️', hp: 250, atk: 50, def: 12, xp: 35, gold: 50, drops: ['dark_essence', 'lich_dust', 'soul_shard'] },
    death_knight: { name: 'Hiệp Sĩ Tử Thần', icon: '💀', hp: 1200, atk: 70, def: 40, xp: 200, gold: 250, drops: ['death_blade', 'dark_steel', 'soul_shard'], isBoss: true },
    // Torment zone
    demon:           { name: 'Quỷ',           icon: '😈', hp: 400, atk: 65, def: 30, xp: 60, gold: 80,  drops: ['demon_horn', 'hellfire_ash'] },
    inferno_golem:   { name: 'Golem Lửa',     icon: '🌋', hp: 500, atk: 55, def: 50, xp: 65, gold: 75,  drops: ['magma_core', 'obsidian_shard'] },
    shadow_lord:     { name: 'Chúa Tể Bóng Tối', icon: '🌑', hp: 350, atk: 80, def: 20, xp: 70, gold: 90,  drops: ['shadow_essence', 'void_crystal'] },
    dragon_whelp:    { name: 'Rồng Con',       icon: '🐉', hp: 600, atk: 75, def: 35, xp: 80, gold: 100, drops: ['dragon_scale', 'dragon_blood'] },
    demon_lord:      { name: 'Ma Vương',       icon: '👿', hp: 3000, atk: 120, def: 60, xp: 500, gold: 600, drops: ['demon_crown', 'infernal_steel', 'void_crystal'], isBoss: true },
  },

  // ─── MATERIALS ─────────────────────────────────────────────
  materials: {
    // Common (Normal)
    green_slime_gel: { name: 'Nhầy Xanh', icon: '🟢', rarity: 'common', baseValue: 2 },
    tiny_herb:       { name: 'Thảo Dược', icon: '🌿', rarity: 'common', baseValue: 2 },
    iron_scrap:      { name: 'Phế Liệu Sắt', icon: '⚙️', rarity: 'common', baseValue: 3 },
    goblin_ear:      { name: 'Tai Goblin', icon: '👂', rarity: 'common', baseValue: 3 },
    wolf_fang:       { name: 'Răng Sói',  icon: '🦷', rarity: 'common', baseValue: 4 },
    wolf_pelt:       { name: 'Lông Sói',  icon: '🧶', rarity: 'common', baseValue: 3 },
    stolen_coin:     { name: 'Xu Cướp',   icon: '🪙', rarity: 'common', baseValue: 5 },
    // Uncommon (Normal-Hard)
    troll_blood:     { name: 'Máu Troll', icon: '🩸', rarity: 'uncommon', baseValue: 8 },
    iron_ore:        { name: 'Quặng Sắt', icon: '⛏️', rarity: 'uncommon', baseValue: 10 },
    rare_gem:        { name: 'Đá Quý',   icon: '💎', rarity: 'uncommon', baseValue: 15 },
    orc_bone:        { name: 'Xương Orc', icon: '🦴', rarity: 'uncommon', baseValue: 8 },
    steel_scrap:     { name: 'Phế Liệu Thép', icon: '🔩', rarity: 'uncommon', baseValue: 12 },
    dark_essence:    { name: 'Tinh Hoa Đen', icon: '🔮', rarity: 'uncommon', baseValue: 15 },
    magic_dust:      { name: 'Bụi Phép',  icon: '✨', rarity: 'uncommon', baseValue: 12 },
    dire_fang:       { name: 'Răng Dữ',   icon: '🦷', rarity: 'uncommon', baseValue: 10 },
    dark_pelt:       { name: 'Lông Đen',  icon: '🧶', rarity: 'uncommon', baseValue: 10 },
    thick_hide:      { name: 'Da Dày',    icon: '🟤', rarity: 'uncommon', baseValue: 10 },
    steel_ore:       { name: 'Quặng Thép', icon: '⛏️', rarity: 'uncommon', baseValue: 15 },
    // Rare (Curse)
    ectoplasm:       { name: 'Dịch Hồn',  icon: '👻', rarity: 'rare', baseValue: 25 },
    soul_shard:      { name: 'Mảnh Hồn',  icon: '💜', rarity: 'rare', baseValue: 30 },
    vampire_fang:    { name: 'Răng Ma Cà Rồng', icon: '🦷', rarity: 'rare', baseValue: 35 },
    blood_essence:   { name: 'Tinh Chất Máu', icon: '🩸', rarity: 'rare', baseValue: 30 },
    wailing_soul:    { name: 'Hồn Thanh', icon: '😱', rarity: 'rare', baseValue: 28 },
    spectral_cloth:  { name: 'Vải Hồn',   icon: '👻', rarity: 'rare', baseValue: 25 },
    lich_dust:       { name: 'Bụi Lich',  icon: '☠️', rarity: 'rare', baseValue: 35 },
    // Epic (Torment)
    demon_horn:      { name: 'Sừng Quỷ',  icon: '😈', rarity: 'epic', baseValue: 60 },
    hellfire_ash:    { name: 'Tro Hoả Ngục', icon: '🔥', rarity: 'epic', baseValue: 55 },
    magma_core:      { name: 'Lõi Nham Thạch', icon: '🌋', rarity: 'epic', baseValue: 65 },
    obsidian_shard:  { name: 'Mảnh Đá Obsidian', icon: '⬛', rarity: 'epic', baseValue: 60 },
    shadow_essence:  { name: 'Tinh Hoa Bóng Tối', icon: '🌑', rarity: 'epic', baseValue: 70 },
    void_crystal:    { name: 'Tinh Thể Void', icon: '💠', rarity: 'epic', baseValue: 80 },
    dragon_scale:    { name: 'Vảy Rồng',  icon: '🐉', rarity: 'epic', baseValue: 75 },
    dragon_blood:    { name: 'Máu Rồng',  icon: '🩸', rarity: 'epic', baseValue: 70 },
    // Legendary (Boss drops)
    warlord_axe:     { name: 'Rìu Tướng Quân', icon: '🪓', rarity: 'legendary', baseValue: 150 },
    death_blade:     { name: 'Lưỡi Dao Tử Thần', icon: '⚔️', rarity: 'legendary', baseValue: 200 },
    dark_steel:      { name: 'Thép Tối',  icon: '⬛', rarity: 'legendary', baseValue: 180 },
    demon_crown:     { name: 'Vương Miện Ma Vương', icon: '👑', rarity: 'legendary', baseValue: 500 },
    infernal_steel:  { name: 'Thép Địa Ngục', icon: '🔥', rarity: 'legendary', baseValue: 400 },
  },

  // ─── EQUIPMENT RECIPES ──────────────────────────────────────
  equipment: {
    // Weapons Tier 1 (Blacksmith)
    wooden_sword:    { name: 'Kiếm Gỗ',      icon: '🗡️', slot: 'weapon', tier: 1, atk: 5,  crit: 1, cost: { gold: 30, iron_scrap: 2 } },
    iron_sword:      { name: 'Kiếm Sắt',     icon: '⚔️', slot: 'weapon', tier: 2, atk: 12, crit: 2, cost: { gold: 80, iron_ore: 3, steel_scrap: 2 } },
    steel_blade:     { name: 'Lưỡi Thép',    icon: '⚔️', slot: 'weapon', tier: 3, atk: 25, crit: 4, cost: { gold: 200, steel_ore: 4, dark_essence: 2 } },
    shadow_dagger:   { name: 'Dao Bóng Tối', icon: '🔪', slot: 'weapon', tier: 4, atk: 40, crit: 8, cost: { gold: 500, shadow_essence: 5, void_crystal: 2 } },
    death_edge:      { name: 'Lưỡi Tử Thần', icon: '⚔️', slot: 'weapon', tier: 5, atk: 70, crit: 12, cost: { gold: 1200, death_blade: 1, infernal_steel: 3 } },
    demon_reaver:    { name: 'Ma Kiếm',      icon: '⚔️', slot: 'weapon', tier: 6, atk: 110, crit: 15, cost: { gold: 3000, demon_crown: 1, void_crystal: 5 } },
    // Armor Tier 1-4
    cloth_armor:     { name: 'Áo Vải',       icon: '👕', slot: 'armor', tier: 1, def: 4, hp: 20, cost: { gold: 25, wolf_pelt: 2 } },
    leather_armor:   { name: 'Áo Da',        icon: '🧥', slot: 'armor', tier: 2, def: 10, hp: 50, cost: { gold: 70, thick_hide: 3, steel_scrap: 1 } },
    steel_plate:     { name: 'Giáp Thép',    icon: '🛡️', slot: 'armor', tier: 3, def: 22, hp: 100, cost: { gold: 180, steel_ore: 4, iron_ore: 3 } },
    shadow_vest:     { name: 'Áo Choàng Bóng Tối', icon: '🧥', slot: 'armor', tier: 4, def: 35, hp: 180, cost: { gold: 450, shadow_essence: 4, spectral_cloth: 3 } },
    dragon_plate:    { name: 'Giáp Rồng',    icon: '🛡️', slot: 'armor', tier: 5, def: 55, hp: 300, cost: { gold: 1000, dragon_scale: 5, infernal_steel: 2 } },
    // Helmets
    iron_helm:       { name: 'Mũ Sắt',       icon: '⛑️', slot: 'helmet', tier: 1, def: 3, hp: 15, cost: { gold: 30, iron_scrap: 3 } },
    steel_helm:      { name: 'Mũ Thép',      icon: '⛑️', slot: 'helmet', tier: 2, def: 8, hp: 40, cost: { gold: 75, steel_scrap: 3 } },
    shadow_hood:     { name: 'Mũ Trùm Đen',  icon: '🪖', slot: 'helmet', tier: 3, def: 15, hp: 80, cost: { gold: 200, dark_essence: 3, spectral_cloth: 2 } },
    // Boots
    leather_boots:   { name: 'Giày Da',      icon: '👢', slot: 'boots', tier: 1, def: 2, spd: 3, cost: { gold: 20, wolf_pelt: 2 } },
    iron_boots:      { name: 'Giày Sắt',     icon: '👢', slot: 'boots', tier: 2, def: 5, spd: 2, cost: { gold: 60, iron_scrap: 4 } },
    swift_boots:     { name: 'Giày Thần Tốc', icon: '👟', slot: 'boots', tier: 3, def: 4, spd: 10, cost: { gold: 180, dire_fang: 3, magic_dust: 2 } },
    // Accessories
    iron_ring:       { name: 'Nhẫn Sắt',     icon: '💍', slot: 'accessory', tier: 1, atk: 3, def: 2, cost: { gold: 40, iron_ore: 2 } },
    ruby_amulet:     { name: 'Dây Chuyền Ruby', icon: '📿', slot: 'accessory', tier: 2, atk: 8, hp: 30, cost: { gold: 100, rare_gem: 2 } },
    void_ring:       { name: 'Nhẫn Void',    icon: '💍', slot: 'accessory', tier: 3, atk: 15, crit: 5, cost: { gold: 350, void_crystal: 3, soul_shard: 2 } },
    dragon_amulet:   { name: 'Dây Chuyền Rồng', icon: '📿', slot: 'accessory', tier: 4, atk: 25, hp: 100, def: 10, cost: { gold: 800, dragon_scale: 3, dragon_blood: 2 } },
  },

  // ─── POTION RECIPES ────────────────────────────────────────
  potions: {
    small_hp_potion:    { name: 'Bình Máu Nhỏ',     icon: '🧪', healPercent: 20, cost: { gold: 10, green_slime_gel: 2, tiny_herb: 1 } },
    medium_hp_potion:   { name: ' Bình Máu Vừa',    icon: '🧪', healPercent: 40, cost: { gold: 25, troll_blood: 2, tiny_herb: 3 } },
    large_hp_potion:    { name: 'Bình Máu Lớn',     icon: '🧪', healPercent: 60, cost: { gold: 60, blood_essence: 2, lich_dust: 1 } },
    atk_potion:         { name: 'Thuốc Tăng Công',   icon: '⚗️', buffStat: 'atk', buffPercent: 20, duration: 10, cost: { gold: 30, magic_dust: 3, dire_fang: 1 } },
    def_potion:         { name: 'Thuốc Tăng Giáp',   icon: '⚗️', buffStat: 'def', buffPercent: 20, duration: 10, cost: { gold: 30, thick_hide: 2, iron_ore: 1 } },
    spd_potion:         { name: 'Thuốc Tăng Tốc',    icon: '⚗️', buffStat: 'spd', buffPercent: 25, duration: 10, cost: { gold: 35, ectoplasm: 2, magic_dust: 2 } },
    crit_potion:        { name: 'Thuốc Chí Mạng',    icon: '⚗️', buffStat: 'crit', buffPercent: 15, duration: 10, cost: { gold: 40, soul_shard: 1, magic_dust: 3 } },
    full_heal_potion:   { name: 'Bình Hồi Toàn Bộ',  icon: '💖', healPercent: 100, cost: { gold: 150, vampire_fang: 3, blood_essence: 3, dragon_blood: 1 } },
  },

  // ─── HUNTER NAME POOL ──────────────────────────────────────
  hunterNames: [
    'Aldric', 'Brenna', 'Cedric', 'Darius', 'Elara',
    'Fenris', 'Gwen', 'Haldor', 'Isolde', 'Jarek',
    'Kira', 'Loric', 'Mira', 'Nolan', 'Orin',
    'Petra', 'Quinn', 'Raven', 'Soren', 'Thalia',
    'Ulric', 'Vera', 'Wren', 'Xander', 'Yara',
    'Zephyr', 'Aria', 'Bjorn', 'Corin', 'Dara',
  ],

  // ─── RANDOM EVENTS ─────────────────────────────────────────
  events: [
    {
      id: 'wandering_merchant',
      name: 'Thương Nhân Lang Thang',
      icon: '🧳',
      chance: 0.08,
      options: [
        {
          text: 'Mua nguyên liệu hiếm (100 gold)',
          condition: (state) => state.gold >= 100,
          effect: (state) => {
            state.gold -= 100;
            const mats = ['rare_gem', 'dark_essence', 'void_crystal', 'soul_shard'];
            const mat = mats[Math.floor(Math.random() * mats.length)];
            state.inventory[mat] = (state.inventory[mat] || 0) + Math.floor(Math.random() * 3) + 1;
            return `Đã mua vật phẩm quý!`;
          }
        },
        {
          text: 'Bỏ qua',
          effect: () => `Bạn để thương nhân đi qua.`
        }
      ]
    },
    {
      id: 'bandit_raid',
      name: 'Băng Cướp Tấn Công!',
      icon: '⚔️',
      chance: 0.06,
      options: [
        {
          text: 'Gửi bình máu hỗ trợ (50 gold)',
          condition: (state) => state.gold >= 50,
          effect: (state) => {
            state.gold -= 50;
            state.hunters.forEach(h => { if (h.alive) h.hp = Math.min(h.maxHp, h.hp + h.maxHp * 0.3); });
            return 'Các Thợ Săn được hồi phục 30% HP và chiến thắng!';
          }
        },
        {
          text: 'Để tự xử lý',
          effect: (state) => {
            state.hunters.forEach(h => { if (h.alive) h.hp = Math.max(1, h.hp - h.maxHp * 0.15); });
            return 'Các Thợ Săn chiến thắng nhưng mất 15% HP.';
          }
        }
      ]
    },
    {
      id: 'feast_night',
      name: 'Đêm Lễ Hội',
      icon: '🎉',
      chance: 0.07,
      options: [
        {
          text: 'Tổ chức tiệc (30 gold) — buff ATK 20% trong 5 tick',
          condition: (state) => state.gold >= 30,
          effect: (state) => {
            state.gold -= 30;
            state.globalBuffs = state.globalBuffs || [];
            state.globalBuffs.push({ stat: 'atk', percent: 20, ticksLeft: 5 });
            return 'Tất cả Thợ Săn được buff ATK +20% trong 5 tick!';
          }
        },
        {
          text: 'Bỏ qua',
          effect: () => 'Bạn không tổ chức lễ hội.'
        }
      ]
    },
    {
      id: 'lost_hunter',
      name: 'Thợ Săn Mới Đến',
      icon: '🚶',
      chance: 0.05,
      options: [
        {
          text: 'Thuê ngay (100 gold)',
          condition: (state) => state.gold >= 100 && state.hunters.length < GAME_DATA.buildings.townhall.effects(state.buildings.townhall).maxHunters,
          effect: (state) => {
            state.gold -= 100;
            const classes = ['paladin', 'berserker', 'ranger', 'sorcerer'];
            const cls = classes[Math.floor(Math.random() * classes.length)];
            const name = GAME_DATA.hunterNames[Math.floor(Math.random() * GAME_DATA.hunterNames.length)];
            if (typeof createHunter === 'function') {
              state.hunters.push(createHunter(name, cls));
            }
            return `Thuê thành công ${name} (${GAME_DATA.classes[cls].name})!`;
          }
        },
        {
          text: 'Bỏ qua',
          effect: () => 'Bạn từ chối Thợ Săn này.'
        }
      ]
    },
    {
      id: 'treasure_chest',
      name: 'Rương Báu',
      icon: '📦',
      chance: 0.09,
      options: [
        {
          text: 'Mở rương!',
          effect: (state) => {
            const goldFound = Math.floor(Math.random() * 80) + 20;
            state.gold += goldFound;
            const mats = ['iron_ore', 'steel_scrap', 'rare_gem', 'magic_dust', 'troll_blood'];
            const mat = mats[Math.floor(Math.random() * mats.length)];
            state.inventory[mat] = (state.inventory[mat] || 0) + Math.floor(Math.random() * 5) + 1;
            return `Tìm thấy ${goldFound} gold và một số nguyên liệu!`;
          }
        }
      ]
    },
    {
      id: 'hunter_request',
      name: 'Yêu Cầu Từ Thợ Săn',
      icon: '📝',
      chance: 0.06,
      options: [
        {
          text: 'Đáp ứng yêu cầu (200 gold)',
          condition: (state) => state.gold >= 200,
          effect: (state) => {
            state.gold -= 200;
            state.hunters.forEach(h => { if (h.alive) h.xp += 50; });
            return 'Tất cả Thợ Săn nhận 50 XP!';
          }
        },
        {
          text: 'Từ chối',
          effect: () => 'Thợ Săn hơi thất vọng...'
        }
      ]
    },
  ],

  // ─── ACHIEVEMENTS ──────────────────────────────────────────
  achievements: [
    { id: 'first_hire',     name: 'Người Tuyển Dụng',   desc: 'Thuê Thợ Săn đầu tiên', icon: '👥', check: (s) => s.hunters.length >= 1 },
    { id: 'full_team',      name: 'Đội Hình Đầy Đủ',   desc: 'Có 10 Thợ Săn', icon: '⚔️', check: (s) => s.hunters.length >= 10 },
    { id: 'first_boss',     name: 'Sát Thủ Boss',       desc: 'Giết boss đầu tiên', icon: '👹', check: (s) => s.stats.bossKills >= 1 },
    { id: 'gold_1000',      name: 'Triệu Phú',          desc: 'Tích lũy 1000 gold', icon: '💰', check: (s) => s.stats.totalGoldEarned >= 1000 },
    { id: 'gold_10000',     name: 'Tỷ Phú',             desc: 'Tích lũy 10000 gold', icon: '💰', check: (s) => s.stats.totalGoldEarned >= 10000 },
    { id: 'kill_100',       name: 'Thợ Săn Lão Luyện',  desc: 'Giết 100 quái vật', icon: '💀', check: (s) => s.stats.totalKills >= 100 },
    { id: 'kill_1000',      name: 'Huyền Thoại',         desc: 'Giết 1000 quái vật', icon: '🏆', check: (s) => s.stats.totalKills >= 1000 },
    { id: 'first_craft',    name: 'Thợ Rèn',             desc: 'Chế tạo vật phẩm đầu tiên', icon: '🔨', check: (s) => s.stats.totalCrafts >= 1 },
    { id: 'first_reborn',   name: 'Tái Sinh',             desc: 'Tái sinh Thợ Săn lần đầu', icon: '♻️', check: (s) => s.stats.totalReincarnations >= 1 },
    { id: 'max_level',      name: 'Max Level',            desc: 'Đưa Thợ Săn lên level 100', icon: '⭐', check: (s) => s.hunters.some(h => h.level >= 100) },
    { id: 'kill_demon_lord',name: 'Người Chiến Thắng',    desc: 'Giết Ma Vương', icon: '👿', check: (s) => s.stats.bossKills >= 10 },
  ],

  // ─── UTILITY ────────────────────────────────────────────────
  rarityColors: {
    common:    '#aaaaaa',
    uncommon:  '#55cc55',
    rare:      '#5599ff',
    epic:      '#cc55ff',
    legendary: '#ffaa00',
  },

  rarityNames: {
    common: 'Phổ Thông',
    uncommon: 'Hiếm',
    rare: 'Cực Hiếm',
    epic: 'Sử Thi',
    legendary: 'Huyền Thoại',
  }
};
