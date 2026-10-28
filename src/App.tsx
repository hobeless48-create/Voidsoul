/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Character, Item, AdvancedClassName, ChoiceEffect, CharacterClass, Enemy } from "./types";
import { BroadcastLobby } from "./components/BroadcastLobby";
import { BattleScene } from "./components/BattleScene";
import { CampingMenu } from "./components/CampingMenu";
import { MapEventList, MapNode } from "./components/MapEventList";
import { ClassAdvancement } from "./components/ClassAdvancement";
import { ProfileView } from "./components/ProfileView";
import { HelpGuide } from "./components/HelpGuide";
import { spawnEnemyGroup, spawnFixedEncounter, getMaxAreaForChapter, getChapterDisplayName, getChapterEmoji } from "./enemies_db";
import { syncBridge } from "./utils/sync";
import { CLASS_AVATARS, getDerivedStats, START_STATS, getBaseClass } from "./skills_db";
import { ITEMS_DATABASE } from "./items_db";
import { MYSTERY_STORIES } from "./events_db";
import { Swords, RefreshCw, Trophy, Skull } from "lucide-react";

// ── Pure helpers kept outside the component so they are never re-created ──

/** XP → Level formula: level = floor((1 + sqrt(1 + 8·xp/3)) / 2) */
const xpToLevel = (xp: number): number => {
  const level = Math.floor((1 + Math.sqrt(1 + (8 * xp) / 3)) / 2);
  return Math.max(1, level);
};

/** Cumulative XP needed to reach a given level: level*(level-1)/2 * 3 */
const xpForLevel = (level: number): number => {
  return Math.floor((level * (level - 1)) / 2 * 3);
};

const isTier3Class = (cl: string): boolean => {
  return [
    "Warlord", "Paladin", "Hawkeye", "Storm Dancer",
    "Archmage", "Void Caller", "Seraph", "Crusader",
    "Phantom", "Blade Saint", "Herald of Glory", "Entropy Singer"
  ].includes(cl);
};

const isAdvanced = (cl: string): boolean => {
  return [
    "Berserker", "Knight", "Sharpshooter", "Bolt Slinger",
    "Elementalist", "Summoner", "High Priest", "Inquisitor",
    "Assassin", "Duelist", "Bard of Valor", "Bard of Chaos"
  ].includes(cl);
};

export function getPendingPromotion(char: Character): boolean {
  if (char.level >= 15 && !isAdvanced(char.class) && !isTier3Class(char.class)) {
    return true;
  }
  if (char.level >= 30 && isAdvanced(char.class) && !isTier3Class(char.class)) {
    return true;
  }
  if (char.level >= 50 && isTier3Class(char.class) && !char.subclass) {
    return true;
  }
  if (char.level >= 75 && isTier3Class(char.class) && char.subclass && !char.tier5Acknowledged) {
    return true;
  }
  return false;
}

type GamePhase = "LOBBY" | "MAP" | "BATTLE" | "CAMP" | "PROMOTION" | "GAMEOVER" | "VICTORY" | "PROFILE" | "PATH_CHOICE";

export default function App() {
  const [phase, setPhase] = useState<GamePhase>("LOBBY");
  const [p2pMode, setP2pMode] = useState<"solo" | "multiplayer">("solo");
  const [roomId, setRoomId] = useState<string>("");
  const [myPlayerId, setMyPlayerId] = useState<string>("");

  // Game Run States
  const [party, setParty] = useState<Character[]>([]);
  const partyRef = useRef<Character[]>(party);
  const hasSavedEndRunRef = useRef(false);
  const eventCombatRef = useRef(false);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [sharedStash, setSharedStash] = useState<Item[]>([]);
  const [gold, setGold] = useState<number>(50);
  const [stashGold, setStashGold] = useState<number>(0);
  const [chapter, setChapter] = useState<number>(1);
  const [area, setArea] = useState<number>(0);
  const [maxArea, setMaxArea] = useState<number>(8); // Forest 8 lanes
  const [way, setWay] = useState<number>(1); // 1 or 2 - main path choice after chapter 1
  const [path, setPath] = useState<number>(1); // 1 or 2 - branch choice after chapter 3
  const [forceShopNext, setForceShopNext] = useState<boolean>(false);

  // Current Battle state
  const [combatEnemies, setCombatEnemies] = useState<Enemy[]>([]);

  // Eligible promotion placeholder
  const [pendingPromotionChar, setPendingPromotionChar] = useState<Character | null>(null);

  // Map choices templates
  const [availableNodes, setAvailableNodes] = useState<MapNode[]>([]);

  // Global floating notifications
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  // Lifted mystery story and shop states
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [activeShopOpen, setActiveShopOpen] = useState<boolean>(false);
  const [activeShopWares, setActiveShopWares] = useState<string[]>([]);

  // Voting states
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [countdown, setCountdown] = useState<number | null>(null);

  // Continue voting (for advancing after camp/shop/event)
  const [continueVotes, setContinueVotes] = useState<string[]>([]);
  const [continueCountdown, setContinueCountdown] = useState<number | null>(null);

  const showNotification = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = "notif_" + Date.now() + Math.random().toString(36).substr(2, 3);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  };

  useEffect(() => {
    (window as any).showNotification = showNotification;
  }, []);

  // (xpToLevel / xpForLevel are defined above the component)

  const savePartyProfiles = async (currentParty: Character[], currentGold = gold) => {
    for (const char of currentParty) {
      if (!char.isSummon && char.name) {
        const existing = await syncBridge.loadProfile(char.name);
        const baseCls = getBaseClass(char.class);
        const talentPointsByClass = { ...(existing?.talentPointsByClass || {}) };
        const unlockedTalentsByClass = { ...(existing?.unlockedTalentsByClass || {}) };

        talentPointsByClass[baseCls] = char.talentPoints || 0;
        unlockedTalentsByClass[baseCls] = char.unlockedTalents || [];

        const totalXp = (existing?.xp || 0) + (char.xp || 0);
        const lobbyLevel = xpToLevel(totalXp);

        await syncBridge.saveProfile(char.name, {
          ...existing,
          id: char.id,
          username: char.name,
          level: lobbyLevel,
          xp: totalXp,
          talentPoints: char.talentPoints || 0,
          unlockedTalents: char.unlockedTalents || [],
          talentPointsByClass,
          unlockedTalentsByClass,
          race: char.race || (existing ? existing.race : "Human"),
          avatarUrl: char.avatarUrl || (existing ? existing.avatarUrl : ""),
          class: baseCls,
        });
      }
    }
    // Batch-reset per-battle XP in a single setState call (avoids N re-renders)
    setParty(prev => prev.map(p => ({ ...p, xp: 0 })));
  };

  const savePartyProfilesEndRun = async (currentParty: Character[], currentGold = gold) => {
    for (const char of currentParty) {
      if (!char.isSummon && char.name) {
        const existing = await syncBridge.loadProfile(char.name);
        const baseCls = getBaseClass(char.class);
        const talentPointsByClass = { ...(existing?.talentPointsByClass || {}) };
        const unlockedTalentsByClass = { ...(existing?.unlockedTalentsByClass || {}) };

        const totalXp = (existing?.xp || 0) + (char.xp || 0);
        const lobbyLevel = xpToLevel(totalXp);

        const startPoints = existing?.talentPointsByClass?.[baseCls] ?? existing?.talentPoints ?? 0;
        const earnedPoints = Math.max(0, (char.talentPoints || 0) - startPoints);
        const totalBasePoints = startPoints + earnedPoints + 1;

        talentPointsByClass[baseCls] = totalBasePoints;
        unlockedTalentsByClass[baseCls] = char.unlockedTalents || (existing?.unlockedTalents || []);

        await syncBridge.saveProfile(char.name, {
          ...existing,
          id: char.id,
          username: char.name,
          level: lobbyLevel,
          xp: totalXp,
          talentPoints: totalBasePoints,
          unlockedTalents: unlockedTalentsByClass[baseCls],
          talentPointsByClass,
          unlockedTalentsByClass,
          race: char.race || (existing ? existing.race : "Human"),
          avatarUrl: char.avatarUrl || (existing ? existing.avatarUrl : ""),
          class: baseCls,
        });
      }
    }
  };

  // Auto-save on GAMEOVER (only once per run)
  useEffect(() => {
    if (phase === "GAMEOVER" && party.length > 0 && !hasSavedEndRunRef.current) {
      hasSavedEndRunRef.current = true;
      savePartyProfilesEndRun(party);
    }
  }, [phase]);

  // Keep partyRef in sync with party state
  useEffect(() => { partyRef.current = party; }, [party]);

  // Web Sockets P2P Sync Bridge
  useEffect(() => {
    if (p2pMode !== "multiplayer" || !roomId) return;

    syncBridge.init(roomId, `aac-game-${roomId}`, (data) => {
      const { type, payload } = data;
      if (type === "SYNC_GLOBAL_STATE") {
        setPhase(payload.phase);
        setParty(payload.party);
        setInventory(payload.inventory);
        setSharedStash(payload.sharedStash);
        setGold(payload.gold);
        setStashGold(payload.stashGold || 0);
        setChapter(payload.chapter);
        setArea(payload.area);
        setMaxArea(payload.maxArea);
        setAvailableNodes(payload.availableNodes);
        setCombatEnemies(payload.combatEnemies);
        setActiveStoryIndex(payload.activeStoryIndex);
        setActiveShopOpen(payload.activeShopOpen);
        if (payload.activeShopWares) setActiveShopWares(payload.activeShopWares);
      } else if (type === "SYNC_VOTES") {
        setVotes(payload.votes || {});
      } else if (type === "SYNC_CONTINUE_VOTE") {
        setContinueVotes(payload.voterIds || []);
      } else if (type === "SYNC_RESET_CONTINUE_VOTE") {
        setContinueVotes([]);
        setContinueCountdown(null);
      } else if (type === "PLAYER_QUIT") {
        const quitterId = payload.playerId;
        const updatedParty = partyRef.current.filter(p => p.id !== quitterId);
        if (updatedParty.length === 0) {
          setPhase("GAMEOVER");
          showNotification("All players have quit the game.", "error");
        } else {
          setParty(updatedParty);
          showNotification(`Player ${quitterId} has quit the game.`, "info");
        }
      } else if (type === "PLAYER_KICKED") {
        const kickedId = payload.kickedPlayerId;
        if (kickedId === myPlayerId) {
          setPhase("GAMEOVER");
          showNotification("You have been kicked from the game.", "error");
        } else {
          const updatedParty = partyRef.current.filter(p => p.id !== kickedId);
          setParty(updatedParty);
          showNotification(`Player ${kickedId} has been kicked.`, "info");
        }
      }
    });

    return () => {
      // Cleanup is managed by syncBridge
    };
  }, [p2pMode, roomId, myPlayerId]);

  const lastGlobalBroadcastRef = useRef<string>("");

  const broadcastGlobalState = (
    nextPhase: GamePhase,
    nextParty: Character[],
    nextInv: Item[],
    nextStash: Item[],
    nextGold: number,
    nextCh: number,
    nextAr: number,
    nextMaxAr: number,
    nextNodes: MapNode[],
    nextEnemies: any[],
    storyIdx: number | null = activeStoryIndex,
    shopOpen: boolean = activeShopOpen,
    nextStashGold: number = stashGold,
    shopWares: string[] = activeShopWares
  ) => {
    if (p2pMode === "multiplayer" && roomId) {
      const payload = {
        phase: nextPhase,
        party: nextParty,
        inventory: nextInv,
        sharedStash: nextStash,
        gold: nextGold,
        stashGold: nextStashGold,
        chapter: nextCh,
        area: nextAr,
        maxArea: nextMaxAr,
        availableNodes: nextNodes,
        combatEnemies: nextEnemies,
        activeStoryIndex: storyIdx,
        activeShopOpen: shopOpen,
        activeShopWares: shopWares,
      };
      
      const payloadStr = JSON.stringify(payload);
      if (lastGlobalBroadcastRef.current === payloadStr) return;
      lastGlobalBroadcastRef.current = payloadStr;

      syncBridge.send(`aac-game-${roomId}`, {
        type: "SYNC_GLOBAL_STATE",
        payload,
      });
    }
  };

  // Voting countdown effect
  useEffect(() => {
    if (p2pMode !== "multiplayer" || !roomId || party.length === 0) return;

    const threshold = Math.ceil(party.length / 2);
    const totalVotes = Object.keys(votes).length;

    if (totalVotes >= threshold) {
      if (countdown === null) {
        setCountdown(5);
      }
    } else {
      if (countdown !== null) {
        setCountdown(null);
      }
    }
  }, [votes, party, p2pMode, roomId]);

  // Countdown tick
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      resolveActiveVote();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, votes]); // votes dep ensures resolveActiveVote reads current vote state

  const castVote = (choiceId: string) => {
    if (p2pMode !== "multiplayer" || !roomId) return;
    const nextVotes = { ...votes, [myPlayerId]: choiceId };
    setVotes(nextVotes);

    syncBridge.send(`aac-game-${roomId}`, {
      type: "SYNC_VOTES",
      payload: { votes: nextVotes },
    });
  };

  const resolveActiveVote = () => {
    const isHost = party.length > 0 && myPlayerId === party[0].id;
    if (!isHost) {
      setCountdown(null);
      setVotes({});
      return;
    }

    const choiceCounts: Record<string, number> = {};
    (Object.values(votes) as string[]).forEach(choice => {
      choiceCounts[choice] = (choiceCounts[choice] || 0) + 1;
    });

    let winningChoice = "";
    let maxCount = -1;
    Object.entries(choiceCounts).forEach(([choice, count]) => {
      if (count > maxCount) {
        maxCount = count;
        winningChoice = choice;
      }
    });

    // Reset votes state
    setCountdown(null);
    setVotes({});
    syncBridge.send(`aac-game-${roomId}`, {
      type: "SYNC_VOTES",
      payload: { votes: {} },
    });

    if (!winningChoice) return;

    if (winningChoice.startsWith("node_")) {
      const idx = parseInt(winningChoice.replace("node_", ""), 10);
      const node = availableNodes[idx];
      if (node) {
        if (node.type === "event") {
          const rng = Math.floor(Math.random() * MYSTERY_STORIES.length);
          handleSetStoryIndex(rng);
        } else if (node.type === "shop") {
          handleSetShopOpen(true);
        } else {
          handleSelectNode(node);
        }
      }
    } else if (winningChoice.startsWith("story_")) {
      const idx = parseInt(winningChoice.replace("story_", ""), 10);
      if (activeStoryIndex !== null) {
        executeStoryChoice(activeStoryIndex, idx);
      }
    }
  };

  // ===== Continue Voting (for advancing after camp/shop/event) =====
  const castContinueVote = () => {
    if (p2pMode !== "multiplayer" || !roomId) return;
    const nextIds = [...new Set([...continueVotes, myPlayerId])];
    setContinueVotes(nextIds);
    syncBridge.send(`aac-game-${roomId}`, {
      type: "SYNC_CONTINUE_VOTE",
      payload: { voterIds: nextIds },
    });
  };

  // Continue vote countdown effect
  useEffect(() => {
    if (p2pMode !== "multiplayer" || !roomId || party.length === 0) return;
    const threshold = Math.ceil(party.length / 2);
    if (continueVotes.length >= threshold) {
      if (continueCountdown === null) {
        setContinueCountdown(5);
      }
    } else {
      if (continueCountdown !== null) {
        setContinueCountdown(null);
      }
    }
  }, [continueVotes, party, p2pMode, roomId]);

  // Continue vote countdown tick
  useEffect(() => {
    if (continueCountdown === null) return;
    if (continueCountdown === 0) {
      resolveContinueVote();
      return;
    }
    const timer = setTimeout(() => {
      setContinueCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [continueCountdown]);

  const resolveContinueVote = () => {
    const isHost = party.length > 0 && myPlayerId === party[0].id;
    // Reset votes on all clients
    if (roomId) {
      syncBridge.send(`aac-game-${roomId}`, {
        type: "SYNC_RESET_CONTINUE_VOTE",
        payload: {},
      });
    }
    setContinueVotes([]);
    setContinueCountdown(null);

    if (!isHost) return;

    // Host executes the continue action
    // Close shop if open, then advance to camp
    if (activeShopOpen) {
      setActiveShopOpen(false);
      handleLeaveCampground();
    } else if (activeStoryIndex !== null) {
      // After event, close story and proceed
      setActiveStoryIndex(null);
      handleLeaveCampground();
    } else {
      // Default: leave campground (from camp screen)
      handleLeaveCampground();
    }
  };

  const hasCombatEffect = (eff: ChoiceEffect | undefined): boolean => {
    if (!eff) return false;
    if (eff.type === "combat") return true;
    return (
      hasCombatEffect(eff.successEffect) ||
      hasCombatEffect(eff.failEffect) ||
      (eff.randomEffects?.some(re => hasCombatEffect(re.effect)) ?? false)
    );
  };

  const resolveEffect = (
    effect: ChoiceEffect | undefined,
    partyState: Character[],
    invState: Item[],
    goldState: number,
    logMsg: string[],
    triggeredBy?: string
  ): { p: Character[]; inv: Item[]; g: number; status: "success" | "error" | "info" } => {
    let p = [...partyState];
    let inv = [...invState];
    let g = goldState;
    let status: "success" | "error" | "info" = "info";

    if (!effect) return { p, inv, g, status };

    switch (effect.type) {
      case "none":
        if (effect.message) logMsg.push(effect.message);
        break;
      case "gold":
        if (effect.goldVal !== undefined) {
          let goldChange = effect.goldVal;
          if (goldChange > 0 && p.some(char => char.race === "Goblin")) {
            goldChange = Math.floor(goldChange * 1.25);
          }
          g = Math.max(0, g + goldChange);
          logMsg.push(goldChange > 0 ? `✓ Gained ${goldChange} Gold!${p.some(char => char.race === "Goblin") ? " [Goblin +25% Gold]" : ""}` : `✗ Spent ${Math.abs(goldChange)} Gold.`);
          status = goldChange > 0 ? "success" : "error";
          if (effect.successEffect) {
            const next = resolveEffect(effect.successEffect, p, inv, g, logMsg);
            p = next.p; inv = next.inv; g = next.g;
          }
        }
        break;
      case "xp":
        if (effect.xpVal !== undefined) {
          p = p.map(char => ({ ...char, xp: char.xp + effect.xpVal! }));
          logMsg.push(`✓ Party gained +${effect.xpVal} XP!`);
          status = "success";
          if (effect.successEffect) {
            const next = resolveEffect(effect.successEffect, p, inv, g, logMsg);
            p = next.p; inv = next.inv; g = next.g;
          }
        }
        break;
      case "hp":
        if (effect.hpVal !== undefined) {
          p = p.map(char => ({ ...char, hp: Math.max(1, Math.min(char.maxHp, char.hp + effect.hpVal!)) }));
          logMsg.push(effect.hpVal > 0 ? `✓ Party healed for ${effect.hpVal} HP!` : `✗ Party lost ${Math.abs(effect.hpVal)} HP!`);
          status = effect.hpVal > 0 ? "success" : "error";
          if (effect.successEffect) {
            const next = resolveEffect(effect.successEffect, p, inv, g, logMsg);
            p = next.p; inv = next.inv; g = next.g;
          }
        }
        break;
      case "hp_pct":
        if (effect.hpPct !== undefined) {
          p = p.map(char => {
            const diff = Math.round(char.maxHp * effect.hpPct!);
            return { ...char, hp: Math.max(10, Math.min(char.maxHp, char.hp + diff)) };
          });
          const pct = Math.round(Math.abs(effect.hpPct) * 100);
          logMsg.push(effect.hpPct > 0 ? `✓ Party healed for ${pct}% HP!` : `✗ Party lost ${pct}% HP!`);
          status = effect.hpPct > 0 ? "success" : "error";
          if (effect.successEffect) {
            const next = resolveEffect(effect.successEffect, p, inv, g, logMsg);
            p = next.p; inv = next.inv; g = next.g;
          }
        }
        break;
      case "item":
        if (effect.itemId) {
          // Fix: explicitly handle 0 quantity instead of treating as falsy
          const quantity = effect.quantity !== undefined ? effect.quantity : 1;
          const dbItem = ITEMS_DATABASE[effect.itemId];
          if (dbItem && quantity > 0) {
            // Fix: validate recipient exists before assigning items
            let recipientId = "";
            if (p2pMode === "multiplayer") {
              const targetChar = p.find(c => c.id === triggeredBy) || p.find(c => c.id === myPlayerId);
              recipientId = targetChar ? targetChar.id : (p[0]?.id || "");
            } else {
              recipientId = p[0]?.id || "";
            }
            
            if (recipientId) {
              p = p.map(char => {
                if (char.id === recipientId) {
                  const charInv = char.inventory || [];
                  const existingIdx = charInv.findIndex(i => i.id === effect.itemId);
                  let nextInv = [...charInv];
                  if (existingIdx !== -1) {
                    nextInv[existingIdx] = {
                      ...nextInv[existingIdx],
                      quantity: (nextInv[existingIdx].quantity || 0) + quantity
                    };
                  } else {
                    nextInv.push({ ...dbItem, quantity });
                  }
                  return { ...char, inventory: nextInv };
                }
                return char;
              });
              logMsg.push(`✓ Obtained ${quantity}x ${dbItem.name}!`);
              status = "success";
            } else {
              logMsg.push(`✗ No recipient found for item: ${effect.itemId}`);
              status = "error";
            }
            if (effect.successEffect) {
              const next = resolveEffect(effect.successEffect, p, inv, g, logMsg);
              p = next.p; inv = next.inv; g = next.g;
            }
          } else if (!dbItem) {
            logMsg.push(`✗ Item not found: ${effect.itemId}`);
            status = "error";
          }
        }
        break;
      case "stat_check":
        if (effect.stat && effect.threshold !== undefined) {
          const hasSuccubus = p.some(char => char.race === "Succubus");
          const threshold = hasSuccubus ? Math.round(effect.threshold * 0.80) : effect.threshold;
          const maxVal = Math.max(...p.map(char => char.stats[effect.stat!] || 0));
          if (maxVal >= threshold) {
            logMsg.push(`✓ [${effect.stat} Check SUCCESS] (Highest ${effect.stat}: ${maxVal} >= ${threshold}${hasSuccubus ? " [Succubus -20% Threshold]" : ""}).`);
            status = "success";
            if (effect.successEffect) {
              const next = resolveEffect(effect.successEffect, p, inv, g, logMsg);
              p = next.p; inv = next.inv; g = next.g;
            }
          } else {
            logMsg.push(`✗ [${effect.stat} Check FAILED] (Highest ${effect.stat}: ${maxVal} < ${threshold}${hasSuccubus ? " [Succubus -20% Threshold]" : ""}).`);
            status = "error";
            if (effect.failEffect) {
              const next = resolveEffect(effect.failEffect, p, inv, g, logMsg);
              p = next.p; inv = next.inv; g = next.g;
            }
          }
        }
        break;
      case "random":
        if (effect.randomEffects && effect.randomEffects.length > 0) {
          const roll = Math.random();
          let accum = 0;
          let entry = effect.randomEffects[0];
          for (const re of effect.randomEffects) {
            accum += re.chance;
            if (roll <= accum) {
              entry = re;
              break;
            }
          }
          logMsg.push(`🎲 ${entry.msg}`);
          const next = resolveEffect(entry.effect, p, inv, g, logMsg);
          p = next.p; inv = next.inv; g = next.g;
          status = next.status;
        }
        break;
      case "talent_point":
        if (effect.quantity !== undefined) {
          p = p.map(char => ({ ...char, talentPoints: (char.talentPoints || 0) + effect.quantity! }));
          logMsg.push(`✓ Gained +${effect.quantity} Talent Points!`);
          status = "success";
          if (effect.successEffect) {
            const next = resolveEffect(effect.successEffect, p, inv, g, logMsg);
            p = next.p; inv = next.inv; g = next.g;
          }
        }
        break;
      case "status":
        if (effect.statusType) {
          p = p.map(char => {
            const current = char.statusEffects || [];
            return {
              ...char,
              statusEffects: [
                ...current.filter(se => se.type !== effect.statusType),
                { type: effect.statusType as any, value: effect.statusVal || 1, duration: effect.statusDur || 1 }
              ]
            };
          });
          logMsg.push(`⚡ Status applied: ${effect.statusType}!`);
          status = "info";
          if (effect.successEffect) {
            const next = resolveEffect(effect.successEffect, p, inv, g, logMsg);
            p = next.p; inv = next.inv; g = next.g;
          }
        }
        break;
      case "regen":
        // Apply regen status to all party members
        p = p.map(char => ({
          ...char,
          statusEffects: [
            ...char.statusEffects.filter(se => se.type !== "regen"),
            { type: "regen" as const, value: effect.statusVal || 5, duration: effect.statusDur || 3 }
          ]
        }));
        logMsg.push(`✓ Party regenerating ${effect.statusVal || 5} HP/turn for ${effect.statusDur || 3} turns!`);
        status = "success";
        if (effect.successEffect) {
          const next = resolveEffect(effect.successEffect, p, inv, g, logMsg);
          p = next.p; inv = next.inv; g = next.g;
        }
        break;
      case "combat":
        if (effect.message) logMsg.push(effect.message);
        break;
      default:
        break;
    }

    return { p, inv, g, status };
  };

  const executeStoryChoice = (storyIdx: number, choiceIdx: number) => {
    const story = MYSTERY_STORIES[storyIdx];
    if (!story) return;
    const choice = story.choices[choiceIdx];
    if (!choice) return;

    const logMsg: string[] = [];

    // Resolve the event's effects (gold, hp, xp, stat checks, items, etc.)
    const { p, inv, g, status } = resolveEffect(choice.effect, party, inventory, gold, logMsg, myPlayerId);

    setParty(p);
    setInventory(inv);
    setGold(g);
    setActiveStoryIndex(null);

    const mergedMsg = logMsg.join(" ");
    if ((window as any).showNotification) {
      (window as any).showNotification(mergedMsg || "Story event resolved.", status);
    }

    // After EVERY event, always trigger a battle encounter.
    // Events with explicit combat choices or fail-combat ARE the mandatory battle.
    // Events resolved without combat also spawn a mandatory fixed encounter.
    // Area advances normally after this battle (eventCombatRef stays false).
    const isElite = story.stars !== undefined && story.stars >= 4;
    const activeEnemies = spawnFixedEncounter(chapter, area, p.length, isElite, way, path);
    setCombatEnemies(activeEnemies);
    setPhase("BATTLE");
    broadcastGlobalState("BATTLE", p, inv, sharedStash, g, chapter, area, maxArea, availableNodes, activeEnemies, null, activeShopOpen);
  };

  const handleSetStoryIndex = (idx: number | null) => {
    setActiveStoryIndex(idx);
    broadcastGlobalState(phase, party, inventory, sharedStash, gold, chapter, area, maxArea, availableNodes, combatEnemies, idx, activeShopOpen);
  };

  const generateShopWares = (): string[] => {
    const regularItems = [
      "minor_heal", "major_heal", "regeneration_elixir", "energy_brew", "iron_ore", "wolf_pelt",
      "magic_bloom", "lucky_clover", "antidote", "stun_cure", "burn_cure", "freeze_cure", "shock_cure",
      "poison_vial", "stun_grenade", "burn_powder", "freeze_crystal", "shock_orb", "strength_potion",
      "dexterity_potion", "constitution_potion", "intelligence_potion", "faith_potion", "charisma_potion", "luck_potion"
    ];

    const specialItems = [
      "cursed_blade_of_vareth", "stormreaver_longbow", "soulflame_grimoire", "seraphs_judgment_hammer",
      "phantom_eclipse_dagger", "entropys_lament_lyre", "warlords_titan_cleaver", "riftweaver_staff",
      "abyssal_sovereign_plate", "starweaver_robes", "wraithsilk_shroud", "divine_seraph_vestments",
      "volcanic_fury_greaves", "eaglelord_winged_boots", "dread_sovereign_helm", "voidwalker_crown",
      "ring_of_eternal_fury", "seraphs_tear_of_life", "phantom_mirror_pendant", "dragonheart_core_amulet",
      "luckweavers_fate_thread", "void_anchor_of_stability", "crusaders_unbreakable_oath", "hawkeyes_eternal_focus",
      "phoenix_rebirth_charm", "archdemon_essence_vial", "void_power_crystal", "alliance_holy_blessing",
      "demon_eye_of_true_sight", "chaos_elixir_of_transcendence", "timbergiant_heartwood_core",
      "bone_drake_skeletal_wing", "archdemon_smoldering_horn", "vareth_soul_crystal"
    ];

    const specialIndex = Math.floor(Math.random() * specialItems.length);
    const selectedSpecialItem = specialItems[specialIndex];

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

  const handleSetShopOpen = (open: boolean) => {
    setActiveShopOpen(open);
    let wares = activeShopWares;
    if (open) {
      wares = generateShopWares();
      setActiveShopWares(wares);
    }
    broadcastGlobalState(phase, party, inventory, sharedStash, gold, chapter, area, maxArea, availableNodes, combatEnemies, activeStoryIndex, open, stashGold, wares);
  };

  const handleStartGame = (
    chosenParty: Character[],
    mode: "solo" | "multiplayer",
    room: string,
    myId: string
  ) => {
    const startingInventory: Item[] = [
      { id: "minor_heal", name: "Minor Healing Potion", type: "consumable", description: "Restores HP", value: 15, quantity: 2 },
      { id: "iron_ore", name: "Iron Ore", type: "material", description: "Scrap metals", value: 10, quantity: 3 },
      { id: "wolf_pelt", name: "Wolf Pelt", type: "material", description: "Soft pelt", value: 10, quantity: 2 },
    ];
    const updatedParty = chosenParty.map((char, idx) => {
      const charWithStart = {
        ...char,
        runStartLevel: char.level,
      };
      if (idx === 0) {
        return {
          ...charWithStart,
          inventory: [...(char.inventory || []), ...startingInventory]
        };
      }
      return charWithStart;
    });

    setParty(updatedParty);
    setP2pMode(mode);
    setRoomId(room);
    setMyPlayerId(myId);
    setGold(150);
    setInventory([]);
    setChapter(1);
    setArea(0);
    setMaxArea(8);
    setWay(1);
    setPath(1);

    const isHost = mode === "solo" || updatedParty.length === 0 || myId === updatedParty[0].id;

    if (isHost) {
      const initialPaths = generateMapNodes(1, 1, false);
      setAvailableNodes(initialPaths);
      broadcastGlobalState(
        "MAP",
        updatedParty,
        [],
        [],
        150,
        1,
        0,
        8,
        initialPaths,
        []
      );
    } else {
      // Non-host will receive the nodes via SYNC_GLOBAL_STATE broadcast from host
      setAvailableNodes([]);
    }

    setPhase("MAP");
  };

  const generateMapNodes = (ch: number, ar: number, isBossArea: boolean, forceShop?: boolean, currentWay?: number, currentPath?: number): MapNode[] => {
    const w = currentWay || way;
    const p = currentPath || path;

    if (isBossArea) {
      // Show 3 choices before boss: rest, boss door, buff
      return [
        { type: "rest", stars: 1, label: `🛌 Rest Before Boss` },
        { type: "boss", stars: 3, label: `👑 Boss: ${getChapterDisplayName(ch, w, p)}` },
        { type: "event", stars: 2, label: `💪 Final Preparations` }
      ];
    }

    // Labels based on current area
    const getCombatLabel = (): string => {
      const pools: Record<string, string[]> = {
        "1": ["🐺 Forest Wolf Pack", "🌿 Mandrake Grove", "🕷️ Spider Nest", "💂 Goblin Patrol"],
        "2_1": ["⛏️ Skeleton Miners", "🦇 Bat Swarm", "🪨 Cave Goblin Scouts", "🌱 Sporeling Cluster"],
        "2_2": ["💀 Crypt Ghouls", "🏹 Skeleton Archers", "🪦 Grave Sentries", "🦅 Stone Gargoyles"],
        "3_1": ["🐗 Goblin Raiders", "🏹 Goblin Archers", "🐺 Dire Wolf Pack", "🪤 Trap Goblins"],
        "3_2": ["⚔️ Evil Adventurers", "🗡️ Rogue Rivals", "🔥 Mercenary Mages", "⛓️ Bandit Leaders"],
        "4_1_1": ["💀 Skeleton Warriors", "☠️ Crypt Ghouls", "👻 Wraith Specters", "☠️ Bone Archers"],
        "4_1_2": ["💰 Greedy Villagers", "🎭 Illusion Thieves", "🤖 Hoarder Constructs", "💎 Golden Golems"],
        "4_2_1": ["🦅 Sky Harpies", "⛈️ Storm Birds", "🐉 Aerial Serpents", "☁️ Cloud Elementals"],
        "4_2_2": ["😈 Demon Knights", "🐕 Hellhounds", "👿 Void Imps", "🛡️ Armored Fiends"],
        "5_1_1": ["🌀 Voidling Spawns", "👻 Rift Wraiths", "🌑 Shadow Amalgams", "🌀 Anomaly Tendrils"],
        "5_1_2": ["🪽 Fallen Angel Scouts", "😇 Corrupted Seraphs", "🕊️ Winged Betrayers", "🌑 Shadowed Heralds"],
        "5_2_1": ["🧪 Acidic Slimes", "💧 Gelatinous Oozes", "🧬 Toxic Blobs", "💎 Crystal Slimes"],
        "5_2_2": ["⚔️ Demon Knight Elites", "🎖️ Demon Generals", "🌑 Shadow Fiends", "🔥 Infernal Mages"],
      };
      const key = ch === 1 ? "1" : `${ch}_${w}${ch >= 4 ? `_${p}` : ""}`;
      const pool = pools[key] || ["⚔️ Enemy Encounter"];
      return pool[Math.floor(Math.random() * pool.length)];
    };

    const getEliteLabel = (): string => {
      const pools: Record<string, string[]> = {
        "1": ["💀 Elite Bandit Outpost", "🐢 Mossback Tortoise Den", "🍄 Fungal Giant Siege"],
        "2_1": ["💎 Crystal Elemental Boss", "🕷️ Giant Cave Spider", "🪨 Rock Titan"],
        "2_2": ["🏰 Tomb Guardian", "🦴 Bone Colossus", "💀 Death's Herald"],
        "3_1": ["⚔️ Goblin War Chief", "🐺 Alpha Dire Wolf", "🔥 Shaman's Ritual"],
        "3_2": ["💂 City Watch Captain", "💰 Merchant Lord's Guard", "🏪 Trade Baron"],
        "4_1_1": ["👑 Lich's Lieutenant", "💀 Bone Dragon", "📜 Ancient Lich"],
        "4_1_2": ["💰 Greed Incarnate", "🏆 Illusion Master", "💎 Golden Guardian"],
        "4_2_1": ["🦅 Storm Harpy Queen", "🐉 Sky Serpent", "⛈️ Tempest Elemental"],
        "4_2_2": ["😈 Demon Captain", "🔥 Infernal Beast", "🛡️ Demon Commander"],
        "5_1_1": ["🌀 Void Lord's Herald", "🌌 Reality Walker", "👁️ Void Seer"],
        "5_1_2": ["🪽 Fallen Archangel", "😇 Corrupted Dominion", "⚔️ Heaven's Betrayer"],
        "5_2_1": ["🧪 Experiment 13", "🧬 Mutant Alpha", "💎 Crystal Horror"],
        "5_2_2": ["🔥 Archfiend", "🛡️ Demon General", "👿 Shadow Lord"],
      };
      const key = ch === 1 ? "1" : `${ch}_${w}${ch >= 4 ? `_${p}` : ""}`;
      const pool = pools[key] || ["💀 Elite Encounter"];
      return pool[Math.floor(Math.random() * pool.length)];
    };

    const getEventLabel = (): string => {
      const pools: Record<string, string[]> = {
        "1": ["📜 Forest Mystery", "⛪ Shrine Encounter", "🎒 Abandoned Camp"],
        "2_1": ["💎 Crystal Vein", "👻 Miner Ghost", "🔣 Ancient Rune"],
        "2_2": ["⚖️ Pressure Puzzle", "⚰️ Sarcophagus", "🕯️ Dark Corridor"],
        "3_1": ["🛤️ Trail Split", "🎒 Abandoned Caravan", "🔥 Strange Campfire"],
        "3_2": ["🏴 Black Market", "🍺 Tavern Brawl", "📋 Quest Board"],
        "4_1_1": ["📚 Forbidden Library", "👑 Cursed Throne", "🔮 Hidden Altar"],
        "4_1_2": ["🍽️ Grand Feast", "🎭 Theater Show", "🏦 Bank Vault"],
        "4_2_1": ["🏛️ Sky Temple", "🪺 Harpy Nest", "🐉 Dragon Shrine"],
        "4_2_2": ["📯 Commander Brief", "📦 Supply Raid", "🏥 Wounded Camp"],
        "5_1_1": ["🌀 Void Rift", "🗣️ Whispering Void", "🪞 Shadow Mirror"],
        "5_1_2": ["🗿 Angelic Statue", "📜 Holy Archive", "🎵 Fallen Choir"],
        "5_2_1": ["🧪 Lab Equipment", "📄 Scientist Notes", "⚡ Energy Core"],
        "5_2_2": ["⚔️ Siege Planning", "🏰 Castle Infiltration", "🏆 Artifact Vault"],
      };
      const key = ch === 1 ? "1" : `${ch}_${w}${ch >= 4 ? `_${p}` : ""}`;
      const pool = pools[key] || ["📜 Mystery Event"];
      return pool[Math.floor(Math.random() * pool.length)];
    };

    const getShopLabel = () => "🛒 Merchant's Caravan";

    // Roll virtual 6-sided die 3 times
    let rolls = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1
    ];

    if (forceShop) {
      rolls[0] = 5; // Force one roll to map to shop
    }

    const mapRollToNodeType = (roll: number): "combat" | "elite_combat" | "event" | "shop" => {
      if (roll === 1 || roll === 2) return "combat";
      if (roll === 3) return "elite_combat";
      if (roll === 4 || roll === 6) return "event";
      return "shop"; // Roll 5 is shop
    };

    // Ensure at most one caravan/shop is in the choices list
    let shopSeen = false;
    const finalRolls = rolls.map((roll) => {
      const type = mapRollToNodeType(roll);
      if (type === "shop") {
        if (shopSeen) {
          return 1; // convert duplicate shop to combat (roll 1)
        }
        shopSeen = true;
      }
      return roll;
    });

    return finalRolls.map((roll) => {
      const type = mapRollToNodeType(roll);
      let stars = 1;
      let label = "";
      if (type === "combat") {
        stars = 1;
        label = `[${roll}] ` + getCombatLabel();
      } else if (type === "elite_combat") {
        stars = 2;
        label = `[${roll}] ` + getEliteLabel();
      } else if (type === "event") {
        stars = 1;
        label = `[${roll}] ` + getEventLabel();
      } else {
        stars = 1;
        label = `[${roll}] ` + getShopLabel();
      }
      return { type, stars, label };
    });
  };

  const handleSelectNode = (node: MapNode) => {
    // Generate combat group or safe campground triggers
    if (node.type === "combat" || node.type === "elite_combat" || node.type === "boss") {
      let activeEnemies: any[];
      if (node.type === "boss") {
        // Boss uses the existing spawnEnemyGroup for proper boss template
        activeEnemies = spawnEnemyGroup(chapter, area, false, true, undefined, way, path);
      } else {
        // Regular and elite encounters use the fixed balanced system
        activeEnemies = spawnFixedEncounter(chapter, area, party.length, node.type === "elite_combat", way, path);
      }
      setCombatEnemies(activeEnemies);
      setPhase("BATTLE");
      broadcastGlobalState("BATTLE", party, inventory, sharedStash, gold, chapter, area, maxArea, availableNodes, activeEnemies);
    } else if (node.type === "rest") {
      // Pre-boss rest: heal party and go to camp
      const restParty = party.map(p => ({
        ...p,
        hp: Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * 0.5)),
        fallenStacks: 0
      }));
      setParty(restParty);
      setPhase("CAMP");
      broadcastGlobalState("CAMP", restParty, inventory, sharedStash, gold, chapter, area, maxArea, availableNodes, []);
    } else {
      // Direct shop visit trigger has finished, transition to campground feast!
      setPhase("CAMP");
      broadcastGlobalState("CAMP", party, inventory, sharedStash, gold, chapter, area, maxArea, availableNodes, []);
    }
  };

  const handleCombatVictory = (
    survivingParty: Character[],
    loot: { gold: number; materials: { id: string; quantity: number }[] }
  ) => {
    // Reward Gold + Material Loot
    let nextGold = gold + loot.gold;
    // Gold is shared in multiplayer stash
    
    // Reward XP per chapter scaling
    const isEventCombat = eventCombatRef.current;
    const isBossBattle = !isEventCombat && (area + 1) >= maxArea;
    const xpPerPlayer = chapter * (isBossBattle ? 5 : 1);
    let finalParty = survivingParty.map(p => ({
      ...p,
      xp: (p.xp || 0) + xpPerPlayer,
    }));
    const xpLabel = isBossBattle ? `BOSS CLEAR (${xpPerPlayer} XP)`
      : `Chapter ${chapter} Battle Clear (${xpPerPlayer} XP)`;
    showNotification(`⭐ ${xpLabel}`, "success");

    const addedMaterials: Item[] = loot.materials.map(mat => {
      const dbItem = ITEMS_DATABASE[mat.id];
      if (dbItem) {
        return {
          ...dbItem,
          quantity: mat.quantity,
        };
      }
      return {
        id: mat.id,
        name: mat.id.replace("_", " ").toUpperCase(),
        type: "material",
        description: "Harvested monster trophy parts.",
        value: 15,
        quantity: mat.quantity,
      };
    });

    // Update inventories - in multiplayer, track per-player items
    if (p2pMode === "multiplayer" && survivingParty.length > 0) {
      addedMaterials.forEach((m, idx) => {
        const targetPlayerIdx = idx % finalParty.length;
        const targetPlayer = finalParty[targetPlayerIdx];
        const charInv = targetPlayer.inventory || [];
        const existing = charInv.findIndex(i => i.id === m.id);
        
        let nextInv = [...charInv];
        if (existing !== -1 && nextInv[existing].quantity) {
          nextInv[existing].quantity! += m.quantity!;
        } else {
          nextInv.push({ ...m });
        }
        finalParty[targetPlayerIdx] = { ...targetPlayer, inventory: nextInv };
      });
    } else if (finalParty.length > 0) {
      // Solo mode - all items go to the host's party[0] inventory
      addedMaterials.forEach(m => {
        const targetPlayer = finalParty[0];
        const charInv = targetPlayer.inventory || [];
        const existing = charInv.findIndex(i => i.id === m.id);
        
        let nextInv = [...charInv];
        if (existing !== -1 && nextInv[existing].quantity) {
          nextInv[existing].quantity! += m.quantity!;
        } else {
          nextInv.push({ ...m });
        }
        finalParty[0] = { ...targetPlayer, inventory: nextInv };
      });
    }

    eventCombatRef.current = false;
    const nextArea = isEventCombat ? area : area + 1;
    let nextChapter = chapter;
    let nextMaxArea = maxArea;
    let finalNextArea = nextArea;

    // Check if boss has been beaten
    if (nextArea >= maxArea) {
      // Heal the team Fully to max HP and add talent point
      finalParty = survivingParty.map(p => {
        const derived = getDerivedStats(p);
        return {
          ...p,
          hp: derived.maxHp,
          talentPoints: (p.talentPoints || 0) + 1
        };
      });

      setForceShopNext(true);

      // New chapter progression
      const isChapter1 = chapter === 1;
      const isChapter2 = chapter === 2;
      const isChapter3 = chapter === 3;
      const isChapter4 = chapter === 4;

      if (isChapter1) {
        // After Forest → go to PATH_CHOICE for Way selection
        setPhase("PATH_CHOICE");
        setGold(nextGold);
        setParty(finalParty);
        broadcastGlobalState("PATH_CHOICE", finalParty, inventory, sharedStash, nextGold, 2, 0, 5, [], []);
        savePartyProfiles(finalParty, nextGold);
        return;
      } else if (isChapter2) {
        // After Cave (way 1) or Dungeon (way 2) → go to chapter 3
        const nextCh = 3;
        const nextMax = getMaxAreaForChapter(nextCh, way, path);
        showNotification(`🎉 ${getChapterDisplayName(chapter, way, path)} Cleared! Pressing on! Team Fully Healed! (+1 Skill Point)`, "success");
        setChapter(nextCh);
        setMaxArea(nextMax);
        finalNextArea = 0;
      } else if (isChapter3) {
        // After Abandoned Trail (way 1) or Trading City (way 2) → PATH_CHOICE for Path
        setPhase("PATH_CHOICE");
        setGold(nextGold);
        setParty(finalParty);
        setArea(0);
        setChapter(4);
        setMaxArea(getMaxAreaForChapter(4, way, 1));
        broadcastGlobalState("PATH_CHOICE", finalParty, inventory, sharedStash, nextGold, 4, 0, 5, [], []);
        savePartyProfiles(finalParty, nextGold);
        return;
      } else if (isChapter4) {
        // After Lich Castle/Peaceful City (way 1) or Sky Island/Frontline (way 2) → go to chapter 5
        const nextCh = 5;
        const nextMax = getMaxAreaForChapter(nextCh, way, path);
        showNotification(`🎉 ${getChapterDisplayName(chapter, way, path)} Cleared! Pressing on! Team Fully Healed! (+1 Skill Point)`, "success");
        setChapter(nextCh);
        setMaxArea(nextMax);
        finalNextArea = 0;
      } else {
        // Chapter 5 is the final chapter → Victory
        setPhase("VICTORY");
        broadcastGlobalState("VICTORY", finalParty, inventory, sharedStash, nextGold, nextChapter, nextArea, nextMaxArea, [], []);
        savePartyProfilesEndRun(finalParty, nextGold);
        return;
      }
    }

    setGold(nextGold);
    // Note: loot materials are distributed into character personal inventories (finalParty).
    // The shared `inventory` state is not changed by battle loot.
    setParty(finalParty);
    setArea(finalNextArea);
    setChapter(nextChapter);
    setMaxArea(nextMaxArea);

    // Enforce promotions checks
    const promotes = finalParty.filter(p => getPendingPromotion(p));
    savePartyProfiles(finalParty, nextGold);
    if (promotes.length > 0) {
      setPendingPromotionChar(promotes[0]);
      setPhase("PROMOTION");
      broadcastGlobalState("PROMOTION", finalParty, inventory, sharedStash, nextGold, nextChapter, nextArea, nextMaxArea, [], []);
    } else {
      setPhase("CAMP");
      broadcastGlobalState("CAMP", finalParty, inventory, sharedStash, nextGold, nextChapter, nextArea, nextMaxArea, [], []);
    }
  };

  const handleQuitBattle = () => {
    if (p2pMode === "multiplayer" && roomId) {
      // Broadcast quit event
      syncBridge.send(`aac-game-${roomId}`, {
        type: "PLAYER_QUIT",
        payload: { playerId: myPlayerId },
      });
    }
    setPhase("GAMEOVER");
    showNotification("You have quit the battle.", "error");
  };

  const handleKickPlayer = (playerId: string) => {
    if (p2pMode === "multiplayer" && roomId) {
      // Broadcast kick event
      syncBridge.send(`aac-game-${roomId}`, {
        type: "PLAYER_KICKED",
        payload: { kickedPlayerId: playerId, kicker: myPlayerId },
      });
      showNotification(`Player ${playerId} has been kicked.`, "info");
    }
  };

  const handleAdvanceClass = (charId: string, choice: CharacterClass) => {
    const updated = party.map(p => {
      if (p.id === charId) {
        if (p.level >= 75) {
          return {
            ...p,
            tier5Acknowledged: true,
          };
        } else if (p.level >= 50) {
          const baseClass = getBaseClass(p.class);
          const startStats = START_STATS[baseClass] || START_STATS.Warrior;
          const totalPoints = (p.level - 1) * ((p.race || "Human") === "Human" ? 4 : 3);
          return {
            ...p,
            subclass: choice,
            stats: { ...startStats },
            allocatedPoints: 0,
            unspentPoints: totalPoints,
          };
        } else {
          return {
            ...p,
            class: choice,
            avatarUrl: CLASS_AVATARS[choice] || p.avatarUrl,
          };
        }
      }
      return p;
    });

    setParty(updated);
    setPendingPromotionChar(null);

    // Keep checking if any other player needs promotions
    const nextPromote = updated.filter(p => getPendingPromotion(p));
    if (nextPromote.length > 0) {
      setPendingPromotionChar(nextPromote[0]);
    } else {
      setPhase("CAMP");
      broadcastGlobalState("CAMP", updated, inventory, sharedStash, gold, chapter, area, maxArea, availableNodes, []);
    }
  };

  const handleUpdateParty = (nextParty: Character[]) => {
    setParty(nextParty);
    broadcastGlobalState(phase, nextParty, inventory, sharedStash, gold, chapter, area, maxArea, availableNodes, combatEnemies, activeStoryIndex, activeShopOpen);
  };

  const handleUpdateInventory = (nextInv: Item[]) => {
    setInventory(nextInv);
    broadcastGlobalState(phase, party, nextInv, sharedStash, gold, chapter, area, maxArea, availableNodes, combatEnemies, activeStoryIndex, activeShopOpen);
  };

  const handleUpdateSharedStash = (nextStash: Item[]) => {
    setSharedStash(nextStash);
    broadcastGlobalState(phase, party, inventory, nextStash, gold, chapter, area, maxArea, availableNodes, combatEnemies, activeStoryIndex, activeShopOpen);
  };

  const handleUpdateGold = (nextGold: number) => {
    setGold(nextGold);
    broadcastGlobalState(phase, party, inventory, sharedStash, nextGold, chapter, area, maxArea, availableNodes, combatEnemies, activeStoryIndex, activeShopOpen);
  };

  const handleUpdateStashGold = (nextStashGold: number) => {
    setStashGold(nextStashGold);
    broadcastGlobalState(phase, party, inventory, sharedStash, gold, chapter, area, maxArea, availableNodes, combatEnemies, activeStoryIndex, activeShopOpen, nextStashGold);
  };

  const handleRestAndBattle = () => {
    const updatedParty = party.map(p => {
      const maxH = getDerivedStats(p).maxHp;
      const healedHp = Math.min(maxH, p.hp + Math.floor(maxH * 0.5));
      return {
        ...p,
        hp: healedHp,
        fallenStacks: 0
      };
    });
    setParty(updatedParty);

    // Spawn enemy group for current chapter/area
    const isBoss = area >= maxArea;
    const activeEnemies = isBoss
      ? spawnEnemyGroup(chapter, area, false, true, undefined, way, path)
      : spawnFixedEncounter(chapter, area, updatedParty.length, false, way, path);
    setCombatEnemies(activeEnemies);

    setPhase("BATTLE");
    broadcastGlobalState("BATTLE", updatedParty, inventory, sharedStash, gold, chapter, area, maxArea, availableNodes, activeEnemies);
  };

  const handleLeaveCampground = () => {
    // Generate fresh route options, force shop if boss clear flag is set
    const shouldForce = forceShopNext;
    if (shouldForce) {
      setForceShopNext(false);
    }
    const nextArea = area + 1;
    const nextNodes = generateMapNodes(chapter, nextArea, nextArea >= maxArea, shouldForce);
    setAvailableNodes(nextNodes);
    setPhase("MAP");
    // Broadcast with the advanced area value, not the stale closure
    broadcastGlobalState("MAP", party, inventory, sharedStash, gold, chapter, nextArea, maxArea, nextNodes, []);
  };

  const resetGameEnvironment = () => {
    setPhase("LOBBY");
    setParty([]);
    setInventory([]);
    setSharedStash([]);
    setGold(50);
    setStashGold(0);
    setChapter(1);
    setArea(0);
    setMaxArea(8);
    setWay(1);
    setPath(1);
    setCombatEnemies([]);
    setAvailableNodes([]);
    setForceShopNext(false);
    setActiveStoryIndex(null);
    setActiveShopOpen(false);
    eventCombatRef.current = false;
    hasSavedEndRunRef.current = false;
  };

  const getChapterBgClass = () => {
    if (phase === "LOBBY") return "bg-slate-950";
    if (chapter === 1) return "bg-gradient-to-b from-slate-950 via-slate-950 to-emerald-950/20";
    if (way === 1) {
      if (chapter === 2) return "bg-gradient-to-b from-slate-950 via-slate-950 to-stone-950/20";
      if (chapter === 3) return "bg-gradient-to-b from-slate-950 via-slate-950 to-amber-950/20";
      if (chapter === 4 && path === 1) return "bg-gradient-to-b from-slate-950 via-slate-950 to-purple-950/20";
      if (chapter === 4 && path === 2) return "bg-gradient-to-b from-slate-950 via-slate-950 to-rose-950/20";
      if (chapter === 5 && path === 1) return "bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950/20";
      if (chapter === 5 && path === 2) return "bg-gradient-to-b from-slate-950 via-slate-950 to-sky-950/20";
    }
    if (way === 2) {
      if (chapter === 2) return "bg-gradient-to-b from-slate-950 via-slate-950 to-red-950/20";
      if (chapter === 3) return "bg-gradient-to-b from-slate-950 via-slate-950 to-yellow-950/20";
      if (chapter === 4 && path === 1) return "bg-gradient-to-b from-slate-950 via-slate-950 to-cyan-950/20";
      if (chapter === 4 && path === 2) return "bg-gradient-to-b from-slate-950 via-slate-950 to-orange-950/20";
      if (chapter === 5 && path === 1) return "bg-gradient-to-b from-slate-950 via-slate-950 to-lime-950/20";
      if (chapter === 5 && path === 2) return "bg-gradient-to-b from-slate-950 via-slate-950 to-violet-950/20";
    }
    return "bg-slate-950";
  };

  return (
    <div className={`min-h-screen ${getChapterBgClass()} text-slate-100 flex flex-col justify-between py-6 px-4 md:px-8 select-none relative`}>

      {/* Global Floating Notifications Toast Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`p-4 rounded-lg shadow-2xl border flex items-center gap-3 pointer-events-auto transition-all duration-300 animate-[fadeIn_0.2s_ease-out] ${n.type === "success"
                ? "bg-emerald-950/95 border-emerald-500/30 text-emerald-300"
                : n.type === "error"
                  ? "bg-rose-950/95 border-rose-500/30 text-rose-300"
                  : "bg-slate-900/95 border-amber-500/30 text-amber-300"
              }`}
          >
            <span className="text-xs font-mono leading-normal font-semibold">
              {n.type === "success" ? "✓" : n.type === "error" ? "❌" : "🔔"} {n.message}
            </span>
          </div>
        ))}
      </div>

      {/* Upper Navigation Margins */}
      <div className={`w-full ${phase === "BATTLE" ? "max-w-[98%]" : "max-w-7xl"} mx-auto flex justify-between items-center bg-slate-900 border border-slate-800 p-3.5 rounded-lg mb-6`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Swords className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold tracking-widest text-amber-400 block uppercase">
              Void Soul
            </h3>
            <span className="text-[10px] text-slate-500 block font-mono">Web Fan Remake</span>
          </div>
        </div>

        {phase !== "LOBBY" && (
          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
            <span>{getChapterEmoji(chapter, way, path)} <strong className="text-amber-400">{getChapterDisplayName(chapter, way, path)}</strong></span>
            <span>Area: <strong className="text-slate-200">{Math.min(maxArea, area + 1)}/{maxArea}</strong></span>
            <span>Gold: <strong className="text-slate-100">{gold}g</strong></span>
            {p2pMode === "multiplayer" && roomId && (
              <button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(roomId);
                  } else {
                    const textarea = document.createElement("textarea");
                    textarea.value = roomId;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand("copy");
                    document.body.removeChild(textarea);
                  }
                  showNotification("Room ID copied to clipboard!", "success");
                }}
                className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded hover:bg-amber-500/20 text-amber-400 cursor-pointer text-[10px] transition-all"
              >
                Copy Room ID
              </button>
            )}
          </div>
        )}
      </div>

      {/* Screen Routing Panel */}
      <div className={`flex-1 w-full ${phase === "BATTLE" ? "max-w-[98%]" : "max-w-7xl"} mx-auto flex items-center justify-center py-4`}>
        {phase === "LOBBY" && (
          <ProfileView onStartGame={handleStartGame} />
        )}

        {phase === "MAP" && (
          <MapEventList
            chapter={chapter}
            area={area}
            maxArea={maxArea}
            availableNodes={availableNodes}
            onSelectNode={handleSelectNode}
            gold={gold}
            inventory={inventory}
            onUpdateInventory={handleUpdateInventory}
            onUpdateGold={handleUpdateGold}
            party={party}
            onUpdateParty={handleUpdateParty}
            activeStoryIndex={activeStoryIndex}
            setActiveStoryIndex={handleSetStoryIndex}
            activeShopOpen={activeShopOpen}
            setActiveShopOpen={handleSetShopOpen}
            activeShopWares={activeShopWares}
            p2pMode={p2pMode}
            votes={votes}
            countdown={countdown}
            castVote={castVote}
            executeStoryChoice={executeStoryChoice}
            myPlayerId={myPlayerId}
            way={way}
            path={path}
            // Continue voting props
            continueVotes={continueVotes}
            continueCountdown={continueCountdown}
            castContinueVote={castContinueVote}
          />
        )}

        {phase === "PATH_CHOICE" && (
          <div className="p-8 bg-slate-900 border-2 border-amber-500/30 rounded-xl max-w-2xl w-full">
            {chapter === 1 ? (
              // After Chapter 1: Choose Way (Main Path)
              <>
                <h2 className="text-2xl font-mono uppercase text-amber-400 font-bold tracking-widest text-center mb-2">
                  🌟 Choose Your Path
                </h2>
                <p className="text-sm text-slate-400 text-center mb-6">
                  The forest is behind you. Two paths stretch ahead. Which will you take?
                </p>
                {p2pMode === "multiplayer" && party.length > 0 && myPlayerId !== party[0].id ? (
                  <div className="text-center p-4 bg-slate-800 rounded-lg text-amber-300 animate-pulse font-mono">
                    Waiting for Host ({party[0].name}) to choose a path...
                  </div>
                ) : (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setWay(1);
                      setPath(1);
                      setChapter(2);
                      setArea(0);
                      const nextMax = getMaxAreaForChapter(2, 1, 1);
                      setMaxArea(nextMax);
                      const nodes = generateMapNodes(2, 0, false, false, 1, 1);
                      setAvailableNodes(nodes);
                      setPhase("MAP");
                      broadcastGlobalState("MAP", party, inventory, sharedStash, gold, 2, 0, nextMax, nodes, []);
                    }}
                    className="p-6 bg-stone-900/80 border-2 border-stone-500/30 rounded-xl hover:border-stone-400/50 transition-all text-left cursor-pointer group"
                  >
                    <div className="text-4xl mb-3">⛰️</div>
                    <h3 className="text-lg font-mono font-bold text-stone-300 group-hover:text-stone-200">The Darkened Cave</h3>
                    <p className="text-xs text-stone-500 mt-2">Descend into winding caverns filled with miners, spores, and buried secrets.</p>
                    <div className="mt-3 text-[10px] text-stone-600">Difficulty: ★☆☆☆☆</div>
                  </button>
                  <button
                    onClick={() => {
                      setWay(2);
                      setPath(1);
                      setChapter(2);
                      setArea(0);
                      const nextMax = getMaxAreaForChapter(2, 2, 1);
                      setMaxArea(nextMax);
                      const nodes = generateMapNodes(2, 0, false, false, 2, 1);
                      setAvailableNodes(nodes);
                      setPhase("MAP");
                      broadcastGlobalState("MAP", party, inventory, sharedStash, gold, 2, 0, nextMax, nodes, []);
                    }}
                    className="p-6 bg-red-950/30 border-2 border-red-500/30 rounded-xl hover:border-red-400/50 transition-all text-left cursor-pointer group"
                  >
                    <div className="text-4xl mb-3">🪦</div>
                    <h3 className="text-lg font-mono font-bold text-red-300 group-hover:text-red-200">The Forgotten Dungeon</h3>
                    <p className="text-xs text-red-500/70 mt-2">Venture into ancient crypts where undead guardians and bone constructs roam.</p>
                    <div className="mt-3 text-[10px] text-red-600/60">Difficulty: ★★☆☆☆</div>
                  </button>
                </div>
                )}
              </>
            ) : (
              // After Chapter 3: Choose Path (Branch)
              <>
                <h2 className="text-2xl font-mono uppercase text-amber-400 font-bold tracking-widest text-center mb-2">
                  🗺️ Branching Paths
                </h2>
                <p className="text-sm text-slate-400 text-center mb-6">
                  The trail splits once more. Your choice will determine the final leg of the journey.
                </p>
                {p2pMode === "multiplayer" && party.length > 0 && myPlayerId !== party[0].id ? (
                  <div className="text-center p-4 bg-slate-800 rounded-lg text-amber-300 animate-pulse font-mono">
                    Waiting for Host ({party[0].name}) to choose a path...
                  </div>
                ) : (
                <>
                {way === 1 ? (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        setPath(1);
                        setChapter(4);
                        setArea(0);
                        const nextMax = getMaxAreaForChapter(4, 1, 1);
                        setMaxArea(nextMax);
                        const nodes = generateMapNodes(4, 0, false, false, 1, 1);
                        setAvailableNodes(nodes);
                        setPhase("MAP");
                        broadcastGlobalState("MAP", party, inventory, sharedStash, gold, 4, 0, nextMax, nodes, []);
                      }}
                      className="p-6 bg-purple-950/30 border-2 border-purple-500/30 rounded-xl hover:border-purple-400/50 transition-all text-left cursor-pointer group"
                    >
                      <div className="text-4xl mb-3">🏰</div>
                      <h3 className="text-lg font-mono font-bold text-purple-300 group-hover:text-purple-200">The Lich Castle</h3>
                      <p className="text-xs text-purple-500/70 mt-2">Face undying legions in a fortress of death and dark magic.</p>
                      <div className="mt-3 text-[10px] text-purple-600/60">Difficulty: ★★★☆☆</div>
                    </button>
                    <button
                      onClick={() => {
                        setPath(2);
                        setChapter(4);
                        setArea(0);
                        const nextMax = getMaxAreaForChapter(4, 1, 2);
                        setMaxArea(nextMax);
                        const nodes = generateMapNodes(4, 0, false, false, 1, 2);
                        setAvailableNodes(nodes);
                        setPhase("MAP");
                        broadcastGlobalState("MAP", party, inventory, sharedStash, gold, 4, 0, nextMax, nodes, []);
                      }}
                      className="p-6 bg-rose-950/30 border-2 border-rose-500/30 rounded-xl hover:border-rose-400/50 transition-all text-left cursor-pointer group"
                    >
                      <div className="text-4xl mb-3">🏙️</div>
                      <h3 className="text-lg font-mono font-bold text-rose-300 group-hover:text-rose-200">The Peaceful City</h3>
                      <p className="text-xs text-rose-500/70 mt-2">A beautiful city that hides a dark secret behind its welcoming facade.</p>
                      <div className="mt-3 text-[10px] text-rose-600/60">Difficulty: ★★★★★ (Gold-Rich)</div>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        setPath(1);
                        setChapter(4);
                        setArea(0);
                        const nextMax = getMaxAreaForChapter(4, 2, 1);
                        setMaxArea(nextMax);
                        const nodes = generateMapNodes(4, 0, false, false, 2, 1);
                        setAvailableNodes(nodes);
                        setPhase("MAP");
                        broadcastGlobalState("MAP", party, inventory, sharedStash, gold, 4, 0, nextMax, nodes, []);
                      }}
                      className="p-6 bg-cyan-950/30 border-2 border-cyan-500/30 rounded-xl hover:border-cyan-400/50 transition-all text-left cursor-pointer group"
                    >
                      <div className="text-4xl mb-3">🏝️</div>
                      <h3 className="text-lg font-mono font-bold text-cyan-300 group-hover:text-cyan-200">The Sky Island</h3>
                      <p className="text-xs text-cyan-500/70 mt-2">Ascend to floating temples where sky creatures and dragons dwell.</p>
                      <div className="mt-3 text-[10px] text-cyan-600/60">Difficulty: ★★★☆☆</div>
                    </button>
                    <button
                      onClick={() => {
                        setPath(2);
                        setChapter(4);
                        setArea(0);
                        const nextMax = getMaxAreaForChapter(4, 2, 2);
                        setMaxArea(nextMax);
                        const nodes = generateMapNodes(4, 0, false, false, 2, 2);
                        setAvailableNodes(nodes);
                        setPhase("MAP");
                        broadcastGlobalState("MAP", party, inventory, sharedStash, gold, 4, 0, nextMax, nodes, []);
                      }}
                      className="p-6 bg-orange-950/30 border-2 border-orange-500/30 rounded-xl hover:border-orange-400/50 transition-all text-left cursor-pointer group"
                    >
                      <div className="text-4xl mb-3">⚔️</div>
                      <h3 className="text-lg font-mono font-bold text-orange-300 group-hover:text-orange-200">The Frontline</h3>
                      <p className="text-xs text-orange-500/70 mt-2">Join the war against demon forces at the most brutal battlefields.</p>
                      <div className="mt-3 text-[10px] text-orange-600/60">Difficulty: ★★★★☆</div>
                    </button>
                  </div>
                )}
                </>
                )}
              </>
            )}
          </div>
        )}

        {phase === "BATTLE" && (
          <BattleScene
            party={party}
            enemies={combatEnemies}
            onVictory={handleCombatVictory}
            onDefeat={() => {
              // Final chapter (5): defeat still shows ending scene
              if (chapter >= 5) {
                setPhase("VICTORY");
                broadcastGlobalState("VICTORY", party, inventory, sharedStash, gold, chapter, area, maxArea, [], []);
              } else {
                setPhase("GAMEOVER");
              }
            }}
            p2pMode={p2pMode}
            roomId={roomId}
            myPlayerId={myPlayerId}
            chapter={chapter}
            area={area}
            onQuit={handleQuitBattle}
            onKickPlayer={handleKickPlayer}
          />
        )}

        {phase === "CAMP" && (
          <CampingMenu
            party={party}
            inventory={inventory}
            sharedStash={sharedStash}
            gold={gold}
            stashGold={stashGold}
            onUpdateParty={handleUpdateParty}
            onUpdateInventory={handleUpdateInventory}
            onUpdateSharedStash={handleUpdateSharedStash}
            onUpdateGold={handleUpdateGold}
            onUpdateStashGold={handleUpdateStashGold}
            onContinue={
              p2pMode === "multiplayer" ? castContinueVote : handleLeaveCampground
            }
            onRestAndBattle={handleRestAndBattle}
            chapter={chapter}
            myPlayerId={myPlayerId}
            p2pMode={p2pMode}
            continueVotes={continueVotes}
            continueCountdown={continueCountdown}
          />
        )}

        {phase === "PROMOTION" && pendingPromotionChar && (
          <ClassAdvancement
            character={pendingPromotionChar}
            onAdvance={handleAdvanceClass}
          />
        )}

        {phase === "GAMEOVER" && (
          <div className="p-8 text-center bg-slate-900 border-2 border-red-500/30 rounded-xl space-y-6 max-w-md w-full">
            <Skull className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-mono uppercase text-red-500 font-bold tracking-widest">
              Defeat Encountered
            </h2>
            <p className="text-sm text-slate-400">
              Your party members fell in battle against the chapter protectors. Re-strategize selection positions and prepare anew.
            </p>
            <button
              onClick={resetGameEnvironment}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-mono text-sm uppercase rounded cursor-pointer"
            >
              Back to tavern lobby
            </button>
          </div>
        )}

        {phase === "VICTORY" && (
          <div className="p-8 text-center bg-slate-900 border-2 border-emerald-500/30 rounded-xl space-y-6 max-w-md w-full">
            <Trophy className="w-16 h-16 text-emerald-400 mx-auto" />
            <h2 className="text-2xl font-mono uppercase text-emerald-400 font-bold tracking-widest">
              Campaign Complete
            </h2>
            <p className="text-sm text-slate-400">
              Glorious news! You successfully navigated Forest trials and the Lich King's Cursed Catacombs.
            </p>
            <button
              onClick={resetGameEnvironment}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-sm uppercase rounded cursor-pointer"
            >
              Trivialize another run
            </button>
          </div>
        )}
      </div>

        {/* Floating Help Guide Button */}
        <HelpGuide />

    </div>
  );
}
