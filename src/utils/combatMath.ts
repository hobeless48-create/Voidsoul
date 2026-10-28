import { Character, Enemy, TargetType } from "../types";
import { getDerivedStats } from "../skills_db";

export const applyPercentageDefense = (baseDmg: number, defenderDef: number, flatDR: number = 0, defenderUnit?: Character | Enemy): number => {
  const def = Math.max(0, defenderDef);
  const afterPct = Math.round(baseDmg * (100 / (100 + def)));
  let finalDmg = Math.max(1, afterPct - flatDR);
  
  if (defenderUnit && "unlockedTalents" in defenderUnit) {
    if (defenderUnit.unlockedTalents?.includes("war_t7_endure") && defenderUnit.hp < defenderUnit.maxHp * 0.35) {
      finalDmg = Math.max(1, Math.round(finalDmg * 0.7));
    }
  }
  
  return finalDmg;
};

export const getBaseDamage = (
  caster: Character,
  baseMult: number,
  targetType: TargetType,
): number => {
  const derived = getDerivedStats(caster);
  const typeFactor =
    targetType === TargetType.ALL_ENEMIES
      ? 0.9
      : targetType === TargetType.COLUMN
        ? 0.8
        : 1.0;
  return Math.round(derived.atk * baseMult * typeFactor);
};

export const getBaseHealing = (
  caster: Character,
  baseHeal: number,
  targetType: TargetType,
): number => {
  const hasHealBoost = caster.unlockedTalents?.includes("cle_t1_minor_heal");
  const healBoostMult = hasHealBoost ? 1.15 : 1.0;
  let raw = 0;
  if (targetType === TargetType.ALL_ALLIES) {
    raw = (8 + caster.stats.FTH * 0.8) * baseHeal * healBoostMult;
  } else {
    raw = (10 + caster.stats.FTH * 1.0) * baseHeal * healBoostMult;
  }
  return Math.round(raw);
};

export const getCritCalculation = (char: Character): number => {
  const derived = getDerivedStats(char);
  return derived.critDamage;
};

export const getUnitDodge = (unit: Character | Enemy): number => {
  const hasDodgeBuff = unit.statusEffects?.find(
    (eff) => eff.type === "dodge_up",
  );
  const buffVal = hasDodgeBuff ? hasDodgeBuff.value : 0;
  let finalDodge = 0;
  if ("stats" in unit) {
    finalDodge = getDerivedStats(unit as Character).dodgeChance + buffVal;
  } else {
    finalDodge = (unit as Enemy).dodgeChance + buffVal;
  }
  return Math.min(30, finalDodge);
};

export const getUnitAccuracy = (unit: Character | Enemy): number => {
  if ("stats" in unit) {
    return getDerivedStats(unit as Character).accuracy;
  } else {
    return (unit as Enemy).accuracy !== undefined ? (unit as Enemy).accuracy! : 95;
  }
};

export const getUnitDef = (unit: Character | Enemy): number => {
  if ("stats" in unit) {
    return getDerivedStats(unit as Character).def;
  } else {
    return (unit as Enemy).def;
  }
};
