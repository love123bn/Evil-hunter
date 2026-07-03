// ============================================
// DATA.JS - Dinh nghia tat ca du lieu game
// ============================================

// -------- LOP HERO (Class) --------
const HERO_CLASSES = {
    berserker: {
        id: 'berserker',
        name: 'Chien Binh',
        moTa: 'Chien binh manh me, sat thuong cao',
        baseHp: 120,
        baseAtk: 15,
        baseDef: 8,
        baseCrit: 5,
        baseAtkSpd: 1.0,
        baseEvasion: 3,
        hpGrow: 12,
        atkGrow: 2.0,
        defGrow: 1.0,
        critGrow: 0.3,
        atkSpdGrow: 0.02,
        evasionGrow: 0.2
    },
    ranger: {
        id: 'ranger',
        name: 'Cung Thu',
        moTa: 'Xa thu tai ba, toc do cao',
        baseHp: 90,
        baseAtk: 12,
        baseDef: 5,
        baseCrit: 10,
        baseAtkSpd: 1.3,
        baseEvasion: 8,
        hpGrow: 9,
        atkGrow: 1.8,
        defGrow: 0.7,
        critGrow: 0.5,
        atkSpdGrow: 0.03,
        evasionGrow: 0.4
    },
    paladin: {
        id: 'paladin',
        name: 'Hiep Si',
        moTa: 'Khi gioi chong chiu, bao ve dong doi',
        baseHp: 180,
        baseAtk: 10,
        baseDef: 15,
        baseCrit: 3,
        baseAtkSpd: 0.8,
        baseEvasion: 2,
        hpGrow: 18,
        atkGrow: 1.5,
        defGrow: 2.0,
        critGrow: 0.2,
        atkSpdGrow: 0.01,
        evasionGrow: 0.1
    },
    sorcerer: {
        id: 'sorcerer',
        name: 'Phap Su',
        moTa: 'Thong thao phep thuat, sat thuong phep',
        baseHp: 80,
        baseAtk: 20,
        baseDef: 4,
        baseCrit: 8,
        baseAtkSpd: 0.9,
        baseEvasion: 4,
        hpGrow: 8,
        atkGrow: 2.5,
        defGrow: 0.5,
        critGrow: 0.4,
        atkSpdGrow: 0.02,
        evasionGrow: 0.3
    }
};

// -------- CAP BAC HERO (Tier) --------
const HERO_TIERS = [
    { id: 0, name: 'Thuong', color: '#aaaaaa', statMulti: 1.0, cost: 10 },
    { id: 1, name: 'Tot', color: '#55ff55', statMulti: 1.3, cost: 25 },
    { id: 2, name: 'Xuat Sac', color: '#55aaff', statMulti: 1.6, cost: 50 },
    { id: 3, name: 'Huyen Thoai', color: '#ffaa00', statMulti: 2.0, cost: 100 },
    { id: 4, name: 'Bat Tu', color: '#ff55ff', statMulti: 2.5, cost: 200 }
];

// -------- TINH CACH (Characteristics) --------
const CHARACTERISTICS = [
    { id: 'dungCam', name: 'Dung Cam', effect: 'atk', bonus: 10, loai: 'tot' },
    { id: 'ganhDo', name: 'Ganh Do', effect: 'def', bonus: 10, loai: 'tot' },
    { id: 'nhanhNhen', name: 'Nhanh Nhen', effect: 'evasion', bonus: 5, loai: 'tot' },
    { id: 'chinhXac', name: 'Chinh Xac', effect: 'crit', bonus: 5, loai: 'tot' },
    { id: 'khoeManh', name: 'Khoe Manh', effect: 'hp', bonus: 15, loai: 'tot' },
    { id: 'giauCo', name: 'Giau Co', effect: 'vang', bonus: 20, loai: 'tot' },
    { id: 'nhutNhat', name: 'Nhat Nhat', effect: 'atk', bonus: -5, loai: 'xau' },
    { id: 'hamHoc', name: 'Ham Hoc', effect: 'exp', bonus: 15, loai: 'tot' },
    { id: 'luyenTham', name: 'Lien Tham', effect: 'vang', bonus: -10, loai: 'xau' },
    { id: 'biBenh', name: 'Bi Benh', effect: 'hp', bonus: -10, loai: 'xau' },
    { id: 'thongThai', name: 'Thong Thai', effect: 'crit', bonus: 3, loai: 'tot' },
    { id: 'chamChap', name: 'Cham Chap', effect: 'atkSpd', bonus: -10, loai: 'xau' }
];

// -------- VAT LIEU / TAI NGUYEN --------
const RESOURCES = {
    wood: { id: 'wood', name: 'Go', giaBan: 2, moTa: 'Go tu rung' },
    stone: { id: 'stone', name: 'Da', giaBan: 3, moTa: 'Da tu mo' },
    iron: { id: 'iron', name: 'Sat', giaBan: 5, moTa: 'Sat tu hang dong' },
    herb: { id: 'herb', name: 'Thao Duoc', giaBan: 4, moTa: 'Cay thuoc quy' },
    leather: { id: 'leather', name: 'Da Thu', giaBan: 4, moTa: 'Da tu thu' },
    cloth: { id: 'cloth', name: 'Vai', giaBan: 3, moTa: 'Vai soi' },
    gem: { id: 'gem', name: 'Da Quy', giaBan: 15, moTa: 'Da quy hiem' },
    essence: { id: 'essence', name: 'Tinh Chat', giaBan: 20, moTa: 'Nang luong huyen bi' }
};

// -------- VAT PHAM CHE BIEN (Nhu yeu pham) --------
const NECESSITIES = {
    potion: { id: 'potion', name: 'Binh Mau', moTa: 'Hoi phuc 30HP', hoiPhucHp: 30, nguyenLieu: { herb: 2, cloth: 1 } },
    bandage: { id: 'bandage', name: 'Bang Got', moTa: 'Hoi phuc 20HP va cam mau', hoiPhucHp: 20, nguyenLieu: { cloth: 2, herb: 1 } },
    ration: { id: 'ration', name: 'Luong Kho', moTa: 'Hoi phuc suc luc', hoiPhucStamina: 20, nguyenLieu: { wood: 1, herb: 1 } },
    bait: { id: 'bait', name: 'Moi Nhanh', moTa: 'Tang luot san', nguyenLieu: { wood: 2, leather: 1 } }
};

// -------- TRANG BI (Equipment) --------
const EQUIPMENT_SLOTS = ['vuKhi', 'giap', 'mu', 'giay', 'nhan', 'bua'];

const EQUIPMENT_RARITY = [
    { id: 0, name: 'Thuong', color: '#aaaaaa', multi: 1.0 },
    { id: 1, name: 'Cao Cap', color: '#55ff55', multi: 1.4 },
    { id: 2, name: 'Huyen Thoai', color: '#ffaa00', multi: 1.8 },
    { id: 3, name: 'Thanh', color: '#ff55ff', multi: 2.3 }
];

const EQUIPMENT_TEMPLATES = {
    vuKhi: [
        { name: 'Kiem Sat', stat: 'atk', base: 5, nguyenLieu: { iron: 3, wood: 2 }, levelReq: 1 },
        { name: 'Kiem Dai', stat: 'atk', base: 12, nguyenLieu: { iron: 6, wood: 3, gem: 1 }, levelReq: 10 },
        { name: 'Riu Chien', stat: 'atk', base: 20, nguyenLieu: { iron: 10, wood: 5, gem: 2 }, levelReq: 25 },
        { name: 'Cung Dai', stat: 'atk', base: 8, nguyenLieu: { wood: 4, leather: 2 }, levelReq: 1 },
        { name: 'Cung Than', stat: 'atk', base: 18, nguyenLieu: { wood: 8, leather: 4, gem: 1 }, levelReq: 20 },
        { name: 'Phap Chuong', stat: 'atk', base: 10, nguyenLieu: { wood: 3, herb: 2, gem: 1 }, levelReq: 5 },
        { name: 'Truong Lao', stat: 'atk', base: 22, nguyenLieu: { wood: 7, gem: 3, essence: 1 }, levelReq: 30 },
        { name: 'Kiem Anh Sang', stat: 'atk', base: 30, nguyenLieu: { iron: 12, gem: 4, essence: 2 }, levelReq: 50 },
        { name: 'Cung Huy Diet', stat: 'atk', base: 35, nguyenLieu: { wood: 10, leather: 6, gem: 5, essence: 2 }, levelReq: 70 }
    ],
    giap: [
        { name: 'Giap Da', stat: 'def', base: 3, nguyenLieu: { leather: 3, cloth: 1 }, levelReq: 1 },
        { name: 'Giap Sat', stat: 'def', base: 8, nguyenLieu: { iron: 5, cloth: 2 }, levelReq: 10 },
        { name: 'Giap Xich', stat: 'def', base: 15, nguyenLieu: { iron: 8, leather: 3, gem: 1 }, levelReq: 25 },
        { name: 'Giap Than', stat: 'def', base: 22, nguyenLieu: { iron: 12, gem: 3, essence: 1 }, levelReq: 50 },
        { name: 'Giap Huy Long', stat: 'def', base: 30, nguyenLieu: { iron: 15, gem: 5, essence: 3 }, levelReq: 75 }
    ],
    mu: [
        { name: 'Mu Da', stat: 'def', base: 2, nguyenLieu: { leather: 2 }, levelReq: 1 },
        { name: 'Mu Sat', stat: 'def', base: 5, nguyenLieu: { iron: 3, cloth: 1 }, levelReq: 10 },
        { name: 'Mu Huy Hoang', stat: 'def', base: 10, nguyenLieu: { iron: 5, gem: 1 }, levelReq: 25 },
        { name: 'Mu Tri Tue', stat: 'def', base: 15, nguyenLieu: { iron: 7, gem: 2, essence: 1 }, levelReq: 50 }
    ],
    giay: [
        { name: 'Giay Da', stat: 'evasion', base: 2, nguyenLieu: { leather: 2, cloth: 1 }, levelReq: 1 },
        { name: 'Giay Toc Hanh', stat: 'evasion', base: 5, nguyenLieu: { leather: 4, cloth: 2 }, levelReq: 15 },
        { name: 'Giay Phong Van', stat: 'evasion', base: 8, nguyenLieu: { leather: 6, cloth: 3, gem: 1 }, levelReq: 35 },
        { name: 'Giay Than Toc', stat: 'evasion', base: 12, nguyenLieu: { leather: 8, cloth: 5, gem: 2 }, levelReq: 60 }
    ],
    nhan: [
        { name: 'Nhan Dong', stat: 'crit', base: 2, nguyenLieu: { iron: 2, gem: 1 }, levelReq: 5 },
        { name: 'Nhan Bac', stat: 'crit', base: 5, nguyenLieu: { iron: 4, gem: 2 }, levelReq: 20 },
        { name: 'Nhan Vang', stat: 'crit', base: 8, nguyenLieu: { iron: 6, gem: 4, essence: 1 }, levelReq: 40 },
        { name: 'Nhan Kim Cuong', stat: 'crit', base: 12, nguyenLieu: { iron: 8, gem: 6, essence: 2 }, levelReq: 65 }
    ],
    bua: [
        { name: 'Bua Ho Tro', stat: 'hp', base: 15, nguyenLieu: { herb: 3, cloth: 1 }, levelReq: 1 },
        { name: 'Bua Phong Ho', stat: 'hp', base: 30, nguyenLieu: { herb: 5, cloth: 2, gem: 1 }, levelReq: 15 },
        { name: 'Bua Thinh No', stat: 'hp', base: 50, nguyenLieu: { herb: 8, cloth: 4, gem: 2 }, levelReq: 35 },
        { name: 'Bua Bat Tu', stat: 'hp', base: 80, nguyenLieu: { herb: 12, cloth: 6, gem: 4, essence: 2 }, levelReq: 60 }
    ]
};

// -------- KHU SAN QUAI (Hunting Zones) --------
const HUNTING_ZONES = [
    {
        id: 0,
        name: 'Rung Khoi Dau',
        moTa: 'Khu rung nhe, quai vat yeu',
        levelMin: 1,
        levelMax: 30,
        unlockCost: 0,
        resources: ['wood', 'herb', 'cloth'],
        vangCoBan: 5,
        expCoBan: 10,
        quai: [
            { name: 'Slime Xanh', hp: 30, atk: 5, def: 2, exp: 8, vang: 3 },
            { name: 'Tho Rung', hp: 25, atk: 4, def: 1, exp: 6, vang: 2 },
            { name: 'Ma Lem', hp: 35, atk: 6, def: 3, exp: 10, vang: 4 }
        ]
    },
    {
        id: 1,
        name: 'Hang Dong Toi',
        moTa: 'Hang dong u am, quai vat nguy hiem',
        levelMin: 20,
        levelMax: 60,
        unlockCost: 200,
        resources: ['stone', 'iron', 'leather'],
        vangCoBan: 12,
        expCoBan: 25,
        quai: [
            { name: 'Doi Mau', hp: 60, atk: 12, def: 5, exp: 20, vang: 8 },
            { name: 'Ma Toc', hp: 70, atk: 15, def: 6, exp: 25, vang: 10 },
            { name: 'Quai Da', hp: 80, atk: 10, def: 10, exp: 22, vang: 9 },
            { name: 'Bong Toi', hp: 55, atk: 18, def: 4, exp: 28, vang: 12 }
        ]
    },
    {
        id: 2,
        name: 'Nui Lua Huyen Thoai',
        moTa: 'Nui lua nguy hiem, quai vat sieu manh',
        levelMin: 50,
        levelMax: 999,
        unlockCost: 800,
        resources: ['gem', 'essence', 'iron'],
        vangCoBan: 30,
        expCoBan: 60,
        quai: [
            { name: 'Rong Lua', hp: 150, atk: 25, def: 12, exp: 55, vang: 25 },
            { name: 'Quy Lua', hp: 130, atk: 30, def: 10, exp: 60, vang: 28 },
            { name: 'Bong Lua', hp: 110, atk: 35, def: 8, exp: 65, vang: 30 },
            { name: 'Chua Te Lua', hp: 180, atk: 28, def: 15, exp: 50, vang: 22 }
        ]
    }
];

// -------- TRAM CAP DO KHO --------
const DIFFICULTY_NAMES = ['De', 'Binh Thuong', 'Kho'];
const DIFFICULTY_MULTI = [1.0, 1.5, 2.0];

// -------- TOA NHA (Buildings) --------
const BUILDINGS = {
    binhVien: {
        id: 'binhVien',
        name: 'Benh Vien',
        moTa: 'Hoi phuc HP cho hero',
        baseEffect: 5,
        effectGrow: 3,
        baseCost: { gold: 50 },
        costGrow: { gold: 1.5 },
        maxLevel: 20
    },
    nhaHang: {
        id: 'nhaHang',
        name: 'Nha Hang',
        moTa: 'Hoi phuc suc luc cho hero',
        baseEffect: 5,
        effectGrow: 2,
        baseCost: { gold: 40 },
        costGrow: { gold: 1.5 },
        maxLevel: 20
    },
    quanRuou: {
        id: 'quanRuou',
        name: 'Quan Ruou',
        moTa: 'Hoi phuc tinh than cho hero',
        baseEffect: 5,
        effectGrow: 2,
        baseCost: { gold: 30 },
        costGrow: { gold: 1.4 },
        maxLevel: 20
    },
    nhaTro: {
        id: 'nhaTro',
        name: 'Nha Tro',
        moTa: 'Hoi phuc the luc cho hero nghi ngoi',
        baseEffect: 5,
        effectGrow: 3,
        baseCost: { gold: 60 },
        costGrow: { gold: 1.5 },
        maxLevel: 20
    },
    xuongRen: {
        id: 'xuongRen',
        name: 'Xuong Ren',
        moTa: 'Che tao trang bi cho hero',
        baseEffect: 1,
        effectGrow: 0,
        baseCost: { gold: 100 },
        costGrow: { gold: 1.6 },
        maxLevel: 15
    },
    nhaTho: {
        id: 'nhaTho',
        name: 'Nha Tho Hoi Sinh',
        moTa: 'Hoi sinh hero da tu tran',
        baseEffect: 1,
        effectGrow: 0,
        baseCost: { gold: 80 },
        costGrow: { gold: 1.5 },
        maxLevel: 10
    }
};

// -------- BOSS --------
const BOSSES = [
    {
        id: 0,
        name: 'Quy Vuong Nho',
        moTa: 'Quy vuong cap thap, thich hop cho nguoi moi',
        levelReq: 10,
        hp: 500,
        atk: 20,
        def: 10,
        vangThuong: 100,
        vatPham: ['kiemSat', 'giapDa'],
        expThuong: 50,
        tileRoi: 0.3
    },
    {
        id: 1,
        name: 'Rong Lua',
        moTa: 'Rong lua hung du, can doi moi manh co the danh bai',
        levelReq: 30,
        hp: 1500,
        atk: 40,
        def: 20,
        vangThuong: 300,
        vatPham: ['kiemDai', 'giapSat'],
        expThuong: 150,
        tileRoi: 0.25
    },
    {
        id: 2,
        name: 'Chua Te Bong Toi',
        moTa: 'Chua te bong toi, thu thach cuoi cung',
        levelReq: 60,
        hp: 4000,
        atk: 80,
        def: 40,
        vangThuong: 800,
        vatPham: ['kiemAnhSang', 'giapThan'],
        expThuong: 400,
        tileRoi: 0.2
    },
    {
        id: 3,
        name: 'Than Chet',
        moTa: 'Than chet huyen bi, ke huy diet moi thu',
        levelReq: 100,
        hp: 10000,
        atk: 150,
        def: 60,
        vangThuong: 2000,
        vatPham: ['truongLao', 'giapHuyLong'],
        expThuong: 1000,
        tileRoi: 0.15
    }
];

// -------- GIA CA THI TRUONG (Market Prices) --------
function getResourceBuyPrice(resourceId) {
    var prices = {
        wood: 3, stone: 4, iron: 7, herb: 5,
        leather: 5, cloth: 4, gem: 20, essence: 30
    };
    return prices[resourceId] || 5;
}

function getNecessitySellPrice(necId) {
    var prices = {
        potion: 8, bandage: 6, ration: 5, bait: 7
    };
    return prices[necId] || 5;
}
