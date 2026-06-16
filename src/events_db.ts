/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StoryTemplate } from "./types";

export const MYSTERY_STORIES: StoryTemplate[] = [
  // ==========================================
  // GENERAL / FILLER EVENTS (Keep some originals)
  // ==========================================
  {
    title: "🛒 Wandering Merchant",
    desc: "A merchant cart is full of odd charms and rings.",
    stars: 2,
    choices: [
      {
        label: "🪙 Buy Brass Ring (20 Gold)",
        effectText: "Purchase a luck band.",
        effect: { type: "gold", goldVal: -20, successEffect: { type: "item", itemId: "brass_ring", quantity: 1 } }
      },
      {
        label: "🪙 Buy Silver Band (30 Gold)",
        effectText: "Purchase a protective band.",
        effect: { type: "gold", goldVal: -30, successEffect: { type: "item", itemId: "silver_band", quantity: 1 } }
      }
    ]
  },
  {
    title: "🏕️ Rest Stop",
    desc: "A calm clearing offers a moment to catch your breath.",
    stars: 1,
    choices: [
      {
        label: "🍲 Rest and eat",
        effectText: "Restore 30% Max HP to all characters.",
        effect: { type: "hp_pct", hpPct: 0.3 }
      },
      {
        label: "🚶 Keep moving",
        effectText: "Save time.",
        effect: { type: "none", message: "You push forward." }
      }
    ]
  },
  {
    title: "⛪ Small Chapel",
    desc: "A small holy sanctuary stands intact amid the ruins.",
    stars: 1,
    choices: [
      {
        label: "🙏 Pray at altar",
        effectText: "Heal 20 HP to all characters.",
        effect: { type: "hp", hpVal: 20 }
      },
      { label: "🚶 Keep traveling", effectText: "Keep moving.", effect: { type: "none" } }
    ]
  },
  {
    title: "💧 Natural Spring",
    desc: "A clear pool of clean water runs down the rocks.",
    stars: 1,
    choices: [
      { label: "💧 Drink spring water", effectText: "Heal 20 HP to all characters.", effect: { type: "hp", hpVal: 20 } },
      { label: "🚶 Keep walking", effectText: "Save your throat.", effect: { type: "none" } }
    ]
  },
  {
    title: "🎒 Forgotten Pouch",
    desc: "You spot a small pouch caught in a thorn bush.",
    stars: 1,
    choices: [
      { label: "🔍 Search pouch (LCK check)", effectText: "Requires 11 LCK. Win: get 20 gold.", effect: { type: "stat_check", stat: "LCK", threshold: 11, successEffect: { type: "gold", goldVal: 20 }, failEffect: { type: "none" } } },
      { label: "🚶 Leave it alone", effectText: "Avoid poison thorns.", effect: { type: "none" } }
    ]
  },

  // ==========================================
  // CAVE EVENTS
  // ==========================================
  {
    title: "⛰️ Collapsing Tunnel",
    desc: "The path ahead is blocked by rubble. You must find a way through or around.",
    stars: 1,
    choices: [
      { label: "💪 Dig through (STR check)", effectText: "Requires 11 STR. Success: gain Iron Ore x3. Fail: take 10 HP damage.", effect: { type: "stat_check", stat: "STR", threshold: 11, successEffect: { type: "item", itemId: "iron_ore", quantity: 3 }, failEffect: { type: "hp", hpVal: -10 } } },
      { label: "🏃 Sneak around (DEX check)", effectText: "Requires 11 DEX. Success: gain 15 Gold. Fail: minor injury.", effect: { type: "stat_check", stat: "DEX", threshold: 11, successEffect: { type: "gold", goldVal: 15 }, failEffect: { type: "hp", hpVal: -5 } } }
    ]
  },
  {
    title: "💎 Glowing Crystal Vein",
    desc: "A vein of luminous crystals pulses with energy. Mining them could be rewarding but risky.",
    stars: 2,
    choices: [
      { label: "⛏️ Mine crystals (STR check)", effectText: "Requires 12 STR. Success: gain 2x Magic Bloom. Fail: trigger combat.", effect: { type: "stat_check", stat: "STR", threshold: 12, successEffect: { type: "item", itemId: "magic_bloom", quantity: 2 }, failEffect: { type: "combat" } } },
      { label: "🚶 Leave the vein", effectText: "Play it safe.", effect: { type: "none" } }
    ]
  },
  {
    title: "👻 Lost Miner Ghost",
    desc: "A translucent miner spirit approaches, gesturing toward a collapsed shaft.",
    stars: 2,
    choices: [
      { label: "🙏 Help the spirit (FTH check)", effectText: "Requires 11 FTH. Success: gain +10% Block next combat. Fail: minor debuff.", effect: { type: "stat_check", stat: "FTH", threshold: 11, successEffect: { type: "status", statusType: "shield", statusVal: 10, statusDur: 1 }, failEffect: { type: "status", statusType: "vulnerable", statusVal: 1, statusDur: 1 } } },
      { label: "🚶 Ignore the ghost", effectText: "Gain 10 gold from nearby ore.", effect: { type: "gold", goldVal: 10 } }
    ]
  },
  {
    title: "🌊 Underground Stream",
    desc: "An underground river blocks the path. You can try to cross or find another way.",
    stars: 1,
    choices: [
      { label: "🏊 Swim across (CON check)", effectText: "Requires 12 CON. Success: party heals 15 HP. Fail: lose 10 HP.", effect: { type: "stat_check", stat: "CON", threshold: 12, successEffect: { type: "hp", hpVal: 15 }, failEffect: { type: "hp", hpVal: -10 } } },
      { label: "❄️ Freeze bridge (INT check)", effectText: "Requires 12 INT. Success: gain 20 XP. Fail: lose 5 HP.", effect: { type: "stat_check", stat: "INT", threshold: 12, successEffect: { type: "xp", xpVal: 20 }, failEffect: { type: "hp", hpVal: -5 } } }
    ]
  },
  {
    title: "🔣 Ancient Rune Wall",
    desc: "A wall covered in glowing ancient runes blocks the path.",
    stars: 2,
    choices: [
      { label: "🔍 Decipher runes (INT check)", effectText: "Requires 12 INT. Success: gain +1 Talent Point hint. Fail: lose 10 HP.", effect: { type: "stat_check", stat: "INT", threshold: 12, successEffect: { type: "xp", xpVal: 30 }, failEffect: { type: "hp", hpVal: -10 } } },
      { label: "💥 Smash through (STR check)", effectText: "Requires 12 STR. Success: pass safely. Fail: trigger combat.", effect: { type: "stat_check", stat: "STR", threshold: 12, successEffect: { type: "none" }, failEffect: { type: "combat" } } }
    ]
  },
  {
    title: "📦 Trapped Chest",
    desc: "A ornate chest sits in the corner, a faint clicking sound coming from within.",
    stars: 2,
    choices: [
      { label: "🔓 Disarm trap (DEX check)", effectText: "Requires 12 DEX. Success: gain 30 Gold + item. Fail: party Bleeds.", effect: { type: "stat_check", stat: "DEX", threshold: 12, successEffect: { type: "gold", goldVal: 30, successEffect: { type: "item", itemId: "iron_ore", quantity: 2 } }, failEffect: { type: "status", statusType: "bleed", statusVal: 8, statusDur: 2 } } },
      { label: "💪 Force open (STR check)", effectText: "Requires 12 STR. Success: get loot. Fail: lose 15 HP.", effect: { type: "stat_check", stat: "STR", threshold: 12, successEffect: { type: "item", itemId: "ancient_bone", quantity: 2 }, failEffect: { type: "hp", hpVal: -15 } } }
    ]
  },

  // ==========================================
  // ABANDONED TRAIL EVENTS
  // ==========================================
  {
    title: "🛤️ Overgrown Path Split",
    desc: "The trail splits. One path looks risky but short, the other longer but safer.",
    stars: 1,
    choices: [
      { label: "⚡ Take risky shortcut", effectText: "Gain 25 XP but risk combat.", effect: { type: "xp", xpVal: 25, successEffect: { type: "combat" } } },
      { label: "🚶 Take safe long route", effectText: "Safe passage, less reward.", effect: { type: "gold", goldVal: 10 } }
    ]
  },
  {
    title: "🎒 Abandoned Caravan",
    desc: "A broken merchant carriage lies abandoned by the roadside.",
    stars: 1,
    choices: [
      { label: "🔍 Scavenge wreckage", effectText: "Gain 1x Wolf Pelt and 2x Iron Ore.", effect: { type: "item", itemId: "wolf_pelt", quantity: 1, successEffect: { type: "item", itemId: "iron_ore", quantity: 2 } } },
      { label: "🚶 Leave it alone", effectText: "Avoid traps.", effect: { type: "none" } }
    ]
  },
  {
    title: "🩹 Wounded Traveler",
    desc: "A wounded traveler lies by the path, begging for help.",
    stars: 2,
    choices: [
      { label: "💊 Help them (FTH check)", effectText: "Requires 11 FTH. Success: restore 30% party HP. Fail: lose 10 HP.", effect: { type: "stat_check", stat: "FTH", threshold: 11, successEffect: { type: "hp_pct", hpPct: 0.3 }, failEffect: { type: "hp", hpVal: -10 } } },
      { label: "🎒 Take their supplies", effectText: "Gain 20 Gold.", effect: { type: "gold", goldVal: 20 } }
    ]
  },
  {
    title: "🔥 Suspicious Campfire",
    desc: "A campfire burns with strange colored flames. Someone or something is nearby.",
    stars: 2,
    choices: [
      { label: "🤝 Approach to trade", effectText: "Open shop access.", effect: { type: "none" } },
      { label: "⚔️ Ambush from shadows", effectText: "Trigger combat with advantage.", effect: { type: "combat", successEffect: { type: "gold", goldVal: 30 } } }
    ]
  },
  {
    title: "🪧 Ancient Signpost",
    desc: "A weathered signpost points in multiple directions with faded text.",
    stars: 1,
    choices: [
      { label: "🔍 Read the sign (INT check)", effectText: "Requires 11 INT. Success: preview next path. Fail: get nothing.", effect: { type: "stat_check", stat: "INT", threshold: 11, successEffect: { type: "xp", xpVal: 20 }, failEffect: { type: "none" } } },
      { label: "🚶 Ignore and push forward", effectText: "Keep moving.", effect: { type: "none" } }
    ]
  },
  {
    title: "🫐 Berry Thicket",
    desc: "A dense patch of wild berries grows along the trail.",
    stars: 1,
    choices: [
      { label: "🍇 Gather berries", effectText: "Heal 30% HP but risk Poison.", effect: { type: "hp_pct", hpPct: 0.3, successEffect: { type: "status", statusType: "poison", statusVal: 5, statusDur: 2 } } },
      { label: "🚶 Walk past", effectText: "Stay safe.", effect: { type: "none" } }
    ]
  },

  // ==========================================
  // LICH CASTLE EVENTS
  // ==========================================
  {
    title: "👑 Cursed Throne Room",
    desc: "A dark throne pulses with necrotic energy. Sitting on it could grant power at a cost.",
    stars: 3,
    choices: [
      { label: "👑 Sit on throne", effectText: "Gain +20% ATK buff but get Cursed (Poison 10 for 3 turns).", effect: { type: "status", statusType: "multiplier", statusVal: 20, statusDur: 3, successEffect: { type: "status", statusType: "poison", statusVal: 10, statusDur: 3 } } },
      { label: "🔨 Destroy the throne", effectText: "Gain 30 XP safely.", effect: { type: "xp", xpVal: 30 } }
    ]
  },
  {
    title: "📚 Library of Forbidden Tomes",
    desc: "Ancient books line the walls, some bound in strange leather.",
    stars: 2,
    choices: [
      { label: "📖 Study the tomes (INT check)", effectText: "Requires 12 INT. Success: gain skill insight (+30 XP). Fail: get Staggered.", effect: { type: "stat_check", stat: "INT", threshold: 12, successEffect: { type: "xp", xpVal: 30 }, failEffect: { type: "status", statusType: "stagger", statusVal: 1, statusDur: 1 } } },
      { label: "🔥 Burn the books", effectText: "Gain 20 XP and 1x Magic Bloom.", effect: { type: "xp", xpVal: 20, successEffect: { type: "item", itemId: "magic_bloom", quantity: 1 } } }
    ]
  },
  {
    title: "👻 Trapped Servant",
    desc: "A ghostly servant is chained to the wall, whispering for freedom.",
    stars: 2,
    choices: [
      { label: "🙏 Free the spirit (FTH check)", effectText: "Requires 12 FTH. Success: gain blessing (+15% DEF). Fail: lose 10 HP.", effect: { type: "stat_check", stat: "FTH", threshold: 12, successEffect: { type: "status", statusType: "shield", statusVal: 15, statusDur: 2 }, failEffect: { type: "hp", hpVal: -10 } } },
      { label: "⚡ Bind for power", effectText: "Gain +10% ATK but risk debuff.", effect: { type: "status", statusType: "multiplier", statusVal: 10, statusDur: 2, successEffect: { type: "status", statusType: "vulnerable", statusVal: 1, statusDur: 1 } } }
    ]
  },
  {
    title: "⚔️ Armory Relics",
    desc: "An armory filled with ancient weapons, some still gleaming.",
    stars: 2,
    choices: [
      { label: "⚔️ Claim a weapon", effectText: "Gain a random weapon item.", effect: { type: "item", itemId: "iron_sword", quantity: 1 } },
      { label: "🚶 Leave the armory", effectText: "Avoid possible curses.", effect: { type: "none" } }
    ]
  },
  {
    title: "🔮 Hidden Altar",
    desc: "A dark altar stands in a hidden chamber, offerings scattered around.",
    stars: 3,
    choices: [
      { label: "🩸 Sacrifice item for power", effectText: "Lose 1 random material, gain +1 Talent Point.", effect: { type: "talent_point", quantity: 1 } },
      { label: "🙏 Pray safely", effectText: "Heal 25 HP to all.", effect: { type: "hp", hpVal: 25 } }
    ]
  },
  {
    title: "🏚️ Collapsing Corridor",
    desc: "The ceiling groans, ready to collapse. You must move quickly.",
    stars: 2,
    choices: [
      { label: "🏃 Rush through (DEX check)", effectText: "Requires 12 DEX. Success: pass safely. Fail: lose 15 HP.", effect: { type: "stat_check", stat: "DEX", threshold: 12, successEffect: { type: "none" }, failEffect: { type: "hp", hpVal: -15 } } },
      { label: "🐢 Carefully navigate", effectText: "Safe but slow. Gain 10 XP.", effect: { type: "xp", xpVal: 10 } }
    ]
  },
  {
    title: "📜 Lich's Diary",
    desc: "A diary lies open on a lectern, detailing the lich's plans and weaknesses.",
    stars: 2,
    choices: [
      { label: "📖 Read the diary", effectText: "Gain 30 XP and insight on the boss.", effect: { type: "xp", xpVal: 30 } },
      { label: "🚶 Ignore it", effectText: "Press on.", effect: { type: "none" } }
    ]
  },

  // ==========================================
  // VOID EVENTS
  // ==========================================
  {
    title: "🌀 Void Rift Edge",
    desc: "A massive rift tears through reality. You must cross it.",
    stars: 3,
    choices: [
      { label: "🏃 Jump across (DEX check)", effectText: "Requires 13 DEX. Success: cross safely. Fail: lose 20 HP.", effect: { type: "stat_check", stat: "DEX", threshold: 13, successEffect: { type: "xp", xpVal: 30 }, failEffect: { type: "hp", hpVal: -20 } } },
      { label: "✨ Stabilize with magic (INT check)", effectText: "Requires 13 INT. Success: safer crossing. Fail: trigger combat.", effect: { type: "stat_check", stat: "INT", threshold: 13, successEffect: { type: "none" }, failEffect: { type: "combat" } } }
    ]
  },
  {
    title: "🤫 Whispering Void",
    desc: "Voices from the void whisper secrets and temptations.",
    stars: 3,
    choices: [
      { label: "🧠 Resist madness (FTH check)", effectText: "Requires 12 FTH. Success: gain 30 XP. Fail: get debuffed.", effect: { type: "stat_check", stat: "FTH", threshold: 12, successEffect: { type: "xp", xpVal: 30 }, failEffect: { type: "status", statusType: "vulnerable", statusVal: 1, statusDur: 2 } } },
      { label: "🌀 Succumb for power", effectText: "Gain +15% ATK but lose 15 HP.", effect: { type: "status", statusType: "multiplier", statusVal: 15, statusDur: 2, successEffect: { type: "hp", hpVal: -15 } } }
    ]
  },
  {
    title: "🌌 Floating Debris",
    desc: "Debris floats in the void, some of it valuable.",
    stars: 2,
    choices: [
      { label: "🔍 Salvage debris", effectText: "Gain 1x Voidstone Fragment.", effect: { type: "item", itemId: "voidstone_fragment", quantity: 1 } },
      { label: "🚶 Avoid the debris", effectText: "Stay safe.", effect: { type: "none" } }
    ]
  },
  {
    title: "🪞 Shadow Mirror",
    desc: "A mirror made of pure shadow reflects your party... but the reflection moves differently.",
    stars: 3,
    choices: [
      { label: "⚔️ Face the reflection", effectText: "Trigger combat. Reward: 2x Void Residue.", effect: { type: "combat", successEffect: { type: "item", itemId: "void_residue", quantity: 2 } } },
      { label: "🔮 Shatter the mirror (INT check)", effectText: "Requires 12 INT. Success: gain XP. Fail: lose 15 HP.", effect: { type: "stat_check", stat: "INT", threshold: 12, successEffect: { type: "xp", xpVal: 40 }, failEffect: { type: "hp", hpVal: -15 } } }
    ]
  },
  {
    title: "⚡ Energy Siphon",
    desc: "A void crystal pulses, draining life energy from everything nearby.",
    stars: 2,
    choices: [
      { label: "🩸 Sacrifice HP for Energy", effectText: "Lose 20 HP, gain 5 Energy to all party members.", effect: { type: "hp", hpVal: -20, successEffect: { type: "xp", xpVal: 20 } } },
      { label: "🛑 Destroy the crystal", effectText: "Rest safely.", effect: { type: "none" } }
    ]
  },
  {
    title: "📦 Corrupted Artifact",
    desc: "A powerful artifact pulses with corrupted energy.",
    stars: 3,
    choices: [
      { label: "⚡ Claim the artifact", effectText: "Gain Void Charm but risk curse.", effect: { type: "item", itemId: "void_charm", quantity: 1, successEffect: { type: "status", statusType: "poison", statusVal: 8, statusDur: 2 } } },
      { label: "🙏 Purify it (FTH check)", effectText: "Requires 12 FTH. Success: gain artifact safely. Fail: lose 15 HP.", effect: { type: "stat_check", stat: "FTH", threshold: 12, successEffect: { type: "item", itemId: "void_charm", quantity: 1 }, failEffect: { type: "hp", hpVal: -15 } } }
    ]
  },

  // ==========================================
  // PEACEFUL CITY EVENTS
  // ==========================================
  {
    title: "🍽️ Welcoming Feast",
    desc: "The villagers offer a grand feast to celebrate your arrival.",
    stars: 2,
    choices: [
      { label: "🍗 Join the feast", effectText: "Heal 40% HP but risk illusion debuff.", effect: { type: "hp_pct", hpPct: 0.4, successEffect: { type: "status", statusType: "stagger", statusVal: 1, statusDur: 1 } } },
      { label: "🚶 Politely decline", effectText: "Stay alert.", effect: { type: "none" } }
    ]
  },
  {
    title: "🏪 Market Stall",
    desc: "A bustling market with exotic goods from across the realm.",
    stars: 1,
    choices: [
      { label: "🛒 Trade normally", effectText: "Open shop at standard prices.", effect: { type: "none" } },
      { label: "🗣️ Haggle aggressively (CHA check)", effectText: "Requires 12 CHA. Success: discounts. Fail: combat.", effect: { type: "stat_check", stat: "CHA", threshold: 12, successEffect: { type: "gold", goldVal: 20 }, failEffect: { type: "combat" } } }
    ]
  },
  {
    title: "👥 Suspicious Villager",
    desc: "A villager keeps staring at your party and whispering.",
    stars: 2,
    choices: [
      { label: "🗣️ Interrogate them (CHA check)", effectText: "Requires 12 CHA. Success: gain info + XP. Fail: guards called.", effect: { type: "stat_check", stat: "CHA", threshold: 12, successEffect: { type: "xp", xpVal: 30 }, failEffect: { type: "combat" } } },
      { label: "🚶 Ignore them", effectText: "Move on.", effect: { type: "none" } }
    ]
  },
  {
    title: "🏦 Bank Vault",
    desc: "The city bank's vault door stands slightly ajar.",
    stars: 3,
    choices: [
      { label: "💰 Deposit gold for interest", effectText: "Gain 10% interest on gold (max 50).", effect: { type: "gold", goldVal: 20 } },
      { label: "🔓 Attempt to steal (DEX check)", effectText: "Requires 13 DEX. Success: gain 80 gold. Fail: trigger combat.", effect: { type: "stat_check", stat: "DEX", threshold: 13, successEffect: { type: "gold", goldVal: 80 }, failEffect: { type: "combat" } } }
    ]
  },
  {
    title: "🎭 Theater Performance",
    desc: "A traveling theater troupe performs a play about your adventures.",
    stars: 2,
    choices: [
      { label: "🎭 Watch the play", effectText: "Gain +15% ATK buff (inspired).", effect: { type: "status", statusType: "multiplier", statusVal: 15, statusDur: 2 } },
      { label: "🔍 Investigate backstage", effectText: "Gain 20 XP.", effect: { type: "xp", xpVal: 20 } }
    ]
  },

  // ==========================================
  // WHITE CITADEL EVENTS
  // ==========================================
  {
    title: "🗿 Angelic Statue",
    desc: "A towering angel statue weeps luminescent tears.",
    stars: 2,
    choices: [
      { label: "🙏 Pray at the statue (FTH check)", effectText: "Requires 12 FTH. Success: gain blessing. Fail: trigger combat.", effect: { type: "stat_check", stat: "FTH", threshold: 12, successEffect: { type: "status", statusType: "shield", statusVal: 20, statusDur: 2 }, failEffect: { type: "combat" } } },
      { label: "🔨 Deface the statue", effectText: "Gain 15 Gold from salvage.", effect: { type: "gold", goldVal: 15 } }
    ]
  },
  {
    title: "📜 Holy Archive",
    desc: "A library of sacred texts and fallen angel records.",
    stars: 2,
    choices: [
      { label: "📖 Study sacred texts (INT check)", effectText: "Requires 12 INT. Success: gain skill insight. Fail: lose 10 HP.", effect: { type: "stat_check", stat: "INT", threshold: 12, successEffect: { type: "xp", xpVal: 40 }, failEffect: { type: "hp", hpVal: -10 } } },
      { label: "🔥 Burn the archive", effectText: "Gain 20 XP and 1x Soul Thread.", effect: { type: "xp", xpVal: 20, successEffect: { type: "item", itemId: "soul_thread", quantity: 1 } } }
    ]
  },
  {
    title: "🎵 Fallen Choir",
    desc: "A choir of fallen angels sings a haunting melody.",
    stars: 2,
    choices: [
      { label: "🎵 Join the song (CHA check)", effectText: "Requires 12 CHA. Success: gain CHA buff. Fail: get debuffed.", effect: { type: "stat_check", stat: "CHA", threshold: 12, successEffect: { type: "status", statusType: "multiplier", statusVal: 10, statusDur: 3 }, failEffect: { type: "status", statusType: "stagger", statusVal: 1, statusDur: 1 } } },
      { label: "⚔️ Disrupt the choir", effectText: "Trigger combat.", effect: { type: "combat" } }
    ]
  },
  {
    title: "✨ Light Barrier",
    desc: "A barrier of holy light blocks the path forward.",
    stars: 2,
    choices: [
      { label: "🙏 Cross with faith (FTH check)", effectText: "Requires 12 FTH. Success: pass safely. Fail: lose 20 HP.", effect: { type: "stat_check", stat: "FTH", threshold: 12, successEffect: { type: "none" }, failEffect: { type: "hp", hpVal: -20 } } },
      { label: "💥 Force through (CON check)", effectText: "Requires 12 CON. Success: pass with damage. Fail: lose 25 HP.", effect: { type: "stat_check", stat: "CON", threshold: 12, successEffect: { type: "hp", hpVal: -10 }, failEffect: { type: "hp", hpVal: -25 } } }
    ]
  },
  {
    title: "🏆 Pride Trial",
    desc: "The citadel tests your pride. A mirror shows your greatest failure.",
    stars: 3,
    choices: [
      { label: "🧠 Accept the vision", effectText: "Gain +1 Talent Point but lose 20 HP.", effect: { type: "talent_point", quantity: 1, successEffect: { type: "hp", hpVal: -20 } } },
      { label: "🚶 Reject the trial", effectText: "Gain 20 XP.", effect: { type: "xp", xpVal: 20 } }
    ]
  },

  // ==========================================
  // DUNGEON EVENTS
  // ==========================================
  {
    title: "🕯️ Dark Corridor",
    desc: "A pitch-black corridor stretches ahead. You can light a torch or proceed in darkness.",
    stars: 1,
    choices: [
      { label: "🔥 Light a torch", effectText: "Reveal traps safely.", effect: { type: "none" } },
      { label: "🌑 Proceed in darkness (DEX check)", effectText: "Requires 11 DEX. Success: gain 15 XP. Fail: lose 10 HP.", effect: { type: "stat_check", stat: "DEX", threshold: 11, successEffect: { type: "xp", xpVal: 15 }, failEffect: { type: "hp", hpVal: -10 } } }
    ]
  },
  {
    title: "⚖️ Pressure Plate Puzzle",
    desc: "A series of pressure plates line the floor. Stepping on the wrong one triggers a trap.",
    stars: 2,
    choices: [
      { label: "🧠 Solve the puzzle (INT check)", effectText: "Requires 12 INT. Success: gain loot. Fail: trigger trap.", effect: { type: "stat_check", stat: "INT", threshold: 12, successEffect: { type: "item", itemId: "iron_ore", quantity: 3 }, failEffect: { type: "hp", hpVal: -15 } } },
      { label: "🚶 Bypass the room", effectText: "Skip the puzzle.", effect: { type: "none" } }
    ]
  },
  {
    title: "⚰️ Cursed Sarcophagus",
    desc: "An ornate sarcophagus sits in the center of the chamber.",
    stars: 2,
    choices: [
      { label: "🔓 Open the sarcophagus", effectText: "Gain 1x Ancient Bone but risk curse.", effect: { type: "item", itemId: "ancient_bone", quantity: 2, successEffect: { type: "status", statusType: "poison", statusVal: 5, statusDur: 2 } } },
      { label: "🔒 Seal it shut", effectText: "Safe.", effect: { type: "none" } }
    ]
  },
  {
    title: "🌊 Underground River",
    desc: "An underground river cuts through the dungeon. The current is strong.",
    stars: 1,
    choices: [
      { label: "🏊 Swim across (CON check)", effectText: "Requires 11 CON. Success: gain 10 XP. Fail: lose 10 HP.", effect: { type: "stat_check", stat: "CON", threshold: 11, successEffect: { type: "xp", xpVal: 10 }, failEffect: { type: "hp", hpVal: -10 } } },
      { label: "🌉 Find a bridge", effectText: "Safe but time-consuming.", effect: { type: "none" } }
    ]
  },
  {
    title: "🪤 Trap Room",
    desc: "A room full of trapped floor tiles and hidden dart launchers.",
    stars: 2,
    choices: [
      { label: "🔧 Disarm traps (DEX check)", effectText: "Requires 12 DEX. Success: gain loot. Fail: lose 15 HP.", effect: { type: "stat_check", stat: "DEX", threshold: 12, successEffect: { type: "item", itemId: "iron_ore", quantity: 2 }, failEffect: { type: "hp", hpVal: -15 } } },
      { label: "🛡️ Shield up and rush", effectText: "Lose 10 HP but pass.", effect: { type: "hp", hpVal: -10 } }
    ]
  },
  {
    title: "🧑‍🤝‍🧑 Lost Adventurer",
    desc: "A wounded adventurer is trapped under rubble.",
    stars: 2,
    choices: [
      { label: "💪 Rescue them (STR check)", effectText: "Requires 12 STR. Success: gain temp ally buff. Fail: lose 10 HP.", effect: { type: "stat_check", stat: "STR", threshold: 12, successEffect: { type: "xp", xpVal: 30 }, failEffect: { type: "hp", hpVal: -10 } } },
      { label: "🚶 Leave them", effectText: "Survival first.", effect: { type: "none" } }
    ]
  },

  // ==========================================
  // TRADING CITY EVENTS
  // ==========================================
  {
    title: "🏴 Black Market",
    desc: "A hidden market sells rare items at premium prices.",
    stars: 2,
    choices: [
      { label: "🪙 Browse rare items", effectText: "Spend 50 Gold for a random rare item.", effect: { type: "gold", goldVal: -50, successEffect: { type: "item", itemId: "void_charm", quantity: 1 } } },
      { label: "🗣️ Haggle for deals (CHA check)", effectText: "Requires 12 CHA. Success: discount. Fail: kicked out.", effect: { type: "stat_check", stat: "CHA", threshold: 12, successEffect: { type: "item", itemId: "iron_ore", quantity: 3 }, failEffect: { type: "none" } } }
    ]
  },
  {
    title: "📋 Guild Quest Board",
    desc: "A board full of quests and bounties posted by the Adventurer's Guild.",
    stars: 2,
    choices: [
      { label: "⚔️ Accept a bounty", effectText: "Trigger combat. Reward: 50 Gold.", effect: { type: "combat", successEffect: { type: "gold", goldVal: 50 } } },
      { label: "🚶 Decline", effectText: "Rest and move on.", effect: { type: "none" } }
    ]
  },
  {
    title: "🍺 Tavern Brawl",
    desc: "A fight breaks out in the local tavern. Your party gets caught in the middle.",
    stars: 2,
    choices: [
      { label: "⚔️ Join the brawl", effectText: "Trigger combat. Reward: 20 Gold.", effect: { type: "combat", successEffect: { type: "gold", goldVal: 20 } } },
      { label: "🗣️ Mediate (CHA check)", effectText: "Requires 12 CHA. Success: gain XP. Fail: dragged in.", effect: { type: "stat_check", stat: "CHA", threshold: 12, successEffect: { type: "xp", xpVal: 25 }, failEffect: { type: "combat" } } }
    ]
  },
  {
    title: "🚚 Caravan Escort Offer",
    desc: "A merchant needs guards for a dangerous route.",
    stars: 2,
    choices: [
      { label: "⚔️ Escort the caravan", effectText: "Trigger combat. Reward: 40 Gold.", effect: { type: "combat", successEffect: { type: "gold", goldVal: 40 } } },
      { label: "🚶 Decline", effectText: "Focus on your own journey.", effect: { type: "none" } }
    ]
  },
  {
    title: "🏛️ Auction House",
    desc: "A grand auction is underway. Rare items are on the block.",
    stars: 2,
    choices: [
      { label: "💰 Bid on an item (60 Gold)", effectText: "Spend 60 Gold for a random item.", effect: { type: "gold", goldVal: -60, successEffect: { type: "item", itemId: "gilded_broadsword", quantity: 1 } } },
      { label: "🚶 Watch as spectator", effectText: "Gain 10 XP from the spectacle.", effect: { type: "xp", xpVal: 10 } }
    ]
  },

  // ==========================================
  // SKY ISLAND EVENTS
  // ==========================================
  {
    title: "🪂 Floating Platform",
    desc: "A series of floating platforms drift across a massive chasm.",
    stars: 2,
    choices: [
      { label: "🏃 Jump across (DEX check)", effectText: "Requires 12 DEX. Success: cross safely. Fail: lose 15 HP.", effect: { type: "stat_check", stat: "DEX", threshold: 12, successEffect: { type: "xp", xpVal: 20 }, failEffect: { type: "hp", hpVal: -15 } } },
      { label: "🌀 Use wind magic (INT check)", effectText: "Requires 12 INT. Success: safe crossing. Fail: lose 10 HP.", effect: { type: "stat_check", stat: "INT", threshold: 12, successEffect: { type: "none" }, failEffect: { type: "hp", hpVal: -10 } } }
    ]
  },
  {
    title: "🏛️ Ancient Sky Temple",
    desc: "A temple built by a forgotten sky civilization floats nearby.",
    stars: 2,
    choices: [
      { label: "🔍 Explore the temple", effectText: "Gain 1x Chimera Feather.", effect: { type: "item", itemId: "chimera_feather", quantity: 1 } },
      { label: "🚶 Pass by", effectText: "No time to explore.", effect: { type: "none" } }
    ]
  },
  {
    title: "🪺 Harpy Nest",
    desc: "A massive harpy nest blocks the path, eggs visible within.",
    stars: 2,
    choices: [
      { label: "⚔️ Clear the nest", effectText: "Trigger combat. Reward: 2x Chimera Feather.", effect: { type: "combat", successEffect: { type: "item", itemId: "chimera_feather", quantity: 2 } } },
      { label: "🤝 Negotiate passage (CHA check)", effectText: "Requires 12 CHA. Success: pass safely. Fail: trigger combat.", effect: { type: "stat_check", stat: "CHA", threshold: 12, successEffect: { type: "none" }, failEffect: { type: "combat" } } }
    ]
  },
  {
    title: "🌉 Cloud Bridge",
    desc: "A bridge made of solid clouds spans between islands.",
    stars: 2,
    choices: [
      { label: "🚶 Cross carefully (DEX check)", effectText: "Requires 12 DEX. Success: cross safely. Fail: lose 15 HP.", effect: { type: "stat_check", stat: "DEX", threshold: 12, successEffect: { type: "xp", xpVal: 20 }, failEffect: { type: "hp", hpVal: -15 } } },
      { label: "✨ Reinforce with magic", effectText: "Use 1 Magic Bloom to reinforce. Safe crossing.", effect: { type: "gold", goldVal: -20, successEffect: { type: "none" } } }
    ]
  },
  {
    title: "🐉 Dragon Shrine",
    desc: "A shrine dedicated to an ancient sky dragon offers tribute rewards.",
    stars: 2,
    choices: [
      { label: "🪙 Offer tribute (30 Gold)", effectText: "Gain a blessing (+15% all stats for next combat).", effect: { type: "gold", goldVal: -30, successEffect: { type: "status", statusType: "multiplier", statusVal: 15, statusDur: 1 } } },
      { label: "🚶 Ignore the shrine", effectText: "Keep your gold.", effect: { type: "none" } }
    ]
  },

  // ==========================================
  // MYSTERIOUS LAB EVENTS
  // ==========================================
  {
    title: "🧪 Test Tube Puzzle",
    desc: "A lab bench has vials of colorful liquids. Mixing them correctly could yield a buff.",
    stars: 2,
    choices: [
      { label: "🧪 Mix chemicals (INT check)", effectText: "Requires 12 INT. Success: gain +20% ATK buff. Fail: get Poison.", effect: { type: "stat_check", stat: "INT", threshold: 12, successEffect: { type: "status", statusType: "multiplier", statusVal: 20, statusDur: 2 }, failEffect: { type: "status", statusType: "poison", statusVal: 8, statusDur: 2 } } },
      { label: "🚶 Leave the lab bench", effectText: "Don't risk it.", effect: { type: "none" } }
    ]
  },
  {
    title: "🔒 Containment Breach",
    desc: "Alarms blare as containment cells open. Monsters are loose!",
    stars: 3,
    choices: [
      { label: "⚔️ Contain the breach", effectText: "Trigger combat. Reward: 2x Void Residue.", effect: { type: "combat", successEffect: { type: "item", itemId: "void_residue", quantity: 2 } } },
      { label: "⚡ Exploit the chaos", effectText: "Gain 1x Toxin Gland from loose samples.", effect: { type: "item", itemId: "toxin_gland", quantity: 1 } }
    ]
  },
  {
    title: "📄 Scientist Notes",
    desc: "Notes scattered on a desk detail experiments and vulnerabilities.",
    stars: 2,
    choices: [
      { label: "📖 Read the notes (INT check)", effectText: "Requires 12 INT. Success: gain boss insight + XP. Fail: lose 5 HP.", effect: { type: "stat_check", stat: "INT", threshold: 12, successEffect: { type: "xp", xpVal: 40 }, failEffect: { type: "hp", hpVal: -5 } } },
      { label: "🔥 Burn the notes", effectText: "Gain 15 XP.", effect: { type: "xp", xpVal: 15 } }
    ]
  },
  {
    title: "⚡ Energy Core",
    desc: "A pulsating energy core powers the lab. It could be stabilized or extracted.",
    stars: 3,
    choices: [
      { label: "⚡ Extract the core", effectText: "Gain 1x Voidstone Fragment but risk explosion (25 HP damage).", effect: { type: "item", itemId: "voidstone_fragment", quantity: 1, successEffect: { type: "hp", hpVal: -25 } } },
      { label: "🛡️ Stabilize it", effectText: "Gain 30 XP safely.", effect: { type: "xp", xpVal: 30 } }
    ]
  },
  {
    title: "🧬 Mutant Chamber",
    desc: "A chamber contains mutated experiments. Some seem docile, others aggressive.",
    stars: 2,
    choices: [
      { label: "⚔️ Fight the mutants", effectText: "Trigger combat. Reward: 2x Toxin Gland.", effect: { type: "combat", successEffect: { type: "item", itemId: "toxin_gland", quantity: 2 } } },
      { label: "🏃 Sneak past (DEX check)", effectText: "Requires 12 DEX. Success: pass safely. Fail: trigger combat.", effect: { type: "stat_check", stat: "DEX", threshold: 12, successEffect: { type: "xp", xpVal: 20 }, failEffect: { type: "combat" } } }
    ]
  },

  // ==========================================
  // FRONTLINE EVENTS
  // ==========================================
  {
    title: "🛡️ Reinforce the Line",
    desc: "Soldiers are struggling to hold the front line against demon forces.",
    stars: 2,
    choices: [
      { label: "⚔️ Reinforce the soldiers", effectText: "Trigger combat. Reward: 30 Gold + 1x Iron Ore.", effect: { type: "combat", successEffect: { type: "gold", goldVal: 30, successEffect: { type: "item", itemId: "iron_ore", quantity: 1 } } } },
      { label: "🚶 Leave them to fight", effectText: "Save your strength.", effect: { type: "none" } }
    ]
  },
  {
    title: "📦 Supply Raid",
    desc: "A demon supply caravan passes through the area. Ambush opportunity!",
    stars: 2,
    choices: [
      { label: "⚔️ Raid the caravan", effectText: "Trigger combat. Reward: 2x Demon Blood Vial.", effect: { type: "combat", successEffect: { type: "item", itemId: "demon_blood_vial", quantity: 2 } } },
      { label: "🚶 Let it pass", effectText: "Avoid unnecessary risk.", effect: { type: "none" } }
    ]
  },
  {
    title: "📯 Commander Briefing",
    desc: "The frontline commander offers intel on the demon forces.",
    stars: 2,
    choices: [
      { label: "🗣️ Listen to briefing", effectText: "Gain 30 XP and boss intel.", effect: { type: "xp", xpVal: 30 } },
      { label: "🚶 Ignore the briefing", effectText: "Move out immediately.", effect: { type: "none" } }
    ]
  },
  {
    title: "🏥 Wounded Camp",
    desc: "A field hospital struggles to treat wounded soldiers.",
    stars: 1,
    choices: [
      { label: "💊 Help heal soldiers (FTH check)", effectText: "Requires 11 FTH. Success: gain morale buff. Fail: lose 5 HP.", effect: { type: "stat_check", stat: "FTH", threshold: 11, successEffect: { type: "status", statusType: "multiplier", statusVal: 10, statusDur: 2 }, failEffect: { type: "hp", hpVal: -5 } } },
      { label: "🚶 Pass by", effectText: "Keep moving.", effect: { type: "none" } }
    ]
  },
  {
    title: "🌀 Demonic Portal",
    desc: "A small demon portal spits out imps continuously.",
    stars: 2,
    choices: [
      { label: "⚔️ Close the portal", effectText: "Trigger combat. Reward: 1x Void Residue.", effect: { type: "combat", successEffect: { type: "item", itemId: "void_residue", quantity: 1 } } },
      { label: "🚶 Avoid the portal", effectText: "Don't engage.", effect: { type: "none" } }
    ]
  },

  // ==========================================
  // HORIZON CASTLE EVENTS
  // ==========================================
  {
    title: "⚔️ Siege Planning",
    desc: "The castle is heavily fortified. You need a plan to breach it.",
    stars: 3,
    choices: [
      { label: "🗣️ Plan a siege (INT check)", effectText: "Requires 13 INT. Success: gain advantage in boss fight. Fail: lose 15 HP.", effect: { type: "stat_check", stat: "INT", threshold: 13, successEffect: { type: "status", statusType: "shield", statusVal: 25, statusDur: 2 }, failEffect: { type: "hp", hpVal: -15 } } },
      { label: "🏃 Frontal assault", effectText: "Trigger combat. Push through.", effect: { type: "combat" } }
    ]
  },
  {
    title: "🏰 Castle Infiltration",
    desc: "A side passage offers a stealthy way into the castle.",
    stars: 2,
    choices: [
      { label: "🏃 Stealth approach (DEX check)", effectText: "Requires 12 DEX. Success: infiltrate safely. Fail: trigger combat.", effect: { type: "stat_check", stat: "DEX", threshold: 12, successEffect: { type: "xp", xpVal: 30 }, failEffect: { type: "combat" } } },
      { label: "⚔️ Smash the front gate", effectText: "Trigger combat immediately.", effect: { type: "combat" } }
    ]
  },
  {
    title: "🏆 Artifact Vault",
    desc: "The castle's treasure vault contains powerful artifacts.",
    stars: 3,
    choices: [
      { label: "🔓 Break into the vault", effectText: "Gain 1x random legendary item.", effect: { type: "item", itemId: "talisman_of_power", quantity: 1 } },
      { label: "🚶 Leave the vault", effectText: "It's too well guarded.", effect: { type: "none" } }
    ]
  },
  {
    title: "🤝 Ally Rally",
    desc: "Remaining allied forces are ready to help in the final assault.",
    stars: 2,
    choices: [
      { label: "📯 Rally the allies", effectText: "Gain +10% all stats for final battle.", effect: { type: "status", statusType: "multiplier", statusVal: 10, statusDur: 2 } },
      { label: "🚶 Go alone", effectText: "Avoid casualties.", effect: { type: "none" } }
    ]
  },
  {
    title: "🧹 Curse Removal",
    desc: "A purification font can cleanse your party of all negative effects before the final battle.",
    stars: 1,
    choices: [
      { label: "✨ Purify the party", effectText: "Remove all status effects. Heal 20% HP.", effect: { type: "hp_pct", hpPct: 0.2 } },
      { label: "🚶 Skip purification", effectText: "Save time.", effect: { type: "none" } }
    ]
  },
  {
    title: "🏕️ Final Camp",
    desc: "A safe spot to rest before the final confrontation. The air is heavy with anticipation.",
    stars: 1,
    choices: [
      { label: "🍲 Rest and prepare", effectText: "Full party heal and restore Energy.", effect: { type: "hp_pct", hpPct: 1.0 } },
      { label: "⚔️ Push forward now", effectText: "No rest. Face the boss immediately.", effect: { type: "none", message: "You march toward the final battle." } }
    ]
  },

  // ==========================================
  // PRE-BOSS REST EVENT (Always available before bosses)
  // ==========================================
  {
    title: "🛌 Rest Before the Storm",
    desc: "You sense a powerful presence ahead. This is your last chance to prepare before the boss fight.",
    stars: 1,
    choices: [
      { label: "🛌 Rest and recover", effectText: "Heal 50% Max HP to all party members.", effect: { type: "hp_pct", hpPct: 0.5 } },
      { label: "⚡ Prepare quickly", effectText: "Gain +10% ATK for next battle but only heal 20% HP.", effect: { type: "hp_pct", hpPct: 0.2, successEffect: { type: "status", statusType: "multiplier", statusVal: 10, statusDur: 1 } } },
      { label: "🔍 Scout the boss room", effectText: "Gain boss intel (+30 XP).", effect: { type: "xp", xpVal: 30 } }
    ]
  },

  // ==========================================
  // Boss Door Preview Event
  // ==========================================
  {
    title: "🚪 Boss Door",
    desc: "The door to the boss chamber looms before you. The air crackles with power.",
    stars: 3,
    choices: [
      { label: "🛌 Rest before entering", effectText: "Heal 50% Max HP before the fight.", effect: { type: "hp_pct", hpPct: 0.5 } },
      { label: "⚔️ Enter the boss room", effectText: "Face the boss immediately.", effect: { type: "combat" } },
      { label: "💪 Buff up (CON check)", effectText: "Requires 12 CON. Success: gain +15% DEF for boss fight.", effect: { type: "stat_check", stat: "CON", threshold: 12, successEffect: { type: "status", statusType: "shield", statusVal: 15, statusDur: 1 }, failEffect: { type: "none" } } }
    ]
  }
];
