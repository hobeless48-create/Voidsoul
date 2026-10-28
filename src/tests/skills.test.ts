import { describe, it, expect } from 'vitest';
import { getDerivedStats, START_STATS } from '../skills_db';

describe('Skill Tree and Leveling Mechanics', () => {
  it('should correctly apply stat bonuses from unlocked talents for Warrior', () => {
    // Base Warrior
    const baseWarrior = {
      stats: { ...START_STATS.Warrior },
      class: 'Warrior' as const,
      level: 1,
      unlockedTalents: [],
    };
    const baseStats = getDerivedStats(baseWarrior);

    // Warrior with 'Iron Skin' (flatDamageReduction: 3) and 'Shield Strike Mastery' (STR: 5)
    const upgradedWarrior = {
      ...baseWarrior,
      unlockedTalents: ['war_t1_iron_skin', 'war_t2_power_strike'],
    };
    const upgradedStats = getDerivedStats(upgradedWarrior);

    // Check ATK bonus (Shield Strike Mastery adds 5 STR, which adds 5 to ATK for Warrior)
    expect(upgradedStats.atk).toBe(baseStats.atk + 5);
    
    // Check Iron Skin (+3 flatDamageReduction)
    expect(upgradedStats.flatDamageReduction).toBe((baseStats.flatDamageReduction || 0) + 3);
  });

  it('should apply passive percentage bonuses correctly for Warrior', () => {
    // Level 10 Warrior
    const warriorLvl10 = {
      stats: { ...START_STATS.Warrior },
      class: 'Warrior' as const,
      level: 10,
      unlockedTalents: [],
    };
    const statsLvl10 = getDerivedStats(warriorLvl10);

    // Add 'Juggernaut Step' (+10% Max HP)
    const juggernautWarrior = {
      ...warriorLvl10,
      unlockedTalents: ['war_t5_juggernaut'],
    };
    const juggernautStats = getDerivedStats(juggernautWarrior);

    // Max HP should be at least 10% higher than the base level 10 warrior
    expect(juggernautStats.maxHp).toBeGreaterThan(statsLvl10.maxHp);
    
    // The exact math in getDerivedStats: baseMaxHp * (1 + 0.10)
    expect(juggernautStats.maxHp).toBe(Math.floor(statsLvl10.maxHp * 1.10));
  });

  it('should correctly calculate scaling max HP and leveling stats', () => {
    const lvl1 = getDerivedStats({
      stats: { ...START_STATS.Mage },
      class: 'Mage',
      level: 1,
    });

    const lvl50 = getDerivedStats({
      stats: { ...START_STATS.Mage },
      class: 'Mage',
      level: 50,
    });

    expect(lvl50.maxHp).toBeGreaterThan(lvl1.maxHp);
    // Base HP for mage is around 35. Level 50 mage gets 49 * 4 HP = 196 + base.
    expect(lvl50.maxHp).toBeGreaterThan(200);
  });
});
