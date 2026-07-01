/* ==========================================================
   DATA.JS - Dữ liệu game Evil Hunter Tycoon tiếng Việt
   Tất cả hằng số, quái vật, trang bị, tòa nhà, v.v.
   ========================================================== */

const GAME_DATA = {
    /* ===== PHÂN LỚP HUNTER ===== */
    classes: {
        berserker: {
            name: 'Chiến Binh',
            icon: '⚔️',
            desc: 'Sat thủ cận chiến, damage cao, máu dày.',
            baseStats: { hp: 120, atk: 18, def: 8, crit: 10, atkSpd: 1.0, evasion: 5 },
            skills: [
                { id: 'berserker_rage', name: 'Cuồng Bạo', desc: 'Tăng ATK 50% trong 5 giây', baseDuration: 5000, baseMulti: 1.5 },
                { id: 'cleave', name: 'Chém Đứt', desc: 'Gây damage lên 2 mục tiêu', baseMulti: 0.8 },
                { id: 'bloodlust', name: 'Thirst Máu', desc: 'Hồi 15% HP khi giết quái', baseHealPct: 0.15 }
            ]
        },
        ranger: {
            name: 'Thợ Săn',
            icon: '🏹',
            desc: 'Tấn công từ xa, tốc độ cao, crit tốt.',
            baseStats: { hp: 90, atk: 15, def: 5, crit: 20, atkSpd: 1.4, evasion: 15 },
            skills: [
                { id: 'quick_shot', name: 'Bắn Tốc Độ', desc: 'Tấn công 3 lần liên tiếp', baseMulti: 0.6 },
                { id: 'poison_arrow', name: 'Mũi Tên Độc', desc: 'Gây sát thương DOT 3 giây', baseDotDmg: 5 },
                { id: 'evasion_mastery', name: 'Thân Pháp', desc: 'Tăng né tránh 30% trong 5 giây', baseDuration: 5000, baseEvasionBuff: 30 }
            ]
        },
        paladin: {
            name: 'Hiệp Sĩ',
            icon: '🛡️',
            desc: 'Tank, phòng thủ cao, hỗ trợ đồng đội.',
            baseStats: { hp: 150, atk: 10, def: 15, crit: 5, atkSpd: 0.8, evasion: 5 },
            skills: [
                { id: 'holy_shield', name: 'Thánh Khiên', desc: 'Giảm damage nhận vào 40% trong 5 giây', baseDuration: 5000, baseDefBuff: 0.4 },
                { id: 'heal', name: 'Chữa Lành', desc: 'Hồi 25% HP cho bản thân', baseHealPct: 0.25 },
                { id: 'taunt', name: 'Khiêu Khích', desc: 'Kéo quái đánh mình, giảm damage team 20%', baseDuration: 4000 }
            ]
        },
        sorcerer: {
            name: 'Pháp Sư',
            icon: '🔮',
            desc: 'Phép thuật area, damage phép cao.',
            baseStats: { hp: 80, atk: 20, def: 4, crit: 12, atkSpd: 0.7, evasion: 8 },
            skills: [
                { id: 'fireball', name: 'Quả Cầu Lửa', desc: 'Gây damage phép lên toàn bộ kẻ thù', baseMulti: 1.2 },
                { id: 'frost_nova', name: 'Băng Giá', desc: 'Làm chậm kẻ thù 50% trong 3 giây', baseDuration: 3000 },
                { id: 'arcane_blast', name: 'Nổ Ma Pháp', desc: 'Gây damage đơn mục tiêu cực lớn', baseMulti: 2.5 }
            ]
        },
        darkknight: {
            name: 'Hắc Hiệp Sĩ',
            icon: '🖤',
            desc: 'Kết hợp sát thương và hồi máu, mạnh về cuối game.',
            baseStats: { hp: 110, atk: 16, def: 10, crit: 15, atkSpd: 0.9, evasion: 10 },
            skills: [
                { id: 'soul_reaper', name: 'Thu Hồn', desc: 'Gây damage và hồi 20% damage gây ra', baseMulti: 1.3, baseLifesteal: 0.2 },
                { id: 'dark_pulse', name: 'Sóng Tối', desc: 'Damage area 3 kẻ thù', baseMulti: 0.9 },
                { id: 'shadow_step', name: 'Bước Chân Bóng', desc: 'Tăng crit rate 40% trong 5 giây', baseDuration: 5000, baseCritBuff: 40 }
            ]
        }
    },

    /* ===== CHẤT LƯỢNG HUNTER ===== */
    qualities: [
        { id: 'legendary', name: 'Huyền Thoại', color: '#f59e0b', minPoints: 14 },
        { id: 'heroic', name: 'Anh Hùng', color: '#a855f7', minPoints: 10 },
        { id: 'superior', name: 'Siêu Phàm', color: '#3b82f6', minPoints: 6 },
        { id: 'rare', name: 'Hiếm', color: '#10b981', minPoints: 2 },
        { id: 'normal', name: 'Thường', color: '#64748b', minPoints: 0 }
    ],

    /* ===== KHU VỰC SĂN ===== */
    zones: [
        { id: 'forest', name: 'Rừng Bóng Tối', levelReq: 1, monsterLvRange: [1, 5], icon: '🌲', unlockCost: 0, goldPerKill: 3, matDropChance: 0.4 },
        { id: 'cave', name: 'Hang Động', levelReq: 5, monsterLvRange: [5, 10], icon: '🕳️', unlockCost: 200, goldPerKill: 8, matDropChance: 0.5 },
        { id: 'swamp', name: 'Đầm Lầy', levelReq: 10, monsterLvRange: [10, 18], icon: '🐊', unlockCost: 800, goldPerKill: 15, matDropChance: 0.55 },
        { id: 'ruins', name: 'Phế Tích', levelReq: 18, monsterLvRange: [18, 28], icon: '🏚️', unlockCost: 2000, goldPerKill: 25, matDropChance: 0.6 },
        { id: 'volcano', name: 'Núi Lửa', levelReq: 28, monsterLvRange: [28, 40], icon: '🌋', unlockCost: 5000, goldPerKill: 40, matDropChance: 0.65 },
        { id: 'hellscape', name: 'Địa Ngục', levelReq: 40, monsterLvRange: [40, 60], icon: '🔥', unlockCost: 15000, goldPerKill: 70, matDropChance: 0.7 },
        { id: 'void', name: 'Hư Không', levelReq: 60, monsterLvRange: [60, 85], icon: '🌌', unlockCost: 50000, goldPerKill: 120, matDropChance: 0.75 },
        { id: 'abyss', name: 'Vực Thẳm', levelReq: 85, monsterLvRange: [85, 120], icon: '🕳️', unlockCost: 200000, goldPerKill: 250, matDropChance: 0.8 }
    ],

    /* ===== LOẠI QUÁI VẬT ===== */
    monsterTypes: [
        { id: 'slime', name: 'Quả Nhầy', icon: '🟢', baseHp: 20, baseAtk: 3, baseDef: 1, goldDrop: 2, matDrop: 1, expDrop: 5 },
        { id: 'goblin', name: 'Yêu Tinh', icon: '👺', baseHp: 35, baseAtk: 6, baseDef: 2, goldDrop: 4, matDrop: 2, expDrop: 8 },
        { id: 'wolf', name: 'Sói Ác', icon: '🐺', baseHp: 45, baseAtk: 9, baseDef: 3, goldDrop: 6, matDrop: 2, expDrop: 12 },
        { id: 'skeleton', name: 'Bộ Xương', icon: '💀', baseHp: 55, baseAtk: 10, baseDef: 5, goldDrop: 8, matDrop: 3, expDrop: 15 },
        { id: 'ogre', name: 'Người Khổng Lồ', icon: '👹', baseHp: 90, baseAtk: 14, baseDef: 8, goldDrop: 12, matDrop: 4, expDrop: 25 },
        { id: 'troll', name: 'Quỷ Lùn', icon: '🧟', baseHp: 120, baseAtk: 18, baseDef: 10, goldDrop: 16, matDrop: 5, expDrop: 35 },
        { id: 'vampire', name: 'Ma Cà Rồng', icon: '🧛', baseHp: 150, baseAtk: 22, baseDef: 12, goldDrop: 22, matDrop: 6, expDrop: 50 },
        { id: 'demon', name: 'Ác Quỷ', icon: '😈', baseHp: 200, baseAtk: 28, baseDef: 15, goldDrop: 30, matDrop: 8, expDrop: 70 },
        { id: 'dragon', name: 'Rồng', icon: '🐉', baseHp: 350, baseAtk: 40, baseDef: 25, goldDrop: 50, matDrop: 12, expDrop: 120 },
        { id: 'archdemon', name: 'Đại Ác Quỷ', icon: '👿', baseHp: 500, baseAtk: 55, baseDef: 35, goldDrop: 80, matDrop: 18, expDrop: 200 }
    ],

    /* ===== BOSS ===== */
    bosses: [
        { id: 'forest_boss', name: 'Rừng', level: 5, icon: '🐲', hp: 300, atk: 20, def: 10, goldDrop: 100, matDrop: 20, expDrop: 200, hornCost: 1, zone: 'forest' },
        { id: 'cave_boss', name: 'Hang Động', level: 12, icon: '🗿', hp: 800, atk: 45, def: 25, goldDrop: 300, matDrop: 50, expDrop: 500, hornCost: 1, zone: 'cave' },
        { id: 'swamp_boss', name: 'Đầm Lầy', level: 22, icon: '🦑', hp: 1500, atk: 80, def: 45, goldDrop: 700, matDrop: 100, expDrop: 1000, hornCost: 2, zone: 'swamp' },
        { id: 'ruins_boss', name: 'Phế Tích', level: 35, icon: '⚰️', hp: 3000, atk: 130, def: 75, goldDrop: 1500, matDrop: 200, expDrop: 2500, hornCost: 2, zone: 'ruins' },
        { id: 'volcano_boss', name: 'Núi Lửa', level: 50, icon: '🌋', hp: 6000, atk: 200, def: 120, goldDrop: 3500, matDrop: 400, expDrop: 5000, hornCost: 3, zone: 'volcano' },
        { id: 'hellscape_boss', name: 'Địa Ngục', level: 75, icon: '😈', hp: 12000, atk: 350, def: 200, goldDrop: 8000, matDrop: 800, expDrop: 10000, hornCost: 3, zone: 'hellscape' },
        { id: 'void_boss', name: 'Hư Không', level: 100, icon: '🌑', hp: 25000, atk: 600, def: 350, goldDrop: 20000, matDrop: 1500, expDrop: 25000, hornCost: 5, zone: 'void' },
        { id: 'abyss_boss', name: 'Vực Thẳm', level: 130, icon: '💀', hp: 50000, atk: 1000, def: 600, goldDrop: 50000, matDrop: 3000, expDrop: 60000, hornCost: 5, zone: 'abyss' }
    ],

    /* ===== ĐỊA HẠ ===== */
    dungeons: [
        { id: 'dungeon_1', name: 'Hầm Ngục Sơ Cấp', levelReq: 10, monsterCount: 5, monsterLvMulti: 1.2, rewardGold: 200, rewardMats: 30, rewardItemChance: 0.2 },
        { id: 'dungeon_2', name: 'Hầm Ngục Trung Cấp', levelReq: 25, monsterCount: 7, monsterLvMulti: 1.4, rewardGold: 800, rewardMats: 80, rewardItemChance: 0.35 },
        { id: 'dungeon_3', name: 'Hầm Ngục Cao Cấp', levelReq: 45, monsterCount: 10, monsterLvMulti: 1.6, rewardGold: 3000, rewardMats: 200, rewardItemChance: 0.5 },
        { id: 'dungeon_4', name: 'Hầm Ngục Cực Cấp', levelReq: 70, monsterCount: 12, monsterLvMulti: 2.0, rewardGold: 10000, rewardMats: 500, rewardItemChance: 0.7 },
        { id: 'dungeon_5', name: 'Hầm Ngục Vĩnh Hằng', levelReq: 100, monsterCount: 15, monsterLvMulti: 2.5, rewardGold: 50000, rewardMats: 1500, rewardItemChance: 0.9 }
    ],

    /* ===== TRANG BỊ ===== */
    rarities: [
        { id: 'normal', name: 'Thường', color: '#94a3b8', statMulti: 1.0 },
        { id: 'sturdy', name: 'Vững Chắc', color: '#22c55e', statMulti: 1.3 },
        { id: 'refined', name: 'Tinh Chế', color: '#3b82f6', statMulti: 1.7 },
        { id: 'powerful', name: 'Mạnh Mẽ', color: '#a855f7', statMulti: 2.2 },
        { id: 'supreme', name: 'Tối Thượng', color: '#f59e0b', statMulti: 3.0 }
    ],

    /* ===== VŨ KHÍ ===== */
    weapons: [
        // Berserker
        { id: 'w_axe_1', name: 'Rìu Sắt', type: 'weapon', classReq: 'berserker', rarity: 'normal', baseAtk: 5, baseCrit: 0, cost: 30, matCost: 5 },
        { id: 'w_axe_2', name: 'Rìu Chiến', type: 'weapon', classReq: 'berserker', rarity: 'sturdy', baseAtk: 12, baseCrit: 2, cost: 100, matCost: 15 },
        { id: 'w_axe_3', name: 'Rìu Lửa', type: 'weapon', classReq: 'berserker', rarity: 'refined', baseAtk: 22, baseCrit: 4, cost: 350, matCost: 40 },
        { id: 'w_axe_4', name: 'Rìu Hủy Diệt', type: 'weapon', classReq: 'berserker', rarity: 'powerful', baseAtk: 40, baseCrit: 6, cost: 1200, matCost: 100 },
        { id: 'w_axe_5', name: 'Rìu Thần', type: 'weapon', classReq: 'berserker', rarity: 'supreme', baseAtk: 70, baseCrit: 10, cost: 5000, matCost: 300 },
        // Ranger
        { id: 'w_bow_1', name: 'Cung Gỗ', type: 'weapon', classReq: 'ranger', rarity: 'normal', baseAtk: 4, baseCrit: 3, cost: 30, matCost: 5 },
        { id: 'w_bow_2', name: 'Cung Sắt', type: 'weapon', classReq: 'ranger', rarity: 'sturdy', baseAtk: 10, baseCrit: 5, cost: 100, matCost: 15 },
        { id: 'w_bow_3', name: 'Cung Bạc', type: 'weapon', classReq: 'ranger', rarity: 'refined', baseAtk: 18, baseCrit: 8, cost: 350, matCost: 40 },
        { id: 'w_bow_4', name: 'Cung Rồng', type: 'weapon', classReq: 'ranger', rarity: 'powerful', baseAtk: 32, baseCrit: 12, cost: 1200, matCost: 100 },
        { id: 'w_bow_5', name: 'Cung Thiên Hà', type: 'weapon', classReq: 'ranger', rarity: 'supreme', baseAtk: 55, baseCrit: 16, cost: 5000, matCost: 300 },
        // Paladin
        { id: 'w_mace_1', name: 'Chùy Sắt', type: 'weapon', classReq: 'paladin', rarity: 'normal', baseAtk: 3, baseCrit: 0, cost: 30, matCost: 5 },
        { id: 'w_mace_2', name: 'Chùy Thánh', type: 'weapon', classReq: 'paladin', rarity: 'sturdy', baseAtk: 8, baseCrit: 1, cost: 100, matCost: 15 },
        { id: 'w_mace_3', name: 'Chùy Quang Minh', type: 'weapon', classReq: 'paladin', rarity: 'refined', baseAtk: 14, baseCrit: 2, cost: 350, matCost: 40 },
        { id: 'w_mace_4', name: 'Chùy Thần Thánh', type: 'weapon', classReq: 'paladin', rarity: 'powerful', baseAtk: 24, baseCrit: 3, cost: 1200, matCost: 100 },
        { id: 'w_mace_5', name: 'Chùy Chúa', type: 'weapon', classReq: 'paladin', rarity: 'supreme', baseAtk: 42, baseCrit: 5, cost: 5000, matCost: 300 },
        // Sorcerer
        { id: 'w_staff_1', name: 'Gậy Gỗ', type: 'weapon', classReq: 'sorcerer', rarity: 'normal', baseAtk: 6, baseCrit: 1, cost: 30, matCost: 5 },
        { id: 'w_staff_2', name: 'Gậy Phép', type: 'weapon', classReq: 'sorcerer', rarity: 'sturdy', baseAtk: 14, baseCrit: 2, cost: 100, matCost: 15 },
        { id: 'w_staff_3', name: 'Gậy Nguyên Tố', type: 'weapon', classReq: 'sorcerer', rarity: 'refined', baseAtk: 26, baseCrit: 4, cost: 350, matCost: 40 },
        { id: 'w_staff_4', name: 'Gậy Huyền Thoại', type: 'weapon', classReq: 'sorcerer', rarity: 'powerful', baseAtk: 45, baseCrit: 7, cost: 1200, matCost: 100 },
        { id: 'w_staff_5', name: 'Gậy Vĩnh Hằng', type: 'weapon', classReq: 'sorcerer', rarity: 'supreme', baseAtk: 80, baseCrit: 12, cost: 5000, matCost: 300 },
        // Dark Knight
        { id: 'w_sword_1', name: 'Kiếm Sắt', type: 'weapon', classReq: 'darkknight', rarity: 'normal', baseAtk: 5, baseCrit: 2, cost: 30, matCost: 5 },
        { id: 'w_sword_2', name: 'Kiếm Bóng Tối', type: 'weapon', classReq: 'darkknight', rarity: 'sturdy', baseAtk: 11, baseCrit: 4, cost: 100, matCost: 15 },
        { id: 'w_sword_3', name: 'Kiếm Ma Vương', type: 'weapon', classReq: 'darkknight', rarity: 'refined', baseAtk: 20, baseCrit: 6, cost: 350, matCost: 40 },
        { id: 'w_sword_4', name: 'Kiếm Hủy Diệt', type: 'weapon', classReq: 'darkknight', rarity: 'powerful', baseAtk: 36, baseCrit: 10, cost: 1200, matCost: 100 },
        { id: 'w_sword_5', name: 'Kiếm Satans', type: 'weapon', classReq: 'darkknight', rarity: 'supreme', baseAtk: 65, baseCrit: 14, cost: 5000, matCost: 300 }
    ],

    /* ===== GIÁP ===== */
    armors: [
        { id: 'a_leather_1', name: 'Giáp Da', type: 'armor', rarity: 'normal', baseDef: 3, baseHp: 10, cost: 25, matCost: 4 },
        { id: 'a_chain_1', name: 'Giáp Xích', type: 'armor', rarity: 'sturdy', baseDef: 8, baseHp: 25, cost: 90, matCost: 12 },
        { id: 'a_plate_1', name: 'Giáp Tấm', type: 'armor', rarity: 'refined', baseDef: 15, baseHp: 50, cost: 300, matCost: 35 },
        { id: 'a_magic_1', name: 'Giáp Phép', type: 'armor', rarity: 'powerful', baseDef: 28, baseHp: 100, cost: 1000, matCost: 85 },
        { id: 'a_divine_1', name: 'Giáp Thần', type: 'armor', rarity: 'supreme', baseDef: 50, baseHp: 200, cost: 4500, matCost: 250 }
    ],

    /* ===== PHỤ KIỆN ===== */
    accessories: [
        { id: 'acc_ring_1', name: 'Nhẫn Đồng', type: 'accessory', rarity: 'normal', baseAtk: 2, baseCrit: 2, cost: 20, matCost: 3 },
        { id: 'acc_ring_2', name: 'Nhẫn Bạc', type: 'accessory', rarity: 'sturdy', baseAtk: 5, baseCrit: 4, cost: 80, matCost: 10 },
        { id: 'acc_ring_3', name: 'Nhẫn Vàng', type: 'accessory', rarity: 'refined', baseAtk: 10, baseCrit: 6, cost: 280, matCost: 30 },
        { id: 'acc_ring_4', name: 'Nhẫn Kim Cương', type: 'accessory', rarity: 'powerful', baseAtk: 18, baseCrit: 10, cost: 900, matCost: 80 },
        { id: 'acc_ring_5', name: 'Nhẫn Vũ Trụ', type: 'accessory', rarity: 'supreme', baseAtk: 32, baseCrit: 15, cost: 4000, matCost: 220 }
    ],

    /* ===== TIÊU HAO ===== */
    consumables: [
        { id: 'potion_hp', name: 'Thuốc HP', type: 'consumable', desc: 'Hồi 30% HP cho 1 săn thủ', healPct: 0.3, cost: 15, matCost: 2 },
        { id: 'potion_hp_big', name: 'Thuốc HP Lớn', type: 'consumable', desc: 'Hồi 60% HP cho 1 săn thủ', healPct: 0.6, cost: 50, matCost: 6 },
        { id: 'potion_sat', name: 'Thức Ăn', type: 'consumable', desc: 'Hồi 40% no cho 1 săn thủ', satRestore: 0.4, cost: 10, matCost: 1 },
        { id: 'horn', name: 'Sừng Boss', type: 'consumable', desc: 'Triệu hồi Boss', cost: 0, matCost: 0, bossDrop: true }
    ],

    /* ===== TÒA NHÀ ===== */
    buildings: [
        {
            id: 'restaurant', name: 'Nhà Hàng', icon: '🍽️',
            desc: 'Phục hồi no cho săn thủ.',
            maxLevel: 10,
            baseCost: 100, costMulti: 1.8,
            baseEffect: 2, effectPerLevel: 1,
            effectUnit: 'điểm no/giây'
        },
        {
            id: 'tavern', name: 'Quán Rượu', icon: '🍺',
            desc: 'Phục hồi tâm trạng cho săn thủ.',
            maxLevel: 10,
            baseCost: 120, costMulti: 1.8,
            baseEffect: 1.5, effectPerLevel: 0.8,
            effectUnit: 'điểm tâm trạng/giây'
        },
        {
            id: 'inn', name: 'Nhà Trọ', icon: '🛏️',
            desc: 'Phục hồi thể lực cho săn thủ.',
            maxLevel: 10,
            baseCost: 80, costMulti: 1.8,
            baseEffect: 2, effectPerLevel: 1,
            effectUnit: 'điểm thể lực/giây'
        },
        {
            id: 'infirmary', name: 'Bệnh Viện', icon: '🏥',
            desc: 'Hồi HP cho săn thủ khi ở thị trấn.',
            maxLevel: 10,
            baseCost: 150, costMulti: 2.0,
            baseEffect: 3, effectPerLevel: 2,
            effectUnit: 'HP/giây'
        },
        {
            id: 'blacksmith', name: 'Lò Rèn', icon: '🔨',
            desc: 'Mở khóa và nâng cấp công thức rèn đồ.',
            maxLevel: 8,
            baseCost: 200, costMulti: 2.5,
            baseEffect: 1, effectPerLevel: 1,
            effectUnit: 'mở khóa công thức mới'
        },
        {
            id: 'sanctuary', name: 'Đền Thờ', icon: '⛪',
            desc: 'Hồi sinh săn thủ đã chết.',
            maxLevel: 5,
            baseCost: 300, costMulti: 3.0,
            baseEffect: 5000, effectPerLevel: 1000,
            effectUnit: 'ms hồi sinh'
        },
        {
            id: 'training', name: 'Đào Tạo', icon: '🏋️',
            desc: 'Tăng kinh nghiệm nhận được của săn thủ.',
            maxLevel: 8,
            baseCost: 250, costMulti: 2.2,
            baseEffect: 5, effectPerLevel: 5,
            effectUnit: '% kinh nghiệm'
        },
        {
            id: 'ranch', name: 'Trang Trại', icon: '🐴',
            desc: 'Quản lý thú cưỡi.',
            maxLevel: 5,
            baseCost: 500, costMulti: 2.5,
            baseEffect: 2, effectPerLevel: 1,
            effectUnit: 'slot thú cưỡi'
        },
        {
            id: 'trading', name: 'Chợ', icon: '🏪',
            desc: 'Bán nguyên liệu với giá cao hơn.',
            maxLevel: 8,
            baseCost: 180, costMulti: 2.0,
            baseEffect: 10, effectPerLevel: 10,
            effectUnit: '% giá bán bonus'
        }
    ],

    /* ===== NÂNG CẤP THỊ TRẤN ===== */
    townUpgrades: [
        { level: 2, name: 'Thị Trấn Nhỏ', cost: 500, matCost: 50, hunterSlots: 4, desc: 'Mở khóa thêm 1 vị trí săn thủ' },
        { level: 3, name: 'Thị Trấn Trung', cost: 2000, matCost: 200, hunterSlots: 5, desc: 'Mở khóa thêm 1 vị trí săn thủ' },
        { level: 4, name: 'Thị Trấn Lớn', cost: 8000, matCost: 800, hunterSlots: 6, desc: 'Mở khóa thêm 1 vị trí săn thủ' },
        { level: 5, name: 'Thị Trấn Vương Quốc', cost: 25000, matCost: 2500, hunterSlots: 8, desc: 'Mở khóa 2 vị trí săn thủ' },
        { level: 6, name: 'Thủ Đô', cost: 80000, matCost: 8000, hunterSlots: 10, desc: 'Mở khóa 2 vị trí săn thủ' },
        { level: 7, name: 'Vương Triều', cost: 250000, matCost: 25000, hunterSlots: 13, desc: 'Mở khóa 3 vị trí săn thủ' },
        { level: 8, name: 'Đế Quốc', cost: 800000, matCost: 80000, hunterSlots: 16, desc: 'Mở khóa 3 vị trí săn thủ' },
        { level: 9, name: 'Thánh Địa', cost: 2500000, matCost: 250000, hunterSlots: 20, desc: 'Mở khóa 4 vị trí săn thủ' },
        { level: 10, name: 'Thế Giới', cost: 8000000, matCost: 800000, hunterSlots: 25, desc: 'Mở khóa 5 vị trí săn thủ, giới hạn tối đa!' }
    ],

    /* ===== NGUYÊN LIỆU ===== */
    materials: [
        { id: 'bone', name: 'Xương', icon: '🦴', zones: ['forest', 'cave'] },
        { id: 'skin', name: 'Da', icon: '🦎', zones: ['forest', 'cave'] },
        { id: 'fang', name: 'Răng', icon: '🦷', zones: ['cave', 'swamp'] },
        { id: 'claw', name: 'Vuốt', icon: '🦀', zones: ['swamp', 'ruins'] },
        { id: 'eye', name: 'Mắt', icon: '👁️', zones: ['ruins', 'volcano'] },
        { id: 'essence', name: 'Tinh Hoa', icon: '✨', zones: ['volcano', 'hellscape'] },
        { id: 'soul', name: 'Linh Hồn', icon: '👻', zones: ['hellscape', 'void'] },
        { id: 'crystal', name: 'Tinh Thể', icon: '💎', zones: ['void', 'abyss'] },
        { id: 'horn_mat', name: 'Sừng', icon: '📯', zones: ['abyss'] },
        { id: 'darkessence', name: 'Tinh Hoa Tối', icon: '🌑', zones: ['abyss'] }
    ],

    /* ===== CÔNG THỨC RÈN ===== */
    recipes: [
        // Level 1 recipes (Blacksmith Lv1)
        { id: 'craft_axe_1', result: 'w_axe_1', materials: { bone: 5, skin: 3 }, reqLevel: 1 },
        { id: 'craft_bow_1', result: 'w_bow_1', materials: { bone: 4, skin: 4 }, reqLevel: 1 },
        { id: 'craft_mace_1', result: 'w_mace_1', materials: { bone: 6, skin: 2 }, reqLevel: 1 },
        { id: 'craft_staff_1', result: 'w_staff_1', materials: { bone: 3, skin: 5 }, reqLevel: 1 },
        { id: 'craft_sword_1', result: 'w_sword_1', materials: { bone: 5, skin: 3 }, reqLevel: 1 },
        { id: 'craft_leather', result: 'a_leather_1', materials: { skin: 5, bone: 2 }, reqLevel: 1 },
        { id: 'craft_ring_1', result: 'acc_ring_1', materials: { bone: 3, skin: 3 }, reqLevel: 1 },
        // Level 2 recipes
        { id: 'craft_axe_2', result: 'w_axe_2', materials: { fang: 8, bone: 5, skin: 5 }, reqLevel: 2 },
        { id: 'craft_bow_2', result: 'w_bow_2', materials: { fang: 6, bone: 6, skin: 6 }, reqLevel: 2 },
        { id: 'craft_mace_2', result: 'w_mace_2', materials: { fang: 10, bone: 4, skin: 4 }, reqLevel: 2 },
        { id: 'craft_staff_2', result: 'w_staff_2', materials: { fang: 5, bone: 7, skin: 7 }, reqLevel: 2 },
        { id: 'craft_sword_2', result: 'w_sword_2', materials: { fang: 7, bone: 6, skin: 6 }, reqLevel: 2 },
        { id: 'craft_chain', result: 'a_chain_1', materials: { fang: 10, bone: 5, skin: 8 }, reqLevel: 2 },
        { id: 'craft_ring_2', result: 'acc_ring_2', materials: { fang: 6, bone: 6, skin: 6 }, reqLevel: 2 },
        // Level 3 recipes
        { id: 'craft_axe_3', result: 'w_axe_3', materials: { claw: 12, fang: 8, eye: 3 }, reqLevel: 3 },
        { id: 'craft_bow_3', result: 'w_bow_3', materials: { claw: 10, fang: 10, eye: 3 }, reqLevel: 3 },
        { id: 'craft_mace_3', result: 'w_mace_3', materials: { claw: 15, fang: 6, eye: 4 }, reqLevel: 3 },
        { id: 'craft_staff_3', result: 'w_staff_3', materials: { claw: 8, fang: 12, eye: 4 }, reqLevel: 3 },
        { id: 'craft_sword_3', result: 'w_sword_3', materials: { claw: 11, fang: 9, eye: 4 }, reqLevel: 3 },
        { id: 'craft_plate', result: 'a_plate_1', materials: { claw: 15, fang: 10, eye: 5 }, reqLevel: 3 },
        { id: 'craft_ring_3', result: 'acc_ring_3', materials: { claw: 10, fang: 10, eye: 5 }, reqLevel: 3 },
        // Level 4 recipes
        { id: 'craft_axe_4', result: 'w_axe_4', materials: { eye: 20, claw: 15, essence: 8 }, reqLevel: 4 },
        { id: 'craft_bow_4', result: 'w_bow_4', materials: { eye: 18, claw: 18, essence: 8 }, reqLevel: 4 },
        { id: 'craft_mace_4', result: 'w_mace_4', materials: { eye: 25, claw: 12, essence: 10 }, reqLevel: 4 },
        { id: 'craft_staff_4', result: 'w_staff_4', materials: { eye: 15, claw: 20, essence: 10 }, reqLevel: 4 },
        { id: 'craft_sword_4', result: 'w_sword_4', materials: { eye: 20, claw: 15, essence: 10 }, reqLevel: 4 },
        { id: 'craft_magic', result: 'a_magic_1', materials: { eye: 25, claw: 15, essence: 12 }, reqLevel: 4 },
        { id: 'craft_ring_4', result: 'acc_ring_4', materials: { eye: 18, claw: 18, essence: 10 }, reqLevel: 4 },
        // Level 5 recipes
        { id: 'craft_axe_5', result: 'w_axe_5', materials: { soul: 25, essence: 15, crystal: 5 }, reqLevel: 5 },
        { id: 'craft_bow_5', result: 'w_bow_5', materials: { soul: 20, essence: 20, crystal: 5 }, reqLevel: 5 },
        { id: 'craft_mace_5', result: 'w_mace_5', materials: { soul: 30, essence: 12, crystal: 6 }, reqLevel: 5 },
        { id: 'craft_staff_5', result: 'w_staff_5', materials: { soul: 18, essence: 22, crystal: 6 }, reqLevel: 5 },
        { id: 'craft_sword_5', result: 'w_sword_5', materials: { soul: 25, essence: 18, crystal: 6 }, reqLevel: 5 },
        { id: 'craft_divine', result: 'a_divine_1', materials: { soul: 30, essence: 20, crystal: 8 }, reqLevel: 5 },
        { id: 'craft_ring_5', result: 'acc_ring_5', materials: { soul: 22, essence: 22, crystal: 8 }, reqLevel: 5 }
    ],

    /* ===== THÚ CƯỠI ===== */
    petTiers: [
        { id: 'B', name: 'Loại B', color: '#3b82f6', dropChance: 0.6 },
        { id: 'A', name: 'Loại A', color: '#a855f7', dropChance: 0.3 },
        { id: 'S', name: 'Loại S', color: '#f59e0b', dropChance: 0.1 }
    ],

    pets: [
        { id: 'wolf_pet', name: 'Sói Đỏ', icon: '🐺', tier: 'B', bonusType: 'atk', bonusVal: 3, bonusDesc: '+3 ATK' },
        { id: 'bear_pet', name: 'Gấu Nâu', icon: '🐻', tier: 'B', bonusType: 'hp', bonusVal: 30, bonusDesc: '+30 HP' },
        { id: 'deer_pet', name: 'Nai Vàng', icon: '🦌', tier: 'B', bonusType: 'atkSpd', bonusVal: 0.1, bonusDesc: '+0.1 Tốc Đánh' },
        { id: 'hawk_pet', name: 'Ưng', icon: '🦅', tier: 'B', bonusType: 'crit', bonusVal: 3, bonusDesc: '+3% Chí Mạng' },
        { id: 'panther_pet', name: 'Báo Đen', icon: '🐆', tier: 'A', bonusType: 'evasion', bonusVal: 5, bonusDesc: '+5% Né Tránh' },
        { id: 'lion_pet', name: 'Sư Tử', icon: '🦁', tier: 'A', bonusType: 'atk', bonusVal: 8, bonusDesc: '+8 ATK' },
        { id: 'eagle_pet', name: 'Đại Bàng', icon: '🦅', tier: 'A', bonusType: 'crit', bonusVal: 8, bonusDesc: '+8% Chí Mạng' },
        { id: 'unicorn_pet', name: 'Kỳ Lân', icon: '🦄', tier: 'A', bonusType: 'def', bonusVal: 8, bonusDesc: '+8 DEF' },
        { id: 'dragon_pet', name: 'Rồng Con', icon: '🐲', tier: 'S', bonusType: 'atk', bonusVal: 15, bonusDesc: '+15 ATK' },
        { id: 'phoenix_pet', name: 'Phượng Hoàng', icon: '🔥', tier: 'S', bonusType: 'hp', bonusVal: 100, bonusDesc: '+100 HP, Hồi sinh 1 lần' },
        { id: 'shadow_pet', name: 'Bóng Ma', icon: '👻', tier: 'S', bonusType: 'crit', bonusVal: 15, bonusDesc: '+15% Chí Mạng' },
        { id: 'divine_pet', name: 'Thần Thú', icon: '⭐', tier: 'S', bonusType: 'all', bonusVal: 10, bonusDesc: '+10 Tất Cả Chỉ Số' }
    ],

    /* ===== CỬA HÀNG ===== */
    shopItems: [
        { id: 'buy_horn', name: 'Mua Sừng Boss', desc: 'Triệu hồi Boss', price: 200, currency: 'gold', gives: { item: 'horn', qty: 1 } },
        { id: 'buy_potion', name: 'Mua Thuốc HP', desc: 'Hồi 30% HP', price: 15, currency: 'gold', gives: { item: 'potion_hp', qty: 5 } },
        { id: 'buy_food', name: 'Mua Thức Ăn', desc: 'Hồi 40% no', price: 10, currency: 'gold', gives: { item: 'potion_sat', qty: 5 } },
        { id: 'buy_refresh', name: 'Làm Mới Săn Thủ', desc: 'Làm mới ứng viên', price: 50, currency: 'gold', gives: { special: 'refresh' } },
        { id: 'buy_gem_pack', name: 'Gói Ngọc', desc: '100 ngọc', price: 0, currency: 'real', gives: { gem: 100 } }
    ],

    /* ===== NHIỆM VỤ HÀNG NGÀY ===== */
    dailyQuests: [
        { id: 'dq_kill10', desc: 'Giết 10 quái vật', target: 10, rewardGold: 50, rewardGems: 0, type: 'kills' },
        { id: 'dq_kill50', desc: 'Giết 50 quái vật', target: 50, rewardGold: 200, rewardGems: 2, type: 'kills' },
        { id: 'dq_kill200', desc: 'Giết 200 quái vật', target: 200, rewardGold: 500, rewardGems: 5, type: 'kills' },
        { id: 'dq_gold200', desc: 'Kiếm 200 vàng', target: 200, rewardGold: 100, rewardGems: 1, type: 'gold_earned' },
        { id: 'dq_gold2000', desc: 'Kiếm 2000 vàng', target: 2000, rewardGold: 500, rewardGems: 3, type: 'gold_earned' },
        { id: 'dq_craft2', desc: 'Rèn 2 món đồ', target: 2, rewardGold: 80, rewardGems: 1, type: 'crafted' },
        { id: 'dq_boss1', desc: 'Giết 1 Boss', target: 1, rewardGold: 300, rewardGems: 5, type: 'bosses' },
        { id: 'dq_dungeon1', desc: 'Hoàn thành 1 Địa Hạ', target: 1, rewardGold: 200, rewardGems: 3, type: 'dungeons' }
    ],

    /* ===== ĐIỂM DANH ===== */
    dailyRewards: [
        { day: 1, gold: 50, gems: 1 },
        { day: 2, gold: 80, gems: 1 },
        { day: 3, gold: 120, gems: 2 },
        { day: 4, gold: 150, gems: 2 },
        { day: 5, gold: 200, gems: 3 },
        { day: 6, gold: 250, gems: 3 },
        { day: 7, gold: 500, gems: 10, special: 'Sừng Boss x2' }
    ],

    /* ===== BẢNG KINH NGHIỆM ===== */
    expTable: (level) => Math.floor(50 * Math.pow(level, 1.5)),

    /* ===== TỐI ĐA LEVEL ===== */
    maxHunterLevel: 100,

    /* ===== THỜI GIAN ===== */
    hireInterval: 30000,       // 30s tạo ứng viên thuê
    tickRate: 1000,            // 1s game tick
    battleTickRate: 1500,      // 1.5s combat tick
    saveInterval: 30000        // 30s tự động lưu
};
