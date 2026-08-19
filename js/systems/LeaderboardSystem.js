/**
 * LEADERBOARD SYSTEM - 1,000 REAL-TIME VIRTUAL RIVAL TOWNS
 */

class LeaderboardSystem {
  static TOTAL_RIVALS = 999;

  static generate1000Rivals() {
    const firstNames = [
      "Thanh", "Huyền", "Bạch", "Chu", "Minh", "Vô", "Lâm", "Hải", "Quang", "Bảo", 
      "Hoàng", "Tuấn", "Thiên", "Tiến", "Chí", "Mạnh", "Đức", "Trường", "Bá", "Quốc", 
      "Nhật", "Thái", "Long", "Phong", "Độc", "Kim", "Lôi", "Viêm", "Phi", "Bắc", 
      "Tử", "Vân", "Trọng", "Đăng", "Tấn", "Hữu", "Gia", "Triết", "Liệt", "Băng", 
      "Tuyết", "Ngọc", "Bích", "Linh", "Ánh", "Diệu", "Hồng", "Thục", "Mỹ", "Mai", 
      "Thu", "Cẩm", "Yến", "Mộng", "Khánh", "Phương", "Nguyệt", "Trúc", "Châu", "Diễm",
      "Arthur", "Thor", "Guts", "Merlin", "Ares", "Jack", "Bob", "Lancelot", "Shadow", "Ragnar", "Zephyr"
    ];

    const lastNames = [
      "Phong", "Vũ", "Hổ", "Tước", "Vương", "Cực", "Đăng", "Khải", "Long", "Nam", 
      "Kiệt", "Ân", "Hùng", "Dũng", "Kiên", "Trọng", "Giang", "Đạo", "Bảo", "Minh", 
      "Sơn", "Ẩn", "Báo", "Ca", "Vân", "Cô", "Cang", "Thần", "Đế", "Lang", 
      "Đẩu", "Trường", "Đạt", "Ước", "Khoa", "Tài", "Nghĩa", "Triết", "Triều", "Hỏa", 
      "Ma", "Mai", "Dao", "Nhi", "Nguyệt", "Hà", "Huyền", "Loan", "Quyên", "Duyên", 
      "Hoa", "Thảo", "Trâm", "Tú", "Ngân", "Vy", "Điệp", "Hân", "Tâm", "Linh", 
      "Ngọc", "Hạnh", "Tuyết", "Nga", "Thủy", "Trúc", "Lan", "Yến", "Thi", "Châu"
    ];

    const townPrefixes = [
      "Pháo Đài", "Thành Trì", "Thung Lũng", "Thánh Địa", "Thành Cổ", "Làng", "Trấn", 
      "Doanh Trại", "Vực Thẳm", "Thần Điện", "Đảo", "Sơn Trang", "Bạch Ngân", "Hắc Ám", 
      "Hoàng Kim", "Hư Không", "Ánh Sáng", "Rồng Lửa", "Băng Tuyết", "Gió Thần", 
      "Bất Tử", "Hải Tặc", "Yêu Tinh", "Cổ Thụ", "Tinh Vân", "Hỏa Long", "Lôi Điện", 
      "Vạn Kiếm", "Mặt Trời", "Bóng Đêm"
    ];

    const townSuffixes = [
      "Eldoria", "Valoria", "Asgard", "Camelot", "Titan", "Phong Vân", "Bắc Đẩu", 
      "Hắc Hổ", "Bạch Long", "Hư Không", "Thiên Ma", "Kim Cang", "Lạc Long", "Sơn Hà", 
      "Đại Ngàn", "Bất Diệt", "Hoàng Gia", "Vĩnh Hằng", "Sương Mù", "Khởi Nguyên", 
      "Bình Minh", "Hoàng Hôn", "Tinh Tú", "Thần Long", "Vương Giả", "Vô Cực", "Cuồng Ma"
    ];

    const avatars = ["👑", "⚔️", "🐉", "❄️", "🦁", "⚡", "🗡️", "🧙", "🧝‍♀️", "🏴‍☠️", "🔥", "🏹", "🛡️", "🥷", "🐅", "🎯", "🌲", "🔮", "🦅", "🐺", "🌟", "💀", "🌪️", "🗿", "⚓", "🏯", "🏰", "💎", "🌋", "🌌"];

    const titles = [
      "Bá Chủ Server", "Đệ Nhất Kiếm", "Chúa Tể Rồng", "Băng Tâm Chí Tôn", "Hiệp Sĩ Bàn Tròn", 
      "Lôi Thần", "Sát Ma Cuồng", "Đại Pháp Sư", "Tuyệt Kỹ Cung", "Vua Biển Cả", 
      "Hùng Bá Thiên Hạ", "Thần Xạ Thủ", "Hộ Vệ Hoàng Gia", "Sát Thủ Vô Danh", "Sư Tử Vàng", 
      "Cao Thủ Ẩn Danh", "Thợ Săn Rừng", "Chiến Tướng", "Tân Binh", "Học Việc"
    ];

    const rivals = [];
    for (let i = 0; i < this.TOTAL_RIVALS; i++) {
      const t = (this.TOTAL_RIVALS - i) / this.TOTAL_RIVALS; // 1.0 (top) down to 0.0 (bottom)
      
      // Smooth exponential power curve: top 1 ~ 480k-500k CP, down to bottom ~80-150 CP
      const basePower = Math.floor(80 + Math.pow(t, 3.6) * 470000 + Math.pow(t, 1.6) * 25000 + (Math.random() * 60));
      const growthRate = Number((0.005 + Math.pow(t, 2.5) * 1.5).toFixed(3));

      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      const tp = townPrefixes[Math.floor(Math.random() * townPrefixes.length)];
      const ts = townSuffixes[Math.floor(Math.random() * townSuffixes.length)];

      rivals.push({
        id: `r_${i + 1}`,
        mayor: `${fn} ${ln}`,
        town: `${tp} ${ts}`,
        basePower,
        currentPower: basePower,
        growthRate,
        avatar: avatars[Math.floor(Math.random() * avatars.length)],
        title: titles[Math.min(titles.length - 1, Math.floor((1 - t) * titles.length))],
        lastGrown: Date.now()
      });
    }

    // Explicit top 3 legends
    rivals[0].mayor = "Chúa Tể Hắc Ám";
    rivals[0].town = "Pháo Đài Hư Không";
    rivals[0].avatar = "👑";
    rivals[0].title = "Bá Chủ Server";
    rivals[0].basePower = 495000;
    rivals[0].currentPower = 495000;

    rivals[1].mayor = "Kiếm Ma Độc Cô";
    rivals[1].town = "Thần Kiếm Sơn Trang";
    rivals[1].avatar = "⚔️";
    rivals[1].title = "Đệ Nhất Kiếm Thánh";
    rivals[1].basePower = 380000;
    rivals[1].currentPower = 380000;

    rivals[2].mayor = "Long Vương Ares";
    rivals[2].town = "Thành Long Tộc";
    rivals[2].avatar = "🐉";
    rivals[2].title = "Chúa Tể Rồng";
    rivals[2].basePower = 290000;
    rivals[2].currentPower = 290000;

    return rivals;
  }

  static init() {
    if (!window.gameState.rivalsData || !Array.isArray(window.gameState.rivalsData) || window.gameState.rivalsData.length < 500) {
      window.gameState.rivalsData = this.generate1000Rivals();
    }
  }

  static update(deltaSeconds) {
    if (!window.gameState.rivalsData) this.init();

    // Smooth subtle power growth per simulation tick across rivals
    // Fast batch step for performance
    const rivals = window.gameState.rivalsData;
    const len = rivals.length;
    for (let i = 0; i < len; i++) {
      const r = rivals[i];
      const g = (r.growthRate || 0.05) * (0.85 + Math.random() * 0.3);
      r.currentPower = (r.currentPower || r.basePower) + (g * deltaSeconds);
    }
  }

  static getFullRankings() {
    if (!window.gameState.rivalsData) this.init();

    const playerPower = (window.gameState.hunters || []).reduce((sum, h) => sum + (h.getCombatPower ? h.getCombatPower() : 0), 0);
    const playerItem = {
      id: "player_town",
      isPlayer: true,
      mayor: "Bạn (Thị Trưởng)",
      town: window.gameState.townName || "Thị Trấn Của Bạn",
      currentPower: playerPower,
      avatar: "🌟",
      title: `Thị Trấn Cấp ${window.gameState.townLevel || 1}`
    };

    const combined = [...window.gameState.rivalsData, playerItem];
    combined.sort((a, b) => (b.currentPower || 0) - (a.currentPower || 0));

    const playerIndex = combined.findIndex(item => item.isPlayer);
    const playerRank = playerIndex + 1;
    const totalParticipants = combined.length; // 1,000 total

    // Only Top 100
    const top100List = combined.slice(0, 100);
    const cutoffPower = top100List[top100List.length - 1]?.currentPower || 0;
    const powerGapToTop100 = playerRank > 100 ? Math.max(0, Math.ceil(cutoffPower - playerPower + 1)) : 0;

    return {
      rankings: combined,
      top100List,
      playerRank,
      playerPower,
      playerIndex,
      cutoffPower,
      powerGapToTop100,
      totalParticipants
    };
  }
}

window.LeaderboardSystem = LeaderboardSystem;
