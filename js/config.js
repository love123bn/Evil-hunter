// ==================== CAU HINH GAME ====================

const RANK_DATA = {
  E: { color: '#999999', label: 'E', statMul: 0.5, spawnWeight: 40, townReq: 1 },
  D: { color: '#aaaaaa', label: 'D', statMul: 0.7, spawnWeight: 30, townReq: 1 },
  C: { color: '#66bb66', label: 'C', statMul: 1.0, spawnWeight: 20, townReq: 3 },
  B: { color: '#4488cc', label: 'B', statMul: 1.3, spawnWeight: 12, townReq: 5 },
  A: { color: '#aa66dd', label: 'A', statMul: 1.7, spawnWeight: 7, townReq: 8 },
  S: { color: '#ffaa22', label: 'S', statMul: 2.2, spawnWeight: 4, townReq: 12 },
  SS: { color: '#ff6644', label: 'SS', statMul: 2.8, spawnWeight: 2, townReq: 18 },
  SSS: { color: '#ff2222', label: 'SSS', statMul: 3.5, spawnWeight: 1, townReq: 25 }
};

const CLASS_DATA = [
  { id: 'KiemSi', name: 'Kiem Si', statFocus: 'strength', bonusStr: 3, bonusAgi: 1, bonusInt: 0, bonusStam: 2 },
  { id: 'CungThu', name: 'Cung Thu', statFocus: 'agility', bonusStr: 1, bonusAgi: 3, bonusInt: 1, bonusStam: 1 },
  { id: 'PhapSu', name: 'Phap Su', statFocus: 'intelligence', bonusStr: 0, bonusAgi: 1, bonusInt: 3, bonusStam: 2 },
  { id: 'HiepSi', name: 'Hiep Si', statFocus: 'stamina', bonusStr: 2, bonusAgi: 0, bonusInt: 1, bonusStam: 3 }
];

const MAP_DATA = [
  { id: 1, name: 'Rung Khoi Nguyen', reqAwaken: 0, huntTime: 60, goldMin: 5, goldMax: 15, expGain: 10,
    mat1Id: 'DaThu', mat1Name: 'Da Thu Thuong', mat1Qty: [1,3], mat2Id: 'TinhTheSoKhai', mat2Name: 'Tinh The So Khai', mat2Qty: [0,2] },
  { id: 2, name: 'Dam Lay Tu Than', reqAwaken: 1, huntTime: 120, goldMin: 15, goldMax: 40, expGain: 25,
    mat1Id: 'XuongQuy', mat1Name: 'Xuong Quy', mat1Qty: [1,3], mat2Id: 'TinhTheHuyenAo', mat2Name: 'Tinh The Huyen Ao', mat2Qty: [0,2] },
  { id: 3, name: 'Hoang Mac Vinh Hang', reqAwaken: 2, huntTime: 200, goldMin: 40, goldMax: 100, expGain: 50,
    mat1Id: 'ManhLinhHon', mat1Name: 'Manh Linh Hon', mat1Qty: [1,3], mat2Id: 'TinhTheHoangKim', mat2Name: 'Tinh The Hoang Kim', mat2Qty: [0,2] },
  { id: 4, name: 'Nui Lua Hon Mang', reqAwaken: 3, huntTime: 300, goldMin: 100, goldMax: 250, expGain: 100,
    mat1Id: 'HuyetLongTuy', mat1Name: 'Huyet Long Chi Tuy', mat1Qty: [1,3], mat2Id: 'TinhTheHonMang', mat2Name: 'Tinh The Hon Mang', mat2Qty: [0,2] },
  { id: 5, name: 'Vuc Sau Vo Tan', reqAwaken: 4, huntTime: 450, goldMin: 250, goldMax: 600, expGain: 200,
    mat1Id: 'TinhTheVinhHang', mat1Name: 'Tinh The Vinh Hang', mat1Qty: [1,3], mat2Id: 'ManhYChi', mat2Name: 'Manh Y Chi', mat2Qty: [0,2] }
];

const EQUIP_TYPES = [
  { id: 'weapon', name: 'Vu Khi', statName: 'Sat Thuong', baseStat: [5,50] },
  { id: 'armor', name: 'Giap', statName: 'Phong Thu', baseStat: [3,40] },
  { id: 'accessory', name: 'Phu Kien', statName: 'Toc Do', baseStat: [1,20] },
  { id: 'boots', name: 'Ung', statName: 'Toc Do + Ti Le Loot', baseStat: [1,15] }
];

const QUALITY_DATA = {
  Common: { color: '#ffffff', label: 'Thuong', bonusLines: 0, weight: 60 },
  Rare: { color: '#4488ff', label: 'Hiem', bonusLines: 1, weight: 25 },
  Epic: { color: '#aa44ff', label: 'Su Thi', bonusLines: 2, weight: 12 },
  Legendary: { color: '#ff8800', label: 'Huyen Thoai', bonusLines: 3, weight: 3 }
};

const BUILDING_DATA = [
  { id: 'hospital', name: 'Benh Vien', desc: 'Tho san nap tien de hoi the luc', maxLevel: 20, baseCost: 80, costMult: 1.25,
    effect: function(lvl) { return Math.max(2, 30 - lvl * 1.4); },
    effText: function(lvl) { return 'Hoi ' + Math.floor(15 + lvl * 3) + ' the luc/lan, phi ' + Math.floor(2 + 18/(1+lvl*0.3)) + ' vang'; } },
  { id: 'tavern', name: 'Quan Ruou', desc: 'Giai tri, tang tam trang (ton tien)', maxLevel: 20, baseCost: 100, costMult: 1.3,
    effect: function(lvl) { return Math.min(40, 5 + lvl * 1.75); },
    effText: function(lvl) { return '+' + Math.floor(15 + lvl * 2) + ' tam trang, ' + Math.floor(5 + lvl*1.75).toFixed(0) + '% xuat hien rank cao'; } },
  { id: 'inn', name: 'Nha Tro + Nha Hang', desc: 'Nha hang giam con doi, nha tro giu chan tho san', maxLevel: 20, baseCost: 90, costMult: 1.28,
    effect: function(lvl) { return Math.min(15, 2 + lvl * 0.65); },
    effText: function(lvl) { return 'An +' + Math.floor(35 + lvl * 3) + ' con doi, o lai ' + Math.min(15, 2 + lvl*0.65).toFixed(0) + ' ngay'; } },
  { id: 'workshop', name: 'Xuong Che Tao', desc: 'Giam nguyen lieu, tang pham chat', maxLevel: 20, baseCost: 120, costMult: 1.35,
    effect: function(lvl) { return Math.max(50, 100 - lvl * 2.5); },
    effText: function(lvl) { return 'Giam ' + (100 - Math.max(50, 100 - lvl*2.5)).toFixed(0) + '% nguyen lieu'; } },
  { id: 'market', name: 'Cho Trung Tam', desc: 'Gia ban cao hon, gia mua re hon', maxLevel: 20, baseCost: 150, costMult: 1.4,
    effect: function(lvl) { return 100 + lvl * 5; },
    effText: function(lvl) { return 'Gia x ' + ((100 + lvl*5)/100).toFixed(2); } },
  { id: 'taxOffice', name: 'Van Phong Thue', desc: 'Tang tran thue suat', maxLevel: 20, baseCost: 110, costMult: 1.32,
    effect: function(lvl) { return Math.min(40, 10 + lvl * 1.5); },
    effText: function(lvl) { return 'Thue toi da ' + Math.min(40, 10 + lvl*1.5).toFixed(0) + '%'; } },
  { id: 'warehouse', name: 'Kho Bai', desc: 'Tang suc chua nguyen lieu va trang bi', maxLevel: 20, baseCost: 70, costMult: 1.22,
    effect: function(lvl) { return { mat: 100 + lvl * 100, equip: 20 + lvl * 10 }; },
    effText: function(lvl) { var e = { mat: 100 + lvl*100, equip: 20 + lvl*10 }; return e.mat + ' NL / ' + e.equip + ' TB'; } }
];

const TOWN_LEVEL_REQS = [
  { level: 1, gold: 0, ranks: ['E','D'] },
  { level: 3, gold: 2000, ranks: ['E','D','C'] },
  { level: 5, gold: 5000, rankUnlock: 'B' },
  { level: 8, gold: 15000, rankUnlock: 'A' },
  { level: 12, gold: 50000, rankUnlock: 'S' },
  { level: 18, gold: 200000, rankUnlock: 'SS' },
  { level: 25, gold: 1000000, rankUnlock: 'SSS' }
];

const AWAKEN_COSTS = [
  { awaken: 1, gold: 500, mats: { TinhTheSoKhai: 10, DaThu: 5 } },
  { awaken: 2, gold: 2000, mats: { TinhTheHuyenAo: 10, XuongQuy: 5 } },
  { awaken: 3, gold: 10000, mats: { TinhTheHoangKim: 10, ManhLinhHon: 5 } },
  { awaken: 4, gold: 50000, mats: { TinhTheHonMang: 10, HuyetLongTuy: 5 } },
  { awaken: 5, gold: 250000, mats: { TinhTheVinhHang: 10, ManhYChi: 5 } }
];

const QUEST_TEMPLATES = [
  { id: 'sell', desc: function(n) { return 'Ban ' + n + ' trang bi cho tho san'; }, target: [3,5,8,10,15], rewardGold: [200,500,1000,2000,5000] },
  { id: 'tax', desc: function(n) { return 'Thu ' + n + ' vang thue'; }, target: [500,1500,3000,6000,15000], rewardGold: [100,300,600,1200,3000] },
  { id: 'craft', desc: function(n) { return 'Che tao ' + n + ' mon do'; }, target: [2,4,7,10,15], rewardGold: [150,400,800,1600,4000] },
  { id: 'buyMat', desc: function(n) { return 'Mua ' + n + ' nguyen lieu tu tho san'; }, target: [10,25,50,80,120], rewardGold: [100,250,500,1000,2500] },
  { id: 'upgrade', desc: function(n) { return 'Nang cap cong trinh ' + n + ' lan'; }, target: [1,3,5,8,12], rewardGold: [300,800,1500,3000,7500] },
  { id: 'merchant', desc: function(n) { return 'Giao dich voi thuong nhan ' + n + ' lan'; }, target: [1,2,3,5,7], rewardGold: [500,1200,2000,4000,10000] },
  { id: 'recruit', desc: function(n) { return 'Chieu mo ' + n + ' tho san'; }, target: [1,2,3,4,5], rewardGold: [250,600,1200,2500,6000] }
];

const HUNTER_NAMES = [
  'Anh', 'Binh', 'Cuong', 'Dung', 'Em', 'Phuong', 'Giang', 'Hai', 'Hanh', 'Hoa',
  'Huan', 'Hung', 'Khai', 'Khanh', 'Lan', 'Linh', 'Mai', 'Manh', 'Minh', 'My',
  'Nam', 'Nga', 'Nguyen', 'Nhung', 'Phuc', 'Quan', 'Quynh', 'Son', 'Tam', 'Thanh',
  'The', 'Thien', 'Thuy', 'Trang', 'Tuan', 'Tu', 'Tung', 'Uyen', 'Van', 'Viet',
  'Vy', 'Xuan', 'Yen', 'Hao', 'Hiep', 'Hoang', 'Khoa', 'Long', 'Nhat', 'Phong'
];
