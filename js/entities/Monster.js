class Monster {
  constructor(template, diffMultiplier = {}) {
    this.id = "m_" + Math.random().toString(36).substr(2, 9);
    this.templateId = template.id;
    
    // Golden Elite Monster Spawn Chance (8% rate)
    this.isElite = Math.random() < 0.08;
    this.name = this.isElite ? `👑✨ [Hoàng Kim] ${template.name}` : template.name;
    this.glyph = this.isElite ? `👑${template.glyph}` : template.glyph;
    
    const hpMul = (diffMultiplier.hpMul || 1.0) * (this.isElite ? 2.5 : 1.0);
    const atkMul = (diffMultiplier.atkMul || 1.0) * (this.isElite ? 1.3 : 1.0);
    const expMul = (diffMultiplier.expMul || 1.0) * (this.isElite ? 2.5 : 1.0);
    const dropMul = (diffMultiplier.dropMul || 1.0) * (this.isElite ? 2.0 : 1.0);

    this.maxHp = Math.floor(template.hp * hpMul);
    this.hp = this.maxHp;
    this.atk = Math.floor(template.atk * atkMul);
    this.def = Math.floor((template.def || 1) * (this.isElite ? 1.4 : 1.0));
    this.exp = Math.floor(template.exp * expMul);
    this.gold = Math.floor(template.gold * (this.isElite ? 5.0 : 1.0) * expMul);
    
    this.loot = template.loot;
    this.lootChance = Math.min(1.0, (template.lootChance || 0.5) * dropMul);

    // Visual coordinates
    this.x = Math.floor(Math.random() * 8) + 16;
    this.y = Math.floor(Math.random() * 4) + 1;
  }

  isAlive() {
    return this.hp > 0;
  }

  takeDamage(amt) {
    this.hp = Math.max(0, this.hp - amt);
    return this.hp <= 0;
  }
}

window.Monster = Monster;
