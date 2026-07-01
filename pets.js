/* ==========================================================
   PETS.JS - Hệ thống Thú Cưỡi
   Mở trứng, gắn pet, nâng cấp, bonus stats
   ========================================================== */

Game.Pets = {

    /* ===== MỞ TRỨNG SÁNG ===== */
    hatchEgg() {
        if (Game.state.gems < 1) {
            Game.notify('❌ Cần 1 💎 để mở trứng!');
            return;
        }

        Game.state.gems -= 1;

        // Random pet tier
        const rand = Math.random();
        let tier;
        if (rand < 0.1) tier = 'S';
        else if (rand < 0.4) tier = 'A';
        else tier = 'B';

        // Random pet trong tier
        const possiblePets = GAME_DATA.pets.filter(p => p.tier === tier);
        const petData = Game.pickRandom(possiblePets);

        // Tạo pet object
        const pet = {
            id: 'pet_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            dataId: petData.id,
            tier: tier,
            stars: 1,
            equippedBy: null
        };

        Game.state.pets.push(pet);

        // Show result
        const resultEl = document.getElementById('hatch-result');
        resultEl.classList.remove('hidden');
        resultEl.innerHTML = `
            <div class="boss-card" style="border-color: ${tier === 'S' ? '#f59e0b' : tier === 'A' ? '#a855f7' : '#3b82f6'}">
                <div style="font-size: 3rem">${petData.icon}</div>
                <div class="boss-name" style="color: ${tier === 'S' ? '#f59e0b' : tier === 'A' ? '#a855f7' : '#3b82f6'}">
                    ${petData.name}
                </div>
                <div class="boss-level">Loại ${tier} | ⭐ ${pet.stars} sao</div>
                <div class="boss-reward">${petData.bonusDesc}</div>
            </div>
        `;

        Game.addLog('loot', `🥚 Mở trứng: ${petData.name} (Loại ${tier})!`);
        Game.notify(`🥚 Nhận ${petData.name} Loại ${tier}!`);
        Game.UI.renderPetsTab();
    },

    /* ===== GẮN PET CHO HUNTER ===== */
    assignPet(hunterId) {
        this._assigningHunterId = hunterId;
        this._showPetList = true;
        Game.UI.renderPetEquipTab();
    },

    confirmAssignPet(petId) {
        const hunterId = this._assigningHunterId;
        if (!hunterId) return;

        const hunter = Game.state.hunters.find(h => h.id === hunterId);
        const pet = Game.state.pets.find(p => p.id === petId);
        if (!hunter || !pet) return;

        // Unassign old pet
        if (hunter.petId) {
            const oldPet = Game.state.pets.find(p => p.id === hunter.petId);
            if (oldPet) oldPet.equippedBy = null;
        }

        // Unassign pet from other hunter
        if (pet.equippedBy) {
            const otherHunter = Game.state.hunters.find(h => h.petId === petId);
            if (otherHunter) otherHunter.petId = null;
        }

        hunter.petId = petId;
        pet.equippedBy = hunterId;

        const petData = GAME_DATA.pets.find(p => p.id === pet.dataId);
        Game.notify(`🔗 Gắn ${petData.name} cho ${hunter.name}!`);
        this._showPetList = false;
        Game.UI.renderPetEquipTab();
    },

    closeAssign() {
        this._showPetList = false;
        this._assigningHunterId = null;
        Game.UI.renderPetEquipTab();
    },

    /* ===== NÂNG CẤP PET (NUÔI LÊN SAO) ===== */
    upgradePet(petId) {
        const pet = Game.state.pets.find(p => p.id === petId);
        if (!pet || pet.stars >= 5) return;

        const gemCost = pet.stars * 3;
        if (Game.state.gems < gemCost) {
            Game.notify(`❌ Cần ${gemCost} 💎`);
            return;
        }

        Game.state.gems -= gemCost;
        pet.stars++;
        const petData = GAME_DATA.pets.find(p => p.id === pet.dataId);
        Game.notify(`⭐ ${petData.name} lên ${pet.stars} sao!`);
        Game.UI.renderPetsTab();
    },

    /* ===== THU HỒI PET ===== */
    releasePet(petId) {
        const pet = Game.state.pets.find(p => p.id === petId);
        if (!pet) return;
        if (pet.equippedBy) {
            Game.notify('❌ Gỡ pet khỏi săn thủ trước!');
            return;
        }
        if (!confirm('Bạn có chắc muốn thu hồi thú cưỡi này?')) return;

        const idx = Game.state.pets.findIndex(p => p.id === petId);
        Game.state.pets.splice(idx, 1);
        Game.state.gems += 1;
        Game.notify('🗑️ Đã thu hồi pet, +1💎');
        Game.UI.renderPetsTab();
    }
};
