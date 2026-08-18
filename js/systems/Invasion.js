/**
 * TOWN OF HUNTERS - BLOOD MOON INVASION & GATE DEFENSE SYSTEM 2.0
 */

class InvasionSystem {
  static combatLogTimer = 0;

  static update(deltaSeconds) {
    const state = window.gameState;
    if (!state) return;

    state.threatTimer -= deltaSeconds;

    if (!state.isBloodMoon) {
      if (state.threatTimer <= 0) {
        InvasionSystem.triggerBloodMoon();
      }
    } else {
      // ACTIVE SIEGE BATTLE IN PROGRESS
      InvasionSystem.processSiegeBattle(deltaSeconds);

      if (state.threatTimer <= 0) {
        InvasionSystem.endBloodMoon();
      }
    }
  }

  static triggerBloodMoon() {
    const state = window.gameState;
    state.isBloodMoon = true;
    state.threatTimer = 45; // 45 seconds siege phase
    state.bloodMoonBreached = false;
    state.maxGateHp = state.getGateMaxHp ? state.getGateMaxHp() : 1000;
    state.gateHp = state.maxGateHp;
    InvasionSystem.combatLogTimer = 0;

    document.body.classList.add('blood-moon-active');

    window.logTicker.add(`🚨🚨 CẢNH BÁO: ĐÊM TRĂNG MÁU ĐÃ ĐẾN! QUÁI VẬT TẬP TRUNG TẤN CÔNG CỔNG LÀNG! 🚨🚨`, 'danger');
    if (window.showToast) {
      window.showToast(`QUÁI VẬT TẤN CÔNG CỔNG LÀNG! Bảo vệ Cổng Thành (Máu: ${state.maxGateHp})!`, 'warning', '🚨 ĐÊM TRĂNG MÁU');
    }

    // Mobilize all available living hunters to defend the gate
    state.hunters.forEach(h => {
      if (h.state !== 'DEAD') {
        h.changeState('FIGHTING', '🛡️ PHÒNG THỦ CỔNG LÀNG!');
      }
    });
  }

  static processSiegeBattle(deltaSeconds) {
    const state = window.gameState;
    if (!state.isBloodMoon) return;

    InvasionSystem.combatLogTimer += deltaSeconds;

    // 1. Calculate Invading Monster Siege Wave DPS
    const townLvl = state.townLevel || 1;
    const day = state.dayCount || 1;
    let wavePower = 40 + (townLvl * 28) + (day * 4);

    // Tech: Fortified Bastion reduces monster siege damage by 25%
    if (state.researched?.tech_fortified_bastion) {
      wavePower = Math.floor(wavePower * 0.75);
    }

    // 2. Calculate Total Defender Slaying Power (Living hunters ATK + Crit + Ballistas)
    const livingHunters = state.hunters.filter(h => h.state !== 'DEAD');
    const defenderCount = livingHunters.length;

    let totalAtk = 0;
    let totalDef = 0;

    // Tech: Ballista Towers auto-fire on invading monsters (+80 defense power)
    if (state.researched?.tech_ballista_towers) {
      totalAtk += 80;
    }

    livingHunters.forEach(h => {
      const hAtk = h.getTotalAtk ? h.getTotalAtk() : (h.atk || 10);
      const hDef = h.getTotalDef ? h.getTotalDef() : (h.def || 5);
      const critRate = h.getCritRate ? h.getCritRate() : 0.05;
      const critDmg = h.getCritDamage ? h.getCritDamage() : 1.5;
      
      const effectiveAtk = hAtk * (1 + (critRate * (critDmg - 1)));
      totalAtk += effectiveAtk;
      totalDef += hDef;

      // Small monster counter-attack on defenders (mitigated by hunter DEF)
      if (!state.bloodMoonBreached) {
        const counterDmg = Math.max(1, Math.floor((wavePower / Math.max(1, defenderCount * 2)) - (hDef * 0.15)));
        h.hp = Math.max(1, h.hp - (counterDmg * deltaSeconds * 0.35));
      }
    });

    // 3. Compute Net Siege Damage to Town Gate
    // If hunters are well geared, they annihilate the wave before it breaches the gate
    const mitigatedDmg = Math.max(0, wavePower - (totalAtk * 0.40));
    
    if (!state.bloodMoonBreached) {
      state.gateHp = Math.max(0, state.gateHp - (mitigatedDmg * deltaSeconds));

      if (state.gateHp <= 0) {
        state.gateHp = 0;
        state.bloodMoonBreached = true;
        window.logTicker.add(`💥 [VỠ CỔNG THÀNH]: Cổng làng bị quái vật công phá sập! Lũ quái vật tràn vào thị trấn!`, 'danger');
        if (window.showToast) {
          window.showToast(`Cổng làng đã bị phá vỡ! Quái vật đang cướp bóc thị trấn!`, 'danger', '💥 CỔNG THÀNH THẤT THỦ');
        }
      }
    }

    // 4. Periodic Battlefield Log Updates
    if (InvasionSystem.combatLogTimer >= 4.5) {
      InvasionSystem.combatLogTimer = 0;
      if (!state.bloodMoonBreached) {
        const gatePct = Math.round((state.gateHp / state.maxGateHp) * 100);
        const randHunter = livingHunters[Math.floor(Math.random() * livingHunters.length)];
        const hunterName = randHunter ? randHunter.name : "Thợ Săn";
        window.logTicker.add(`⚔️ [CỔNG THÀNH ${gatePct}%]: [${hunterName}] cùng đồng đội kiên cường chém quái bảo vệ cổng! (Sát thương chặn: ${Math.round(totalAtk)})`, 'combat');
      } else {
        window.logTicker.add(`⚠️ [XÂM LĂNG]: Quái vật đang cướp phá thị trấn trong lúc thợ săn dốc sức đẩy lùi!`, 'warning');
      }
    }
  }

  static endBloodMoon() {
    const state = window.gameState;
    state.isBloodMoon = false;
    state.threatTimer = state.threatMax || 300;
    document.body.classList.remove('blood-moon-active');

    const townLvl = state.townLevel || 1;

    if (!state.bloodMoonBreached) {
      // VICTORY: Gate Stood Strong!
      const gatePct = Math.round((state.gateHp / state.maxGateHp) * 100);

      if (gatePct >= 80) {
        // RANK SSS: Flawless Defense
        const goldReward = townLvl * 160 + 200;
        const gemsReward = 3;
        state.addGold(goldReward);
        state.gems = (state.gems || 0) + gemsReward;

        window.logTicker.add(`🏆 [PHÒNG THỦ HOÀN HẢO - HẠNG SSS]: Cổng thành còn nguyên vẹn (${gatePct}% Máu)! Thị trấn thưởng lớn (+${goldReward} GOLD, +${gemsReward} 💎 Ngọc)!`, 'special');
        if (window.showToast) {
          window.showToast(`Phòng thủ Xuất Sắc (${gatePct}% Máu Cổng)! Nhận +${goldReward} GOLD & +${gemsReward} 💎 Ngọc!`, 'success', '🏆 THỦ THÀNH HOÀN HẢO');
        }
      } else {
        // RANK S: Solid Victory
        const goldReward = townLvl * 100 + 100;
        const gemsReward = 2;
        state.addGold(goldReward);
        state.gems = (state.gems || 0) + gemsReward;

        window.logTicker.add(`✨ [PHÒNG THỦ THÀNH CÔNG]: Thị trấn kiên cường đứng vững (${gatePct}% Máu Cổng)! (+${goldReward} GOLD, +${gemsReward} 💎 Ngọc)`, 'loot');
        if (window.showToast) {
          window.showToast(`Bảo vệ cổng làng thành công! Nhận +${goldReward} GOLD & +${gemsReward} 💎 Ngọc!`, 'success', '✨ THỦ THÀNH THÀNH CÔNG');
        }
      }
    } else {
      // DEFEAT: Gate Was Breached
      const stolenGold = Math.min(state.gold || 0, Math.floor(townLvl * 100 + (state.gold || 0) * 0.08));
      if (stolenGold > 0) {
        state.spendGold(stolenGold);
      }

      window.logTicker.add(`💀 [THỦ THÀNH THẤT BẠI]: Cổng làng bị đánh sập! Quái vật cướp đi -${stolenGold} GOLD trong ngân khố! Hãy rèn đồ mạnh hơn cho thợ săn!`, 'danger');
      if (window.showToast) {
        window.showToast(`Cổng làng bị phá vỡ! Bị cướp mất 💰${stolenGold} GOLD!`, 'warning', '💀 THẤT BẠI THỦ THÀNH');
      }
    }

    // Restore Gate HP for peaceful period
    state.gateHp = state.maxGateHp;

    // Return hunters to normal state
    state.hunters.forEach(h => {
      if (h.state === 'FIGHTING') {
        h.changeState('HUNTING', 'Quay lại bãi săn sau trận thủ thành');
      }
    });
  }
}

window.InvasionSystem = InvasionSystem;
