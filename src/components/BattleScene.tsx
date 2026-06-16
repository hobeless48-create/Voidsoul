/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Character,
  Enemy,
  Skill,
  TargetType,
  CombatLog,
  StatusEffect,
  ClassName,
  Item,
} from "../types";
import {
  BASE_SKILLS,
  ADVANCED_SKILLS,
  TIER3_SKILLS,
  getDerivedStats,
  CLASS_AVATARS,
  getBaseClass,
} from "../skills_db";
import { ITEMS_DATABASE } from "../items_db";
import { TALENT_TREES } from "../talents_db";
import { syncBridge } from "../utils/sync";
import {
  Swords,
  Eye,
  Shield,
  Sparkles,
  Plus,
  AlertCircle,
  Heart,
} from "lucide-react";

const isTier3Class = (cl: string): boolean => {
  return [
    "Warlord",
    "Paladin",
    "Hawkeye",
    "Storm Dancer",
    "Archmage",
    "Void Caller",
    "Seraph",
    "Crusader",
    "Phantom",
    "Blade Saint",
    "Herald of Glory",
    "Entropy Singer",
  ].includes(cl);
};

interface BattleSceneProps {
  party: Character[];
  enemies: Enemy[];
  onVictory: (
    survivingParty: Character[],
    loot: { gold: number; materials: { id: string; quantity: number }[] },
  ) => void;
  onDefeat: () => void;
  p2pMode: "solo" | "multiplayer";
  roomId: string;
  myPlayerId: string;
  chapter?: number;
  area?: number;
  onQuit?: () => void;
  onKickPlayer?: (playerId: string) => void;
}

export function BattleScene({
  party,
  enemies,
  onVictory,
  onDefeat,
  p2pMode,
  roomId,
  myPlayerId,
  chapter = 1,
  area = 0,
  onQuit,
  onKickPlayer,
}: BattleSceneProps) {
  // Combat State
  const [combatParty, setCombatParty] = useState<Character[]>(() => {
    const list: Character[] = JSON.parse(JSON.stringify(party));
    // Sort and compress gridX values sequentially starting from 1 to keep players side-by-side
    const sorted = [...list].sort((a, b) => a.gridX - b.gridX);
    return sorted.map((p, index) => ({
      ...p,
      maxEnergy: 7,
      energy: Math.min(p.energy, 7),
      gridX: index + 1,
    }));
  });
  const [combatEnemies, setCombatEnemies] = useState<Enemy[]>(() =>
    JSON.parse(JSON.stringify(enemies)),
  );
  const [round, setRound] = useState(1);
  const [initiativeOrder, setInitiativeOrder] = useState<string[]>([]);
  const [currentTurnIdx, setCurrentTurnIdx] = useState(0);
  const [combatLogs, setCombatLogs] = useState<CombatLog[]>([]);
  const [battleState, setBattleState] = useState<
    "ongoing" | "victory" | "defeat"
  >("ongoing");
  const [initiativeRolls, setInitiativeRolls] = useState<
    Record<string, number>
  >({});
  const [accumulatedGold, setAccumulatedGold] = useState(0);
  const [accumulatedMaterials, setAccumulatedMaterials] = useState<
    { id: string; quantity: number }[]
  >([]);

  // Tracks whether the current action was initiated by a player (for P2P sync)
  const wasPlayerActionRef = useRef(false);

  const getStageBgImage = (ch: number): string => {
    switch (ch) {
      case 1:
        return "https://static.vecteezy.com/system/resources/thumbnails/021/182/343/small/forest-nature-scene-for-cartoon-animation-vector.jpg";
      case 2:
        return "https://img.freepik.com/premium-photo/dungeon-interior-empty-background-3d-cartoon_1009902-10517.jpg";
      case 3:
        return "https://img.magnific.com/free-vector/volcano-eruption-landscape-with-active-volcanic-mountain-with-smoke-lightning-from-crater-cartoon-vector-illustration-prehistoric-landscape-with-rocky-hill-flowing-magma-steam-lava_107791-24398.jpg";
      case 4:
        return "https://static.vecteezy.com/system/resources/thumbnails/071/857/134/small/purple-cavernous-landscape-with-swirling-celestial-light-photo.jpeg";
      default:
        return "https://static.vecteezy.com/system/resources/thumbnails/021/182/343/small/forest-nature-scene-for-cartoon-animation-vector.jpg";
    }
  };

  const getGridTileBg = (hasUnit: boolean) => {
    if (hasUnit) return "bg-slate-900";
    switch (chapter) {
      case 1:
        return "bg-emerald-950/20 border-emerald-900/20 border-dashed text-emerald-800/40";
      case 2:
        return "bg-rose-950/20 border-rose-900/20 border-dashed text-rose-800/40";
      case 3:
        return "bg-orange-950/20 border-orange-900/20 border-dashed text-orange-800/40";
      case 4:
        return "bg-purple-950/20 border-purple-900/20 border-dashed text-purple-800/40";
      default:
        return "bg-slate-950/40 border-slate-800/40 border-dashed text-slate-650";
    }
  };

  const getEmptyTileDisplay = () => {
    switch (chapter) {
      case 1:
        return { emoji: "🌲", label: "woods" };
      case 2:
        return { emoji: "💀", label: "ashes" };
      case 3:
        return { emoji: "🔥", label: "volcanic" };
      case 4:
        return { emoji: "🌀", label: "void" };
      default:
        return { emoji: "🌲", label: "woods" };
    }
  };

  const getOuterBorderClass = () => {
    switch (chapter) {
      case 1:
        return "border-emerald-500/30 shadow-emerald-500/5";
      case 2:
        return "border-rose-500/30 shadow-rose-500/5";
      case 3:
        return "border-orange-500/30 shadow-orange-500/5";
      case 4:
        return "border-purple-500/30 shadow-purple-500/5";
      default:
        return "border-amber-500/20";
    }
  };

  // Selection states
  const [selectedAction, setSelectedAction] = useState<
    "fight" | "items" | "focus" | null
  >(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  // Bolt Slinger Multi-hit state
  const [multiHitTargets, setMultiHitTargets] = useState<string[]>([]);
  const [multiHitCountLeft, setMultiHitCountLeft] = useState(0);

  const [hoveredUnitId, setHoveredUnitId] = useState<string | null>(null);
  const [infoUnit, setInfoUnit] = useState<Character | Enemy | null>(null);

  // Combat Helpers for accuracy, dodge, and def
  const getUnitDodge = (unit: Character | Enemy): number => {
    const hasDodgeBuff = unit.statusEffects.find(
      (eff) => eff.type === "dodge_up",
    );
    const buffVal = hasDodgeBuff ? hasDodgeBuff.value : 0;
    let finalDodge = 0;
    if ("stats" in unit) {
      finalDodge = getDerivedStats(unit).dodgeChance + buffVal;
    } else {
      finalDodge = unit.dodgeChance + buffVal;
    }
    return Math.min(30, finalDodge);
  };

  const getUnitAccuracy = (unit: Character | Enemy): number => {
    if ("stats" in unit) {
      return getDerivedStats(unit).accuracy;
    } else {
      return unit.accuracy !== undefined ? unit.accuracy : 95;
    }
  };

  const getUnitDef = (unit: Character | Enemy): number => {
    if ("stats" in unit) {
      return getDerivedStats(unit).def;
    } else {
      return unit.def;
    }
  };

  const getPrediction = () => {
    if (!hoveredUnitId || !activeTurn || activeTurn.type !== "player")
      return null;

    // Find target
    const target =
      combatEnemies.find((e) => e.id === hoveredUnitId) ||
      combatParty.find((p) => p.id === hoveredUnitId);
    if (!target || target.hp <= 0) return null;

    const caster = activeTurn.obj;
    const skills = getSkillsForCharacter(caster);
    // Use selectedSkill if active, otherwise fallback to default cost-0 skill
    const skill =
      selectedSkill || skills.find((s) => s.cost === 0) || skills[0];
    if (!skill) return null;

    const isEnemy = !("stats" in target);

    // Calculate Aggro Share if target is player character (ally)
    let aggroShare: number | undefined = undefined;
    if (!isEnemy) {
      const alivePlayers = combatParty.filter((p) => p.hp > 0);
      const getUnitAggro = (c: Character) => {
        let base = 20;
        if (["Warrior", "Knight", "Berserker"].includes(c.class)) base = 40;
        else if (
          [
            "Cleric",
            "High Priest",
            "Inquisitor",
            "Bard",
            "Bard of Valor",
            "Bard of Chaos",
          ].includes(c.class)
        )
          base = 25;
        let agg = base;
        if (["Warrior", "Knight", "Berserker"].includes(c.class))
          agg = Math.round(agg * 1.25);
        return agg;
      };
      const totalAggro = alivePlayers.reduce(
        (sum, p) => sum + getUnitAggro(p),
        0,
      );
      if (totalAggro > 0) {
        aggroShare = Math.round(
          (getUnitAggro(target as Character) / totalAggro) * 100,
        );
      }
    }

    // If healing/shielding skill on an ally
    if (skill.healingMultiplier || (skill.effect === "shield" && !isEnemy)) {
      let heal = 0;
      if (skill.healingMultiplier) {
        heal = getBaseHealing(
          caster,
          skill.healingMultiplier,
          skill.targetType,
        );
        // Apply healing received penalty (Fallen debuff)
        const targetFallen =
          "fallenStacks" in target ? target.fallenStacks || 0 : 0;
        heal = Math.round(heal * (1 - targetFallen * 0.25));
      }
      let shield = 0;
      if (skill.effect === "shield") {
        shield = skill.effectValue || 0;
        if (caster.class === "Warrior" || caster.class === "Knight") {
          shield = 15 + caster.stats.CON * 2;
        } else if (skill.id === "cle_shelter") {
          shield = 10 + caster.stats.FTH * 1.0;
        }
        // Apply shielding received penalty (Fallen debuff)
        const targetFallen =
          "fallenStacks" in target ? target.fallenStacks || 0 : 0;
        shield = Math.round(shield * (1 - targetFallen * 0.25));
      }
      return {
        type: "heal" as const,
        skillName: skill.name,
        targetName: target.name,
        heal,
        shield,
        hitChance: 100,
        aggroShare,
      };
    }

    // Otherwise, it's a damage prediction
    const baseMult = skill.damageMultiplier || 1.0;
    let dmgNormal = 0;
    if (skill.id === "bol_triple") {
      dmgNormal = 14 + caster.stats.DEX * 0.8;
    } else {
      dmgNormal = getBaseDamage(caster, baseMult, skill.targetType);
    }

    const targetDef = getUnitDef(target);
    // Apply damage dealt penalty (Fallen debuff on caster)
    const casterFallen = caster.fallenStacks || 0;
    const dmgMultiplier = 1 - casterFallen * 0.25;

    let dmgAfterDef = Math.max(1, dmgNormal - targetDef) * dmgMultiplier;

    const critDmgBonus = getCritCalculation(caster);
    const critChance = Math.min(
      80,
      5 + caster.stats.DEX * 0.4 + caster.stats.LCK * 0.5,
    );
    let dmgCritAfterDef =
      Math.max(1, dmgNormal * (critDmgBonus / 100) - targetDef) * dmgMultiplier;

    const minDmg = Math.round(dmgAfterDef * 0.9);
    const maxDmg = Math.round(dmgAfterDef * 1.1);
    const minCritDmg = Math.round(dmgCritAfterDef * 0.9);
    const maxCritDmg = Math.round(dmgCritAfterDef * 1.1);

    const casterAcc = getDerivedStats(caster).accuracy;
    const targetDodge = getUnitDodge(target);
    const hitChance = Math.max(5, Math.min(100, casterAcc - targetDodge));

    return {
      type: "damage" as const,
      skillName: skill.name,
      targetName: target.name,
      minDmg,
      maxDmg,
      minCritDmg,
      maxCritDmg,
      critChance,
      hitChance,
      targetDef,
      aggroShare,
    };
  };

  // Sync Broker over syncBridge
  useEffect(() => {
    if (p2pMode !== "multiplayer" || !roomId) return;

    const isHost = myPlayerId === party[0]?.id;

    syncBridge.init(roomId, `aac-combat-${roomId}`, (data) => {
      const { type, payload } = data;
      if (type === "SYNC_COMBAT_ACTION") {
        // Host accepts player actions from non-host (so host advances turn).
        // Non-host accepts authoritative state from host (fromHost: true).
        const accept = isHost
          ? payload.isPlayerAction === true  // host: only accept player actions
          : payload.fromHost === true;        // non-host: only accept host broadcasts
        if (!accept) return;

        setCombatParty(payload.party);
        setCombatEnemies(payload.enemies);
        setRound(payload.round);
        setInitiativeOrder(payload.initiativeOrder);
        setCurrentTurnIdx(payload.currentTurnIdx);
        setCombatLogs((prev) => [...prev, ...payload.logs]);
        setBattleState(payload.battleState);
        setInitiativeRolls(payload.initiativeRolls || {});
      }
    });

    return () => {
      // Cleanup is handled by syncBridge or on unmount
    };
  }, [p2pMode, roomId, myPlayerId, party]);

  // Broadcast out our combat state
  const broadcastCombatState = (
    updatedParty: Character[],
    updatedEnemies: Enemy[],
    nextRound: number,
    nextInitOrder: string[],
    nextIdx: number,
    newLogs: CombatLog[],
    stateCheck: "ongoing" | "victory" | "defeat",
    nextRolls: Record<string, number> = initiativeRolls,
    isPlayerAction: boolean = false,
  ) => {
    if (p2pMode === "multiplayer" && roomId) {
      const isHost = myPlayerId === party[0]?.id;
      syncBridge.send(`aac-combat-${roomId}`, {
        type: "SYNC_COMBAT_ACTION",
        payload: {
          fromHost: isHost,
          isPlayerAction,
          party: updatedParty,
          enemies: updatedEnemies,
          round: nextRound,
          initiativeOrder: nextInitOrder,
          currentTurnIdx: nextIdx,
          logs: newLogs,
          battleState: stateCheck,
          initiativeRolls: nextRolls,
        },
      });
    }
  };

  const addLog = (text: string, type: CombatLog["type"] = "info") => {
    const log: CombatLog = {
      id: "log_" + Date.now() + Math.random().toString(36).substr(2, 3),
      text,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };
    setCombatLogs((prev) => [...prev, log]);
    return [log];
  };

  // Turn startup roll: Initiative
  // BOTH host and non-host roll locally so the non-host isn't softlocked
  // if the initial broadcast doesn't arrive (WebSocket may not be open yet).
  // The host's broadcast will overwrite the non-host's roll once it arrives.
  useEffect(() => {
    rollAllInitiatives();
    const isHost = p2pMode === "solo" || myPlayerId === party[0]?.id;
    if (isHost) {
      addLog("⚔️ Battle started! High initiative acts first.", "system");
    } else {
      addLog("⚔️ Battle started! (syncing from host...)", "system");
    }
  }, []);

  const rollAllInitiatives = () => {
    const participants: { id: string; init: number }[] = [];
    const rolls: Record<string, number> = {};

    const hasBardInspire = combatParty.some((p) =>
      p.unlockedTalents?.includes("brd_t5_rally"),
    );
    combatParty.forEach((p) => {
      const { minInit, maxInit } = getDerivedStats(p);
      const baseMin = Math.max(4, minInit);
      const baseMax = Math.max(baseMin, maxInit);
      let rollVal =
        Math.floor(Math.random() * (baseMax - baseMin + 1)) + baseMin;

      const isSupportOrBard = [
        "Cleric",
        "High Priest",
        "Inquisitor",
        "Bard",
        "Bard of Valor",
        "Bard of Chaos",
      ].includes(p.class);
      if (isSupportOrBard) {
        rollVal += 3;
      }

      if (hasBardInspire) {
        rollVal += 5;
      }
      if (p.race === "Goblin") {
        rollVal += 1;
      }

      participants.push({ id: p.id, init: rollVal });
      rolls[p.id] = rollVal;
    });

    combatEnemies.forEach((e) => {
      const baseMin = 0;
      const baseMax = 10;
      const rollVal =
        Math.floor(Math.random() * (baseMax - baseMin + 1)) + baseMin;

      participants.push({ id: e.id, init: rollVal });
      rolls[e.id] = rollVal;
    });

    // Sort descending
    participants.sort((a, b) => b.init - a.init);
    setInitiativeOrder(participants.map((p) => p.id));
    setInitiativeRolls(rolls);
    setCurrentTurnIdx(0);

    // Broadcast initially rolled state
    broadcastCombatState(
      combatParty,
      combatEnemies,
      round,
      participants.map((p) => p.id),
      0,
      [],
      "ongoing",
      rolls,
    );
  };

  const getActiveTurnObject = () => {
    const id = initiativeOrder[currentTurnIdx];
    const ply = combatParty.find((p) => p.id === id);
    if (ply) return { type: "player" as const, obj: ply };
    const nmy = combatEnemies.find((e) => e.id === id);
    if (nmy) return { type: "enemy" as const, obj: nmy };
    return null;
  };

  const activeTurn = getActiveTurnObject();

  // Handle AI turn automatically
  // BOTH host and non-host run enemy AI locally so the battle can't softlock.
  // Broadcasts from either side overwrite the other, keeping state mostly in sync.
  useEffect(() => {
    if (
      activeTurn &&
      activeTurn.type === "enemy" &&
      battleState === "ongoing"
    ) {
      const timer = setTimeout(() => {
        executeEnemyAI(activeTurn.obj);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentTurnIdx, initiativeOrder]);

  const executeEnemyAI = (enemyParam: Enemy) => {
    // Check alive players first using original state
    const originalAliveCount = combatParty.filter((p) => p.hp > 0).length;
    if (originalAliveCount === 0) {
      setBattleState("defeat");
      onDefeat();
      return;
    }

    // 1. Deep clone state arrays to avoid reference mutations
    const nextEnemies = combatEnemies.map((e) => ({
      ...e,
      statusEffects: e.statusEffects.map((se) => ({ ...se })),
      skillCooldowns: e.skillCooldowns ? { ...e.skillCooldowns } : undefined,
      dropMaterials: e.dropMaterials ? [...e.dropMaterials] : [],
    }));
    const nextParty = combatParty.map((p) => ({
      ...p,
      stats: { ...p.stats },
      equipment: { ...p.equipment },
      statusEffects: p.statusEffects.map((se) => ({ ...se })),
      skillCooldowns: p.skillCooldowns ? { ...p.skillCooldowns } : undefined,
      inventory: p.inventory ? p.inventory.map((i) => ({ ...i })) : [],
    }));

    // 2. Resolve the active enemy and targets from cloned lists
    const enemy = nextEnemies.find((e) => e.id === enemyParam.id)!;
    const alivePlayers = nextParty.filter((p) => p.hp > 0);

    // Tick Status Effects on startup of enemy turn
    const { updatedEffects, burnDmg, poisonDmg, bleedDmg, regenHeal } =
      tickStatusEffects(enemy.statusEffects);

    // Tick skill cooldowns
    if (enemy.skillCooldowns) {
      const updatedCDS: Record<string, number> = {};
      Object.entries(enemy.skillCooldowns).forEach(([sId, cd]) => {
        const cdVal = cd as number;
        if (cdVal > 1) {
          updatedCDS[sId] = cdVal - 1;
        }
      });
      enemy.skillCooldowns = updatedCDS;
    }

    let finalEnemyHp = enemy.hp - (burnDmg + poisonDmg + bleedDmg);
    let pendingLogs: CombatLog[] = [];

    if (burnDmg > 0)
      pendingLogs = [
        ...pendingLogs,
        ...addLog(`🔥 ${enemy.name} takes ${burnDmg} Burn damage!`, "status"),
      ];
    if (poisonDmg > 0)
      pendingLogs = [
        ...pendingLogs,
        ...addLog(
          `🤢 ${enemy.name} takes ${poisonDmg} Poison damage!`,
          "status",
        ),
      ];
    if (bleedDmg > 0)
      pendingLogs = [
        ...pendingLogs,
        ...addLog(`🩸 ${enemy.name} bleeds for ${bleedDmg} damage!`, "status"),
      ];

    if (regenHeal > 0 && finalEnemyHp > 0) {
      const healAmt = Math.min(enemy.maxHp - finalEnemyHp, regenHeal);
      finalEnemyHp += healAmt;
      if (healAmt > 0) {
        pendingLogs = [
          ...pendingLogs,
          ...addLog(`💖 ${enemy.name} regenerates +${healAmt} HP!`, "heal"),
        ];
      }
    }

    enemy.hp = Math.max(0, finalEnemyHp);
    enemy.statusEffects = updatedEffects;

    if (enemy.hp <= 0) {
      pendingLogs = [
        ...pendingLogs,
        ...addLog(`☠️ ${enemy.name} succumbed to status ailments!`, "system"),
      ];
      const finalEnemies = nextEnemies.map((e) =>
        e.id === enemy.id ? enemy : e,
      );
      setCombatEnemies(finalEnemies);
      advanceTurn(finalEnemies, pendingLogs, nextParty);
      return;
    }

    // Check for Stun/Stagger skip turn
    const stunEffectIndex = enemy.statusEffects.findIndex(
      (eff) => eff.type === "stagger" || eff.type === "stun",
    );
    if (stunEffectIndex !== -1) {
      pendingLogs = [
        ...pendingLogs,
        ...addLog(
          `💤 ${enemy.name} is Stunned/Staggered and skips their turn!`,
          "status",
        ),
      ];

      const stunEff = enemy.statusEffects[stunEffectIndex];
      let nextEffects = [...enemy.statusEffects];
      if (stunEff.duration <= 1) {
        nextEffects.splice(stunEffectIndex, 1);
      } else {
        nextEffects[stunEffectIndex] = {
          ...stunEff,
          duration: stunEff.duration - 1,
        };
      }
      enemy.statusEffects = nextEffects;

      const updatedEnemies = nextEnemies.map((e) =>
        e.id === enemy.id ? enemy : e,
      );
      setCombatEnemies(updatedEnemies);
      advanceTurn(updatedEnemies, pendingLogs, nextParty);
      return;
    }

    // Determine target based on taunt or aggro weights
    const tauntedBy = enemy.statusEffects.find((eff) => eff.type === "taunt");
    let target = alivePlayers[0];

    if (tauntedBy) {
      const taunter = alivePlayers.find(
        (p) =>
          p.id === "player_war_id" ||
          p.class === "Warrior" ||
          p.class === "Knight",
      );
      if (taunter) target = taunter;
    } else {
      let totalAggro = 0;
      const playerAggros = alivePlayers.map((p) => {
        let baseAggro = 20;
        const cl = p.class;
        if (["Warrior", "Knight", "Berserker"].includes(cl)) {
          baseAggro = 40;
        } else if (
          [
            "Cleric",
            "High Priest",
            "Inquisitor",
            "Bard",
            "Bard of Valor",
            "Bard of Chaos",
          ].includes(cl)
        ) {
          baseAggro = 25;
        }

        let aggro = baseAggro;
        if (["Warrior", "Knight", "Berserker"].includes(cl)) {
          aggro = Math.round(aggro * 1.25);
        }
        totalAggro += aggro;
        return { player: p, aggro };
      });

      const roll = Math.random() * totalAggro;
      let currentSum = 0;
      for (const item of playerAggros) {
        currentSum += item.aggro;
        if (roll <= currentSum) {
          target = item.player;
          break;
        }
      }
    }

    // Now trigger custom active skills based on enemy roles
    const rollSkill = Math.random();

    if (enemy.aiType === "spellcaster" && rollSkill < 0.35) {
      // 35% chance to cast a magical debuff
      const debuffRoll = Math.random();
      let effectType: "poison" | "vulnerable" | "crippled";
      let skillName = "";
      let effectDesc = "";

      if (debuffRoll < 0.33) {
        effectType = "poison";
        skillName = enemy.name.includes("Mandrake")
          ? "Spore Puff"
          : enemy.name.includes("Imp")
            ? "Fiery Blast"
            : enemy.name.includes("Lich")
              ? "Death Plague"
              : enemy.name.includes("Necromancer")
                ? "Necrotic Plague"
                : "Toxic Cloud";
        effectDesc = "inflicting Poison DoT";
      } else if (debuffRoll < 0.66) {
        effectType = "vulnerable";
        skillName = enemy.name.includes("Lich")
          ? "Soul Siphon"
          : enemy.name.includes("Disciple")
            ? "Void Eruption"
            : enemy.name.includes("Succubus")
              ? "Abyssal Hex"
              : "Hex of Vulnerability";
        effectDesc = "inflicting Vulnerable (takes +50% dmg)";
      } else {
        effectType = "crippled";
        skillName = enemy.name.includes("Mandrake")
          ? "Mandrake Screech"
          : enemy.name.includes("Succubus")
            ? "Seductive Chord"
            : enemy.name.includes("Necromancer")
              ? "Curse of Weakness"
              : "Curse of Weakness";
        effectDesc = "inflicting Crippled (deals -25% dmg)";
      }

      pendingLogs = [
        ...pendingLogs,
        ...addLog(
          `🔮 ${enemy.name} casts [${skillName}] on ${target.name}!`,
          "system",
        ),
      ];

      const statsDerived = getDerivedStats(target);
      const targetDef = Math.round(statsDerived.def * 0.7); // magic ignores 30% DEF
      let baseDmg = Math.round(enemy.atk * 0.8);
      const randomFactor = 0.9 + Math.random() * 0.2;
      baseDmg = Math.round(baseDmg * randomFactor);

      // Attacker is Crippled check
      const enemyCrippled = enemy.statusEffects.some(
        (eff) => eff.type === "crippled",
      );
      if (enemyCrippled) {
        baseDmg = Math.round(baseDmg * 0.75);
      }

      let dmg = Math.max(1, baseDmg - targetDef);

      // Target is Vulnerable check
      const targetVulnerable = target.statusEffects.some(
        (eff) => eff.type === "vulnerable",
      );
      if (targetVulnerable) {
        dmg = Math.round(dmg * 1.5);
      }

      // Apply shield
      const shieldBuff = target.statusEffects.find(
        (eff) => eff.type === "shield",
      );
      if (shieldBuff && shieldBuff.value > 0) {
        if (shieldBuff.value >= dmg) {
          shieldBuff.value -= dmg;
          pendingLogs = [
            ...pendingLogs,
            ...addLog(
              `✨ Shield fully absorbed ${dmg} damage on ${target.name}!`,
              "status",
            ),
          ];
          dmg = 0;
        } else {
          dmg -= shieldBuff.value;
          pendingLogs = [
            ...pendingLogs,
            ...addLog(
              `✨ Shield broke! Absorbed ${shieldBuff.value} damage on ${target.name}!`,
              "status",
            ),
          ];
          shieldBuff.value = 0;
        }
      }

      if (dmg > 0) {
        target.hp = Math.max(0, target.hp - dmg);
        pendingLogs = [
          ...pendingLogs,
          ...addLog(
            `💥 [${skillName}] hits ${target.name} for ${dmg} magic damage!`,
            "damage",
          ),
        ];
      }

      let effVal = 10;
      if (effectType === "poison") {
        effVal = Math.max(4, Math.round(enemy.atk * 0.1));
      }
      target.statusEffects.push({
        type: effectType,
        value: effVal,
        duration: effectType === "poison" ? 3 : 2,
      });
      pendingLogs = [
        ...pendingLogs,
        ...addLog(
          `✨ ${target.name} is cursed with ${effectDesc} for ${effectType === "poison" ? 3 : 2} turns!`,
          "status",
        ),
      ];

      if (target.hp <= 0) {
        pendingLogs = [
          ...pendingLogs,
          ...addLog(
            `☠️ ${target.name} has been knocked unconscious!`,
            "system",
          ),
        ];
      }

      const updatedParty = nextParty.map((p) =>
        p.id === target.id ? target : p,
      );
      const updatedEnemies = nextEnemies.map((e) =>
        e.id === enemy.id ? enemy : e,
      );
      setCombatParty(updatedParty);
      setCombatEnemies(updatedEnemies);
      advanceTurn(updatedEnemies, pendingLogs, updatedParty);
      return;
    } else if (enemy.aiType === "tank" && rollSkill < 0.3) {
      // 30% chance to cast a self shield (Barrier block) and taunt player targets
      const shieldVal = Math.round(enemy.atk * 1.5);
      enemy.statusEffects.push({
        type: "shield",
        value: shieldVal,
        duration: 2,
      });

      let skillName = "Bulwark Stance";
      if (enemy.name.includes("Tortoise")) skillName = "Shell Retreat";
      else if (enemy.name.includes("Golem")) skillName = "Magma Barrier";
      else if (enemy.name.includes("Grave Sentry")) skillName = "Tomb Aegis";
      else if (enemy.name.includes("Gargoyle")) skillName = "Stone Form";

      pendingLogs = [
        ...pendingLogs,
        ...addLog(
          `🛡️ ${enemy.name} activates [${skillName}]! Gains a ${shieldVal} Shield and taunts!`,
          "status",
        ),
      ];

      const updatedEnemies = nextEnemies.map((e) =>
        e.id === enemy.id ? enemy : e,
      );
      setCombatEnemies(updatedEnemies);
      setCombatParty(nextParty);
      advanceTurn(updatedEnemies, pendingLogs, nextParty);
      return;
    } else if (enemy.aiType === "attacker" && rollSkill < 0.3) {
      // 30% chance to cast a special physical attack: Rent Flesh (bleed) or Pummeling Strike (heavy)
      const specialRoll = Math.random();

      if (specialRoll < 0.5) {
        // Bleed attack (Rent Flesh)
        let skillName = "Rent Flesh";
        if (enemy.name.includes("Hellhound")) skillName = "Flame Fangs";
        else if (enemy.name.includes("Timberwolf")) skillName = "Rabid Bite";
        else if (enemy.name.includes("Spider")) skillName = "Web Bind";
        else if (enemy.name.includes("Wraith")) skillName = "Soul Reap";
        else if (enemy.name.includes("Dread-Knight"))
          skillName = "Unholy Strike";

        pendingLogs = [
          ...pendingLogs,
          ...addLog(
            `⚔️ ${enemy.name} uses [${skillName}] on ${target.name}!`,
            "system",
          ),
        ];

        let baseDmg = enemy.atk;
        const randomFactor = 0.9 + Math.random() * 0.2;
        baseDmg = Math.round(baseDmg * randomFactor);

        // Attacker is Crippled check
        const enemyCrippled = enemy.statusEffects.some(
          (eff) => eff.type === "crippled",
        );
        if (enemyCrippled) {
          baseDmg = Math.round(baseDmg * 0.75);
        }

        const statsDerived = getDerivedStats(target);
        let dmg = Math.max(1, baseDmg - statsDerived.def);

        // Target is Vulnerable check
        const targetVulnerable = target.statusEffects.some(
          (eff) => eff.type === "vulnerable",
        );
        if (targetVulnerable) {
          dmg = Math.round(dmg * 1.5);
        }

        // Apply shield
        const shieldBuff = target.statusEffects.find(
          (eff) => eff.type === "shield",
        );
        if (shieldBuff && shieldBuff.value > 0) {
          if (shieldBuff.value >= dmg) {
            shieldBuff.value -= dmg;
            pendingLogs = [
              ...pendingLogs,
              ...addLog(
                `✨ Shield fully absorbed ${dmg} damage on ${target.name}!`,
                "status",
              ),
            ];
            dmg = 0;
          } else {
            dmg -= shieldBuff.value;
            pendingLogs = [
              ...pendingLogs,
              ...addLog(
                `✨ Shield broke! Absorbed ${shieldBuff.value} damage on ${target.name}!`,
                "status",
              ),
            ];
            shieldBuff.value = 0;
          }
        }

        if (dmg > 0) {
          target.hp = Math.max(0, target.hp - dmg);
          pendingLogs = [
            ...pendingLogs,
            ...addLog(
              `💥 [Rent Flesh] strikes ${target.name} for ${dmg} physical damage!`,
              "damage",
            ),
          ];
        }

        // Apply Bleed
        const bleedVal = Math.max(4, Math.round(enemy.atk * 0.1));
        target.statusEffects.push({
          type: "bleed",
          value: bleedVal,
          duration: 3,
        });
        pendingLogs = [
          ...pendingLogs,
          ...addLog(
            `🩸 ${target.name} is bleeding (takes ${bleedVal} damage/turn) for 3 turns!`,
            "status",
          ),
        ];

        if (target.hp <= 0) {
          pendingLogs = [
            ...pendingLogs,
            ...addLog(
              `☠️ ${target.name} has been knocked unconscious!`,
              "system",
            ),
          ];
        }

        const updatedEnemies = nextEnemies.map((e) =>
          e.id === enemy.id ? enemy : e,
        );
        const updatedParty = nextParty.map((p) =>
          p.id === target.id ? target : p,
        );
        setCombatParty(updatedParty);
        setCombatEnemies(updatedEnemies);
        advanceTurn(updatedEnemies, pendingLogs, updatedParty);
        return;
      } else {
        // Heavy Strike (Pummeling Strike) - 1.5x damage, ignores 40% target DEF
        let skillName = "Pummeling Strike";
        if (enemy.name.includes("Dread-Knight")) skillName = "Abyssal Pummel";
        else if (enemy.name.includes("Hellhound")) skillName = "Brutal Leap";
        else if (enemy.name.includes("Timberwolf")) skillName = "Pack Frenzy";

        pendingLogs = [
          ...pendingLogs,
          ...addLog(
            `⚔️ ${enemy.name} uses heavy [${skillName}] on ${target.name}!`,
            "system",
          ),
        ];

        let baseDmg = Math.round(enemy.atk * 1.5);
        const randomFactor = 0.9 + Math.random() * 0.2;
        baseDmg = Math.round(baseDmg * randomFactor);

        // Attacker is Crippled check
        const enemyCrippled = enemy.statusEffects.some(
          (eff) => eff.type === "crippled",
        );
        if (enemyCrippled) {
          baseDmg = Math.round(baseDmg * 0.75);
        }

        const statsDerived = getDerivedStats(target);
        const targetDef = Math.round(statsDerived.def * 0.6); // Ignores 40% DEF
        let dmg = Math.max(1, baseDmg - targetDef);

        // Target is Vulnerable check
        const targetVulnerable = target.statusEffects.some(
          (eff) => eff.type === "vulnerable",
        );
        if (targetVulnerable) {
          dmg = Math.round(dmg * 1.5);
        }

        // Apply shield
        const shieldBuff = target.statusEffects.find(
          (eff) => eff.type === "shield",
        );
        if (shieldBuff && shieldBuff.value > 0) {
          if (shieldBuff.value >= dmg) {
            shieldBuff.value -= dmg;
            pendingLogs = [
              ...pendingLogs,
              ...addLog(
                `✨ Shield fully absorbed ${dmg} damage on ${target.name}!`,
                "status",
              ),
            ];
            dmg = 0;
          } else {
            dmg -= shieldBuff.value;
            pendingLogs = [
              ...pendingLogs,
              ...addLog(
                `✨ Shield broke! Absorbed ${shieldBuff.value} damage on ${target.name}!`,
                "status",
              ),
            ];
            shieldBuff.value = 0;
          }
        }

        if (dmg > 0) {
          target.hp = Math.max(0, target.hp - dmg);
          pendingLogs = [
            ...pendingLogs,
            ...addLog(
              `💥 [Pummeling Strike] strikes ${target.name} heavily for ${dmg} physical damage!`,
              "damage",
            ),
          ];
        }

        if (target.hp <= 0) {
          pendingLogs = [
            ...pendingLogs,
            ...addLog(
              `☠️ ${target.name} has been knocked unconscious!`,
              "system",
            ),
          ];
        }

        const updatedEnemies = nextEnemies.map((e) =>
          e.id === enemy.id ? enemy : e,
        );
        const updatedParty = nextParty.map((p) =>
          p.id === target.id ? target : p,
        );
        setCombatParty(updatedParty);
        setCombatEnemies(updatedEnemies);
        advanceTurn(updatedEnemies, pendingLogs, updatedParty);
        return;
      }
    }

    // Special boss AI with phase mechanics
    if (enemy.aiType === "boss") {
      const hpPercent = enemy.hp / enemy.maxHp;
      const bossName = enemy.name;

      // Boss enrage at low HP
      const isEnraged = hpPercent < 0.30;
      const atkMultiplier = isEnraged ? 1.5 : 1.0;

      // Check for specific boss names and add phase behavior
      const isRyuJin = bossName.includes("Ryu Jin");
      const isLucifer = bossName.includes("Lucifer");
      const isSlaad = bossName.includes("Slaad");
      const isVerath = bossName.includes("Verath");

      // Phase 2 trigger at 90% HP for Ryu Jin
      if (isRyuJin && hpPercent < 0.90 && hpPercent > 0.50 && Math.random() < 0.35) {
        // Ryu Jin phase 2: Sky Dragon's Wrath - AoE attack
        let skillName = "Sky Dragon's Wrath";
        pendingLogs = [
          ...pendingLogs,
          ...addLog(`🐉 ${enemy.name} roars and unleashes [${skillName}]!`, "system"),
        ];

        alivePlayers.forEach((p) => {
          let baseDmg = Math.round(enemy.atk * 1.2 * atkMultiplier);
          const randomFactor = 0.9 + Math.random() * 0.2;
          baseDmg = Math.round(baseDmg * randomFactor);
          const statsDerived = getDerivedStats(p);
          let dmg = Math.max(1, baseDmg - Math.round(statsDerived.def * 0.5));

          // Apply shield
          const shieldBuff = p.statusEffects.find((eff) => eff.type === "shield");
          if (shieldBuff && shieldBuff.value > 0) {
            if (shieldBuff.value >= dmg) {
              shieldBuff.value -= dmg;
              dmg = 0;
            } else {
              dmg -= shieldBuff.value;
              shieldBuff.value = 0;
            }
          }

          if (dmg > 0) {
            p.hp = Math.max(0, p.hp - dmg);
            pendingLogs = [
              ...pendingLogs,
              ...addLog(`💥 ${p.name} takes ${dmg} damage from Sky Dragon's Wrath!`, "damage"),
            ];
          }
        });

        // Apply daze to all players
        alivePlayers.forEach((p) => {
          if (p.hp > 0) {
            p.statusEffects.push({ type: "stagger" as any, value: 1, duration: 1 });
          }
        });
        pendingLogs = [
          ...pendingLogs,
          ...addLog(`🌀 All players are dazed by the dragon's roar!`, "status"),
        ];

        const updatedEnemies = nextEnemies.map((e) => (e.id === enemy.id ? enemy : e));
        setCombatEnemies(updatedEnemies);
        setCombatParty(nextParty);
        advanceTurn(updatedEnemies, pendingLogs, nextParty);
        return;
      }

      // Ryu Jin phase 3 below 50% HP
      if (isRyuJin && hpPercent < 0.50 && Math.random() < 0.4) {
        let skillName = "Temporal Storm";
        pendingLogs = [
          ...pendingLogs,
          ...addLog(`🌀 ${enemy.name} casts [${skillName}]! Time itself bends!`, "system"),
        ];

        // Single target massive damage + confusion
        let baseDmg = Math.round(enemy.atk * 2.0 * atkMultiplier);
        const randomFactor = 0.9 + Math.random() * 0.2;
        baseDmg = Math.round(baseDmg * randomFactor);
        const statsDerived = getDerivedStats(target);
        let dmg = Math.max(1, baseDmg - Math.round(statsDerived.def * 0.3));

        // Apply shield
        const shieldBuff = target.statusEffects.find((eff) => eff.type === "shield");
        if (shieldBuff && shieldBuff.value > 0) {
          if (shieldBuff.value >= dmg) {
            shieldBuff.value -= dmg;
            dmg = 0;
          } else {
            dmg -= shieldBuff.value;
            shieldBuff.value = 0;
          }
        }

        if (dmg > 0) {
          target.hp = Math.max(0, target.hp - dmg);
          pendingLogs = [
            ...pendingLogs,
            ...addLog(`💥 [Temporal Storm] hits ${target.name} for ${dmg} damage!`, "damage"),
          ];
        }

        if (target.hp > 0) {
          target.statusEffects.push({ type: "stagger" as any, value: 1, duration: 2 });
          pendingLogs = [...pendingLogs, ...addLog(`🌀 ${target.name} is disoriented!`, "status")];
        }

        const updatedEnemies = nextEnemies.map((e) => (e.id === enemy.id ? enemy : e));
        const updatedParty = nextParty.map((p) => (p.id === target.id ? target : p));
        setCombatEnemies(updatedEnemies);
        setCombatParty(updatedParty);
        advanceTurn(updatedEnemies, pendingLogs, updatedParty);
        return;
      }

      // Summon minion mechanic (25% chance, works for all bosses)
      if (
        Math.random() < 0.25 &&
        nextEnemies.filter((e) => e.hp > 0).length < 3
      ) {
        let minionName = "Summoned Skeletal Guard";
        let minionHp = 160;
        let minionAtk = 14;

        // Themed minions based on boss
        if (isRyuJin) {
          minionName = "Storm Whelp";
          minionHp = 200;
          minionAtk = 18;
        } else if (isLucifer) {
          minionName = "Fallen Ember";
          minionHp = 250;
          minionAtk = 22;
        } else if (isSlaad) {
          minionName = "Void Shard";
          minionHp = 220;
          minionAtk = 20;
        } else if (isVerath) {
          minionName = "Demon Imp";
          minionHp = 180;
          minionAtk = 20;
        }

        let emptyEnemyX = 1;
        while (nextEnemies.some((e) => e.gridX === emptyEnemyX && e.hp > 0)) {
          emptyEnemyX++;
        }
        const minion: Enemy = {
          id: "summoned_minion_" + Date.now(),
          name: minionName,
          maxHp: minionHp,
          hp: minionHp,
          atk: minionAtk,
          def: 5,
          critChance: 10,
          dodgeChance: 5,
          accuracy: 95,
          avatarUrl: enemy.avatarUrl,
          gridX: emptyEnemyX,
          gridY: 1,
          statusEffects: [],
          aiType: "attacker",
          xpAwarded: 0,
          goldAwarded: 0,
          dropMaterials: [],
        };

        const newEnemies = [
          ...nextEnemies.map((e) => (e.id === enemy.id ? enemy : e)),
          minion,
        ];
        const newInitOrder = [...initiativeOrder, minion.id];
        pendingLogs = [
          ...pendingLogs,
          ...addLog(`🔮 ${enemy.name} summons a ${minionName}!`, "system"),
        ];

        setInitiativeOrder(newInitOrder);
        // Boss strikes target anyway (boss double action feel)
        resolvePhysicalHit(enemy, target, pendingLogs, newEnemies, nextParty);
        return;
      }

      // Boss special attack (35% chance - focused heavy hit)
      if (Math.random() < 0.35) {
        let skillName = "Devastating Blow";
        if (isRyuJin) skillName = "Dragon's Claw";
        else if (isLucifer) skillName = "Pride's Fall";
        else if (isSlaad) skillName = "Void Rend";
        else if (isVerath) skillName = "Demon's Bite";

        pendingLogs = [
          ...pendingLogs,
          ...addLog(`⚔️ ${enemy.name} uses [${skillName}] on ${target.name}!`, "system"),
        ];

        let baseDmg = Math.round(enemy.atk * 1.8 * atkMultiplier);
        const randomFactor = 0.9 + Math.random() * 0.2;
        baseDmg = Math.round(baseDmg * randomFactor);

        const enemyCrippled = enemy.statusEffects.some((eff) => eff.type === "crippled");
        if (enemyCrippled) baseDmg = Math.round(baseDmg * 0.75);

        const statsDerived = getDerivedStats(target);
        let dmg = Math.max(1, baseDmg - statsDerived.def);

        const targetVulnerable = target.statusEffects.some((eff) => eff.type === "vulnerable");
        if (targetVulnerable) dmg = Math.round(dmg * 1.5);

        // Apply shield
        const shieldBuff = target.statusEffects.find((eff) => eff.type === "shield");
        if (shieldBuff && shieldBuff.value > 0) {
          if (shieldBuff.value >= dmg) {
            shieldBuff.value -= dmg;
            dmg = 0;
          } else {
            dmg -= shieldBuff.value;
            shieldBuff.value = 0;
          }
        }

        if (dmg > 0) {
          target.hp = Math.max(0, target.hp - dmg);
          pendingLogs = [
            ...pendingLogs,
            ...addLog(`💥 [${skillName}] strikes ${target.name} for ${dmg} damage!`, "damage"),
          ];
        }

        if (target.hp <= 0) {
          pendingLogs = [
            ...pendingLogs,
            ...addLog(`☠️ ${target.name} has been knocked unconscious!`, "system"),
          ];
        }

        const updatedEnemies = nextEnemies.map((e) => (e.id === enemy.id ? enemy : e));
        const updatedParty = nextParty.map((p) => (p.id === target.id ? target : p));
        setCombatEnemies(updatedEnemies);
        setCombatParty(updatedParty);
        advanceTurn(updatedEnemies, pendingLogs, updatedParty);
        return;
      }

      // Fallback to basic attack for bosses
      resolvePhysicalHit(enemy, target, pendingLogs, nextEnemies, nextParty);
      return;
    }
  };

  const resolvePhysicalHit = (
    attacker: Enemy,
    target: Character,
    pendingLogs: CombatLog[],
    existingEnemiesList: Enemy[],
    existingPartyList: Character[] = combatParty,
  ) => {
    let logs = [...pendingLogs];

    // Check accuracy vs dodge
    let attackerAcc = getUnitAccuracy(attacker);
    // Symphonic Guard accuracy debuff: if any player is guarding with Symphonic Guard
    const bardsGuarding = existingPartyList.some(
      (p) =>
        p.hp > 0 &&
        p.statusEffects.some(
          (ef) => ef.type === "guarding" && p.class === "Bard",
        ),
    );
    if (bardsGuarding) {
      attackerAcc = Math.max(5, attackerAcc - 10);
    }
    const targetDodge = getUnitDodge(target);
    const hitChance = Math.max(5, Math.min(100, attackerAcc - targetDodge));

    const roll = Math.random() * 100;
    if (roll > hitChance) {
      logs = [
        ...logs,
        ...addLog(
          `💨 ${target.name} dodged ${attacker.name}'s strike! (Hit Chance: ${Math.round(hitChance)}%)`,
          "info",
        ),
      ];

      // rog_t9_mark: Evading an attack grants +1 Energy point.
      if (target.unlockedTalents?.includes("rog_t9_mark")) {
        target.energy = Math.min(target.maxEnergy, target.energy + 1);
        logs = [
          ...logs,
          ...addLog(
            `⚡ Evasive Maneuver! ${target.name} gains +1 Energy point on dodge!`,
            "status",
          ),
        ];
      }

      // war_t10_titans_wrath: Whenever Warrior dodges an attack, deal 25% STR damage back.
      if (target.unlockedTalents?.includes("war_t10_titans_wrath")) {
        const counterDmg = Math.max(1, Math.round(target.stats.STR * 0.25));
        attacker.hp = Math.max(0, attacker.hp - counterDmg);
        logs = [
          ...logs,
          ...addLog(
            `⚔️ Titan's Legacy! ${target.name} counter-attacks ${attacker.name} on dodge for ${counterDmg} physical damage!`,
            "damage",
          ),
        ];
        if (target.race === "Vampire") {
          const healAmount = Math.max(1, Math.round(counterDmg * 0.2));
          target.hp = Math.min(target.maxHp, target.hp + healAmount);
          logs = [
            ...logs,
            ...addLog(
              `🧛 Lifesteal! ${target.name} recovers ${healAmount} HP!`,
              "heal",
            ),
          ];
        }
      }

      const nextEnemiesList = existingEnemiesList.map((e) =>
        e.id === attacker.id ? { ...attacker } : e,
      );
      const nextPartyList = existingPartyList.map((p) =>
        p.id === target.id ? { ...target } : p,
      );
      setCombatParty(nextPartyList);
      setCombatEnemies(nextEnemiesList);

      advanceTurn(nextEnemiesList, logs, nextPartyList);
      return;
    }

    // Check defense flat reduction and 10% damage variance
    let baseDmg = attacker.atk;
    const randomFactor = 0.9 + Math.random() * 0.2;
    baseDmg = Math.round(baseDmg * randomFactor);

    // Attacker is Crippled check
    const attackerCrippled = attacker.statusEffects.some(
      (eff) => eff.type === "crippled",
    );
    if (attackerCrippled) {
      baseDmg = Math.round(baseDmg * 0.75);
    }

    // Target is Vulnerable check
    const targetVulnerable = target.statusEffects.some(
      (eff) => eff.type === "vulnerable",
    );
    if (targetVulnerable) {
      baseDmg = Math.round(baseDmg * 1.5);
    }

    // Check Block logic
    const statsDerived = getDerivedStats(target);
    const targetBlock = statsDerived.blockChance;
    const blockRoll = Math.random() * 100;
    const isBlocked = blockRoll < targetBlock;

    let finalDef = statsDerived.def;
    let dmg = Math.max(1, baseDmg - finalDef);
    if (isBlocked) {
      dmg = Math.round(dmg * 0.5);
      logs = [
        ...logs,
        ...addLog(
          `🛡️ Blocked! ${target.name} braces for the hit! (Block Chance: ${Math.round(targetBlock)}%, reduced damage by 50%)`,
          "info",
        ),
      ];
    }

    // Apply shield absorption
    const shieldBuff = target.statusEffects.find(
      (eff) => eff.type === "shield",
    );
    if (shieldBuff && shieldBuff.value > 0) {
      if (shieldBuff.value >= dmg) {
        shieldBuff.value -= dmg;
        logs = [
          ...logs,
          ...addLog(
            `✨ Shield fully absorbed ${dmg} damage on ${target.name}!`,
            "status",
          ),
        ];
        dmg = 0;
      } else {
        logs = [
          ...logs,
          ...addLog(
            `✨ Shield broke! Absorbed ${shieldBuff.value} damage on ${target.name}!`,
            "status",
          ),
        ];
        dmg -= shieldBuff.value;
        shieldBuff.value = 0;
      }
    }

    if (dmg > 0) {
      target.hp = Math.max(0, target.hp - dmg);
      logs = [
        ...logs,
        ...addLog(
          `💥 ${attacker.name} strikes ${target.name} for ${dmg} physical damage.`,
          "damage",
        ),
      ];
    }

    // war_t9_thorns: Whenever Warrior is struck by a physical attack, deal 20% CON damage back to the attacker.
    if (target.unlockedTalents?.includes("war_t9_thorns") && dmg > 0) {
      const thornsDmg = Math.max(1, Math.round(target.stats.CON * 0.2));
      attacker.hp = Math.max(0, attacker.hp - thornsDmg);
      logs = [
        ...logs,
        ...addLog(
          `🌵 Spiked Thorns! Struck back at ${attacker.name} for ${thornsDmg} physical damage!`,
          "damage",
        ),
      ];
    }

    // Vampire Lifesteal check on target hit
    if (
      target.race === "Vampire" &&
      target.unlockedTalents?.includes("war_t10_titans_wrath") &&
      isBlocked
    ) {
      const healAmount = Math.max(1, Math.round(dmg * 0.1));
      target.hp = Math.min(target.maxHp, target.hp + healAmount);
      logs = [
        ...logs,
        ...addLog(
          `🧛 Lifesteal! ${target.name} recovers ${healAmount} HP!`,
          "heal",
        ),
      ];
    }

    if (target.hp <= 0) {
      logs = [
        ...logs,
        ...addLog(`☠️ ${target.name} has been knocked unconscious!`, "system"),
      ];
    }

    const nextEnemiesList = existingEnemiesList.map((e) =>
      e.id === attacker.id ? { ...attacker } : e,
    );
    const nextPartyList = existingPartyList.map((p) =>
      p.id === target.id ? { ...target } : p,
    );
    setCombatParty(nextPartyList);
    setCombatEnemies(nextEnemiesList);

    advanceTurn(nextEnemiesList, logs, nextPartyList);
  };

  // Helper utility to turn-tick status effects
  const tickStatusEffects = (effects: StatusEffect[], race?: string) => {
    let updatedEffects: StatusEffect[] = [];
    let burnDmg = 0;
    let poisonDmg = 0;
    let bleedDmg = 0;
    let regenHeal = 0;

    effects.forEach((eff) => {
      const nextDur = eff.duration - 1;
      if (eff.type === "burn") {
        let val = eff.value;
        if (race === "Succubus" || race === "Dryad") val *= 2;
        burnDmg += val;
      } else if (eff.type === "poison") {
        let val = eff.value;
        if (race === "Elf") val *= 2;
        poisonDmg += val;
      } else if (eff.type === "bleed") {
        let val = eff.value;
        if (race === "Dragonborn") val *= 2;
        bleedDmg += val;
      } else if (eff.type === "regen") {
        regenHeal += eff.value;
      }

      if (nextDur > 0) {
        updatedEffects.push({ ...eff, duration: nextDur });
      }
    });

    return { updatedEffects, burnDmg, poisonDmg, bleedDmg, regenHeal };
  };

  const advanceTurn = (
    nextEnemies: Enemy[] = [],
    nextLogs: CombatLog[] = [],
    nextParty: Character[] = [],
  ) => {
    const freshParty = nextParty.length > 0 ? nextParty : combatParty;
    const freshEnemies = nextEnemies.length > 0 ? nextEnemies : combatEnemies;

    // Detect newly dead enemies by comparing combatEnemies vs freshEnemies
    const newlyDeadEnemies = combatEnemies.filter((prevEnemy) => {
      if (prevEnemy.hp <= 0) return false;
      const freshEnemy = freshEnemies.find((e) => e.id === prevEnemy.id);
      return freshEnemy && freshEnemy.hp <= 0;
    });

    let updatedPartyList = [...freshParty];

    // brd_t10_grand_finale: When an ally defeats an enemy, all allies gain +1 Energy.
    const hasBardFinale = freshParty.some((p) =>
      p.unlockedTalents?.includes("brd_t10_grand_finale"),
    );
    if (hasBardFinale && newlyDeadEnemies.length > 0) {
      nextLogs.push({
        id:
          "grand_finale_" +
          Date.now() +
          Math.random().toString(36).substr(2, 3),
        text: `🎵 Grand Finale! Defeating an enemy grants +1 Energy to all allies!`,
        type: "status",
        timestamp: new Date().toLocaleTimeString(),
      });
      updatedPartyList = updatedPartyList.map((p) => {
        if (p.hp > 0 && !p.isSummon) {
          return { ...p, energy: Math.min(p.maxEnergy, p.energy + 1) };
        }
        return p;
      });
    }
    let goldEarned = 0;
    let localAccumulatedMats = [...accumulatedMaterials];
    const hasGoblin = combatParty.some((p) => p.race === "Goblin");
    const hasDryad = combatParty.some((p) => p.race === "Dryad");

    if (newlyDeadEnemies.length > 0) {
      const itemsAndMatsEarned: {
        id: string;
        name: string;
        recipient: string;
      }[] = [];

      newlyDeadEnemies.forEach((enemy) => {
        // Gold
        const baseGold = enemy.goldAwarded || 10;
        let finalBaseGold = baseGold;
        if (hasGoblin) {
          finalBaseGold = Math.round(baseGold * 1.25);
        }
        goldEarned += finalBaseGold;

        // XP Calculation - Guaranteed 1 level + leftover XP per stage for EVERY character
        const alivePlayers = updatedPartyList.filter(
          (p) => p.hp > 0 && !p.isSummon,
        );
        if (alivePlayers.length > 0) {
          // Distribute Gold randomly among alive players
          let goldLeft = finalBaseGold;
          const goldShares = new Array(alivePlayers.length).fill(0);
          for (let i = 0; i < alivePlayers.length; i++) {
            if (i === alivePlayers.length - 1) {
              goldShares[i] = goldLeft;
            } else {
              const share = Math.floor(Math.random() * (goldLeft + 1));
              goldShares[i] = share;
              goldLeft -= share;
            }
          }

          updatedPartyList = updatedPartyList.map((p) => {
            if (p.hp > 0 && !p.isSummon) {
              // Calculate character's own level XP requirements
              const charXpToNext = Math.pow(p.level + 1, 2) + p.level;

              // Base XP per enemy so that N enemies total to 1.25 * charXpToNext
              const numEnemiesInBattle = enemies.length || 1;
              let enemyBaseXP = (charXpToNext * 1.25) / numEnemiesInBattle;

              // Apply boss and elite multipliers
              if (enemy.aiType === "boss") {
                enemyBaseXP *= 2.0;
              } else if (enemy.name.startsWith("E- ")) {
                enemyBaseXP *= 1.3;
              }

              // Apply +10% XP per enemy present in the battle
              let gainedXP = Math.round(
                enemyBaseXP * (1 + numEnemiesInBattle * 0.1),
              );

              // Dryad race bonus (+10%)
              if (p.race === "Dryad") {
                gainedXP = Math.round(gainedXP * 1.1);
              }
              gainedXP = Math.max(1, gainedXP);

              const playerIdx = alivePlayers.findIndex((ap) => ap.id === p.id);
              const gainedGold = playerIdx !== -1 ? goldShares[playerIdx] : 0;

              let nextXp = p.xp + gainedXP;
              let nextLevel = p.level;
              let extraPoints = 0;
              let nextTalentPoints = p.talentPoints || 0;
              let leveledUp = false;

              nextLogs = [
                ...nextLogs,
                {
                  id:
                    "xp_" +
                    Date.now() +
                    Math.random().toString(36).substr(2, 3),
                  text: `✨ ${p.name} gained ${gainedXP} XP.`,
                  type: "status",
                  timestamp: new Date().toLocaleTimeString(),
                },
              ];

              if (gainedGold > 0) {
                nextLogs = [
                  ...nextLogs,
                  {
                    id:
                      "gold_" +
                      Date.now() +
                      Math.random().toString(36).substr(2, 3),
                    text: `🪙 ${p.name} looted ${gainedGold} Gold.`,
                    type: "status",
                    timestamp: new Date().toLocaleTimeString(),
                  },
                ];
              }

              while (nextLevel < 100) {
                const xpToNext = Math.pow(nextLevel + 1, 2) + nextLevel;
                if (nextXp >= xpToNext) {
                  nextXp -= xpToNext;
                  nextLevel++;
                  extraPoints += p.race === "Human" ? 4 : 3;
                  leveledUp = true;
                } else {
                  break;
                }
              }

              // Award talent points for every 10 levels accumulated in the run
              const startLvl = p.runStartLevel || 1;
              const oldGained = p.level - startLvl;
              const newGained = nextLevel - startLvl;
              const oldPoints = Math.floor(oldGained / 10);
              const newPoints = Math.floor(newGained / 10);
              let gainedTP = 0;
              if (newPoints > oldPoints) {
                gainedTP = newPoints - oldPoints;
                nextTalentPoints += gainedTP;
              }

              if (leveledUp) {
                const tpMsg =
                  gainedTP > 0 ? `, +${gainedTP} Talent Point(s)` : "";
                nextLogs = [
                  ...nextLogs,
                  {
                    id:
                      "lv_" +
                      Date.now() +
                      Math.random().toString(36).substr(2, 3),
                    text: `⚡ LEVEL UP! ${p.name} reached Lv ${nextLevel}! (+${extraPoints} Stat Points${tpMsg})`,
                    type: "system",
                    timestamp: new Date().toLocaleTimeString(),
                  },
                ];
                if ((window as any).showNotification) {
                  (window as any).showNotification(
                    `🎉 ${p.name} leveled up to Lv ${nextLevel}!${gainedTP > 0 ? " (+Skill Point)" : ""}`,
                    "success",
                  );
                }
              }

              return {
                ...p,
                level: nextLevel,
                xp: nextXp,
                unspentPoints: p.unspentPoints + extraPoints,
                talentPoints: nextTalentPoints,
              };
            }
            return p;
          });
        }

        // Materials (60% chance)
        if (Math.random() < 0.6) {
          const drops = enemy.dropMaterials || [];
          const matChoices =
            drops.length > 0
              ? drops
              : ["iron_ore", "wolf_pelt", "magic_bloom", "ancient_bone"];

          updatedPartyList = updatedPartyList.map((p) => {
            if (p.isSummon) return p;
            const d20 = Math.floor(Math.random() * 20) + 1;
            const choiceIndex = (d20 - 1) % matChoices.length;
            const matId = matChoices[choiceIndex];
            const dbItem = ITEMS_DATABASE[matId];
            const matName = dbItem ? dbItem.name : matId;
            let qty = 1;
            if (p.race === "Elf" && Math.random() < 0.5) {
              qty = 2;
            }

            const itemToDrop: Item = dbItem
              ? { ...dbItem, quantity: qty }
              : {
                  id: matId,
                  name: matName,
                  type: "material",
                  description: "Harvested monster trophy parts.",
                  value: 15,
                  quantity: qty,
                };

            const pInv = p.inventory || [];
            let nextInv = [...pInv];
            const existingIdx = nextInv.findIndex((i) => i.id === matId);
            if (existingIdx !== -1) {
              nextInv[existingIdx] = {
                ...nextInv[existingIdx],
                quantity: (nextInv[existingIdx].quantity || 0) + qty,
              };
            } else {
              nextInv.push(itemToDrop);
            }

            nextLogs = [
              ...nextLogs,
              {
                id:
                  "roll_" +
                  Date.now() +
                  Math.random().toString(36).substr(2, 3),
                text: `🎲 ${p.name} rolled a ${d20} on d20! Gained ${qty}x ${matName}.`,
                type: "status",
                timestamp: new Date().toLocaleTimeString(),
              },
            ];

            itemsAndMatsEarned.push({
              id: matId,
              name: qty > 1 ? `${qty}x ${matName}` : matName,
              recipient: p.name,
            });

            return {
              ...p,
              inventory: nextInv,
            };
          });
        }

        // Equipment items (15% chance)
        if (Math.random() < 0.15) {
          const equipChoices = getThemedEquipChoices(enemy.name, enemy.aiType);

          updatedPartyList = updatedPartyList.map((p) => {
            if (p.isSummon) return p;
            const d20 = Math.floor(Math.random() * 20) + 1;
            const choiceIndex = (d20 - 1) % equipChoices.length;
            const equipId = equipChoices[choiceIndex];
            const dbItem = ITEMS_DATABASE[equipId];
            const equipName = dbItem ? dbItem.name : equipId;

            const itemToDrop: Item = dbItem
              ? { ...dbItem, quantity: 1 }
              : {
                  id: equipId,
                  name: equipName,
                  type: "weapon",
                  description: "Equipment item.",
                  value: 30,
                  quantity: 1,
                };

            const pInv = p.inventory || [];
            let nextInv = [...pInv];
            const existingIdx = nextInv.findIndex((i) => i.id === equipId);
            if (existingIdx !== -1) {
              nextInv[existingIdx] = {
                ...nextInv[existingIdx],
                quantity: (nextInv[existingIdx].quantity || 0) + 1,
              };
            } else {
              nextInv.push(itemToDrop);
            }

            nextLogs = [
              ...nextLogs,
              {
                id:
                  "roll_" +
                  Date.now() +
                  Math.random().toString(36).substr(2, 3),
                text: `🎲 ${p.name} rolled a ${d20} on d20! Gained 1x ${equipName}.`,
                type: "status",
                timestamp: new Date().toLocaleTimeString(),
              },
            ];

            itemsAndMatsEarned.push({
              id: equipId,
              name: equipName,
              recipient: p.name,
            });

            return {
              ...p,
              inventory: nextInv,
            };
          });
        }

        // Boss accessory drops — every alive player gets one when a boss is slain
        if (enemy.aiType === "boss") {
          const bossAccessories: Record<number, string> = {
            1: "timbergiant_heartwood_core",
            2: "bone_drake_skeletal_wing",
            3: "archdemon_smoldering_horn",
            4: "vareth_soul_crystal",
          };
          const accessoryId = bossAccessories[chapter];
          if (accessoryId) {
            const dbItem = ITEMS_DATABASE[accessoryId];
            if (dbItem) {
              updatedPartyList = updatedPartyList.map((p) => {
                if (p.hp > 0 && !p.isSummon) {
                  const pInv = p.inventory || [];
                  let nextInv = [...pInv];
                  const existingIdx = nextInv.findIndex(
                    (i) => i.id === accessoryId,
                  );
                  if (existingIdx !== -1 && nextInv[existingIdx].quantity) {
                    nextInv[existingIdx] = {
                      ...nextInv[existingIdx],
                      quantity: nextInv[existingIdx].quantity! + 1,
                    };
                  } else {
                    nextInv.push({ ...dbItem, quantity: 1 });
                  }
                  itemsAndMatsEarned.push({
                    id: accessoryId,
                    name: dbItem.name,
                    recipient: p.name,
                  });
                  return { ...p, inventory: nextInv };
                }
                return p;
              });
              nextLogs = [
                ...nextLogs,
                {
                  id:
                    "boss_loot_" +
                    Date.now() +
                    Math.random().toString(36).substr(2, 3),
                  text: `👑 Boss slain! ${dbItem.name} awarded to all surviving heroes!`,
                  type: "system",
                  timestamp: new Date().toLocaleTimeString(),
                },
              ];
            }
          }
        }
      });

      if (goldEarned > 0) {
        setAccumulatedGold((prev) => prev + goldEarned);
      }
      setAccumulatedMaterials(localAccumulatedMats);

      // Create a floating notification / log for the death loot!
      const lootDescriptionList: string[] = [];
      if (goldEarned > 0) {
        lootDescriptionList.push(`${goldEarned} Gold`);
      }
      if (itemsAndMatsEarned.length > 0) {
        itemsAndMatsEarned.forEach((item) => {
          lootDescriptionList.push(`1x ${item.name} (${item.recipient})`);
        });
      }

      const lootText = lootDescriptionList.join(", ");
      const msg = `☠️ Enemy slain! Loot dropped: ${lootText || "None"}`;
      nextLogs = [
        ...nextLogs,
        {
          id: "loot_" + Date.now() + Math.random().toString(36).substr(2, 3),
          text: msg,
          type: "system",
          timestamp: new Date().toLocaleTimeString(),
        },
      ];

      if ((window as any).showNotification) {
        (window as any).showNotification(msg, "success");
      }
    }

    // Check game outcome
    const aliveEnemies = freshEnemies.filter((e) => e.hp > 0);
    const alivePlayers = updatedPartyList.filter(
      (p) => p.hp > 0 && !p.isSummon,
    );

    if (aliveEnemies.length === 0) {
      // Process fallen characters and award survival talent points to survivors
      const finalParty = updatedPartyList
        .map((p) => {
          if (p.isSummon) return p;
          if (p.hp <= 0) {
            const currentStacks = p.fallenStacks || 0;
            if (currentStacks >= 3) {
              if ((window as any).showNotification) {
                (window as any).showNotification(
                  `💀 ${p.name} has fallen for the 4th time and is permanently dead!`,
                  "error",
                );
              }
              return null;
            } else {
              const maxH = getDerivedStats(p).maxHp;
              const newStacks = currentStacks + 1;
              if ((window as any).showNotification) {
                (window as any).showNotification(
                  `⚠️ ${p.name} fell in combat! Accumulated Fallen debuff stack ${newStacks}/3.`,
                  "info",
                );
              }
              return {
                ...p,
                hp: Math.floor(maxH * 0.3),
                fallenStacks: newStacks,
              };
            }
          } else {
            return p;
          }
        })
        .filter((p): p is Character => p !== null);

      if (finalParty.length === 0) {
        setBattleState("defeat");
        broadcastCombatState(
          finalParty,
          freshEnemies,
          round,
          initiativeOrder,
          currentTurnIdx,
          nextLogs,
          "defeat",
        );
        onDefeat();
        return;
      }

      setBattleState("victory");
      const finalGold = accumulatedGold + goldEarned;
      const finalMaterials = [...localAccumulatedMats];

      broadcastCombatState(
        finalParty,
        freshEnemies,
        round,
        initiativeOrder,
        currentTurnIdx,
        nextLogs,
        "victory",
      );
      onVictory(finalParty, { gold: finalGold, materials: finalMaterials });
      return;
    }

    if (alivePlayers.length === 0) {
      setBattleState("defeat");
      broadcastCombatState(
        updatedPartyList,
        freshEnemies,
        round,
        initiativeOrder,
        currentTurnIdx,
        nextLogs,
        "defeat",
      );
      onDefeat();
      return;
    }

    // Go to next alive participant
    let nextIdx = (currentTurnIdx + 1) % initiativeOrder.length;
    let nextRoundVal = round;
    if (nextIdx === 0) {
      nextRoundVal = round + 1;
      nextLogs = [
        ...nextLogs,
        ...addLog(`--- Round ${nextRoundVal} ---`, "system"),
      ];
    }

    // Loop until an alive actor is found (or summon)
    let found = false;
    let safeguard = 0;
    while (!found && safeguard < 50) {
      const nextId = initiativeOrder[nextIdx];
      const isPlayerAlive = freshParty.some((p) => p.id === nextId && p.hp > 0);
      const isEnemyAlive = freshEnemies.some(
        (e) => e.id === nextId && e.hp > 0,
      );

      if (isPlayerAlive || isEnemyAlive) {
        found = true;
      } else {
        nextIdx = (nextIdx + 1) % initiativeOrder.length;
        if (nextIdx === 0) {
          nextRoundVal++;
          nextLogs = [
            ...nextLogs,
            ...addLog(`--- Round ${nextRoundVal} ---`, "system"),
          ];
        }
      }
      safeguard++;
    }

    // Fallback: if no alive actor found after safeguard, force-check all alive units
    if (!found) {
      const allAlivePlayers = freshParty.filter(p => p.hp > 0);
      const allAliveEnemies = freshEnemies.filter(e => e.hp > 0);
      const forcedActor = allAlivePlayers[0] || allAliveEnemies[0];
      if (forcedActor) {
        nextIdx = initiativeOrder.indexOf(forcedActor.id);
        if (nextIdx === -1) {
          nextIdx = 0;
        }
        found = true;
      } else {
        // No alive units at all - should have been caught by earlier checks
        setBattleState("defeat");
        broadcastCombatState(updatedPartyList, freshEnemies, round, initiativeOrder, currentTurnIdx, nextLogs, "defeat");
        onDefeat();
        return;
      }
    }

    // Recover 1 Energy to the next player acting, check status effects on turn start
    const nextActorId = initiativeOrder[nextIdx];
    const playerActorIndex = updatedPartyList.findIndex(
      (p) => p.id === nextActorId,
    );
    let finalPartyList = [...updatedPartyList];

    if (playerActorIndex !== -1) {
      const pActor = { ...updatedPartyList[playerActorIndex] };

      // Tick skill cooldowns
      if (pActor.skillCooldowns) {
        const updatedCDS: Record<string, number> = {};
        Object.entries(pActor.skillCooldowns).forEach(([sId, cd]) => {
          const cdVal = cd as number;
          if (cdVal > 1) {
            updatedCDS[sId] = cdVal - 1;
          }
        });
        pActor.skillCooldowns = updatedCDS;
      }

      // Auto-turn for Summons familiar pet
      if (pActor.isSummon) {
        setTimeout(() => executeSummonPetTurn(pActor, freshEnemies), 1000);
      }

      // Tick player's DoTs
      const { updatedEffects, burnDmg, poisonDmg, bleedDmg, regenHeal } =
        tickStatusEffects(pActor.statusEffects, pActor.race);
      let pActorHp = pActor.hp - (burnDmg + poisonDmg + bleedDmg);

      if (burnDmg > 0)
        nextLogs = [
          ...nextLogs,
          ...addLog(
            `🔥 ${pActor.name} takes ${burnDmg} Burn damage!`,
            "status",
          ),
        ];
      if (poisonDmg > 0)
        nextLogs = [
          ...nextLogs,
          ...addLog(
            `🤢 ${pActor.name} takes ${poisonDmg} Poison damage!`,
            "status",
          ),
        ];
      if (bleedDmg > 0)
        nextLogs = [
          ...nextLogs,
          ...addLog(
            `🩸 ${pActor.name} bleeds for ${bleedDmg} damage!`,
            "status",
          ),
        ];

      if (regenHeal > 0 && pActorHp > 0) {
        const healAmt = Math.min(pActor.maxHp - pActorHp, regenHeal);
        pActorHp += healAmt;
        if (healAmt > 0) {
          nextLogs = [
            ...nextLogs,
            ...addLog(`💖 ${pActor.name} regenerates +${healAmt} HP!`, "heal"),
          ];
        }
      }

      pActor.hp = Math.max(0, pActorHp);
      pActor.statusEffects = updatedEffects;

      if (pActor.hp <= 0) {
        nextLogs = [
          ...nextLogs,
          ...addLog(`☠️ ${pActor.name} succumbed to status effects!`, "system"),
        ];
        finalPartyList = updatedPartyList.map((p) =>
          p.id === pActor.id ? pActor : p,
        );
        setCombatParty(finalPartyList);
        advanceTurn(freshEnemies, nextLogs, finalPartyList);
        return;
      }

      // Check for Stun/Stagger skip turn
      const stunEffectIndex = pActor.statusEffects.findIndex(
        (eff) => eff.type === "stagger" || eff.type === "stun",
      );
      if (stunEffectIndex !== -1) {
        nextLogs = [
          ...nextLogs,
          ...addLog(
            `💤 ${pActor.name} is Stunned/Staggered and skips their turn!`,
            "status",
          ),
        ];

        const stunEff = pActor.statusEffects[stunEffectIndex];
        let nextEffects = [...pActor.statusEffects];
        if (stunEff.duration <= 1) {
          nextEffects.splice(stunEffectIndex, 1);
        } else {
          nextEffects[stunEffectIndex] = {
            ...stunEff,
            duration: stunEff.duration - 1,
          };
        }
        pActor.statusEffects = nextEffects;

        // Passive energy regeneration on skip
        pActor.energy = Math.min(pActor.maxEnergy, pActor.energy + 1);

        finalPartyList = updatedPartyList.map((p) =>
          p.id === pActor.id ? pActor : p,
        );
        setCombatParty(finalPartyList);
        advanceTurn(freshEnemies, nextLogs, finalPartyList);
        return;
      }

      // Energy gain formula (Chance of +1 bonus)
      const energyAdd =
        1 +
        (Math.random() < 0.1 + pActor.stats.INT * 0.01 + pActor.stats.FTH * 0.01
          ? 1
          : 0);
      pActor.energy = Math.min(pActor.maxEnergy, pActor.energy + energyAdd);

      finalPartyList = updatedPartyList.map((p) =>
        p.id === pActor.id ? pActor : p,
      );
    }

    setCombatParty(finalPartyList);
    setCombatEnemies(freshEnemies);
    setRound(nextRoundVal);
    setCurrentTurnIdx(nextIdx);

    // Sync state
    const pAction = wasPlayerActionRef.current;
    wasPlayerActionRef.current = false; // reset after broadcast
    broadcastCombatState(
      finalPartyList,
      freshEnemies,
      nextRoundVal,
      initiativeOrder,
      nextIdx,
      nextLogs,
      "ongoing",
      undefined,
      pAction,
    );
  };

  const executeSummonPetTurn = (pet: Character, currentEnemies: Enemy[]) => {
    // 1. Clone nextEnemiesList to avoid mutating React state in place
    const nextEnemies = currentEnemies.map((e) => ({
      ...e,
      statusEffects: e.statusEffects.map((se) => ({ ...se })),
      skillCooldowns: e.skillCooldowns ? { ...e.skillCooldowns } : undefined,
      dropMaterials: e.dropMaterials ? [...e.dropMaterials] : [],
    }));

    // Action pets target random enemies automatically
    const aliveEnemies = nextEnemies.filter((e) => e.hp > 0);
    if (aliveEnemies.length === 0) return;
    const target =
      aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];

    let logs: CombatLog[] = [];
    const randomFactor = 0.9 + Math.random() * 0.2;
    const dmg = Math.round(Math.round(15 + Math.random() * 10) * randomFactor);
    target.hp = Math.max(0, target.hp - dmg);

    logs = [
      ...logs,
      ...addLog(
        `🔥 Familiar Pet strikes ${target.name} for ${dmg} Fire damage!`,
        "damage",
      ),
    ];
    if (target.hp <= 0) {
      logs = [...logs, ...addLog(`☠️ ${target.name} is defeated!`, "system")];
    }

    setCombatEnemies(nextEnemies);
    advanceTurn(nextEnemies, logs);
  };

  // Turn choice action: FOCUS
  const handleFocus = (chargerParam: Character) => {
    let logs = [
      ...addLog(
        `💤 ${chargerParam.name} focuses! Absorbs raw combat mana.`,
        "info",
      ),
    ];

    const charger = {
      ...chargerParam,
      statusEffects: chargerParam.statusEffects.map((se) => ({ ...se })),
    };

    charger.energy = Math.min(charger.maxEnergy, charger.energy + 2);
    // Gains light temporary shield on focus
    const shieldGain = 15 + charger.stats.CON * 2;
    charger.statusEffects = [
      ...charger.statusEffects,
      { type: "shield", value: shieldGain, duration: 1 },
    ];
    logs = [
      ...logs,
      ...addLog(
        `✨ ${charger.name} shields self for ${shieldGain} from tactical concentration.`,
        "status",
      ),
    ];

    const updatedParty = combatParty.map((p) =>
      p.id === charger.id ? charger : p,
    );
    setCombatParty(updatedParty);

    setSelectedAction(null);
    wasPlayerActionRef.current = true;
    advanceTurn(combatEnemies, logs, updatedParty);
  };

  // Helper to retrieve consumables from inventory
  const getConsumables = (char: Character): Item[] => {
    const inv =
      p2pMode === "multiplayer"
        ? char.inventory || []
        : combatParty[0]?.inventory || [];
    return inv.filter(
      (item) => item.type === "consumable" && (item.quantity ?? 0) > 0,
    );
  };

  // Turn choice action: CONSUMABLE POTION
  const handleUsePotion = (chargerParam: Character, itemId: string) => {
    const item = ITEMS_DATABASE[itemId];
    if (!item) return;

    let logs = [
      ...addLog(`🧪 ${chargerParam.name} consumes ${item.name}!`, "info"),
    ];

    const charger = {
      ...chargerParam,
      statusEffects: chargerParam.statusEffects.map((se) => ({ ...se })),
      inventory: chargerParam.inventory
        ? chargerParam.inventory.map((i) => ({ ...i }))
        : [],
    };

    // Apply potion effects
    if (itemId === "minor_heal") {
      charger.hp = Math.min(charger.maxHp, charger.hp + 75);
      logs = [...logs, ...addLog(`💖 Healed 75 HP!`, "heal")];
    } else if (itemId === "major_heal") {
      charger.hp = Math.min(charger.maxHp, charger.hp + 150);
      logs = [...logs, ...addLog(`💖 Healed 150 HP!`, "heal")];
    } else if (itemId === "regeneration_elixir") {
      const regenVal = Math.round(charger.maxHp * 0.04);
      charger.statusEffects = [
        ...charger.statusEffects,
        { type: "regen", value: regenVal, duration: 10 },
      ];
      logs = [
        ...logs,
        ...addLog(
          `✨ Gains ${regenVal} HP (4% Max HP) Regeneration for 10 turns!`,
          "status",
        ),
      ];
    } else if (itemId === "energy_brew") {
      charger.energy = Math.min(charger.maxEnergy, charger.energy + 2);
      logs = [...logs, ...addLog(`⚡ Restored 2 Energy!`, "status")];
    } else if (itemId === "greater_healing_draught") {
      charger.hp = Math.min(charger.maxHp, charger.hp + 50);
      logs = [...logs, ...addLog(`💖 Healed 50 HP!`, "heal")];
    }

    // Decrement the quantity from the appropriate inventory
    let updatedParty = combatParty.map((p) =>
      p.id === charger.id ? charger : p,
    );

    if (p2pMode === "multiplayer") {
      if (charger.inventory) {
        charger.inventory = charger.inventory
          .map((i) => {
            if (i.id === itemId) {
              return { ...i, quantity: (i.quantity ?? 1) - 1 };
            }
            return i;
          })
          .filter((i) => (i.quantity ?? 0) > 0);
      }
      updatedParty = combatParty.map((p) =>
        p.id === charger.id ? charger : p,
      );
    } else {
      const mainChar = {
        ...updatedParty[0],
        inventory: updatedParty[0].inventory
          ? updatedParty[0].inventory.map((i) => ({ ...i }))
          : [],
      };
      if (mainChar.inventory) {
        mainChar.inventory = mainChar.inventory
          .map((i) => {
            if (i.id === itemId) {
              return { ...i, quantity: (i.quantity ?? 1) - 1 };
            }
            return i;
          })
          .filter((i) => (i.quantity ?? 0) > 0);
      }
      updatedParty = updatedParty.map((p, idx) => (idx === 0 ? mainChar : p));
    }

    setCombatParty(updatedParty);
    setSelectedAction(null);
    wasPlayerActionRef.current = true;
    advanceTurn(combatEnemies, logs, updatedParty);
  };

  // Triggering physical skills / magic actions
  // Triggering physical skills / magic actions
  const castSkillOnTarget = (
    casterParam: Character,
    skill: Skill,
    targetId: string,
  ) => {
    // 1. Deep copy nextEnemiesList and nextPartyList to avoid mutating React state references directly
    let nextEnemiesList = combatEnemies.map((e) => ({
      ...e,
      statusEffects: e.statusEffects.map((se) => ({ ...se })),
      skillCooldowns: e.skillCooldowns ? { ...e.skillCooldowns } : undefined,
      dropMaterials: e.dropMaterials ? [...e.dropMaterials] : [],
    }));
    let nextPartyList = combatParty.map((p) => ({
      ...p,
      stats: { ...p.stats },
      equipment: { ...p.equipment },
      statusEffects: p.statusEffects.map((se) => ({ ...se })),
      skillCooldowns: p.skillCooldowns ? { ...p.skillCooldowns } : undefined,
      inventory: p.inventory ? p.inventory.map((i) => ({ ...i })) : [],
    }));

    // 2. Resolve caster, enemyTarget, and allyTarget copies
    const caster = nextPartyList.find((p) => p.id === casterParam.id)!;
    const enemyTarget = nextEnemiesList.find((e) => e.id === targetId);
    const allyTarget = nextPartyList.find((p) => p.id === targetId);

    if (caster.energy < skill.cost) {
      if ((window as any).showNotification) {
        (window as any).showNotification(
          "Insufficient energy points!",
          "error",
        );
      }
      return;
    }

    let logs = [...addLog(`✨ ${caster.name} casts [${skill.name}]!`, "info")];
    caster.energy -= skill.cost;
    let totalLifesteal = 0;

    // Apply skill cooldown
    if (skill.cooldown && skill.cooldown > 0) {
      caster.skillCooldowns = {
        ...(caster.skillCooldowns || {}),
        [skill.id]: skill.cooldown,
      };
    }

    // 1. Single Enemy targets
    if (skill.targetType === TargetType.SINGLE_ENEMY && enemyTarget) {
      const isDitched = resolveDefenseAndEvade(enemyTarget, caster, logs);
      if (!isDitched) {
        // Compute base scaling
        let baseMult = skill.damageMultiplier || 1.0;
        if (skill.id === "asn_exterm") {
          const hasBleedOrPoison = enemyTarget.statusEffects.some(
            (eff) => eff.type === "bleed" || eff.type === "poison",
          );
          if (hasBleedOrPoison) {
            baseMult *= 3.0;
          }
        }

        // --- PASSIVE TALENT MODIFIERS ---
        let critBonusChance = 0;
        if (
          skill.id === "war_strike" &&
          caster.unlockedTalents?.includes("war_t2_power_strike")
        ) {
          baseMult *= 1.2;
          critBonusChance += 10;
        }
        if (
          skill.id === "arc_shot" &&
          caster.unlockedTalents?.includes("arc_t2_quick_shot")
        ) {
          baseMult *= 1.2;
        }
        if (caster.unlockedTalents?.includes("arc_t7_crippling")) {
          const isBleedPoison = enemyTarget.statusEffects.some(
            (eff) => eff.type === "poison" || eff.type === "bleed",
          );
          if (isBleedPoison) {
            baseMult *= 1.15;
          }
        }
        if (
          skill.id === "mag_bolt" &&
          caster.unlockedTalents?.includes("mag_t2_flame_dart")
        ) {
          baseMult *= 1.2;
        }
        if (
          caster.unlockedTalents?.includes("mag_t6_glacial") &&
          skill.id.startsWith("mag_")
        ) {
          baseMult *= 1.15;
        }
        if (
          skill.id === "cle_smite" &&
          caster.unlockedTalents?.includes("cle_t4_regenerate")
        ) {
          baseMult *= 1.2;
        }
        if (
          skill.id === "rog_stab" &&
          caster.unlockedTalents?.includes("rog_t2_backstab")
        ) {
          baseMult *= 1.2;
          critBonusChance += 15;
        }
        if (caster.unlockedTalents?.includes("rog_t7_lucky")) {
          const isBleedPoison = enemyTarget.statusEffects.some(
            (eff) => eff.type === "poison" || eff.type === "bleed",
          );
          if (isBleedPoison) {
            baseMult *= 1.2;
          }
        }
        if (
          skill.id === "brd_dis" &&
          caster.unlockedTalents?.includes("brd_t3_dissonance_shatter")
        ) {
          baseMult *= 1.2;
        }
        // ---------------------------------

        // Critical multipliers
        const critDmgBonus = getCritCalculation(caster);
        const critRoll = Math.random() * 100;

        if (
          caster.unlockedTalents?.includes("rog_t10_reaper") &&
          enemyTarget.hp < enemyTarget.maxHp / 2
        ) {
          critBonusChance += 30;
        }

        const casterCritChance =
          5 + caster.stats.DEX * 0.4 + caster.stats.LCK * 0.5 + critBonusChance;
        const isCrit = critRoll < casterCritChance;

        let baseDmg = getBaseDamage(caster, baseMult, skill.targetType);
        if (isCrit) {
          baseDmg = Math.round(baseDmg * (critDmgBonus / 100));
        }

        // Damage calculation against enemy def (flat subtraction, handles Piercing Strike defense bypass)
        const isPiercing = skill.name === "Piercing Strike";

        let ignoredDefPct = isPiercing ? 0.5 : 0.0;
        if (caster.unlockedTalents?.includes("rog_t6_venomous")) {
          ignoredDefPct = Math.max(ignoredDefPct, 0.2);
        }
        const enemyDef = Math.round(enemyTarget.def * (1 - ignoredDefPct));
        let dmg = Math.max(1, baseDmg - enemyDef);

        // Apply 10% randomization
        const randomFactor = 0.9 + Math.random() * 0.2;
        // Apply damage dealt penalty (Fallen debuff on caster)
        const casterFallen = caster.fallenStacks || 0;
        const dmgMultiplier = 1 - casterFallen * 0.25;
        dmg = Math.round(dmg * randomFactor * dmgMultiplier);

        // Attacker Crippled check
        const casterCrippled = caster.statusEffects.some(
          (eff) => eff.type === "crippled",
        );
        if (casterCrippled) {
          dmg = Math.round(dmg * 0.75);
        }

        // Target Vulnerable check
        const targetVulnerable = enemyTarget.statusEffects.some(
          (eff) => eff.type === "vulnerable",
        );
        if (targetVulnerable) {
          dmg = Math.round(dmg * 1.5);
        }

        // Standard single target hit
        enemyTarget.hp = Math.max(0, enemyTarget.hp - dmg);
        if (caster.race === "Vampire") {
          totalLifesteal += Math.max(1, Math.round(dmg * 0.2));
        }
        if (isCrit) {
          logs = [
            ...logs,
            ...addLog(
              `💥 CRITICAL HIT! Deals ${dmg} critical damage to ${enemyTarget.name}!`,
              "damage",
            ),
          ];
        } else {
          logs = [
            ...logs,
            ...addLog(
              `💥 Strikes ${enemyTarget.name} for ${dmg} damage!`,
              "damage",
            ),
          ];
        }

        // Apply skill debuffs if present
        if (skill.effect && skill.effect !== "lifesteal") {
          let effectVal = skill.effectValue || 10;
          let effectDur = skill.effectDuration || 2;

          if (skill.effect === "burn") {
            effectVal = Math.max(4, Math.round(caster.stats.INT * 0.1));
            if (caster.unlockedTalents?.includes("mag_t2_flame_dart")) {
              effectVal = Math.round(effectVal * 1.15);
            }
            if (
              skill.id === "mag_bolt" &&
              caster.unlockedTalents?.includes("mag_t5_fireball")
            ) {
              enemyTarget.statusEffects.push({
                type: "burn",
                value: effectVal,
                duration: effectDur,
              });
            }
          } else if (skill.effect === "poison") {
            effectVal = Math.max(4, Math.round(caster.stats.DEX * 0.1));
          } else if (skill.effect === "bleed") {
            effectVal = Math.max(4, Math.round(caster.stats.STR * 0.1));
            if (
              skill.id === "rog_bleed" &&
              caster.unlockedTalents?.includes("rog_t4_hemorrhage")
            ) {
              effectVal = Math.round(effectVal * 1.3);
            }
          }

          const appliedEffect: StatusEffect = {
            type: skill.effect as any,
            value: effectVal,
            duration: effectDur,
          };
          enemyTarget.statusEffects.push(appliedEffect);
          logs = [
            ...logs,
            ...addLog(
              `✨ Inflicted ${skill.effect} (${effectVal} DoT/turn) on ${enemyTarget.name} for ${effectDur} turns!`,
              "status",
            ),
          ];
        }

        // --- PASSIVES FOR ADDITIONAL EFFECTS ---
        if (
          skill.id === "war_strike" &&
          caster.unlockedTalents?.includes("war_t8_blade_fury") &&
          Math.random() < 0.3
        ) {
          enemyTarget.statusEffects.push({
            type: "stun",
            value: 1,
            duration: 1,
          });
          logs = [
            ...logs,
            ...addLog(
              `💤 Shield Slam! ${enemyTarget.name} is Stunned for 1 turn!`,
              "status",
            ),
          ];
        }
        if (
          skill.id === "arc_shot" &&
          caster.unlockedTalents?.includes("arc_t3_pinning") &&
          Math.random() < 0.4
        ) {
          const poisonVal = Math.max(4, Math.round(caster.stats.DEX * 0.1));
          enemyTarget.statusEffects.push({
            type: "poison",
            value: poisonVal,
            duration: 2,
          });
          logs = [
            ...logs,
            ...addLog(
              `🤢 Poison Arrow! Inflicted poison (${poisonVal} DoT) on ${enemyTarget.name} for 2 turns!`,
              "status",
            ),
          ];
        }
        if (
          (skill.id === "rog_stab" || skill.id === "rog_bleed") &&
          caster.unlockedTalents?.includes("rog_t3_cloak") &&
          Math.random() < 0.3
        ) {
          const poisonVal = Math.max(4, Math.round(caster.stats.DEX * 0.1));
          enemyTarget.statusEffects.push({
            type: "poison",
            value: poisonVal,
            duration: 2,
          });
          logs = [
            ...logs,
            ...addLog(
              `🤢 Toxic Coating! Inflicted poison (${poisonVal} DoT) on ${enemyTarget.name} for 2 turns!`,
              "status",
            ),
          ];
        }
        if (
          skill.id === "cle_smite" &&
          caster.unlockedTalents?.includes("cle_t9_sacred_ground") &&
          Math.random() < 0.5
        ) {
          enemyTarget.statusEffects.push({
            type: "stagger",
            value: 1,
            duration: 1,
          });
          logs = [
            ...logs,
            ...addLog(
              `⚡ Holy Stagger! ${enemyTarget.name} is Staggered for 1 turn!`,
              "status",
            ),
          ];
        }
        if (
          skill.id === "brd_dis" &&
          caster.unlockedTalents?.includes("brd_t6_anthem") &&
          Math.random() < 0.3
        ) {
          enemyTarget.statusEffects.push({
            type: "stun",
            value: 1,
            duration: 1,
          });
          logs = [
            ...logs,
            ...addLog(
              `🤫 Silence! ${enemyTarget.name} is Silenced/Stunned for 1 turn!`,
              "status",
            ),
          ];
        }

        // Inquisitor Equalized heal mechanic
        if (skill.id === "inq_retribution") {
          const healPool = Math.round(dmg * 0.8);
          const alivePlys = nextPartyList.filter(
            (p) => p.hp > 0 && !p.isSummon,
          );
          const shareHeal = Math.round(healPool / (alivePlys.length || 1));
          logs = [
            ...logs,
            ...addLog(
              `☀ Inquisitor's Holy retribution splits<sup>[${healPool} HP pool]</sup> across ${alivePlys.length} allies!`,
              "heal",
            ),
          ];

          nextPartyList = nextPartyList.map((p) => {
            if (p.hp > 0 && !p.isSummon) {
              const receiverFallenStacks = p.fallenStacks || 0;
              const actualHeal = Math.round(
                shareHeal * (1 - receiverFallenStacks * 0.25),
              );
              const recovery = Math.min(p.maxHp, p.hp + actualHeal);
              logs = [
                ...logs,
                ...addLog(
                  `💖 ${p.name} gathers thánh quang and heals ${actualHeal} HP!`,
                  "heal",
                ),
              ];
              return { ...p, hp: recovery };
            }
            return p;
          });
        }

        // Lifesteal trigger
        if (skill.id === "ber_frenzy") {
          const lifeRecov = Math.round(dmg * 0.4);
          const recCaster = nextPartyList.find((p) => p.id === caster.id);
          if (recCaster) {
            const receiverFallenStacks = recCaster.fallenStacks || 0;
            const actualHeal = Math.round(
              lifeRecov * (1 - receiverFallenStacks * 0.25),
            );
            recCaster.hp = Math.min(recCaster.maxHp, recCaster.hp + actualHeal);
            logs = [
              ...logs,
              ...addLog(
                `🧛 Frenzy lifesteal heals Berserker for ${actualHeal} HP!`,
                "status",
              ),
            ];
          }
        }

        nextEnemiesList = nextEnemiesList.map((e) =>
          e.id === enemyTarget.id ? { ...enemyTarget } : e,
        );
      }
    }

    // 2. All allies
    else if (skill.targetType === TargetType.ALL_ALLIES) {
      let baseHeal = skill.healingMultiplier || 1.0;

      if (caster.unlockedTalents?.includes("cle_t10_miracle")) {
        baseHeal *= 1.2;
      }
      if (caster.race === "Dryad") {
        baseHeal *= 1.2;
      }

      const healDmg = getBaseHealing(caster, baseHeal, skill.targetType);

      nextPartyList = nextPartyList.map((p) => {
        if (p.hp > 0 && !p.isSummon) {
          if (skill.healingMultiplier) {
            const receiverFallenStacks = p.fallenStacks || 0;
            const actualHeal = Math.round(
              healDmg * (1 - receiverFallenStacks * 0.25),
            );
            const upHp = Math.min(p.maxHp, p.hp + actualHeal);
            logs = [
              ...logs,
              ...addLog(
                `💖 Healing light recovers ${actualHeal} HP for ${p.name}!`,
                "heal",
              ),
            ];

            let bonusHeal = 0;
            if (
              skill.id === "brd_valor" &&
              caster.unlockedTalents?.includes("brd_t7_lure")
            ) {
              bonusHeal += Math.round(caster.stats.CHA * 0.15);
            }
            const finalHp = Math.min(p.maxHp, upHp + bonusHeal);
            if (bonusHeal > 0) {
              logs = [
                ...logs,
                ...addLog(
                  `🎵 Healer's Chord restores extra ${bonusHeal} HP to ${p.name}!`,
                  "heal",
                ),
              ];
            }

            return { ...p, hp: finalHp };
          }
          if (skill.effect) {
            let finalVal = skill.effectValue || 10;
            if (skill.id === "cle_shelter") {
              finalVal = 10 + caster.stats.FTH * 1.0;
              if (caster.unlockedTalents?.includes("cle_t3_barrier")) {
                finalVal = Math.round(finalVal * 1.25);
              }
            } else if (skill.id === "brd_lute") {
              finalVal = 5 + Math.round(caster.stats.CHA * 0.4);
            } else if (skill.id === "hpr_aura") {
              finalVal = 10 + Math.round(caster.stats.FTH * 0.8);
            }

            if (
              caster.unlockedTalents?.includes("cle_t6_divine_ward") &&
              skill.effect === "shield"
            ) {
              finalVal = Math.round(finalVal * 1.15);
            }
            if (
              caster.unlockedTalents?.includes("cle_t10_miracle") &&
              skill.effect === "shield"
            ) {
              finalVal = Math.round(finalVal * 1.2);
            }

            let extraShieldValue = 0;
            if (
              skill.id === "brd_lute" &&
              caster.unlockedTalents?.includes("brd_t8_melodic_shield")
            ) {
              extraShieldValue = Math.round(caster.stats.CHA * 0.15);
            }

            const receiverFallenStacks = p.fallenStacks || 0;
            finalVal = Math.round(finalVal * (1 - receiverFallenStacks * 0.25));

            let effectDuration = skill.effectDuration || 3;
            if (
              skill.id === "cle_shelter" &&
              caster.unlockedTalents?.includes("cle_t3_barrier")
            ) {
              effectDuration += 1;
            }

            let updatedEffects = [
              ...p.statusEffects,
              {
                type: skill.effect as any,
                value: finalVal,
                duration: effectDuration,
              },
            ];
            if (extraShieldValue > 0) {
              updatedEffects.push({
                type: "shield",
                value: extraShieldValue,
                duration: 3,
              });
              logs = [
                ...logs,
                ...addLog(
                  `🎵 Melodic Shield absorbs ${extraShieldValue} damage for ${p.name}!`,
                  "status",
                ),
              ];
            }

            return {
              ...p,
              statusEffects: updatedEffects,
            };
          }
        }
        return p;
      });

      if (
        !skill.healingMultiplier &&
        skill.id === "brd_valor" &&
        caster.unlockedTalents?.includes("brd_t7_lure")
      ) {
        nextPartyList = nextPartyList.map((p) => {
          if (p.hp > 0 && !p.isSummon) {
            const bonusHeal = Math.round(caster.stats.CHA * 0.15);
            const receiverFallenStacks = p.fallenStacks || 0;
            const actualHeal = Math.round(
              bonusHeal * (1 - receiverFallenStacks * 0.25),
            );
            const finalHp = Math.min(p.maxHp, p.hp + actualHeal);
            logs = [
              ...logs,
              ...addLog(
                `🎵 Healer's Chord restores ${actualHeal} HP to ${p.name}!`,
                "heal",
              ),
            ];
            return { ...p, hp: finalHp };
          }
          return p;
        });
      }

      logs = [
        ...logs,
        ...addLog(`✨ Shielding and blessings expanded party-wide!`, "status"),
      ];
    }

    // 3. Single Ally Target
    else if (skill.targetType === TargetType.SINGLE_ALLY && allyTarget) {
      if (skill.healingMultiplier) {
        let baseHeal = skill.healingMultiplier || 1.5;

        if (
          skill.id === "cle_heal" &&
          caster.unlockedTalents?.includes("cle_t1_minor_heal")
        ) {
          baseHeal *= 1.2;
        }
        if (caster.unlockedTalents?.includes("cle_t10_miracle")) {
          baseHeal *= 1.2;
        }
        if (caster.race === "Dryad") {
          baseHeal *= 1.2;
        }

        const healingPower = getBaseHealing(caster, baseHeal, skill.targetType);

        const receiverFallenStacks = allyTarget.fallenStacks || 0;
        const actualHeal = Math.round(
          healingPower * (1 - receiverFallenStacks * 0.25),
        );

        let upHp = allyTarget.hp + actualHeal;
        let overhealShieldValue = 0;

        if (
          skill.id === "cle_heal" &&
          caster.unlockedTalents?.includes("cle_t2_holy_light")
        ) {
          if (upHp > allyTarget.maxHp) {
            overhealShieldValue = upHp - allyTarget.maxHp;
          }
        }

        allyTarget.hp = Math.min(allyTarget.maxHp, upHp);
        logs = [
          ...logs,
          ...addLog(
            `💖 ${caster.name} targets saintly aura to heal ${allyTarget.name} for ${actualHeal} HP!`,
            "heal",
          ),
        ];

        if (overhealShieldValue > 0) {
          allyTarget.statusEffects.push({
            type: "shield",
            value: overhealShieldValue,
            duration: 2,
          });
          logs = [
            ...logs,
            ...addLog(
              `✨ Saintly Shield! Overheal converts to a ${overhealShieldValue} HP shield for ${allyTarget.name}!`,
              "status",
            ),
          ];
        }

        if (
          skill.id === "cle_heal" &&
          caster.unlockedTalents?.includes("cle_t5_purify")
        ) {
          const prevLen = allyTarget.statusEffects.length;
          allyTarget.statusEffects = allyTarget.statusEffects.filter(
            (eff) =>
              ![
                "burn",
                "poison",
                "bleed",
                "vulnerable",
                "crippled",
                "stun",
                "stagger",
              ].includes(eff.type),
          );
          const cleansedCount = prevLen - allyTarget.statusEffects.length;
          if (cleansedCount > 0) {
            logs = [
              ...logs,
              ...addLog(
                `😇 Purifying Grace cleansed ${cleansedCount} negative status effects from ${allyTarget.name}!`,
                "status",
              ),
            ];
          }
        }
      }
      nextPartyList = nextPartyList.map((p) =>
        p.id === allyTarget.id ? { ...allyTarget } : p,
      );
    }

    // 4. All Enemies (AOE casting)
    else if (skill.targetType === TargetType.ALL_ENEMIES) {
      let baseMult = skill.damageMultiplier || 1.0;

      if (
        skill.id === "mag_storm" &&
        caster.unlockedTalents?.includes("mag_t3_frost_nova")
      ) {
        baseMult *= 1.2;
      }
      if (
        caster.unlockedTalents?.includes("mag_t6_glacial") &&
        skill.id.startsWith("mag_")
      ) {
        baseMult *= 1.15;
      }

      const spellDmg = getBaseDamage(caster, baseMult, TargetType.ALL_ENEMIES);

      const casterFallen = caster.fallenStacks || 0;
      const dmgMultiplier = 1 - casterFallen * 0.25;

      nextEnemiesList = nextEnemiesList.map((e) => {
        if (e.hp > 0) {
          const evaded = resolveDefenseAndEvade(e, caster, logs);
          if (!evaded) {
            let raw = Math.max(1, spellDmg - e.def);
            const randomFactor = 0.9 + Math.random() * 0.2;
            raw = Math.round(raw * randomFactor * dmgMultiplier);

            // Attacker Crippled check
            const casterCrippled = caster.statusEffects.some(
              (eff) => eff.type === "crippled",
            );
            if (casterCrippled) {
              raw = Math.round(raw * 0.75);
            }

            // Target Vulnerable check
            const targetVulnerable = e.statusEffects.some(
              (eff) => eff.type === "vulnerable",
            );
            if (targetVulnerable) {
              raw = Math.round(raw * 1.5);
            }

            const freshHp = Math.max(0, e.hp - raw);
            if (caster.race === "Vampire") {
              totalLifesteal += Math.max(1, Math.round(raw * 0.2));
            }
            logs = [
              ...logs,
              ...addLog(
                `💥 AoE Wave hits ${e.name} for ${raw} magic damage!`,
                "damage",
              ),
            ];

            // Apply AOE debuffs (e.g. burn stacks)
            let updatedEffs = [...e.statusEffects];
            if (skill.effect) {
              let effectVal = skill.effectValue || 10;
              let effectDur = skill.effectDuration || 2;

              if (skill.effect === "burn") {
                effectVal = Math.max(4, Math.round(caster.stats.INT * 0.1));
              } else if (skill.effect === "poison") {
                effectVal = Math.max(4, Math.round(caster.stats.DEX * 0.1));
              } else if (skill.effect === "bleed") {
                effectVal = Math.max(4, Math.round(caster.stats.STR * 0.1));
              }

              updatedEffs.push({
                type: skill.effect as any,
                value: effectVal,
                duration: effectDur,
              });
              logs = [
                ...logs,
                ...addLog(
                  `✨ Inflicted ${skill.effect} (${effectVal} DoT/turn) on ${e.name} for ${effectDur} turns!`,
                  "status",
                ),
              ];
            }

            if (
              skill.id === "mag_storm" &&
              caster.unlockedTalents?.includes("mag_t10_meteor") &&
              Math.random() < 0.35
            ) {
              updatedEffs.push({ type: "stagger", value: 1, duration: 1 });
              logs = [
                ...logs,
                ...addLog(
                  `⚡ Meteor Shock! ${e.name} is Staggered for 1 turn!`,
                  "status",
                ),
              ];
            }

            return { ...e, hp: freshHp, statusEffects: updatedEffs };
          }
        }
        return e;
      });
    }

    // 5. Target Column (Now behaves as a 1D cleave/splash on target and its neighbors, distance <= 1)
    else if (skill.targetType === TargetType.COLUMN && enemyTarget) {
      const targetCol = enemyTarget.gridX;
      let baseMult = skill.damageMultiplier || 1.0;

      if (
        skill.id === "arc_rain" &&
        caster.unlockedTalents?.includes("arc_t4_power_draw")
      ) {
        baseMult *= 1.25;
      }
      if (
        skill.id === "brd_dis" &&
        caster.unlockedTalents?.includes("brd_t3_dissonance_shatter")
      ) {
        baseMult *= 1.2;
      }

      const spellDmg = getBaseDamage(caster, baseMult, TargetType.COLUMN);

      const casterFallen = caster.fallenStacks || 0;
      const dmgMultiplier = 1 - casterFallen * 0.25;

      logs = [
        ...logs,
        ...addLog(`🏹 Cleaving Slot ${targetCol} and its neighbors!`, "system"),
      ];
      nextEnemiesList = nextEnemiesList.map((e) => {
        if (Math.abs(e.gridX - targetCol) <= 1 && e.hp > 0) {
          const evaded = resolveDefenseAndEvade(e, caster, logs);
          if (!evaded) {
            let raw = Math.max(1, spellDmg - e.def);
            const randomFactor = 0.9 + Math.random() * 0.2;
            raw = Math.round(raw * randomFactor * dmgMultiplier);

            // Attacker Crippled check
            const casterCrippled = caster.statusEffects.some(
              (eff) => eff.type === "crippled",
            );
            if (casterCrippled) {
              raw = Math.round(raw * 0.75);
            }

            // Target Vulnerable check
            const targetVulnerable = e.statusEffects.some(
              (eff) => eff.type === "vulnerable",
            );
            if (targetVulnerable) {
              raw = Math.round(raw * 1.5);
            }

            let updatedEffs = [...e.statusEffects];

            if (
              skill.id === "brd_dis" &&
              caster.unlockedTalents?.includes("brd_t3_dissonance_shatter")
            ) {
              updatedEffs.push({ type: "vulnerable", value: 15, duration: 2 });
              logs = [
                ...logs,
                ...addLog(
                  `✨ Dissonance Shatter reduces DEF of ${e.name} by 15%!`,
                  "status",
                ),
              ];
            }
            if (caster.race === "Vampire") {
              totalLifesteal += Math.max(1, Math.round(raw * 0.2));
            }
            logs = [
              ...logs,
              ...addLog(
                `💥 Volley strikes ${e.name} on Slot ${e.gridX} for ${raw} dmg!`,
                "damage",
              ),
            ];
            return {
              ...e,
              hp: Math.max(0, e.hp - raw),
              statusEffects: updatedEffs,
            };
          }
        }
        return e;
      });
    }

    // 6. Character Summon Familiar
    else if (skill.id === "sum_pet") {
      let emptyX = 1;
      while (nextPartyList.some((p) => p.gridX === emptyX && p.hp > 0)) {
        emptyX++;
      }
      const emptySlot = { x: emptyX, y: 1 };

      if (emptySlot) {
        const pet: Character = {
          id: "pet_fam_" + Date.now(),
          name: "Void Familiar [Summon]",
          class: "Summoner",
          level: caster.level,
          xp: 0,
          hp: 120 + caster.stats.INT * 4,
          maxHp: 120 + caster.stats.INT * 4,
          energy: 0,
          maxEnergy: 0,
          stats: { ...caster.stats },
          allocatedPoints: 0,
          unspentPoints: 0,
          gridX: emptySlot.x,
          gridY: emptySlot.y,
          equipment: {
            weapon: null,
            offhand: null,
            helmet: null,
            chestplate: null,
            leggings: null,
            boots: null,
            ring: null,
            bracelet: null,
            necklace: null,
            charm: null,
          },
          statusEffects: [],
          isSummon: true,
          avatarUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJX9_XkGDQ4-thkL2uVNSQYxjZkor5MWNUjg&s",
        };

        nextPartyList = [...nextPartyList, pet];
        setInitiativeOrder((prev) => [...prev, pet.id]);
        logs = [
          ...logs,
          ...addLog(
            `🔮 Familiar beast emerged onto Column ${emptySlot.x} Row ${emptySlot.y}!`,
            "system",
          ),
        ];
      } else {
        logs = [
          ...logs,
          ...addLog(`⚠️ No empty battlefield grids for summons.`, "system"),
        ];
      }
    }

    // 7. Standard self buffs
    else if (skill.targetType === TargetType.SELF && skill.effect) {
      const activeCaster = nextPartyList.find((p) => p.id === caster.id);
      if (activeCaster) {
        let effectVal = skill.effectValue || 10;

        let effectDuration = skill.effectDuration || 2;
        if (
          skill.id === "rog_shadow" &&
          caster.unlockedTalents?.includes("rog_t5_evasive")
        ) {
          effectVal = 15; // Rogue Shadow Step evasion +15%
          effectDuration += 1;
        }

        activeCaster.statusEffects.push({
          type: skill.effect as any,
          value: effectVal,
          duration: effectDuration,
        });
        logs = [
          ...logs,
          ...addLog(
            `✨ ${caster.name} receives self buff [${skill.name}] for ${effectDuration} turns.`,
            "status",
          ),
        ];
      }
    }

    if (totalLifesteal > 0) {
      const activeCaster = nextPartyList.find((p) => p.id === caster.id);
      if (activeCaster) {
        activeCaster.hp = Math.min(
          activeCaster.maxHp,
          activeCaster.hp + totalLifesteal,
        );
        logs = [
          ...logs,
          ...addLog(
            `🧛 Lifesteal! ${caster.name} recovers ${totalLifesteal} HP!`,
            "heal",
          ),
        ];
      }
    }

    // Reset combat choice view
    setCombatParty(nextPartyList);
    setCombatEnemies(nextEnemiesList);
    setSelectedAction(null);
    setSelectedSkill(null);

    wasPlayerActionRef.current = true;
    advanceTurn(nextEnemiesList, logs, nextPartyList);
  };

  // Handle Double Tap clicks targeting Bolt Slinger Triple Strike
  const triggerBoltSlingerMultiHit = (
    casterParam: Character,
    selectedIds: string[],
  ) => {
    let logs = [
      ...addLog(
        `🎯 Bolt Slinger fires Triple Strike shots at targets!`,
        "info",
      ),
    ];

    const nextEnemiesList = combatEnemies.map((e) => ({
      ...e,
      statusEffects: e.statusEffects.map((se) => ({ ...se })),
      skillCooldowns: e.skillCooldowns ? { ...e.skillCooldowns } : undefined,
      dropMaterials: e.dropMaterials ? [...e.dropMaterials] : [],
    }));
    const nextPartyList = combatParty.map((p) => ({
      ...p,
      stats: { ...p.stats },
      equipment: { ...p.equipment },
      statusEffects: p.statusEffects.map((se) => ({ ...se })),
      skillCooldowns: p.skillCooldowns ? { ...p.skillCooldowns } : undefined,
      inventory: p.inventory ? p.inventory.map((i) => ({ ...i })) : [],
    }));

    const caster = nextPartyList.find((p) => p.id === casterParam.id)!;
    let totalLifesteal = 0;
    caster.energy -= 2; // cost

    caster.skillCooldowns = {
      ...(caster.skillCooldowns || {}),
      bol_triple: 2,
    };

    selectedIds.forEach((tId, idx) => {
      const enemy = nextEnemiesList.find((e) => e.id === tId);
      if (enemy && enemy.hp > 0) {
        const isEvaded = resolveDefenseAndEvade(enemy, caster, logs);
        if (!isEvaded) {
          let baseDmg = 14 + caster.stats.DEX * 0.8;
          let dmg = Math.max(1, Math.round(baseDmg - enemy.def));
          const randomFactor = 0.9 + Math.random() * 0.2;
          dmg = Math.round(dmg * randomFactor);
          enemy.hp = Math.max(0, enemy.hp - dmg);
          if (caster.race === "Vampire") {
            totalLifesteal += Math.max(1, Math.round(dmg * 0.2));
          }
          logs = [
            ...logs,
            ...addLog(
              `💥 [Hit #${idx + 1}] arrow pierces ${enemy.name} for ${dmg} damage!`,
              "damage",
            ),
          ];
        } else {
          logs = [
            ...logs,
            ...addLog(
              `💨 [Hit #${idx + 1}] miss-fired past ${enemy.name}!`,
              "info",
            ),
          ];
        }
      }
    });

    if (totalLifesteal > 0) {
      caster.hp = Math.min(caster.maxHp, caster.hp + totalLifesteal);
      logs = [
        ...logs,
        ...addLog(
          `🧛 Lifesteal! ${caster.name} recovers ${totalLifesteal} HP!`,
          "heal",
        ),
      ];
    }

    setCombatParty(nextPartyList);
    setCombatEnemies(nextEnemiesList);

    setSelectedAction(null);
    setSelectedSkill(null);
    setMultiHitTargets([]);
    setMultiHitCountLeft(0);

    wasPlayerActionRef.current = true;
    advanceTurn(nextEnemiesList, logs, nextPartyList);
  };

  const handleMultiHitClick = (enemyId: string, caster: Character) => {
    const updated = [...multiHitTargets, enemyId];
    setMultiHitTargets(updated);
    const left = multiHitCountLeft - 1;
    setMultiHitCountLeft(left);

    if (left === 0) {
      triggerBoltSlingerMultiHit(caster, updated);
    }
  };

  const resolveDefenseAndEvade = (
    enemy: Enemy,
    caster: Character,
    logs: CombatLog[],
  ): boolean => {
    const casterAcc = getDerivedStats(caster).accuracy;
    const targetDodge = getUnitDodge(enemy);
    const hitChance = Math.max(5, Math.min(100, casterAcc - targetDodge));

    if (Math.random() * 100 > hitChance) {
      logs.push({
        id: "evade_" + Date.now(),
        text: `💨 ${enemy.name} slipped past the trajectory! (Hit Chance: ${Math.round(hitChance)}%)`,
        type: "info",
        timestamp: new Date().toLocaleTimeString(),
      });
      return true;
    }
    return false;
  };

  const getCritCalculation = (char: Character) => {
    const derived = getDerivedStats(char);
    return derived.critDamage;
  };

  const getBaseClass = (cl: string): ClassName => {
    if (["Berserker", "Knight"].includes(cl)) return "Warrior";
    if (["Sharpshooter", "Bolt Slinger"].includes(cl)) return "Archer";
    if (["Elementalist", "Summoner"].includes(cl)) return "Mage";
    if (["High Priest", "Inquisitor"].includes(cl)) return "Cleric";
    if (["Assassin", "Duelist"].includes(cl)) return "Rogue";
    if (["Bard of Valor", "Bard of Chaos"].includes(cl)) return "Bard";
    return cl as ClassName;
  };

  const getBaseDamage = (
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

  const getBaseHealing = (
    caster: Character,
    baseHeal: number,
    targetType: TargetType,
  ): number => {
    const hasHealBoost = caster.unlockedTalents?.includes("cle_t1_heal_boost");
    const healBoostMult = hasHealBoost ? 1.15 : 1.0;
    let raw = 0;
    if (targetType === TargetType.ALL_ALLIES) {
      raw = (8 + caster.stats.FTH * 0.8) * baseHeal * healBoostMult;
    } else {
      raw = (10 + caster.stats.FTH * 1.0) * baseHeal * healBoostMult;
    }
    return Math.round(raw);
  };

  const BASIC_STRIKE_SKILL: Skill = {
    id: "basic_strike",
    name: "Strike",
    description:
      "Deals basic physical damage based on primary stat. Cost: 0 Energy.",
    cost: 0,
    targetType: TargetType.SINGLE_ENEMY,
    damageMultiplier: 1.0,
    cooldown: 0,
  };

  const BASIC_GUARD_SKILL: Skill = {
    id: "basic_guard",
    name: "Guard",
    description:
      "Gain Guard: reduces incoming damage by 50% and doubles block chance for this turn. Cost: 0 Energy.",
    cost: 0,
    targetType: TargetType.SELF,
    effect: "guarding",
    effectValue: 1,
    effectDuration: 1,
    cooldown: 0,
  };

  const SKILL_TREE_COMBAT_ACTIONS: Record<string, Skill> = {
    // Warrior
    war_t2_power_strike: {
      id: "war_t2_power_strike",
      name: "Power Strike",
      description:
        "Deal 150% STR as physical damage directly ahead. Cost: 2 Energy. CD: 1 turn. (High STR: Stuns target for 1 turn)",
      cost: 2,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 1.5,
      cooldown: 1,
    },
    war_t3_shield_wall: {
      id: "war_t3_shield_wall",
      name: "Shield Wall",
      description:
        "Reduce all incoming damage by 35% for 2 turns. Cost: 2 Energy. CD: 3 turns.",
      cost: 2,
      targetType: TargetType.SELF,
      effect: "shield_wall",
      effectValue: 35,
      effectDuration: 2,
      cooldown: 3,
    },
    war_t4_taunt: {
      id: "war_t4_taunt",
      name: "Taunt",
      description:
        "Forces all enemies to attack Warrior for 2 turns and suffer -10% ATK. Cost: 1 Energy. CD: 3 turns.",
      cost: 1,
      targetType: TargetType.ALL_ENEMIES,
      effect: "taunt",
      effectValue: 10,
      effectDuration: 2,
      cooldown: 3,
    },
    war_t6_warcry: {
      id: "war_t6_warcry",
      name: "Warcry",
      description:
        "Grant allies +15% ATK for 3 turns. Cost: 2 Energy. CD: 4 turns.",
      cost: 2,
      targetType: TargetType.ALL_ALLIES,
      effect: "multiplier",
      effectValue: 15,
      effectDuration: 3,
      cooldown: 4,
    },
    war_t8_blade_fury: {
      id: "war_t8_blade_fury",
      name: "Blade Fury",
      description:
        "Strike 4 times, each dealing 80% STR. Cost: 3 Energy. CD: 3 turns. Target: 1 enemy column.",
      cost: 3,
      targetType: TargetType.COLUMN,
      damageMultiplier: 3.2,
      cooldown: 3,
    },
    war_t9_fortress: {
      id: "war_t9_fortress",
      name: "Fortress Stance",
      description:
        "+25 DEF, immune to crit/knockback for 3 turns. Cost: 3 Energy. CD: 5 turns.",
      cost: 3,
      targetType: TargetType.SELF,
      effect: "shield",
      effectValue: 25,
      effectDuration: 3,
      cooldown: 5,
    },
    war_t10_titans_wrath: {
      id: "war_t10_titans_wrath",
      name: "Titan's Wrath",
      description:
        "Deal 300% STR AoE physical damage to Columns 1-2 and -20% DEF for 3 turns. Cost: 4 Energy. CD: 6 turns.",
      cost: 4,
      targetType: TargetType.ALL_ENEMIES,
      damageMultiplier: 3.0,
      effect: "vulnerable",
      effectValue: 20,
      effectDuration: 3,
      cooldown: 6,
    },

    // Archer
    arc_t2_quick_shot: {
      id: "arc_t2_quick_shot",
      name: "Quick Shot",
      description:
        "Deal 120% (DEX+STR)/2 physical damage. Cost: 1 Energy. CD: 1 turn.",
      cost: 1,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 1.2,
      cooldown: 1,
    },
    arc_t3_pinning: {
      id: "arc_t3_pinning",
      name: "Pinning Arrow",
      description:
        "Roots target in place for 2 turns. Target takes +15% damage. Cost: 2 Energy. CD: 3 turns.",
      cost: 2,
      targetType: TargetType.SINGLE_ENEMY,
      effect: "vulnerable",
      effectValue: 15,
      effectDuration: 2,
      cooldown: 3,
    },
    arc_t4_power_draw: {
      id: "arc_t4_power_draw",
      name: "Power Draw",
      description:
        "Heavy shot for 200% STR damage. Cost: 2 Energy. CD: 2 turns.",
      cost: 2,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 2.0,
      cooldown: 2,
    },
    arc_t5_fan_arrows: {
      id: "arc_t5_fan_arrows",
      name: "Fan of Arrows",
      description:
        "Deals 90% DEX to 3 enemies (1 per row) in targeted column. Cost: 3 Energy. CD: 3 turns.",
      cost: 3,
      targetType: TargetType.COLUMN,
      damageMultiplier: 0.9,
      cooldown: 3,
    },
    arc_t6_shadow_step: {
      id: "arc_t6_shadow_step",
      name: "Shadow Step",
      description:
        "Reposition. Next attack deals +25% damage. Cost: 1 Energy. CD: 2 turns.",
      cost: 1,
      targetType: TargetType.SELF,
      effect: "multiplier",
      effectValue: 25,
      effectDuration: 2,
      cooldown: 2,
    },
    arc_t7_crippling: {
      id: "arc_t7_crippling",
      name: "Crippling Shot",
      description:
        "Reduce target's SPD by 30% and DEF by 15% for 3 turns. Cost: 2 Energy. CD: 3 turns.",
      cost: 2,
      targetType: TargetType.SINGLE_ENEMY,
      effect: "crippled",
      effectValue: 15,
      effectDuration: 3,
      cooldown: 3,
    },
    arc_t8_barrage: {
      id: "arc_t8_barrage",
      name: "Barrage",
      description:
        "Fire 6 rapid arrows, each dealing 70% DEX. Cost: 3 Energy. CD: 4 turns.",
      cost: 3,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 4.2,
      cooldown: 4,
    },
    arc_t10_deadeye: {
      id: "arc_t10_deadeye",
      name: "Deadeye",
      description:
        "Deal 400% (DEX+STR)/2 physical damage. Always crits, ignores DEF. Cost: 4 Energy. CD: 6 turns.",
      cost: 4,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 4.0,
      cooldown: 6,
    },

    // Mage
    mag_t1_spark: {
      id: "mag_t1_spark",
      name: "Arcane Spark",
      description:
        "Deals 110% INT as magic damage. Cost: 1 Energy. CD: 0 turns.",
      cost: 1,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 1.1,
      cooldown: 0,
    },
    mag_t2_flame_dart: {
      id: "mag_t2_flame_dart",
      name: "Flame Dart",
      description:
        "Deals 120% INT fire damage. Applies Burn DoT. Cost: 2 Energy. CD: 1 turn.",
      cost: 2,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 1.2,
      effect: "burn",
      effectValue: 10,
      effectDuration: 2,
      cooldown: 1,
    },
    mag_t3_frost_nova: {
      id: "mag_t3_frost_nova",
      name: "Frost Nova",
      description:
        "Ice explosion dealing 80% INT and chilling enemies (-20% SPD). Cost: 2 Energy. CD: 2 turns.",
      cost: 2,
      targetType: TargetType.COLUMN,
      damageMultiplier: 0.8,
      cooldown: 2,
    },
    mag_t5_fireball: {
      id: "mag_t5_fireball",
      name: "Fireball",
      description:
        "Deals 180% INT fire damage. Applies Burn to all. Cost: 3 Energy. CD: 3 turns.",
      cost: 3,
      targetType: TargetType.ALL_ENEMIES,
      damageMultiplier: 1.8,
      effect: "burn",
      effectValue: 12,
      effectDuration: 2,
      cooldown: 3,
    },
    mag_t6_glacial: {
      id: "mag_t6_glacial",
      name: "Glacial Lance",
      description:
        "Sweeps row dealing 160% INT, slows by 25% SPD. Cost: 3 Energy. CD: 3 turns.",
      cost: 3,
      targetType: TargetType.COLUMN,
      damageMultiplier: 1.6,
      cooldown: 3,
    },
    mag_t7_shield: {
      id: "mag_t7_shield",
      name: "Mana Shield",
      description:
        "Convert 20% current MP to shield. Lasts 3 turns. Cost: 1 Energy. CD: 4 turns.",
      cost: 1,
      targetType: TargetType.SELF,
      effect: "shield",
      effectValue: 35,
      effectDuration: 3,
      cooldown: 4,
    },
    mag_t10_meteor: {
      id: "mag_t10_meteor",
      name: "Meteor",
      description:
        "Call meteor dealing 500% INT fire damage to 3 columns. Cost: 4 Energy. CD: 7 turns.",
      cost: 4,
      targetType: TargetType.ALL_ENEMIES,
      damageMultiplier: 5.0,
      cooldown: 7,
    },

    // Cleric
    cle_t1_minor_heal: {
      id: "cle_t1_minor_heal",
      name: "Minor Heal",
      description: "Restores 100% FTH as HP. Cost: 1 Energy. CD: 0 turns.",
      cost: 1,
      targetType: TargetType.SINGLE_ALLY,
      healingMultiplier: 1.0,
      cooldown: 0,
    },
    cle_t2_holy_light: {
      id: "cle_t2_holy_light",
      name: "Holy Light",
      description:
        "Deals 120% FTH damage to enemies, heals allies for 60% FTH. Cost: 2 Energy. CD: 2 turns.",
      cost: 2,
      targetType: TargetType.COLUMN,
      damageMultiplier: 1.2,
      healingMultiplier: 0.6,
      cooldown: 2,
    },
    cle_t3_barrier: {
      id: "cle_t3_barrier",
      name: "Barrier",
      description:
        "Absorbs 150% FTH damage. Lasts 2 turns. Cost: 2 Energy. CD: 2 turns.",
      cost: 2,
      targetType: TargetType.SINGLE_ALLY,
      effect: "shield",
      effectValue: 40,
      effectDuration: 2,
      cooldown: 2,
    },
    cle_t4_regenerate: {
      id: "cle_t4_regenerate",
      name: "Regenerate",
      description:
        "Grant HP regen of 30% FTH/turn for 3 turns. Cost: 2 Energy. CD: 3 turns.",
      cost: 2,
      targetType: TargetType.SINGLE_ALLY,
      effect: "regen",
      effectValue: 15,
      effectDuration: 3,
      cooldown: 3,
    },
    cle_t5_purify: {
      id: "cle_t5_purify",
      name: "Purify",
      description:
        "Removes all debuffs and grants +10% DEF. Cost: 1 Energy. CD: 3 turns.",
      cost: 1,
      targetType: TargetType.SINGLE_ALLY,
      cooldown: 3,
    },
    cle_t6_divine_ward: {
      id: "cle_t6_divine_ward",
      name: "Divine Ward",
      description:
        "Barrier absorbing 80% FTH on every ally. Lasts 2 turns. Cost: 3 Energy. CD: 4 turns.",
      cost: 3,
      targetType: TargetType.ALL_ALLIES,
      effect: "shield",
      effectValue: 30,
      effectDuration: 2,
      cooldown: 4,
    },
    cle_t8_resurrection: {
      id: "cle_t8_resurrection",
      name: "Resurrection",
      description:
        "Revives target with 40% HP (once per battle). Cost: 4 Energy. CD: 99 turns.",
      cost: 4,
      targetType: TargetType.SINGLE_ALLY,
      healingMultiplier: 2.0,
      cooldown: 99,
    },
    cle_t9_sacred_ground: {
      id: "cle_t9_sacred_ground",
      name: "Sacred Ground",
      description:
        "Consecrates area: allies regen 20% FTH HP, enemies lose 10% SPD. Cost: 3 Energy. CD: 5 turns.",
      cost: 3,
      targetType: TargetType.ALL_ALLIES,
      effect: "regen",
      effectValue: 20,
      effectDuration: 3,
      cooldown: 5,
    },
    cle_t10_miracle: {
      id: "cle_t10_miracle",
      name: "Miracle",
      description:
        "Fully heals, cleanses debuffs, and grants 200% FTH Barrier to all allies. Cost: 4 Energy. CD: 8 turns.",
      cost: 4,
      targetType: TargetType.ALL_ALLIES,
      healingMultiplier: 5.0,
      effect: "shield",
      effectValue: 60,
      effectDuration: 3,
      cooldown: 8,
    },

    // Rogue
    rog_t2_backstab: {
      id: "rog_t2_backstab",
      name: "Backstab",
      description:
        "Deal 150% DEX damage. +50% if target is distracted. Cost: 2 Energy. CD: 1 turn.",
      cost: 2,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 1.5,
      cooldown: 1,
    },
    rog_t3_cloak: {
      id: "rog_t3_cloak",
      name: "Shadow Cloak",
      description:
        "Stealth for 2 turns (untargetable, next hit guaranteed crit). Cost: 2 Energy. CD: 3 turns.",
      cost: 2,
      targetType: TargetType.SELF,
      effect: "dodge_up",
      effectValue: 50,
      effectDuration: 2,
      cooldown: 3,
    },
    rog_t6_venomous: {
      id: "rog_t6_venomous",
      name: "Venomous Blade",
      description:
        "Coat blade in poison for 3 hits (applies Poison DoT). Cost: 2 Energy. CD: 3 turns.",
      cost: 2,
      targetType: TargetType.SELF,
      effect: "poison",
      effectValue: 15,
      effectDuration: 3,
      cooldown: 3,
    },
    rog_t8_cuts: {
      id: "rog_t8_cuts",
      name: "Thousand Cuts",
      description:
        "Strike 6 times, each dealing 60% DEX. Cost: 3 Energy. CD: 3 turns.",
      cost: 3,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 3.6,
      cooldown: 3,
    },
    rog_t9_mark: {
      id: "rog_t9_mark",
      name: "Predator's Mark",
      description:
        "Mark target for 4 turns (+30% Rogue damage, +15% ally damage). Cost: 2 Energy. CD: 4 turns.",
      cost: 2,
      targetType: TargetType.SINGLE_ENEMY,
      effect: "vulnerable",
      effectValue: 30,
      effectDuration: 4,
      cooldown: 4,
    },
    rog_t10_reaper: {
      id: "rog_t10_reaper",
      name: "Shadow Reaper",
      description:
        "Lethal slash dealing 400% DEX. Double damage if bleeding. Cost: 4 Energy. CD: 6 turns.",
      cost: 4,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 4.0,
      cooldown: 6,
    },

    // Bard
    brd_t1_courage: {
      id: "brd_t1_courage",
      name: "Ballad of Courage",
      description:
        "Grant allies +10% ATK for 3 turns. Cost: 1 Energy. CD: 3 turns.",
      cost: 1,
      targetType: TargetType.ALL_ALLIES,
      effect: "multiplier",
      effectValue: 10,
      effectDuration: 3,
      cooldown: 3,
    },
    brd_t2_hymn: {
      id: "brd_t2_hymn",
      name: "Healing Hymn",
      description:
        "Regenerates 80% CHA HP per turn. Cost: 2 Energy. CD: 3 turns.",
      cost: 2,
      targetType: TargetType.ALL_ALLIES,
      effect: "regen",
      effectValue: 20,
      effectDuration: 3,
      cooldown: 3,
    },
    brd_t3_discord: {
      id: "brd_t3_discord",
      name: "Discordant Note",
      description:
        "Deals 100% CHA magic damage, reduces enemy ATK by 15%. Cost: 2 Energy. CD: 2 turns.",
      cost: 2,
      targetType: TargetType.COLUMN,
      damageMultiplier: 1.0,
      effect: "crippled",
      effectValue: 15,
      effectDuration: 2,
      cooldown: 2,
    },
    brd_t4_fortune: {
      id: "brd_t4_fortune",
      name: "Fortune's Tune",
      description:
        "Increases team LCK by +20 for 3 turns. Cost: 2 Energy. CD: 4 turns.",
      cost: 2,
      targetType: TargetType.ALL_ALLIES,
      cooldown: 4,
    },
    brd_t5_rally: {
      id: "brd_t5_rally",
      name: "Rallying Chorus",
      description:
        "Cleanses Stun/Fear/Silence, grants +20% SPD. Cost: 2 Energy. CD: 4 turns.",
      cost: 2,
      targetType: TargetType.ALL_ALLIES,
      cooldown: 4,
    },
    brd_t6_anthem: {
      id: "brd_t6_anthem",
      name: "Battle Anthem",
      description:
        "All allies deal +20% damage for 3 turns. Cost: 3 Energy. CD: 5 turns.",
      cost: 3,
      targetType: TargetType.ALL_ALLIES,
      effect: "multiplier",
      effectValue: 20,
      effectDuration: 3,
      cooldown: 5,
    },
    brd_t7_lure: {
      id: "brd_t7_lure",
      name: "Siren's Lure",
      description:
        "Charms target to attack their allies for 2 turns. Cost: 3 Energy. CD: 4 turns.",
      cost: 3,
      targetType: TargetType.SINGLE_ENEMY,
      effect: "stun",
      effectValue: 1,
      effectDuration: 2,
      cooldown: 4,
    },
    brd_t10_grand_finale: {
      id: "brd_t10_grand_finale",
      name: "Grand Finale",
      description:
        "Allies +40% ATK, +30% SPD; enemies suffer -20% ATK, -20% SPD. Cost: 4 Energy. CD: 8 turns.",
      cost: 4,
      targetType: TargetType.ALL_ENEMIES,
      damageMultiplier: 2.0,
      cooldown: 8,
    },
  };

  const getSkillsForCharacter = (char: Character): Skill[] => {
    const base = getBaseClass(char.class);

    const strikeSkill = { ...BASIC_STRIKE_SKILL };
    const guardSkill = { ...BASIC_GUARD_SKILL };

    const activeSkills: Skill[] = [];

    // Check if character has a tier 3 class
    const isTier3 = isTier3Class(char.class);

    if (!isTier3) {
      // Base Class active skills unlocked naturally by level (only for non-tier 3 classes)
      const baseSkills = BASE_SKILLS[base] || [];
      if (char.level >= 1 && baseSkills[0]) activeSkills.push(baseSkills[0]);
      if (char.level >= 3 && baseSkills[1]) activeSkills.push(baseSkills[1]);
      if (char.level >= 5 && baseSkills[2]) activeSkills.push(baseSkills[2]);

      // Advanced Class active skills unlocked naturally by level (only for non-tier 3 classes)
      if (char.class in ADVANCED_SKILLS) {
        const advSkills = ADVANCED_SKILLS[char.class as any] || [];
        if (char.level >= 15 && advSkills[0]) activeSkills.push(advSkills[0]);
        if (char.level >= 18 && advSkills[1]) activeSkills.push(advSkills[1]);
        if (char.level >= 21 && advSkills[2]) activeSkills.push(advSkills[2]);
        if (char.level >= 24 && advSkills[3]) activeSkills.push(advSkills[3]);
        if (char.level >= 27 && advSkills[4]) activeSkills.push(advSkills[4]);
      }
    }

    // 3rd Tier Master Class active skills unlocked naturally by level
    if (char.class in TIER3_SKILLS) {
      const t3Skills = TIER3_SKILLS[char.class as any] || [];
      if (char.level >= 30 && t3Skills[0]) activeSkills.push(t3Skills[0]);
      if (char.level >= 35 && t3Skills[1]) activeSkills.push(t3Skills[1]);
    }

    // Subclass active skills unlocked naturally by level (Level 50+)
    if (char.subclass && char.subclass in TIER3_SKILLS) {
      const subSkills = TIER3_SKILLS[char.subclass as any] || [];
      if (char.level >= 50 && subSkills[0]) activeSkills.push(subSkills[0]);
      if (char.level >= 55 && subSkills[1]) activeSkills.push(subSkills[1]);
    }

    return [strikeSkill, guardSkill, ...activeSkills];
  };

  // Check weapon ranges
  const isMeleeColumnOk = (char: Character, enemy: Enemy) => {
    return true;
  };

  return (
    <div
      className={`w-full grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 bg-slate-950/70 border-2 ${getOuterBorderClass()} rounded-xl relative shadow-2xl`}
    >
      {/* Initiative Line Timeline */}
      <div className="lg:col-span-12 bg-slate-900 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between overflow-x-auto gap-4">
        <div className="flex items-center gap-2 font-mono text-xs uppercase font-bold text-amber-500 border-r border-slate-800 pr-3 shrink-0">
          <Swords className="w-4 h-4 shrink-0" />
          Timeline:
        </div>
        <div className="flex gap-2 items-center flex-1 py-1">
          {initiativeOrder.map((id, index) => {
            const char = combatParty.find((p) => p.id === id);
            const enemy = combatEnemies.find((e) => e.id === id);
            const isMyTurn = currentTurnIdx === index;

            if (!char && !enemy) return null;
            const isAlive = char ? char.hp > 0 : enemy ? enemy.hp > 0 : false;
            if (!isAlive) return null;

            return (
              <div
                key={id}
                className={`px-3 py-1.5 rounded text-xs font-mono border transition-all shrink-0 ${
                  isMyTurn
                    ? "bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/30 scale-105"
                    : char
                      ? "bg-slate-900 border-slate-800 text-slate-350"
                      : "bg-slate-950 border-rose-950 text-rose-350"
                }`}
              >
                {char
                  ? `[Roll: ${initiativeRolls[char.id] ?? 0}] 👤 ${char.name} (${char.class})`
                  : `[Roll: ${initiativeRolls[enemy!.id] ?? 0}] 👾 ${enemy!.name}`}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Quit/Kick buttons moved to top */}
          {p2pMode === "multiplayer" && (
            <>
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to quit this battle? Your progress will be lost.")) {
                    onQuit?.();
                  }
                }}
                className="px-3 py-1 rounded bg-slate-900 hover:bg-red-900/40 text-red-400 border border-red-900/60 hover:border-red-600 font-mono text-[10px] font-bold uppercase transition-all"
                title="Quit Battle"
              >
                ⚠️ Quit
              </button>
              <button
                onClick={() => {
                  const kickPlayerId = window.prompt("Enter Player ID to kick (or leave empty to cancel):");
                  if (kickPlayerId && kickPlayerId.trim()) {
                    onKickPlayer?.(kickPlayerId.trim());
                  }
                }}
                className="px-3 py-1 rounded bg-slate-900 hover:bg-orange-900/40 text-orange-400 border border-orange-900/60 hover:border-orange-600 font-mono text-[10px] font-bold uppercase transition-all"
                title="Kick Player"
              >
                🚫 Kick
              </button>
            </>
          )}
          <div className="text-xs font-mono bg-slate-950 text-slate-400 px-3 py-1.5 border border-slate-800 rounded whitespace-nowrap">
            ROUND {round}
          </div>
        </div>
      </div>

      {/* Main 1D Battlefield Line Layout */}
      <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col gap-6 relative overflow-hidden">
        {/* Stage background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none z-0"
          style={{ backgroundImage: `url(${getStageBgImage(chapter)})` }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 z-10 relative">
          {/* PLAYER 1D LINE */}
          <div className="space-y-2 border-r border-slate-800/40 pr-2">
            <h4 className="text-center text-xs font-mono text-amber-400 uppercase font-bold">
              Player Team
            </h4>
            <div className="flex flex-row justify-center gap-3 bg-slate-950 p-4 rounded-lg border border-slate-800/40 relative overflow-x-auto min-h-[160px]">
              {combatParty
                .filter((p) => p.hp > 0)
                .sort((a, b) => a.gridX - b.gridX)
                .map((char) => {
                  return (
                    <div
                      key={char.id}
                      onMouseEnter={() => setHoveredUnitId(char.id)}
                      onMouseLeave={() => setHoveredUnitId(null)}
                      onClick={() => setInfoUnit(char)}
                      className="w-[110px] min-h-[130px] flex flex-col justify-between p-2.5 rounded-md border text-center transition-all bg-slate-900 border-amber-500/30 shadow-md cursor-pointer hover:border-amber-500"
                    >
                      <div className="text-[9px] text-slate-500 font-mono flex justify-between">
                        <span>Slot {char.gridX}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center space-y-1 flex-1 min-h-0">
                        {char.avatarUrl && (
                          <img
                            src={char.avatarUrl}
                            alt={char.name}
                            className="w-12 h-12 rounded-full object-cover border border-slate-700/60 shadow"
                          />
                        )}
                        <span className="text-[10px] font-bold block truncate text-slate-200 w-full text-center leading-tight">
                          {char.name}
                        </span>
                        <span className="text-[9px] font-mono block text-amber-400 leading-none">
                          {char.class}
                        </span>
                        {char.fallenStacks && char.fallenStacks > 0 ? (
                          <span className="text-[8px] font-bold text-red-400 block font-mono animate-pulse leading-none">
                            ⚠️ FALLEN x{char.fallenStacks}
                          </span>
                        ) : null}

                        {/* Small HP indicator */}
                        <div className="w-full max-w-[80px] bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800 mt-1">
                          <div
                            className="bg-red-500 h-full"
                            style={{
                              width: `${(char.hp / char.maxHp) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-[8px] font-mono text-slate-400 leading-none mt-0.5">
                          {char.hp}/{char.maxHp} HP
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* ENEMY 1D LINE */}
          <div className="space-y-2">
            <h4 className="text-center text-xs font-mono text-red-400 uppercase font-bold">
              Enemy Horde
            </h4>
            <div className="flex flex-row justify-center gap-3 bg-slate-950 p-4 rounded-lg border border-slate-800/40 relative overflow-x-auto min-h-[160px]">
              {combatEnemies
                .filter((e) => e.hp > 0)
                .sort((a, b) => a.gridX - b.gridX)
                .map((enemy) => {
                  const isMultiHitTarget = multiHitTargets.includes(enemy.id);
                  return (
                    <div
                      key={enemy.id}
                      onMouseEnter={() => setHoveredUnitId(enemy.id)}
                      onMouseLeave={() => setHoveredUnitId(null)}
                      onClick={() => {
                        if (
                          multiHitCountLeft > 0 &&
                          activeTurn &&
                          activeTurn.type === "player"
                        ) {
                          handleMultiHitClick(enemy.id, activeTurn.obj);
                        } else {
                          setInfoUnit(enemy);
                        }
                      }}
                      className={`w-[110px] min-h-[130px] flex flex-col justify-between p-2.5 rounded-md border text-center transition-all ${
                        isMultiHitTarget
                          ? "bg-red-950 border-red-500 scale-95 shadow-lg animate-pulse cursor-pointer"
                          : "bg-slate-900 border-red-900/40 shadow hover:border-red-500/55 cursor-pointer"
                      }`}
                    >
                      <div className="text-[9px] text-slate-500 font-mono flex justify-between">
                        <span>Slot {enemy.gridX}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center space-y-1 flex-1 min-h-0">
                        {enemy.avatarUrl && (
                          <img
                            src={enemy.avatarUrl}
                            alt={enemy.name}
                            className="w-12 h-12 rounded-full object-cover border border-slate-700/60 shadow"
                          />
                        )}
                        <span className="text-[10px] font-bold block truncate text-slate-100 w-full text-center leading-tight">
                          {enemy.name}
                        </span>
                        <div className="w-full max-w-[80px] bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800 mt-1">
                          <div
                            className="bg-red-500 h-full"
                            style={{
                              width: `${(enemy.hp / enemy.maxHp) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-[8px] font-mono text-slate-400 leading-none mt-0.5">
                          {enemy.hp}/{enemy.maxHp} HP
                        </span>
                        {isMultiHitTarget && (
                          <span className="text-[8px] font-mono bg-red-600 text-white px-1.5 rounded font-bold leading-none mt-1">
                            Triggered
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Turn Action Menu Panels */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/60 mt-2">
          {activeTurn && activeTurn.type === "player" ? (
            p2pMode === "multiplayer" && activeTurn.obj.id !== myPlayerId ? (
              <div className="text-center py-6">
                <p className="text-sm font-mono text-slate-500 italic animate-pulse">
                  ⏳ Waiting for{" "}
                  <strong className="text-amber-400 font-bold">
                    {activeTurn.obj.name}
                  </strong>{" "}
                  to choose their action...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-3 gap-2">
                  <div className="flex items-center gap-2.5">
                    {activeTurn.obj.avatarUrl && (
                      <img
                        src={activeTurn.obj.avatarUrl}
                        alt={activeTurn.obj.name}
                        className="w-9 h-9 rounded-full object-cover border border-amber-500/30"
                      />
                    )}
                    <div>
                      <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-bold block">
                        Your Active turn
                      </span>
                      <h3 className="text-lg font-mono font-bold text-slate-100 leading-tight">
                        🛡️ {activeTurn.obj.name}{" "}
                        <span className="text-amber-400 font-normal text-sm">
                          ({activeTurn.obj.class})
                        </span>
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-xs text-slate-400">
                      Energy:{" "}
                      <span className="text-amber-400 font-bold">
                        {activeTurn.obj.energy}/{activeTurn.obj.maxEnergy}
                      </span>
                    </div>
                    <div className="font-mono text-xs text-slate-400">
                      HP:{" "}
                      <span className="text-red-500 font-bold">
                        {activeTurn.obj.hp}/{activeTurn.obj.maxHp}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bolt Slinger click selector alert banner */}
                {multiHitCountLeft > 0 && (
                  <div className="p-3 bg-red-950/40 border border-red-500/20 rounded font-mono text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span>
                      Choose targets click <strong>{multiHitCountLeft}</strong>{" "}
                      times inside the enemy grid boxes!
                    </span>
                  </div>
                )}

                {/* Action Tabs selection */}
                {multiHitCountLeft === 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedAction("fight");
                        setSelectedSkill(null);
                      }}
                      className={`flex-1 py-2 rounded font-mono text-xs font-bold uppercase transition-all ${
                        selectedAction === "fight"
                          ? "bg-amber-500 text-slate-950 shadow shadow-amber-500/25"
                          : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-amber-500/30"
                      }`}
                    >
                      Fight Actions
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAction("items");
                        setSelectedSkill(null);
                      }}
                      className={`flex-1 py-2 rounded font-mono text-xs font-bold uppercase transition-all ${
                        selectedAction === "items"
                          ? "bg-amber-500 text-slate-950 shadow shadow-amber-500/25"
                          : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-amber-500/30"
                      }`}
                    >
                      Buff Potions
                    </button>
                    <button
                      onClick={() => handleFocus(activeTurn.obj)}
                      className="flex-1 py-2 rounded bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-emerald-950 font-mono text-xs font-bold uppercase"
                    >
                      Concentrate Focus (+2 Energy)
                    </button>
                  </div>
                )}

                {/* Fight: list skills */}
                {selectedAction === "fight" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                    {getSkillsForCharacter(activeTurn.obj).map((skill) => {
                      const currentCD =
                        activeTurn.obj.skillCooldowns?.[skill.id] || 0;
                      const cooldownReady = currentCD === 0;
                      const energySatisfied =
                        activeTurn.obj.energy >= skill.cost;
                      const isUsable = energySatisfied && cooldownReady;

                      return (
                        <button
                          key={skill.id}
                          onClick={() => {
                            if (!isUsable) return;

                            // Handle multi hit setup for Bolt Slinger
                            if (skill.targetType === TargetType.MULTI_HIT) {
                              setMultiHitCountLeft(3);
                              setMultiHitTargets([]);
                              setSelectedSkill(skill);
                              return;
                            }

                            setSelectedSkill(skill);
                          }}
                          disabled={!isUsable}
                          className={`p-3 text-left rounded-lg border transition-all ${
                            selectedSkill?.id === skill.id
                              ? "bg-slate-900 border-amber-400"
                              : isUsable
                                ? "bg-slate-900/60 border-slate-800 hover:border-amber-500/30"
                                : "bg-slate-900/50 border-slate-900/80 cursor-not-allowed opacity-40"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold text-slate-100">
                              {skill.name}
                            </span>
                            <div className="flex gap-1.5 items-center">
                              {currentCD > 0 && (
                                <span className="text-[10px] font-mono font-bold text-rose-400 px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded">
                                  CD: {currentCD}
                                </span>
                              )}
                              <span className="text-xs font-mono font-semibold text-amber-500 px-1.5 py-0.5 bg-amber-500/5 border border-amber-500/10 rounded">
                                {skill.cost} E
                              </span>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-normal">
                            {skill.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Target choosing menu if skill selected */}
                {selectedSkill &&
                  selectedSkill.targetType !== TargetType.MULTI_HIT && (
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 mt-2 space-y-3">
                      <h4 className="text-xs font-mono uppercase text-amber-400 font-bold">
                        Target Selection Area
                      </h4>

                      {/* Single Enemy selection target lists */}
                      {(selectedSkill.targetType === TargetType.SINGLE_ENEMY ||
                        selectedSkill.targetType === TargetType.COLUMN) && (
                        <div className="flex flex-wrap gap-2">
                          {combatEnemies
                            .filter((e) => e.hp > 0)
                            .map((enemy) => (
                              <button
                                key={enemy.id}
                                onMouseEnter={() => setHoveredUnitId(enemy.id)}
                                onMouseLeave={() => setHoveredUnitId(null)}
                                onClick={() =>
                                  castSkillOnTarget(
                                    activeTurn.obj,
                                    selectedSkill,
                                    enemy.id,
                                  )
                                }
                                className="px-3 py-1.5 rounded bg-slate-950 border border-red-900/40 text-slate-300 hover:border-red-500 hover:text-red-400 font-mono text-xs transition-all flex items-center gap-1.5"
                              >
                                {enemy.avatarUrl && (
                                  <img
                                    src={enemy.avatarUrl}
                                    alt=""
                                    className="w-4.5 h-4.5 rounded-full object-cover border border-slate-850"
                                  />
                                )}
                                Target {enemy.name} (Slot {enemy.gridX})
                              </button>
                            ))}
                        </div>
                      )}

                      {/* Single Ally target list */}
                      {selectedSkill.targetType === TargetType.SINGLE_ALLY && (
                        <div className="flex flex-wrap gap-2">
                          {combatParty
                            .filter((p) => p.hp > 0)
                            .map((ally) => (
                              <button
                                key={ally.id}
                                onMouseEnter={() => setHoveredUnitId(ally.id)}
                                onMouseLeave={() => setHoveredUnitId(null)}
                                onClick={() =>
                                  castSkillOnTarget(
                                    activeTurn.obj,
                                    selectedSkill,
                                    ally.id,
                                  )
                                }
                                className="px-3 py-1.5 rounded bg-slate-950 border border-indigo-900/30 text-slate-300 hover:border-indigo-400 hover:text-indigo-300 font-mono text-xs transition-all flex items-center gap-1.5"
                              >
                                {ally.avatarUrl && (
                                  <img
                                    src={ally.avatarUrl}
                                    alt=""
                                    className="w-4.5 h-4.5 rounded-full object-cover border border-slate-850"
                                  />
                                )}
                                Target {ally.name}
                              </button>
                            ))}
                        </div>
                      )}

                      {/* Self or Global casts */}
                      {(selectedSkill.targetType === TargetType.SELF ||
                        selectedSkill.targetType === TargetType.ALL_ALLIES ||
                        selectedSkill.targetType ===
                          TargetType.ALL_ENEMIES) && (
                        <button
                          onClick={() =>
                            castSkillOnTarget(
                              activeTurn.obj,
                              selectedSkill,
                              activeTurn.obj.id,
                            )
                          }
                          className="w-full py-2.5 bg-amber-500 text-slate-950 font-mono font-bold hover:brightness-110 rounded text-xs uppercase"
                        >
                          Confirm Global Cast: [{selectedSkill.name}]
                        </button>
                      )}
                    </div>
                  )}

                {/* Items tab pot selection */}
                {selectedAction === "items" && (
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                    <h4 className="text-xs font-mono uppercase text-amber-400 font-bold">
                      Consumable Satchel
                    </h4>
                    {(() => {
                      const consumables = getConsumables(activeTurn.obj);
                      if (consumables.length === 0) {
                        return (
                          <p className="text-xs text-slate-500 font-mono italic text-center py-2">
                            No consumables available in satchel!
                          </p>
                        );
                      }
                      return (
                        <div className="grid grid-cols-2 gap-2">
                          {consumables.map((c) => {
                            let effectLabel = "";
                            let emoji = "🧪";
                            if (c.id === "minor_heal") {
                              emoji = "💖";
                              effectLabel = "+75 HP";
                            } else if (c.id === "major_heal") {
                              emoji = "💖";
                              effectLabel = "+150 HP";
                            } else if (c.id === "regeneration_elixir") {
                              emoji = "✨";
                              effectLabel = "Regen 10T";
                            } else if (c.id === "energy_brew") {
                              emoji = "⚡";
                              effectLabel = "+2 Energy";
                            } else if (c.id === "greater_healing_draught") {
                              emoji = "💖";
                              effectLabel = "+50 HP";
                            }

                            return (
                              <button
                                key={c.id}
                                onClick={() =>
                                  handleUsePotion(activeTurn.obj, c.id)
                                }
                                className="p-2 bg-slate-950 border border-slate-800 text-slate-300 hover:border-amber-500/40 text-xs font-mono rounded flex justify-between items-center"
                              >
                                <span className="truncate">
                                  {emoji} {c.name} ({c.quantity ?? 1})
                                </span>
                                <span className="text-amber-400 text-[10px] shrink-0 ml-1.5">
                                  {effectLabel}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="text-center py-6">
              <p className="text-sm font-mono text-slate-500 italic">
                Waiting on opponent/enemy actor actions...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Combat Feed Log Logs Console */}
      <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between h-[450px] lg:h-auto animate-[fadeIn_0.2s_ease-out]">
        <div className="space-y-3">
          {/* Prediction card relocated to absolute container */}

          <h4 className="text-xs font-mono text-amber-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-amber-500" /> Battle Log feed
          </h4>

          <div className="space-y-2 h-[340px] overflow-y-auto pr-1 flex flex-col-reverse text-[11px] font-mono leading-relaxed select-text">
            {combatLogs
              .slice()
              .reverse()
              .map((log) => {
                let color = "text-slate-400";
                if (log.type === "damage") color = "text-red-400";
                else if (log.type === "heal") color = "text-emerald-400";
                else if (log.type === "status") color = "text-indigo-400";
                else if (log.type === "system")
                  color = "text-amber-500 font-bold";

                return (
                  <div
                    key={log.id}
                    className={`p-2 rounded bg-slate-950/40 border-l-2 border-slate-800/80 ${color}`}
                  >
                    <span className="text-[9px] text-slate-600 block mb-0.5">
                      {log.timestamp}
                    </span>
                    <div dangerouslySetInnerHTML={{ __html: log.text }} />
                  </div>
                );
              })}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-3 mt-3 flex justify-between items-center text-xs text-slate-400 font-mono">
          <span>
            Active Party: {combatParty.filter((p) => p.hp > 0).length} Alive
          </span>
          <span>
            Chapter Target Hostile:{" "}
            {combatEnemies.filter((e) => e.hp > 0).length} Left
          </span>
        </div>
      </div>

      {/* Absolute positioned combat prediction card */}
      {(() => {
        const prediction = getPrediction();
        if (!prediction) return null;
        return (
          <div className="absolute top-[12%] right-[4%] w-[30%] h-[50%] min-h-[300px] z-50 overflow-y-auto bg-slate-950/95 border-2 border-amber-500/50 rounded-xl shadow-2xl backdrop-blur-md p-4 flex flex-col gap-2.5 text-xs mb-3 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 mb-1">
              <span className="font-bold text-amber-400 font-mono uppercase tracking-wider animate-pulse">
                ⚔️ PREVIEW: {prediction.skillName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Target: {prediction.targetName}
              </span>
            </div>
            {prediction.type === "damage" ? (
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-slate-900 p-2 rounded border border-slate-850">
                  <span className="text-[9px] text-slate-500 block">
                    HIT CHANCE
                  </span>
                  <span className="text-sm font-bold text-emerald-400">
                    {Math.round(prediction.hitChance)}%
                  </span>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-850">
                  <span className="text-[9px] text-slate-500 block">
                    EST. DAMAGE
                  </span>
                  <span className="text-sm font-bold text-red-450">
                    {prediction.minDmg} - {prediction.maxDmg}
                  </span>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-850">
                  <span className="text-[9px] text-slate-500 block">
                    CRIT CHANCE
                  </span>
                  <span className="text-sm font-bold text-amber-500">
                    {Math.round(prediction.critChance)}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-center font-mono">
                <div className="bg-slate-900 p-2 rounded border border-slate-850">
                  <span className="text-[9px] text-slate-500 block">
                    HEAL VALUE
                  </span>
                  <span className="text-sm font-bold text-emerald-400">
                    +{prediction.heal} HP
                  </span>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-850">
                  <span className="text-[9px] text-slate-500 block">
                    SHIELD VALUE
                  </span>
                  <span className="text-sm font-bold text-indigo-400">
                    +{prediction.shield} Shield
                  </span>
                </div>
              </div>
            )}
            {prediction.type === "damage" && (
              <div className="text-[10px] text-slate-400 font-mono text-center mt-1">
                Crit Damage:{" "}
                <span className="text-amber-500 font-bold">
                  {prediction.minCritDmg} - {prediction.maxCritDmg}
                </span>{" "}
                (reduced by flat {prediction.targetDef} DEF)
              </div>
            )}
            {prediction.aggroShare !== undefined && (
              <div className="text-[10px] text-slate-400 font-mono text-center mt-1">
                Target Aggro Share:{" "}
                <span className="text-rose-450 font-bold">
                  {prediction.aggroShare}%
                </span>
              </div>
            )}
          </div>
        );
      })()}

      {/* Interactive detailed unit info sheet overlay */}
      {infoUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 font-mono select-text">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-500/50 rounded-xl p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setInfoUnit(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-mono text-sm uppercase cursor-pointer"
            >
              ✕ Close
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              {infoUnit.avatarUrl && (
                <img
                  src={infoUnit.avatarUrl}
                  alt={infoUnit.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-700"
                />
              )}
              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  {infoUnit.name}
                </h3>
                <span className="text-xs text-amber-400">
                  {"class" in infoUnit
                    ? `${infoUnit.race || "Human"} ${infoUnit.class} (Lv ${infoUnit.level})`
                    : `Monster Horde - ${infoUnit.name}`}
                </span>
              </div>
            </div>

            {/* Stats list */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                Attributes
              </span>
              {"class" in infoUnit ? (
                (() => {
                  const derived = getDerivedStats(infoUnit as Character);
                  return (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">STR (Strength)</span>
                        <strong className="text-slate-200">
                          {derived.combinedStats.STR}
                        </strong>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">DEX (Dexterity)</span>
                        <strong className="text-slate-200">
                          {derived.combinedStats.DEX}
                        </strong>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">
                          CON (Constitution)
                        </span>
                        <strong className="text-slate-200">
                          {derived.combinedStats.CON}
                        </strong>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">
                          INT (Intelligence)
                        </span>
                        <strong className="text-slate-200">
                          {derived.combinedStats.INT}
                        </strong>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">FTH (Faith)</span>
                        <strong className="text-slate-200">
                          {derived.combinedStats.FTH}
                        </strong>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">CHA (Charisma)</span>
                        <strong className="text-slate-200">
                          {derived.combinedStats.CHA}
                        </strong>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">LCK (Luck)</span>
                        <strong className="text-slate-200">
                          {derived.combinedStats.LCK}
                        </strong>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">ATK</span>
                        <strong className="text-emerald-400">
                          {derived.atk}
                        </strong>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">DEF</span>
                        <strong className="text-indigo-400">
                          {derived.def}
                        </strong>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">CRIT %</span>
                        <strong className="text-amber-400">
                          {derived.critChance.toFixed(0)}%
                        </strong>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">DODGE %</span>
                        <strong className="text-blue-400">
                          {derived.dodgeChance.toFixed(0)}%
                        </strong>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">BLOCK %</span>
                        <strong className="text-orange-400">
                          {derived.blockChance.toFixed(0)}%
                        </strong>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                    <span className="text-slate-400">HP</span>
                    <strong className="text-red-400">
                      {infoUnit.hp} / {infoUnit.maxHp}
                    </strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                    <span className="text-slate-400">ATK</span>
                    <strong className="text-emerald-400">{infoUnit.atk}</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                    <span className="text-slate-400">DEF</span>
                    <strong className="text-indigo-400">{infoUnit.def}</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                    <span className="text-slate-400">CRIT CHANCE</span>
                    <strong className="text-amber-400">
                      {infoUnit.critChance}%
                    </strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                    <span className="text-slate-400">DODGE CHANCE</span>
                    <strong className="text-blue-400">
                      {infoUnit.dodgeChance}%
                    </strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between col-span-2">
                    <span className="text-slate-400">AI TARGETING TYPE</span>
                    <strong className="text-amber-400 capitalize">
                      {infoUnit.aiType}
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {/* Skills / Cooldowns list */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                Skills & Cooldowns
              </span>
              <div className="space-y-2">
                {"class" in infoUnit ? (
                  getSkillsForCharacter(infoUnit as Character).map((s) => {
                    const cd = infoUnit.skillCooldowns?.[s.id] || 0;
                    return (
                      <div
                        key={s.id}
                        className="p-2.5 bg-slate-950 rounded border border-slate-800 space-y-1"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <strong className="text-slate-200">{s.name}</strong>
                          <div className="flex gap-2">
                            <span className="text-amber-400 text-[10px]">
                              {s.cost} E
                            </span>
                            {cd > 0 && (
                              <span className="text-red-400 text-[10px] font-bold">
                                CD: {cd} turns left
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          {s.description}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[11.5px] text-slate-500 italic">
                    No customizable spells. Enemy relies on standard automation
                    actions.
                  </p>
                )}
              </div>
            </div>

            {/* Status effects */}
            {infoUnit.statusEffects.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                  Active Status Effects
                </span>
                <div className="flex flex-wrap gap-2">
                  {infoUnit.statusEffects.map((se, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-indigo-950/40 border border-indigo-900/60 rounded text-[10px] text-indigo-300"
                    >
                      {se.type.toUpperCase()} (Value: {se.value}, Duration:{" "}
                      {se.duration}T)
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getThemedEquipChoices(enemyName: string, aiType: string): string[] {
  const name = enemyName.toLowerCase();

  // Spellcaster/Mana themes
  if (
    name.includes("mandrake") ||
    name.includes("spore") ||
    name.includes("lich") ||
    name.includes("imp") ||
    name.includes("succubus") ||
    name.includes("necromancer") ||
    name.includes("disciple") ||
    aiType === "spellcaster"
  ) {
    return [
      "apprentice_staff",
      "holy_tome",
      "cloth_robes",
      "ruby_pendant",
      "sapphire_ring",
      "saint_rosary",
    ];
  }

  // Thief/Assassin/Dodge themes
  if (
    name.includes("scout") ||
    name.includes("wolf") ||
    name.includes("spider") ||
    name.includes("stalker") ||
    name.includes("jelly") ||
    name.includes("hound")
  ) {
    return [
      "bronze_dagger",
      "composite_bow",
      "leather_jerkin",
      "brass_ring",
      "lucky_clover",
      "willow_lute",
    ];
  }

  // Tank/Shield/Armored themes
  if (
    name.includes("tortoise") ||
    name.includes("sentry") ||
    name.includes("gargoyle") ||
    name.includes("golem") ||
    name.includes("knight") ||
    name.includes("giant") ||
    name.includes("drake") ||
    aiType === "tank"
  ) {
    return ["iron_sword", "chainmail_chest", "brass_ring", "ruby_pendant"];
  }

  // Fallback default choices
  return [
    "iron_sword",
    "composite_bow",
    "apprentice_staff",
    "holy_tome",
    "bronze_dagger",
    "willow_lute",
    "cloth_robes",
    "leather_jerkin",
    "chainmail_chest",
    "brass_ring",
    "ruby_pendant",
    "sapphire_ring",
    "lucky_clover",
    "saint_rosary",
  ];
}
