/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum TargetType {
  SINGLE_ENEMY = "SINGLE_ENEMY",
  ALL_ENEMIES = "ALL_ENEMIES",
  SINGLE_ALLY = "SINGLE_ALLY",
  ALL_ALLIES = "ALL_ALLIES",
  SELF = "SELF",
  COLUMN = "COLUMN", // hits all enemies in a targeted column
  MULTI_HIT = "MULTI_HIT", // hits 3 distinct targets chosen alphabetically/manually
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  cost: number; // energy cost
  targetType: TargetType;
  damageMultiplier?: number;
  healingMultiplier?: number;
  effect?: string; // e.g. "burn", "poison", "regen", "shield", "taunt", "double-tap"
  effectValue?: number;
  effectDuration?: number;
  cooldown?: number;
  levelReq?: number;
}

export type ClassName =
  | "Warrior"
  | "Archer"
  | "Mage"
  | "Cleric"
  | "Rogue"
  | "Bard";

export type AdvancedClassName =
  | "Berserker"
  | "Knight"
  | "Sharpshooter"
  | "Bolt Slinger"
  | "Elementalist"
  | "Summoner"
  | "High Priest"
  | "Inquisitor"
  | "Assassin"
  | "Duelist"
  | "Bard of Valor"
  | "Bard of Chaos";

export type Tier3ClassName =
  | "Warlord"
  | "Paladin"
  | "Hawkeye"
  | "Storm Dancer"
  | "Archmage"
  | "Void Caller"
  | "Seraph"
  | "Crusader"
  | "Phantom"
  | "Blade Saint"
  | "Herald of Glory"
  | "Entropy Singer";

export type CharacterClass = ClassName | AdvancedClassName | Tier3ClassName;

export interface Stats {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  FTH: number;
  CHA: number;
  LCK: number;
}

export interface Equipment {
  weapon: Item | null;
  offhand: Item | null;
  helmet: Item | null;
  chestplate: Item | null;
  leggings: Item | null;
  boots: Item | null;
  ring: Item | null;
  bracelet: Item | null;
  necklace: Item | null;
  charm: Item | null;
}

export interface StatusEffect {
  type:
    | "burn"
    | "poison"
    | "bleed"
    | "regen"
    | "taunt"
    | "shield"
    | "multiplier"
    | "stagger"
    | "dodge_up"
    | "guarding"
    | "stun"
    | "crippled"
    | "vulnerable"
    | "shield_wall";
  value: number;
  duration: number;
}

export interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  stats: Stats;
  allocatedPoints: number; // points spent
  unspentPoints: number; // level * 3 - allocatedPoints
  equipment: Equipment;
  gridX: number; // Column 1 = closest (3, 2, 1)
  gridY: number; // Line 1, 2, 3
  statusEffects: StatusEffect[];
  isSummon?: boolean;
  avatarUrl?: string;
  skillCooldowns?: Record<string, number>;
  fallenStacks?: number; // 0 to 3, 4th fall = permanent death
  talentPoints?: number; // permanent talent points
  unlockedTalents?: string[]; // list of unlocked node IDs
  race?:
    | "Human"
    | "Elf"
    | "Dwarves"
    | "Dragonborn"
    | "Goblin"
    | "Vampire"
    | "Succubus"
    | "Dryad";
  talentPointsByClass?: Record<string, number>;
  unlockedTalentsByClass?: Record<string, string[]>;
  inventory?: Item[];
  runStartLevel?: number;
  password?: string;
  subclass?: string;
  tier5Acknowledged?: boolean;
}

export interface TalentNode {
  id: string;
  name: string;
  description: string;
  cost: number;
  statsBonus?: Partial<Stats>;
  flatMaxHp?: number;
  flatDef?: number;
  flatCrit?: number;
  flatDodge?: number;
  skillUpgrade?: {
    targetSkillId: string;
    name: string;
    description: string;
    damageMultiplier?: number;
    healingMultiplier?: number;
    effect?: string;
    effectValue?: number;
    effectDuration?: number;
  };
  gridX?: number;
  gridY?: number;
  parents?: string[];
  isPassive?: boolean;
}

export interface Item {
  id: string;
  name: string;
  type:
    | "weapon"
    | "offhand"
    | "helmet"
    | "chestplate"
    | "leggings"
    | "boots"
    | "ring"
    | "bracelet"
    | "necklace"
    | "charm"
    | "material"
    | "consumable";
  flatAtk?: number;
  flatMaxHp?: number;
  flatCrit?: number; // e.g. 5 = +5%
  flatDodge?: number; // +X%
  flatDef?: number;
  flatAccuracy?: number;
  weaponType?:
    | "sword"
    | "bow"
    | "staff"
    | "tome"
    | "dagger"
    | "lute"
    | "shield";
  statsBonus?: Partial<Stats>;
  description: string;
  value: number;
  quantity?: number;
  ownerId?: string; // Player ID for multiplayer inventory tracking
  isTwoHanded?: boolean;
  rarity?: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
}

export interface CraftingRecipe {
  id: string;
  name: string;
  ingredients: { itemId: string; quantity: number }[];
  resultItemId: string;
}

export interface Enemy {
  id: string;
  name: string;
  maxHp: number;
  hp: number;
  atk: number;
  def: number;
  critChance: number;
  dodgeChance: number;
  accuracy?: number;
  avatarUrl?: string;
  gridX: number; // Enemy Column 1 = front line
  gridY: number; // Enemy Line 1, 2, 3
  statusEffects: StatusEffect[];
  aiType: "attacker" | "spellcaster" | "tank" | "boss";
  xpAwarded: number;
  goldAwarded: number;
  dropMaterials?: string[];
  skillCooldowns?: Record<string, number>;
}

export interface CombatLog {
  id: string;
  text: string;
  type: "info" | "damage" | "heal" | "status" | "system";
  timestamp: string;
}

export interface CombatState {
  isActive: boolean;
  round: number;
  turnOrder: string[]; // List of Character/Enemy IDs
  currentTurnId: string;
  playerGrid: (Character | null)[][]; // 3x3: columns x lines
  enemyGrid: (Enemy | null)[][]; // 3x3: columns x lines
}

export interface LobbyState {
  roomId: string; // BroadcastChannel Room Code e.g. "MED-7821"
  p2pMode: "solo" | "multiplayer";
  peers: {
    id: string;
    name: string;
    classSelection: ClassName;
    ready: boolean;
  }[];
  hostId: string;
}

export interface MaterialsDatabase {
  [id: string]: Item;
}

export interface ChoiceEffect {
  type:
    | "item"
    | "gold"
    | "hp"
    | "hp_pct"
    | "xp"
    | "stat_check"
    | "random"
    | "talent_point"
    | "regen"
    | "status"
    | "combat"
    | "none";
  itemId?: string;
  quantity?: number;
  goldVal?: number;
  hpVal?: number;
  hpPct?: number; // e.g. -0.35 for -35%
  xpVal?: number;
  stat?: "STR" | "DEX" | "CON" | "INT" | "FTH" | "CHA" | "LCK";
  threshold?: number;
  successEffect?: ChoiceEffect;
  failEffect?: ChoiceEffect;
  randomEffects?: { chance: number; effect: ChoiceEffect; msg: string }[];
  statusType?: string;
  statusVal?: number;
  statusDur?: number;
  message?: string;
}

export interface StoryTemplate {
  title: string;
  desc: string;
  stars?: number;
  choices: {
    label: string;
    effectText: string;
    effect?: ChoiceEffect;
  }[];
}
