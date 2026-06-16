/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Character, Item, Stats, Equipment, Skill, ClassName, AdvancedClassName, TargetType } from "../types";
import { ITEMS_DATABASE, CRAFTING_RECIPES } from "../items_db";
import { getDerivedStats, BASE_SKILLS, ADVANCED_SKILLS } from "../skills_db";
import { TALENT_TREES } from "../talents_db";
import { syncBridge } from "../utils/sync";
import { Sparkles, Hammer, Shield, ChevronUp, Backpack, RefreshCw, Eye, Coins, Plus, Minus, Heart } from "lucide-react";

interface CampingMenuProps {
  party: Character[];
  inventory: Item[];
  sharedStash: Item[];
  gold: number;
  stashGold: number;
  onUpdateParty: (updatedParty: Character[]) => void;
  onUpdateInventory: (updatedInv: Item[]) => void;
  onUpdateSharedStash: (updatedStash: Item[]) => void;
  onUpdateGold: (updatedGold: number) => void;
  onUpdateStashGold: (updatedStashGold: number) => void;
  onContinue: () => void;
  onRestAndBattle: () => void;
  chapter?: number;
  myPlayerId?: string;
  p2pMode?: "solo" | "multiplayer";
  continueVotes?: string[];
  continueCountdown?: number | null;
}

const SLOT_LABELS: Record<keyof Equipment, string> = {
  weapon: "Weapon (Main Hand)",
  offhand: "Offhand (Shield / Secondary)",
  helmet: "Helmet",
  chestplate: "Chestplate",
  leggings: "Leggings",
  boots: "Boots",
  ring: "Ring",
  bracelet: "Bracelet",
  necklace: "Necklace",
  charm: "Charm",
};

const EQUIPMENT_TYPES = [
  "weapon",
  "offhand",
  "helmet",
  "chestplate",
  "leggings",
  "boots",
  "ring",
  "bracelet",
  "necklace",
  "charm",
];

export function CampingMenu({
  party,
  inventory,
  sharedStash,
  gold,
  stashGold,
  onUpdateParty,
  onUpdateInventory,
  onUpdateSharedStash,
  onUpdateGold,
  onUpdateStashGold,
  onContinue,
  onRestAndBattle,
  chapter = 1,
  myPlayerId = "",
  p2pMode = "solo",
  continueVotes = [],
  continueCountdown = null,
}: CampingMenuProps) {
  const [activeTab, setActiveTab] = useState<"stats" | "crafting" | "inventory" | "stash" | "talents">("stats");
  // In multiplayer, default to own character instead of party[0] (host)
  const defaultCharId = p2pMode === "multiplayer" && myPlayerId ? myPlayerId : (party[0]?.id || "");
  const [selectedCharId, setSelectedCharId] = useState<string>(defaultCharId);
  const [inspectedItemId, setInspectedItemId] = useState<string | null>(null);
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [craftingCategory, setCraftingCategory] = useState<"All" | "Weapons" | "Offhands" | "Wearables" | "Accessories" | "Consumables">("All");

  const activeChar = party.find(p => p.id === selectedCharId) || party[0];

  const CLASS_WEAPON_TYPES: Record<string, string> = {
    Warrior: "sword", Knight: "sword", Berserker: "sword", Warlord: "sword", Paladin: "sword",
    Archer: "bow", Sharpshooter: "bow", "Bolt Slinger": "bow", Hawkeye: "bow", "Storm Dancer": "bow",
    Mage: "staff", Elementalist: "staff", Summoner: "staff", Archmage: "staff", "Void Caller": "staff",
    Cleric: "tome", "High Priest": "tome", Inquisitor: "tome", Seraph: "tome", Crusader: "tome",
    Rogue: "dagger", Assassin: "dagger", Duelist: "dagger", Phantom: "dagger", "Blade Saint": "dagger",
    Bard: "lute", "Bard of Valor": "lute", "Bard of Chaos": "lute", "Herald of Glory": "lute", "Entropy Singer": "lute"
  };

  const getBaseClass = (cl: string): string => {
    if (["Berserker", "Knight", "Warlord", "Paladin"].includes(cl)) return "Warrior";
    if (["Sharpshooter", "Bolt Slinger", "Hawkeye", "Storm Dancer"].includes(cl)) return "Archer";
    if (["Elementalist", "Summoner", "Archmage", "Void Caller"].includes(cl)) return "Mage";
    if (["High Priest", "Inquisitor", "Seraph", "Crusader"].includes(cl)) return "Cleric";
    if (["Assassin", "Duelist", "Phantom", "Blade Saint"].includes(cl)) return "Rogue";
    if (["Bard of Valor", "Bard of Chaos", "Herald of Glory", "Entropy Singer"].includes(cl)) return "Bard";
    return cl;
  };

  const canEquipOffhand = (char: Character, item: Item): boolean => {
    if (item.weaponType === "shield") {
      return ["Warrior", "Knight", "Warlord", "Paladin", "Cleric", "High Priest", "Inquisitor", "Seraph", "Crusader", "Bard", "Bard of Valor", "Bard of Chaos", "Herald of Glory", "Entropy Singer"].includes(char.class);
    }
    // Rogue dual wielding daggers/swords
    if (["Rogue", "Assassin", "Duelist", "Phantom", "Blade Saint"].includes(char.class)) {
      return item.weaponType === "dagger" || item.weaponType === "sword";
    }
    // Berserker dual wielding swords
    if (char.class === "Berserker" || char.class === "Warlord") {
      return item.weaponType === "sword";
    }
    return false;
  };

  const handleLevelUpStat = (statName: keyof Stats, amount = 1) => {
    if (!activeChar || activeChar.unspentPoints <= 0) return;
    if (p2pMode === "multiplayer" && activeChar.id !== myPlayerId) return;

    const actualAmount = Math.min(amount, activeChar.unspentPoints);
    if (actualAmount <= 0) return;

    const updatedParty = party.map(p => {
      if (p.id === activeChar.id) {
        const nextStats = {
          ...p.stats,
          [statName]: p.stats[statName] + actualAmount,
        };
        return {
          ...p,
          stats: nextStats,
          unspentPoints: p.unspentPoints - actualAmount,
          allocatedPoints: p.allocatedPoints + actualAmount,
          maxHp: 80 + nextStats.CON * 12 + (p.level - 1) * 15,
        };
      }
      return p;
    });

    onUpdateParty(updatedParty);
  };

  const handleCraftItem = (recipeId: string) => {
    if (p2pMode === "multiplayer" && activeChar.id !== myPlayerId) return;
    const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId);
    if (!recipe || !activeChar) return;

    const charInv = activeChar.inventory || [];

    const hasIngredients = recipe.ingredients.every(needed => {
      const owned = charInv.filter(i => i.id === needed.itemId).reduce((acc, current) => acc + (current.quantity || 1), 0);
      return owned >= needed.quantity;
    });

    if (!hasIngredients) {
      if ((window as any).showNotification) {
        (window as any).showNotification("Missing raw crafting ingredients in your bag!", "error");
      }
      return;
    }

    // Deduct ingredients
    let tempInventory = [...charInv];
    recipe.ingredients.forEach(needed => {
      let qtyToDeduct = needed.quantity;
      tempInventory = tempInventory.map(item => {
        if (item.id === needed.itemId) {
          const currentQty = item.quantity || 1;
          if (currentQty > qtyToDeduct) {
            const next = { ...item, quantity: currentQty - qtyToDeduct };
            qtyToDeduct = 0;
            return next;
          } else {
            qtyToDeduct -= currentQty;
            return null; // mark removal
          }
        }
        return item;
      }).filter(Boolean) as Item[];
    });

    // Add crafted result
    const craftedItem = ITEMS_DATABASE[recipe.resultItemId];
    let finalItem = { ...craftedItem };
    
    if (activeChar?.race === "Dwarves") {
      const scale = 1 + 0.10 * Math.floor(activeChar.level / 10);
      if (scale > 1) {
        if (finalItem.flatAtk) finalItem.flatAtk = Math.floor(finalItem.flatAtk * scale);
        if (finalItem.flatMaxHp) finalItem.flatMaxHp = Math.floor(finalItem.flatMaxHp * scale);
        if (finalItem.flatCrit) finalItem.flatCrit = Math.floor(finalItem.flatCrit * scale);
        if (finalItem.flatDodge) finalItem.flatDodge = Math.floor(finalItem.flatDodge * scale);
        if (finalItem.flatDef) finalItem.flatDef = Math.floor(finalItem.flatDef * scale);
        if (finalItem.flatAccuracy) finalItem.flatAccuracy = Math.floor(finalItem.flatAccuracy * scale);
        if (finalItem.statsBonus) {
          const newStatsBonus = { ...finalItem.statsBonus };
          Object.keys(newStatsBonus).forEach(k => {
            const sk = k as keyof Stats;
            if (newStatsBonus[sk]) {
              newStatsBonus[sk] = Math.floor(newStatsBonus[sk]! * scale);
            }
          });
          finalItem.statsBonus = newStatsBonus;
        }
        finalItem.name = `${finalItem.name} [Dwarven +${Math.round((scale - 1) * 100)}%]`;
        finalItem.id = `${finalItem.id}_dw_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      }
    }

    const existingIdx = tempInventory.findIndex(i => i.id === finalItem.id);
    if (existingIdx !== -1) {
      tempInventory[existingIdx] = { ...tempInventory[existingIdx], quantity: (tempInventory[existingIdx].quantity || 1) + 1 };
    } else {
      tempInventory.push({ ...finalItem, quantity: 1 });
    }

    const nextParty = party.map(p => {
      if (p.id === activeChar.id) {
        return { ...p, inventory: tempInventory };
      }
      return p;
    });

    onUpdateParty(nextParty);
    if ((window as any).showNotification) {
      (window as any).showNotification(`🔨 Crafted successfully: ${craftedItem.name}!`, "success");
    }
  };

  const handleEquipItem = (char: Character, item: Item) => {
    if (p2pMode === "multiplayer" && char.id !== myPlayerId) return;
    let nextEquip = { ...char.equipment };
    let slotToReplace: keyof Equipment = "weapon";
    
    const charInv = char.inventory || [];
    let nextInv = [...charInv];

    // Determine target slot
    if (item.type === "weapon") {
      // Check dual wield positioning
      if (["Rogue", "Assassin", "Duelist", "Berserker"].includes(char.class) && nextEquip.weapon && !nextEquip.offhand) {
        slotToReplace = "offhand";
      } else {
        slotToReplace = "weapon";
      }
    } else if (item.type === "offhand") {
      slotToReplace = "offhand";
    } else {
      slotToReplace = item.type as keyof Equipment;
    }

    // Validation for weapon compatibility
    if (slotToReplace === "weapon") {
      const allowedType = CLASS_WEAPON_TYPES[char.class];
      if (item.weaponType !== allowedType) {
        const errorMsg = `❌ ${char.name} (${char.class}) can only equip weapons of type: ${allowedType?.toUpperCase()}!`;
        if ((window as any).showNotification) {
          (window as any).showNotification(errorMsg, "error");
        }
        return;
      }

      // If equipping 2-handed, unequip offhand automatically
      if (item.isTwoHanded && nextEquip.offhand) {
        const oldOffhand = nextEquip.offhand;
        nextEquip.offhand = null;
        nextInv.push({ ...oldOffhand, quantity: 1 });
        if ((window as any).showNotification) {
          (window as any).showNotification(`Unequipped ${oldOffhand.name} to wield two-handed weapon!`, "info");
        }
      }
    }

    // Validation for offhand compatibility
    if (slotToReplace === "offhand") {
      const mainWeapon = nextEquip.weapon;
      if (mainWeapon && mainWeapon.isTwoHanded) {
        if ((window as any).showNotification) {
          (window as any).showNotification("Cannot equip offhand while holding a two-handed weapon!", "error");
        }
        return;
      }
      if (!canEquipOffhand(char, item)) {
        if ((window as any).showNotification) {
          (window as any).showNotification(`${char.name} cannot equip this item in their offhand slot!`, "error");
        }
        return;
      }
    }

    const oldItem = nextEquip[slotToReplace];

    // Swap Slots
    nextEquip[slotToReplace] = item;

    // Deduct item from inventory
    const targetInvItemIndex = nextInv.findIndex(i => i.id === item.id);
    if (targetInvItemIndex !== -1) {
      const target = nextInv[targetInvItemIndex];
      if (target.quantity && target.quantity > 1) {
        nextInv[targetInvItemIndex] = { ...target, quantity: target.quantity - 1 };
      } else {
        nextInv.splice(targetInvItemIndex, 1);
      }
    }

    // Re-add old item to inventory if valid
    if (oldItem) {
      const existingIdx = nextInv.findIndex(i => i.id === oldItem.id);
      if (existingIdx !== -1) {
        nextInv[existingIdx] = { ...nextInv[existingIdx], quantity: (nextInv[existingIdx].quantity || 1) + 1 };
      } else {
        nextInv.push({ ...oldItem, quantity: 1 });
      }
    }

    const nextParty = party.map(p => {
      if (p.id === char.id) {
        return { ...p, equipment: nextEquip, inventory: nextInv };
      }
      return p;
    });

    onUpdateParty(nextParty);
  };

  const handleUnequipItem = (char: Character, slot: keyof Equipment) => {
    if (p2pMode === "multiplayer" && char.id !== myPlayerId) return;
    const item = char.equipment[slot];
    if (!item) return;

    const nextEquip = { ...char.equipment };
    nextEquip[slot] = null;

    const charInv = char.inventory || [];
    let nextInv = [...charInv];
    const existingIdx = nextInv.findIndex(i => i.id === item.id);
    if (existingIdx !== -1) {
      nextInv[existingIdx] = { ...nextInv[existingIdx], quantity: (nextInv[existingIdx].quantity || 1) + 1 };
    } else {
      nextInv.push({ ...item, quantity: 1 });
    }

    const nextParty = party.map(p => {
      if (p.id === char.id) {
        return { ...p, equipment: nextEquip, inventory: nextInv };
      }
      return p;
    });

    onUpdateParty(nextParty);
  };

  // Stash transactions (Refactored to aggregate counts)
  const depositToStash = (item: Item) => {
    if (p2pMode === "multiplayer" && activeChar.id !== myPlayerId) return;
    const charInv = activeChar.inventory || [];
    let nextInv = [...charInv];
    const targetIdx = nextInv.findIndex(i => i.id === item.id);
    if (targetIdx === -1) return;

    const target = nextInv[targetIdx];
    if (target.quantity && target.quantity > 1) {
      nextInv[targetIdx] = { ...target, quantity: target.quantity - 1 };
    } else {
      nextInv.splice(targetIdx, 1);
    }

    let nextStash = [...sharedStash];
    const stashIdx = nextStash.findIndex(i => i.id === item.id);
    if (stashIdx !== -1) {
      nextStash[stashIdx] = { ...nextStash[stashIdx], quantity: (nextStash[stashIdx].quantity || 1) + 1 };
    } else {
      nextStash.push({ ...item, quantity: 1 });
    }

    const nextParty = party.map(p => {
      if (p.id === activeChar.id) {
        return { ...p, inventory: nextInv };
      }
      return p;
    });
    onUpdateParty(nextParty);
    onUpdateSharedStash(nextStash);
  };

  const withdrawFromStash = (item: Item) => {
    if (p2pMode === "multiplayer" && activeChar.id !== myPlayerId) return;
    let nextStash = [...sharedStash];
    const stashIdx = nextStash.findIndex(i => i.id === item.id);
    if (stashIdx === -1) return;

    const target = nextStash[stashIdx];
    if (target.quantity && target.quantity > 1) {
      nextStash[stashIdx] = { ...target, quantity: target.quantity - 1 };
    } else {
      nextStash.splice(stashIdx, 1);
    }

    const charInv = activeChar.inventory || [];
    let nextInv = [...charInv];
    const invIdx = nextInv.findIndex(i => i.id === item.id);
    if (invIdx !== -1) {
      nextInv[invIdx] = { ...nextInv[invIdx], quantity: (nextInv[invIdx].quantity || 1) + 1 };
    } else {
      nextInv.push({ ...item, quantity: 1 });
    }

    const nextParty = party.map(p => {
      if (p.id === activeChar.id) {
        return { ...p, inventory: nextInv };
      }
      return p;
    });
    onUpdateParty(nextParty);
    onUpdateSharedStash(nextStash);
  };

  // Gold Bank transfers
  const handleDepositGold = () => {
    if (transferAmount <= 0) return;
    if (gold >= transferAmount) {
      onUpdateGold(gold - transferAmount);
      onUpdateStashGold(stashGold + transferAmount);
      setTransferAmount(0);
      if ((window as any).showNotification) {
        (window as any).showNotification(`Deposited ${transferAmount}g into Guild Bank!`, "success");
      }
    } else {
      if ((window as any).showNotification) {
        (window as any).showNotification("Insufficient gold in Team Purse!", "error");
      }
    }
  };

  const handleWithdrawGold = () => {
    if (transferAmount <= 0) return;
    if (stashGold >= transferAmount) {
      onUpdateGold(gold + transferAmount);
      onUpdateStashGold(stashGold - transferAmount);
      setTransferAmount(0);
      if ((window as any).showNotification) {
        (window as any).showNotification(`Withdrew ${transferAmount}g from Guild Bank!`, "success");
      }
    } else {
      if ((window as any).showNotification) {
        (window as any).showNotification("Insufficient gold in Guild Bank!", "error");
      }
    }
  };

  const getCampBorderClass = () => {
    switch (chapter) {
      case 1: return "border-emerald-500/30 shadow-emerald-500/5";
      case 2: return "border-rose-500/30 shadow-rose-500/5";
      case 3: return "border-orange-500/30 shadow-orange-500/5";
      case 4: return "border-purple-500/30 shadow-purple-500/5";
      default: return "border-amber-500/30";
    }
  };

  return (
    <div className={`w-full max-w-[67.2rem] mx-auto bg-slate-900 border-2 ${getCampBorderClass()} rounded-xl p-5 md:p-8 text-slate-100 shadow-2xl relative overflow-hidden`}>
      
      {/* Camp Header banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5 mb-6 gap-4">
        <div>
          <span className="text-xs font-mono text-amber-500 uppercase tracking-widest font-bold">Safe Camp Spot</span>
          <h2 className="text-2xl md:text-3xl font-mono font-bold tracking-wider text-slate-100">
            🌳 CAMPGROUND FEAST
          </h2>
          <p className="text-xs text-slate-400 mt-1">Upgrade stats, spend talent trees, forge weapons, swap equipment, or store gold.</p>
        </div>
        <div className="flex items-center gap-4 text-sm font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div>Gold: <span className="text-amber-400 font-bold">{gold}g</span></div>
          <div className="text-slate-500">|</div>
          <div>Bank Gold: <span className="text-indigo-400 font-bold">{stashGold}g</span></div>
        </div>
      </div>

      {/* Tabs list menu */}
      <div className="flex gap-2 border-b border-slate-800 pb-4 mb-6 overflow-x-auto">
        {([
          { id: "stats", label: "🏋️ Character Stats" },
          { id: "talents", label: "🎭 Class Talents (View Only)" },
          { id: "crafting", label: "🔨 Blacksmith Forge" },
          { id: "inventory", label: "🎒 Equipment Gear" },
          { id: "stash", label: "📤 Guild Stash & Bank" },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-mono font-bold text-xs uppercase rounded transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-amber-500 text-slate-950 shadow"
                : "bg-slate-800 hover:bg-slate-750 text-slate-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Hero selectors - Show all party members in multiplayer (view-only for others) */}
      {party.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {party.map(p => {
            const isOwned = p2pMode !== "multiplayer" || p.id === myPlayerId;
            return (
              <button
                key={p.id}
                onClick={() => {
                  if (!isOwned) return;
                  setSelectedCharId(p.id);
                }}
                disabled={!isOwned}
                className={`px-4 py-2 rounded text-xs font-mono border transition-all whitespace-nowrap ${
                  selectedCharId === p.id
                    ? "bg-amber-500/10 border-amber-500 text-amber-400 font-bold"
                    : isOwned
                      ? "bg-slate-950 border-slate-800 text-slate-400"
                      : "bg-slate-950/40 border-slate-800/40 text-slate-600 cursor-default"
                }`}
              >
                🛡️ {p.name} (Lv {p.level} {p.class})
                {!isOwned && " 👁️"}
                {p.fallenStacks ? ` [Fallen x${p.fallenStacks}]` : ""}
              </button>
            );
          })}
        </div>
      )}

      {p2pMode === "multiplayer" && activeChar.id !== myPlayerId && (
        <div className="mb-6 p-3 bg-amber-950/40 border border-amber-500/20 rounded font-mono text-xs text-amber-400 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-500" />
          <span>Viewing <strong>{activeChar.name}</strong>'s sheet. Actions are locked since you do not own this character.</span>
        </div>
      )}

      {/* Tab: Stats Allocation */}
      {activeTab === "stats" && activeChar && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Attribute Investment */}
          <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-800/40 flex flex-col justify-between">
            <div>
              <h3 className="text-md font-mono text-amber-400 uppercase font-bold border-b border-slate-800 pb-2 mb-4">
                Invest Stat Points
              </h3>
              
              {activeChar.unspentPoints > 0 ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded font-mono text-[11px] mb-4">
                  ⭐ You have <strong>{activeChar.unspentPoints}</strong> unallocated stat points left!
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-mono italic mb-4">No unspent points. Earn XP in battle to level up!</p>
              )}

              <div className="space-y-2.5 font-mono">
                {Object.keys(activeChar.stats).map(statKey => {
                  const sKey = statKey as keyof Stats;
                  const isLocked = p2pMode === "multiplayer" && activeChar.id !== myPlayerId;
                  return (
                    <div key={sKey} className="flex justify-between items-center bg-slate-900 px-3 py-1.5 rounded border border-slate-800/60">
                      <div>
                        <span className="text-xs font-bold text-slate-200">{sKey}</span>
                        <span className="text-[9px] text-slate-500 block leading-tight mt-0.5 max-w-[170px]">
                          {sKey === "STR" && "+0.8% Crit Dmg, +0.5% Block. Warrior (+5%), Archer (+2%)"}
                          {sKey === "DEX" && "+0.4% Crit Ch, +0.6% Crit Dmg, +0.5% Dodge, +1% Acc. Archer (+5%), Rogue (+4%)"}
                          {sKey === "CON" && "+12 HP, +1 DEF, +0.4% Block, +0.8% Block Red. Warrior (+3%)"}
                          {sKey === "INT" && "Mage (+6% spellpower)"}
                          {sKey === "FTH" && "Cleric (+6% heal/smite)"}
                          {sKey === "CHA" && "Bard (+5% song power)"}
                          {sKey === "LCK" && "+0.5% Crit Ch, +1.2% Crit Dmg, +0.3% Dodge, +0.5% Acc. Rogue (+3%), Bard (+2%)"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-355 font-bold">{activeChar.stats[sKey]}</span>
                        {activeChar.unspentPoints > 0 && !isLocked && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleLevelUpStat(sKey, 1)}
                              className="p-1 px-2 border border-amber-500/40 hover:border-amber-500 bg-slate-850 hover:bg-amber-500 hover:text-slate-950 rounded text-amber-400 transition-all font-mono text-xs cursor-pointer font-bold"
                            >
                              +1
                            </button>
                            {activeChar.unspentPoints >= 4 && (
                              <button
                                onClick={() => handleLevelUpStat(sKey, 4)}
                                className="p-1 px-2 border border-amber-500/40 hover:border-amber-500 bg-slate-850 hover:bg-amber-500 hover:text-slate-950 rounded text-amber-400 transition-all font-mono text-xs cursor-pointer font-bold"
                              >
                                +4
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 2: Core Attributes Sheet */}
          <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-800/40">
            <h3 className="text-md font-mono text-amber-400 uppercase font-bold border-b border-slate-800 pb-2 mb-4">
              Core Attributes Sheet
            </h3>
            <p className="text-xs text-slate-400 font-mono mb-4">Shows Base stats modified by talents, equipment bonuses, and race traits.</p>
            
            {(() => {
              const derived = getDerivedStats(activeChar);
              return (
                <div className="space-y-3 font-mono">
                  {Object.keys(activeChar.stats).map(statKey => {
                    const sKey = statKey as keyof Stats;
                    const baseVal = activeChar.stats[sKey];
                    const combVal = derived.combinedStats[sKey];
                    const bonus = combVal - baseVal;
                    return (
                      <div key={sKey} className="flex justify-between items-center bg-slate-900 px-3 py-2 rounded border border-slate-800/60">
                        <span className="text-xs text-slate-400 font-bold">{sKey}</span>
                        <div className="text-xs">
                          <span className="text-slate-500">{baseVal}</span>
                          <span className="text-slate-400 mx-1.5">→</span>
                          <strong className="text-indigo-400 font-bold">{combVal}</strong>
                          {bonus !== 0 && (
                            <span className={`text-[10px] ml-1.5 ${bonus > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              ({bonus > 0 ? `+${bonus}` : bonus})
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-2 border-t border-slate-800/40 text-[10px] text-slate-500 leading-normal">
                    * Race choice: <span className="text-indigo-300 font-bold">{activeChar.race || "Human"}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Column 3: Combat Stats Showcase & XP */}
          <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-800/40 flex flex-col justify-between">
            <div>
              <h3 className="text-md font-mono text-amber-400 uppercase font-bold border-b border-slate-800 pb-2 mb-4">
                Combat Stats Showcase
              </h3>

              {(() => {
                const derived = getDerivedStats(activeChar);
                const xpToNext = Math.pow(activeChar.level + 1, 2) + activeChar.level;
                const xpPct = Math.min(100, Math.max(0, (activeChar.xp / xpToNext) * 100));
                
                return (
                  <div className="space-y-4 font-mono text-xs">
                    {/* XP Progress Bar */}
                    <div className="space-y-1 bg-slate-900 p-3 rounded border border-slate-800">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400">EXP Progress (Lv {activeChar.level})</span>
                        <strong className="text-amber-400">{activeChar.xp} / {xpToNext}</strong>
                      </div>
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800/60">
                        <div
                          className="bg-amber-500 h-full transition-all duration-500"
                          style={{ width: `${xpPct}%` }}
                        ></div>
                      </div>
                      <span className="text-[9px] text-slate-500 block text-right font-semibold">{xpPct.toFixed(1)}% to Next Level</span>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Max HP Pool:</span>
                        <strong className="text-slate-200">{derived.maxHp} HP</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Attack Power (ATK):</span>
                        <strong className="text-red-400">{derived.atk} ATK</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Flat Defense (DEF):</span>
                        <strong className="text-indigo-400">{derived.def} DEF</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Accuracy rate:</span>
                        <strong className="text-slate-200">{derived.accuracy.toFixed(1)}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Evasion / Dodge:</span>
                        <strong className="text-slate-200">{derived.dodgeChance.toFixed(1)}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Critical Chance:</span>
                        <strong className="text-slate-200">{derived.critChance.toFixed(1)}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Block Chance / Reduction:</span>
                        <strong className="text-slate-200">{derived.blockChance.toFixed(1)}% / {derived.blockReduction.toFixed(1)}%</strong>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {activeChar.fallenStacks ? (
              <div className="mt-4 p-2 bg-red-950/20 border border-red-500/25 rounded font-mono text-[10px] text-red-450 animate-pulse">
                ⚠️ Fallen Stack x{activeChar.fallenStacks} (Penalty: -{activeChar.fallenStacks * 25}% power)
              </div>
            ) : (
              <div className="mt-4 p-2 bg-emerald-950/20 border border-emerald-500/25 rounded font-mono text-[10px] text-emerald-400 text-center">
                💚 Status: Healthy
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Class Talents (Skill Tree) */}
      {activeTab === "talents" && activeChar && (
        <div className="bg-slate-950 p-5 rounded-lg border border-slate-800/40 space-y-6">
          <div className="space-y-4">
            <h3 className="text-md font-mono text-amber-400 uppercase font-bold flex items-center gap-2">
              <span>⚔️</span> Active Combat Skills (Unlocked by Level)
            </h3>
            <p className="text-xs text-slate-400">
              These active skills are unlocked naturally as you level up. Below are the skills currently available to <strong>{activeChar.name}</strong> (Lv {activeChar.level} {activeChar.class}):
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strike & Guard (Default) */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-200">Strike</span>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      LV 1 (Default)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Deals basic physical damage to a single enemy. Scales on primary stat (STR for melee, DEX for ranged). Cost: 0 Energy.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-200">Guard</span>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      LV 1 (Default)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Gain Guard: reduces incoming damage by 50% and doubles block chance for this turn. Cost: 0 Energy.
                  </p>
                </div>
              </div>

              {(() => {
                const baseClass = getBaseClass(activeChar.class) as ClassName;
                const baseSkills = BASE_SKILLS[baseClass] || [];
                const advancedSkills = ADVANCED_SKILLS[activeChar.class as AdvancedClassName] || [];
                const skillItems: { skill: Skill; reqLvl: number; isUnlocked: boolean }[] = [];

                if (baseSkills[0]) skillItems.push({ skill: baseSkills[0], reqLvl: 1, isUnlocked: true });
                if (baseSkills[1]) skillItems.push({ skill: baseSkills[1], reqLvl: 3, isUnlocked: activeChar.level >= 3 });
                if (baseSkills[2]) skillItems.push({ skill: baseSkills[2], reqLvl: 5, isUnlocked: activeChar.level >= 5 });

                if (activeChar.class in ADVANCED_SKILLS) {
                  if (advancedSkills[0]) skillItems.push({ skill: advancedSkills[0], reqLvl: 15, isUnlocked: activeChar.level >= 15 });
                  if (advancedSkills[1]) skillItems.push({ skill: advancedSkills[1], reqLvl: 18, isUnlocked: activeChar.level >= 18 });
                }

                return skillItems.map(({ skill, reqLvl, isUnlocked }) => (
                  <div
                    key={skill.id}
                    className={`p-3 border rounded-lg flex flex-col justify-between ${
                      isUnlocked
                        ? "bg-slate-950/60 border-slate-800"
                        : "bg-slate-900/30 border-slate-850 opacity-40"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-bold ${isUnlocked ? "text-slate-200" : "text-slate-500"}`}>
                          {skill.name}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 border rounded ${
                            isUnlocked
                              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                              : "text-slate-500 bg-slate-950 border-slate-900"
                          }`}
                        >
                          {isUnlocked ? `LV ${reqLvl} (Unlocked)` : `Requires LV ${reqLvl}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal mt-1">
                        {skill.description}
                      </p>
                      {isUnlocked && (
                        <div className="flex gap-2 mt-2">
                          <span className="text-[9px] font-mono text-amber-500 font-bold">
                            Cost: {skill.cost} Energy
                          </span>
                          {skill.cooldown !== undefined && (
                            <span className="text-[9px] font-mono text-indigo-400 font-bold">
                              Cooldown: {skill.cooldown} turns
                            </span>
                          )}
                          <span className="text-[9px] font-mono text-slate-500">
                            Target: {skill.targetType.replace("_", " ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          <div className="mt-8 border-t border-slate-800/60 pt-6 space-y-4">
            <div className="flex justify-between items-center pb-3">
              <div>
                <h3 className="text-md font-mono text-amber-400 uppercase font-bold">
                  🎭 Active Class Talents ({getBaseClass(activeChar.class)} Archetype)
                </h3>
                <p className="text-xs text-slate-400 mt-1">Active talents unlocked at start of run. Customize and purchase nodes in the main Profile menu before starting a run.</p>
              </div>
              <div className="px-4 py-2 bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 font-bold font-mono text-xs rounded">
                Unspent Talent Points: {activeChar.talentPoints || 0}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(TALENT_TREES[getBaseClass(activeChar.class) as keyof typeof TALENT_TREES] || []).map(node => {
                const isUnlocked = (activeChar.unlockedTalents || []).includes(node.id);

                return (
                  <div
                    key={node.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between h-[150px] transition-all relative ${
                      isUnlocked
                        ? "bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/5"
                        : "bg-slate-900 border-slate-800 opacity-60"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-slate-200">{node.name}</span>
                        <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-500/5 px-2 py-0.5 border border-indigo-500/10 rounded">
                          {node.cost === 0 ? "Free" : `${node.cost + (activeChar.unlockedTalents || []).filter(id => {
                            const tree = TALENT_TREES[getBaseClass(activeChar.class) as keyof typeof TALENT_TREES] || [];
                            const n = tree.find(t => t.id === id);
                            return n && n.cost > 0;
                          }).length} TP`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal mt-2">{node.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-850">
                      {isUnlocked ? (
                        <span className="text-xs font-mono font-bold text-emerald-400 flex items-center justify-center gap-1 py-1">
                          ✓ Active / Unlocked
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-bold text-slate-500 flex items-center justify-center gap-1.5 py-1">
                          🔒 Locked (Customize in Profile)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Crafting */}
      {activeTab === "crafting" && activeChar && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-800/40 space-y-4">
            <h3 className="text-md font-mono text-amber-400 uppercase font-bold border-b border-slate-800 pb-2">
              Blacksmith Craft Recipes
            </h3>

            <div className="flex flex-wrap gap-1 border-b border-slate-800/60 pb-3">
              {(["All", "Weapons", "Offhands", "Wearables", "Accessories", "Consumables"] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCraftingCategory(cat)}
                  className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold uppercase transition-all cursor-pointer ${
                    craftingCategory === cat
                      ? "bg-amber-500 text-slate-950 font-extrabold"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {(() => {
                const allowedType = CLASS_WEAPON_TYPES[activeChar.class];
                const filteredRecipes = CRAFTING_RECIPES.filter(recipe => {
                  const resultItem = ITEMS_DATABASE[recipe.resultItemId];
                  if (!resultItem) return false;

                  // Class weapon check: if it is a weapon, it must match character's weapon type.
                  if (resultItem.type === "weapon") {
                    if (resultItem.weaponType !== allowedType) return false;
                  }

                  // Category check:
                  if (craftingCategory !== "All") {
                    if (craftingCategory === "Weapons" && resultItem.type !== "weapon") return false;
                    if (craftingCategory === "Offhands" && resultItem.type !== "offhand") return false;
                    if (craftingCategory === "Wearables" && !["helmet", "chestplate", "leggings", "boots"].includes(resultItem.type)) return false;
                    if (craftingCategory === "Accessories" && !["ring", "bracelet", "necklace", "charm"].includes(resultItem.type)) return false;
                    if (craftingCategory === "Consumables" && resultItem.type !== "consumable") return false;
                  }

                  // Hide recipe if player has no items matching any ingredient of that recipe
                  const charInv = activeChar.inventory || [];
                  const hasAnyIngredient = recipe.ingredients.some(ing =>
                    charInv.some(i => i.id === ing.itemId && (i.quantity || 0) >= 1)
                  );
                  return hasAnyIngredient;
                });

                // Sort recipes to put ready-to-craft recipes at the top
                const sortedRecipes = [...filteredRecipes].sort((a, b) => {
                  const charInv = activeChar.inventory || [];
                  const hasA = a.ingredients.every(needed => {
                    const qty = charInv.filter(i => i.id === needed.itemId).reduce((ac, c) => ac + (c.quantity || 1), 0);
                    return qty >= needed.quantity;
                  });
                  const hasB = b.ingredients.every(needed => {
                    const qty = charInv.filter(i => i.id === needed.itemId).reduce((ac, c) => ac + (c.quantity || 1), 0);
                    return qty >= needed.quantity;
                  });
                  if (hasA && !hasB) return -1;
                  if (!hasA && hasB) return 1;
                  return 0;
                });

                return sortedRecipes.map(recipe => {
                  const resultItem = ITEMS_DATABASE[recipe.resultItemId];
                  if (!resultItem) return null;

                  const charInv = activeChar.inventory || [];
                  const hasIngredients = recipe.ingredients.every(needed => {
                    const qty = charInv.filter(i => i.id === needed.itemId).reduce((ac, c) => ac + (c.quantity || 1), 0);
                    return qty >= needed.quantity;
                  });

                  return (
                    <div key={recipe.id} className="p-3 bg-slate-900 border border-slate-800 hover:border-amber-500/20 rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-slate-200">{resultItem.name}</h4>
                          <span className="text-[10px] text-amber-500 font-mono">Type: {resultItem.type}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleCraftItem(recipe.id)}
                            disabled={!hasIngredients || (p2pMode === "multiplayer" && activeChar.id !== myPlayerId)}
                            className={`px-3 py-1 text-xs font-mono font-bold rounded uppercase cursor-pointer border ${
                              hasIngredients && !(p2pMode === "multiplayer" && activeChar.id !== myPlayerId)
                                ? "bg-amber-500 border-amber-500 text-slate-950 hover:bg-amber-400"
                                : "bg-slate-950/50 border-slate-800 text-slate-500 cursor-not-allowed"
                            }`}
                          >
                            Forge
                          </button>
                          <button
                            onClick={() => setInspectedItemId(resultItem.id)}
                            className="px-3 py-1 text-[10px] font-mono border border-slate-700 hover:border-amber-400 rounded text-slate-400 hover:text-amber-400 transition-all text-center uppercase cursor-pointer"
                          >
                            Inspect
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-slate-500 block uppercase">Requires materials</span>
                        <div className="flex flex-wrap gap-2">
                          {recipe.ingredients.map(ing => {
                            const matDef = ITEMS_DATABASE[ing.itemId];
                            const stock = charInv.filter(i => i.id === ing.itemId).reduce((ac, cur) => ac + (cur.quantity || 1), 0);
                            const met = stock >= ing.quantity;

                            return (
                              <span
                                key={ing.itemId}
                                className={`text-[9px] font-mono px-2 py-0.5 border rounded ${
                                  met
                                    ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400"
                                    : "bg-red-950/10 border-red-900/30 text-red-400"
                                }`}
                              >
                                {matDef ? matDef.name : ing.itemId}: {stock}/{ing.quantity}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          <div className="bg-slate-950/40 p-5 rounded-lg border border-slate-800/40 space-y-4">
            <h3 className="text-md font-mono text-amber-400 uppercase font-bold border-b border-slate-800 pb-2">
              Your Scrap Metals stock
            </h3>
            <div className="space-y-2">
              {(() => {
                const charInv = activeChar.inventory || [];
                const materials = charInv.filter(i => i.type === "material");
                return materials.length === 0 ? (
                  <p className="text-xs text-slate-500 font-mono italic text-center py-10">No crafting iron or hides inside inventory bag.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {materials.map(mat => (
                      <div key={mat.id} className="p-2.5 bg-slate-900 rounded border border-slate-800">
                        <span className="text-xs font-bold text-slate-200 block truncate">{mat.name}</span>
                        <span className="text-[11px] font-mono text-amber-500">Stock: {mat.quantity || 1} units</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Inventory & Slot Equip */}
      {activeTab === "inventory" && activeChar && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-800/40 space-y-4">
            <h3 className="text-md font-mono text-amber-400 uppercase font-bold border-b border-slate-800 pb-2">
              🎒 Gear Equipment slots
            </h3>
            
            <div className="space-y-2 font-mono">
              {(Object.keys(SLOT_LABELS) as Array<keyof Equipment>).map(slot => {
                const item = activeChar.equipment[slot];
                return (
                  <div key={slot} className="flex justify-between items-center bg-slate-900 p-2.5 rounded border border-slate-800">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block font-bold">{SLOT_LABELS[slot]}</span>
                      {item ? (
                        <div>
                          <strong className="text-xs font-bold text-slate-200 block leading-tight">{item.name}</strong>
                          <span className="text-[9px] text-amber-500 font-mono leading-none">
                            {item.flatAtk && `+${item.flatAtk} ATK `}
                            {item.flatMaxHp && `+${item.flatMaxHp} MaxHP `}
                            {item.flatDef && `+${item.flatDef} DEF `}
                            {item.flatAccuracy && `+${item.flatAccuracy} ACC `}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-600 italic block">None Equipped</span>
                      )}
                    </div>
                    {item && !(p2pMode === "multiplayer" && activeChar.id !== myPlayerId) && (
                      <button
                        onClick={() => handleUnequipItem(activeChar, slot)}
                        className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 hover:border-red-500/40 text-red-400 text-[10px] uppercase font-bold cursor-pointer"
                      >
                        Unequip
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-950/40 p-5 rounded-lg border border-slate-800/40 space-y-4">
            <h3 className="text-md font-mono text-amber-400 uppercase font-bold border-b border-slate-800 pb-2">
              Bag Gear Vault
            </h3>
            
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {(() => {
                const charInv = activeChar.inventory || [];
                const gearItems = charInv.filter(i => EQUIPMENT_TYPES.includes(i.type));
                return gearItems.length === 0 ? (
                  <p className="text-xs text-slate-500 font-mono italic text-center py-10">No equipment items inside bag.</p>
                ) : (
                  gearItems.map(item => (
                    <div key={item.id} className="p-3 bg-slate-900 rounded border border-slate-800 hover:border-amber-500/20 flex justify-between items-center">
                      <div>
                        <strong className="text-xs font-bold text-slate-200 block">{item.name}</strong>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Type: {item.type}
                          {item.flatAtk && ` (+${item.flatAtk} ATK)`}
                          {item.flatMaxHp && ` (+${item.flatMaxHp} HP)`}
                          {item.flatDef && ` (+${item.flatDef} DEF)`}
                          {item.flatAccuracy && ` (+${item.flatAccuracy} ACC)`}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setInspectedItemId(item.id)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-355 font-mono text-[10px] uppercase font-bold rounded cursor-pointer border border-slate-700"
                        >
                          Inspect
                        </button>
                        {!(p2pMode === "multiplayer" && activeChar.id !== myPlayerId) && (
                          <button
                            onClick={() => handleEquipItem(activeChar, item)}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold rounded uppercase cursor-pointer"
                          >
                            Equip
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Stash Deposit / Withdraw */}
      {activeTab === "stash" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Gold Bank Transfer Panel */}
          <div className="md:col-span-2 bg-slate-950 p-4 rounded-lg border border-indigo-500/20 flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
            <div>
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold block">Guild Gold Vault</span>
              <div className="flex gap-4 items-center mt-1">
                <div className="text-xs font-mono">Team Purse: <span className="text-amber-400 font-bold">{gold}g</span></div>
                <div className="text-slate-700">|</div>
                <div className="text-xs font-mono">Guild Bank: <span className="text-indigo-400 font-bold">{stashGold}g</span></div>
              </div>
            </div>
            <div className="flex gap-2 items-center bg-slate-900 border border-slate-800 p-1.5 rounded">
              <input
                type="number"
                placeholder="Amount"
                value={transferAmount || ""}
                onChange={(e) => setTransferAmount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-20 bg-slate-950 text-slate-100 font-mono text-xs p-1 rounded focus:outline-none focus:border-indigo-500 border border-transparent text-center"
              />
              <button
                onClick={handleDepositGold}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] font-bold uppercase rounded cursor-pointer"
              >
                Deposit
              </button>
              <button
                onClick={handleWithdrawGold}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-450 text-slate-950 font-mono text-[10px] font-bold uppercase rounded cursor-pointer"
              >
                Withdraw
              </button>
            </div>
          </div>

                      {/* Personal Inventory Section */}
                      <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-800/40 space-y-4">
                        <h3 className="text-sm font-mono text-amber-400 uppercase font-bold border-b border-slate-800 pb-2">
                          🎒 Personal Bag
                        </h3>
                        
                        {/* Equipment Sublist */}
                        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                          <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Equipment Wares</span>
                          {(() => {
                            const charInv = activeChar.inventory || [];
                            const gearItems = charInv.filter(i => EQUIPMENT_TYPES.includes(i.type));
                            return gearItems.length === 0 ? (
                              <p className="text-[10px] text-slate-500 font-mono italic py-2">No gear in bag.</p>
                            ) : (
                              gearItems.map((item, idx) => (
                                <div key={`${item.id}-${idx}`} className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center font-mono">
                                  <div>
                                    <span className="text-xs font-bold text-slate-200 block truncate max-w-[150px]">{item.name}</span>
                                    <span className="text-[9px] text-slate-500">Type: {item.type}</span>
                                  </div>
                                  <div className="flex gap-1.5">
                                    <button
                                      onClick={() => setInspectedItemId(item.id)}
                                      className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[9px] uppercase font-bold rounded cursor-pointer"
                                    >
                                      Inspect
                                    </button>
                                    {!(p2pMode === "multiplayer" && activeChar.id !== myPlayerId) && (
                                      <button
                                        onClick={() => depositToStash(item)}
                                        className="px-2 py-0.5 border border-indigo-500/30 text-indigo-400 hover:border-indigo-400 text-[9px] uppercase font-bold rounded cursor-pointer"
                                      >
                                        Deposit
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))
                            );
                          })()}
                        </div>

                        {/* Materials Square Grid */}
                        <div className="pt-2 border-t border-slate-800/40">
                          <span className="text-[10px] text-slate-500 uppercase font-mono block mb-2">Materials Vault (Click to Deposit)</span>
                          {(() => {
                            const charInv = activeChar.inventory || [];
                            const materials = charInv.filter(i => i.type === "material");
                            const isLocked = p2pMode === "multiplayer" && activeChar.id !== myPlayerId;
                            return materials.length === 0 ? (
                              <p className="text-[10px] text-slate-500 font-mono italic py-4 text-center">No materials inside bag.</p>
                            ) : (
                              <div className="grid grid-cols-4 gap-2">
                                {materials.map((item, idx) => (
                                  <button
                                    key={`${item.id}-${idx}`}
                                    onClick={() => !isLocked && depositToStash(item)}
                                    disabled={isLocked}
                                    className={`relative w-16 h-16 p-1 bg-slate-900 border rounded flex flex-col items-center justify-between transition-all ${
                                      isLocked 
                                        ? "border-slate-800 opacity-60 cursor-not-allowed" 
                                        : "border-slate-800 hover:border-indigo-400 cursor-pointer hover:scale-105"
                                    }`}
                                    title={isLocked ? "Deposit locked" : `Click to deposit 1x ${item.name}`}
                                  >
                                    <span className="text-[8px] font-mono text-slate-400 text-center truncate max-w-full font-bold uppercase">
                                      {item.name.replace(" Ore", "").replace(" Pelt", "").replace(" Bloom", "").replace(" Bone", "")}
                                    </span>
                                    <span className="text-xl">
                                      {item.id === "iron_ore" && "⛏️"}
                                      {item.id === "wolf_pelt" && "🐺"}
                                      {item.id === "magic_bloom" && "🌸"}
                                      {item.id === "ancient_bone" && "🦴"}
                                    </span>
                                    <span className="absolute bottom-1 right-1 bg-slate-950/80 text-indigo-400 font-bold font-mono text-[9px] px-1 rounded leading-normal">
                                      x{item.quantity || 1}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

          {/* Shared Guild Lockbox Section */}
          <div className="bg-slate-950/40 p-5 rounded-lg border border-slate-800/40 space-y-4">
            <h3 className="text-sm font-mono text-amber-400 uppercase font-bold border-b border-slate-800 pb-2">
              📁 Shared Guild Lockbox
            </h3>
            
            {/* Equipment Sublist */}
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Equipment Wares</span>
              {sharedStash.filter(i => EQUIPMENT_TYPES.includes(i.type)).length === 0 ? (
                <p className="text-[10px] text-slate-500 font-mono italic py-2">No gear in lockbox.</p>
              ) : (
                sharedStash.filter(i => EQUIPMENT_TYPES.includes(i.type)).map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center font-mono">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block truncate max-w-[150px]">{item.name}</span>
                      <span className="text-[9px] text-slate-500">Type: {item.type}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setInspectedItemId(item.id)}
                        className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[9px] uppercase font-bold rounded cursor-pointer"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => withdrawFromStash(item)}
                        className="px-2 py-0.5 border border-amber-500/30 text-amber-400 hover:border-amber-400 text-[9px] uppercase font-bold rounded cursor-pointer"
                      >
                        Withdraw
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Materials Square Grid */}
            <div className="pt-2 border-t border-slate-800/40">
              <span className="text-[10px] text-slate-500 uppercase font-mono block mb-2">Materials Vault (Click to Withdraw)</span>
              {sharedStash.filter(i => i.type === "material").length === 0 ? (
                <p className="text-[10px] text-slate-500 font-mono italic py-4 text-center">No materials in lockbox.</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {sharedStash.filter(i => i.type === "material").map((item, idx) => (
                    <button
                      key={`${item.id}-${idx}`}
                      onClick={() => withdrawFromStash(item)}
                      className="relative w-16 h-16 p-1 bg-slate-900 border border-slate-800 hover:border-amber-400 rounded flex flex-col items-center justify-between cursor-pointer transition-all hover:scale-105"
                      title={`Click to withdraw 1x ${item.name}`}
                    >
                      <span className="text-[8px] font-mono text-slate-400 text-center truncate max-w-full font-bold uppercase">
                        {item.name.replace(" Ore", "").replace(" Pelt", "").replace(" Bloom", "").replace(" Bone", "")}
                      </span>
                      <span className="text-xl">
                        {item.id === "iron_ore" && "⛏️"}
                        {item.id === "wolf_pelt" && "🐺"}
                        {item.id === "magic_bloom" && "🌸"}
                        {item.id === "ancient_bone" && "🦴"}
                      </span>
                      <span className="absolute bottom-1 right-1 bg-slate-950/80 text-amber-400 font-bold font-mono text-[9px] px-1 rounded leading-normal">
                        x{item.quantity || 1}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Continue voting banner for P2P */}
      {p2pMode === "multiplayer" && continueCountdown !== null && (
        <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-lg text-center font-mono text-sm font-bold uppercase tracking-wider animate-pulse flex items-center justify-center gap-2">
          <span>🔔 Continue Vote Passed! Advancing in:</span>
          <span className="text-xl font-bold bg-indigo-500 text-slate-950 px-2.5 py-0.5 rounded">
            {continueCountdown}s
          </span>
        </div>
      )}
      {p2pMode === "multiplayer" && continueVotes.length > 0 && continueCountdown === null && (
        <div className="mt-6 p-3 bg-indigo-500/5 border border-indigo-500/20 text-indigo-400 rounded-lg text-center font-mono text-xs">
          ⏳ {continueVotes.includes(myPlayerId) ? "You voted to continue." : "Click continue to vote."} ({continueVotes.length}/{Math.ceil(party.length / 2)} votes)
        </div>
      )}

      {/* Action buttons at bottom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <button
          onClick={onContinue}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-mono font-bold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 hover:brightness-110 active:scale-[0.99] transition-all text-sm uppercase cursor-pointer"
          id="btn-confirm-rest"
        >
          <Sparkles className="w-4 h-4" /> Pack Camp & Continue map selection
        </button>

        <button
          onClick={onRestAndBattle}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-slate-950 font-mono font-bold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:brightness-110 active:scale-[0.99] transition-all text-sm uppercase cursor-pointer"
          id="btn-rest-battle"
        >
          <Heart className="w-4 h-4 text-slate-950" /> 🛌 Rest Feast & Battle (Heal 50%, Cure Fallen)
        </button>
      </div>

      {inspectedItemId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border-2 border-amber-500/40 rounded-xl p-6 max-w-md w-full relative">
            <h3 className="text-lg font-mono font-bold text-amber-400 uppercase tracking-wider mb-2">
              🔍 Item Inspection
            </h3>
            {(() => {
              const item = ITEMS_DATABASE[inspectedItemId];
              if (!item) return null;
              return (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-bold text-slate-100">{item.name}</h4>
                    <span className="text-xs font-mono text-slate-400">Type: {item.type}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs font-mono space-y-1.5">
                    <p className="text-amber-500 font-bold uppercase text-[10px] mb-1">Item Stats</p>
                    {item.flatAtk && <p className="text-slate-200">🗡️ Flat Attack: +{item.flatAtk}</p>}
                    {item.flatMaxHp && <p className="text-slate-200">💖 Flat Max HP: +{item.flatMaxHp}</p>}
                    {item.flatDef && <p className="text-slate-200">🛡️ Flat Defense: +{item.flatDef}</p>}
                    {item.flatAccuracy && <p className="text-slate-200">🎯 Flat Accuracy: +{item.flatAccuracy}%</p>}
                    {item.flatCrit && <p className="text-slate-200">✨ Flat Crit Rate: +{item.flatCrit}%</p>}
                    {item.flatDodge && <p className="text-slate-200">💨 Flat Dodge Rate: {item.flatDodge}%</p>}
                    {item.isTwoHanded && <p className="text-amber-400 font-bold">👐 Two-Handed Weapon</p>}
                    {item.statsBonus && Object.entries(item.statsBonus).map(([sName, val]) => (
                      <p key={sName} className="text-slate-300">📈 {sName} Attribute: +{val}</p>
                    ))}
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed italic bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    "{item.description}"
                  </div>
                  <button
                    onClick={() => setInspectedItemId(null)}
                    className="w-full py-2 bg-slate-850 hover:bg-slate-800 text-slate-200 font-mono text-xs uppercase rounded border border-slate-800"
                  >
                    Close Inspection
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
