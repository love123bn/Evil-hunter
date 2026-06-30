// ========== DỮ LIỆU GAME EVIL HUNTER TYCOON ==========

// === LỚP THỢ SĂN ===
const HUNTER_CLASSES = {
    berserker: {
        name: 'Cuồng Chiến',
        desc: 'Chiến binh hung bạo, tấn công vượt trội',
        baseStats: { hp: 120, atk: 15, def: 5, crit: 8, atkSpd: 1.2, evasion: 3 },
        weaponType: 'kiếm',
        skills: ['Cuồng Nộ', 'Chiến Đấu', 'Huyết Chiến']
    },
    ranger: {
        name: 'Cung Thủ',
        desc: 'Xạ thủ chính xác, tốc độ cao',
        baseStats: { hp: 80, atk: 12, def: 3, crit: 12, atkSpd: 0.8, evasion: 8 },
        weaponType: 'cung',
        skills: ['Mưa Tên', 'Bắn Kép', 'Săn Mồi']
    },
    paladin: {
        name: 'Thánh Kỵ',
        desc: 'Hiệp sĩ phòng thủ, chịu đòn tốt',
        baseStats: { hp: 160, atk: 8, def: 12, crit: 5, atkSpd: 1.5, evasion: 2 },
        weaponType: 'khiên',
        skills: ['Thần Thánh', 'Khiên Đỡ', 'Hồi Phục']
    },
    sorcerer: {
        name: 'Pháp Sư',
        desc: 'Pháp thuật hủy diệt, sát thương cao',
        baseStats: { hp: 70, atk: 18, def: 2, crit: 15, atkSpd: 1.6, evasion: 2 },
        weaponType: 'pháp trượng',
        skills: ['Hỏa Cầu', 'Bão Táp', 'Sấm Sét']
    },
    darkKnight: {
        name: 'Hắc Kỵ',
        desc: 'Chiến binh bóng tối, cân bằng toàn diện',
        baseStats: { hp: 140, atk: 14, def: 8, crit: 7, atkSpd: 1.1, evasion: 5 },
        weaponType: 'thương',
        skills: ['Bóng Tối', 'Tử Hủy', 'Hắc Ám']
    }
};

// === CẤP BẬC THỢ SĂN ===
const HUNTER_TIERS = [
    { id: 'normal', name: 'Thường', minPoints: 0, maxPoints: 1, statBonus: 0 },
    { id: 'rare', name: 'Hiếm', minPoints: 2, maxPoints: 5, statBonus: 5 },
    { id: 'superior', name: 'Xuất Sắc', minPoints: 6, maxPoints: 9, statBonus: 10 },
    { id: 'heroic', name: 'Anh Hùng', minPoints: 10, maxPoints: 13, statBonus: 20 },
    { id: 'legendary', name: 'Huyền Thoại', minPoints: 14, maxPoints: 18, statBonus: 35 },
    { id: 'ultimate', name: 'Tối Thượng', minPoints: 19, maxPoints: 27, statBonus: 50 }
];

// === DANH SÁCH TÊN THỢ SĂN ===
const HUNTER_NAMES = [
    'Aldric', 'Bran', 'Cedric', 'Darian', 'Elric', 'Finn', 'Gareth', 'Hawk',
    'Ignis', 'Jarek', 'Kael', 'Lucian', 'Magnus', 'Nero', 'Orin', 'Percival',
    'Quinn', 'Ragnar', 'Soren', 'Tiberius', 'Ulric', 'Valerius', 'Wolfric', 'Xander',
    'Yorick', 'Zephyr', 'Aria', 'Brienne', 'Cirilla', 'Drakia', 'Elara', 'Freya',
    'Gwendolyn', 'Helga', 'Iris', 'Juno', 'Katherine', 'Lyra', 'Morgana', 'Nyx',
    'Ophelia', 'Petra', 'Raven', 'Sigrid', 'Titania', 'Ursula', 'Vivian', 'Wynne',
    'Xena', 'Yrsa', 'Zelda'
];

// === VẬT PHẨM (TRANG BỊ) ===
const EQUIPMENT_SLOTS = ['vũ khí', 'áo giáp', 'nón', 'găng', 'giày', 'dây chuyền', 'nhẫn', 'thắt lưng'];
const EQUIPMENT_TIERS = { C: 1, B: 2, A: 3, S: 4, SS: 5 };
const EQUIPMENT_QUALITY = [
    { id: 0, name: 'Vô Dụng', statMult: 0.8, color: '#9e9e9e' },
    { id: 1, name: 'Thường', statMult: 0.9, color: '#ffffff' },
    { id: 2, name: 'Phổ Biến', statMult: 1.0, color: '#4fc3f7' },
    { id: 3, name: 'Cao Cấp', statMult: 1.1, color: '#ab47bc' },
    { id: 4, name: 'Tối Thượng', statMult: 1.2, color: '#ff9800' }
];
const QUALITY_UPGRADE_COST = [0, 100, 300, 800, 2000]; // vàng để nâng cấp chất lượng
const QUALITY_UPGRADE_STONES = [0, 2, 5, 10, 20]; // đá nâng cấp cần
const ENHANCE_MAX = { C: 5, B: 10, A: 15, S: 20, SS: 25 };

const EQUIPMENT_CRAFTS = {
    easy: [
        { id: 'iron_sword', name: 'Kiếm Sắt', slot: 'vũ khí', tier: 'C', class: ['berserker','darkKnight'], materials: { sắt: 10, đá: 5 }, gold: 100, stats: { atk: 5 } },
        { id: 'leather_armor', name: 'Áo Da', slot: 'áo giáp', tier: 'C', class: ['berserker','ranger','paladin','sorcerer','darkKnight'], materials: { da: 10, chỉ: 5 }, gold: 100, stats: { def: 3 } },
        { id: 'cloth_hat', name: 'Nón Vải', slot: 'nón', tier: 'C', class: ['berserker','ranger','paladin','sorcerer','darkKnight'], materials: { vải: 8, chỉ: 3 }, gold: 80, stats: { def: 1, hp: 10 } },
        { id: 'leather_gloves', name: 'Găng Da', slot: 'găng', tier: 'C', class: ['berserker','ranger','paladin','sorcerer','darkKnight'], materials: { da: 8, chỉ: 3 }, gold: 80, stats: { atk: 2, crit: 1 } },
        { id: 'cloth_boots', name: 'Giày Vải', slot: 'giày', tier: 'C', class: ['berserker','ranger','paladin','sorcerer','darkKnight'], materials: { vải: 8, chỉ: 3 }, gold: 80, stats: { evasion: 1 } },
        { id: 'copper_necklace', name: 'Dây Chuyền Đồng', slot: 'dây chuyền', tier: 'C', class: ['berserker','ranger','paladin','sorcerer','darkKnight'], materials: { đá: 8, ngọc: 2 }, gold: 120, stats: { hp: 15 } },
        { id: 'copper_ring', name: 'Nhẫn Đồng', slot: 'nhẫn', tier: 'C', class: ['berserker','ranger','paladin','sorcerer','darkKnight'], materials: { đá: 6, ngọc: 3 }, gold: 100, stats: { crit: 2 } },
        { id: 'leather_belt', name: 'Thắt Lưng Da', slot: 'thắt lưng', tier: 'C', class: ['berserker','ranger','paladin','sorcerer','darkKnight'], materials: { da: 6, chỉ: 4 }, gold: 80, stats: { def: 1, hp: 10 } }
    ],
    normal: [
        { id: 'steel_sword', name: 'Kiếm Thép', slot: 'vũ khí', tier: 'B', class: ['berserker','darkKnight'], materials: { thép: 10, sắt: 8, gỗ: 5 }, gold: 500, stats: { atk: 10 } },
        { id: 'chain_armor', name: 'Áo Xích', slot: 'áo giáp', tier: 'B', class: ['berserker','paladin','darkKnight'], materials: { thép: 10, da: 8, chỉ: 5 }, gold: 500, stats: { def: 6 } },
        { id: 'steel_hat', name: 'Nón Thép', slot: 'nón', tier: 'B', class: ['berserker','paladin','darkKnight'], materials: { thép: 8, chỉ: 5 }, gold: 400, stats: { def: 3, hp: 20 } },
        { id: 'steel_gloves', name: 'Găng Thép', slot: 'găng', tier: 'B', class: ['berserker','paladin','darkKnight'], materials: { thép: 8, da: 5 }, gold: 400, stats: { atk: 4, crit: 2 } },
        { id: 'leather_boots2', name: 'Giày Da Cứng', slot: 'giày', tier: 'B', class: ['berserker','ranger','paladin','sorcerer','darkKnight'], materials: { da: 10, chỉ: 5 }, gold: 400, stats: { evasion: 3 } },
        { id: 'silver_necklace', name: 'Dây Chuyền Bạc', slot: 'dây chuyền', tier: 'B', class: ['berserker','ranger','paladin','sorcerer','darkKnight'], materials: { bạc: 8, ngọc: 5 }, gold: 600, stats: { hp: 30 } },
        { id: 'silver_ring', name: 'Nhẫn Bạc', slot: 'nhẫn', tier: 'B', class: ['berserker','ranger','paladin','sorcerer','darkKnight'], materials: { bạc: 6, ngọc: 5 }, gold: 500, stats: { atk: 3, crit: 3 } },
        { id: 'steel_belt', name: 'Thắt Lưng Thép', slot: 'thắt lưng', tier: 'B', class: ['berserker','paladin','darkKnight'], materials: { thép: 8, da: 6 }, gold: 400, stats: { def: 2, hp: 20 } }
    ],
    hard: [
        { id: 'mithril_sword', name: 'Kiếm Thần', slot: 'vũ khí', tier: 'A', class: ['berserker','darkKnight'], materials: { thần: 10, thép: 8, 'tinh thể': 5 }, gold: 2000, stats: { atk: 18 } },
        { id: 'plate_armor', name: 'Áo Giáp Tấm', slot: 'áo giáp', tier: 'A', class: ['berserker','paladin','darkKnight'], materials: { thần: 10, thép: 8, 'tinh thể': 5 }, gold: 2000, stats: { def: 10 } },
        { id: 'mithril_helmet', name: 'Mũ Thần', slot: 'nón', tier: 'A', class: ['berserker','paladin','darkKnight'], materials: { thần: 8, 'tinh thể': 5 }, gold: 1500, stats: { def: 5, hp: 40 } },
        { id: 'mithril_gloves', name: 'Găng Thần', slot: 'găng', tier: 'A', class: ['berserker','paladin','darkKnight'], materials: { thần: 8, 'tinh thể': 5 }, gold: 1500, stats: { atk: 7, crit: 3 } },
        { id: 'mithril_boots', name: 'Giày Thần', slot: 'giày', tier: 'A', class: ['berserker','ranger','paladin','sorcerer','darkKnight'], materials: { thần: 8, 'tinh thể': 5 }, gold: 1500, stats: { evasion: 5 } },
        { id: 'golden_necklace', name: 'Dây Chuyền Vàng', slot: 'dây chuyền', tier: 'A', class: ['berserker','ranger','paladin','sorcerer','darkKnight'], materials: { vàng: 8, ngọc: 8, 'tinh thể': 3 }, gold: 2500, stats: { hp: 50, atk: 3 } },
        { id: 'golden_ring', name: 'Nhẫn Vàng', slot: 'nhẫn', tier: 'A', class: ['berserker','ranger','paladin','sorcerer','darkKnight'], materials: { vàng: 6, ngọc: 8, 'tinh thể': 3 }, gold: 2000, stats: { atk: 5, crit: 5 } },
        { id: 'mithril_belt', name: 'Thắt Lưng Thần', slot: 'thắt lưng', tier: 'A', class: ['berserker','paladin','darkKnight'], materials: { thần: 8, 'tinh thể': 5 }, gold: 1500, stats: { def: 3, hp: 30 } }
    ]
};

// === VẬT PHẨM TIÊU HAO ===
const CONSUMABLES = {
    food: [
        { id: 'bread', name: 'Bánh Mì', restore: 'satiety', value: 20, materials: { gỗ: 2, đá: 1 }, gold: 30, desc: 'Hồi 20 No' },
        { id: 'meat', name: 'Thịt Nướng', restore: 'satiety', value: 40, materials: { da: 2, sắt: 1 }, gold: 60, desc: 'Hồi 40 No' },
        { id: 'feast', name: 'Đại Tiệc', restore: 'satiety', value: 80, materials: { thép: 2, bạc: 1 }, gold: 150, desc: 'Hồi 80 No' }
    ],
    potion: [
        { id: 'hp_small', name: 'Bình Máu Nhỏ', restore: 'hp', value: 30, materials: { đá: 2, chỉ: 1 }, gold: 40, desc: 'Hồi 30 HP' },
        { id: 'hp_medium', name: 'Bình Máu Vừa', restore: 'hp', value: 60, materials: { sắt: 2, vải: 1 }, gold: 100, desc: 'Hồi 60 HP' },
        { id: 'hp_large', name: 'Bình Máu Lớn', restore: 'hp', value: 120, materials: { thép: 2, 'tinh thể': 1 }, gold: 250, desc: 'Hồi 120 HP' }
    ],
    alcohol: [
        { id: 'beer', name: 'Bia', restore: 'mood', value: 15, materials: { gỗ: 2, đá: 1 }, gold: 25, desc: 'Hồi 15 Tâm Trạng' },
        { id: 'wine', name: 'Rượu Nho', restore: 'mood', value: 30, materials: { sắt: 2, ngọc: 1 }, gold: 60, desc: 'Hồi 30 Tâm Trạng' },
        { id: 'elixir', name: 'Rượu Thần', restore: 'mood', value: 60, materials: { thần: 2, 'tinh thể': 1 }, gold: 150, desc: 'Hồi 60 Tâm Trạng' }
    ],
    stamina: [
        { id: 'rest_small', name: 'Giường Gỗ', restore: 'stamina', value: 20, materials: { gỗ: 3, vải: 2 }, gold: 35, desc: 'Hồi 20 Thể Lực' },
        { id: 'rest_medium', name: 'Giường Đá', restore: 'stamina', value: 40, materials: { đá: 3, da: 2 }, gold: 80, desc: 'Hồi 40 Thể Lực' },
        { id: 'rest_large', name: 'Giường Nhung', restore: 'stamina', value: 80, materials: { thép: 2, lông: 1 }, gold: 200, desc: 'Hồi 80 Thể Lực' }
    ]
};

// === CÔNG TRÌNH ===
const BUILDINGS = {
    townHall: {
        name: 'Tòa Thị Chính',
        desc: 'Trung tâm thị trấn, nâng cấp để mở khóa công trình mới',
        cost: { gold: 0, gems: 0 },
        maxLv: 10,
        effect: 'Mở khóa công trình, tăng sức chứa',
        levels: [
            { gold: 0, gems: 0, unlock: ['commonHouse','infirmary'] },
            { gold: 500, gems: 0, unlock: ['restaurant','tavern','inn','tradingPost'] },
            { gold: 2000, gems: 0, unlock: ['blacksmith','armorShop','weaponShop'] },
            { gold: 5000, gems: 0, unlock: ['enhanceForge'] },
            { gold: 10000, gems: 0, unlock: ['bountyHut'] },
            { gold: 20000, gems: 0, unlock: ['academy'] },
            { gold: 50000, gems: 0, unlock: ['trainingGround'] },
            { gold: 100000, gems: 0, unlock: ['sanctuary'] },
            { gold: 200000, gems: 0, unlock: ['dungeonEntrance','bossHorn'] },
            { gold: 500000, gems: 100, unlock: ['colosseum'] }
        ]
    },
    commonHouse: {
        name: 'Nhà Chung',
        desc: 'Tăng số lượng thợ săn tối đa trong thị trấn',
        cost: { gold: 300, gems: 0 },
        maxLv: 10,
        effect: '+2 chỗ thợ săn mỗi cấp',
        levels: [
            { gold: 300, population: 5 },
            { gold: 600, population: 7 },
            { gold: 1000, population: 9 },
            { gold: 2000, population: 11 },
            { gold: 4000, population: 13 },
            { gold: 8000, population: 15 },
            { gold: 15000, population: 17 },
            { gold: 30000, population: 19 },
            { gold: 60000, population: 21 },
            { gold: 100000, population: 25 }
        ]
    },
    infirmary: {
        name: 'Trạm Y',
        desc: 'Hồi phục HP cho thợ săn',
        cost: { gold: 500, gems: 0 },
        maxLv: 10,
        effect: 'Hồi HP nhanh hơn',
        levels: [
            { gold: 500, healRate: 2 },
            { gold: 1000, healRate: 4 },
            { gold: 2000, healRate: 6 },
            { gold: 4000, healRate: 8 },
            { gold: 8000, healRate: 10 },
            { gold: 15000, healRate: 12 },
            { gold: 30000, healRate: 15 },
            { gold: 50000, healRate: 18 },
            { gold: 80000, healRate: 22 },
            { gold: 120000, healRate: 30 }
        ]
    },
    restaurant: {
        name: 'Nhà Hàng',
        desc: 'Phục hồi độ no cho thợ săn',
        cost: { gold: 500, gems: 0 },
        maxLv: 10,
        effect: 'Phục hồi độ no nhanh hơn',
        levels: [
            { gold: 500, satietyRate: 2 },
            { gold: 1000, satietyRate: 4 },
            { gold: 2000, satietyRate: 6 },
            { gold: 4000, satietyRate: 8 },
            { gold: 8000, satietyRate: 10 },
            { gold: 15000, satietyRate: 12 },
            { gold: 30000, satietyRate: 15 },
            { gold: 50000, satietyRate: 18 },
            { gold: 80000, satietyRate: 22 },
            { gold: 120000, satietyRate: 30 }
        ]
    },
    tavern: {
        name: 'Tửu Quán',
        desc: 'Cải thiện tâm trạng cho thợ săn',
        cost: { gold: 500, gems: 0 },
        maxLv: 10,
        effect: 'Phục hồi tâm trạng nhanh hơn',
        levels: [
            { gold: 500, moodRate: 2 },
            { gold: 1000, moodRate: 4 },
            { gold: 2000, moodRate: 6 },
            { gold: 4000, moodRate: 8 },
            { gold: 8000, moodRate: 10 },
            { gold: 15000, moodRate: 12 },
            { gold: 30000, moodRate: 15 },
            { gold: 50000, moodRate: 18 },
            { gold: 80000, moodRate: 22 },
            { gold: 120000, moodRate: 30 }
        ]
    },
    inn: {
        name: 'Nhà Trọ',
        desc: 'Hồi phục thể lực cho thợ săn',
        cost: { gold: 500, gems: 0 },
        maxLv: 10,
        effect: 'Hồi thể lực nhanh hơn',
        levels: [
            { gold: 500, staminaRate: 2 },
            { gold: 1000, staminaRate: 4 },
            { gold: 2000, staminaRate: 6 },
            { gold: 4000, staminaRate: 8 },
            { gold: 8000, staminaRate: 10 },
            { gold: 15000, staminaRate: 12 },
            { gold: 30000, staminaRate: 15 },
            { gold: 50000, staminaRate: 18 },
            { gold: 80000, staminaRate: 22 },
            { gold: 120000, staminaRate: 30 }
        ]
    },
    blacksmith: {
        name: 'Lò Rèn',
        desc: 'Chế tạo vũ khí và áo giáp',
        cost: { gold: 2000, gems: 0 },
        maxLv: 10,
        effect: 'Mở khóa công thức chế tạo mới',
        levels: [
            { gold: 2000, craftSlot: 1 },
            { gold: 3000, craftSlot: 2 },
            { gold: 5000, craftSlot: 2 },
            { gold: 8000, craftSlot: 3 },
            { gold: 12000, craftSlot: 3 },
            { gold: 20000, craftSlot: 4 },
            { gold: 35000, craftSlot: 4 },
            { gold: 50000, craftSlot: 5 },
            { gold: 75000, craftSlot: 5 },
            { gold: 100000, craftSlot: 6 }
        ]
    },
    weaponShop: {
        name: 'Tiệm Vũ Khí',
        desc: 'Bán vũ khí cho thợ săn',
        cost: { gold: 1500, gems: 0 },
        maxLv: 5,
        effect: 'Tăng lợi nhuận bán vũ khí',
        levels: [
            { gold: 1500, profitMult: 1.0 },
            { gold: 3000, profitMult: 1.2 },
            { gold: 6000, profitMult: 1.5 },
            { gold: 12000, profitMult: 2.0 },
            { gold: 25000, profitMult: 3.0 }
        ]
    },
    armorShop: {
        name: 'Tiệm Áo Giáp',
        desc: 'Bán áo giáp cho thợ săn',
        cost: { gold: 1500, gems: 0 },
        maxLv: 5,
        effect: 'Tăng lợi nhuận bán áo giáp',
        levels: [
            { gold: 1500, profitMult: 1.0 },
            { gold: 3000, profitMult: 1.2 },
            { gold: 6000, profitMult: 1.5 },
            { gold: 12000, profitMult: 2.0 },
            { gold: 25000, profitMult: 3.0 }
        ]
    },
    enhanceForge: {
        name: 'Lò Cường Hóa',
        desc: 'Cường hóa và nâng cấp trang bị',
        cost: { gold: 4000, gems: 0 },
        maxLv: 10,
        effect: 'Tăng % thành công cường hóa',
        levels: [
            { gold: 4000, enhanceBonus: 0 },
            { gold: 6000, enhanceBonus: 2 },
            { gold: 10000, enhanceBonus: 4 },
            { gold: 15000, enhanceBonus: 6 },
            { gold: 25000, enhanceBonus: 8 },
            { gold: 40000, enhanceBonus: 10 },
            { gold: 60000, enhanceBonus: 12 },
            { gold: 90000, enhanceBonus: 15 },
            { gold: 130000, enhanceBonus: 18 },
            { gold: 180000, enhanceBonus: 22 }
        ]
    },
    tradingPost: {
        name: 'Trạm Giao Dịch',
        desc: 'Giao dịch nguyên vật liệu',
        cost: { gold: 3000, gems: 0 },
        maxLv: 10,
        effect: 'Mở khóa giao dịch mới',
        levels: [
            { gold: 3000, tradeSlot: 1 },
            { gold: 5000, tradeSlot: 1 },
            { gold: 8000, tradeSlot: 2 },
            { gold: 12000, tradeSlot: 2 },
            { gold: 20000, tradeSlot: 3 },
            { gold: 35000, tradeSlot: 3 },
            { gold: 50000, tradeSlot: 4 },
            { gold: 75000, tradeSlot: 4 },
            { gold: 100000, tradeSlot: 5 },
            { gold: 150000, tradeSlot: 6 }
        ]
    },
    bountyHut: {
        name: 'Trạm Nhiệm Vụ',
        desc: 'Nhận nhiệm vụ truy nã để nhận thưởng',
        cost: { gold: 8000, gems: 0 },
        maxLv: 5,
        effect: 'Mở khóa nhiệm vụ khó hơn',
        levels: [
            { gold: 8000, bountyLv: 1 },
            { gold: 15000, bountyLv: 2 },
            { gold: 30000, bountyLv: 3 },
            { gold: 50000, bountyLv: 4 },
            { gold: 80000, bountyLv: 5 }
        ]
    },
    academy: {
        name: 'Học Viện',
        desc: 'Dạy kỹ năng và bí kíp cho thợ săn',
        cost: { gold: 15000, gems: 0 },
        maxLv: 5,
        effect: 'Mở khóa kỹ năng mới',
        levels: [
            { gold: 15000, skillSlot: 1 },
            { gold: 30000, skillSlot: 1 },
            { gold: 50000, skillSlot: 2 },
            { gold: 80000, skillSlot: 2 },
            { gold: 120000, skillSlot: 3 }
        ]
    },
    trainingGround: {
        name: 'Sân Tập',
        desc: 'Huấn luyện thợ săn lên cấp nhanh',
        cost: { gold: 30000, gems: 0 },
        maxLv: 5,
        effect: 'Tăng tốc độ lên cấp',
        levels: [
            { gold: 30000, trainSpeed: 1 },
            { gold: 50000, trainSpeed: 1.5 },
            { gold: 80000, trainSpeed: 2 },
            { gold: 120000, trainSpeed: 3 },
            { gold: 200000, trainSpeed: 5 }
        ]
    },
    sanctuary: {
        name: 'Thánh Địa Phục Sinh',
        desc: 'Hồi sinh và chuyển sinh cho thợ săn',
        cost: { gold: 50000, gems: 50 },
        maxLv: 3,
        effect: 'Giảm thời gian hồi sinh',
        levels: [
            { gold: 50000, gems: 50, reviveTime: 60 },
            { gold: 80000, gems: 80, reviveTime: 45 },
            { gold: 120000, gems: 100, reviveTime: 30 }
        ]
    },
    dungeonEntrance: {
        name: 'Cửa Vào Hầm Ngục',
        desc: 'Gửi thợ săn thám hiểm hầm ngục',
        cost: { gold: 100000, gems: 50 },
        maxLv: 10,
        effect: 'Mở khóa tầng hầm ngục sâu hơn',
        levels: [
            { gold: 100000, gems: 50, maxFloor: 10 },
            { gold: 150000, gems: 0, maxFloor: 20 },
            { gold: 200000, gems: 0, maxFloor: 30 },
            { gold: 300000, gems: 0, maxFloor: 40 },
            { gold: 400000, gems: 0, maxFloor: 50 },
            { gold: 500000, gems: 0, maxFloor: 60 },
            { gold: 600000, gems: 0, maxFloor: 70 },
            { gold: 700000, gems: 0, maxFloor: 80 },
            { gold: 800000, gems: 0, maxFloor: 90 },
            { gold: 1000000, gems: 0, maxFloor: 100 }
        ]
    },
    bossHorn: {
        name: 'Tù Vật Triệu Hồi',
        desc: 'Triệu hồi trùm chiến trường',
        cost: { gold: 80000, gems: 30 },
        maxLv: 3,
        effect: 'Tăng sát thương lên trùm',
        levels: [
            { gold: 80000, gems: 30, bossDmgBonus: 0 },
            { gold: 150000, gems: 50, bossDmgBonus: 10 },
            { gold: 300000, gems: 100, bossDmgBonus: 25 }
        ]
    },
    colosseum: {
        name: 'Đấu Trường',
        desc: 'PK vs thợ săn khác',
        cost: { gold: 500000, gems: 500 },
        maxLv: 3,
        effect: 'Tăng phần thưởng PvP',
        levels: [
            { gold: 500000, gems: 500, pvpReward: 1 },
            { gold: 800000, gems: 800, pvpReward: 1.5 },
            { gold: 1200000, gems: 1000, pvpReward: 2 }
        ]
    }
};

// === VẬT LIỆU ===
const MATERIALS = {
    gỗ: { name: 'Gỗ', basePrice: 2 },
    đá: { name: 'Đá', basePrice: 3 },
    da: { name: 'Da Thú', basePrice: 5 },
    chỉ: { name: 'Chỉ', basePrice: 4 },
    vải: { name: 'Vải', basePrice: 4 },
    sắt: { name: 'Sắt', basePrice: 8 },
    thép: { name: 'Thép', basePrice: 15 },
    bạc: { name: 'Bạc', basePrice: 25 },
    'tinh thể': { name: 'Tinh Thể', basePrice: 50 },
    thần: { name: 'Thần Quặng', basePrice: 30 },
    vàng: { name: 'Vàng', basePrice: 60 },
    ngọc: { name: 'Ngọc', basePrice: 40 },
    hạt: { name: 'Hạt Sáng', basePrice: 100 },
    lông: { name: 'Lông Vũ', basePrice: 80 },
    xương: { name: 'Xương Quỷ', basePrice: 120 },
    máu: { name: 'Máu Quỷ', basePrice: 150 },
    'đá cường hóa': { name: 'Đá Cường Hóa', basePrice: 50 },
    'đá nâng cấp': { name: 'Đá Nâng Cấp', basePrice: 30 },
    'đá sáng': { name: 'Đá Sáng', basePrice: 100 },
    'nước mắt thiên thần': { name: 'Nước Mắt Thiên Thần', basePrice: 500 }
};

// === QUÁI VẬT THEO ĐỘ KHÓ ===
const MONSTERS = {
    easy: [
        { name: 'Slime Xanh', hp: 30, atk: 5, def: 1, exp: 5, gold: 20, drops: { gỗ: 1, đá: 1 } },
        { name: 'Dơi Nhỏ', hp: 25, atk: 6, def: 0, exp: 4, gold: 15, drops: { chỉ: 1, vải: 1 } },
        { name: 'Bọ Cạp', hp: 40, atk: 4, def: 2, exp: 6, gold: 25, drops: { da: 1 } },
        { name: 'Sói Xám', hp: 50, atk: 8, def: 2, exp: 8, gold: 30, drops: { da: 2, sắt: 1 } },
        { name: 'Gấu Nâu', hp: 70, atk: 7, def: 4, exp: 10, gold: 40, drops: { da: 2, đá: 1 } }
    ],
    normal: [
        { name: 'Slime Đen', hp: 80, atk: 12, def: 4, exp: 15, gold: 60, drops: { đá: 2, sắt: 1 } },
        { name: 'Ma Cà Rồng',  hp: 100, atk: 15, def: 5,  exp: 20, gold: 80, drops: { sắt: 2, thép: 1, bạc: 1 } },
        { name: 'Quỷ Lửa',     hp: 70,  atk: 20, def: 3,  exp: 18, gold: 70, drops: { 'tinh thể': 1, sắt: 1, bạc: 1 } },
        { name: 'Xương Khô', hp: 120, atk: 10, def: 8, exp: 22, gold: 90, drops: { xương: 1, thép: 1 } },
        { name: 'Phù Thủy', hp: 90, atk: 18, def: 4, exp: 25, gold: 100, drops: { 'tinh thể': 2, ngọc: 1 } }
    ],
    hard: [
        { name: 'Quỷ Khổng Lồ', hp: 200, atk: 25, def: 10, exp: 40, gold: 150, drops: { thần: 1, da: 3 } },
        { name: 'Rồng Lửa', hp: 250, atk: 30, def: 8, exp: 50, gold: 200, drops: { vàng: 1, 'tinh thể': 2 } },
        { name: 'Băng Tinh', hp: 180, atk: 28, def: 12, exp: 45, gold: 180, drops: { hạt: 1, ngọc: 2 } },
        { name: 'Ma Vương',     hp: 300, atk: 22, def: 15, exp: 55, gold: 250, drops: { xương: 2, máu: 1, 'đá cường hóa': 2 } },
        { name: 'Ác Ma',        hp: 220, atk: 35, def: 10, exp: 60, gold: 300, drops: { lông: 1, hạt: 1, 'đá cường hóa': 2 } }
    ],
    expert: [
        { name: 'Bóng Ma',         hp: 500,  atk: 45, def: 20, exp: 80,  gold: 400, drops: { xương: 3, máu: 2, 'đá cường hóa': 2 } },
        { name: 'Kỵ Sĩ Đen',       hp: 600,  atk: 50, def: 25, exp: 90,  gold: 500, drops: { thần: 3, vàng: 2, 'đá cường hóa': 2 } },
        { name: 'Phù Thủy Bóng Tối', hp: 400, atk: 55, def: 15, exp: 100, gold: 600, drops: { 'tinh thể': 3, ngọc: 3, 'đá nâng cấp': 1 } }
    ],
    nightmare: [
        { name: 'Quỷ Vương',      hp: 1000, atk: 70, def: 35, exp: 150, gold: 800, drops: { xương: 5, máu: 3, 'đá nâng cấp': 2 } },
        { name: 'Rồng Bóng Tối',  hp: 1200, atk: 80, def: 30, exp: 170, gold: 1000, drops: { vàng: 3, lông: 3, 'đá nâng cấp': 1 } },
        { name: 'Ác Quỷ',         hp: 900,  atk: 90, def: 25, exp: 200, gold: 1200, drops: { máu: 4, hạt: 3, 'đá sáng': 1 } }
    ],
    torment1: [
        { name: 'Thần Chết',      hp: 2000, atk: 120, def: 50, exp: 300, gold: 1500, drops: { máu: 5, 'đá sáng': 2, 'đá cường hóa': 3 } },
        { name: 'Hỗn Mang',       hp: 2500, atk: 140, def: 45, exp: 350, gold: 2000, drops: { xương: 5, lông: 5, 'đá nâng cấp': 2 } }
    ],
    torment2: [
        { name: 'Vua Bóng Tối',   hp: 4000, atk: 180, def: 60, exp: 500, gold: 3000, drops: { máu: 8, 'đá sáng': 3, 'nước mắt thiên thần': 1 } }
    ],
    torment3: [
        { name: 'Hủy Diệt',       hp: 6000, atk: 250, def: 80, exp: 800, gold: 5000, drops: { 'đá sáng': 5, 'nước mắt thiên thần': 2 } }
    ]
};

// === BOSS ===
const BOSSES = [
    { name: 'Quỷ Vật Sơn', hp: 500,   atk: 20,  def: 8,  gold: 100,  gems: 2,  drops: { da: 10, sắt: 5 },                                           diff: 'easy' },
    { name: 'Yêu Long', hp: 1500,  atk: 40,  def: 15, gold: 300,  gems: 5,  drops: { thép: 10, 'tinh thể': 5 },                                   diff: 'normal' },
    { name: 'Vua Quỷ', hp: 4000,  atk: 70,  def: 25, gold: 800,  gems: 10, drops: { thần: 10, vàng: 5, 'đá cường hóa': 5 },                       diff: 'hard' },
    { name: 'Ác Thần', hp: 10000, atk: 120, def: 40, gold: 2000, gems: 20, drops: { hạt: 10, máu: 5, 'đá nâng cấp': 5 },                           diff: 'expert' },
    { name: 'Chúa Tể Bóng Tối', hp: 25000, atk: 200, def: 60, gold: 5000, gems: 50, drops: { lông: 10, xương: 10, 'đá sáng': 3 },                   diff: 'nightmare' },
    { name: 'Thiên Sứ Sa Ngã', hp: 100000, atk: 500, def: 100, gold: 20000, gems: 100, drops: { 'nước mắt thiên thần': 5, 'đá sáng': 10 },           diff: 'torment1' },
    { name: 'Thần Hỗn Mang', hp: 300000, atk: 800, def: 150, gold: 50000, gems: 200, drops: { 'nước mắt thiên thần': 10, 'đá sáng': 20 },           diff: 'torment2' },
    { name: 'Hư Vô', hp: 1000000, atk: 1500, def: 300, gold: 100000, gems: 500, drops: { 'nước mắt thiên thần': 20, 'đá sáng': 30 },                diff: 'torment3' }
];

// === NHIỆM VỤ ===
const QUESTS = [
    { id: 1, name: 'Xây dựng đầu tiên', desc: 'Xây Nhà Chung', req: { type: 'build', id: 'commonHouse' }, reward: { gold: 200, gems: 2 } },
    { id: 2, name: 'Chiêu mộ đầu', desc: 'Có 1 thợ săn trong thị trấn', req: { type: 'hunterCount', count: 1 }, reward: { gold: 100, gems: 1 } },
    { id: 3, name: 'Sức mạnh đầu tiên', desc: 'Lên cấp thợ săn lên 5', req: { type: 'hunterLevel', level: 5 }, reward: { gold: 300, gems: 3 } },
    { id: 4, name: 'Thợ săn thứ hai', desc: 'Có 2 thợ săn trong thị trấn', req: { type: 'hunterCount', count: 2 }, reward: { gold: 200, gems: 2 } },
    { id: 5, name: 'Nâng cấp Tòa Thị', desc: 'Nâng Tòa Thị Chính cấp 2', req: { type: 'buildingLevel', id: 'townHall', level: 2 }, reward: { gold: 500, gems: 5 } },
    { id: 6, name: 'Xây dựng dịch vụ', desc: 'Xây Nhà Hàng', req: { type: 'build', id: 'restaurant' }, reward: { gold: 400, gems: 3 } },
    { id: 7, name: 'Rèn đồ', desc: 'Chế tạo 1 món đồ', req: { type: 'craft', count: 1 }, reward: { gold: 500, gems: 5 } },
    { id: 8, name: 'Trang bị', desc: 'Trang bị 1 món đồ cho thợ săn', req: { type: 'equip', count: 1 }, reward: { gold: 300, gems: 3 } },
    { id: 9, name: 'Thợ săn thứ ba', desc: 'Có 3 thợ săn trong thị trấn', req: { type: 'hunterCount', count: 3 }, reward: { gold: 400, gems: 4 } },
    { id: 10, name: 'Nâng cấp Tòa Thị 3', desc: 'Nâng Tòa Thị Chính cấp 3', req: { type: 'buildingLevel', id: 'townHall', level: 3 }, reward: { gold: 1000, gems: 10 } },
    { id: 11, name: 'Săn bắn dễ dàng', desc: 'Tiêu diệt 20 quái vật', req: { type: 'kill', count: 20 }, reward: { gold: 500, gems: 5 } },
    { id: 12, name: 'Thợ săn cấp 10', desc: 'Có thợ săn đạt cấp 10', req: { type: 'hunterLevel', level: 10 }, reward: { gold: 800, gems: 8 } },
    { id: 13, name: 'Luyện tập', desc: 'Học 1 kỹ năng', req: { type: 'skill', count: 1 }, reward: { gold: 600, gems: 6 } },
    { id: 14, name: 'Buôn bán', desc: 'Thực hiện 1 giao dịch', req: { type: 'trade', count: 1 }, reward: { gold: 500, gems: 5 } },
    { id: 15, name: 'Săn bắn phát triển', desc: 'Tiêu diệt 50 quái vật', req: { type: 'kill', count: 50 }, reward: { gold: 1000, gems: 10 } },
    { id: 16, name: 'Nhiệm vụ truy nã', desc: 'Hoàn thành 1 nhiệm vụ tại Trạm Nhiệm Vụ', req: { type: 'bounty', count: 1 }, reward: { gold: 800, gems: 8 } },
    { id: 17, name: 'Thợ săn cấp 20', desc: 'Có thợ săn đạt cấp 20', req: { type: 'hunterLevel', level: 20 }, reward: { gold: 1500, gems: 15 } },
    { id: 18, name: 'Hầm ngục đầu', desc: 'Hoàn thành 1 lần ở hầm ngục', req: { type: 'dungeon', count: 1 }, reward: { gold: 2000, gems: 20 } },
    { id: 19, name: 'Thợ săn cấp 50', desc: 'Có thợ săn đạt cấp 50', req: { type: 'hunterLevel', level: 50 }, reward: { gold: 3000, gems: 30 } },
    { id: 20, name: 'Tiêu diệt 200 quái', desc: 'Tiêu diệt 200 quái vật', req: { type: 'kill', count: 200 }, reward: { gold: 5000, gems: 50 } }
];

// === THÀNH TỰU ===
const ACHIEVEMENTS = [
    { id: 'a1', name: 'Tập Sự', desc: 'Xây 3 công trình', req: { type: 'buildCount', count: 3 }, reward: { gold: 500, gems: 10 } },
    { id: 'a2', name: 'Nhà Tuyển Dụng', desc: 'Có 5 thợ săn', req: { type: 'hunterCount', count: 5 }, reward: { gold: 1000, gems: 20 } },
    { id: 'a3', name: 'Thợ Lão Luyện', desc: 'Có thợ săn đạt cấp 100', req: { type: 'hunterLevel', level: 100 }, reward: { gold: 5000, gems: 50 } },
    { id: 'a4', name: 'Luyện Khí', desc: 'Chế tạo 10 món đồ', req: { type: 'craftCount', count: 10 }, reward: { gold: 2000, gems: 30 } },
    { id: 'a5', name: 'Thợ săn', desc: 'Tiêu diệt 500 quái', req: { type: 'killCount', count: 500 }, reward: { gold: 5000, gems: 50 } },
    { id: 'a6', name: 'Thám Hiểm', desc: 'Hoàn thành 10 hầm ngục', req: { type: 'dungeonCount', count: 10 }, reward: { gold: 10000, gems: 100 } },
    { id: 'a7', name: 'Chuyển Sinh', desc: 'Thực hiện chuyển sinh lần đầu', req: { type: 'reincarnate', count: 1 }, reward: { gold: 3000, gems: 50 } },
    { id: 'a8', name: 'Giàu Có', desc: 'Sở hữu 100000 vàng', req: { type: 'gold', count: 100000 }, reward: { gold: 0, gems: 200 } },
    { id: 'a9', name: 'Săn Thần', desc: 'Tiêu diệt trùm đầu tiên', req: { type: 'bossKill', count: 1 }, reward: { gold: 5000, gems: 80 } },
    { id: 'a10', name: 'Huyền Thoại', desc: 'Chiêu mộ thợ săn Huyền Thoại', req: { type: 'legendaryHunter', count: 1 }, reward: { gold: 10000, gems: 200 } }
];

// === ĐỘ KHÓ & YÊU CẦU MỞ KHÓA ===
const DIFFICULTIES = [
    { id: 'easy', name: 'Dễ', totalReincarnations: 0 },
    { id: 'normal', name: 'Thường', totalReincarnations: 2 },
    { id: 'hard', name: 'Khó', totalReincarnations: 6 },
    { id: 'expert', name: 'Chuyên Gia', totalReincarnations: 12 },
    { id: 'nightmare', name: 'Ác Mộng', totalReincarnations: 20 },
    { id: 'torment1', name: 'Cực Hình I', totalReincarnations: 30 },
    { id: 'torment2', name: 'Cực Hình II', totalReincarnations: 45 },
    { id: 'torment3', name: 'Cực Hình III', totalReincarnations: 60 }
];

// === ĐẶC TÍNH (TRAITS) ===
const TRAITS = [
    { id: 'hp_up', name: 'Máu Khỏe', desc: 'Tăng 20% máu tối đa', stat: 'hp', mult: 0.2, type: 'stat' },
    { id: 'atk_up', name: 'Sức Mạnh', desc: 'Tăng 15% tấn công', stat: 'atk', mult: 0.15, type: 'stat' },
    { id: 'def_up', name: 'Phòng Thủ', desc: 'Tăng 20% phòng thủ', stat: 'def', mult: 0.2, type: 'stat' },
    { id: 'crit_up', name: 'Chí Mạng', desc: 'Tăng 5% tỷ lệ chí mạng', stat: 'crit', mult: 0.05, type: 'statmax' },
    { id: 'evasion_up', name: 'Né Tránh', desc: 'Tăng 5% né tránh', stat: 'evasion', mult: 0.05, type: 'statmax' },
    { id: 'life_steal', name: 'Hút Máu', desc: 'Hút 5% sát thương thành máu', stat: 'lifeSteal', mult: 0.05, type: 'special' },
    { id: 'gold_bonus', name: 'Vàng May', desc: 'Nhận thêm 20% vàng từ quái', stat: 'goldBonus', mult: 0.2, type: 'special' },
    { id: 'exp_bonus', name: 'Thông Thạo', desc: 'Nhận thêm 20% exp từ quái', stat: 'expBonus', mult: 0.2, type: 'special' },
    { id: 'toughness', name: 'Trâu Bò', desc: 'Giảm 10% sát thương nhận vào', stat: 'dmgReduction', mult: 0.1, type: 'special' },
    { id: 'berserk', name: 'Cuồng Bạo', desc: 'HP càng thấp ATK càng cao (tối đa 30%)', stat: 'berserk', mult: 0.3, type: 'special' }
];

// === THỜI GIAN (ms) ===
const TICK_INTERVAL = 1000;
const HUNTER_ARRIVAL_INTERVAL = 30000;
const HUNT_INTERVAL = 3000;
const HP_DRAIN_RATE = 1;
const SATIETY_DRAIN_RATE = 1;
const MOOD_DRAIN_RATE = 0.5;
const STAMINA_DRAIN_RATE = 0.3;
const RECOVERY_RATE = 2;
const EXP_PER_LEVEL = 100;
