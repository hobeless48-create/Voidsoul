import React, { useState } from "react";

// ===== GUIDE DATA =====

interface GuideSection {
  id: string;
  label: string;
  icon: string;
  content: React.ReactNode;
}

const GAME_FLOW_DIAGRAM = `
LOBBY → MAP → BATTLE → CAMP → MAP → ... → VICTORY
  (Tavern)  (Choose  (Combat)  (Rest,      ↓
            path)              Craft)   GAMEOVER
                                         (Party wipe)
`;

const CHAPTER_MAP_DIAGRAM = `
Forest (Ch1, 8 areas)
  ↓ Choose Path
  ├── Cave (Ch2) → Abandoned Trail (Ch3)
  │     ↓ Choose Path
  │     ├── Lich Castle (Ch4) → Void (Ch5)
  │     └── Peaceful City (Ch4) → White Citadel (Ch5)
  └── Dungeon (Ch2) → Trading City (Ch3)
        ↓ Choose Path
        ├── Sky Island (Ch4) → Mysterious Lab (Ch5)
        └── Frontline (Ch4) → Horizon Castle (Ch5)
`;

const sections: GuideSection[] = [
  {
    id: "story",
    label: "Story",
    icon: "📖",
    content: (
      <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
        <p>
          In the shadowed annals of Eldrath, where ancient kingdoms cling to fragile peace,
          a band of unlikely heroes first crossed paths amid the clamor of the frontier town of Thornvale.
          Drawn together by fate and necessity — a wandering warrior seeking lost honor,
          a sharp-eyed rogue chasing rumors of forgotten treasure, a devout cleric answering a divine calling,
          and others bound by their own secrets — they formed a fragile pact.
        </p>
        <p>
          Whispers had spread through the taverns: the Glimmering Woods, once a verdant passage between realms,
          now lay corrupted. Shadow magic seeped from long-sealed catacombs beneath its roots, twisting beasts
          and birthing horrors. Caravans vanished, villages trembled, and the king's call for brave souls
          carried a handsome reward.
        </p>
        <p>
          With little coin and fewer choices, the party shouldered their packs and stepped beneath the ancient canopy.
          The trees here glowed with an eerie, ethereal light, their leaves shimmering like captured starlight.
          Yet beneath the beauty lurked unease. Ancient trunks groaned warnings carried on the wind,
          while distant goblin laughter echoed through the mist.
        </p>
        <p className="text-amber-400 font-medium">
          Their first steps into the Glimmering Woods would set in motion a grand adventure that will test their bonds,
          awaken hidden powers, and decide the fate of realms beyond...
        </p>
      </div>
    ),
  },
  {
    id: "flow",
    label: "Game Flow",
    icon: "🔄",
    content: (
      <div className="space-y-3 text-slate-300 text-sm">
        <h3 className="text-cyan-400 font-bold text-base">Core Loop</h3>
        <pre className="bg-slate-800/50 p-3 rounded text-xs font-mono text-slate-300 whitespace-pre-wrap">{GAME_FLOW_DIAGRAM}</pre>
        <div className="space-y-2">
          <p><span className="text-amber-400 font-bold">LOBBY:</span> Create/select characters, form your party (up to 4 heroes), manage talents and gear.</p>
          <p><span className="text-amber-400 font-bold">MAP:</span> Choose between 3 paths per area — combat, elite combat, events, or merchant. Progress lane by lane.</p>
          <p><span className="text-amber-400 font-bold">BATTLE:</span> Turn-based tactical combat on a 3x3 grid. Defeat all enemies to win.</p>
          <p><span className="text-amber-400 font-bold">CAMP:</span> Rest to heal 30% HP, craft gear, buy/sell items, deposit gold into stash.</p>
          <p><span className="text-amber-400 font-bold">PROMOTION:</span> At level 15, 30, 50, and 75 you can advance to a more powerful class.</p>
        </div>

        <h3 className="text-cyan-400 font-bold text-base mt-4">Chapter Map</h3>
        <pre className="bg-slate-800/50 p-3 rounded text-xs font-mono text-slate-300 whitespace-pre-wrap">{CHAPTER_MAP_DIAGRAM}</pre>
        <p>Each chapter has <span className="text-slate-100">5 areas</span> (Forest has 8). Clear the boss at the end to progress to the next chapter.</p>

        <h3 className="text-cyan-400 font-bold text-base mt-4">Victory / Defeat</h3>
        <p>Defeat the final boss of Chapter 5 to win the campaign. If all characters drop to 0 HP, you face defeat. Fallen characters gain <span className="text-red-400">Fallen Stacks</span> (max 3; 4th stack = permanent death).</p>
      </div>
    ),
  },
  {
    id: "battle",
    label: "Battle",
    icon: "⚔️",
    content: (
      <div className="space-y-3 text-slate-300 text-sm">
        <h3 className="text-cyan-400 font-bold text-base">Turn-Based Combat</h3>
        <p>Every combatant rolls <span className="text-slate-100">Initiative</span> at battle start. Support classes get +3 bonus. Turn order is determined by initiative value descending.</p>

        <h3 className="text-cyan-400 font-bold text-base mt-3">Grid Positioning</h3>
        <p>Your party uses a <span className="text-slate-100">3x3 grid</span> (columns 1-3, rows 1-3). Column 1 = Frontline, Column 3 = Backline. </p>
        <p className="text-yellow-400">Warrior classes CANNOT stand on Column 3 (melee range limits).</p>

        <h3 className="text-cyan-400 font-bold text-base mt-3">Actions</h3>
        <ul className="list-disc list-inside space-y-1 text-slate-400">
          <li><span className="text-slate-100">Fight</span> — Use a skill on a target enemy (costs Energy)</li>
          <li><span className="text-slate-100">Focus</span> — Recover Energy and gain a shield</li>
          <li><span className="text-slate-100">Items</span> — Use consumables from inventory</li>
        </ul>

        <h3 className="text-cyan-400 font-bold text-base mt-3">Defense & Damage</h3>
        <ul className="list-disc list-inside space-y-1 text-slate-400">
          <li><span className="text-slate-100">DEF</span> reduces incoming damage flatly (min 1 damage)</li>
          <li><span className="text-slate-100">Block</span> (STR/CON based) reduces damage further</li>
          <li><span className="text-slate-100">Dodge</span> is capped at 30% max</li>
          <li><span className="text-slate-100">Shield</span> buff absorbs damage before HP</li>
          <li><span className="text-slate-100">Guard</span> stance halves incoming damage and doubles block</li>
        </ul>

        <h3 className="text-cyan-400 font-bold text-base mt-3">Status Effects</h3>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <span className="text-orange-400">🔥 Burn</span>
          <span className="text-green-400">🌿 Poison</span>
          <span className="text-red-400">🩸 Bleed</span>
          <span className="text-emerald-400">💚 Regen</span>
          <span className="text-purple-400">🛡️ Shield</span>
          <span className="text-yellow-400">🎯 Taunt</span>
          <span className="text-blue-300">💫 Stagger/Stun</span>
          <span className="text-red-300">⚠️ Vulnerable (+50% dmg)</span>
          <span className="text-orange-300">🔽 Crippled (-25% dmg)</span>
          <span className="text-sky-400">🛡️ Dodge Up</span>
        </div>
      </div>
    ),
  },
  {
    id: "classes",
    label: "Classes",
    icon: "🎭",
    content: (
      <div className="space-y-3 text-slate-300 text-sm">
        <h3 className="text-cyan-400 font-bold text-base">Base Classes (6)</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-800/50 p-2 rounded">
            <span className="text-red-400 font-bold">Warrior</span>
            <p className="text-xs text-slate-400">STR/CON tank. Shield, taunt, melee DPS.</p>
          </div>
          <div className="bg-slate-800/50 p-2 rounded">
            <span className="text-green-400 font-bold">Archer</span>
            <p className="text-xs text-slate-400">DEX ranged. Single target, AoE, crits.</p>
          </div>
          <div className="bg-slate-800/50 p-2 rounded">
            <span className="text-blue-400 font-bold">Mage</span>
            <p className="text-xs text-slate-400">INT caster. AoE, burn, energy management.</p>
          </div>
          <div className="bg-slate-800/50 p-2 rounded">
            <span className="text-yellow-300 font-bold">Cleric</span>
            <p className="text-xs text-slate-400">FTH healer. Damage, shields, cleanse.</p>
          </div>
          <div className="bg-slate-800/50 p-2 rounded">
            <span className="text-purple-400 font-bold">Rogue</span>
            <p className="text-xs text-slate-400">DEX/LCK. Bleed, poison, evasion.</p>
          </div>
          <div className="bg-slate-800/50 p-2 rounded">
            <span className="text-pink-400 font-bold">Bard</span>
            <p className="text-xs text-slate-400">CHA support. Buffs, regen, debuffs.</p>
          </div>
        </div>

        <h3 className="text-cyan-400 font-bold text-base mt-3">Advanced Classes (Lv15+)</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Warrior → <span className="text-red-300">Berserker</span> / <span className="text-blue-300">Knight</span></div>
          <div>Archer → <span className="text-green-300">Sharpshooter</span> / <span className="text-cyan-300">Bolt Slinger</span></div>
          <div>Mage → <span className="text-orange-300">Elementalist</span> / <span className="text-purple-300">Summoner</span></div>
          <div>Cleric → <span className="text-yellow-300">High Priest</span> / <span className="text-red-300">Inquisitor</span></div>
          <div>Rogue → <span className="text-purple-300">Assassin</span> / <span className="text-blue-300">Duelist</span></div>
          <div>Bard → <span className="text-amber-300">Bard of Valor</span> / <span className="text-pink-300">Bard of Chaos</span></div>
        </div>

        <h3 className="text-cyan-400 font-bold text-base mt-3">Tier 3 Classes (Lv30+)</h3>
        <p className="text-xs text-slate-400">Each advanced class upgrades further: Warlord/Paladin, Hawkeye/Storm Dancer, Archmage/Void Caller, Seraph/Crusader, Phantom/Blade Saint, Herald of Glory/Entropy Singer.</p>

        <h3 className="text-cyan-400 font-bold text-base mt-3">Skill Scaling</h3>
        <p className="text-xs text-slate-400">Damage/healing = base formula (class-dependent) × skill multiplier. Each class scales with different stats — e.g. Warrior uses STR×1.2 + CON×0.6, Mage uses INT×1.5.</p>
      </div>
    ),
  },
  {
    id: "items",
    label: "Items & Crafting",
    icon: "🔨",
    content: (
      <div className="space-y-3 text-slate-300 text-sm">
        <h3 className="text-cyan-400 font-bold text-base">Equipment Slots</h3>
        <p className="text-xs">10 slots: Weapon, Offhand, Helmet, Chestplate, Leggings, Boots, Ring, Bracelet, Necklace, Charm.</p>

        <h3 className="text-cyan-400 font-bold text-base mt-3">16 Crafting Materials</h3>
        <div className="grid grid-cols-2 gap-y-1 gap-x-3 text-xs">
          <span>🪨 Iron Ore</span><span>🐺 Wolf Pelt</span>
          <span>🌸 Magic Bloom</span><span>🦴 Ancient Bone</span>
          <span>💎 Voidstone Fragment</span><span>🩸 Demon Blood Vial</span>
          <span>🧵 Soul Thread</span><span>✨ Blessed Silk</span>
          <span>❄️ Glacial Shard</span><span>🕷️ Shadow Silk</span>
          <span>🔥 Ember Core</span><span>🪶 Chimera Feather</span>
          <span>🌙 Moonsilk Thread</span><span>🧪 Toxin Gland</span>
          <span>🌀 Void Residue</span><span>🌋 Volcanic Ash</span>
        </div>
        <p className="text-xs text-slate-500">Materials drop from specific enemies in different chapters. Craft at camp!</p>

        <h3 className="text-cyan-400 font-bold text-base mt-3">Crafting at Camp</h3>
        <p>During the Camp phase, use the <span className="text-amber-400">Blacksmith</span> to craft weapons, armor, and accessories. Recipes are hidden until you have at least 1 of any ingredient needed.</p>
        <p className="text-xs text-slate-400">70+ recipes: from basic Iron Sword (3 Iron + 1 Pelt) to legendary Talisman of Power (3 Iron + 3 Pelt + 3 Bloom + 3 Bone).</p>

        <h3 className="text-cyan-400 font-bold text-base mt-3">Consumables</h3>
        <p className="text-xs">Healing potions, energy brews, status items (poison/stun/burn/freeze), stat potions, and special revival items (Phoenix Feather). Buy from merchants or craft at camp.</p>
      </div>
    ),
  },
  {
    id: "talents",
    label: "Talents",
    icon: "⭐",
    content: (
      <div className="space-y-3 text-slate-300 text-sm">
        <h3 className="text-cyan-400 font-bold text-base">Talent Points (TP)</h3>
        <p>Earn <span className="text-yellow-400">1 Talent Point per level</span> starting with 3 at Level 1. Spend them on class-specific talent trees.</p>

        <h3 className="text-cyan-400 font-bold text-base mt-3">Talent Trees</h3>
        <p>Each base class has a <span className="text-slate-100">10-node talent tree</span> with paths and upgrades:</p>
        <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
          <li>Node 1 is <span className="text-emerald-400">free</span> (0 TP)</li>
          <li>Nodes 2-9 cost 1 TP + number of already-unlocked nodes</li>
          <li>Node 10 (Ultimate) costs 2 TP + number of unlocked nodes</li>
          <li>Must unlock at least one parent node before purchasing a child</li>
        </ul>
        <p className="text-xs text-slate-500">Talent points and unlocks are tracked per class. Switching classes swaps your talent config instantly.</p>

        <h3 className="text-cyan-400 font-bold text-base mt-3">Notable Ultimate Talents</h3>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <span className="text-red-400">Warrior:</span><span>Titan's Legacy (counter-attack on block/dodge)</span>
          <span className="text-green-400">Archer:</span><span>Grand Execution (crits shred DEF)</span>
          <span className="text-blue-400">Mage:</span><span>Cataclysm (AoE stagger chance)</span>
          <span className="text-yellow-300">Cleric:</span><span>Miraculous Favor (+20% healing/shields)</span>
          <span className="text-purple-400">Rogue:</span><span>Reaper's Mark (+30% crit vs low HP)</span>
          <span className="text-pink-400">Bard:</span><span>Grand Finale (ally kill = +1 energy for all)</span>
        </div>
      </div>
    ),
  },
  {
    id: "races",
    label: "Races",
    icon: "🧬",
    content: (
      <div className="space-y-3 text-slate-300 text-sm">
        <h3 className="text-cyan-400 font-bold text-base">Choose Your Race</h3>
        <p>Each race has unique traits and trade-offs. Available during character creation in the Lobby.</p>

        <div className="space-y-2 text-xs">
          <div className="bg-slate-800/50 p-2 rounded">
            <span className="text-slate-100 font-bold">🧑 Human</span> — +1 stat point per level. No disadvantage.
          </div>
          <div className="bg-slate-800/50 p-2 rounded">
            <span className="text-green-300 font-bold">🧝 Elf</span> — +20% crit chance & damage. 50% chance to double material drops. Takes <span className="text-red-400">×2 Poison damage</span>.
          </div>
          <div className="bg-slate-800/50 p-2 rounded">
            <span className="text-blue-300 font-bold">⛰️ Dwarf</span> — +10% max HP. Crafted items gain +10% stats per 10 levels. No disadvantage.
          </div>
          <div className="bg-slate-800/50 p-2 rounded">
            <span className="text-red-300 font-bold">🐉 Dragonborn</span> — +10% STR. DEF +20% or +8 (whichever higher). Takes <span className="text-red-400">×2 Bleed damage</span>.
          </div>
          <div className="bg-slate-800/50 p-2 rounded">
            <span className="text-amber-300 font-bold">👺 Goblin</span> — +25% gold gains (party). +1 initiative. No disadvantage.
          </div>
          <div className="bg-slate-800/50 p-2 rounded">
            <span className="text-purple-300 font-bold">🧛 Vampire</span> — 20% lifesteal on all damage. <span className="text-red-400">-20% final stats</span>.
          </div>
          <div className="bg-slate-800/50 p-2 rounded">
            <span className="text-pink-300 font-bold">💋 Succubus</span> — +25% CHA. Reduces event stat check thresholds by 20% (party). <span className="text-red-400">-20% HP. ×2 Burn damage</span>.
          </div>
          <div className="bg-slate-800/50 p-2 rounded">
            <span className="text-emerald-300 font-bold">🌿 Dryad</span> — +20% outgoing healing. +10% EXP gain (party). <span className="text-red-400">×2 Burn damage</span>.
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "events",
    label: "Events",
    icon: "🎲",
    content: (
      <div className="space-y-3 text-slate-300 text-sm">
        <h3 className="text-cyan-400 font-bold text-base">Narrative Events</h3>
        <p>When you land on an <span className="text-yellow-400">event node</span> on the map, a story card is drawn. Each card presents <span className="text-slate-100">2-3 choices</span> with different outcomes.</p>

        <h3 className="text-cyan-400 font-bold text-base mt-3">Stat Checks</h3>
        <p>Many choices test your party's stats: STR, DEX, CON, INT, FTH, CHA, or LCK. The system compares the <span className="text-slate-100">highest stat value in your party</span> against a threshold.</p>
        <ul className="list-disc list-inside text-xs text-slate-400">
          <li>Success: gain the reward</li>
          <li>Failure: face the consequence (damage, debuff, or combat)</li>
        </ul>

        <h3 className="text-cyan-400 font-bold text-base mt-3">70+ Events</h3>
        <p className="text-xs">Spread across all areas: Forest mysteries, cave collapses, goblin ambushes, lich castle curses, void rifts, city intrigues, sky temples, lab experiments, and more.</p>

        <h3 className="text-cyan-400 font-bold text-base mt-3">Multiplayer Voting</h3>
        <p>In P2P mode, all players vote on which choice to take. When <span className="text-slate-100">50%+</span> have voted, a 5-second countdown starts. The majority choice wins and resolves for the entire party.</p>

        <h3 className="text-cyan-400 font-bold text-base mt-3">Pre-Boss Rest</h3>
        <p>Before every boss room, you'll always get a rest choice: heal 50% HP, prepare (+10% ATK), or scout (+30 XP). Choose wisely!</p>
      </div>
    ),
  },
  {
    id: "p2p",
    label: "Multiplayer",
    icon: "🌐",
    content: (
      <div className="space-y-3 text-slate-300 text-sm">
        <h3 className="text-cyan-400 font-bold text-base">Peer-to-Peer Mode</h3>
        <p>Play with friends in P2P mode! One player acts as <span className="text-yellow-400">host</span>, others join via the lobby.</p>

        <h3 className="text-cyan-400 font-bold text-base mt-3">How It Works</h3>
        <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
          <li>Host creates a room — other players can join</li>
          <li>Each player controls their own character in battle</li>
          <li>Host handles enemy AI and turn order</li>
          <li>Non-host players take their own turns and broadcast actions</li>
          <li>Voting system for map nodes and event choices</li>
          <li>Shared gold and stash between all players</li>
          <li>PvP? No — it's co-op only! Work together to beat the campaign.</li>
        </ul>

        <h3 className="text-cyan-400 font-bold text-base mt-3">Voting</h3>
        <p>Map nodes and event choices use majority voting. The host sees the countdown and the choice with the most votes is automatically selected.</p>

        <h3 className="text-cyan-400 font-bold text-base mt-3">Important</h3>
        <p className="text-xs text-slate-400">All players must be in the same room and connected. If a player disconnects, the host can kick them or wait for reconnection.</p>
      </div>
    ),
  },
];

// ===== COMPONENT =====

export function HelpGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("story");

  // Close on ESC key
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  const activeSection = sections.find((s) => s.id === activeTab) || sections[0];

  return (
    <>
      {/* Floating circular button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 
          hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-amber-500/30 
          flex items-center justify-center text-2xl transition-all duration-200
          active:scale-95 hover:scale-105 border-2 border-amber-300/30"
        title="Help Guide"
      >
        ?
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📚</span>
                <h2 className="text-lg font-bold text-amber-400 font-mono tracking-wide uppercase">
                  Game Guide
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-1 min-h-0">
              {/* Tab sidebar */}
              <div className="w-44 flex-shrink-0 bg-slate-900/30 border-r border-slate-700/50 overflow-y-auto p-2 space-y-1">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setActiveTab(sec.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                      activeTab === sec.id
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                    }`}
                  >
                    <span className="text-base">{sec.icon}</span>
                    <span>{sec.label}</span>
                  </button>
                ))}
              </div>

              {/* Content area */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-none">{activeSection.content}</div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-700/50 bg-slate-900/30 text-[10px] text-slate-600 text-center">
              Press <span className="text-slate-400">ESC</span> or click outside to close
            </div>
          </div>
        </div>
      )}
    </>
  );
}
