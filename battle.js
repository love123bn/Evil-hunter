/* ==========================================================
   BATTLE.JS - Hệ thống chiến đấu tự động
   Field combat, Boss fight, Dungeon
   ========================================================== */

Game.Battle = {

    /* ===== COMBAT TICK ===== */
    tick() {
        // Field combat
        this.fieldCombat();
        // Boss combat
        this.bossCombat();
    },

    /* ===== FIELD COMBAT ===== */
    fieldCombat() {
        const activeHunters = Game.state.hunters.filter(h => 
            h.alive && h.currentZone && h.satiety > 10 && h.mood > 10 && h.stamina > 10
        );

        if (activeHunters.length === 0) return;

        activeHunters.forEach(hunter => {
            const zone = GAME_DATA.zones.find(z => z.id === hunter.currentZone);
            if (!zone) return;

            // Kiểm tra vitals
            if (hunter.satiety <= 10 || hunter.mood <= 10 || hunter.stamina <= 10) {
                hunter.currentZone = null;
                Game.addLog('info', `😴 ${hunter.name} mệt mỏi, trở về thị trấn.`);
                return;
            }

            // Spawn quái ngẫu nhiên
            const monsterLv = Game.random(zone.monsterLvRange[0], zone.monsterLvRange[1]);
            const monster = this.spawnMonster(monsterLv);

            // Tính combat
            const result = this.resolveCombat(hunter, monster);
            
            if (result.won) {
                // Loot
                const goldDrop = Math.floor(zone.goldPerKill * (1 + monster.level * 0.1));
                Game.state.gold += goldDrop;
                Game.state.totalGoldEarned += goldDrop;
                Game.state.totalKills++;
                Game.Hunters.trackQuest('kills');
                Game.Hunters.trackQuest('gold_earned', goldDrop);

                // Materials
                if (Math.random() < zone.matDropChance) {
                    const possibleMats = GAME_DATA.materials.filter(m => 
                        m.zones.includes(hunter.currentZone)
                    );
                    if (possibleMats.length > 0) {
                        const mat = Game.pickRandom(possibleMats);
                        Game.Hunters.addMaterial(mat.id, 1);
                    }
                }

                // Rare drops (horns, items)
                if (Math.random() < 0.005) {
                    Game.Hunters.addItem('horn', 1);
                    Game.addLog('loot', `📯 ${hunter.name} tìm thấy Sừng Boss!`);
                }

                // Exp
                const exp = Math.floor(monster.expDrop * (1 + hunter.level * 0.05));
                Game.gainExp(hunter, exp);

                // Damage stats
                hunter.totalDamageDealt += result.damageDealt;
                hunter.totalKills++;

                // Vitals drain
                hunter.satiety -= Game.random(1, 3);
                hunter.mood -= Game.random(0, 2);
                hunter.stamina -= Game.random(1, 3);
            } else {
                // Take damage
                hunter.hp -= result.damageTaken;
                hunter.satiety -= Game.random(1, 2);
                hunter.mood -= Game.random(1, 3);
                hunter.stamina -= Game.random(2, 4);

                if (hunter.hp <= 0) {
                    hunter.hp = 0;
                    hunter.alive = false;
                    hunter.currentZone = null;
                    Game.addLog('damage', `💀 ${hunter.name} bị giết bởi ${monster.name}!`);
                    Game.notify(`💀 ${hunter.name} đã chết!`);
                }
            }
        });
    },

    /* ===== SPAWN QUÁI ===== */
    spawnMonster(level) {
        const types = GAME_DATA.monsterTypes;
        // Chọn type phù hợp với level
        const maxIndex = Math.min(types.length - 1, Math.floor(level / 5));
        const minIndex = Math.max(0, maxIndex - 2);
        const type = types[Game.random(minIndex, maxIndex)];

        const levelMulti = 1 + (level - 1) * 0.15;

        return {
            name: type.name,
            icon: type.icon,
            level: level,
            hp: Math.floor(type.baseHp * levelMulti),
            maxHp: Math.floor(type.baseHp * levelMulti),
            atk: Math.floor(type.baseAtk * levelMulti),
            def: Math.floor(type.baseDef * levelMulti),
            goldDrop: Math.floor(type.goldDrop * levelMulti),
            expDrop: Math.floor(type.expDrop * levelMulti)
        };
    },

    /* ===== TÍNH TOÁN COMBAT ===== */
    resolveCombat(hunter, monster) {
        const stats = Game.Hunters.getEffectiveStats(hunter);
        let hunterHp = hunter.hp;
        let monsterHp = monster.hp;
        let damageDealt = 0;
        let damageTaken = 0;
        let rounds = 0;
        const maxRounds = 20;

        while (hunterHp > 0 && monsterHp > 0 && rounds < maxRounds) {
            rounds++;

            // Hunter attack
            const hunterAtk = stats.atk + Game.random(-2, Math.floor(stats.atk * 0.1));
            const monsterDef = monster.def;
            let hunterDmg = Math.max(1, hunterAtk - monsterDef + Game.random(1, 3));
            
            // Crit
            if (Math.random() * 100 < stats.crit) {
                hunterDmg = Math.floor(hunterDmg * 1.8);
            }

            // Evasion (monster evade)
            if (Math.random() * 100 < 10) {
                hunterDmg = 0;
            }

            monsterHp -= hunterDmg;
            damageDealt += hunterDmg;

            if (monsterHp <= 0) break;

            // Monster attack
            const monsterAtk = monster.atk + Game.random(-1, Math.floor(monster.atk * 0.1));
            let monsterDmg = Math.max(1, monsterAtk - stats.def + Game.random(0, 2));
            
            // Hunter evasion
            if (Math.random() * 100 < stats.evasion) {
                monsterDmg = 0;
            }

            hunterHp -= monsterDmg;
            damageTaken += monsterDmg;
        }

        return {
            won: monsterHp <= 0,
            hunterHp,
            monsterHp,
            damageDealt,
            damageTaken
        };
    },

    /* ===== BOSS FIGHT ===== */
    currentBoss: null,
    bossAttackTimer: null,

    summonBoss(bossId) {
        if (Game.state.bossHorns < 1) {
            Game.notify('❌ Cần Sừng Boss!');
            return;
        }

        const bossData = GAME_DATA.bosses.find(b => b.id === bossId);
        if (!bossData) return;

        if (!Game.state.unlockedZones.includes(bossData.zone)) {
            Game.notify('❌ Khu vực boss chưa mở khóa!');
            return;
        }

        Game.state.bossHorns--;
        this.currentBoss = {
            ...bossData,
            currentHp: bossData.hp
        };

        Game.addLog('boss', `👹 BOSS ${bossData.name} Lv.${bossData.level} xuất hiện!`);
        Game.notify(`👹 BOSS ${bossData.name} xuất hiện!`);
        Game.UI.renderBossTab();

        // All town hunters join
        const hunters = Game.state.hunters.filter(h => h.alive && !h.currentZone);
        if (hunters.length === 0) {
            Game.notify('⚠️ Không có săn thủ nào ở thị trấn!');
            return;
        }

        hunters.forEach(h => {
            h.inBattle = true;
        });

        this.startBossCombat(hunters);
    },

    startBossCombat(hunters) {
        if (this.bossAttackTimer) clearInterval(this.bossAttackTimer);

        this.bossAttackTimer = setInterval(() => {
            if (!this.currentBoss || this.currentBoss.currentHp <= 0) {
                clearInterval(this.bossAttackTimer);
                return;
            }

            hunters.forEach(hunter => {
                if (!hunter.alive) return;

                const stats = Game.Hunters.getEffectiveStats(hunter);
                
                // Hunter attack boss
                let dmg = Math.max(1, stats.atk - this.currentBoss.def + Game.random(1, 5));
                if (Math.random() * 100 < stats.crit) dmg = Math.floor(dmg * 1.8);
                this.currentBoss.currentHp -= dmg;

                if (this.currentBoss.currentHp <= 0) {
                    this.bossDefeated();
                    return;
                }

                // Boss attack random hunter
                if (Math.random() < 0.3) {
                    let bossDmg = Math.max(1, this.currentBoss.atk - stats.def + Game.random(1, 3));
                    if (Math.random() * 100 < stats.evasion) bossDmg = 0;
                    hunter.hp -= bossDmg;
                    
                    if (hunter.hp <= 0) {
                        hunter.hp = 0;
                        hunter.alive = false;
                        hunter.currentZone = null;
                        Game.addLog('damage', `💀 ${hunter.name} bị BOSS giết!`);
                    }
                }
            });

            Game.UI.renderBossTab();
        }, 1000);
    },

    bossDefeated() {
        const boss = this.currentBoss;
        if (!boss) return;

        // Rewards
        Game.state.gold += boss.goldDrop;
        Game.state.totalGoldEarned += boss.goldDrop;
        Game.state.totalBossKills++;
        Game.Hunters.trackQuest('bosses');
        Game.Hunters.trackQuest('gold_earned', boss.goldDrop);

        // Materials
        for (let i = 0; i < Math.floor(boss.matDrop / 5); i++) {
            const possibleMats = GAME_DATA.materials.filter(m => 
                m.zones.includes(boss.zone)
            );
            if (possibleMats.length > 0) {
                const mat = Game.pickRandom(possibleMats);
                Game.Hunters.addMaterial(mat.id, Game.random(3, 8));
            }
        }

        // Boss drops
        Game.state.bossHorns += 1; // Guaranteed horn
        Game.state.gems += 2;

        // Exp for all hunters
        Game.state.hunters.filter(h => h.alive).forEach(h => {
            Game.gainExp(h, boss.expDrop);
        });

        // Chance for pet egg
        if (Math.random() < 0.3) {
            Game.state.gems += 1;
            Game.addLog('loot', `🥚 Nhận được Trứng Sáng!`);
        }

        Game.addLog('boss', `🏆 Đánh bại BOSS ${boss.name}! +${boss.goldDrop}💰 +${boss.matDrop}📦`);
        Game.notify(`🏆 Đánh bại BOSS! +${boss.goldDrop} vàng`);

        // End fight
        this.currentBoss = null;
        Game.state.hunters.forEach(h => {
            h.inBattle = false;
        });
        Game.UI.renderBossTab();
    },

    /* ===== DUNGEON ===== */
    startDungeon(dungeonId) {
        const dungeon = GAME_DATA.dungeons.find(d => d.id === dungeonId);
        if (!dungeon) return;

        // Find strongest hunter
        const hunter = Game.state.hunters
            .filter(h => h.alive && h.level >= dungeon.levelReq)
            .sort((a, b) => b.atk - a.atk)[0];

        if (!hunter) {
            Game.notify('❌ Không có săn thủ đủ cấp!');
            return;
        }

        Game.addLog('info', `🏚️ ${hunter.name} vào ${dungeon.name}...`);
        Game.notify(`🏚️ ${hunter.name} vào ${dungeon.name}`);

        // Simulate dungeon
        let success = true;
        for (let i = 0; i < dungeon.monsterCount; i++) {
            const monster = this.spawnMonster(Math.floor(hunter.level * dungeon.monsterLvMulti));
            const stats = Game.Hunters.getEffectiveStats(hunter);
            
            const hunterDmg = Math.max(1, stats.atk - monster.def) * 2;
            const monsterDmg = Math.max(1, monster.atk - stats.def);
            
            if (monsterDmg > hunter.hp * 0.3) {
                success = false;
                break;
            }
            hunter.hp -= monsterDmg;
        }

        if (success) {
            Game.state.gold += dungeon.rewardGold;
            Game.state.totalGoldEarned += dungeon.rewardGold;
            Game.state.totalDungeons++;
            Game.Hunters.trackQuest('dungeons');
            Game.Hunters.trackQuest('gold_earned', dungeon.rewardGold);
            Game.Hunters.addMaterial(Game.pickRandom(GAME_DATA.materials).id, dungeon.rewardMats);
            Game.gainExp(hunter, dungeon.rewardGold);

            // Item drop
            if (Math.random() < dungeon.rewardItemChance) {
                const rarity = Game.pickRandom(['sturdy', 'refined', 'powerful']);
                const possibleItems = [
                    ...GAME_DATA.weapons.filter(w => w.rarity === rarity),
                    ...GAME_DATA.armors.filter(a => a.rarity === rarity),
                    ...GAME_DATA.accessories.filter(a => a.rarity === rarity)
                ];
                if (possibleItems.length > 0) {
                    const item = Game.pickRandom(possibleItems);
                    Game.Hunters.addItem(item.id, 1);
                    Game.addLog('loot', `🎁 ${hunter.name} tìm thấy ${item.name}!`);
                }
            }

            Game.addLog('info', `✅ ${hunter.name} hoàn thành ${dungeon.name}! +${dungeon.rewardGold}💰`);
            Game.notify(`✅ Dungeon thành công! +${dungeon.rewardGold} vàng`);
        } else {
            Game.addLog('damage', `💀 ${hunter.name} thất bại trong ${dungeon.name}!`);
            Game.notify(`💀 ${hunter.name} thất bại!`);
        }
    }
};
