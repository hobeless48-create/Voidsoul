/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Item, Character, StoryTemplate } from "../types";
import { ITEMS_DATABASE } from "../items_db";
import { MYSTERY_STORIES } from "../events_db";
import { getChapterDisplayName, getChapterEmoji, getChapterDescription, getChapterBackgroundUrl } from "../enemies_db";
import {
  Compass,
  BookOpen,
  ShoppingBag,
  Swords,
  Gift,
  ShieldAlert,
} from "lucide-react";

interface ChapterTheme {
  borderColor: string;
  bgColor: string;
  glowColor: string;
  name: string;
  description: string;
  emoji: string;
}

const getChapterTheme = (chapter: number, way: number, path: number): ChapterTheme => {
  const borderColors: Record<string, string> = {
    "1": "border-emerald-500/30",
    "2_1": "border-stone-500/30",
    "2_2": "border-red-500/30",
    "3_1": "border-amber-500/30",
    "3_2": "border-yellow-500/30",
    "4_1_1": "border-purple-500/30",
    "4_1_2": "border-rose-500/30",
    "4_2_1": "border-cyan-500/30",
    "4_2_2": "border-orange-500/30",
    "5_1_1": "border-indigo-500/30",
    "5_1_2": "border-sky-500/30",
    "5_2_1": "border-lime-500/30",
    "5_2_2": "border-violet-500/30",
  };
  const bgColors: Record<string, string> = {
    "1": "bg-emerald-950/20",
    "2_1": "bg-stone-950/20",
    "2_2": "bg-red-950/20",
    "3_1": "bg-amber-950/20",
    "3_2": "bg-yellow-950/20",
    "4_1_1": "bg-purple-950/20",
    "4_1_2": "bg-rose-950/20",
    "4_2_1": "bg-cyan-950/20",
    "4_2_2": "bg-orange-950/20",
    "5_1_1": "bg-indigo-950/20",
    "5_1_2": "bg-sky-950/20",
    "5_2_1": "bg-lime-950/20",
    "5_2_2": "bg-violet-950/20",
  };
  const glowColors: Record<string, string> = {
    "1": "shadow-emerald-500/5",
    "2_1": "shadow-stone-500/5",
    "2_2": "shadow-red-500/5",
    "3_1": "shadow-amber-500/5",
    "3_2": "shadow-yellow-500/5",
    "4_1_1": "shadow-purple-500/5",
    "4_1_2": "shadow-rose-500/5",
    "4_2_1": "shadow-cyan-500/5",
    "4_2_2": "shadow-orange-500/5",
    "5_1_1": "shadow-indigo-500/5",
    "5_1_2": "shadow-sky-500/5",
    "5_2_1": "shadow-lime-500/5",
    "5_2_2": "shadow-violet-500/5",
  };
  const key = chapter === 1 ? "1" : `${chapter}_${way}${chapter >= 4 ? `_${path}` : ""}`;
  return {
    borderColor: borderColors[key] || "border-slate-500/30",
    bgColor: bgColors[key] || "bg-slate-950/20",
    glowColor: glowColors[key] || "shadow-slate-500/5",
    name: getChapterDisplayName(chapter, way, path),
    description: getChapterDescription(chapter, way, path),
    emoji: getChapterEmoji(chapter, way, path),
  };
};

export interface MapNode {
  type: "combat" | "elite_combat" | "event" | "shop" | "rest" | "boss";
  stars: number;
  label: string;
}

interface MapEventListProps {
  chapter: number;
  area: number;
  maxArea: number;
  way: number;
  path: number;
  availableNodes: MapNode[];
  onSelectNode: (node: MapNode) => void;
  gold: number;
  inventory: Item[];
  onUpdateInventory: (updatedInv: Item[]) => void;
  onUpdateGold: (updatedGold: number) => void;
  party: Character[];
  onUpdateParty: (updatedParty: Character[]) => void;

  // Lifted story, shop, and voting props
  activeStoryIndex: number | null;
  setActiveStoryIndex: (idx: number | null) => void;
  activeShopOpen: boolean;
  setActiveShopOpen: (open: boolean) => void;
  p2pMode: "solo" | "multiplayer";
  votes: Record<string, string>;
  countdown: number | null;
  castVote: (choiceId: string) => void;
  executeStoryChoice: (storyIdx: number, choiceIdx: number) => void;
  myPlayerId?: string;

  // Continue voting props
  continueVotes?: string[];
  continueCountdown?: number | null;
  castContinueVote?: () => void;
}

export function MapEventList({
  chapter,
  area,
  maxArea,
  way,
  path,
  availableNodes,
  onSelectNode,
  gold,
  inventory,
  onUpdateInventory,
  onUpdateGold,
  party,
  onUpdateParty,
  activeStoryIndex,
  setActiveStoryIndex,
  activeShopOpen,
  setActiveShopOpen,
  p2pMode,
  votes,
  countdown,
  castVote,
  executeStoryChoice,
  myPlayerId = "",
  continueVotes = [],
  continueCountdown = null,
  castContinueVote,
}: MapEventListProps) {
  const activeStory =
    activeStoryIndex !== null ? MYSTERY_STORIES[activeStoryIndex] : null;

  const buyerId = p2pMode === "multiplayer" ? myPlayerId : party[0]?.id || "";
  const buyerChar = party.find((p) => p.id === buyerId) || party[0];
  const activeCharInv = buyerChar?.inventory || [];

  // Generate random shop items each time shop is opened
  const generateShopWares = (): string[] => {
    // Regular consumables and materials pool
    const regularItems = [
      "minor_heal",
      "major_heal",
      "regeneration_elixir",
      "energy_brew",
      "iron_ore",
      "wolf_pelt",
      "magic_bloom",
      "lucky_clover",
      "antidote",
      "stun_cure",
      "burn_cure",
      "freeze_cure",
      "shock_cure",
      "poison_vial",
      "stun_grenade",
      "burn_powder",
      "freeze_crystal",
      "shock_orb",
      "strength_potion",
      "dexterity_potion",
      "constitution_potion",
      "intelligence_potion",
      "faith_potion",
      "charisma_potion",
      "luck_potion",
    ];

    // Special shop items pool (the 35 items we added)
    const specialItems = [
      "cursed_blade_of_vareth",
      "stormreaver_longbow",
      "soulflame_grimoire",
      "seraphs_judgment_hammer",
      "phantom_eclipse_dagger",
      "entropys_lament_lyre",
      "warlords_titan_cleaver",
      "riftweaver_staff",
      "abyssal_sovereign_plate",
      "starweaver_robes",
      "wraithsilk_shroud",
      "divine_seraph_vestments",
      "volcanic_fury_greaves",
      "eaglelord_winged_boots",
      "dread_sovereign_helm",
      "voidwalker_crown",
      "ring_of_eternal_fury",
      "seraphs_tear_of_life",
      "phantom_mirror_pendant",
      "dragonheart_core_amulet",
      "luckweavers_fate_thread",
      "void_anchor_of_stability",
      "crusaders_unbreakable_oath",
      "hawkeyes_eternal_focus",
      "phoenix_rebirth_charm",
      "archdemon_essence_vial",
      "void_power_crystal",
      "alliance_holy_blessing",
      "demon_eye_of_true_sight",
      "chaos_elixir_of_transcendence",
      // Boss accessories — chapter boss-themed, shop-exclusive
      "timbergiant_heartwood_core",
      "bone_drake_skeletal_wing",
      "archdemon_smoldering_horn",
      "vareth_soul_crystal",
    ];

    // Select 1 random special item (locked, special equipment)
    const specialIndex = Math.floor(Math.random() * specialItems.length);
    const selectedSpecialItem = specialItems[specialIndex];

    // Select 9 random regular items (total 10 items in shop)
    const selectedRegularItems: string[] = [];
    while (selectedRegularItems.length < 9) {
      const randomIndex = Math.floor(Math.random() * regularItems.length);
      const randomItem = regularItems[randomIndex];
      if (!selectedRegularItems.includes(randomItem)) {
        selectedRegularItems.push(randomItem);
      }
    }

    return [selectedSpecialItem, ...selectedRegularItems];
  };

  // Shop wares - generate random items
  const [shopWares, setShopWares] = useState<string[]>([]);

  // Generate shop items when shop opens
  useEffect(() => {
    if (activeShopOpen) {
      setShopWares(generateShopWares());
    }
  }, [activeShopOpen]);

  const handleBuyShopWare = (itemId: string) => {
    const item = ITEMS_DATABASE[itemId];
    if (!item) return;

    if (!buyerChar) return;

    if (gold >= item.value) {
      onUpdateGold(gold - item.value);
      const existing = activeCharInv.findIndex((i) => i.id === itemId);
      let updatedInv = [...activeCharInv];
      if (existing !== -1 && updatedInv[existing].quantity) {
        updatedInv[existing].quantity!++;
      } else {
        updatedInv.push({ ...item, quantity: 1 });
      }

      const nextParty = party.map((p) => {
        if (p.id === buyerChar.id) {
          return { ...p, inventory: updatedInv };
        }
        return p;
      });
      onUpdateParty(nextParty);

      if ((window as any).showNotification) {
        (window as any).showNotification(
          `✓ Purchased ${item.name}!`,
          "success",
        );
      }
    } else {
      if ((window as any).showNotification) {
        (window as any).showNotification("✗ Insufficient Gold!", "error");
      }
    }
  };

  const handleSelectNodeOrVote = (node: MapNode, idx: number) => {
    if (p2pMode === "multiplayer") {
      castVote(`node_${idx}`);
    } else {
      if (node.type === "event") {
        const rng = Math.floor(Math.random() * MYSTERY_STORIES.length);
        setActiveStoryIndex(rng);
      } else if (node.type === "shop") {
        setActiveShopOpen(true);
      } else {
        onSelectNode(node);
      }
    }
  };

  const handleSelectStoryChoiceOrVote = (choiceIdx: number) => {
    if (p2pMode === "multiplayer") {
      castVote(`story_${choiceIdx}`);
    } else {
      if (activeStoryIndex !== null) {
        executeStoryChoice(activeStoryIndex, choiceIdx);
      }
    }
  };

  const handleExitShop = () => {
    if (p2pMode === "multiplayer" && castContinueVote) {
      // In P2P, exiting shop requires voting first
      castContinueVote();
      return;
    }
    setActiveShopOpen(false);
    onSelectNode({
      type: "shop",
      stars: 1,
      label: "Blacksmith Shop Visit Core",
    });
  };

  const theme = getChapterTheme(chapter, way, path);

  return (
    <div
      className={`w-full p-4 md:p-8 bg-slate-900 border-2 ${theme.borderColor} rounded-xl text-slate-100 shadow-2xl relative shadow-lg ${theme.glowColor}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full pointer-events-none blur-xl"></div>

      {/* Countdown overlay banner */}
      {countdown !== null && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-center font-mono text-sm font-bold uppercase tracking-wider animate-pulse flex items-center justify-center gap-2">
          <span>🔔 Voting Threshold Reached! Choice locking in:</span>
          <span className="text-xl font-bold bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded">
            {countdown}s
          </span>
        </div>
      )}

      {/* Continue voting banner */}
      {p2pMode === "multiplayer" && continueCountdown !== null && (
        <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-lg text-center font-mono text-sm font-bold uppercase tracking-wider animate-pulse flex items-center justify-center gap-2">
          <span>🔔 Continue Vote Passed! Advancing in:</span>
          <span className="text-xl font-bold bg-indigo-500 text-slate-950 px-2.5 py-0.5 rounded">
            {continueCountdown}s
          </span>
        </div>
      )}
      {p2pMode === "multiplayer" && continueVotes.length > 0 && continueCountdown === null && (
        <div className="mb-6 p-3 bg-indigo-500/5 border border-indigo-500/20 text-indigo-400 rounded-lg text-center font-mono text-xs">
          ⏳ Waiting for continue votes... ({continueVotes.length}/{Math.ceil(party.length / 2)} needed to proceed)
          {castContinueVote && !continueVotes.includes(myPlayerId) && (
            <button
              onClick={castContinueVote}
              className="ml-3 px-3 py-1 bg-indigo-500 hover:bg-indigo-400 text-white rounded text-[10px] uppercase font-bold cursor-pointer"
            >
              Vote to Continue
            </button>
          )}
        </div>
      )}

      {/* Progress Map Bar */}
      <div className="border-b border-slate-800 pb-5 mb-6 space-y-3">
        <div className="flex justify-between items-center text-xs font-mono text-amber-500 uppercase font-bold tracking-wider">
          <span>👑 {theme.emoji} {theme.name} Progress:</span>
          <span>
            Lane {Math.min(maxArea, area + 1)} / {maxArea}
          </span>
        </div>
        <div className="w-full bg-slate-950 h-3 rounded-full border border-slate-800 overflow-hidden p-0.5">
          <div
            className="bg-amber-500 h-full rounded-full transition-all"
            style={{ width: `${(area / maxArea) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Chapter Information Banner */}
      <div
        className={`p-4 mb-6 rounded-lg bg-slate-950/70 border ${theme.borderColor} font-mono space-y-2`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{theme.emoji}</span>
          <span className="text-xs font-bold text-slate-100 uppercase">
            {theme.name}
          </span>
        </div>
        <p className="text-[11px] text-slate-405 leading-relaxed font-sans">
          {theme.description}
        </p>
      </div>

      {/* Normal Map Node choices selector */}
      {!activeStory && !activeShopOpen && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 font-mono text-amber-400 font-bold uppercase text-md">
              <Compass className="w-5 h-5" /> Select Campaign route
            </div>
            {p2pMode === "multiplayer" && (
              <span className="text-xs font-mono text-slate-400">
                Multiplayer Voting Active (needs &gt;= 50% room votes)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableNodes.map((node, i) => {
              const nodeVotes = Object.values(votes).filter(
                (v) => v === `node_${i}`,
              ).length;
              const isMyVote =
                votes[Object.keys(votes).find((k) => k === "me") || ""] ===
                `node_${i}`; // or simple highlight checks

              return (
                <button
                  key={i}
                  onClick={() => handleSelectNodeOrVote(node, i)}
                  className={`p-5 bg-gradient-to-b from-slate-800/80 to-slate-900 border rounded-xl text-left hover:border-amber-500/40 transition-all cursor-pointer space-y-4 shadow flex flex-col justify-between h-[200px] ${
                    nodeVotes > 0
                      ? "border-amber-500/50 shadow-md shadow-amber-500/5"
                      : "border-slate-700/60"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] uppercase font-mono font-bold text-amber-500 bg-amber-500/5 px-2 py-0.5 border border-amber-500/10 rounded flex items-center gap-1">
                        {node.type === "combat" && "⚔️"}
                        {node.type === "elite_combat" && "💀"}
                        {node.type === "event" && "📜"}
                        {node.type === "shop" && "🛒"}
                        {node.type === "rest" && "🏕️"}
                        {node.type === "boss" && "👑"}
                        {node.type.replace("_", " ")}
                      </span>
                      <span className="text-yellow-500 font-bold text-xs font-mono">
                        {"★".repeat(node.stars)}
                      </span>
                    </div>
                    <h3 className="text-sm font-mono font-bold text-slate-200 uppercase">
                      {node.label}
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-2">
                      {node.type === "combat" &&
                        "Encounter common slimes, rabid wolves or forest mandrakes."}
                      {node.type === "elite_combat" &&
                        "Elite siege! Higher risk, heavier materials and crafting scrolls."}
                      {node.type === "event" &&
                        "Interactive story card! Make choice stats checks for item rewards."}
                      {node.type === "shop" &&
                        "Purchase potions, raw ores and wolf hides of the medieval black market."}
                      {node.type === "rest" &&
                        "Rest at the campground. Invest levels stats, forge weaponry."}
                      {node.type === "boss" &&
                        "👑 CHAPTER LANDMARK. Ultimate duel of the chapter master."}
                    </p>
                  </div>

                  <div className="flex justify-between items-center w-full mt-2 border-t border-slate-850/40 pt-2">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase flex items-center gap-1">
                      <Swords className="w-3.5 h-3.5" /> Select Node
                    </span>
                    {p2pMode === "multiplayer" && nodeVotes > 0 && (
                      <span className="bg-amber-500 text-slate-950 font-bold font-mono px-2 py-0.5 rounded text-[10px]">
                        Votes: {nodeVotes}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Story Event Rendering card */}
      {activeStory && (
        <div className="p-6 bg-slate-950 border border-amber-500/20 rounded-xl space-y-5">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 font-mono text-amber-400 font-bold uppercase text-md">
              <BookOpen className="w-5 h-5 text-amber-500" /> Narrative Choice
              Card
            </div>
            {p2pMode === "multiplayer" && (
              <span className="text-xs font-mono text-slate-400">
                Multiplayer Voting Active
              </span>
            )}
          </div>
          <h3 className="text-lg font-mono font-bold text-slate-100">
            {activeStory.title}
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            {activeStory.desc}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {activeStory.choices.map((ch, idx) => {
              const storyVotes = Object.values(votes).filter(
                (v) => v === `story_${idx}`,
              ).length;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectStoryChoiceOrVote(idx)}
                  className={`p-4 bg-slate-900 border rounded-lg text-left transition-all cursor-pointer space-y-1.5 flex flex-col justify-between ${
                    storyVotes > 0
                      ? "border-amber-500/50 shadow-md"
                      : "border-slate-800 hover:border-amber-400"
                  }`}
                >
                  <div className="space-y-1.5 w-full">
                    <strong className="text-xs font-mono text-amber-500 uppercase block">
                      {ch.label}
                    </strong>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      {ch.effectText}
                    </p>
                  </div>
                  {p2pMode === "multiplayer" && storyVotes > 0 && (
                    <span className="self-end bg-indigo-500 text-white font-bold font-mono px-2 py-0.5 rounded text-[10px] mt-2">
                      Votes: {storyVotes}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Merchant Shop UI */}
      {activeShopOpen && (
        <div className="p-6 bg-slate-950 border border-amber-500/20 rounded-xl space-y-5">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-mono text-amber-400 font-bold uppercase text-md">
              <ShoppingBag className="w-5 h-5 text-amber-500" /> Medieval
              Blacksmith shop
            </div>
            <div className="text-xs font-mono text-amber-400 px-3 py-1.5 bg-amber-500/5 border border-amber-500/10 rounded">
              Your Purse: <strong>{gold}g</strong>
            </div>
          </div>

          <p className="text-xs text-slate-400 italic font-mono">
            "Potions of mana, fresh iron ore from deep caves. What are you
            looking to buy?"
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {shopWares.map((wareId, wareIdx) => {
              const item = ITEMS_DATABASE[wareId];
              if (!item) return null;
              const isSpecial = wareIdx === 0; // First item is the special equipment

              return (
                <div
                  key={wareId}
                  className={`p-3 bg-slate-900 rounded-lg border flex justify-between items-center ${
                    isSpecial
                      ? "border-amber-400/40 bg-amber-950/10 shadow-sm shadow-amber-500/10"
                      : "border-slate-800"
                  }`}
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isSpecial && (
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 border rounded text-amber-400 border-amber-600 bg-amber-500/10 mr-1">
                          ★ SPECIAL ★
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-200 block truncate">
                        {item.name}
                      </span>
                      {item.rarity &&
                        (() => {
                          const colors: Record<string, string> = {
                            Common: "text-slate-400 border-slate-700",
                            Uncommon: "text-emerald-400 border-emerald-700",
                            Rare: "text-sky-400 border-sky-700",
                            Epic: "text-purple-400 border-purple-700",
                            Legendary: "text-amber-400 border-amber-600",
                          };
                          const cls = colors[item.rarity] || "text-slate-400";
                          return (
                            <span
                              className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 border rounded ${cls}`}
                            >
                              {item.rarity}
                            </span>
                          );
                        })()}
                    </div>
                    <span className="text-[10px] text-slate-500 leading-normal block max-w-[200px]">
                      {item.description}
                    </span>
                  </div>
                  <button
                    onClick={() => handleBuyShopWare(wareId)}
                    disabled={gold < item.value}
                    className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded border cursor-pointer ${
                      gold >= item.value
                        ? "bg-amber-500 border-amber-500 text-slate-950 hover:bg-amber-400"
                        : "bg-slate-950/40 border-slate-850 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    Buy: {item.value}g
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800/50 flex justify-end">
            <button
              onClick={handleExitShop}
              className="px-5 py-2 rounded bg-slate-800 hover:bg-slate-750 text-slate-350 border border-slate-700 font-mono text-xs uppercase cursor-pointer"
            >
              Exit shop & Proceed to campground camp
            </button>
          </div>
        </div>
      )}

      {/* Mini party stats indicator at bottom margin */}
      <div className="mt-8 pt-4 border-t border-slate-850/60 flex flex-wrap gap-4 text-xs font-mono text-slate-400 justify-between">
        <div className="flex gap-4">
          <span>Active Team:</span>
          {party.map((p) => (
            <span
              key={p.id}
              className={
                p.hp <= 30
                  ? "text-red-400 font-bold animate-pulse"
                  : "text-emerald-400"
              }
            >
              🛡️ {p.name}: {p.hp}/{p.maxHp} HP
            </span>
          ))}
        </div>
        <div>
          <span>Accumulated inventory items: {activeCharInv.length} bags</span>
        </div>
      </div>
    </div>
  );
}
