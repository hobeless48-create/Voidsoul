/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Skill, TargetType, ClassName, AdvancedClassName, Stats, CharacterClass, Equipment } from "./types";
import { TALENT_TREES } from "./talents_db";

export const START_STATS: Record<ClassName, Stats> = {
  Warrior: { STR: 12, DEX: 6, CON: 14, INT: 4, FTH: 4, CHA: 4, LCK: 6 },
  Archer: { STR: 8, DEX: 14, CON: 8, INT: 6, FTH: 4, CHA: 5, LCK: 7 },
  Mage: { STR: 4, DEX: 8, CON: 6, INT: 15, FTH: 5, CHA: 6, LCK: 6 },
  Cleric: { STR: 6, DEX: 6, CON: 10, INT: 5, FTH: 14, CHA: 7, LCK: 4 },
  Rogue: { STR: 6, DEX: 13, CON: 7, INT: 4, FTH: 4, CHA: 5, LCK: 13 },
  Bard: { STR: 5, DEX: 9, CON: 7, INT: 7, FTH: 8, CHA: 14, LCK: 12 },
};

export const CLASS_AVATARS: Partial<Record<CharacterClass, string>> = {
  Warrior: "https://thumbs.dreamstime.com/z/brave-cartoon-warrior-sword-shield-ready-battle-adorable-cartoon-warrior-stands-proudly-sword-hand-shield-386677332.jpg",
  Archer: "https://thumbs.dreamstime.com/b/chibi-archer-character-illustration-cartoon-boy-bow-arrows-cute-style-perfect-fantasy-game-design-380018337.jpg",
  Mage: "https://thumbs.dreamstime.com/b/cartoon-mage-boy-orange-hair-blue-cape-reads-spell-book-magic-flame-cartoon-mage-boy-reading-spell-book-380016152.jpg",
  Cleric: "https://img.freepik.com/premium-photo/cleric-cleric-with-white-gold-robe-male-teenager-mediu-cute-warrior-character-illustration_1020495-737195.jpg",
  Rogue: "https://opengameart.org/sites/default/files/rogue.svg",
  Bard: "https://w7.pngwing.com/pngs/128/897/png-transparent-eden-eternal-bard-character-class-personal-computer-massively-multiplayer-online-game-bard-video-game-cartoon-fictional-character.png",
  
  // Advanced Classes
  Berserker: "https://i.namu.wiki/i/465zJ4Lk3LYgWBA0kfvLKUy49O4Bi-WdwxkSr1cJdJXmF-Jh9UzqYQHhKq2D9DRTYVjMiDZjqiKjhgwqQdXjpg.webp",
  Knight: "https://i.redd.it/38e23g3tdtw71.jpg",
  Sharpshooter: "https://thumb.ac-illust.com/15/156692fbb375d266a1529fe6ef14a1dd_t.jpeg",
  "Bolt Slinger": "https://i.ebayimg.com/00/s/MTUwMFgxMDYz/z/nUsAAeSw8r5pKZz-/$_57.JPG?set_id=880000500F",
  Elementalist: "https://wiki.dfo-world.com/images/a/a6/Elementalist.png",
  Summoner: "https://www.pantheonmmo.com/wp-content/themes/rise_of_the_fallen-child/assets/img/classes/gnomesummoner.jpg",
  "High Priest": "https://guide.fire-emblem-heroes.com/wp-content/uploads/pandoro_party_priest_slide02.png",
  Inquisitor: "https://artwork.40k.gallery/wp-content/uploads/2022/11/Inquisitor-768x1056.jpg",
  Assassin: "https://ih1.redbubble.net/image.4847004066.6249/raf,360x360,075,t,fafafa:ca443f4786.jpg",
  Duelist: "https://cdna.artstation.com/p/assets/images/images/000/349/102/large/shiraz-domingo-forsakenduelist.jpg?1429773085",
  "Bard of Valor": "https://pbs.twimg.com/media/ETe_kiyXQAIlhaY.jpg",
  "Bard of Chaos": "https://encrypted-tbn0.gstatic.com/images/q=tbn:ANd9GcQZzq-QfUVZ6xmDWky8fmL9SixmFJ7ajOaexQ&s"
};

export const CLASS_GROWTH: Record<ClassName, Partial<Stats>> = {
  Warrior: { STR: 1.5, CON: 1.5, LCK: 0.5 },
  Archer: { DEX: 1.5, STR: 1.0, LCK: 0.5 },
  Mage: { INT: 2.0, CHA: 0.5, LCK: 0.5 },
  Cleric: { FTH: 1.5, CON: 1.0, INT: 0.5 },
  Rogue: { DEX: 1.5, LCK: 1.5 },
  Bard: { CHA: 1.5, LCK: 1.0, FTH: 0.5 },
};

export const ADVANCED_PATHS: Record<ClassName, AdvancedClassName[]> = {
  Warrior: ["Berserker", "Knight"],
  Archer: ["Sharpshooter", "Bolt Slinger"],
  Mage: ["Elementalist", "Summoner"],
  Cleric: ["High Priest", "Inquisitor"],
  Rogue: ["Assassin", "Duelist"],
  Bard: ["Bard of Valor", "Bard of Chaos"],
};

export const BASE_SKILLS: Record<ClassName, Skill[]> = {
  Warrior: [
    {
      id: "war_strike",
      name: "Shield Strike",
      description: "Deals melee physical damage to a single enemy. Scales on STR.",
      cost: 1,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 1.5,
      cooldown: 0,
    },
    {
      id: "war_wall",
      name: "Iron Wall",
      description: "Gains a sturdy shield absorbing damage based on CON.",
      cost: 2,
      targetType: TargetType.SELF,
      effect: "shield",
      effectValue: 30, // based on stats later
      effectDuration: 2,
      cooldown: 2,
    },
    {
      id: "war_taunt",
      name: "Challenger's Cry",
      description: "Taunts a single enemy for 3 turns, boosting your defense.",
      cost: 2,
      targetType: TargetType.SINGLE_ENEMY,
      effect: "taunt",
      effectDuration: 3,
      cooldown: 3,
    },
  ],
  Archer: [
    {
      id: "arc_shot",
      name: "Quick Shot",
      description: "Fires an arrow at an enemy. Scales on DEX and STR.",
      cost: 1,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 1.3,
      cooldown: 0,
    },
    {
      id: "arc_rain",
      name: "Rain of Arrows",
      description: "Fires a volley at all enemies in a single Column.",
      cost: 3,
      targetType: TargetType.COLUMN,
      damageMultiplier: 0.9,
      cooldown: 2,
    },
    {
      id: "arc_focus",
      name: "Eagle Eye",
      description: "Sharpen focus to increase Critical Strike chance for 3 turns.",
      cost: 2,
      targetType: TargetType.SELF,
      effect: "multiplier",
      effectValue: 15,
      effectDuration: 3,
      cooldown: 3,
    },
  ],
  Mage: [
    {
      id: "mag_bolt",
      name: "Firebolt",
      description: "Shoots arcane flames inflicting magical damage and Burn DoT.",
      cost: 1,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 1.4,
      effect: "burn",
      effectValue: 8,
      effectDuration: 3,
      cooldown: 0,
    },
    {
      id: "mag_storm",
      name: "Thunder Storm",
      description: "Heavy arcane spell striking all enemies. Scales on INT.",
      cost: 3,
      targetType: TargetType.ALL_ENEMIES,
      damageMultiplier: 1.8,
      cooldown: 3,
    },
    {
      id: "mag_mana",
      name: "Mana Flow",
      description: "Gains 2 extra Energy and amplifies magical power.",
      cost: 2,
      targetType: TargetType.SELF,
      effect: "regen",
      effectValue: 5,
      effectDuration: 2,
      cooldown: 2,
    },
  ],
  Cleric: [
    {
      id: "cle_heal",
      name: "Holy Grace",
      description: "Restores HP to an ally. Scales on FTH.",
      cost: 2,
      targetType: TargetType.SINGLE_ALLY,
      healingMultiplier: 2.0,
      cooldown: 2,
    },
    {
      id: "cle_shelter",
      name: "Protection Shelter",
      description: "Bestows physical protection on the whole party.",
      cost: 3,
      targetType: TargetType.ALL_ALLIES,
      effect: "shield",
      effectValue: 20,
      effectDuration: 3,
      cooldown: 3,
    },
    {
      id: "cle_smite",
      name: "Smite",
      description: "Strikes an enemy with Holy light. Scales on FTH.",
      cost: 2,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 1.6,
      cooldown: 0,
    },
  ],
  Rogue: [
    {
      id: "rog_stab",
      name: "Stab",
      description: "Quick strike with high critical chance. Scales on DEX.",
      cost: 1,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 1.4,
      cooldown: 0,
    },
    {
      id: "rog_bleed",
      name: "Bleed Strike",
      description: "Pierces an enemy, applying Bleed DoT. Scales on DEX.",
      cost: 2,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 1.1,
      effect: "bleed",
      effectValue: 12,
      effectDuration: 3,
      cooldown: 1,
    },
    {
      id: "rog_shadow",
      name: "Shadow Step",
      description: "Dodge rate increased significantly (+30%) for 2 turns.",
      cost: 2,
      targetType: TargetType.SELF,
      effect: "dodge_up",
      effectValue: 30,
      effectDuration: 2,
      cooldown: 3,
    },
  ],
  Bard: [
    {
      id: "brd_valor",
      name: "Valor Anthem",
      description: "Enchants all allies to deal 25% extra damage.",
      cost: 2,
      targetType: TargetType.ALL_ALLIES,
      effect: "multiplier",
      effectValue: 25,
      effectDuration: 3,
      cooldown: 3,
    },
    {
      id: "brd_dis",
      name: "Dissonance",
      description: "Releases chaotic music to Stagger an enemy.",
      cost: 2,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 1.2,
      effect: "stagger",
      effectValue: 1,
      effectDuration: 1,
      cooldown: 0,
    },
    {
      id: "brd_lute",
      name: "Soothing Lute",
      description: "Bestows Regen on all allies for 3 turns. Scales on CHA.",
      cost: 3,
      targetType: TargetType.ALL_ALLIES,
      effect: "regen",
      effectValue: 8,
      effectDuration: 3,
      cooldown: 3,
    },
  ],
};

export const ADVANCED_SKILLS: Record<AdvancedClassName, Skill[]> = {
  Berserker: [
    {
      id: "ber_frenzy",
      name: "Frenzy Slash",
      description: "Heavy multi-slash with 40% self lifesteal. Scales heavily on STR.",
      cost: 3,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 2.8,
      effect: "lifesteal",
      effectValue: 40,
      cooldown: 3,
    },
    {
      id: "ber_lust",
      name: "Bloodlust Strike",
      description: "Sacrifice 15 HP to deal massive damage and inflict Bleed.",
      cost: 2,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 3.2,
      effect: "bleed",
      effectValue: 20,
      effectDuration: 3,
      cooldown: 2,
    },
    {
      id: "ber_surge",
      name: "Blood Surge",
      description: "Consumes all Bleed stacks on self to heal for 40% of their remaining damage value. Grants +10% STR for 2 turns.",
      cost: 1,
      targetType: TargetType.SELF,
      cooldown: 3,
    },
    {
      id: "ber_aura",
      name: "Frenzy Aura",
      description: "Passive-toggle aura. Allies within the same column gain +5% ATK.",
      cost: 1,
      targetType: TargetType.ALL_ALLIES,
      cooldown: 3,
    },
    {
      id: "ber_defiance",
      name: "Berserker's Defiance",
      description: "For 2 turns, incoming damage that would reduce HP below 1 instead sets it to 1 and grants Rage (invincible for 1 hit). Can trigger once per combat.",
      cost: 2,
      targetType: TargetType.SELF,
      cooldown: 5,
    },
  ],
  Knight: [
    {
      id: "kni_shield",
      name: "Aegis Shielding",
      description: "Grants heavy Shield to all allies in a targeted Column. Scales on CON.",
      cost: 3,
      targetType: TargetType.ALL_ALLIES,
      effect: "shield",
      effectValue: 60,
      effectDuration: 3,
      cooldown: 3,
    },
    {
      id: "kni_guardian",
      name: "Guardian Slash",
      description: "Deals heavy blow and taunts all enemies in recipient's Column.",
      cost: 3,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 1.8,
      effect: "taunt",
      effectDuration: 3,
      cooldown: 2,
    },
    {
      id: "kni_mark",
      name: "Sentinel's Mark",
      description: "Marks an enemy for 3 turns. All allies deal +10% damage to the marked target, and the Knight draws aggro.",
      cost: 1,
      targetType: TargetType.SINGLE_ENEMY,
      cooldown: 3,
    },
    {
      id: "kni_bulwark",
      name: "Divine Bulwark",
      description: "Grants a Holy Shield equal to 30 + CON*1.2. Caster cannot be critically hit while active.",
      cost: 1,
      targetType: TargetType.SELF,
      effect: "shield",
      effectValue: 30,
      effectDuration: 5,
      cooldown: 3,
    },
    {
      id: "kni_stance",
      name: "Fortress Stance",
      description: "Knight enters immovable stance for 2 turns: takes 50% reduced damage, adjacent allies take 20% reduced damage. Cannot act offensively.",
      cost: 2,
      targetType: TargetType.SELF,
      cooldown: 4,
    },
  ],
  Sharpshooter: [
    {
      id: "shp_snipe",
      name: "Sniper Precision",
      description: "Huge single-target ranged critical execution. Scales on DEX.",
      cost: 3,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 4.5,
      cooldown: 4,
    },
    {
      id: "shp_focus",
      name: "Deadeye Focus",
      description: "+50% Crit multiplier and ignores enemy Dodge on next shot.",
      cost: 2,
      targetType: TargetType.SELF,
      effect: "multiplier",
      effectValue: 50,
      effectDuration: 2,
      cooldown: 2,
    },
    {
      id: "shp_pierce",
      name: "Piercing Round",
      description: "Fires a single arrow that pierces through an entire enemy column, dealing (10 + DEX*1.1)*0.8 to each target hit. Ignores dodge.",
      cost: 1,
      targetType: TargetType.COLUMN,
      damageMultiplier: 0.8,
      cooldown: 2,
    },
    {
      id: "shp_mark",
      name: "Mark for Death",
      description: "Places a tracker mark on one enemy for 3 turns. All crit hits against that enemy deal +20% bonus damage.",
      cost: 1,
      targetType: TargetType.SINGLE_ENEMY,
      cooldown: 3,
    },
    {
      id: "shp_calm",
      name: "Calm Before the Shot",
      description: "Spend this turn aiming. Next attack within 2 turns automatically crits and gains +40% base damage.",
      cost: 0,
      targetType: TargetType.SELF,
      cooldown: 4,
    },
  ],
  "Bolt Slinger": [
    {
      id: "bol_triple",
      name: "Triple Strike",
      description: "Multi-hits 3 times! Click up to 3 distinct targets to strike. Scales on DEX.",
      cost: 3,
      targetType: TargetType.MULTI_HIT,
      damageMultiplier: 1.1, // Per hit scaling
      cooldown: 2,
    },
    {
      id: "bol_split",
      name: "Split Shot Aura",
      description: "Self aura: Attacks damage ALL enemies in the targeted column for 3 turns.",
      cost: 3,
      targetType: TargetType.SELF,
      effect: "multiplier",
      effectValue: 20, // auxiliary flag
      effectDuration: 3,
      cooldown: 3,
    },
    {
      id: "bol_tempest",
      name: "Tempest Barrage",
      description: "Fires 5 rapid low-power bolts: each deals (6 + DEX*0.5) damage. Each hit independently rolls crit.",
      cost: 1,
      targetType: TargetType.SINGLE_ENEMY,
      cooldown: 3,
    },
    {
      id: "bol_web",
      name: "Static Web",
      description: "Fires crackling arrows into an enemy column, applying Slow (-1 initiative) and reducing their dodge chance by 15% for 2 turns.",
      cost: 1,
      targetType: TargetType.COLUMN,
      cooldown: 3,
    },
    {
      id: "bol_chain",
      name: "Chain Lightning Bolt",
      description: "Fires an electrified bolt that deals (12 + DEX*1.0) damage to primary target, then bounces to 2 random additional enemies for 60% of that damage.",
      cost: 2,
      targetType: TargetType.SINGLE_ENEMY,
      cooldown: 4,
    },
  ],
  Elementalist: [
    {
      id: "ele_inferno",
      name: "Inferno Blast",
      description: "Unleashes hellfire on all enemies, applying hot Burn stacks.",
      cost: 3,
      targetType: TargetType.ALL_ENEMIES,
      damageMultiplier: 2.2,
      effect: "burn",
      effectValue: 18,
      effectDuration: 3,
      cooldown: 3,
    },
    {
      id: "ele_frost",
      name: "Frost Nova",
      description: "Freezes all enemies, dealing magic damage and Staggering them.",
      cost: 3,
      targetType: TargetType.ALL_ENEMIES,
      damageMultiplier: 1.5,
      effect: "stagger",
      effectValue: 2,
      effectDuration: 1,
      cooldown: 3,
    },
    {
      id: "ele_surge",
      name: "Arcane Surge",
      description: "Passive activation. When the Mage uses any spell costing 2+ Energy, the next spell costs 1 less Energy.",
      cost: 0,
      targetType: TargetType.SELF,
      cooldown: 1,
    },
    {
      id: "ele_shatter",
      name: "Frost Shatter",
      description: "If target is Frozen, shatters the ice for (14 + INT*1.4) bonus magic damage and spreads Chill. If not Frozen, deals (10 + INT*1.0) damage.",
      cost: 1,
      targetType: TargetType.SINGLE_ENEMY,
      cooldown: 2,
    },
    {
      id: "ele_tap",
      name: "Ley Line Tap",
      description: "Draw from ambient mana for 2 turns: all INT scaling on spells increases by +20%.",
      cost: 1,
      targetType: TargetType.SELF,
      cooldown: 4,
    },
  ],
  Summoner: [
    {
      id: "sum_pet",
      name: "Summon Familiar",
      description: "Summons a Fire Familiar pet into an empty slot on your battlefield grid.",
      cost: 3,
      targetType: TargetType.SELF,
      cooldown: 3,
    },
    {
      id: "sum_empower",
      name: "Empower Pack",
      description: "Buffs all summons with +30% attack strength and heals them.",
      cost: 2,
      targetType: TargetType.ALL_ALLIES,
      effect: "multiplier",
      effectValue: 30,
      effectDuration: 3,
      cooldown: 2,
    },
    {
      id: "sum_evolve",
      name: "Familiar Evolution",
      description: "Upgrades active familiar: Fire Familiar becomes Inferno Familiar (+30% damage, +30% HP, applies Burn on hit).",
      cost: 1,
      targetType: TargetType.SELF,
      cooldown: 3,
    },
    {
      id: "sum_step",
      name: "Void Step",
      description: "Phases out of reality for 1 turn: becomes untargetable. On return, deals (8 + INT*0.8) void damage to a random enemy.",
      cost: 1,
      targetType: TargetType.SELF,
      cooldown: 4,
    },
    {
      id: "sum_phantom",
      name: "Phantom Barrier",
      description: "Extends the Barrier Ward to cover ALL allies for 2 turns (absorbs 8 + INT*0.6 damage per ally).",
      cost: 2,
      targetType: TargetType.ALL_ALLIES,
      cooldown: 4,
    },
  ],
  "High Priest": [
    {
      id: "hpr_sanctuary",
      name: "Divine Sanctuary",
      description: "Massive heal to all allies & cleanses negative status effects.",
      cost: 3,
      targetType: TargetType.ALL_ALLIES,
      healingMultiplier: 3.5,
      cooldown: 4,
    },
    {
      id: "hpr_aura",
      name: "Aura of Hope",
      description: "Gives solid HP regen of FTH value to all allies.",
      cost: 3,
      targetType: TargetType.ALL_ALLIES,
      effect: "regen",
      effectValue: 20,
      effectDuration: 4,
      cooldown: 3,
    },
    {
      id: "hpr_radiant",
      name: "Radiant Word",
      description: "Supercharged heal: restores (14 + FTH*1.2) HP and grants Blessed (+10% all stats) for 2 turns.",
      cost: 1,
      targetType: TargetType.SINGLE_ALLY,
      healingMultiplier: 1.2,
      cooldown: 3,
    },
    {
      id: "hpr_cleansing",
      name: "Cleansing Light",
      description: "Removes all negative status effects from all allies and heals (6 + FTH*0.5) HP per status removed.",
      cost: 1,
      targetType: TargetType.ALL_ALLIES,
      cooldown: 3,
    },
    {
      id: "hpr_sanctuary_aura",
      name: "Holy Sanctuary",
      description: "Creates a sanctuary aura for 2 turns: allies receive 15% reduced incoming damage and regenerate (4 + FTH*0.4) HP per turn.",
      cost: 2,
      targetType: TargetType.ALL_ALLIES,
      cooldown: 5,
    },
  ],
  Inquisitor: [
    {
      id: "inq_retribution",
      name: "Holy Retribution",
      description: "Heavy strike. Damage is distributed back to the party as equal heal shares.",
      cost: 3,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 2.6, // Heavy holy damage, heals party
      cooldown: 3,
    },
    {
      id: "inq_seal",
      name: "Zealot Seal",
      description: "Smite target, applying a vulnerability (reduces DEF by 30%).",
      cost: 2,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 1.4,
      effect: "stagger",
      effectValue: 1,
      effectDuration: 2,
      cooldown: 2,
    },
    {
      id: "inq_smite",
      name: "Sacred Smite",
      description: "A charged holy strike dealing (13 + FTH*1.3 + STR*0.4) holy damage. Heals the lowest-HP ally for 30% of damage.",
      cost: 1,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 1.3,
      cooldown: 3,
    },
    {
      id: "inq_retrib_aura",
      name: "Aura of Retribution",
      description: "Activates a passive aura: whenever ANY ally is hit, the Crusader deals (4 + FTH*0.4) holy damage back.",
      cost: 1,
      targetType: TargetType.SELF,
      cooldown: 3,
    },
    {
      id: "inq_consecrate",
      name: "Consecrate Ground",
      description: "Blesses the ground under allied column for 3 turns. Regenerates (5 + FTH*0.5) HP and +8% damage.",
      cost: 2,
      targetType: TargetType.COLUMN,
      cooldown: 4,
    },
  ],
  Assassin: [
    {
      id: "asn_venom",
      name: "Death Venom",
      description: "Strikes target with toxic edge, dealing heavy damage, Poison, and Bleed.",
      cost: 3,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 2.2,
      effect: "poison",
      effectValue: 25,
      effectDuration: 3,
      cooldown: 3,
    },
    {
      id: "asn_exterm",
      name: "Exterminate",
      description: "Instantly deals massive damage. Triple scaling if target has Bleed or Poison.",
      cost: 3,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 3.0,
      cooldown: 2,
    },
    {
      id: "asn_necrotic",
      name: "Necrotic Blade",
      description: "Applies a stack of Soul Rot: reduces target's healing received by 15%. Deals (8 + DEX*0.9) damage.",
      cost: 1,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 0.9,
      cooldown: 1,
    },
    {
      id: "asn_venom_cascade",
      name: "Venom Cascade",
      description: "Instantly triggers all active Poison stacks on target for 150% of remaining tick damage as immediate damage.",
      cost: 1,
      targetType: TargetType.SINGLE_ENEMY,
      cooldown: 4,
    },
    {
      id: "asn_clone",
      name: "Shadow Clone",
      description: "Summons a shadow decoy for 2 turns: first attack is negated, clone counter-attacks for (6 + DEX*0.7) damage.",
      cost: 2,
      targetType: TargetType.SELF,
      cooldown: 5,
    },
  ],
  Duelist: [
    {
      id: "due_riposte",
      name: "Riposte Aura",
      description: "Increases Dodge by 35%. When you successfully Dodge, counter-attack the offender.",
      cost: 3,
      targetType: TargetType.SELF,
      effect: "dodge_up",
      effectValue: 35,
      effectDuration: 3,
      cooldown: 3,
    },
    {
      id: "due_flash",
      name: "Flashing Blades",
      description: "Flash attack dealing swift double-strikes to target. Scales on DEX.",
      cost: 2,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 2.0,
      cooldown: 2,
    },
    {
      id: "due_phantom",
      name: "Phantom Step",
      description: "Becomes unhittable for 1 turn (full dodge). On the following turn, first attack automatically crits.",
      cost: 1,
      targetType: TargetType.SELF,
      cooldown: 4,
    },
    {
      id: "due_counter",
      name: "Counter Flow",
      description: "Passive trigger: whenever the Duelist dodges, they immediately deal a free counter-attack for (8 + DEX*0.9) damage.",
      cost: 0,
      targetType: TargetType.SELF,
      cooldown: 0,
    },
    {
      id: "due_whirlwind",
      name: "Whirlwind Dance",
      description: "Spins through the battlefield hitting all enemies once for (8 + DEX*0.8 + LCK*0.5)*0.9 damage.",
      cost: 2,
      targetType: TargetType.ALL_ENEMIES,
      damageMultiplier: 0.8,
      cooldown: 4,
    },
  ],
  "Bard of Valor": [
    {
      id: "bva_heroic",
      name: "Heroic Symphony",
      description: "Increases party damage by 40% and heals them instantly.",
      cost: 3,
      targetType: TargetType.ALL_ALLIES,
      effect: "multiplier",
      effectValue: 40,
      effectDuration: 3,
      cooldown: 3,
    },
    {
      id: "bva_aegis",
      name: "Aegis Song",
      description: "Grants 20% Block and 20% Dodge shields to all allies.",
      cost: 3,
      targetType: TargetType.ALL_ALLIES,
      effect: "shield",
      effectValue: 35,
      effectDuration: 3,
      cooldown: 3,
    },
    {
      id: "bva_rally",
      name: "Rallying Verse",
      description: "Removes Stun, Silence, or Fear from target ally and immediately grants them an extra action this turn.",
      cost: 1,
      targetType: TargetType.SINGLE_ALLY,
      cooldown: 4,
    },
    {
      id: "bva_hymn",
      name: "War Hymn",
      description: "Grants all allies +15% ATK and +10% crit chance for 2 turns.",
      cost: 1,
      targetType: TargetType.ALL_ALLIES,
      cooldown: 3,
    },
    {
      id: "bva_shield",
      name: "Shield of Legend",
      description: "Grants ALL allies a shield equal to (8 + CHA*0.8) and +20% dodge for 2 turns.",
      cost: 2,
      targetType: TargetType.ALL_ALLIES,
      effect: "shield",
      effectValue: 8,
      effectDuration: 2,
      cooldown: 4,
    },
  ],
  "Bard of Chaos": [
    {
      id: "bch_wail",
      name: "Discordant Wail",
      description: "A catastrophic sonic scream harming all enemies and applying Burn DoT.",
      cost: 3,
      targetType: TargetType.ALL_ENEMIES,
      damageMultiplier: 1.8,
      effect: "burn",
      effectValue: 15,
      effectDuration: 3,
      cooldown: 3,
    },
    {
      id: "bch_hex",
      name: "Hexing Chord",
      description: "Debuffs an enemy with curse (-30% damage deal and Staggered).",
      cost: 2,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 1.3,
      effect: "stagger",
      effectValue: 2,
      effectDuration: 2,
      cooldown: 2,
    },
    {
      id: "bch_madness",
      name: "Maddening Verse",
      description: "Forces the target to attack a random ally or enemy on their next turn (Confusion, 2 turns).",
      cost: 1,
      targetType: TargetType.SINGLE_ENEMY,
      cooldown: 3,
    },
    {
      id: "bch_cacophony",
      name: "Cacophony Wave",
      description: " sonic chaos: reduces ATK by 10% and DEF by 10% for 2 turns. Applies Dissonance for 1 turn.",
      cost: 1,
      targetType: TargetType.ALL_ENEMIES,
      cooldown: 3,
    },
    {
      id: "bch_curse",
      name: "Resonant Curse",
      description: "Curse: target takes +20% damage from all sources for 4 turns, duration refreshes on damage.",
      cost: 2,
      targetType: TargetType.SINGLE_ENEMY,
      cooldown: 4,
    },
  ],
};

export const TIER3_SKILLS: Record<string, Skill[]> = {
  Warlord: [
    {
      id: "wld_slam",
      name: "Warcry Slam",
      description: "Leaps into the enemy formation, dealing (14 + STR*1.4)*1.0 damage to ALL enemies. Applies Stagger to front-column enemies. CD: 3. Scales with STR.",
      cost: 2,
      targetType: TargetType.ALL_ENEMIES,
      damageMultiplier: 1.0,
      effect: "stagger",
      effectDuration: 1,
      cooldown: 3,
    },
    {
      id: "wld_bloodlust",
      name: "Conqueror's Bloodlust",
      description: "Enters Conqueror State for 3 turns: +30% STR, +25% lifesteal, and Execute threshold rises to 20% HP. CD: 5. Scales with STR.",
      cost: 3,
      targetType: TargetType.SELF,
      cooldown: 5,
    },
  ],
  Paladin: [
    {
      id: "pal_aegis",
      name: "Sacred Aegis",
      description: "Casts an unbreakable divine barrier on ALL allies for 1 turn (100% damage negation). CD: 6. Scales with FTH.",
      cost: 2,
      targetType: TargetType.ALL_ALLIES,
      cooldown: 6,
    },
    {
      id: "pal_judgment",
      name: "King's Judgment",
      description: "Deals (16 + STR*1.3 + CON*1.0) holy damage, ignores 40% of enemy DEF, and Stuns the target for 2 turns. CD: 5. Scales with STR and CON.",
      cost: 3,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 1.0, // custom scaling in BattleScene
      cooldown: 5,
    },
  ],
  Hawkeye: [
    {
      id: "hawk_rain",
      name: "Rain of Judgement",
      description: "Fires a volley targeting all enemies, dealing (10 + DEX*1.0)*0.85 per arrow. Any enemy below 30% HP is hit twice. CD: 4. Scales with DEX.",
      cost: 2,
      targetType: TargetType.ALL_ENEMIES,
      damageMultiplier: 0.85,
      cooldown: 4,
    },
    {
      id: "hawk_one_shot",
      name: "One True Shot",
      description: "Deals (20 + DEX*1.8) damage, always crits, ignores all dodge/block/shields, and inflicts Marked (DEF -20%) for 3 turns. CD: 6. Scales with DEX.",
      cost: 3,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 1.0,
      cooldown: 6,
    },
  ],
  "Storm Dancer": [
    {
      id: "std_volley",
      name: "Maelstrom Volley",
      description: "Unleashes a storm of bolts: 2 hits each, (7 + DEX*0.7) per hit. Applies Cripple to any enemy hit twice. CD: 4. Scales with DEX.",
      cost: 2,
      targetType: TargetType.ALL_ENEMIES,
      cooldown: 4,
    },
    {
      id: "std_form",
      name: "Eye of the Storm",
      description: "Enters Storm Form for 3 turns: all single-target attacks become multi-hit (3 bolts at 60% damage each), 20% Stun chance. CD: 6. Scales with DEX.",
      cost: 3,
      targetType: TargetType.SELF,
      cooldown: 6,
    },
  ],
  Archmage: [
    {
      id: "amg_cataclysm",
      name: "Cataclysm",
      description: "Calls down a multi-elemental catastrophe. Deals (12 + INT*1.4)*0.9 to ALL. Applies Burn, Freeze, or Shock-Stun. CD: 5. Scales with INT.",
      cost: 3,
      targetType: TargetType.ALL_ENEMIES,
      damageMultiplier: 0.9,
      cooldown: 5,
    },
    {
      id: "amg_singularity",
      name: "Singularity",
      description: "Deals (18 + INT*1.6) damage to ALL (no AoE reduction), then collapses — dealing a second wave of (10 + INT*0.8)*0.9 damage. CD: 7. Scales with INT.",
      cost: 4,
      targetType: TargetType.ALL_ENEMIES,
      cooldown: 7,
    },
  ],
  "Void Caller": [
    {
      id: "voc_colossus",
      name: "Summon Void Colossus",
      description: "Summons a Void Colossus onto an empty cell: HP = 30 + INT*1.5, ATK = 12 + INT*1.0 (column), DEF = 10. Lasts 4 turns. CD: 6.",
      cost: 3,
      targetType: TargetType.SELF,
      cooldown: 6,
    },
    {
      id: "voc_cascade",
      name: "Rift Cascade",
      description: "Rifts under all enemies: deals (14 + INT*1.2)*0.9 void damage. Enemies Burned, Frozen, or Stunned take +30% damage. CD: 6.",
      cost: 4,
      targetType: TargetType.ALL_ENEMIES,
      damageMultiplier: 0.9,
      cooldown: 6,
    },
  ],
  Seraph: [
    {
      id: "srp_cascade",
      name: "Divine Cascade",
      description: "Holy energy heals ALL allies for (10 + FTH*1.0)*0.8 and grants each a Shield equal to 50% of the amount healed. CD: 5.",
      cost: 3,
      targetType: TargetType.ALL_ALLIES,
      healingMultiplier: 0.8,
      cooldown: 5,
    },
    {
      id: "srp_miracle",
      name: "Miracle",
      description: "Fully restores HP of the two lowest HP allies, heals all others for (12 + FTH*1.2), removes all debuffs, Blessed for 3 turns. CD: 8.",
      cost: 4,
      targetType: TargetType.ALL_ALLIES,
      cooldown: 8,
    },
  ],
  Crusader: [
    {
      id: "cru_reckoning",
      name: "Heaven's Reckoning",
      description: "Holy fire deals (12 + FTH*1.2 + STR*0.6)*0.9 damage to all. Heals ALL allies for 25% of the total damage dealt. CD: 5.",
      cost: 3,
      targetType: TargetType.ALL_ENEMIES,
      damageMultiplier: 0.9,
      cooldown: 5,
    },
    {
      id: "cru_oath",
      name: "Divine Champion's Oath",
      description: "Champion State for 4 turns: +25% FTH, all damage heals lowest HP ally for 40%, Stun/Fear immunity. CD: 6.",
      cost: 3,
      targetType: TargetType.SELF,
      cooldown: 6,
    },
  ],
  Phantom: [
    {
      id: "phm_sever",
      name: "Soul Sever",
      description: "Deals (16 + DEX*1.3 + LCK*0.7) damage, ignores all shields/blocks, and applies both Bleed and Poison. CD: 4.",
      cost: 2,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 1.0,
      cooldown: 4,
    },
    {
      id: "phm_mark",
      name: "Death Mark",
      description: "Places Death Mark on enemy. For 4 turns they take +25% damage. If they die, Phantom gains +2 Energy. CD: 6.",
      cost: 3,
      targetType: TargetType.SINGLE_ENEMY,
      cooldown: 6,
    },
  ],
  "Blade Saint": [
    {
      id: "bst_parry",
      name: "Perfect Parry",
      description: "Enters Perfect Parry Stance for 2 turns: takes 40% reduced damage, and EVERY hit triggers automatic critical counter-attack. CD: 5.",
      cost: 2,
      targetType: TargetType.SELF,
      cooldown: 5,
    },
    {
      id: "bst_verdict",
      name: "Saint's Verdict",
      description: "Strikes with precision: deals (14 + DEX*1.5 + LCK*1.0) damage. Crits automatically. Halves target's damage for 2 turns. CD: 5.",
      cost: 3,
      targetType: TargetType.SINGLE_ENEMY,
      damageMultiplier: 1.0,
      cooldown: 5,
    },
  ],
  "Herald of Glory": [
    {
      id: "hog_refrain",
      name: "Epic Refrain",
      description: "Plays a legendary refrain: resets the cooldown of one random active skill for every ally. Also heals all allies for (6 + CHA*0.6). CD: 6.",
      cost: 3,
      targetType: TargetType.ALL_ALLIES,
      healingMultiplier: 1.0,
      cooldown: 6,
    },
    {
      id: "hog_transcend",
      name: "Song of Transcendence",
      description: "For 3 turns: ALL allies gain +20% ATK, +20% DEF, +15% crit chance, and regenerate (4 + CHA*0.4) HP. CD: 8.",
      cost: 4,
      targetType: TargetType.ALL_ALLIES,
      cooldown: 8,
    },
  ],
  "Entropy Singer": [
    {
      id: "ens_ruin",
      name: "Symphony of Ruin",
      description: "Deals (10 + CHA*1.0 + LCK*0.5)*0.9 damage and applies Burn, ATK Down 15%, and DEF Down 15% for 2 turns. CD: 5.",
      cost: 3,
      targetType: TargetType.ALL_ENEMIES,
      damageMultiplier: 0.9,
      cooldown: 5,
    },
    {
      id: "ens_aria",
      name: "World's End Aria",
      description: "Sonic collapse: ALL enemies take (12 + CHA*1.2)*0.9 damage, are Silenced for 2 turns, lose all buffs, suffer -20% stats. CD: 8.",
      cost: 4,
      targetType: TargetType.ALL_ENEMIES,
      damageMultiplier: 0.9,
      cooldown: 8,
    },
  ],
};

export function getStatsScalingMultiplier(stats: Stats, baseClass: ClassName): number {
  switch (baseClass) {
    case "Warrior":
      return 1 + (stats.STR * 0.05 + stats.CON * 0.03);
    case "Archer":
      return 1 + (stats.DEX * 0.05 + stats.STR * 0.02);
    case "Mage":
      return 1 + (stats.INT * 0.06);
    case "Cleric":
      return 1 + (stats.FTH * 0.06);
    case "Rogue":
      return 1 + (stats.DEX * 0.04 + stats.LCK * 0.03);
    case "Bard":
      return 1 + (stats.CHA * 0.05 + stats.LCK * 0.02);
    default:
      return 1;
  }
}

export function getDerivedStats(character: { stats: Stats; class: CharacterClass; level: number; equipment?: Equipment | null; unlockedTalents?: string[]; race?: string }) {
  const { stats, class: charClass, level, equipment, unlockedTalents, race } = character;
  
  // Combine stats from equipment statsBonus
  const combinedStats = { ...stats };
  let flatMaxHpBonus = 0;
  let flatCritBonus = 0;
  let flatDodgeBonus = 0;
  let flatDefBonus = 0;
  let flatAccuracyBonus = 0;
  let critDmgMultiplierBonus = 0;

  // Aggregate stats from unlocked talent nodes
  if (unlockedTalents && unlockedTalents.length > 0) {
    const list = TALENT_TREES[getBaseClass(charClass)] || [];
    unlockedTalents.forEach(tId => {
      const node = list.find(n => n.id === tId);
      if (node) {
        if (node.statsBonus) {
          Object.entries(node.statsBonus).forEach(([key, val]) => {
            if (val) {
              const statKey = key as keyof Stats;
              combinedStats[statKey] = (combinedStats[statKey] || 0) + (val as number);
            }
          });
        }
        if (node.flatMaxHp) flatMaxHpBonus += node.flatMaxHp;
        if (node.flatDef) flatDefBonus += node.flatDef;
        if (node.flatCrit) flatCritBonus += node.flatCrit;
        if (node.flatDodge) flatDodgeBonus += node.flatDodge;
        if (node.id === "rog_t8_cuts") {
          critDmgMultiplierBonus += 25; // Rogue Lethal Edge: +25% Critical Damage
        }
      }
    });
  }
  
  if (equipment) {
    Object.values(equipment).forEach(item => {
      if (item) {
        if (item.statsBonus) {
          Object.entries(item.statsBonus).forEach(([key, val]) => {
            if (val) {
              const statKey = key as keyof Stats;
              combinedStats[statKey] = (combinedStats[statKey] || 0) + (val as number);
            }
          });
        }
        if (item.flatMaxHp) flatMaxHpBonus += item.flatMaxHp;
        if (item.flatCrit) flatCritBonus += item.flatCrit;
        if (item.flatDodge) flatDodgeBonus += item.flatDodge;
        if (item.flatDef) flatDefBonus += item.flatDef;
        if (item.flatAccuracy) flatAccuracyBonus += item.flatAccuracy;
      }
    });
  }

  // Apply Race Core Attribute modifications
  if (race === "Vampire") {
    combinedStats.STR = Math.floor(combinedStats.STR * 0.80);
    combinedStats.DEX = Math.floor(combinedStats.DEX * 0.80);
    combinedStats.CON = Math.floor(combinedStats.CON * 0.80);
    combinedStats.INT = Math.floor(combinedStats.INT * 0.80);
    combinedStats.FTH = Math.floor(combinedStats.FTH * 0.80);
    combinedStats.CHA = Math.floor(combinedStats.CHA * 0.80);
    combinedStats.LCK = Math.floor(combinedStats.LCK * 0.80);
  }
  if (race === "Dragonborn") {
    combinedStats.STR = Math.floor(combinedStats.STR * 1.10);
  }
  if (race === "Succubus") {
    combinedStats.CHA = Math.floor(combinedStats.CHA * 1.25);
  }

  // Base Defense by class
  let baseDef = 0;
  switch (charClass) {
    case "Warrior": baseDef = 12; break;
    case "Knight": baseDef = 20; break;
    case "Berserker": baseDef = 8; break;
    case "Cleric": baseDef = 6; break;
    case "High Priest": baseDef = 10; break;
    case "Inquisitor": baseDef = 12; break;
    case "Archer": baseDef = 5; break;
    case "Sharpshooter": baseDef = 8; break;
    case "Bolt Slinger": baseDef = 6; break;
    case "Mage": baseDef = 3; break;
    case "Elementalist": baseDef = 5; break;
    case "Summoner": baseDef = 4; break;
    case "Rogue": baseDef = 4; break;
    case "Assassin": baseDef = 6; break;
    case "Duelist": baseDef = 8; break;
    case "Bard": baseDef = 4; break;
    case "Bard of Valor": baseDef = 10; break;
    case "Bard of Chaos": baseDef = 6; break;
    default: baseDef = 4; break;
  }

  let finalHp = 80 + combinedStats.CON * 12 + (level - 1) * 15 + flatMaxHpBonus;
  if (race === "Dwarves") {
    finalHp = Math.floor(finalHp * 1.10);
  }
  if (race === "Succubus") {
    finalHp = Math.floor(finalHp * 0.80);
  }

  let finalDef = baseDef + combinedStats.CON * 1 + flatDefBonus;
  if (race === "Dragonborn") {
    const dbDefBonus = Math.max(8, Math.floor(finalDef * 0.20));
    finalDef += dbDefBonus;
  }

  let critChance = 5 + combinedStats.DEX * 0.4 + combinedStats.LCK * 0.5 + flatCritBonus;
  let critDamage = 150 + combinedStats.STR * 0.8 + combinedStats.DEX * 0.6 + combinedStats.LCK * 1.2 + critDmgMultiplierBonus;
  if (race === "Elf") {
    critChance += 20;
    critDamage += 20;
  }

  // Sum flatAtk from equipment
  let flatAtkBonus = 0;
  if (equipment) {
    Object.values(equipment).forEach(item => {
      if (item && item.flatAtk) {
        flatAtkBonus += item.flatAtk;
      }
    });
  }

  let baseClassVal = getBaseClass(charClass);
  let rawAtk = 0;
  switch (baseClassVal) {
    case "Warrior":
      rawAtk = 12 + combinedStats.STR * 1.0 + combinedStats.DEX * 1.0 + combinedStats.CON * 0.6;
      break;
    case "Archer":
      rawAtk = 10 + combinedStats.DEX * 1.0 + combinedStats.STR * 1.0;
      break;
    case "Mage":
      rawAtk = 10 + combinedStats.INT * 1.5 + combinedStats.STR * 1.0 + combinedStats.DEX * 1.0;
      break;
    case "Cleric":
      rawAtk = 10 + combinedStats.FTH * 1.4 + combinedStats.STR * 1.0 + combinedStats.DEX * 1.0;
      break;
    case "Rogue":
      rawAtk = 10 + combinedStats.DEX * 1.0 + combinedStats.STR * 1.0 + combinedStats.LCK * 0.8;
      break;
    case "Bard":
      rawAtk = 10 + combinedStats.CHA * 1.0 + combinedStats.STR * 1.0 + combinedStats.DEX * 1.0 + combinedStats.LCK * 0.5;
      break;
    default:
      rawAtk = 12 + combinedStats.STR * 1.0 + combinedStats.DEX * 1.0;
      break;
  }
  let finalAtk = Math.round(rawAtk) + flatAtkBonus;

  return {
    maxHp: finalHp,
    critChance: Math.min(80, critChance),
    critDamage: critDamage,
    dodgeChance: Math.min(75, 3 + combinedStats.DEX * 0.5 + combinedStats.LCK * 0.3 + flatDodgeBonus),
    blockChance: Math.min(75, 4 + combinedStats.STR * 0.5 + combinedStats.CON * 0.4),
    blockReduction: Math.min(85, 15 + combinedStats.CON * 0.8),
    minInit: 2 + level + Math.floor(combinedStats.DEX / 3),
    maxInit: 10 + level + Math.floor(combinedStats.DEX / 2),
    accuracy: 95 + combinedStats.DEX * 1 + combinedStats.LCK * 0.5 + flatAccuracyBonus,
    def: finalDef,
    atk: finalAtk,
    combinedStats: combinedStats,
  };
}

export function getBaseClass(cl: string): ClassName {
  if (["Berserker", "Knight", "Warlord", "Paladin"].includes(cl)) return "Warrior";
  if (["Sharpshooter", "Bolt Slinger", "Hawkeye", "Storm Dancer"].includes(cl)) return "Archer";
  if (["Elementalist", "Summoner", "Archmage", "Void Caller"].includes(cl)) return "Mage";
  if (["High Priest", "Inquisitor", "Seraph", "Crusader"].includes(cl)) return "Cleric";
  if (["Assassin", "Duelist", "Phantom", "Blade Saint"].includes(cl)) return "Rogue";
  if (["Bard of Valor", "Bard of Chaos", "Herald of Glory", "Entropy Singer"].includes(cl)) return "Bard";
  return cl as ClassName;
}
