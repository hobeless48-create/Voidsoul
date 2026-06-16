/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Item, CraftingRecipe } from "./types";

export const ITEMS_DATABASE: Record<string, Item> = {
  // --- EXISTING WEAPONS ---
  iron_sword: {
    id: "iron_sword",
    name: "Iron Sword",
    type: "weapon",
    weaponType: "sword",
    flatAtk: 12,
    flatDef: 3,
    statsBonus: { STR: 3 },
    description:
      "A reliable straight blade forged from raw iron ore. Perfect for warriors and brawlers.",
    value: 50,
  },
  composite_bow: {
    id: "composite_bow",
    name: "Composite Bow",
    type: "weapon",
    weaponType: "bow",
    flatAtk: 10,
    flatAccuracy: 4,
    statsBonus: { DEX: 3 },
    description:
      "A flexible wooden bow crafted from laminated ash and horn. Pairs naturally with Fan of Arrows.",
    value: 50,
    isTwoHanded: true,
  },
  apprentice_staff: {
    id: "apprentice_staff",
    name: "Apprentice Staff",
    type: "weapon",
    weaponType: "staff",
    flatAtk: 11,
    statsBonus: { INT: 4 },
    description:
      "A wand carved from elderwood, inlaid with a small mana gem. +5 Mana Shield cap.",
    value: 50,
    isTwoHanded: true,
  },
  holy_tome: {
    id: "holy_tome",
    name: "Priest's Tome",
    type: "weapon",
    weaponType: "tome",
    flatAtk: 9,
    statsBonus: { FTH: 4 },
    description:
      "An gilded rod radiating gentle saintly warmth. Healing skills restore an additional flat 5 HP.",
    value: 50,
  },
  bronze_dagger: {
    id: "bronze_dagger",
    name: "Bronze Dagger",
    type: "weapon",
    weaponType: "dagger",
    flatAtk: 9,
    flatCrit: 3,
    statsBonus: { DEX: 2, LCK: 2 },
    description:
      "A razor-sharp thrusting dagger suited for stealthy pursuits. Shadow Cloak exit attacks deal +10% bonus damage.",
    value: 50,
  },
  willow_lute: {
    id: "willow_lute",
    name: "Willow Lute",
    type: "weapon",
    weaponType: "lute",
    flatAtk: 8,
    statsBonus: { CHA: 3, LCK: 2 },
    description:
      "An acoustic instrument which rings with deep chords. Soothing Lute regen value increases by +3.",
    value: 50,
    isTwoHanded: true,
  },
  gilded_broadsword: {
    id: "gilded_broadsword",
    name: "Gilded Broadsword",
    type: "weapon",
    weaponType: "sword",
    flatAtk: 22,
    statsBonus: { STR: 7, CON: 4 },
    description:
      "An advanced heavy blade featuring gold engravings. Blade Fury hits apply Bleed (value 5).",
    value: 200,
  },
  longbow_of_gale: {
    id: "longbow_of_gale",
    name: "Longbow of Gales",
    type: "weapon",
    weaponType: "bow",
    flatAtk: 20,
    flatCrit: 8,
    statsBonus: { DEX: 8, LCK: 3 },
    description:
      "Fires whistling arrows with speed (Knockback effect deactivated).",
    value: 200,
    isTwoHanded: true,
  },
  archmage_scepter: {
    id: "archmage_scepter",
    name: "Archmage Scepter",
    type: "weapon",
    weaponType: "staff",
    flatAtk: 28,
    statsBonus: { INT: 9 },
    description:
      "Taps directly into ley lines. Fireball and Meteor deal +20% damage. Arcane Overload's explosion radius +1 cell.",
    value: 200,
    isTwoHanded: true,
  },

  // --- NEW WEAPONS ---
  warblade_of_the_fallen: {
    id: "warblade_of_the_fallen",
    name: "Warblade of the Fallen",
    type: "weapon",
    weaponType: "sword",
    flatAtk: 26,
    statsBonus: { STR: 8 },
    description:
      "A relic blade recovered from a collapsed citadel. Shield Strike deals double damage on the first turn of battle.",
    value: 250,
  },
  berserkers_cleaver: {
    id: "berserkers_cleaver",
    name: "Berserker's Cleaver",
    type: "weapon",
    weaponType: "sword",
    flatAtk: 20,
    statsBonus: { STR: 7 },
    description:
      "A notched war-cleaver drenched in old blood. Frenzy Slash lifesteal increases to 55% while equipped.",
    value: 200,
  },
  knights_honour_blade: {
    id: "knights_honour_blade",
    name: "Knight's Honour Blade",
    type: "weapon",
    weaponType: "sword",
    flatAtk: 15,
    statsBonus: { STR: 5 },
    description:
      "A ceremonial knight's sword. Guardian Slash taunts enemies for +1 extra turn.",
    value: 120,
  },
  sharpshooters_sighted_bow: {
    id: "sharpshooters_sighted_bow",
    name: "Sharpshooter's Sighted Bow",
    type: "weapon",
    weaponType: "bow",
    flatAtk: 18,
    flatAccuracy: 5,
    statsBonus: { DEX: 7 },
    description:
      "A custom recurve with a carved bone sight. Sniper Precision's execution scaling increases to 5.0x.",
    value: 200,
    isTwoHanded: true,
  },
  twin_bolt_crossbows: {
    id: "twin_bolt_crossbows",
    name: "Twin Bolt Crossbows",
    type: "weapon",
    weaponType: "bow",
    flatAtk: 16,
    statsBonus: { DEX: 6 },
    description:
      "A matched pair of hand crossbows. Triple Strike hits 4 targets instead of 3 when equipped.",
    value: 200,
    isTwoHanded: true,
  },
  inferno_rod: {
    id: "inferno_rod",
    name: "Inferno Rod",
    type: "weapon",
    weaponType: "staff",
    flatAtk: 17,
    statsBonus: { INT: 7 },
    description:
      "A rod of volcanic glass. Burn DoTs applied by the wielder tick +4 higher per turn.",
    value: 180,
  },
  frostweave_wand: {
    id: "frostweave_wand",
    name: "Frostweave Wand",
    type: "weapon",
    weaponType: "staff",
    flatAtk: 13,
    statsBonus: { INT: 5 },
    description:
      "A wand wrapped in frozen silk. Frost Nova's stagger duration increases by 1 turn.",
    value: 100,
  },
  summoners_binding_orb: {
    id: "summoners_binding_orb",
    name: "Summoner's Binding Orb",
    type: "weapon",
    weaponType: "staff",
    flatAtk: 14,
    statsBonus: { INT: 6 },
    description:
      "A pulsing sphere. Familiars summoned gain +20% ATK and +30 max HP.",
    value: 180,
  },
  tome_of_divine_wrath: {
    id: "tome_of_divine_wrath",
    name: "Tome of Divine Wrath",
    type: "weapon",
    weaponType: "tome",
    flatAtk: 24,
    statsBonus: { FTH: 8 },
    description:
      "Sealed holy scriptures. Smite hits the entire enemy front column when FTH exceeds 60.",
    value: 240,
  },
  inquisitors_flamebrand: {
    id: "inquisitors_flamebrand",
    name: "Inquisitor's Flamebrand",
    type: "weapon",
    weaponType: "sword",
    flatAtk: 19,
    statsBonus: { FTH: 6 },
    description:
      "A blade wreathed in holy fire. Holy Retribution's heal shares increase by 15% per hit.",
    value: 190,
  },
  assassins_fang: {
    id: "assassins_fang",
    name: "Assassin's Fang",
    type: "weapon",
    weaponType: "dagger",
    flatAtk: 21,
    flatCrit: 10,
    statsBonus: { DEX: 8 },
    description:
      "A venomous dagger. Death Venom's poison value increases to 35 while equipped.",
    value: 220,
  },
  duelists_rapier: {
    id: "duelists_rapier",
    name: "Duelist's Rapier",
    type: "weapon",
    weaponType: "dagger",
    flatAtk: 17,
    statsBonus: { DEX: 7 },
    description:
      "Every successful Riposte counter-attack also applies Bleed (value 8, 2 turns).",
    value: 170,
  },
  grand_chaos_lyre: {
    id: "grand_chaos_lyre",
    name: "Grand Chaos Lyre",
    type: "weapon",
    weaponType: "lute",
    flatAtk: 22,
    statsBonus: { CHA: 8 },
    description:
      "A lyre strung with void-thread. Discordant Wail deals an extra 0.4x damage and applies Vulnerable.",
    value: 220,
    isTwoHanded: true,
  },
  valor_horn: {
    id: "valor_horn",
    name: "Valor Horn",
    type: "weapon",
    weaponType: "lute",
    flatAtk: 18,
    statsBonus: { CHA: 7 },
    description:
      "A brass war horn. Heroic Symphony's buff duration extends to 4 turns.",
    value: 180,
  },

  // --- OFFHAND SHIELDS & WARDS ---
  wooden_shield: {
    id: "wooden_shield",
    name: "Wooden Shield",
    type: "offhand",
    weaponType: "shield",
    flatDef: 4,
    flatMaxHp: 15,
    statsBonus: { CON: 1 },
    description: "A simple wooden round shield.",
    value: 20,
  },
  iron_shield: {
    id: "iron_shield",
    name: "Iron Shield",
    type: "offhand",
    weaponType: "shield",
    flatDef: 8,
    flatMaxHp: 30,
    statsBonus: { CON: 2 },
    description:
      "A flat iron buckler. Adds a base shield value of +15 to the Guard stance.",
    value: 50,
  },
  steel_aegis: {
    id: "steel_aegis",
    name: "Steel Aegis",
    type: "offhand",
    weaponType: "shield",
    flatDef: 18,
    flatMaxHp: 60,
    statsBonus: { CON: 4, STR: 2 },
    description:
      "A tower shield. Fortress Stance's immunity to crits extends by +1 turn when equipped.",
    value: 120,
  },
  void_tempered_bulwark: {
    id: "void_tempered_bulwark",
    name: "Void-Tempered Bulwark",
    type: "offhand",
    weaponType: "shield",
    flatDef: 22,
    flatMaxHp: 80,
    statsBonus: { CON: 5 },
    description:
      "A shield forged in void-flame. Reflects 8% of blocked damage back as holy damage to the attacker.",
    value: 220,
  },
  clerics_holy_buckler: {
    id: "clerics_holy_buckler",
    name: "Cleric's Holy Buckler",
    type: "offhand",
    weaponType: "shield",
    flatDef: 10,
    statsBonus: { FTH: 5 },
    description:
      "A small gilded shield. Smite gains +0.3x damage scaling while this is equipped.",
    value: 80,
  },
  spellbreaker_ward: {
    id: "spellbreaker_ward",
    name: "Spellbreaker Ward",
    type: "offhand",
    weaponType: "shield",
    flatDef: 12,
    statsBonus: { INT: 8 },
    description:
      "An arcane barrier disc. Magic damage taken by the wielder is reduced by 12% passively.",
    value: 120,
  },

  // --- HELMETS ---
  iron_helmet: {
    id: "iron_helmet",
    name: "Iron Helmet",
    type: "helmet",
    flatDef: 3,
    flatMaxHp: 15,
    statsBonus: { CON: 1 },
    description: "A standard soldier helmet made of forged iron plates.",
    value: 30,
  },
  apprentice_cowl: {
    id: "apprentice_cowl",
    name: "Apprentice Cowl",
    type: "helmet",
    flatDef: 1,
    flatMaxHp: 10,
    statsBonus: { INT: 1 },
    description: "A wool hood woven with faint protective runes.",
    value: 25,
  },
  ranger_hood: {
    id: "ranger_hood",
    name: "Ranger Hood",
    type: "helmet",
    flatDef: 2,
    flatMaxHp: 12,
    statsBonus: { DEX: 1 },
    description: "A leather hood providing camouflaged protection.",
    value: 30,
  },
  glorious_greathelm: {
    id: "glorious_greathelm",
    name: "Glorious Greathelm",
    type: "helmet",
    flatDef: 8,
    flatMaxHp: 40,
    statsBonus: { CON: 3, STR: 2 },
    description:
      "A magnificent knightly helmet, reinforced with tempered steel.",
    value: 120,
  },
  iron_helm: {
    id: "iron_helm",
    name: "Iron Helm",
    type: "helmet",
    flatDef: 4,
    flatMaxHp: 20,
    description:
      "A simple iron war helm. Reduces Stagger duration inflicted on the wearer by 1 turn.",
    value: 35,
  },
  berserkers_horned_crown: {
    id: "berserkers_horned_crown",
    name: "Berserker's Horned Crown",
    type: "helmet",
    flatDef: 6,
    statsBonus: { STR: 6 },
    description:
      "A skull-shaped crown. Bloodlust Strike's HP sacrifice is reduced to 10 HP.",
    value: 150,
  },
  mages_arcane_cowl: {
    id: "mages_arcane_cowl",
    name: "Mage's Arcane Cowl",
    type: "helmet",
    flatDef: 4,
    statsBonus: { INT: 8 },
    description:
      "A deep cowl. Mana Flow grants +1 additional energy when cast.",
    value: 100,
  },
  high_priests_mitre: {
    id: "high_priests_mitre",
    name: "High Priest's Mitre",
    type: "helmet",
    flatDef: 5,
    statsBonus: { FTH: 10 },
    description:
      "A tall ceremonial headdress. Aura of Hope duration increases to 5 turns while worn.",
    value: 150,
  },
  shadowhood: {
    id: "shadowhood",
    name: "Shadowhood",
    type: "helmet",
    flatDef: 3,
    flatDodge: 5,
    statsBonus: { DEX: 4 },
    description: "A form-fitting shadow-silk hood. Grants +10 initiative.",
    value: 90,
  },
  inquisitors_warhelm: {
    id: "inquisitors_warhelm",
    name: "Inquisitor's Warhelm",
    type: "helmet",
    flatDef: 8,
    statsBonus: { FTH: 7 },
    description:
      "A heavy masked helm. Zealot Seal's DEF reduction increases to 40%.",
    value: 140,
  },
  bards_feathered_hat: {
    id: "bards_feathered_hat",
    name: "Bard's Feathered Hat",
    type: "helmet",
    flatDef: 2,
    statsBonus: { CHA: 5, LCK: 3 },
    description:
      "A wide-brimmed hat with a plume. CHA increases by 5 while worn.",
    value: 60,
  },
  void_visage: {
    id: "void_visage",
    name: "Void Visage",
    type: "helmet",
    flatDef: 6,
    flatDodge: 8,
    statsBonus: { LCK: 10 },
    description:
      "A porcelain mask. The wearer cannot be targeted by Taunt effects.",
    value: 200,
  },

  // --- CHESTPLATES ---
  cloth_robes: {
    id: "cloth_robes",
    name: "Cloth Robes",
    type: "chestplate",
    flatMaxHp: 20,
    flatDef: 3,
    statsBonus: { INT: 1, CHA: 1 },
    description: "Light comfortable vestments suited for agile spell-weavers.",
    value: 40,
  },
  leather_jerkin: {
    id: "leather_jerkin",
    name: "Leather Jerkin",
    type: "chestplate",
    flatMaxHp: 35,
    flatDef: 6,
    statsBonus: { DEX: 1, LCK: 1 },
    description:
      "Cured animal hides providing reasonable torso protection without weight.",
    value: 40,
  },
  chainmail_chest: {
    id: "chainmail_chest",
    name: "Chainmail Hauberk",
    type: "chestplate",
    flatMaxHp: 60,
    flatDodge: -3,
    flatDef: 12,
    statsBonus: { CON: 2 },
    description:
      "Intermeshed iron rings. Heavy, but dependable in melee combat.",
    value: 60,
  },
  glorious_plate: {
    id: "glorious_plate",
    name: "Glorious Steel Plate",
    type: "chestplate",
    flatMaxHp: 150,
    flatDodge: -5,
    flatDef: 28,
    statsBonus: { CON: 8, STR: 3 },
    description:
      "Masterwork forged full-plate. Bestows unmatched survivability.",
    value: 200,
  },
  glorious_steel_plate: {
    id: "glorious_steel_plate",
    name: "Glorious Steel Plate (Enhanced)",
    type: "chestplate",
    flatDef: 30,
    flatDodge: -5,
    statsBonus: { CON: 8 },
    description:
      "Ceremonial plate for champions. Aggro weight increases by +10.",
    value: 250,
  },
  chainmail_of_the_watch: {
    id: "chainmail_of_the_watch",
    name: "Chainmail of the Watch",
    type: "chestplate",
    flatDef: 14,
    statsBonus: { CON: 4 },
    description: "Standard-issue Alliance chainmail. Reliable protection.",
    value: 80,
  },
  rogues_leatherweave: {
    id: "rogues_leatherweave",
    name: "Rogue's Leatherweave",
    type: "chestplate",
    flatDef: 7,
    flatDodge: 4,
    statsBonus: { DEX: 3 },
    description: "Layered leather strips. Dodge chance increases by +4%.",
    value: 80,
  },
  woven_mage_robe: {
    id: "woven_mage_robe",
    name: "Woven Mage Robe",
    type: "chestplate",
    flatDef: 3,
    statsBonus: { INT: 6 },
    description:
      "A flowing robe. INT increases by 6 and Mana Shield absorbs +10 extra.",
    value: 70,
  },
  holy_vestments: {
    id: "holy_vestments",
    name: "Holy Vestments",
    type: "chestplate",
    flatDef: 8,
    statsBonus: { FTH: 5 },
    description:
      "Sanctified cloth. All healing skills scale +5% higher while worn.",
    value: 90,
  },
  demon_forged_cuirass: {
    id: "demon_forged_cuirass",
    name: "Demon-Forged Cuirass",
    type: "chestplate",
    flatDef: 20,
    statsBonus: { CON: 5 },
    description:
      "Wearer takes 10% less damage when below 40% HP. Fallen stack penalty -10%.",
    value: 240,
  },

  // --- LEGGINGS ---
  iron_greaves: {
    id: "iron_greaves",
    name: "Iron Leggings",
    type: "leggings",
    flatDef: 5,
    flatMaxHp: 25,
    statsBonus: { CON: 1 },
    description: "Plate guards for protecting the legs and shins.",
    value: 50,
  },
  leather_chaps: {
    id: "leather_chaps",
    name: "Leather Leggings",
    type: "leggings",
    flatDef: 3,
    flatMaxHp: 15,
    statsBonus: { DEX: 1 },
    description: "Supple leather leg wear allowing quick movement.",
    value: 35,
  },
  silk_trousers: {
    id: "silk_trousers",
    name: "Silk Trousers",
    type: "leggings",
    flatDef: 1,
    flatMaxHp: 12,
    statsBonus: { INT: 1, CHA: 1 },
    description: "Agile fabric trousers suited for spellcasters.",
    value: 35,
  },
  glorious_leggings: {
    id: "glorious_leggings",
    name: "Glorious Leggings",
    type: "leggings",
    flatDef: 12,
    flatMaxHp: 60,
    statsBonus: { CON: 4 },
    description:
      "Articulated steel leggings offering heavy defensive coverage.",
    value: 140,
  },
  iron_leggings: {
    id: "iron_leggings",
    name: "Iron Leggings (Heavy)",
    type: "leggings",
    flatDef: 10,
    statsBonus: { CON: 3 },
    description:
      "Heavy iron leg plates. Reduces the initiative penalty of being in Column 1 by half.",
    value: 80,
  },
  windstride_leggings: {
    id: "windstride_leggings",
    name: "Windstride Leggings",
    type: "leggings",
    flatDef: 6,
    statsBonus: { DEX: 4 },
    description: "Light leather leggings. Min Initiative increases by 2.",
    value: 90,
  },
  boneweave_trousers: {
    id: "boneweave_trousers",
    name: "Boneweave Trousers",
    type: "leggings",
    flatDef: 9,
    statsBonus: { CON: 5 },
    description:
      "Woven from bone fibres. Reduces duration of Poison and Bleed by 1 turn.",
    value: 110,
  },
  void_silk_drape: {
    id: "void_silk_drape",
    name: "Void-Silk Drape",
    type: "leggings",
    flatDef: 4,
    statsBonus: { INT: 8 },
    description:
      "Robes humming with void static. Wearer's spells have 10% chance to Stagger.",
    value: 130,
  },

  // --- BOOTS ---
  iron_sabatons: {
    id: "iron_sabatons",
    name: "Iron Sabatons",
    type: "boots",
    flatDef: 3,
    flatMaxHp: 15,
    statsBonus: { CON: 1 },
    description: "Steel sabatons that anchor your footing in combat.",
    value: 35,
  },
  leather_boots: {
    id: "leather_boots",
    name: "Leather Boots",
    type: "boots",
    flatDef: 2,
    flatMaxHp: 10,
    statsBonus: { DEX: 1, LCK: 1 },
    description: "Agile footwear preferred by rogues and rangers.",
    value: 25,
  },
  mage_slippers: {
    id: "mage_slippers",
    name: "Mage Slippers",
    type: "boots",
    flatDef: 1,
    flatMaxHp: 8,
    statsBonus: { INT: 1, FTH: 1 },
    description: "Lightweight slippers facilitating quiet spellcasting.",
    value: 25,
  },
  glorious_boots: {
    id: "glorious_boots",
    name: "Glorious Boots",
    type: "boots",
    flatDef: 6,
    flatMaxHp: 35,
    statsBonus: { DEX: 2, CON: 2 },
    description:
      "Magically reinforced steel boots enhancing speed and balance.",
    value: 100,
  },
  iron_toed_boots: {
    id: "iron_toed_boots",
    name: "Iron-Toed Boots",
    type: "boots",
    flatDef: 8,
    statsBonus: { CON: 2 },
    description:
      "Heavy boots. Juggernaut Step talent's collision damage increases by +5% STR.",
    value: 60,
  },
  phantom_step_boots: {
    id: "phantom_step_boots",
    name: "Phantom Step Boots",
    type: "boots",
    flatDef: 5,
    statsBonus: { DEX: 6 },
    description:
      "Enchanted soft-soled boots. Shadow Step's evasion bonus increases to +45%.",
    value: 110,
  },
  bards_springheels: {
    id: "bards_springheels",
    name: "Bard's Springheels",
    type: "boots",
    flatDef: 4,
    statsBonus: { CHA: 4 },
    description:
      "Dancing shoes. Wearer cannot be Staggered while a Bard song buff is active.",
    value: 90,
  },
  mages_floatweave_slippers: {
    id: "mages_floatweave_slippers",
    name: "Mage's Floatweave Slippers",
    type: "boots",
    flatDef: 2,
    statsBonus: { INT: 5 },
    description:
      "Hovering slippers. Repositioning costs no EN once per battle.",
    value: 70,
  },
  sabatons_of_conviction: {
    id: "sabatons_of_conviction",
    name: "Sabatons of Conviction",
    type: "boots",
    flatDef: 10,
    statsBonus: { FTH: 6 },
    description:
      "Heavy blessed sabatons. At the start of battle, gain Regen (value 8, 2 turns).",
    value: 120,
  },

  // --- RINGS ---
  brass_ring: {
    id: "brass_ring",
    name: "Brass Ring",
    type: "ring",
    flatCrit: 2,
    statsBonus: { LCK: 1 },
    description: "A simplistic circular band reflecting luck.",
    value: 20,
  },
  sapphire_ring: {
    id: "sapphire_ring",
    name: "Sapphire Ring",
    type: "ring",
    flatCrit: 4,
    statsBonus: { INT: 3 },
    description: "Emanates magical clarity.",
    value: 80,
  },
  silver_band: {
    id: "silver_band",
    name: "Silver Band",
    type: "ring",
    flatCrit: 3,
    statsBonus: { LCK: 1 },
    description: "A shiny silver ring offering small blessings.",
    value: 30,
  },
  golden_ring: {
    id: "golden_ring",
    name: "Golden Ring",
    type: "ring",
    flatCrit: 5,
    statsBonus: { LCK: 2, CHA: 1 },
    description: "A gold ring that glows with status and fortune.",
    value: 80,
  },
  ring_of_iron_will: {
    id: "ring_of_iron_will",
    name: "Ring of Iron Will",
    type: "ring",
    statsBonus: { CON: 5 },
    description:
      "Plain iron band. Max Fallen Stacks before permanent death increases to 4.",
    value: 80,
  },
  luckstone_ring: {
    id: "luckstone_ring",
    name: "Luckstone Ring",
    type: "ring",
    statsBonus: { LCK: 10 },
    description:
      "Set with a pale green stone. Status effect trigger chance rises by 5%.",
    value: 90,
  },
  ring_of_the_void_pact: {
    id: "ring_of_the_void_pact",
    name: "Ring of the Void Pact",
    type: "ring",
    statsBonus: { INT: 8 },
    description:
      "Skills deal +10% damage but wearer takes Burn (value 5) on critical hits.",
    value: 150,
  },
  clerics_sanctified_band: {
    id: "clerics_sanctified_band",
    name: "Cleric's Sanctified Band",
    type: "ring",
    statsBonus: { FTH: 8 },
    description:
      "Gold ring. Holy Grace healing scales an additional 0.5x, heals +8 flat.",
    value: 140,
  },
  duelists_promise_ring: {
    id: "duelists_promise_ring",
    name: "Duelist's Promise Ring",
    type: "ring",
    statsBonus: { DEX: 7, LCK: 5 },
    description:
      "Riposte counter-attacks have a 20% chance to apply Crippled (-25% ATK).",
    value: 130,
  },
  berserkers_bloodring: {
    id: "berserkers_bloodring",
    name: "Berserker's Bloodring",
    type: "ring",
    statsBonus: { STR: 8 },
    description:
      "When dropping below 25% HP, enter a free Berserk state for 2 turns.",
    value: 140,
  },
  archers_eagle_ring: {
    id: "archers_eagle_ring",
    name: "Archer's Eagle Ring",
    type: "ring",
    flatCrit: 4,
    flatAccuracy: 8,
    statsBonus: { DEX: 6 },
    description: "Accuracy increases by +8% and crit chance by +4%.",
    value: 100,
  },

  // --- BRACELETS ---
  bronze_bracer: {
    id: "bronze_bracer",
    name: "Bronze Bracer",
    type: "bracelet",
    flatDef: 1,
    statsBonus: { STR: 1 },
    description: "A heavy bronze forearm band that increases strength.",
    value: 25,
  },
  jeweled_bracelet: {
    id: "jeweled_bracelet",
    name: "Jeweled Bracelet",
    type: "bracelet",
    flatMaxHp: 15,
    statsBonus: { CHA: 2, LCK: 1 },
    description: "A stylish accessory inlaid with small gemstones.",
    value: 65,
  },
  warriors_iron_brace: {
    id: "warriors_iron_brace",
    name: "Warrior's Iron Brace",
    type: "bracelet",
    statsBonus: { STR: 4 },
    description: "A heavy iron wristguard. Block chance increased by 3%.",
    value: 50,
  },
  bowstring_bracers: {
    id: "bowstring_bracers",
    name: "Bowstring Bracers",
    type: "bracelet",
    statsBonus: { DEX: 5 },
    description:
      "Protective bracers. Rain of Arrows damage increases from 0.9x to 1.1x.",
    value: 80,
  },
  sorcerers_runebracers: {
    id: "sorcerers_runebracers",
    name: "Sorcerer's Runebracers",
    type: "bracelet",
    statsBonus: { INT: 8 },
    description:
      "Arcane runes carved in bone. Thunder Storm's AoE scaling +0.3x.",
    value: 140,
  },
  assassins_poison_vambraces: {
    id: "assassins_poison_vambraces",
    name: "Assassin's Poison Vambraces",
    type: "bracelet",
    statsBonus: { DEX: 6, LCK: 4 },
    description:
      "Vambraces with toxin reservoir. Death Venom Poison duration +1 turn.",
    value: 130,
  },
  songweaver_cuffs: {
    id: "songweaver_cuffs",
    name: "Songweaver Cuffs",
    type: "bracelet",
    statsBonus: { CHA: 6 },
    description:
      "Resonating cuffs. Song buff durations all increase by +1 turn.",
    value: 90,
  },

  // --- NECKLACES ---
  ruby_pendant: {
    id: "ruby_pendant",
    name: "Ruby Pendant",
    type: "necklace",
    flatMaxHp: 30,
    statsBonus: { STR: 2 },
    description: "A bright red gem matching deep physical fortitude.",
    value: 80,
  },
  bone_necklace: {
    id: "bone_necklace",
    name: "Bone Necklace",
    type: "necklace",
    flatCrit: 2,
    statsBonus: { STR: 1, DEX: 1 },
    description: "A necklace constructed from wolf teeth and small vertebrae.",
    value: 35,
  },
  amulet_of_life: {
    id: "amulet_of_life",
    name: "Amulet of Life",
    type: "necklace",
    flatMaxHp: 40,
    statsBonus: { CON: 2, FTH: 1 },
    description: "An amulet radiating pure life force.",
    value: 90,
  },
  amulet_of_the_stalwart: {
    id: "amulet_of_the_stalwart",
    name: "Amulet of the Stalwart",
    type: "necklace",
    flatMaxHp: 20,
    statsBonus: { CON: 8 },
    description: "A steel medallion on a chain. Max HP +20, CON +8.",
    value: 100,
  },
  hex_ward_pendant: {
    id: "hex_ward_pendant",
    name: "Hex-Ward Pendant",
    type: "necklace",
    statsBonus: { LCK: 6 },
    description:
      "Wearer is immune to the first Crippled or Vulnerable applied each battle.",
    value: 120,
  },
  soul_siphon_chain: {
    id: "soul_siphon_chain",
    name: "Soul-Siphon Chain",
    type: "necklace",
    statsBonus: { STR: 6, DEX: 6 },
    description:
      "Threaded with soul shards. Killing an enemy restores 8% max HP.",
    value: 180,
  },
  clerics_prayer_beads: {
    id: "clerics_prayer_beads",
    name: "Cleric's Prayer Beads",
    type: "necklace",
    statsBonus: { FTH: 7 },
    description:
      "Prayer beads. Protection Shelter's shield value increases from 20 to 28.",
    value: 90,
  },
  sharpshooters_scope_monocle: {
    id: "sharpshooters_scope_monocle",
    name: "Sharpshooter's Scope Monocle",
    type: "necklace",
    flatAccuracy: 5,
    statsBonus: { DEX: 8 },
    description:
      "A jeweler's lens. Deadeye Focus crit multiplier bonus increases by +20%.",
    value: 150,
  },
  void_throat_stone: {
    id: "void_throat_stone",
    name: "Void Throat Stone",
    type: "necklace",
    statsBonus: { INT: 8, CHA: 8 },
    description:
      "Black stone. Spells that hit all enemies restore +2 EN instantly. -5% magic dmg taken.",
    value: 180,
  },

  // --- CHARMS ---
  lucky_clover: {
    id: "lucky_clover",
    name: "Lucky Four-Clover",
    type: "charm",
    flatCrit: 5,
    statsBonus: { LCK: 3 },
    description: "A dried wild clover with unbelievable fortune inside.",
    value: 60,
  },
  saint_rosary: {
    id: "saint_rosary",
    name: "Saintly Rosary",
    type: "charm",
    statsBonus: { FTH: 3, CON: 2 },
    description: "Prayer beads offering divine serenity.",
    value: 60,
  },
  void_charm: {
    id: "void_charm",
    name: "Void Charm",
    type: "charm",
    flatCrit: 6,
    statsBonus: { INT: 2, LCK: 2 },
    description: "A dark charm containing ambient energy from the void.",
    value: 110,
  },
  ironclad_talisman: {
    id: "ironclad_talisman",
    name: "Ironclad Talisman",
    type: "charm",
    flatDef: 5,
    statsBonus: { CON: 3 },
    description:
      "A heavy iron amulet that bolsters the wearer's defensive stance.",
    value: 110,
  },
  talisman_of_power: {
    id: "talisman_of_power",
    name: "Talisman of Power",
    type: "charm",
    flatMaxHp: 50,
    statsBonus: { STR: 3, DEX: 3, INT: 3 },
    description:
      "Ancient talisman. Primary stat scaling +8% and all EN costs -1 (min 0).",
    value: 150,
  },
  phoenix_feather_charm: {
    id: "phoenix_feather_charm",
    name: "Phoenix Feather Charm",
    type: "charm",
    flatMaxHp: 40,
    statsBonus: { FTH: 4, CHA: 4 },
    description:
      "A warm, glowing feather that pulsates with the hope of rebirth.",
    value: 150,
  },
  void_crystal_lens: {
    id: "void_crystal_lens",
    name: "Void Crystal Lens",
    type: "charm",
    statsBonus: { INT: 8, DEX: 8 },
    description:
      "Faceted void crystal. Wearer cannot be targeted by enemy AoE on turn 1.",
    value: 160,
  },
  rusted_compass: {
    id: "rusted_compass",
    name: "Rusted Compass",
    type: "charm",
    statsBonus: { LCK: 5 },
    description:
      "Always points toward weak spots. Party's Bleed/Poison/Burn damage +5%.",
    value: 70,
  },
  familiars_token: {
    id: "familiars_token",
    name: "Familiar's Token",
    type: "charm",
    statsBonus: { INT: 6 },
    description:
      "A carved paw-print. Familiars gain +15% ATK and Empower Pack heal +10 HP.",
    value: 120,
  },
  demon_eye_charm: {
    id: "demon_eye_charm",
    name: "Demon Eye Charm",
    type: "charm",
    statsBonus: { STR: 5, DEX: 5, LCK: 5 },
    description:
      "See through Guard stances - blocked damage is reduced by only 30% instead of 50%.",
    value: 130,
  },
  blessed_war_icon: {
    id: "blessed_war_icon",
    name: "Blessed War Icon",
    type: "charm",
    statsBonus: { FTH: 5, CON: 5 },
    description:
      "Icon of the holy alliance. Taunt skills reduce enemy ATK by an additional 5%.",
    value: 80,
  },

  // --- UNIQUE MERCHANDISE ---
  heart_of_eternity: {
    id: "heart_of_eternity",
    name: "Heart of Eternity",
    type: "charm",
    flatMaxHp: 120,
    flatDef: 8,
    statsBonus: { CON: 5, FTH: 5, LCK: 5 },
    description:
      "A mythical heart carved from pure life crystal. Bestows legendary traits.",
    value: 300,
  },

  // --- SPECIAL SHOP ITEMS ---
  cursed_blade_of_vareth: {
    id: "cursed_blade_of_vareth",
    name: "Cursed Blade of Vareth",
    rarity: "Legendary",
    type: "weapon",
    weaponType: "sword",
    flatAtk: 35,
    statsBonus: { STR: 15 },
    description:
      "A blade that whispers forgotten atrocities. Grants massive power but slowly corrupts the wielder. Every 3rd hit ignores 50% DEF, but causes Self Burn 12/turn.",
    value: 220,
  },
  stormreaver_longbow: {
    id: "stormreaver_longbow",
    name: "Stormreaver Longbow",
    rarity: "Legendary",
    type: "weapon",
    weaponType: "bow",
    flatAtk: 24,
    flatAccuracy: 8,
    statsBonus: { DEX: 12 },
    description:
      "Infused with captured lightning. Critical hits chain to one additional target. +10% critical chance.",
    value: 120,
  },
  soulflame_grimoire: {
    id: "soulflame_grimoire",
    name: "Soulflame Grimoire",
    rarity: "Legendary",
    type: "weapon",
    weaponType: "tome",
    flatAtk: 30,
    statsBonus: { INT: 14 },
    description:
      "A living spellbook. Burn and Void skills deal +30% damage and spread to adjacent enemies.",
    value: 200,
  },
  seraphs_judgment_hammer: {
    id: "seraphs_judgment_hammer",
    name: "Seraph's Judgment Hammer",
    rarity: "Legendary",
    type: "weapon",
    weaponType: "sword",
    flatAtk: 26,
    flatDef: 6,
    statsBonus: { STR: 8, FTH: 10 },
    description:
      "Holy retribution weapon. King's Judgment / Heaven's Reckoning stun for +1 turn.",
    value: 130,
  },
  phantom_eclipse_dagger: {
    id: "phantom_eclipse_dagger",
    name: "Phantom Eclipse Dagger",
    rarity: "Legendary",
    type: "weapon",
    weaponType: "dagger",
    flatAtk: 28,
    flatAccuracy: 10,
    statsBonus: { DEX: 13 },
    description:
      "Exists half in the void. Attacks have 25% chance to apply Death Mark and bypass all shields.",
    value: 210,
  },
  entropys_lament_lyre: {
    id: "entropys_lament_lyre",
    name: "Entropy's Lament Lyre",
    rarity: "Legendary",
    type: "weapon",
    weaponType: "lute",
    flatAtk: 27,
    statsBonus: { CHA: 14 },
    description:
      "The final song of a dying world. World's End Aria silences all enemies for 3 turns.",
    value: 230,
  },
  warlords_titan_cleaver: {
    id: "warlords_titan_cleaver",
    name: "Warlord's Titan Cleaver",
    rarity: "Legendary",
    type: "weapon",
    weaponType: "sword",
    flatAtk: 29,
    flatDef: 5,
    statsBonus: { STR: 12 },
    description:
      "Heavy weapon that grows stronger with bloodshed. Conqueror's Bloodlust grants +1 stack per kill.",
    value: 125,
  },
  riftweaver_staff: {
    id: "riftweaver_staff",
    name: "Riftweaver Staff",
    rarity: "Legendary",
    type: "weapon",
    weaponType: "staff",
    flatAtk: 32,
    statsBonus: { INT: 15 },
    description:
      "Channels pure void. Rift Cascade pulls all enemies into Column 2 and deals +35% damage to them.",
    value: 240,
  },
  abyssal_sovereign_plate: {
    id: "abyssal_sovereign_plate",
    name: "Abyssal Sovereign Plate",
    rarity: "Epic",
    type: "chestplate",
    flatDef: 35,
    flatMaxHp: 80,
    statsBonus: { CON: 12 },
    description:
      "Void-forged armor of fallen kings. +22% damage reduction while below 50% HP.",
    value: 140,
  },
  starweaver_robes: {
    id: "starweaver_robes",
    name: "Starweaver Robes",
    rarity: "Epic",
    type: "chestplate",
    flatDef: 18,
    flatMaxHp: 60,
    statsBonus: { INT: 16 },
    description:
      "Robes sewn from captured starlight. Mana Overflow restores +2 extra Energy.",
    value: 210,
  },
  wraithsilk_shroud: {
    id: "wraithsilk_shroud",
    name: "Wraithsilk Shroud",
    rarity: "Epic",
    type: "chestplate",
    flatDef: 20,
    flatDodge: 20,
    statsBonus: { DEX: 10 },
    description:
      "Semi-transparent void silk. +20% dodge and 30% reduced aggro.",
    value: 135,
  },
  divine_seraph_vestments: {
    id: "divine_seraph_vestments",
    name: "Divine Seraph Vestments",
    rarity: "Epic",
    type: "chestplate",
    flatDef: 22,
    flatMaxHp: 70,
    statsBonus: { FTH: 15 },
    description:
      "Robes of an ascended angel. Miracle and Divine Cascade heal for +30% and grant shields.",
    value: 220,
  },
  volcanic_fury_greaves: {
    id: "volcanic_fury_greaves",
    name: "Volcanic Fury Greaves",
    rarity: "Rare",
    type: "leggings",
    flatDef: 22,
    statsBonus: { CON: 8 },
    description: "Lava-forged leg armor. Immune to Burn and +15% lifesteal.",
    value: 70,
  },
  eaglelord_winged_boots: {
    id: "eaglelord_winged_boots",
    name: "Eaglelord Winged Boots",
    rarity: "Rare",
    type: "boots",
    flatDef: 12,
    statsBonus: { DEX: 20 },
    description: "Boots of legendary archers. +20 Dexterity.",
    value: 130,
  },
  dread_sovereign_helm: {
    id: "dread_sovereign_helm",
    name: "Dread Sovereign Helm",
    rarity: "Rare",
    type: "helmet",
    flatDef: 18,
    flatMaxHp: 50,
    statsBonus: { FTH: 8 },
    description:
      "Intimidating crown of judgment. Taunt skills last +2 turns and apply -12% enemy ATK.",
    value: 140,
  },
  voidwalker_crown: {
    id: "voidwalker_crown",
    name: "Voidwalker Crown",
    rarity: "Epic",
    type: "helmet",
    flatDef: 15,
    flatDodge: 35,
    statsBonus: { DEX: 5, INT: 5 },
    description:
      "Crown that phases through reality. 35% chance to dodge all damage for 1 turn when hit.",
    value: 200,
  },
  ring_of_eternal_fury: {
    id: "ring_of_eternal_fury",
    name: "Ring of Eternal Fury",
    rarity: "Rare",
    type: "ring",
    statsBonus: { STR: 9 },
    description:
      "Each kill grants stacking +10 STR (max 60) that lasts the entire combat.",
    value: 120,
  },
  seraphs_tear_of_life: {
    id: "seraphs_tear_of_life",
    name: "Seraph's Tear of Life",
    rarity: "Legendary",
    type: "necklace",
    flatMaxHp: 100,
    statsBonus: { FTH: 14 },
    description:
      "Once per battle, when any ally reaches 0 HP, automatically revives them at 35% HP.",
    value: 250,
  },
  phantom_mirror_pendant: {
    id: "phantom_mirror_pendant",
    name: "Phantom Mirror Pendant",
    rarity: "Rare",
    type: "charm",
    flatDodge: 22,
    statsBonus: { DEX: 8 },
    description:
      "Creates perfect illusions. +22% dodge and Shadow Clone / Perfect Parry lasts +1 turn.",
    value: 130,
  },
  dragonheart_core_amulet: {
    id: "dragonheart_core_amulet",
    name: "Dragonheart Core Amulet",
    rarity: "Legendary",
    type: "necklace",
    statsBonus: { STR: 5, DEX: 5, CON: 5, INT: 5, FTH: 5, CHA: 5, LCK: 5 },
    description:
      "Ancient dragon power. +15% to all stats for first 4 turns of combat.",
    value: 280,
  },
  luckweavers_fate_thread: {
    id: "luckweavers_fate_thread",
    name: "Luckweaver's Fate Thread",
    rarity: "Rare",
    type: "bracelet",
    statsBonus: { LCK: 15 },
    description:
      "+18 LCK. 25% chance to gain +2 Energy when applying any debuff.",
    value: 125,
  },
  void_anchor_of_stability: {
    id: "void_anchor_of_stability",
    name: "Void Anchor of Stability",
    rarity: "Epic",
    type: "ring",
    statsBonus: { INT: 12 },
    description:
      "Void and Rift skills cost 1 less Energy and deal +20% damage.",
    value: 260,
  },
  crusaders_unbreakable_oath: {
    id: "crusaders_unbreakable_oath",
    name: "Crusader's Unbreakable Oath",
    rarity: "Rare",
    type: "bracelet",
    flatMaxHp: 80,
    statsBonus: { CON: 10 },
    description:
      "While below 50% HP, all healing received is increased by 35%.",
    value: 135,
  },
  hawkeyes_eternal_focus: {
    id: "hawkeyes_eternal_focus",
    name: "Hawkeye's Eternal Focus",
    rarity: "Rare",
    type: "necklace",
    flatAccuracy: 15,
    statsBonus: { DEX: 11 },
    description:
      "Precision skills (One True Shot etc.) ignore shields and always crit below 50% enemy HP.",
    value: 140,
  },
  phoenix_rebirth_charm: {
    id: "phoenix_rebirth_charm",
    name: "Phoenix Rebirth Charm",
    rarity: "Legendary",
    type: "consumable",
    description:
      "Single use per chapter. Revive at 65% HP and remove ALL Fallen Stacks.",
    value: 350,
  },
  archdemon_essence_vial: {
    id: "archdemon_essence_vial",
    name: "Archdemon Essence Vial",
    rarity: "Epic",
    type: "consumable",
    description:
      "+70% ATK and +45% crit for 4 turns, then Poison (25 dmg, 4 turns).",
    value: 150,
  },
  void_power_crystal: {
    id: "void_power_crystal",
    name: "Void Power Crystal",
    rarity: "Rare",
    type: "consumable",
    description: "Next 4 spells cost 0 Energy (but 18% less damage).",
    value: 80,
  },
  alliance_holy_blessing: {
    id: "alliance_holy_blessing",
    name: "Alliance Holy Blessing",
    rarity: "Rare",
    type: "consumable",
    description:
      "For one battle: +25% healing, +25% shields, and +10% all stats.",
    value: 120,
  },
  demon_eye_of_true_sight: {
    id: "demon_eye_of_true_sight",
    name: "Demon Eye of True Sight",
    rarity: "Epic",
    type: "consumable",
    description:
      "At battle start: reveal all enemy HP, weaknesses, and one upcoming skill.",
    value: 160,
  },
  chaos_elixir_of_transcendence: {
    id: "chaos_elixir_of_transcendence",
    name: "Chaos Elixir of Transcendence",
    rarity: "Legendary",
    type: "consumable",
    description:
      "For 5 turns: +40% ATK, all debuffs applied also hit a second random enemy.",
    value: 240,
  },

  // === BOSS ACCESSORIES (Shop-Exclusive, Any Class) ===
  timbergiant_heartwood_core: {
    id: "timbergiant_heartwood_core",
    name: "Timber-Giant's Heartwood Core",
    type: "charm",
    flatMaxHp: 80,
    flatDef: 12,
    statsBonus: { CON: 8 },
    description:
      "The petrified heart of the Ancient Timber-Giant. Imbues the bearer with the resilience of the old forest — thick bark-like skin and unwavering roots.",
    value: 180,
    rarity: "Epic",
  },
  bone_drake_skeletal_wing: {
    id: "bone_drake_skeletal_wing",
    name: "Bone Drake's Skeletal Wing",
    type: "charm",
    flatAtk: 18,
    flatCrit: 5,
    statsBonus: { DEX: 6, STR: 4 },
    description:
      "A preserved wing bone from the Bone Drake. Grants the predator's instinct — swift strikes that find weak points in enemy armor.",
    value: 200,
    rarity: "Epic",
  },
  archdemon_smoldering_horn: {
    id: "archdemon_smoldering_horn",
    name: "Archdemon's Smoldering Horn",
    type: "charm",
    flatAtk: 22,
    flatDef: 8,
    statsBonus: { STR: 10 },
    description:
      "A horn from the Archdemon Commander, still warm with hellfire. Channels raw aggression — the bearer's critical hits leave Burn on the target.",
    value: 220,
    rarity: "Epic",
  },
  vareth_soul_crystal: {
    id: "vareth_soul_crystal",
    name: "Vareth's Soul Crystal",
    type: "charm",
    flatMaxHp: 50,
    flatAccuracy: 8,
    statsBonus: { INT: 10, LCK: 5 },
    description:
      "A fractured crystal from Lich King Vareth's crown. Whispering cursed knowledge — void-touched spells have a 20% chance to refund their Energy cost.",
    value: 250,
    rarity: "Epic",
  },

  // --- MATERIALS ---
  iron_ore: {
    id: "iron_ore",
    name: "Iron Ore",
    type: "material",
    description: "Raw chunk of iron metal found deep in rocky outcrops.",
    value: 10,
  },
  wolf_pelt: {
    id: "wolf_pelt",
    name: "Wolf Pelt",
    type: "material",
    description: "Thick coarse fur ideal for tailoring durable leather wear.",
    value: 10,
  },
  magic_bloom: {
    id: "magic_bloom",
    name: "Magic Bloom",
    type: "material",
    description: "Glinting fluorescent petal infused with local mana currents.",
    value: 15,
  },
  ancient_bone: {
    id: "ancient_bone",
    name: "Ancient Bone",
    type: "material",
    description:
      "Bleached dense fossil possessing remnants of structural power.",
    value: 15,
  },
  voidstone_fragment: {
    id: "voidstone_fragment",
    name: "Voidstone Fragment",
    type: "material",
    description:
      "A shard of compressed void-matter. Required for all void-infused gear.",
    value: 20,
  },
  demon_blood_vial: {
    id: "demon_blood_vial",
    name: "Demon Blood Vial",
    type: "material",
    description:
      "A sealed vial of demon blood. Used in berserker and dark equipment.",
    value: 20,
  },
  soul_thread: {
    id: "soul_thread",
    name: "Soul Thread",
    type: "material",
    description:
      "A glowing filament spun from a captured soul. Used in legendary recipes.",
    value: 30,
  },
  blessed_silk: {
    id: "blessed_silk",
    name: "Blessed Silk",
    type: "material",
    description:
      "Fabric woven in sanctified looms. Used in Cleric and Bard gear.",
    value: 20,
  },
  glacial_shard: {
    id: "glacial_shard",
    name: "Glacial Shard",
    type: "material",
    description:
      "A sliver of magically sustained ice from a void glacier. Never melts.",
    value: 20,
  },
  shadow_silk: {
    id: "shadow_silk",
    name: "Shadow Silk",
    type: "material",
    description: "Silk harvested from void-spiders. Ideal for stealth gear.",
    value: 20,
  },
  ember_core: {
    id: "ember_core",
    name: "Ember Core",
    type: "material",
    description: "A smouldering mineral core extracted from fire elementals.",
    value: 25,
  },
  chimera_feather: {
    id: "chimera_feather",
    name: "Chimera Feather",
    type: "material",
    description: "An iridescent feather from a chimeric beast. Lightweight.",
    value: 25,
  },
  moonsilk_thread: {
    id: "moonsilk_thread",
    name: "Moonsilk Thread",
    type: "material",
    description:
      "Silk spun under a full moon. Conducts mana with no resistance.",
    value: 25,
  },
  toxin_gland: {
    id: "toxin_gland",
    name: "Toxin Gland",
    type: "material",
    description:
      "A poison gland extracted from venomous creatures. Used in rogue gear.",
    value: 20,
  },
  void_residue: {
    id: "void_residue",
    name: "Void Residue",
    type: "material",
    description: "A sticky, volatile residue left behind by void entities.",
    value: 30,
  },
  volcanic_ash: {
    id: "volcanic_ash",
    name: "Volcanic Ash",
    type: "material",
    description: "Fine ash from volcanic vents. Has mild explosive properties.",
    value: 15,
  },

  // --- NEW MATERIALS (v1.2) ---
  cave_crystal: {
    id: "cave_crystal",
    name: "Cave Crystal",
    type: "material",
    description:
      "A luminescent crystal found deep in cave walls. Humming with latent mana.",
    value: 18,
  },
  goblin_totem: {
    id: "goblin_totem",
    name: "Goblin War Totem",
    type: "material",
    description:
      "A crude wooden totem carved by goblin shamans. Crackles with wild energy.",
    value: 20,
  },
  lich_phial: {
    id: "lich_phial",
    name: "Lich Phial",
    type: "material",
    description:
      "A glass phial containing necromantic essence. Cold to the touch and whispering.",
    value: 28,
  },
  void_tendril: {
    id: "void_tendril",
    name: "Void Tendril",
    type: "material",
    description:
      "A wriggling tendril cut from a void entity. Warps space around it.",
    value: 32,
  },
  gilded_coin: {
    id: "gilded_coin",
    name: "Gilded Coin",
    type: "material",
    description:
      "A golden coin stamped with a smiling face. Feels heavier than it should.",
    value: 25,
  },
  angel_tear: {
    id: "angel_tear",
    name: "Angel's Tear",
    type: "material",
    description:
      "A crystallized tear from a celestial being. Radiates warmth and light.",
    value: 30,
  },
  slime_core: {
    id: "slime_core",
    name: "Slime Core",
    type: "material",
    description:
      "A gelatinous nucleus from a lab slime. Pulsates with unstable energy.",
    value: 22,
  },
  infernal_brand: {
    id: "infernal_brand",
    name: "Infernal Brand",
    type: "material",
    description:
      "A branding iron etched with demonic runes. Permanently warm to the touch.",
    value: 28,
  },
  // --- NEW ITEMS (v1.2) ---
  crystal_staff: {
    id: "crystal_staff",
    name: "Crystal Staff",
    type: "weapon",
    weaponType: "staff",
    flatAtk: 24,
    flatMaxHp: 20,
    statsBonus: { INT: 7, CON: 3 },
    description:
      "A staff tipped with a glowing cave crystal. Thunder Storm has +15% chance to Stagger.",
    value: 160,
    isTwoHanded: true,
  },
  goblin_war_drum: {
    id: "goblin_war_drum",
    name: "Goblin War Drum",
    type: "weapon",
    weaponType: "lute",
    flatAtk: 16,
    statsBonus: { CHA: 6, STR: 3 },
    description:
      "A drum taken from a goblin war chief. Valor Anthem also grants +5% Block Chance.",
    value: 140,
  },
  lich_ward_ring: {
    id: "lich_ward_ring",
    name: "Lich Ward Ring",
    type: "ring",
    flatMaxHp: 30,
    flatDef: 5,
    statsBonus: { INT: 4, CON: 2 },
    description:
      "A ring forged from necromantic silver. Reduces Poison and Bleed damage taken by 15%.",
    value: 180,
  },
  void_blessed_robe: {
    id: "void_blessed_robe",
    name: "Void-Blessed Robe",
    type: "chestplate",
    flatMaxHp: 50,
    flatDef: 8,
    flatDodge: 6,
    statsBonus: { INT: 5, LCK: 3 },
    description:
      "Robes woven with void-tendril thread. 10% chance to negate incoming damage entirely.",
    value: 220,
  },
  golden_circlet: {
    id: "golden_circlet",
    name: "Golden Circlet",
    type: "helmet",
    flatDef: 4,
    statsBonus: { CHA: 6, LCK: 4 },
    description:
      "A gleaming circlet. Increases gold found in battles by 15%.",
    value: 160,
  },
  slime_armor: {
    id: "slime_armor",
    name: "Slime Coat",
    type: "chestplate",
    flatMaxHp: 40,
    flatDef: 10,
    statsBonus: { CON: 5 },
    description:
      "A coat made from solidified slime. Absorbs 8% of incoming damage as HP.",
    value: 180,
  },
  infernal_greaves: {
    id: "infernal_greaves",
    name: "Infernal Greaves",
    type: "leggings",
    flatDef: 8,
    flatMaxHp: 25,
    statsBonus: { STR: 5, CON: 2 },
    description:
      "Greaves forged in demonic fires. Grants +15% resistance to Burn damage.",
    value: 170,
  },
  angelic_halo_charm: {
    id: "angelic_halo_charm",
    name: "Angelic Halo Charm",
    type: "charm",
    flatMaxHp: 25,
    flatDodge: 5,
    statsBonus: { FTH: 5, LCK: 3 },
    description:
      "A small halo-shaped charm. Revives wearer with 10% HP once per battle if slain.",
    value: 280,
    rarity: "Epic",
  },

  // --- CONSUMABLES ---
  minor_heal: {
    id: "minor_heal",
    name: "Minor Healing Potion",
    type: "consumable",
    description: "Immediately restores 75 HP during battle (Free Action).",
    value: 15,
  },
  major_heal: {
    id: "major_heal",
    name: "Major Healing Potion",
    type: "consumable",
    description: "Immediately restores 150 HP during battle (Free Action).",
    value: 45,
  },
  regeneration_elixir: {
    id: "regeneration_elixir",
    name: "Regeneration Elixir",
    type: "consumable",
    description:
      "Immediately grants a 4% Max HP regeneration effect per turn for 10 turns.",
    value: 40,
  },
  energy_brew: {
    id: "energy_brew",
    name: "Energy Brew",
    type: "consumable",
    description: "Unravels 2 points of fresh Energy instantly.",
    value: 20,
  },
  phoenix_feather: {
    id: "phoenix_feather",
    name: "Phoenix Feather",
    type: "consumable",
    description:
      "Burns away to revive the holder at 30% max HP, clearing 1 Fallen Stack. Single use.",
    value: 150,
  },
  void_crystal_shard: {
    id: "void_crystal_shard",
    name: "Void Crystal Shard",
    type: "consumable",
    description:
      "Use before battle: next skill deals +40% damage but caster takes Burn (value 8) for 2 turns. Single use.",
    value: 60,
  },
  blessed_oil: {
    id: "blessed_oil",
    name: "Blessed Oil",
    type: "consumable",
    description:
      "Apply to weapon before battle: weapon deals +20% holy damage for 3 turns. Single use.",
    value: 40,
  },
  greater_healing_draught: {
    id: "greater_healing_draught",
    name: "Greater Healing Draught",
    type: "consumable",
    description:
      "Restores 80 HP outside combat, or 50 HP when used mid-battle. Single use.",
    value: 50,
  },
  antidote_capsule: {
    id: "antidote_capsule",
    name: "Antidote Capsule",
    type: "consumable",
    description:
      "Cleanses all Poison, Burn, and Bleed from one character instantly. Single use.",
    value: 30,
  },
  demonic_stimulant: {
    id: "demonic_stimulant",
    name: "Demonic Stimulant",
    type: "consumable",
    description:
      "Use to gain +50% ATK and +30% crit for 2 turns, then receive Poison (value 15, 2 turns). Single use.",
    value: 80,
  },
  mana_crystal: {
    id: "mana_crystal",
    name: "Mana Crystal",
    type: "consumable",
    description: "Restores 3 EN to one character immediately. Single use.",
    value: 40,
  },
  smoke_bomb: {
    id: "smoke_bomb",
    name: "Smoke Bomb",
    type: "consumable",
    description:
      "Throw to grant all allies +20% evasion for 1 turn (cannot attack same turn). Single use.",
    value: 30,
  },
  warding_incense: {
    id: "warding_incense",
    name: "Warding Incense",
    type: "consumable",
    description:
      "Burn at camp: grants all party members Shield (value 20) in next battle. Single use.",
    value: 50,
  },
  berserk_brew: {
    id: "berserk_brew",
    name: "Berserk Brew",
    type: "consumable",
    description:
      "Grants Berserk (+50% ATK, random targeting) for 3 turns. Single use.",
    value: 80,
  },
  echo_scroll: {
    id: "echo_scroll",
    name: "Echo Scroll",
    type: "consumable",
    description:
      "Causes last skill used by target ally to repeat immediately at 70% effect. Single use.",
    value: 100,
  },
  frost_shard_flask: {
    id: "frost_shard_flask",
    name: "Frost Shard Flask",
    type: "consumable",
    description:
      "Throw at one enemy: applies Stagger (1 turn) and reduces their ATK by 20% for 2 turns. Single use.",
    value: 60,
  },
  soul_lantern: {
    id: "soul_lantern",
    name: "Soul Lantern",
    type: "consumable",
    description:
      "Revive one fallen PC with 50% HP and remove all Fallen Stacks. Single use. Very rare.",
    value: 200,
  },
};

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  // --- WEAPONS ---
  {
    id: "craft_iron_sword",
    name: "Iron Sword",
    ingredients: [
      { itemId: "iron_ore", quantity: 3 },
      { itemId: "wolf_pelt", quantity: 1 },
    ],
    resultItemId: "iron_sword",
  },
  {
    id: "craft_composite_bow",
    name: "Composite Bow",
    ingredients: [
      { itemId: "wolf_pelt", quantity: 2 },
      { itemId: "iron_ore", quantity: 1 },
    ],
    resultItemId: "composite_bow",
  },
  {
    id: "craft_apprentice_staff",
    name: "Apprentice Staff",
    ingredients: [
      { itemId: "magic_bloom", quantity: 2 },
      { itemId: "iron_ore", quantity: 1 },
    ],
    resultItemId: "apprentice_staff",
  },
  {
    id: "craft_holy_tome",
    name: "Priest's Tome",
    ingredients: [
      { itemId: "magic_bloom", quantity: 1 },
      { itemId: "ancient_bone", quantity: 2 },
    ],
    resultItemId: "holy_tome",
  },
  {
    id: "craft_bronze_dagger",
    name: "Bronze Dagger",
    ingredients: [
      { itemId: "iron_ore", quantity: 2 },
      { itemId: "wolf_pelt", quantity: 1 },
    ],
    resultItemId: "bronze_dagger",
  },
  {
    id: "craft_willow_lute",
    name: "Willow Lute",
    ingredients: [
      { itemId: "wolf_pelt", quantity: 2 },
      { itemId: "magic_bloom", quantity: 1 },
    ],
    resultItemId: "willow_lute",
  },
  {
    id: "craft_gilded_broadsword",
    name: "Gilded Broadsword",
    ingredients: [
      { itemId: "iron_ore", quantity: 6 },
      { itemId: "ancient_bone", quantity: 3 },
    ],
    resultItemId: "gilded_broadsword",
  },
  {
    id: "craft_warblade_of_the_fallen",
    name: "Warblade of the Fallen",
    ingredients: [
      { itemId: "iron_ore", quantity: 6 },
      { itemId: "voidstone_fragment", quantity: 2 },
      { itemId: "void_tendril", quantity: 1 },
      { itemId: "ancient_bone", quantity: 2 },
    ],
    resultItemId: "warblade_of_the_fallen",
  },
  {
    id: "craft_berserkers_cleaver",
    name: "Berserker's Cleaver",
    ingredients: [
      { itemId: "iron_ore", quantity: 4 },
      { itemId: "demon_blood_vial", quantity: 3 },
    ],
    resultItemId: "berserkers_cleaver",
  },
  {
    id: "craft_knights_honour_blade",
    name: "Knight's Honour Blade",
    ingredients: [
      { itemId: "iron_ore", quantity: 4 },
      { itemId: "blessed_silk", quantity: 1 },
    ],
    resultItemId: "knights_honour_blade",
  },
  {
    id: "craft_longbow_of_gale",
    name: "Longbow of Gales",
    ingredients: [
      { itemId: "wolf_pelt", quantity: 5 },
      { itemId: "magic_bloom", quantity: 3 },
    ],
    resultItemId: "longbow_of_gale",
  },
  {
    id: "craft_sharpshooters_sighted_bow",
    name: "Sharpshooter's Sighted Bow",
    ingredients: [
      { itemId: "wolf_pelt", quantity: 4 },
      { itemId: "goblin_totem", quantity: 1 },
      { itemId: "chimera_feather", quantity: 2 },
    ],
    resultItemId: "sharpshooters_sighted_bow",
  },
  {
    id: "craft_twin_bolt_crossbows",
    name: "Twin Bolt Crossbows",
    ingredients: [
      { itemId: "iron_ore", quantity: 3 },
      { itemId: "wolf_pelt", quantity: 3 },
      { itemId: "void_residue", quantity: 1 },
    ],
    resultItemId: "twin_bolt_crossbows",
  },
  {
    id: "craft_archmage_scepter",
    name: "Archmage's Scepter",
    ingredients: [
      { itemId: "magic_bloom", quantity: 6 },
      { itemId: "cave_crystal", quantity: 2 },
      { itemId: "ancient_bone", quantity: 2 },
    ],
    resultItemId: "archmage_scepter",
  },
  {
    id: "craft_inferno_rod",
    name: "Inferno Rod",
    ingredients: [
      { itemId: "magic_bloom", quantity: 3 },
      { itemId: "volcanic_ash", quantity: 3 },
    ],
    resultItemId: "inferno_rod",
  },
  {
    id: "craft_frostweave_wand",
    name: "Frostweave Wand",
    ingredients: [
      { itemId: "magic_bloom", quantity: 2 },
      { itemId: "glacial_shard", quantity: 2 },
    ],
    resultItemId: "frostweave_wand",
  },
  {
    id: "craft_summoners_binding_orb",
    name: "Summoner's Binding Orb",
    ingredients: [
      { itemId: "magic_bloom", quantity: 4 },
      { itemId: "soul_thread", quantity: 2 },
    ],
    resultItemId: "summoners_binding_orb",
  },
  {
    id: "craft_tome_of_divine_wrath",
    name: "Tome of Divine Wrath",
    ingredients: [
      { itemId: "ancient_bone", quantity: 4 },
      { itemId: "blessed_silk", quantity: 3 },
      { itemId: "soul_thread", quantity: 1 },
    ],
    resultItemId: "tome_of_divine_wrath",
  },
  {
    id: "craft_inquisitors_flamebrand",
    name: "Inquisitor's Flamebrand",
    ingredients: [
      { itemId: "iron_ore", quantity: 3 },
      { itemId: "ancient_bone", quantity: 2 },
      { itemId: "ember_core", quantity: 2 },
    ],
    resultItemId: "inquisitors_flamebrand",
  },
  {
    id: "craft_assassins_fang",
    name: "Assassin's Fang",
    ingredients: [
      { itemId: "iron_ore", quantity: 3 },
      { itemId: "toxin_gland", quantity: 3 },
      { itemId: "shadow_silk", quantity: 2 },
    ],
    resultItemId: "assassins_fang",
  },
  {
    id: "craft_duelists_rapier",
    name: "Duelist's Rapier",
    ingredients: [
      { itemId: "iron_ore", quantity: 3 },
      { itemId: "wolf_pelt", quantity: 2 },
      { itemId: "moonsilk_thread", quantity: 1 },
    ],
    resultItemId: "duelists_rapier",
  },
  {
    id: "craft_grand_chaos_lyre",
    name: "Grand Chaos Lyre",
    ingredients: [
      { itemId: "wolf_pelt", quantity: 3 },
      { itemId: "void_residue", quantity: 2 },
      { itemId: "slime_core", quantity: 1 },
      { itemId: "magic_bloom", quantity: 2 },
    ],
    resultItemId: "grand_chaos_lyre",
  },
  {
    id: "craft_valor_horn",
    name: "Valor Horn",
    ingredients: [
      { itemId: "iron_ore", quantity: 3 },
      { itemId: "blessed_silk", quantity: 2 },
      { itemId: "chimera_feather", quantity: 1 },
    ],
    resultItemId: "valor_horn",
  },

  // --- OFFHANDS ---
  {
    id: "craft_iron_shield",
    name: "Iron Shield",
    ingredients: [
      { itemId: "iron_ore", quantity: 3 },
      { itemId: "wolf_pelt", quantity: 1 },
    ],
    resultItemId: "iron_shield",
  },
  {
    id: "craft_steel_aegis",
    name: "Steel Aegis",
    ingredients: [
      { itemId: "iron_ore", quantity: 6 },
      { itemId: "ancient_bone", quantity: 2 },
    ],
    resultItemId: "steel_aegis",
  },
  {
    id: "craft_void_tempered_bulwark",
    name: "Void-Tempered Bulwark",
    ingredients: [
      { itemId: "iron_ore", quantity: 6 },
      { itemId: "voidstone_fragment", quantity: 3 },
      { itemId: "void_tendril", quantity: 2 },
      { itemId: "ancient_bone", quantity: 2 },
    ],
    resultItemId: "void_tempered_bulwark",
  },
  {
    id: "craft_clerics_holy_buckler",
    name: "Cleric's Holy Buckler",
    ingredients: [
      { itemId: "iron_ore", quantity: 2 },
      { itemId: "blessed_silk", quantity: 2 },
    ],
    resultItemId: "clerics_holy_buckler",
  },
  {
    id: "craft_spellbreaker_ward",
    name: "Spellbreaker Ward",
    ingredients: [
      { itemId: "magic_bloom", quantity: 3 },
      { itemId: "glacial_shard", quantity: 2 },
    ],
    resultItemId: "spellbreaker_ward",
  },

  // --- HELMETS ---
  {
    id: "craft_iron_helm",
    name: "Iron Helm",
    ingredients: [{ itemId: "iron_ore", quantity: 3 }],
    resultItemId: "iron_helm",
  },
  {
    id: "craft_berserkers_horned_crown",
    name: "Berserker's Horned Crown",
    ingredients: [
      { itemId: "iron_ore", quantity: 4 },
      { itemId: "demon_blood_vial", quantity: 2 },
    ],
    resultItemId: "berserkers_horned_crown",
  },
  {
    id: "craft_mages_arcane_cowl",
    name: "Mage's Arcane Cowl",
    ingredients: [
      { itemId: "magic_bloom", quantity: 2 },
      { itemId: "moonsilk_thread", quantity: 1 },
    ],
    resultItemId: "mages_arcane_cowl",
  },
  {
    id: "craft_high_priests_mitre",
    name: "High Priest's Mitre",
    ingredients: [
      { itemId: "blessed_silk", quantity: 2 },
      { itemId: "ancient_bone", quantity: 2 },
    ],
    resultItemId: "high_priests_mitre",
  },
  {
    id: "craft_shadowhood",
    name: "Shadowhood",
    ingredients: [
      { itemId: "shadow_silk", quantity: 2 },
      { itemId: "wolf_pelt", quantity: 1 },
    ],
    resultItemId: "shadowhood",
  },
  {
    id: "craft_inquisitors_warhelm",
    name: "Inquisitor's Warhelm",
    ingredients: [
      { itemId: "iron_ore", quantity: 4 },
      { itemId: "blessed_silk", quantity: 2 },
    ],
    resultItemId: "inquisitors_warhelm",
  },
  {
    id: "craft_bards_feathered_hat",
    name: "Bard's Feathered Hat",
    ingredients: [
      { itemId: "wolf_pelt", quantity: 1 },
      { itemId: "chimera_feather", quantity: 1 },
    ],
    resultItemId: "bards_feathered_hat",
  },
  {
    id: "craft_void_visage",
    name: "Void Visage",
    ingredients: [
      { itemId: "voidstone_fragment", quantity: 2 },
      { itemId: "void_tendril", quantity: 1 },
      { itemId: "ancient_bone", quantity: 2 },
      { itemId: "soul_thread", quantity: 1 },
    ],
    resultItemId: "void_visage",
  },

  // --- CHESTPLATES ---
  {
    id: "craft_glorious_plate",
    name: "Glorious Steel Plate",
    ingredients: [
      { itemId: "iron_ore", quantity: 8 },
      { itemId: "ancient_bone", quantity: 4 },
    ],
    resultItemId: "glorious_plate",
  },
  {
    id: "craft_glorious_steel_plate",
    name: "Glorious Steel Plate (Enhanced)",
    ingredients: [
      { itemId: "iron_ore", quantity: 8 },
      { itemId: "ancient_bone", quantity: 4 },
    ],
    resultItemId: "glorious_steel_plate",
  },
  {
    id: "craft_chainmail_of_the_watch",
    name: "Chainmail of the Watch",
    ingredients: [
      { itemId: "iron_ore", quantity: 4 },
      { itemId: "wolf_pelt", quantity: 1 },
    ],
    resultItemId: "chainmail_of_the_watch",
  },
  {
    id: "craft_rogues_leatherweave",
    name: "Rogue's Leatherweave",
    ingredients: [
      { itemId: "wolf_pelt", quantity: 2 },
      { itemId: "shadow_silk", quantity: 1 },
    ],
    resultItemId: "rogues_leatherweave",
  },
  {
    id: "craft_woven_mage_robe",
    name: "Woven Mage Robe",
    ingredients: [
      { itemId: "magic_bloom", quantity: 2 },
      { itemId: "moonsilk_thread", quantity: 1 },
    ],
    resultItemId: "woven_mage_robe",
  },
  {
    id: "craft_holy_vestments",
    name: "Holy Vestments",
    ingredients: [
      { itemId: "blessed_silk", quantity: 2 },
      { itemId: "ancient_bone", quantity: 2 },
    ],
    resultItemId: "holy_vestments",
  },
  {
    id: "craft_demon_forged_cuirass",
    name: "Demon-Forged Cuirass",
    ingredients: [
      { itemId: "iron_ore", quantity: 5 },
      { itemId: "demon_blood_vial", quantity: 4 },
      { itemId: "infernal_brand", quantity: 1 },
      { itemId: "voidstone_fragment", quantity: 2 },
    ],
    resultItemId: "demon_forged_cuirass",
  },

  // --- LEGGINGS ---
  {
    id: "craft_iron_leggings",
    name: "Iron Leggings (Heavy)",
    ingredients: [{ itemId: "iron_ore", quantity: 3 }],
    resultItemId: "iron_leggings",
  },
  {
    id: "craft_windstride_leggings",
    name: "Windstride Leggings",
    ingredients: [
      { itemId: "wolf_pelt", quantity: 2 },
      { itemId: "magic_bloom", quantity: 1 },
    ],
    resultItemId: "windstride_leggings",
  },
  {
    id: "craft_boneweave_trousers",
    name: "Boneweave Trousers",
    ingredients: [
      { itemId: "ancient_bone", quantity: 4 },
      { itemId: "wolf_pelt", quantity: 1 },
    ],
    resultItemId: "boneweave_trousers",
  },
  {
    id: "craft_void_silk_drape",
    name: "Void-Silk Drape",
    ingredients: [
      { itemId: "shadow_silk", quantity: 3 },
      { itemId: "void_residue", quantity: 2 },
    ],
    resultItemId: "void_silk_drape",
  },

  // --- BOOTS ---
  {
    id: "craft_iron_toed_boots",
    name: "Iron-Toed Boots",
    ingredients: [
      { itemId: "iron_ore", quantity: 2 },
      { itemId: "wolf_pelt", quantity: 1 },
    ],
    resultItemId: "iron_toed_boots",
  },
  {
    id: "craft_phantom_step_boots",
    name: "Phantom Step Boots",
    ingredients: [
      { itemId: "shadow_silk", quantity: 2 },
      { itemId: "soul_thread", quantity: 2 },
    ],
    resultItemId: "phantom_step_boots",
  },
  {
    id: "craft_bards_springheels",
    name: "Bard's Springheels",
    ingredients: [
      { itemId: "wolf_pelt", quantity: 1 },
      { itemId: "moonsilk_thread", quantity: 2 },
    ],
    resultItemId: "bards_springheels",
  },
  {
    id: "craft_mages_floatweave_slippers",
    name: "Mage's Floatweave Slippers",
    ingredients: [
      { itemId: "magic_bloom", quantity: 2 },
      { itemId: "moonsilk_thread", quantity: 1 },
    ],
    resultItemId: "mages_floatweave_slippers",
  },
  {
    id: "craft_sabatons_of_conviction",
    name: "Sabatons of Conviction",
    ingredients: [
      { itemId: "iron_ore", quantity: 3 },
      { itemId: "blessed_silk", quantity: 2 },
    ],
    resultItemId: "sabatons_of_conviction",
  },

  // --- RINGS ---
  {
    id: "craft_ring_of_iron_will",
    name: "Ring of Iron Will",
    ingredients: [
      { itemId: "iron_ore", quantity: 3 },
      { itemId: "ancient_bone", quantity: 1 },
    ],
    resultItemId: "ring_of_iron_will",
  },
  {
    id: "craft_luckstone_ring",
    name: "Luckstone Ring",
    ingredients: [
      { itemId: "ancient_bone", quantity: 1 },
      { itemId: "magic_bloom", quantity: 2 },
    ],
    resultItemId: "luckstone_ring",
  },
  {
    id: "craft_ring_of_the_void_pact",
    name: "Ring of the Void Pact",
    ingredients: [
      { itemId: "voidstone_fragment", quantity: 2 },
      { itemId: "soul_thread", quantity: 1 },
    ],
    resultItemId: "ring_of_the_void_pact",
  },
  {
    id: "craft_clerics_sanctified_band",
    name: "Cleric's Sanctified Band",
    ingredients: [
      { itemId: "ancient_bone", quantity: 2 },
      { itemId: "blessed_silk", quantity: 2 },
    ],
    resultItemId: "clerics_sanctified_band",
  },
  {
    id: "craft_duelists_promise_ring",
    name: "Duelist's Promise Ring",
    ingredients: [
      { itemId: "iron_ore", quantity: 2 },
      { itemId: "moonsilk_thread", quantity: 1 },
      { itemId: "chimera_feather", quantity: 1 },
    ],
    resultItemId: "duelists_promise_ring",
  },
  {
    id: "craft_berserkers_bloodring",
    name: "Berserker's Bloodring",
    ingredients: [
      { itemId: "demon_blood_vial", quantity: 3 },
      { itemId: "iron_ore", quantity: 1 },
    ],
    resultItemId: "berserkers_bloodring",
  },
  {
    id: "craft_archers_eagle_ring",
    name: "Archer's Eagle Ring",
    ingredients: [
      { itemId: "chimera_feather", quantity: 1 },
      { itemId: "wolf_pelt", quantity: 2 },
    ],
    resultItemId: "archers_eagle_ring",
  },

  // --- BRACELETS ---
  {
    id: "craft_warriors_iron_brace",
    name: "Warrior's Iron Brace",
    ingredients: [{ itemId: "iron_ore", quantity: 2 }],
    resultItemId: "warriors_iron_brace",
  },
  {
    id: "craft_bowstring_bracers",
    name: "Bowstring Bracers",
    ingredients: [
      { itemId: "wolf_pelt", quantity: 1 },
      { itemId: "chimera_feather", quantity: 1 },
    ],
    resultItemId: "bowstring_bracers",
  },
  {
    id: "craft_sorcerers_runebracers",
    name: "Sorcerer's Runebracers",
    ingredients: [
      { itemId: "ancient_bone", quantity: 2 },
      { itemId: "magic_bloom", quantity: 2 },
    ],
    resultItemId: "sorcerers_runebracers",
  },
  {
    id: "craft_assassins_poison_vambraces",
    name: "Assassin's Poison Vambraces",
    ingredients: [
      { itemId: "toxin_gland", quantity: 2 },
      { itemId: "iron_ore", quantity: 1 },
      { itemId: "shadow_silk", quantity: 1 },
    ],
    resultItemId: "assassins_poison_vambraces",
  },
  {
    id: "craft_songweaver_cuffs",
    name: "Songweaver Cuffs",
    ingredients: [
      { itemId: "magic_bloom", quantity: 1 },
      { itemId: "moonsilk_thread", quantity: 2 },
    ],
    resultItemId: "songweaver_cuffs",
  },

  // --- NECKLACES ---
  {
    id: "craft_amulet_of_the_stalwart",
    name: "Amulet of the Stalwart",
    ingredients: [
      { itemId: "iron_ore", quantity: 3 },
      { itemId: "ancient_bone", quantity: 1 },
    ],
    resultItemId: "amulet_of_the_stalwart",
  },
  {
    id: "craft_hex_ward_pendant",
    name: "Hex-Ward Pendant",
    ingredients: [
      { itemId: "glacial_shard", quantity: 2 },
      { itemId: "ancient_bone", quantity: 1 },
      { itemId: "magic_bloom", quantity: 1 },
    ],
    resultItemId: "hex_ward_pendant",
  },
  {
    id: "craft_soul_siphon_chain",
    name: "Soul-Siphon Chain",
    ingredients: [
      { itemId: "soul_thread", quantity: 3 },
      { itemId: "lich_phial", quantity: 1 },
      { itemId: "demon_blood_vial", quantity: 2 },
    ],
    resultItemId: "soul_siphon_chain",
  },
  {
    id: "craft_clerics_prayer_beads",
    name: "Cleric's Prayer Beads",
    ingredients: [
      { itemId: "ancient_bone", quantity: 3 },
      { itemId: "blessed_silk", quantity: 1 },
    ],
    resultItemId: "clerics_prayer_beads",
  },
  {
    id: "craft_sharpshooters_scope_monocle",
    name: "Sharpshooter's Scope Monocle",
    ingredients: [
      { itemId: "chimera_feather", quantity: 2 },
      { itemId: "magic_bloom", quantity: 1 },
    ],
    resultItemId: "sharpshooters_scope_monocle",
  },
  {
    id: "craft_void_throat_stone",
    name: "Void Throat Stone",
    ingredients: [
      { itemId: "voidstone_fragment", quantity: 3 },
      { itemId: "soul_thread", quantity: 1 },
    ],
    resultItemId: "void_throat_stone",
  },

  // --- CHARMS ---
  {
    id: "craft_talisman_of_power",
    name: "Talisman of Power",
    ingredients: [
      { itemId: "iron_ore", quantity: 3 },
      { itemId: "wolf_pelt", quantity: 3 },
      { itemId: "magic_bloom", quantity: 3 },
      { itemId: "ancient_bone", quantity: 3 },
      { itemId: "angel_tear", quantity: 1 },
    ],
    resultItemId: "talisman_of_power",
  },
  {
    id: "craft_phoenix_feather_charm",
    name: "Phoenix Feather Charm",
    ingredients: [
      { itemId: "magic_bloom", quantity: 5 },
      { itemId: "ancient_bone", quantity: 3 },
    ],
    resultItemId: "phoenix_feather_charm",
  },
  {
    id: "craft_void_crystal_lens",
    name: "Void Crystal Lens",
    ingredients: [
      { itemId: "voidstone_fragment", quantity: 4 },
      { itemId: "ancient_bone", quantity: 1 },
    ],
    resultItemId: "void_crystal_lens",
  },
  {
    id: "craft_rusted_compass",
    name: "Rusted Compass",
    ingredients: [
      { itemId: "iron_ore", quantity: 1 },
      { itemId: "ancient_bone", quantity: 1 },
      { itemId: "magic_bloom", quantity: 1 },
    ],
    resultItemId: "rusted_compass",
  },
  {
    id: "craft_familiars_token",
    name: "Familiar's Token",
    ingredients: [
      { itemId: "soul_thread", quantity: 3 },
      { itemId: "magic_bloom", quantity: 2 },
    ],
    resultItemId: "familiars_token",
  },
  {
    id: "craft_demon_eye_charm",
    name: "Demon Eye Charm",
    ingredients: [
      { itemId: "demon_blood_vial", quantity: 2 },
      { itemId: "voidstone_fragment", quantity: 1 },
    ],
    resultItemId: "demon_eye_charm",
  },
  {
    id: "craft_blessed_war_icon",
    name: "Blessed War Icon",
    ingredients: [
      { itemId: "blessed_silk", quantity: 1 },
      { itemId: "ancient_bone", quantity: 1 },
    ],
    resultItemId: "blessed_war_icon",
  },

  // --- CONSUMABLES ---
  {
    id: "craft_phoenix_feather",
    name: "Phoenix Feather",
    ingredients: [
      { itemId: "magic_bloom", quantity: 5 },
      { itemId: "ancient_bone", quantity: 3 },
    ],
    resultItemId: "phoenix_feather",
  },
  {
    id: "craft_blessed_oil",
    name: "Blessed Oil",
    ingredients: [
      { itemId: "magic_bloom", quantity: 2 },
      { itemId: "ancient_bone", quantity: 1 },
    ],
    resultItemId: "blessed_oil",
  },
  {
    id: "craft_greater_healing_draught",
    name: "Greater Healing Draught",
    ingredients: [
      { itemId: "magic_bloom", quantity: 3 },
      { itemId: "ember_core", quantity: 1 },
    ],
    resultItemId: "greater_healing_draught",
  },
  {
    id: "craft_antidote_capsule",
    name: "Antidote Capsule",
    ingredients: [
      { itemId: "magic_bloom", quantity: 1 },
      { itemId: "toxin_gland", quantity: 1 },
    ],
    resultItemId: "antidote_capsule",
  },
  {
    id: "craft_demonic_stimulant",
    name: "Demonic Stimulant",
    ingredients: [
      { itemId: "demon_blood_vial", quantity: 3 },
      { itemId: "toxin_gland", quantity: 1 },
    ],
    resultItemId: "demonic_stimulant",
  },
  {
    id: "craft_mana_crystal",
    name: "Mana Crystal",
    ingredients: [
      { itemId: "magic_bloom", quantity: 3 },
      { itemId: "glacial_shard", quantity: 1 },
    ],
    resultItemId: "mana_crystal",
  },
  {
    id: "craft_smoke_bomb",
    name: "Smoke Bomb",
    ingredients: [
      { itemId: "shadow_silk", quantity: 1 },
      { itemId: "volcanic_ash", quantity: 1 },
    ],
    resultItemId: "smoke_bomb",
  },
  {
    id: "craft_warding_incense",
    name: "Warding Incense",
    ingredients: [
      { itemId: "blessed_silk", quantity: 2 },
      { itemId: "ember_core", quantity: 1 },
    ],
    resultItemId: "warding_incense",
  },
  {
    id: "craft_berserk_brew",
    name: "Berserk Brew",
    ingredients: [
      { itemId: "demon_blood_vial", quantity: 2 },
      { itemId: "volcanic_ash", quantity: 1 },
    ],
    resultItemId: "berserk_brew",
  },
  {
    id: "craft_echo_scroll",
    name: "Echo Scroll",
    ingredients: [
      { itemId: "ancient_bone", quantity: 2 },
      { itemId: "magic_bloom", quantity: 3 },
      { itemId: "soul_thread", quantity: 1 },
    ],
    resultItemId: "echo_scroll",
  },
  {
    id: "craft_frost_shard_flask",
    name: "Frost Shard Flask",
    ingredients: [
      { itemId: "glacial_shard", quantity: 2 },
      { itemId: "void_residue", quantity: 1 },
    ],
    resultItemId: "frost_shard_flask",
  },
  {
    id: "craft_soul_lantern",
    name: "Soul Lantern",
    ingredients: [
      { itemId: "soul_thread", quantity: 3 },
      { itemId: "lich_phial", quantity: 2 },
      { itemId: "ancient_bone", quantity: 3 },
      { itemId: "blessed_silk", quantity: 2 },
    ],
    resultItemId: "soul_lantern",
  },
  {
    id: "craft_minor_heal",
    name: "Minor Healing Potion",
    ingredients: [{ itemId: "magic_bloom", quantity: 1 }],
    resultItemId: "minor_heal",
  },
  {
    id: "craft_major_heal",
    name: "Major Healing Potion",
    ingredients: [
      { itemId: "magic_bloom", quantity: 2 },
      { itemId: "lucky_clover", quantity: 1 },
    ],
    resultItemId: "major_heal",
  },
  {
    id: "craft_regeneration_elixir",
    name: "Regeneration Elixir",
    ingredients: [
      { itemId: "magic_bloom", quantity: 1 },
      { itemId: "lucky_clover", quantity: 1 },
    ],
    resultItemId: "regeneration_elixir",
  },

  // --- NEW ITEM RECIPES (v1.2) ---
  {
    id: "craft_crystal_staff",
    name: "Crystal Staff",
    ingredients: [
      { itemId: "cave_crystal", quantity: 3 },
      { itemId: "magic_bloom", quantity: 2 },
      { itemId: "iron_ore", quantity: 2 },
    ],
    resultItemId: "crystal_staff",
  },
  {
    id: "craft_goblin_war_drum",
    name: "Goblin War Drum",
    ingredients: [
      { itemId: "goblin_totem", quantity: 3 },
      { itemId: "wolf_pelt", quantity: 2 },
      { itemId: "iron_ore", quantity: 1 },
    ],
    resultItemId: "goblin_war_drum",
  },
  {
    id: "craft_lich_ward_ring",
    name: "Lich Ward Ring",
    ingredients: [
      { itemId: "lich_phial", quantity: 2 },
      { itemId: "ancient_bone", quantity: 2 },
      { itemId: "soul_thread", quantity: 1 },
    ],
    resultItemId: "lich_ward_ring",
  },
  {
    id: "craft_void_blessed_robe",
    name: "Void-Blessed Robe",
    ingredients: [
      { itemId: "void_tendril", quantity: 3 },
      { itemId: "shadow_silk", quantity: 3 },
      { itemId: "void_residue", quantity: 2 },
    ],
    resultItemId: "void_blessed_robe",
  },
  {
    id: "craft_golden_circlet",
    name: "Golden Circlet",
    ingredients: [
      { itemId: "gilded_coin", quantity: 4 },
      { itemId: "iron_ore", quantity: 2 },
      { itemId: "blessed_silk", quantity: 1 },
    ],
    resultItemId: "golden_circlet",
  },
  {
    id: "craft_slime_armor",
    name: "Slime Coat",
    ingredients: [
      { itemId: "slime_core", quantity: 3 },
      { itemId: "iron_ore", quantity: 3 },
      { itemId: "void_residue", quantity: 1 },
    ],
    resultItemId: "slime_armor",
  },
  {
    id: "craft_infernal_greaves",
    name: "Infernal Greaves",
    ingredients: [
      { itemId: "infernal_brand", quantity: 2 },
      { itemId: "iron_ore", quantity: 4 },
      { itemId: "demon_blood_vial", quantity: 1 },
    ],
    resultItemId: "infernal_greaves",
  },
  {
    id: "craft_angelic_halo_charm",
    name: "Angelic Halo Charm",
    ingredients: [
      { itemId: "angel_tear", quantity: 3 },
      { itemId: "blessed_silk", quantity: 2 },
      { itemId: "soul_thread", quantity: 2 },
    ],
    resultItemId: "angelic_halo_charm",
  },
];
