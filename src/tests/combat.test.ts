import { describe, it, expect } from "vitest";
import { Character, Enemy } from "../types";
import { getDerivedStats } from "../skills_db";
import { applyPercentageDefense, getBaseDamage } from "../utils/combatMath";

// Helper for generating mock character
const mockChar = (overrides: Partial<Character> = {}): Character => ({
  id: "hero_1",
  name: "Hero",
  class: "Warrior",
  level: 1,
  xp: 0,
  hp: 100,
  maxHp: 100,
  energy: 3,
  maxEnergy: 5,
  stats: { STR: 10, DEX: 10, CON: 10, INT: 10, FTH: 10, CHA: 10, LCK: 10 },
  allocatedPoints: 0,
  unspentPoints: 0,
  equipment: {
    weapon: null, offhand: null, helmet: null, chestplate: null, leggings: null,
    boots: null, ring: null, bracelet: null, necklace: null, charm: null,
  },
  statusEffects: [],
  gridX: 1,
  gridY: 1,
  race: "Human",
  avatarUrl: "",
  unlockedTalents: [],
  ...overrides,
});

describe("Combat Math & Skill Formulas", () => {
  it("should calculate correct base damage for a Warrior", () => {
    const char = mockChar({ class: "Warrior", stats: { ...mockChar().stats, STR: 20 } });
    const dmg = getBaseDamage(char, 1.0, "SINGLE_ENEMY" as any);
    expect(dmg).toBeGreaterThan(15);
  });

  it("should apply 30% reduction from war_t7_endure when HP < 35%", () => {
    const defender = mockChar({
      class: "Warrior",
      unlockedTalents: ["war_t7_endure"],
      maxHp: 100,
      hp: 30 // below 35%
    });

    const baseDamage = 100;
    // Without armor, we just test the pure reduction
    const rawDamage = applyPercentageDefense(baseDamage, 0, 0, defender);
    // 30% reduction of 100 is 70
    expect(rawDamage).toBe(70);
  });

  it("should NOT apply war_t7_endure when HP >= 35%", () => {
    const defender = mockChar({
      class: "Warrior",
      unlockedTalents: ["war_t7_endure"],
      maxHp: 100,
      hp: 40 // above 35%
    });

    const baseDamage = 100;
    const rawDamage = applyPercentageDefense(baseDamage, 0, 0, defender);
    expect(rawDamage).toBe(100);
  });

  it("should calculate percentage defense correctly", () => {
    // 100 def means 100 / (100 + 100) = 50% damage taken
    const raw = applyPercentageDefense(200, 100, 0);
    expect(raw).toBe(100);

    // flat damage reduction
    const withFlat = applyPercentageDefense(200, 100, 20);
    expect(withFlat).toBe(80);
  });
});

describe("Race & Talent Integrations", () => {
  it("Dwarves gain 10% bonus Max HP", () => {
    const human = getDerivedStats(mockChar({ race: "Human", stats: { ...mockChar().stats, CON: 10 } }));
    const dwarf = getDerivedStats(mockChar({ race: "Dwarves", stats: { ...mockChar().stats, CON: 10 } }));
    expect(dwarf.maxHp).toBeGreaterThan(human.maxHp);
  });

  it("Succubus lose 20% Max HP but have innate Lifesteal (handled in battle)", () => {
    const human = getDerivedStats(mockChar({ race: "Human", stats: { ...mockChar().stats, CON: 10 } }));
    const succubus = getDerivedStats(mockChar({ race: "Succubus", stats: { ...mockChar().stats, CON: 10 } }));
    expect(succubus.maxHp).toBeLessThan(human.maxHp);
  });

  it("cle_t7_aura grants 10% bonus Max HP", () => {
    const noAura = getDerivedStats(mockChar({ unlockedTalents: [] }));
    const withAura = getDerivedStats(mockChar({ unlockedTalents: ["cle_t7_aura"] }));
    expect(withAura.maxHp).toBeGreaterThan(noAura.maxHp);
  });

  it("mag_t9_mastery grants 15% crit chance", () => {
    const noMastery = getDerivedStats(mockChar({ unlockedTalents: [] }));
    const withMastery = getDerivedStats(mockChar({ unlockedTalents: ["mag_t9_mastery"] }));
    expect(withMastery.critChance).toBe(noMastery.critChance + 15);
  });
});
