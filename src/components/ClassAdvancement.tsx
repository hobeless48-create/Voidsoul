/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Character, CharacterClass } from "../types";
import { ADVANCED_PATHS, ADVANCED_SKILLS, TIER3_SKILLS } from "../skills_db";
import { Sparkles, Swords, Award } from "lucide-react";

interface ClassAdvancementProps {
  character: Character;
  onAdvance: (charId: string, choice: CharacterClass) => void;
}

const TIER3_PATHS: Record<string, string> = {
  Berserker: "Warlord",
  Knight: "Paladin",
  Sharpshooter: "Hawkeye",
  "Bolt Slinger": "Storm Dancer",
  Elementalist: "Archmage",
  Summoner: "Void Caller",
  "High Priest": "Seraph",
  Inquisitor: "Crusader",
  Assassin: "Phantom",
  Duelist: "Blade Saint",
  "Bard of Valor": "Herald of Glory",
  "Bard of Chaos": "Entropy Singer",
};

const SUBCLASS_DESCRIPTIONS: Record<string, string> = {
  Warlord: "High damage melee physical scaling. Gain access to Warcry Slam and Conqueror's Bloodlust.",
  Paladin: "Divine protection tank. Gain access to Sacred Aegis and King's Judgment.",
  Hawkeye: "Master marksman with guaranteed critical hits. Rain of Judgement and One True Shot.",
  "Storm Dancer": "Fast bolt firing. Maelstrom Volley and Storm Form multi-attacks.",
  Archmage: "Devastating elemental multi-hits and singularity collapse spells.",
  "Void Caller": "Summon massive Void Colossus and trigger Rift Cascades.",
  Seraph: "Ultimate holy heals, shields, and debuff purification.",
  Crusader: "Retribution paladin. Heaven's Reckoning and divine immunities.",
  Phantom: "Shadow executioner. Soul Sever and Death Marks.",
  "Blade Saint": "Perfect parry stance and critical counter-attacks.",
  "Herald of Glory": "Epic refrains that reset ally cooldowns and songs of transcendence.",
  "Entropy Singer": "Chaotic debuffs, silent discord waves, and stat-reducing curses.",
};

export function ClassAdvancement({ character, onAdvance }: ClassAdvancementProps) {
  const level = character.level;

  // Tier 5: level >= 75
  if (level >= 75) {
    return (
      <div className="w-full max-w-md mx-auto bg-slate-900 border-2 border-amber-500/50 rounded-xl p-6 text-slate-100 shadow-2xl space-y-6 text-center">
        <Award className="w-10 h-10 text-amber-400 mx-auto animate-pulse" />
        <h2 className="text-xl md:text-2xl font-mono font-bold uppercase tracking-widest text-amber-400">
          Tier 5 Prestige (Level 75)
        </h2>
        <p className="text-sm text-slate-300">
          {character.name} has unlocked the legendary Tier 5 milestone!
        </p>
        <div className="p-4 bg-slate-950 border border-slate-800 rounded text-slate-400 text-xs font-mono">
          [Tier 5 skills and final path options are currently locked in this build]
        </div>
        <button
          onClick={() => onAdvance(character.id, character.class)}
          className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs uppercase rounded cursor-pointer transition-all"
        >
          Acknowledge
        </button>
      </div>
    );
  }

  // Tier 4: level >= 50
  if (level >= 50) {
    const refundedPoints = (character.level - 1) * ((character.race || "Human") === "Human" ? 4 : 3);
    const allTier3 = Object.values(TIER3_PATHS);
    const currentClass = character.class;
    // Get other subclasses
    const options = allTier3.filter(c => c !== currentClass);

    return (
      <div className="w-full max-w-4xl mx-auto bg-slate-900 border-2 border-amber-500/50 rounded-xl p-6 text-slate-100 shadow-2xl space-y-6">
        <div className="text-center space-y-2 border-b border-slate-800 pb-4">
          <Award className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
          <h2 className="text-xl md:text-2xl font-mono font-bold uppercase tracking-widest text-amber-400">
            Tier 4 Subclass Selection
          </h2>
          <p className="text-xs text-slate-400">
            {character.name} has crossed the Level 50 threshold! Dual-class by choosing a subclass.
          </p>
          <div className="mt-3 p-3 bg-red-950/40 border border-red-500/20 text-red-200 text-xs font-mono rounded max-w-2xl mx-auto text-left">
            ⚠️ <strong>WARNING:</strong> Selecting a subclass resets your allocated stats back to your base class start stats. All spent stat points will be refunded. You will receive exactly <strong className="text-amber-400 font-bold">{refundedPoints}</strong> stat points to redistribute.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
          {options.map(subChoice => {
            const skills = TIER3_SKILLS[subChoice] || [];
            return (
              <div
                key={subChoice}
                className="p-4 bg-slate-950 rounded-lg border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <span className="text-[9px] font-mono text-amber-500 font-bold uppercase px-2 py-0.5 bg-amber-500/5 border border-amber-500/10 rounded inline-block">
                    Subclass Path
                  </span>
                  <h3 className="text-base font-mono font-bold text-slate-200">{subChoice}</h3>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {SUBCLASS_DESCRIPTIONS[subChoice] || "Prestige dual-class choice."}
                  </p>
                  <div className="space-y-1 pt-2 border-t border-slate-850">
                    <span className="text-[9px] font-mono uppercase text-slate-500 block">Subclass Skills:</span>
                    {skills.map(s => (
                      <div key={s.id} className="text-[10.5px] font-mono text-slate-300 leading-tight">
                        ✨ <strong>{s.name}</strong> <span className="text-[9px] text-amber-500">[{s.cost} E]</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => onAdvance(character.id, subChoice as any)}
                  className="w-full py-2 mt-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs uppercase rounded cursor-pointer transition-all"
                >
                  Choose {subChoice}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Tier 3: level >= 30
  if (level >= 30) {
    const nextClass = TIER3_PATHS[character.class];
    if (!nextClass) return null;
    const skills = TIER3_SKILLS[nextClass] || [];

    return (
      <div className="w-full max-w-xl mx-auto bg-slate-900 border-2 border-amber-500/50 rounded-xl p-6 text-slate-100 shadow-2xl space-y-6">
        <div className="text-center space-y-2 border-b border-slate-800 pb-4">
          <Award className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
          <h2 className="text-xl md:text-2xl font-mono font-bold uppercase tracking-widest text-amber-400">
            Tier 3 Prestige Ascension
          </h2>
          <p className="text-xs text-slate-400">
            {character.name} has crossed the Level 30 threshold! Ascend directly to their master class.
          </p>
        </div>

        <div className="p-5 bg-slate-950 rounded-lg border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] font-mono text-amber-500 font-bold uppercase px-2 py-0.5 bg-amber-500/5 border border-amber-500/10 rounded">
                Master Prestige Class
              </span>
              <h3 className="text-xl font-mono font-bold text-slate-200 mt-1">{character.class} → {nextClass}</h3>
            </div>
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>

          <p className="text-xs text-slate-400 leading-relaxed leading-normal">
            Ascending to {nextClass} unlocks powerful tier-3 master skills, amplified base attributes, and enhances overall combat scaling.
          </p>

          <div className="space-y-2 pt-3 border-t border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Unlocked Master Skills:</span>
            {skills.map(s => (
              <div key={s.id} className="p-2 bg-slate-900 border border-slate-800 rounded space-y-1">
                <div className="flex justify-between text-xs font-mono text-slate-200">
                  <span>💎 <strong>{s.name}</strong></span>
                  <span className="text-amber-500">Cost: {s.cost} Energy</span>
                </div>
                <p className="text-[11px] text-slate-400">{s.description}</p>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded space-y-1">
            <span className="text-[10px] font-mono uppercase text-amber-400 block font-bold">Passive Amplification:</span>
            <p className="text-[11px] text-slate-300">
              Attributes will scale more effectively. Gain +15% global defense and +10% skill damage multiplier.
            </p>
          </div>
        </div>

        <button
          onClick={() => onAdvance(character.id, nextClass as any)}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-sm uppercase rounded cursor-pointer transition-all"
        >
          Ascend to {nextClass}
        </button>
      </div>
    );
  }

  // Tier 2: level >= 15 (default fallthrough paths)
  const baseClass = character.class;
  const paths = ADVANCED_PATHS[baseClass as any] || [];

  if (paths.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 border-2 border-amber-500/50 rounded-xl p-6 text-slate-100 shadow-2xl space-y-6">
      
      <div className="text-center space-y-2 border-b border-slate-800 pb-4">
        <Award className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
        <h2 className="text-xl md:text-2xl font-mono font-bold uppercase tracking-widest text-amber-400">
          Advanced Prestige Unlock
        </h2>
        <p className="text-xs text-slate-400">
          {character.name} has crossed Level 15 threshold! Forge their ultimate destiny path.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paths.map(advChoice => {
          const skills = ADVANCED_SKILLS[advChoice] || [];
          return (
            <div
              key={advChoice}
              className="p-5 bg-slate-950 rounded-lg border border-slate-800 hover:border-amber-500/30 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-amber-500 font-bold uppercase px-2 py-0.5 bg-amber-500/5 border border-amber-500/10 rounded">
                  Guild Prestige Path
                </span>
                <h3 className="text-lg font-mono font-bold text-slate-200">{advChoice}</h3>
                
                <p className="text-xs text-slate-400 leading-relaxed leading-normal">
                  {advChoice === "Berserker" && "Risky high physical lifesteal slashing combatant. Unleash inner madness."}
                  {advChoice === "Knight" && "Stalwart shield bearer. Places shielding blocks over columns and columns of tactical lanes."}
                  {advChoice === "Sharpshooter" && "Focuses on massive ranged singular target executing snipers. Bypasses evade."}
                  {advChoice === "Bolt Slinger" && "Speeds swift multi-attacks targeting 3 times. Splinters normal shoots on columns."}
                  {advChoice === "Elementalist" && "Unleashes hellfire element waves, freezing all opponents in thick frosts."}
                  {advChoice === "Summoner" && "Spawns active combat familiars on the 3x3 battlefield grid that fire on enemies."}
                  {advChoice === "High Priest" && "Archangels level heals, cleanses all DoT and status on the whole party."}
                  {advChoice === "Inquisitor" && "Holy crusader. Deals Saintly magic smites and returns damage equally to heal allies."}
                  {advChoice === "Assassin" && "Inflicts lethal poisons and bleeding cuts. Deals triple scaling on sick enemies."}
                  {advChoice === "Duelist" && "Enters swift dodge, counter-striking all offending invaders instantly."}
                  {advChoice === "Bard of Valor" && "Symphonizes defensive auras, dodging, block triggers and boosts overall morale."}
                  {advChoice === "Bard of Chaos" && "Brings discord wails, hexing, curses, curses and chaotic burning screams."}
                </p>

                <div className="space-y-1 pt-2 border-t border-slate-850">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Prestige Ultimates:</span>
                  {skills.map(s => (
                    <div key={s.id} className="text-xs font-mono text-slate-300">
                      🔥 <strong>{s.name}</strong> <span className="text-[10px] text-amber-500">[{s.cost} E]</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onAdvance(character.id, advChoice)}
                className="w-full py-2.5 mt-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs uppercase rounded cursor-pointer"
              >
                Promote to {advChoice}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
