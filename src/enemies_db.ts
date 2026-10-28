/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Enemy } from "./types";

export interface EnemyTemplate {
  name: string;
  maxHp: number;
  atk: number;
  def: number;
  critChance: number;
  dodgeChance: number;
  accuracy: number;
  avatarUrl: string;
  aiType: "attacker" | "spellcaster" | "tank" | "boss";
  xpAwarded: number;
  goldAwarded: number;
  dropMaterials: string[];
}

// ==================== CHAPTER 1: THE FOREST (Keep as-is) ====================

export const FOREST_ENEMIES: EnemyTemplate[] = [
  {
    name: "Rabid Timberwolf",
    maxHp: 180,
    atk: 36,
    def: 6,
    critChance: 12,
    dodgeChance: 10,
    accuracy: 95,
    avatarUrl: "https://img.magnific.com/free-vector/fierce-grey-wolf-illustration_1308-166362.jpg?semt=ais_hybrid&w=740&q=80",
    aiType: "attacker",
    xpAwarded: 15,
    goldAwarded: 12,
    dropMaterials: ["wolf_pelt", "ancient_bone"],
  },
  {
    name: "Gnarled Mandrake",
    maxHp: 150,
    atk: 32,
    def: 4,
    critChance: 5,
    dodgeChance: 15,
    accuracy: 90,
    avatarUrl: "https://cdn.pixabay.com/photo/2024/11/25/16/54/mandrake-9223640_1280.png",
    aiType: "spellcaster",
    xpAwarded: 18,
    goldAwarded: 15,
    dropMaterials: ["magic_bloom", "toxin_gland"],
  },
  {
    name: "Mossback Tortoise",
    maxHp: 280,
    atk: 28,
    def: 25,
    critChance: 3,
    dodgeChance: 2,
    accuracy: 85,
    avatarUrl: "https://png.pngtree.com/png-vector/20251028/ourlarge/pngtree-fantasy-mountain-tortoise-with-rock-and-moss-shell-png-image_17842050.webp",
    aiType: "tank",
    xpAwarded: 22,
    goldAwarded: 18,
    dropMaterials: ["iron_ore", "ancient_bone"],
  },
  {
    name: "Venomous Spindle-Spider",
    maxHp: 130,
    atk: 34,
    def: 3,
    critChance: 15,
    dodgeChance: 12,
    accuracy: 95,
    avatarUrl: "https://i.pinimg.com/474x/1c/5b/99/1c5b9959c57ffcf336578a52079e3b71.jpg",
    aiType: "attacker",
    xpAwarded: 16,
    goldAwarded: 13,
    dropMaterials: ["toxin_gland", "shadow_silk"],
  },
  {
    name: "Fungal Spore-Growth",
    maxHp: 160,
    atk: 30,
    def: 5,
    critChance: 5,
    dodgeChance: 5,
    accuracy: 90,
    avatarUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOb0n-8uDYfxHXCSi5_OYuJ7YkGPs-b7wdHw&s",
    aiType: "spellcaster",
    xpAwarded: 18,
    goldAwarded: 15,
    dropMaterials: ["magic_bloom", "moonsilk_thread"],
  },
  {
    name: "Goblin Scout",
    maxHp: 140,
    atk: 32,
    def: 4,
    critChance: 10,
    dodgeChance: 12,
    accuracy: 95,
    avatarUrl: "https://img.freepik.com/premium-photo/cute-goblin-character-illustration-fantasy-monster-isolated-white-background_1020495-738153.jpg",
    aiType: "attacker",
    xpAwarded: 15,
    goldAwarded: 12,
    dropMaterials: ["iron_ore", "ancient_bone"],
  },
];

// ==================== WAY 1: CAVE ====================

export const CAVE_ENEMIES: EnemyTemplate[] = [
  {
    name: "Skeleton Miner",
    maxHp: 200,
    atk: 38,
    def: 14,
    critChance: 8,
    dodgeChance: 4,
    accuracy: 95,
    avatarUrl: "https://i.pinimg.com/474x/3e/2f/1a/3e2f1a8c5d7e9f2b4a6c8d0e1f3a5b7c.jpg",
    aiType: "attacker",
    xpAwarded: 20,
    goldAwarded: 15,
    dropMaterials: ["iron_ore", "ancient_bone", "cave_crystal"],
  },
  {
    name: "Cave Goblin Scout",
    maxHp: 140,
    atk: 34,
    def: 4,
    critChance: 12,
    dodgeChance: 15,
    accuracy: 100,
    avatarUrl: "https://www.myminifactory.com/images/thumbnails/373340_900x.jpg",
    aiType: "attacker",
    xpAwarded: 18,
    goldAwarded: 14,
    dropMaterials: ["iron_ore", "toxin_gland"],
  },
  {
    name: "Moss-Covered Sporeling",
    maxHp: 170,
    atk: 32,
    def: 6,
    critChance: 5,
    dodgeChance: 6,
    accuracy: 90,
    avatarUrl: "https://monster.fandom.com/wiki/Slime?file=Slime_%28DQM%29.png",
    aiType: "spellcaster",
    xpAwarded: 20,
    goldAwarded: 16,
    dropMaterials: ["magic_bloom", "toxin_gland"],
  },
  {
    name: "Stone Elemental Fragment",
    maxHp: 320,
    atk: 30,
    def: 28,
    critChance: 3,
    dodgeChance: 2,
    accuracy: 85,
    avatarUrl: "https://en.wikipedia.org/wiki/Skeleton_(undead)#/media/File:Skeleton_(PSF).png",
    aiType: "tank",
    xpAwarded: 25,
    goldAwarded: 20,
    dropMaterials: ["iron_ore", "cave_crystal"],
  },
  {
    name: "Bat Swarm",
    maxHp: 120,
    atk: 36,
    def: 3,
    critChance: 18,
    dodgeChance: 20,
    accuracy: 100,
    avatarUrl: "https://runescape.wiki/w/Goblin_Raider?file=Goblin_raider.png",
    aiType: "attacker",
    xpAwarded: 16,
    goldAwarded: 12,
    dropMaterials: ["shadow_silk", "moonsilk_thread"],
  },
];

// ==================== WAY 1: ABANDONED TRAIL ====================

export const TRAIL_ENEMIES: EnemyTemplate[] = [
  {
    name: "Goblin Raider",
    maxHp: 210,
    atk: 42,
    def: 8,
    critChance: 10,
    dodgeChance: 10,
    accuracy: 95,
    avatarUrl: "https://www.d20pfsrd.com/bestiary/unique-monsters/cr-4/goblin-raider-goblin-fighter-5/",
    aiType: "attacker",
    xpAwarded: 22,
    goldAwarded: 20,
    dropMaterials: ["iron_ore", "wolf_pelt", "goblin_totem"],
  },
  {
    name: "Goblin Archer",
    maxHp: 160,
    atk: 40,
    def: 5,
    critChance: 14,
    dodgeChance: 12,
    accuracy: 100,
    avatarUrl: "https://www.myminifactory.com/object/3d-print-goblin-raiders-classic-monsters-fantasy-miniatures-373340",
    aiType: "attacker",
    xpAwarded: 20,
    goldAwarded: 18,
    dropMaterials: ["wolf_pelt", "ancient_bone"],
  },
  {
    name: "Goblin Shaman",
    maxHp: 180,
    atk: 44,
    def: 6,
    critChance: 8,
    dodgeChance: 10,
    accuracy: 95,
    avatarUrl: "https://runescape.wiki/w/Goblin_Raider",
    aiType: "spellcaster",
    xpAwarded: 25,
    goldAwarded: 22,
    dropMaterials: ["magic_bloom", "goblin_totem"],
  },
  {
    name: "Dire Wolf Mount",
    maxHp: 280,
    atk: 48,
    def: 10,
    critChance: 15,
    dodgeChance: 8,
    accuracy: 100,
    avatarUrl: "https://en.wikipedia.org/wiki/Skeleton_(undead)#/media/File:Skeleton_(PSF).png",
    aiType: "attacker",
    xpAwarded: 28,
    goldAwarded: 24,
    dropMaterials: ["wolf_pelt", "ancient_bone"],
  },
  {
    name: "Trap-setter Goblin",
    maxHp: 150,
    atk: 36,
    def: 4,
    critChance: 12,
    dodgeChance: 18,
    accuracy: 95,
    avatarUrl: "https://www.pinterest.com/flfordguy/goblins-gremlins-and-orcs/",
    aiType: "spellcaster",
    xpAwarded: 22,
    goldAwarded: 20,
    dropMaterials: ["iron_ore", "moonsilk_thread", "goblin_totem"],
  },
];

// ==================== WAY 1 PATH 1: LICH CASTLE ====================

export const LICH_CASTLE_ENEMIES: EnemyTemplate[] = [
  {
    name: "Skeleton Warrior",
    maxHp: 380,
    atk: 58,
    def: 28,
    critChance: 6,
    dodgeChance: 5,
    accuracy: 95,
    avatarUrl: "https://en.wikipedia.org/wiki/Skeleton_(undead)#/media/File:Skeleton_(PSF).png",
    aiType: "tank",
    xpAwarded: 35,
    goldAwarded: 28,
    dropMaterials: ["ancient_bone", "iron_ore"],
  },
  {
    name: "Crypt Ghoul",
    maxHp: 300,
    atk: 62,
    def: 12,
    critChance: 14,
    dodgeChance: 12,
    accuracy: 100,
    avatarUrl: "https://terraria-archive.fandom.com/wiki/Undead_Miner",
    aiType: "attacker",
    xpAwarded: 38,
    goldAwarded: 30,
    dropMaterials: ["toxin_gland", "lich_phial"],
  },
  {
    name: "Wraith Specter",
    maxHp: 280,
    atk: 60,
    def: 10,
    critChance: 18,
    dodgeChance: 25,
    accuracy: 105,
    avatarUrl: "https://en.wikipedia.org/wiki/Skeleton_(undead)#/media/File:Skeleton_(PSF).png",
    aiType: "spellcaster",
    xpAwarded: 42,
    goldAwarded: 32,
    dropMaterials: ["shadow_silk", "soul_thread"],
  },
  {
    name: "Bone Archer",
    maxHp: 320,
    atk: 64,
    def: 14,
    critChance: 16,
    dodgeChance: 10,
    accuracy: 105,
    avatarUrl: "https://www.pinterest.com/chessdope/skeleton-warriors/",
    aiType: "attacker",
    xpAwarded: 36,
    goldAwarded: 28,
    dropMaterials: ["ancient_bone", "lich_phial"],
  },
  {
    name: "Necromancer Acolyte",
    maxHp: 340,
    atk: 68,
    def: 16,
    critChance: 10,
    dodgeChance: 14,
    accuracy: 100,
    avatarUrl: "https://en.wikipedia.org/wiki/Skeleton_(undead)#/media/File:Skeleton_(PSF).png",
    aiType: "spellcaster",
    xpAwarded: 45,
    goldAwarded: 35,
    dropMaterials: ["soul_thread", "lich_phial"],
  },
];

// ==================== WAY 1 PATH 1: VOID ====================

export const VOID_ENEMIES: EnemyTemplate[] = [
  {
    name: "Voidling Spawn",
    maxHp: 200,
    atk: 55,
    def: 6,
    critChance: 10,
    dodgeChance: 14,
    accuracy: 95,
    avatarUrl: "https://riskofrain2.fandom.com/wiki/Voidling",
    aiType: "attacker",
    xpAwarded: 40,
    goldAwarded: 30,
    dropMaterials: ["void_residue", "void_tendril"],
  },
  {
    name: "Rift Wraith",
    maxHp: 350,
    atk: 72,
    def: 14,
    critChance: 18,
    dodgeChance: 28,
    accuracy: 105,
    avatarUrl: "http://kpogl.wikidot.com/monster:voidling",
    aiType: "spellcaster",
    xpAwarded: 50,
    goldAwarded: 38,
    dropMaterials: ["voidstone_fragment", "shadow_silk"],
  },
  {
    name: "Shadow Amalgam",
    maxHp: 500,
    atk: 65,
    def: 30,
    critChance: 8,
    dodgeChance: 4,
    accuracy: 95,
    avatarUrl: "https://riskofrain2.fandom.com/wiki/Voidling",
    aiType: "tank",
    xpAwarded: 55,
    goldAwarded: 40,
    dropMaterials: ["void_residue", "void_tendril"],
  },
  {
    name: "Anomaly Tendril",
    maxHp: 280,
    atk: 68,
    def: 10,
    critChance: 12,
    dodgeChance: 16,
    accuracy: 100,
    avatarUrl: "https://riskofrain2.fandom.com/wiki/Voidling",
    aiType: "spellcaster",
    xpAwarded: 45,
    goldAwarded: 35,
    dropMaterials: ["voidstone_fragment", "void_tendril"],
  },
  {
    name: "Corrupted Echo",
    maxHp: 360,
    atk: 78,
    def: 18,
    critChance: 15,
    dodgeChance: 20,
    accuracy: 105,
    avatarUrl: "http://kpogl.wikidot.com/monster:voidling",
    aiType: "spellcaster",
    xpAwarded: 52,
    goldAwarded: 40,
    dropMaterials: ["soul_thread", "void_residue"],
  },
];

// ==================== WAY 1 PATH 2: PEACEFUL CITY ====================

export const CITY_ENEMIES: EnemyTemplate[] = [
  {
    name: "Greedy Villager",
    maxHp: 220,
    atk: 50,
    def: 6,
    critChance: 10,
    dodgeChance: 10,
    accuracy: 95,
    avatarUrl: "https://en.wikipedia.org/wiki/Skeleton_(undead)#/media/File:Skeleton_(PSF).png",
    aiType: "attacker",
    xpAwarded: 45,
    goldAwarded: 50,
    dropMaterials: ["iron_ore", "gilded_coin"],
  },
  {
    name: "Illusion Thief",
    maxHp: 260,
    atk: 62,
    def: 8,
    critChance: 22,
    dodgeChance: 20,
    accuracy: 105,
    avatarUrl: "https://www.myminifactory.com/object/3d-print-goblin-raiders-classic-monsters-fantasy-miniatures-373340",
    aiType: "attacker",
    xpAwarded: 50,
    goldAwarded: 45,
    dropMaterials: ["shadow_silk", "gilded_coin"],
  },
  {
    name: "Hoarder Construct",
    maxHp: 550,
    atk: 48,
    def: 38,
    critChance: 4,
    dodgeChance: 3,
    accuracy: 90,
    avatarUrl: "https://monster.fandom.com/wiki/Slime?file=Slime_%28DQM%29.png",
    aiType: "tank",
    xpAwarded: 55,
    goldAwarded: 60,
    dropMaterials: ["iron_ore", "gilded_coin"],
  },
  {
    name: "Merchant Assassin",
    maxHp: 300,
    atk: 72,
    def: 12,
    critChance: 20,
    dodgeChance: 16,
    accuracy: 100,
    avatarUrl: "https://runescape.wiki/w/Goblin_Raider",
    aiType: "attacker",
    xpAwarded: 52,
    goldAwarded: 48,
    dropMaterials: ["toxin_gland", "shadow_silk"],
  },
  {
    name: "Golden Golem",
    maxHp: 600,
    atk: 55,
    def: 42,
    critChance: 5,
    dodgeChance: 2,
    accuracy: 90,
    avatarUrl: "https://en.wikipedia.org/wiki/Skeleton_(undead)#/media/File:Skeleton_(PSF).png",
    aiType: "tank",
    xpAwarded: 60,
    goldAwarded: 80,
    dropMaterials: ["iron_ore", "gilded_coin"],
  },
];

// ==================== WAY 1 PATH 2: WHITE CITADEL ====================

export const CITADEL_ENEMIES: EnemyTemplate[] = [
  {
    name: "Fallen Angel Scout",
    maxHp: 300,
    atk: 58,
    def: 12,
    critChance: 14,
    dodgeChance: 14,
    accuracy: 100,
    avatarUrl: "https://www.reddit.com/r/dndnext/comments/3iv4xu/homebrew_monster_a_day_fallen_angel/",
    aiType: "attacker",
    xpAwarded: 42,
    goldAwarded: 32,
    dropMaterials: ["blessed_silk", "angel_tear"],
  },
  {
    name: "Corrupted Seraph",
    maxHp: 420,
    atk: 55,
    def: 28,
    critChance: 8,
    dodgeChance: 8,
    accuracy: 95,
    avatarUrl: "https://food-fantasy.fandom.com/wiki/Fallen_Angels",
    aiType: "tank",
    xpAwarded: 48,
    goldAwarded: 36,
    dropMaterials: ["blessed_silk", "angel_tear"],
  },
  {
    name: "Winged Betrayer",
    maxHp: 320,
    atk: 64,
    def: 14,
    critChance: 18,
    dodgeChance: 24,
    accuracy: 100,
    avatarUrl: "https://www.5esrd.com/database/creature/angel-fallen/",
    aiType: "attacker",
    xpAwarded: 45,
    goldAwarded: 34,
    dropMaterials: ["chimera_feather", "angel_tear"],
  },
  {
    name: "Divine Deserter",
    maxHp: 380,
    atk: 52,
    def: 32,
    critChance: 5,
    dodgeChance: 6,
    accuracy: 95,
    avatarUrl: "https://www.pinterest.com/ideas/fallen-angel-dnd-art/933007621469/",
    aiType: "tank",
    xpAwarded: 44,
    goldAwarded: 33,
    dropMaterials: ["ancient_bone", "blessed_silk"],
  },
  {
    name: "Shadowed Herald",
    maxHp: 340,
    atk: 66,
    def: 16,
    critChance: 12,
    dodgeChance: 14,
    accuracy: 100,
    avatarUrl: "https://www.reddit.com/r/dndnext/comments/3iv4xu/homebrew_monster_a_day_fallen_angel/",
    aiType: "spellcaster",
    xpAwarded: 50,
    goldAwarded: 38,
    dropMaterials: ["soul_thread", "voidstone_fragment"],
  },
];

// ==================== WAY 2: DUNGEON ====================

export const DUNGEON_ENEMIES: EnemyTemplate[] = [
  {
    name: "Restless Crypt Ghoul",
    maxHp: 280,
    atk: 48,
    def: 10,
    critChance: 12,
    dodgeChance: 10,
    accuracy: 100,
    avatarUrl: "https://terraria-archive.fandom.com/wiki/Undead_Miner",
    aiType: "attacker",
    xpAwarded: 28,
    goldAwarded: 22,
    dropMaterials: ["toxin_gland", "ancient_bone"],
  },
  {
    name: "Skeleton Archer",
    maxHp: 320,
    atk: 52,
    def: 12,
    critChance: 18,
    dodgeChance: 12,
    accuracy: 100,
    avatarUrl: "https://en.wikipedia.org/wiki/Skeleton_(undead)#/media/File:Skeleton_(PSF).png",
    aiType: "attacker",
    xpAwarded: 30,
    goldAwarded: 24,
    dropMaterials: ["ancient_bone", "lich_phial"],
  },
  {
    name: "Grave Sentry",
    maxHp: 450,
    atk: 42,
    def: 35,
    critChance: 4,
    dodgeChance: 4,
    accuracy: 90,
    avatarUrl: "https://www.pinterest.com/chessdope/skeleton-warriors/",
    aiType: "tank",
    xpAwarded: 35,
    goldAwarded: 28,
    dropMaterials: ["iron_ore", "ancient_bone"],
  },
  {
    name: "Stone Gargoyle",
    maxHp: 380,
    atk: 50,
    def: 30,
    critChance: 6,
    dodgeChance: 6,
    accuracy: 95,
    avatarUrl: "https://en.wikipedia.org/wiki/Skeleton_(undead)#/media/File:Skeleton_(PSF).png",
    aiType: "tank",
    xpAwarded: 32,
    goldAwarded: 26,
    dropMaterials: ["iron_ore", "glacial_shard"],
  },
  {
    name: "Bone Amalgamation",
    maxHp: 500,
    atk: 55,
    def: 20,
    critChance: 8,
    dodgeChance: 3,
    accuracy: 95,
    avatarUrl: "https://en.wikipedia.org/wiki/Skeleton_(undead)#/media/File:Skeleton_(PSF).png",
    aiType: "tank",
    xpAwarded: 38,
    goldAwarded: 30,
    dropMaterials: ["ancient_bone", "lich_phial"],
  },
];

// ==================== WAY 2: TRADING CITY ====================

export const TRADING_ENEMIES: EnemyTemplate[] = [
  {
    name: "Evil Adventurer Warrior",
    maxHp: 360,
    atk: 58,
    def: 22,
    critChance: 10,
    dodgeChance: 8,
    accuracy: 95,
    avatarUrl: "https://en.wikipedia.org/wiki/Skeleton_(undead)#/media/File:Skeleton_(PSF).png",
    aiType: "tank",
    xpAwarded: 35,
    goldAwarded: 30,
    dropMaterials: ["iron_ore", "gilded_coin"],
  },
  {
    name: "Rogue Rival",
    maxHp: 280,
    atk: 62,
    def: 8,
    critChance: 22,
    dodgeChance: 18,
    accuracy: 105,
    avatarUrl: "https://www.myminifactory.com/object/3d-print-goblin-raiders-classic-monsters-fantasy-miniatures-373340",
    aiType: "attacker",
    xpAwarded: 38,
    goldAwarded: 32,
    dropMaterials: ["toxin_gland", "shadow_silk"],
  },
  {
    name: "Mercenary Mage",
    maxHp: 300,
    atk: 66,
    def: 10,
    critChance: 12,
    dodgeChance: 12,
    accuracy: 100,
    avatarUrl: "https://monster.fandom.com/wiki/Slime?file=Slime_%28DQM%29.png",
    aiType: "spellcaster",
    xpAwarded: 40,
    goldAwarded: 34,
    dropMaterials: ["magic_bloom", "ember_core"],
  },
  {
    name: "Corrupt Cleric",
    maxHp: 340,
    atk: 54,
    def: 24,
    critChance: 8,
    dodgeChance: 8,
    accuracy: 95,
    avatarUrl: "https://food-fantasy.fandom.com/wiki/Fallen_Angels",
    aiType: "spellcaster",
    xpAwarded: 42,
    goldAwarded: 35,
    dropMaterials: ["blessed_silk", "gilded_coin"],
  },
  {
    name: "Bandit Leader",
    maxHp: 380,
    atk: 60,
    def: 18,
    critChance: 14,
    dodgeChance: 12,
    accuracy: 100,
    avatarUrl: "https://runescape.wiki/w/Goblin_Raider",
    aiType: "attacker",
    xpAwarded: 45,
    goldAwarded: 40,
    dropMaterials: ["iron_ore", "wolf_pelt"],
  },
];

// ==================== WAY 2 PATH 1: SKY ISLAND ====================

export const SKY_ENEMIES: EnemyTemplate[] = [
  {
    name: "Sky Harpy",
    maxHp: 300,
    atk: 58,
    def: 10,
    critChance: 16,
    dodgeChance: 16,
    accuracy: 100,
    avatarUrl: "https://en.wikipedia.org/wiki/Skeleton_(undead)#/media/File:Skeleton_(PSF).png",
    aiType: "attacker",
    xpAwarded: 38,
    goldAwarded: 30,
    dropMaterials: ["chimera_feather", "moonsilk_thread"],
  },
  {
    name: "Storm Bird",
    maxHp: 340,
    atk: 64,
    def: 12,
    critChance: 14,
    dodgeChance: 14,
    accuracy: 100,
    avatarUrl: "https://riskofrain2.fandom.com/wiki/Voidling",
    aiType: "spellcaster",
    xpAwarded: 42,
    goldAwarded: 33,
    dropMaterials: ["chimera_feather", "magic_bloom"],
  },
  {
    name: "Aerial Serpent",
    maxHp: 420,
    atk: 60,
    def: 22,
    critChance: 10,
    dodgeChance: 10,
    accuracy: 95,
    avatarUrl: "https://monster.fandom.com/wiki/Slime?file=Slime_%28DQM%29.png",
    aiType: "tank",
    xpAwarded: 44,
    goldAwarded: 35,
    dropMaterials: ["ancient_bone", "soul_thread"],
  },
  {
    name: "Cloud Elemental",
    maxHp: 320,
    atk: 62,
    def: 14,
    critChance: 10,
    dodgeChance: 18,
    accuracy: 100,
    avatarUrl: "https://en.wikipedia.org/wiki/Skeleton_(undead)#/media/File:Skeleton_(PSF).png",
    aiType: "spellcaster",
    xpAwarded: 40,
    goldAwarded: 32,
    dropMaterials: ["magic_bloom", "glacial_shard"],
  },
  {
    name: "Feathered Scout",
    maxHp: 260,
    atk: 56,
    def: 8,
    critChance: 14,
    dodgeChance: 20,
    accuracy: 105,
    avatarUrl: "https://www.pinterest.com/ideas/fallen-angel-dnd-art/933007621469/",
    aiType: "attacker",
    xpAwarded: 36,
    goldAwarded: 28,
    dropMaterials: ["chimera_feather", "angel_tear"],
  },
];

// ==================== WAY 2 PATH 1: MYSTERIOUS LAB ====================

export const LAB_ENEMIES: EnemyTemplate[] = [
  {
    name: "Acidic Slime",
    maxHp: 250,
    atk: 58,
    def: 6,
    critChance: 10,
    dodgeChance: 16,
    accuracy: 95,
    avatarUrl: "https://monster.fandom.com/wiki/Slime?file=Slime_%28DQM%29.png",
    aiType: "attacker",
    xpAwarded: 42,
    goldAwarded: 32,
    dropMaterials: ["toxin_gland", "slime_core"],
  },
  {
    name: "Gelatinous Ooze",
    maxHp: 450,
    atk: 55,
    def: 24,
    critChance: 5,
    dodgeChance: 5,
    accuracy: 90,
    avatarUrl: "https://en.wikipedia.org/wiki/Slime_(monster)",
    aiType: "tank",
    xpAwarded: 48,
    goldAwarded: 36,
    dropMaterials: ["void_residue", "slime_core"],
  },
  {
    name: "Toxic Blob",
    maxHp: 300,
    atk: 62,
    def: 8,
    critChance: 10,
    dodgeChance: 12,
    accuracy: 95,
    avatarUrl: "https://www.reddit.com/r/worldbuilding/comments/154rxcu/a_guide_to_slime_monsters_of_looming_gaia_info_in/",
    aiType: "spellcaster",
    xpAwarded: 45,
    goldAwarded: 34,
    dropMaterials: ["toxin_gland", "magic_bloom"],
  },
  {
    name: "Crystal Slime",
    maxHp: 380,
    atk: 50,
    def: 35,
    critChance: 6,
    dodgeChance: 8,
    accuracy: 95,
    avatarUrl: "https://monster.fandom.com/wiki/Slime?file=Slime_%28DQM%29.png",
    aiType: "tank",
    xpAwarded: 50,
    goldAwarded: 38,
    dropMaterials: ["voidstone_fragment", "slime_core"],
  },
  {
    name: "Swarm Slime",
    maxHp: 200,
    atk: 66,
    def: 4,
    critChance: 15,
    dodgeChance: 14,
    accuracy: 100,
    avatarUrl: "https://en.wikipedia.org/wiki/Slime_(monster)",
    aiType: "attacker",
    xpAwarded: 44,
    goldAwarded: 33,
    dropMaterials: ["void_residue", "toxin_gland"],
  },
];

// ==================== WAY 2 PATH 2: FRONTLINE ====================

export const FRONTLINE_ENEMIES: EnemyTemplate[] = [
  {
    name: "Demon Knight",
    maxHp: 420,
    atk: 68,
    def: 28,
    critChance: 10,
    dodgeChance: 6,
    accuracy: 95,
    avatarUrl: "https://www.5esrd.com/database/creature/demonic-knight/",
    aiType: "tank",
    xpAwarded: 45,
    goldAwarded: 35,
    dropMaterials: ["demon_blood_vial", "infernal_brand"],
  },
  {
    name: "Hellhound",
    maxHp: 320,
    atk: 72,
    def: 12,
    critChance: 18,
    dodgeChance: 14,
    accuracy: 100,
    avatarUrl: "https://en.wikipedia.org/wiki/Skeleton_(undead)#/media/File:Skeleton_(PSF).png",
    aiType: "attacker",
    xpAwarded: 48,
    goldAwarded: 37,
    dropMaterials: ["demon_blood_vial", "wolf_pelt"],
  },
  {
    name: "Void Imp",
    maxHp: 250,
    atk: 64,
    def: 6,
    critChance: 14,
    dodgeChance: 16,
    accuracy: 100,
    avatarUrl: "https://riskofrain2.fandom.com/wiki/Voidling",
    aiType: "spellcaster",
    xpAwarded: 42,
    goldAwarded: 33,
    dropMaterials: ["ember_core", "volcanic_ash"],
  },
  {
    name: "Succubus Lure",
    maxHp: 340,
    atk: 70,
    def: 14,
    critChance: 16,
    dodgeChance: 18,
    accuracy: 100,
    avatarUrl: "https://food-fantasy.fandom.com/wiki/Fallen_Angels",
    aiType: "spellcaster",
    xpAwarded: 50,
    goldAwarded: 40,
    dropMaterials: ["demon_blood_vial", "shadow_silk"],
  },
  {
    name: "Armored Fiend",
    maxHp: 520,
    atk: 58,
    def: 38,
    critChance: 5,
    dodgeChance: 3,
    accuracy: 90,
    avatarUrl: "https://www.d20pfsrd.com/bestiary/monster-listings/outsiders/demonic-knight-tohc/",
    aiType: "tank",
    xpAwarded: 55,
    goldAwarded: 42,
    dropMaterials: ["iron_ore", "infernal_brand"],
  },
];

// ==================== WAY 2 PATH 2: HORIZON CASTLE ====================

export const HORIZON_ENEMIES: EnemyTemplate[] = [
  {
    name: "Demon Knight Elite",
    maxHp: 520,
    atk: 78,
    def: 32,
    critChance: 12,
    dodgeChance: 8,
    accuracy: 100,
    avatarUrl: "https://www.5esrd.com/database/creature/demonic-knight/",
    aiType: "tank",
    xpAwarded: 55,
    goldAwarded: 42,
    dropMaterials: ["demon_blood_vial", "infernal_brand"],
  },
  {
    name: "Demon General",
    maxHp: 460,
    atk: 82,
    def: 28,
    critChance: 14,
    dodgeChance: 10,
    accuracy: 100,
    avatarUrl: "https://www.d20pfsrd.com/bestiary/monster-listings/outsiders/demonic-knight-tohc/",
    aiType: "tank",
    xpAwarded: 58,
    goldAwarded: 45,
    dropMaterials: ["demon_blood_vial", "soul_thread"],
  },
  {
    name: "Shadow Fiend",
    maxHp: 380,
    atk: 85,
    def: 16,
    critChance: 22,
    dodgeChance: 24,
    accuracy: 105,
    avatarUrl: "https://riskofrain2.fandom.com/wiki/Voidling",
    aiType: "attacker",
    xpAwarded: 55,
    goldAwarded: 42,
    dropMaterials: ["shadow_silk", "infernal_brand"],
  },
  {
    name: "Infernal Mage",
    maxHp: 420,
    atk: 88,
    def: 18,
    critChance: 14,
    dodgeChance: 12,
    accuracy: 100,
    avatarUrl: "https://food-fantasy.fandom.com/wiki/Fallen_Angels",
    aiType: "spellcaster",
    xpAwarded: 60,
    goldAwarded: 48,
    dropMaterials: ["ember_core", "soul_thread"],
  },
  {
    name: "Blood Lord",
    maxHp: 500,
    atk: 80,
    def: 24,
    critChance: 16,
    dodgeChance: 12,
    accuracy: 100,
    avatarUrl: "https://en.wikipedia.org/wiki/Skeleton_(undead)#/media/File:Skeleton_(PSF).png",
    aiType: "attacker",
    xpAwarded: 62,
    goldAwarded: 50,
    dropMaterials: ["demon_blood_vial", "infernal_brand"],
  },
];

// ==================== ALL BOSSES ====================

export interface BossEntry {
  name: string;
  maxHp: number;
  atk: number;
  def: number;
  critChance: number;
  dodgeChance: number;
  accuracy: number;
  avatarUrl: string;
  aiType: "boss";
  xpAwarded: number;
  goldAwarded: number;
  dropMaterials: string[];
}

export const CHAPTER_BOSSES: Record<string, BossEntry> = {
  // Chapter 1 - Keep original
  "1_0_0": {
    name: "Ancient Timber-Giant [BOSS]",
    maxHp: 950,
    atk: 65,
    def: 30,
    critChance: 8,
    dodgeChance: 5,
    accuracy: 95,
    avatarUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNM9TLRB5HPrpyCxrxpWR-y-nGbMqyJK4HXg&s",
    aiType: "boss",
    xpAwarded: 120,
    goldAwarded: 100,
    dropMaterials: ["ancient_bone", "blessed_silk", "chimera_feather"],
  },

  // Way 1 - Cave Boss
  "2_1_0": {
    name: "Ore Eater [BOSS]",
    maxHp: 1400,
    atk: 85,
    def: 40,
    critChance: 10,
    dodgeChance: 5,
    accuracy: 95,
    avatarUrl: "https://terraria-archive.fandom.com/wiki/Undead_Miner",
    aiType: "boss",
    xpAwarded: 200,
    goldAwarded: 150,
    dropMaterials: ["iron_ore", "ancient_bone", "ember_core"],
  },

  // Way 1 - Abandoned Trail Boss
  "3_1_0": {
    name: "Goblin General [BOSS]",
    maxHp: 1600,
    atk: 95,
    def: 35,
    critChance: 12,
    dodgeChance: 10,
    accuracy: 100,
    avatarUrl: "https://runescape.wiki/w/Goblin_Raider",
    aiType: "boss",
    xpAwarded: 250,
    goldAwarded: 200,
    dropMaterials: ["iron_ore", "goblin_totem", "chimera_feather"],
  },

  // Way 1 Path 1 - Lich Castle Boss
  "4_1_1": {
    name: "Lich Archmage [BOSS]",
    maxHp: 2000,
    atk: 130,
    def: 30,
    critChance: 15,
    dodgeChance: 12,
    accuracy: 105,
    avatarUrl: "https://en.wikipedia.org/wiki/Skeleton_(undead)#/media/File:Skeleton_(PSF).png",
    aiType: "boss",
    xpAwarded: 350,
    goldAwarded: 250,
    dropMaterials: ["soul_thread", "lich_phial", "blessed_silk"],
  },

  // Way 1 Path 1 - Void Boss
  "5_1_1": {
    name: "Slaad, Void Entity [BOSS]",
    maxHp: 2800,
    atk: 150,
    def: 45,
    critChance: 15,
    dodgeChance: 14,
    accuracy: 110,
    avatarUrl: "https://riskofrain2.fandom.com/wiki/Voidling",
    aiType: "boss",
    xpAwarded: 500,
    goldAwarded: 350,
    dropMaterials: ["voidstone_fragment", "void_tendril", "soul_thread"],
  },

  // Way 1 Path 2 - Peaceful City Boss
  "4_1_2": {
    name: "Sin of Greed [BOSS]",
    maxHp: 2200,
    atk: 120,
    def: 38,
    critChance: 12,
    dodgeChance: 8,
    accuracy: 100,
    avatarUrl: "https://en.wikipedia.org/wiki/Skeleton_(undead)#/media/File:Skeleton_(PSF).png",
    aiType: "boss",
    xpAwarded: 380,
    goldAwarded: 500,
    dropMaterials: ["gilded_coin", "demon_blood_vial", "ember_core"],
  },

  // Way 1 Path 2 - White Citadel Boss
  "5_1_2": {
    name: "Sin of Pride - Lucifer [BOSS]",
    maxHp: 3500,
    atk: 175,
    def: 50,
    critChance: 18,
    dodgeChance: 12,
    accuracy: 110,
    avatarUrl: "https://www.reddit.com/r/dndnext/comments/3iv4xu/homebrew_monster_a_day_fallen_angel/",
    aiType: "boss",
    xpAwarded: 600,
    goldAwarded: 400,
    dropMaterials: ["soul_thread", "angel_tear", "chimera_feather"],
  },

  // Way 2 - Dungeon Boss
  "2_2_0": {
    name: "Death Knight [BOSS]",
    maxHp: 1700,
    atk: 110,
    def: 25,
    critChance: 14,
    dodgeChance: 8,
    accuracy: 100,
    avatarUrl: "https://en.wikipedia.org/wiki/Skeleton_(undead)#/media/File:Skeleton_(PSF).png",
    aiType: "boss",
    xpAwarded: 230,
    goldAwarded: 170,
    dropMaterials: ["ancient_bone", "lich_phial", "demon_blood_vial"],
  },

  // Way 2 - Trading City Boss
  "3_2_0": {
    name: "Greedeus [BOSS]",
    maxHp: 1800,
    atk: 115,
    def: 35,
    critChance: 12,
    dodgeChance: 10,
    accuracy: 100,
    avatarUrl: "https://runescape.wiki/w/Goblin_Raider",
    aiType: "boss",
    xpAwarded: 280,
    goldAwarded: 300,
    dropMaterials: ["gilded_coin", "demon_blood_vial", "wolf_pelt"],
  },

  // Way 2 Path 1 - Sky Island Boss
  "4_2_1": {
    name: "Ryu Jin, Sky Dragon [BOSS]",
    maxHp: 100000,
    atk: 125,
    def: 40,
    critChance: 14,
    dodgeChance: 10,
    accuracy: 100,
    avatarUrl: "https://en.wikipedia.org/wiki/Skeleton_(undead)#/media/File:Skeleton_(PSF).png",
    aiType: "boss",
    xpAwarded: 400,
    goldAwarded: 300,
    dropMaterials: ["chimera_feather", "glacial_shard", "angel_tear"],
  },

  // Way 2 Path 1 - Mysterious Lab Boss
  "5_2_1": {
    name: "Azelf, Mad Scientist [BOSS]",
    maxHp: 2600,
    atk: 140,
    def: 35,
    critChance: 15,
    dodgeChance: 14,
    accuracy: 105,
    avatarUrl: "https://monster.fandom.com/wiki/Slime?file=Slime_%28DQM%29.png",
    aiType: "boss",
    xpAwarded: 450,
    goldAwarded: 320,
    dropMaterials: ["toxin_gland", "slime_core", "voidstone_fragment"],
  },

  // Way 2 Path 2 - Frontline Boss
  "4_2_2": {
    name: "Demon King General Bael [BOSS]",
    maxHp: 2800,
    atk: 145,
    def: 42,
    critChance: 14,
    dodgeChance: 10,
    accuracy: 100,
    avatarUrl: "https://www.5esrd.com/database/creature/demonic-knight/",
    aiType: "boss",
    xpAwarded: 420,
    goldAwarded: 320,
    dropMaterials: ["demon_blood_vial", "infernal_brand", "soul_thread"],
  },

  // Way 2 Path 2 - Horizon Castle Boss
  "5_2_2": {
    name: "Demon Lord Verath [BOSS]",
    maxHp: 3200,
    atk: 165,
    def: 48,
    critChance: 16,
    dodgeChance: 12,
    accuracy: 105,
    avatarUrl: "https://www.d20pfsrd.com/bestiary/monster-listings/outsiders/demonic-knight-tohc/",
    aiType: "boss",
    xpAwarded: 550,
    goldAwarded: 400,
    dropMaterials: ["demon_blood_vial", "infernal_brand", "soul_thread"],
  },
};

// Map from (effectiveChapter, way, path) to enemy pool
function getEnemyPool(chapter: number, way: number, path: number): EnemyTemplate[] {
  if (chapter === 1) return FOREST_ENEMIES;

  // Way 1: Cave → Abandoned Trail → (Lich Castle | Peaceful City) → (Void | White Citadel)
  if (way === 1) {
    if (chapter === 2) return CAVE_ENEMIES;
    if (chapter === 3) return TRAIL_ENEMIES;
    if (chapter === 4) {
      if (path === 1) return LICH_CASTLE_ENEMIES;
      if (path === 2) return CITY_ENEMIES;
    }
    if (chapter === 5) {
      if (path === 1) return VOID_ENEMIES;
      if (path === 2) return CITADEL_ENEMIES;
    }
  }

  // Way 2: Dungeon → Trading City → (Sky Island | Frontline) → (Lab | Horizon Castle)
  if (way === 2) {
    if (chapter === 2) return DUNGEON_ENEMIES;
    if (chapter === 3) return TRADING_ENEMIES;
    if (chapter === 4) {
      if (path === 1) return SKY_ENEMIES;
      if (path === 2) return FRONTLINE_ENEMIES;
    }
    if (chapter === 5) {
      if (path === 1) return LAB_ENEMIES;
      if (path === 2) return HORIZON_ENEMIES;
    }
  }

  return FOREST_ENEMIES;
}

// Get boss key string
function getBossKey(chapter: number, way: number, path: number): string {
  if (chapter === 1) return "1_0_0";
  // Way 1
  if (way === 1) {
    if (chapter === 2) return "2_1_0";
    if (chapter === 3) return "3_1_0";
    if (chapter === 4) return path === 1 ? "4_1_1" : "4_1_2";
    if (chapter === 5) return path === 1 ? "5_1_1" : "5_1_2";
  }
  // Way 2
  if (way === 2) {
    if (chapter === 2) return "2_2_0";
    if (chapter === 3) return "3_2_0";
    if (chapter === 4) return path === 1 ? "4_2_1" : "4_2_2";
    if (chapter === 5) return path === 1 ? "5_2_1" : "5_2_2";
  }
  return "1_0_0";
}

export function spawnEnemyGroup(
  chapter: number,
  area: number,
  isElite: boolean,
  isBoss: boolean,
  nodeLabel?: string,
  way: number = 1,
  path: number = 1
): Enemy[] {
  const result: Enemy[] = [];

  // Calculate hpMultiplier
  let hpMultiplier = 1.0;
  const maxAreaForChapter = getMaxAreaForChapter(chapter, way, path);
  const steps = maxAreaForChapter - 1;
  if (area >= steps) hpMultiplier = 1.0;
  else hpMultiplier = 0.6 + (area / steps) * 0.4;

  if (isBoss) {
    const bossKey = getBossKey(chapter, way, path);
    const bossTemplate = CHAPTER_BOSSES[bossKey] || CHAPTER_BOSSES["1_0_0"];
    const bossHp = Math.round(bossTemplate.maxHp * hpMultiplier);
    result.push({
      id: "enemy_boss_" + Date.now(),
      name: bossTemplate.name,
      maxHp: bossHp,
      hp: bossHp,
      atk: bossTemplate.atk,
      def: bossTemplate.def,
      critChance: bossTemplate.critChance,
      dodgeChance: bossTemplate.dodgeChance,
      accuracy: bossTemplate.accuracy,
      avatarUrl: bossTemplate.avatarUrl,
      gridX: 2,
      gridY: 2,
      statusEffects: [],
      aiType: "boss",
      xpAwarded: bossTemplate.xpAwarded,
      goldAwarded: bossTemplate.goldAwarded,
      dropMaterials: (bossTemplate.dropMaterials || []).map(id => ({ id, quantity: 1 })),
    });
    return result;
  }

  const list = getEnemyPool(chapter, way, path);

  // Determine count
  const count = isElite ? 3 : Math.min(3, 1 + Math.floor(Math.random() * 2) + Math.floor(area / 6));

  for (let i = 0; i < count; i++) {
    const tIndex = Math.floor(Math.random() * list.length);
    const template = list[tIndex];

    let progressionScaler = isElite ? 1.4 : 1.0;
    progressionScaler += area * 0.08;

    const enemyHp = Math.round(template.maxHp * hpMultiplier * (isElite ? 1.4 : 1.0));
    const enemyAtk = Math.round(template.atk * progressionScaler * (isElite ? 1.4 : 1.0));

    let placementFound = false;
    let x = 1, y = 2;
    let placeTries = 0;
    while (!placementFound && placeTries < 20) {
      x = Math.floor(Math.random() * 3) + 1;
      y = Math.floor(Math.random() * 3) + 1;
      if (!result.some(e => e.gridX === x && e.gridY === y)) {
        placementFound = true;
      }
      placeTries++;
    }

    result.push({
      id: `enemy_${Date.now()}_${i}`,
      name: (isElite ? "E- " : "") + template.name,
      maxHp: enemyHp,
      hp: enemyHp,
      atk: enemyAtk,
      def: Math.round(template.def * (isElite ? 1.2 : 1.0)),
      critChance: template.critChance,
      dodgeChance: template.dodgeChance,
      accuracy: template.accuracy,
      avatarUrl: template.avatarUrl,
      gridX: x,
      gridY: y,
      statusEffects: [],
      aiType: template.aiType,
      xpAwarded: Math.round(template.xpAwarded * progressionScaler * (isElite ? 1.4 : 1.0)),
      goldAwarded: Math.round(template.goldAwarded * progressionScaler * (isElite ? 1.4 : 1.0)),
      dropMaterials: (template.dropMaterials || []).map(id => ({ id, quantity: 1 })),
    });
  }

  return result;
}

// ==================== FIXED ENCOUNTER SYSTEM ====================

/**
 * Monster count per stage index (0-based):
 *   Stage 1 (area 0) → 1 mon
 *   Stage 2 (area 1) → 2 mons
 *   Stage 3 (area 2) → 2 mons
 *   Stage 4 (area 3) → 2 mons
 *   Stage 5 (area 4) → 3 mons
 *   Stage 6 (area 5) → 3 mons
 *   Stage 7 (area 6) → 4 mons
 */
const STAGE_MONSTER_COUNTS = [1, 2, 2, 2, 3, 3, 4];

/**
 * Party-size stat multiplier — based on number of characters (not players).
 * 1 character → 60%, 2 → 70%, 3 → 80%, 4 → 90%, 5+ → 100%
 */
function getPartySizeMultiplier(partySize: number): number {
  if (partySize <= 1) return 0.60;
  if (partySize === 2) return 0.70;
  if (partySize === 3) return 0.80;
  if (partySize === 4) return 0.90;
  return 1.00;
}

/**
 * Gradual per-stage stat progression multiplier (fixed, not random).
 * Each stage is 5% stronger than the last.
 */
function getStageProgressionMultiplier(area: number): number {
  const table = [1.00, 1.05, 1.10, 1.15, 1.20, 1.25, 1.30];
  return table[Math.min(area, table.length - 1)];
}

/**
 * Spawns a fixed encounter for a given chapter/area/party-size.
 * Enemy types are randomly chosen from the chapter pool for variety,
 * but counts and stats are fixed and balanced.
 */
export function spawnFixedEncounter(
  chapter: number,
  area: number,
  partySize: number,
  isElite: boolean,
  way: number = 1,
  path: number = 1
): Enemy[] {
  const result: Enemy[] = [];
  const list = getEnemyPool(chapter, way, path);

  const baseCount = STAGE_MONSTER_COUNTS[Math.min(area, STAGE_MONSTER_COUNTS.length - 1)];
  // Elites get one extra monster
  const count = isElite ? Math.min(baseCount + 1, 5) : baseCount;

  const partySizeMult = getPartySizeMultiplier(partySize);
  const stageMult = getStageProgressionMultiplier(area);
  const eliteStatMult = isElite ? 1.30 : 1.00;

  // Prevent infinite loop if pool is smaller than needed
  const usedIndices: number[] = [];

  for (let i = 0; i < count; i++) {
    // Pick a random enemy from the pool (allow repeats if pool is too small)
    let tIndex = Math.floor(Math.random() * list.length);
    if (list.length >= count) {
      // Try to avoid duplicates for more variety
      let attempts = 0;
      while (usedIndices.includes(tIndex) && attempts < 10) {
        tIndex = Math.floor(Math.random() * list.length);
        attempts++;
      }
    }
    usedIndices.push(tIndex);
    const template = list[tIndex];

    const combined = partySizeMult * stageMult * eliteStatMult;
    const enemyHp  = Math.round(template.maxHp * combined);
    const enemyAtk = Math.round(template.atk  * combined);
    const enemyDef = Math.round(template.def  * (isElite ? 1.20 : 1.00));

    // Random grid placement (no duplicates)
    let placementFound = false;
    let x = 1, y = 2;
    let placeTries = 0;
    while (!placementFound && placeTries < 20) {
      x = Math.floor(Math.random() * 3) + 1;
      y = Math.floor(Math.random() * 3) + 1;
      if (!result.some(e => e.gridX === x && e.gridY === y)) {
        placementFound = true;
      }
      placeTries++;
    }

    result.push({
      id: `enemy_${Date.now()}_${i}`,
      name: (isElite ? "E- " : "") + template.name,
      maxHp: enemyHp,
      hp: enemyHp,
      atk: enemyAtk,
      def: enemyDef,
      critChance: template.critChance,
      dodgeChance: template.dodgeChance,
      accuracy: template.accuracy,
      avatarUrl: template.avatarUrl,
      gridX: x,
      gridY: y,
      statusEffects: [],
      aiType: template.aiType,
      xpAwarded: Math.round(template.xpAwarded * stageMult * eliteStatMult),
      goldAwarded: Math.round(template.goldAwarded * stageMult * eliteStatMult),
      dropMaterials: (template.dropMaterials || []).map(id => ({ id, quantity: 1 })),
    });
  }

  return result;
}

export function getMaxAreaForChapter(chapter: number, way: number = 1, path: number = 1): number {
  if (chapter === 1) return 8; // Forest - 8 lanes
  if (chapter === 2) return 5; // Cave or Dungeon
  if (chapter === 3) return 5; // Abandoned Trail or Trading City
  if (chapter === 4) return 5; // Lich Castle/Peaceful City or Sky Island/Frontline
  if (chapter === 5) return 5; // Void/White Citadel or Lab/Horizon Castle
  return 5;
}

export function getChapterDisplayName(chapter: number, way: number, path: number): string {
  if (chapter === 1) return "The Whispering Woods";
  if (way === 1) {
    if (chapter === 2) return "The Darkened Cave";
    if (chapter === 3) return "The Abandoned Trail";
    if (chapter === 4) return path === 1 ? "The Lich Castle" : "The Peaceful City";
    if (chapter === 5) return path === 1 ? "The Void" : "The White Citadel";
  }
  if (way === 2) {
    if (chapter === 2) return "The Forgotten Dungeon";
    if (chapter === 3) return "The Trading City";
    if (chapter === 4) return path === 1 ? "The Sky Island" : "The Frontline";
    if (chapter === 5) return path === 1 ? "The Mysterious Lab" : "Horizon Castle";
  }
  return "Unknown";
}

export function getChapterBackgroundUrl(chapter: number, way: number, path: number): string {
  if (chapter === 1) return "";
  if (way === 1) {
    if (chapter === 2) return "https://img.freepik.com/free-vector/dark-cave-with-blue-gemstones-walls-vector-cartoon-illustration-underground-mine-tunnel-with-sparkling-diamond-stones-rocky-mineral-stalactites-dungeon-treasure-search-game-background_107791-24382.jpg?semt=ais_hybrid&w=740&q=80";
    if (chapter === 3) return "https://cms-artifacts.motionarray.com/content/motion_array/1322754/Forest_Path_Flat_Cartoon_Background_high_resolution_preview_1322754.jpg?Expires=2078922816&Key-Pair-Id=K2ZDLYDZI2R1DF&Signature=F5hbFB3hteO2~TfHv0rvYHAzZocLYJhE76Kbe7g81b4UIGdGSwOolq6kYxxLn6AAT~GhiA-zaV831NHfp~aPYGKKHxjdZoM9JdzwU1xj5oN80gZW3j4yLaQO7aAWI30bnYlj3lNzbddqSMnF52FgOce-QZTk17lqz3OaNUZEgXSTWfibpn9rbPLl-3Ml1tT3~CvC1wCODIXIVZQTWv0rN5cg1vL2OhkecdvEyNjUgiDWB7OWKrJEFdJFR0cFa3mNV8Vy7l0mcsGBDbOsYJHlmRLYH7nloZrciX9g3jvN65jtbCHx7OHFX~tRX3RVzfTj6vcifjGuKzKXN1wBSRDfLA__";
    if (chapter === 4 && path === 1) return "https://www.shutterstock.com/image-vector/spooky-interior-dark-gothic-castle-600nw-2739873475.jpg";
    if (chapter === 4 && path === 2) return "https://media.istockphoto.com/id/1181725243/vector/cartoon-nature-scene-with-medieval-city-street.jpg?s=170667a&w=0&k=20&c=sWmRJak4ZiMKhhz-ReEdmYM3x4_F175SZiq7eIKa3uc=";
    if (chapter === 5 && path === 1) return "https://images.stockcake.com/public/0/a/1/0a121534-268a-428c-b203-cbaa60aac546_large/purple-void-portal-stockcake.jpg";
    if (chapter === 5 && path === 2) return "https://img.freepik.com/premium-photo/angelic-castle-paradise_839169-38698.jpg";
  }
  if (way === 2) {
    if (chapter === 2) return "https://t3.ftcdn.net/jpg/08/86/00/40/360_F_886004017_0wK4DSw929wQq3a2lfqocuO4bqqVfTPv.jpg";
    if (chapter === 3) return "https://media.istockphoto.com/id/1459368957/vector/cartoon-scene-with-beautiful-medieval-castles-far-east-kingdom-illustration-for-children.jpg?s=612x612&w=0&k=20&c=qoUCeiBa735bo8eTOlVxRGNt7V7OysB-yRUyAlAXcWc=";
    if (chapter === 4 && path === 1) return "https://thumbs.dreamstime.com/b/whimsical-cartoon-backdrop-floating-island-lush-greenery-waterfalls-cascading-down-sides-bright-sun-shining-334004814.jpg";
    if (chapter === 4 && path === 2) return "https://i.pinimg.com/736x/b4/6a/52/b46a5280645201974fb5ea06cf6bf45b.jpg";
    if (chapter === 5 && path === 1) return "https://media.craiyon.com/2025-07-14/cubmr7jzQCC3PAQs4e5uvw.webp";
    if (chapter === 5 && path === 2) return "https://thumb.photo-ac.com/be/be32e049b954c052aa10230556c5f5bc_t.jpeg";
  }
  return "";
}

export function getChapterDescription(chapter: number, way: number, path: number): string {
  if (chapter === 1) return "A dense, ancient forest teeming with wild beasts, territorial goblins, and hidden elemental spirits. The path is covered in thick fog, and danger lurks behind every tree.";
  if (way === 1) {
    if (chapter === 2) return "After venturing deeper, the group encounters a dimly lit cave promising fortune in ores and relics. Echoes of picks on stone fill the air.";
    if (chapter === 3) return "Victorius, the party finds an exit from the cave leading to an overgrown abandoned trail. Distant goblin camps smoke on the horizon.";
    if (chapter === 4 && path === 1) return "The trail leads into darker woods revealing a crumbling Lich Castle. Undead guardians stir as the party approaches.";
    if (chapter === 4 && path === 2) return "The trail exits the forest into what seems a beautiful, welcoming city. Kind villagers greet them... until the illusion shatters.";
    if (chapter === 5 && path === 1) return "A massive void rift opens after the castle falls, sucking the party in. Reality bends and twists.";
    if (chapter === 5 && path === 2) return "Escaping the false city, the party presses on and reaches a gleaming White Citadel, home to fallen angels.";
  }
  if (way === 2) {
    if (chapter === 2) return "After days in the woods, the party discovers an ancient dungeon entrance and enters seeking power.";
    if (chapter === 3) return "Fresh from the dungeon, the party heads to a nearby trading city to sell loot and resupply.";
    if (chapter === 4 && path === 1) return "Rumors of a floating Sky Island draw the party seeking rare artifacts and sky-touched treasures.";
    if (chapter === 4 && path === 2) return "News of struggling frontlines against demons prompts the party to assist the war effort.";
    if (chapter === 5 && path === 1) return "A secret passage leads to a Mysterious Lab filled with strange experiments and toxic hazards.";
    if (chapter === 5 && path === 2) return "Victorious on the front, the party spots Horizon Castle at dusk and investigates the demon stronghold.";
  }
  return "An unknown path stretches before you.";
}

export function getChapterEmoji(chapter: number, way: number, path: number): string {
  if (chapter === 1) return "🌲";
  if (way === 1) {
    if (chapter === 2) return "⛰️";
    if (chapter === 3) return "🛤️";
    if (chapter === 4 && path === 1) return "🏰";
    if (chapter === 4 && path === 2) return "🏙️";
    if (chapter === 5 && path === 1) return "🌀";
    if (chapter === 5 && path === 2) return "⛪";
  }
  if (way === 2) {
    if (chapter === 2) return "🪦";
    if (chapter === 3) return "🏪";
    if (chapter === 4 && path === 1) return "🏝️";
    if (chapter === 4 && path === 2) return "⚔️";
    if (chapter === 5 && path === 1) return "🧪";
    if (chapter === 5 && path === 2) return "🏯";
  }
  return "❓";
}