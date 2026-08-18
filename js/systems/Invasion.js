/**
 * TOWN OF HUNTERS - BLOOD MOON INVASION SYSTEM
 */

class InvasionSystem {
  static update(deltaSeconds) {
    const state = window.gameState;
    state.threatTimer -= deltaSeconds;

    if (state.threatTimer <= 0) {
      if (!state.isBloodMoon) {
        InvasionSystem.triggerBloodMoon();
      } else {
        InvasionSystem.endBloodMoon();
      }
    }
  }

  static triggerBloodMoon() {
    const state = window.gameState;
    state.isBloodMoon = true;
    state.threatTimer = 45; // 45 seconds invasion phase
    document.body.classList.add('blood-moon-active');

    window.logTicker.add(`🚨🚨 CẢNH BÁO: ĐÊM TRĂNG MÁU ĐÃ ĐẾN! QUÁI VẬT TẤN CÔNG CỔNG LÀNG! 🚨🚨`, 'danger');
    if (window.soundFX) window.soundFX.playWarning();

    // Call all hunters to town defense
    state.hunters.forEach(h => {
      h.changeState('FIGHTING', '🛡️ PHÒNG THỦ CỔNG LÀNG!');
    });
  }

  static endBloodMoon() {
    const state = window.gameState;
    state.isBloodMoon = false;
    state.threatTimer = state.threatMax;
    document.body.classList.remove('blood-moon-active');

    const bonusReward = state.townLevel * 100;
    state.addGold(bonusReward);
    state.gems += 2; // Reward 2 Gems for surviving Blood Moon
    window.logTicker.add(`✨ TRĂNG MÁU ĐÃ QUA! Thị trấn kiên cường đứng vững! (+${bonusReward}g, +2 💎 Kim Cương thưởng phòng thủ)`, 'loot');
    if (window.soundFX) window.soundFX.playLevelUp();
  }
}

window.InvasionSystem = InvasionSystem;
