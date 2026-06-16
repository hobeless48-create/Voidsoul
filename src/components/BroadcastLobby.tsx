/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ClassName, Character, Stats, Equipment } from "../types";
import { START_STATS, CLASS_AVATARS } from "../skills_db";
import { syncBridge } from "../utils/sync";
import { Swords, Plus, ShieldAlert, CheckCircle2, User, Users, Sparkles } from "lucide-react";

const racesList = ["Human", "Elf", "Dwarves", "Dragonborn", "Goblin", "Vampire", "Succubus", "Dryad"] as const;


interface BroadcastLobbyProps {
  onStartGame: (party: Character[], p2pMode: "solo" | "multiplayer", roomId: string, myPlayerId: string) => void;
  activeProfile?: any;
  onProfileUpdate?: (updated: any) => void;
}

export function BroadcastLobby({ onStartGame, activeProfile, onProfileUpdate }: BroadcastLobbyProps) {
  const [p2pMode, setP2pMode] = useState<"solo" | "multiplayer">("solo");
  const [roomId, setRoomId] = useState<string>("");
  const [tempRoomId, setTempRoomId] = useState<string>("");
  const [myPlayerId, setMyPlayerId] = useState(() => "player_" + Math.random().toString(36).substr(2, 9));

  // Profile states
  const [myProfile, setMyProfile] = useState<any | null>(null);

  useEffect(() => {
    if (activeProfile) {
      setMyProfile(activeProfile);
      setMyLobbyName(activeProfile.username);
      if (activeProfile.class) {
        setMyLobbyClass(activeProfile.class as ClassName);
      }
      // Sync active profile directly to soloParty Character 1 to guarantee parity
      setSoloParty(prev =>
        prev.map(c => {
          if (c.id === "char_1" || c.id === activeProfile.id) {
            const baseCls = (activeProfile.class || c.class) as ClassName;
            const starter = START_STATS[baseCls] || START_STATS.Warrior;
            return {
              ...c,
              id: activeProfile.id || "char_1",
              name: activeProfile.username,
              class: baseCls,
              level: activeProfile.level ?? 1,
              xp: activeProfile.xp ?? 0,
              hp: 80 + starter.CON * 12 + ((activeProfile.level ?? 1) - 1) * 15,
              maxHp: 80 + starter.CON * 12 + ((activeProfile.level ?? 1) - 1) * 15,
              stats: { ...starter },
              unspentPoints: ((activeProfile.level ?? 1) - 1) * ((activeProfile.race || "Human") === "Human" ? 4 : 3),
              talentPoints: activeProfile.talentPoints ?? 0,
              unlockedTalents: activeProfile.unlockedTalents ?? [],
              talentPointsByClass: activeProfile.talentPointsByClass || {},
              unlockedTalentsByClass: activeProfile.unlockedTalentsByClass || {},
              race: activeProfile.race || "Human",
              avatarUrl: activeProfile.avatarUrl || CLASS_AVATARS[baseCls],
              gridX: 1,
              gridY: 1,
              inventory: activeProfile.inventory || [],
            };
          }
          return c;
        })
      );
    }
  }, [activeProfile]);


  // Solo State
  const [soloParty, setSoloParty] = useState<Omit<Character, "equipment" | "statusEffects">[]>([
    {
      id: "char_1",
      name: "Arthur",
      class: "Warrior",
      level: 1,
      xp: 0,
      hp: 248, // Derived starting
      maxHp: 248,
      energy: 2,
      maxEnergy: 7,
      stats: { ...START_STATS.Warrior },
      allocatedPoints: 0,
      unspentPoints: 0,
      gridX: 1,
      gridY: 1,
      avatarUrl: CLASS_AVATARS.Warrior,
      talentPoints: 0,
      unlockedTalents: [],
      race: "Human",
    },
    {
      id: "char_2",
      name: "Gwen",
      class: "Cleric",
      level: 1,
      xp: 0,
      hp: 200,
      maxHp: 200,
      energy: 2,
      maxEnergy: 7,
      stats: { ...START_STATS.Cleric },
      allocatedPoints: 0,
      unspentPoints: 0,
      gridX: 2,
      gridY: 1,
      avatarUrl: CLASS_AVATARS.Cleric,
      talentPoints: 0,
      unlockedTalents: [],
      race: "Human",
    }
  ]);

  // Multiplayer Lobby State
  const [lobbyPlayers, setLobbyPlayers] = useState<Array<{
    id: string;
    name: string;
    cls: ClassName;
    gridX: number;
    gridY: number;
    ready: boolean;
    level: number;
    xp: number;
    talentPoints: number;
    unlockedTalents: string[];
    avatarUrl: string;
    race: string;
  }>>([]);

  const [myLobbyName, setMyLobbyName] = useState("Hero_" + Math.floor(Math.random() * 900 + 100));
  const [myLobbyClass, setMyLobbyClass] = useState<ClassName>("Warrior");
  const [myReady, setMyReady] = useState(false);

  const [isLobbyHost, setIsLobbyHost] = useState(false);
  const myGridY = 1;

  // Derive slot positions: host is slot 1, joiners are slot 2, 3, etc.
  const allParticipants = [
    {
      id: myPlayerId,
      name: myLobbyName,
      cls: myLobbyClass,
      ready: myReady,
      isHost: isLobbyHost,
      level: myProfile?.level ?? 1,
      xp: myProfile?.xp ?? 0,
      talentPoints: myProfile?.talentPoints ?? 0,
      unlockedTalents: myProfile?.unlockedTalents ?? [],
      talentPointsByClass: myProfile?.talentPointsByClass || {},
      unlockedTalentsByClass: myProfile?.unlockedTalentsByClass || {},
      avatarUrl: myProfile?.avatarUrl || CLASS_AVATARS[myLobbyClass],
      race: myProfile?.race || "Human",
      inventory: myProfile?.inventory || [],
    },
    ...lobbyPlayers
  ];

  const hostParticipant = allParticipants.find(p => p.isHost);
  const joinersList = allParticipants.filter(p => !p.isHost).sort((a, b) => a.id.localeCompare(b.id));

  const sortedPeersList = [];
  if (hostParticipant) {
    sortedPeersList.push(hostParticipant);
  }
  sortedPeersList.push(...joinersList);

  const myDerivedIndex = sortedPeersList.findIndex(p => p.id === myPlayerId);
  const myGridX = myDerivedIndex !== -1 ? myDerivedIndex + 1 : 1;

  // Helper to resolve base class
  const getBaseClass = (cl: string): ClassName => {
    if (["Berserker", "Knight"].includes(cl)) return "Warrior";
    if (["Sharpshooter", "Bolt Slinger"].includes(cl)) return "Archer";
    if (["Elementalist", "Summoner"].includes(cl)) return "Mage";
    if (["High Priest", "Inquisitor"].includes(cl)) return "Cleric";
    if (["Assassin", "Duelist"].includes(cl)) return "Rogue";
    if (["Bard of Valor", "Bard of Chaos"].includes(cl)) return "Bard";
    return cl as ClassName;
  };

  // Sync Broker over BroadcastChannel and WebSockets
  useEffect(() => {
    if (p2pMode !== "multiplayer" || !roomId) return;

    syncBridge.init(roomId, `aac-lobby-${roomId}`, (data) => {
      const { type, payload } = data;

      if (type === "LOBBY_PING") {
        if (payload.name) {
          setLobbyPlayers(prev => {
            const filtered = prev.filter(p => p.id !== payload.id);
            return [...filtered, payload];
          });
        }
        syncBridge.send(`aac-lobby-${roomId}`, {
          type: "LOBBY_PONG",
          payload: {
            id: myPlayerId,
            name: myLobbyName,
            cls: myLobbyClass,
            isHost: isLobbyHost,
            gridX: myGridX,
            gridY: myGridY,
            ready: myReady,
            level: myProfile?.level ?? 1,
            xp: myProfile?.xp ?? 0,
            talentPoints: myProfile?.talentPoints ?? 0,
            unlockedTalents: myProfile?.unlockedTalents ?? [],
            talentPointsByClass: myProfile?.talentPointsByClass || {},
            unlockedTalentsByClass: myProfile?.unlockedTalentsByClass || {},
            avatarUrl: myProfile?.avatarUrl || CLASS_AVATARS[myLobbyClass],
            race: myProfile?.race || "Human",
            inventory: myProfile?.inventory || [],
          }
        });
      } else if (type === "LOBBY_REQUEST_PLAYERS") {
        // Respond with our full state so the requester can populate their lobby
        syncBridge.send(`aac-lobby-${roomId}`, {
          type: "LOBBY_PONG",
          payload: {
            id: myPlayerId,
            name: myLobbyName,
            cls: myLobbyClass,
            isHost: isLobbyHost,
            gridX: myGridX,
            gridY: myGridY,
            ready: myReady,
            level: myProfile?.level ?? 1,
            xp: myProfile?.xp ?? 0,
            talentPoints: myProfile?.talentPoints ?? 0,
            unlockedTalents: myProfile?.unlockedTalents ?? [],
            talentPointsByClass: myProfile?.talentPointsByClass || {},
            unlockedTalentsByClass: myProfile?.unlockedTalentsByClass || {},
            avatarUrl: myProfile?.avatarUrl || CLASS_AVATARS[myLobbyClass],
            race: myProfile?.race || "Human",
            inventory: myProfile?.inventory || [],
          }
        });
      } else if (type === "LOBBY_PONG" || type === "LOBBY_UPDATE") {
        setLobbyPlayers(prev => {
          const filtered = prev.filter(p => p.id !== payload.id);
          if (filtered.length === prev.length && prev.some(p => p.id === payload.id)) return prev;
          return [...filtered, payload];
        });
      } else if (type === "LOBBY_LEAVE") {
        setLobbyPlayers(prev => prev.filter(p => p.id !== payload.id));
      } else if (type === "START_MULTIPLAYER_GAME") {
        const fullParty: Character[] = payload.party.map((p: any) => {
          const starter = START_STATS[p.cls as ClassName] || START_STATS.Warrior;
          return {
            id: p.id,
            name: p.name,
            class: p.cls,
            level: 1,
            xp: 0,
            hp: 80 + starter.CON * 12,
            maxHp: 80 + starter.CON * 12,
            energy: 2,
            maxEnergy: 7,
            stats: { ...starter },
            allocatedPoints: 0,
            unspentPoints: 0,
            gridX: p.gridX,
            gridY: p.gridY,
            equipment: {
              weapon: null,
              offhand: null,
              helmet: null,
              chestplate: null,
              leggings: null,
              boots: null,
              ring: null,
              bracelet: null,
              necklace: null,
              charm: null
            },
            statusEffects: [],
            avatarUrl: p.avatarUrl || CLASS_AVATARS[p.cls as ClassName] || CLASS_AVATARS.Warrior,
            talentPoints: p.talentPoints ?? 3,
            unlockedTalents: p.unlockedTalents ?? [],
            talentPointsByClass: p.talentPointsByClass || {},
            unlockedTalentsByClass: p.unlockedTalentsByClass || {},
            fallenStacks: 0,
            race: p.race || "Human",
            inventory: p.inventory || [],
          };
        });
        onStartGame(fullParty, "multiplayer", roomId, myPlayerId);
      }
    });

    // Announce presence
    syncBridge.send(`aac-lobby-${roomId}`, {
      type: "LOBBY_PING",
      payload: {
        id: myPlayerId,
        name: myLobbyName,
        cls: myLobbyClass,
        isHost: isLobbyHost,
        gridX: myGridX,
        gridY: myGridY,
        ready: myReady,
        level: myProfile?.level ?? 1,
        xp: myProfile?.xp ?? 0,
        talentPoints: myProfile?.talentPoints ?? 0,
        unlockedTalents: myProfile?.unlockedTalents ?? [],
        talentPointsByClass: myProfile?.talentPointsByClass || {},
        unlockedTalentsByClass: myProfile?.unlockedTalentsByClass || {},
        avatarUrl: myProfile?.avatarUrl || CLASS_AVATARS[myLobbyClass],
        race: myProfile?.race || "Human",
        inventory: myProfile?.inventory || [],
      }
    });

    return () => {
      syncBridge.send(`aac-lobby-${roomId}`, {
        type: "LOBBY_LEAVE",
        payload: { id: myPlayerId }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p2pMode, roomId, myLobbyName, myLobbyClass, myGridX, myReady, myPlayerId, onStartGame, myProfile, isLobbyHost]);

  const triggerUpdateBroadcast = () => {
    if (p2pMode === "multiplayer" && roomId) {
      syncBridge.send(`aac-lobby-${roomId}`, {
        type: "LOBBY_UPDATE",
        payload: {
          id: myPlayerId,
          name: myLobbyName,
          cls: myLobbyClass,
          isHost: isLobbyHost,
          gridX: myGridX,
          gridY: myGridY,
          ready: myReady,
          level: myProfile?.level ?? 1,
          xp: myProfile?.xp ?? 0,
          talentPoints: myProfile?.talentPoints ?? 0,
          unlockedTalents: myProfile?.unlockedTalents ?? [],
          talentPointsByClass: myProfile?.talentPointsByClass || {},
          unlockedTalentsByClass: myProfile?.unlockedTalentsByClass || {},
          avatarUrl: myProfile?.avatarUrl || CLASS_AVATARS[myLobbyClass],
          race: myProfile?.race || "Human",
        }
      });
    }
  };

  useEffect(() => {
    triggerUpdateBroadcast();
  }, [myLobbyName, myLobbyClass, myGridX, myGridY, myReady, myProfile, lobbyPlayers, isLobbyHost]);

  // Delayed re-announce to handle WebSocket connection timing issues
  // When a player joins or creates a room, the WebSocket may not be open
  // when the initial LOBBY_PING is sent. This retries after a delay.
  useEffect(() => {
    if (p2pMode !== "multiplayer" || !roomId) return;

    // First retry: re-send PING after 500ms
    const timer1 = setTimeout(() => {
      syncBridge.send(`aac-lobby-${roomId}`, {
        type: "LOBBY_PING",
        payload: {
          id: myPlayerId,
          name: myLobbyName,
          cls: myLobbyClass,
          isHost: isLobbyHost,
          gridX: myGridX,
          gridY: myGridY,
          ready: myReady,
          level: myProfile?.level ?? 1,
          xp: myProfile?.xp ?? 0,
          talentPoints: myProfile?.talentPoints ?? 0,
          unlockedTalents: myProfile?.unlockedTalents ?? [],
          talentPointsByClass: myProfile?.talentPointsByClass || {},
          unlockedTalentsByClass: myProfile?.unlockedTalentsByClass || {},
          avatarUrl: myProfile?.avatarUrl || CLASS_AVATARS[myLobbyClass],
          race: myProfile?.race || "Human",
          inventory: myProfile?.inventory || [],
        }
      });
    }, 500);

    // Second retry: request full state from all peers after 1.5s
    // This ensures that even if our initial PING was missed, others
    // will respond with their full state
    const timer2 = setTimeout(() => {
      syncBridge.send(`aac-lobby-${roomId}`, {
        type: "LOBBY_REQUEST_PLAYERS",
        payload: { id: myPlayerId }
      });
    }, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p2pMode, roomId]);



  const handleSaveProfile = async (updated: any) => {
    if (!myLobbyName) return;
    const success = await syncBridge.saveProfile(myLobbyName, updated);
    if (success) {
      setMyProfile(updated);
      if (onProfileUpdate) {
        onProfileUpdate(updated);
      }
    }
  };



  // Empty constraint place holder

  const addSoloCharacter = () => {
    if (soloParty.length >= 4) return;
    const classesList: ClassName[] = ["Warrior", "Archer", "Mage", "Cleric", "Rogue", "Bard"];
    const chosenClass = classesList[soloParty.length % classesList.length];

    const newChar: Omit<Character, "equipment" | "statusEffects"> = {
      id: "char_" + Date.now() + Math.random().toString(36).substr(2, 3),
      name: `Companion ${soloParty.length + 1}`,
      class: chosenClass,
      level: 1,
      xp: 0,
      hp: 80 + START_STATS[chosenClass].CON * 12,
      maxHp: 80 + START_STATS[chosenClass].CON * 12,
      energy: 2,
      maxEnergy: 7,
      stats: { ...START_STATS[chosenClass] },
      allocatedPoints: 0,
      unspentPoints: 0,
      gridX: soloParty.length + 1,
      gridY: 1,
      avatarUrl: CLASS_AVATARS[chosenClass],
      talentPoints: 0,
      unlockedTalents: [],
      race: "Human",
    };
    setSoloParty([...soloParty, newChar]);
  };

  const removeSoloCharacter = (id: string) => {
    if (soloParty.length <= 1) return;
    const filtered = soloParty.filter(c => c.id !== id);
    const updated = filtered.map((c, idx) => ({
      ...c,
      gridX: idx + 1,
      gridY: 1
    }));
    setSoloParty(updated);
  };

  const handleSoloClassChange = (id: string, cls: ClassName) => {
    setSoloParty(prev =>
      prev.map(c => {
        if (c.id === id) {
          const updatedStats = { ...START_STATS[cls] };
          return {
            ...c,
            class: cls,
            stats: updatedStats,
            hp: 80 + updatedStats.CON * 12,
            maxHp: 80 + updatedStats.CON * 12,
            gridX: c.gridX,
            avatarUrl: CLASS_AVATARS[cls],
          };
        }
        return c;
      })
    );

    if (id === "char_1" && activeProfile) {
      const classTP = activeProfile.talentPointsByClass?.[cls] !== undefined 
        ? activeProfile.talentPointsByClass[cls] 
        : (activeProfile.level ?? 1) + 2;
      const classUnlocks = activeProfile.unlockedTalentsByClass?.[cls] || [];
      
      const talentPointsByClass = activeProfile.talentPointsByClass || {};
      const unlockedTalentsByClass = activeProfile.unlockedTalentsByClass || {};
      talentPointsByClass[cls] = classTP;
      unlockedTalentsByClass[cls] = classUnlocks;

      handleSaveProfile({
        ...activeProfile,
        class: cls,
        talentPoints: classTP,
        unlockedTalents: classUnlocks,
        talentPointsByClass,
        unlockedTalentsByClass,
      });
    }
  };

  // updateSoloGrid removed

  const handleStartSolo = () => {
    const preparedParty: Character[] = soloParty.map((sp, idx) => ({
      ...sp,
      id: idx === 0 && activeProfile?.id ? activeProfile.id : sp.id,
      level: 1,
      xp: 0,
      hp: 80 + START_STATS[sp.class as ClassName].CON * 12,
      maxHp: 80 + START_STATS[sp.class as ClassName].CON * 12,
      stats: { ...START_STATS[sp.class as ClassName] },
      unspentPoints: 0,
      allocatedPoints: 0,
      equipment: {
        weapon: null,
        offhand: null,
        helmet: null,
        chestplate: null,
        leggings: null,
        boots: null,
        ring: null,
        bracelet: null,
        necklace: null,
        charm: null
      },
      statusEffects: [],
      fallenStacks: 0,
      inventory: idx === 0 ? (activeProfile?.inventory || []) : [],
    } as Character));
    onStartGame(preparedParty, "solo", "LOCAL", "solo");
  };

  const generateAndSetRoom = () => {
    const code = "MED-" + Math.floor(Math.random() * 9000 + 1000);
    setRoomId(code);
    setLobbyPlayers([]);
    setMyReady(false);
    setIsLobbyHost(true);
  };

  const handleStartMultiplayer = () => {
    const classTP = myProfile?.talentPointsByClass?.[myLobbyClass] !== undefined 
      ? myProfile.talentPointsByClass[myLobbyClass] 
      : 0;
    const classUnlocks = myProfile?.unlockedTalentsByClass?.[myLobbyClass] || [];

    const meCompiled = {
      id: myPlayerId,
      name: myLobbyName,
      cls: myLobbyClass,
      isHost: isLobbyHost,
      ready: true,
      level: myProfile?.level ?? 1,
      xp: myProfile?.xp ?? 0,
      talentPoints: classTP,
      unlockedTalents: classUnlocks,
      talentPointsByClass: myProfile?.talentPointsByClass || {},
      unlockedTalentsByClass: myProfile?.unlockedTalentsByClass || {},
      avatarUrl: myProfile?.avatarUrl || CLASS_AVATARS[myLobbyClass],
      race: myProfile?.race || "Human",
    };
    // Re-compile list based on sortedPeersList order!
    const allPlayersCompiled = sortedPeersList.map((p, idx) => {
      if (p.id === myPlayerId) {
        return {
          ...meCompiled,
          gridX: idx + 1,
          gridY: 1,
        };
      }
      return {
        ...p,
        gridX: idx + 1,
        gridY: 1,
      };
    });

    syncBridge.send(`aac-lobby-${roomId}`, {
      type: "START_MULTIPLAYER_GAME",
      payload: {
        party: allPlayersCompiled
      }
    });

    const fullParty: Character[] = allPlayersCompiled.map(p => {
      const starter = START_STATS[p.cls as ClassName] || START_STATS.Warrior;
      return {
        id: p.id,
        name: p.name,
        class: p.cls,
        level: 1,
        xp: 0,
        hp: 80 + starter.CON * 12,
        maxHp: 80 + starter.CON * 12,
        energy: 2,
        maxEnergy: 7,
        stats: { ...starter },
        allocatedPoints: 0,
        unspentPoints: 0,
        gridX: p.gridX,
        gridY: p.gridY,
        equipment: {
          weapon: null,
          offhand: null,
          helmet: null,
          chestplate: null,
          leggings: null,
          boots: null,
          ring: null,
          bracelet: null,
          necklace: null,
          charm: null
        },
        statusEffects: [],
        avatarUrl: p.avatarUrl || CLASS_AVATARS[p.cls as ClassName] || CLASS_AVATARS.Warrior,
        talentPoints: p.talentPoints ?? 3,
        unlockedTalents: p.unlockedTalents ?? [],
        talentPointsByClass: p.talentPointsByClass || {},
        unlockedTalentsByClass: p.unlockedTalentsByClass || {},
        fallenStacks: 0,
        race: p.race || "Human",
      };
    });
    onStartGame(fullParty, "multiplayer", roomId, myPlayerId);
  };

  // renderLobbyTalentTree removed

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 bg-slate-900 border-2 border-amber-500/30 rounded-xl shadow-2xl relative overflow-hidden text-slate-100">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full pointer-events-none blur-xl"></div>
      
      {/* Gilded Header */}
      <div className="text-center mb-8 border-b border-amber-500/20 pb-6">
        <h1 className="text-3xl md:text-5xl font-mono font-bold tracking-wider text-amber-400 drop-shadow-md uppercase">
          An Average Campaign
        </h1>
        <p className="text-slate-400 font-sans text-sm md:text-base mt-2">
          Gilded tactical board & grid RPG. Customize position, level up classes to advanced prestige.
        </p>
      </div>

      {/* Mode Toggles */}
      <div className="flex gap-4 justify-center mb-8">
        <button
          onClick={() => { setP2pMode("solo"); setRoomId(""); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border font-mono font-bold transition-all text-sm uppercase ${
            p2pMode === "solo"
              ? "bg-amber-500 text-slate-950 border-amber-500 shadow-lg shadow-amber-500/20"
              : "bg-slate-800/60 text-slate-300 border-slate-700 hover:border-amber-500/40"
          }`}
        >
          <User className="w-4 h-4" />
          Solo Camp Creator
        </button>
        <button
          onClick={() => { setP2pMode("multiplayer"); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border font-mono font-bold transition-all text-sm uppercase ${
            p2pMode === "multiplayer"
              ? "bg-amber-500 text-slate-950 border-amber-500 shadow-lg shadow-amber-500/20"
              : "bg-slate-800/60 text-slate-300 border-slate-700 hover:border-amber-500/40"
          }`}
        >
          <Users className="w-4 h-4" />
          P2P Sync Tab
        </button>
      </div>

      {/* Solo Party Builder - Hidden in Multiplayer */}
      {p2pMode === "solo" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-800/40 p-4 rounded-lg border border-slate-800">
            <div>
              <h3 className="text-md font-mono text-amber-300 uppercase font-semibold">Your Adventuring Party</h3>
              <p className="text-xs text-slate-400">Assemble up to 4 heroes. Position is key.</p>
            </div>
            {soloParty.length < 4 && (
              <button
                onClick={addSoloCharacter}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-all text-xs font-mono font-bold border"
                id="btn-add-companion"
              >
                <Plus className="w-4 h-4" /> Add Companion
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {soloParty.map((char, index) => (
              <div key={char.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/60 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold font-mono text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">
                      Hero #{index + 1} ({char.level > 1 ? `Lv ${char.level}` : "Lv 1"})
                    </span>
                    {soloParty.length > 1 && (
                      <button
                        onClick={() => removeSoloCharacter(char.id)}
                        className="text-red-400 hover:text-red-300 text-xs font-mono font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>


                  {/* Name Input */}
                  <div className="mb-3">
                    <label className="text-xs text-slate-400 block mb-1">Name</label>
                    <input
                      type="text"
                      value={char.name}
                      onChange={(e) => {
                        const newName = e.target.value;
                        setSoloParty(prev => prev.map(c => c.id === char.id ? { ...c, name: newName } : c));
                        if (char.id === "char_1" && activeProfile) {
                          handleSaveProfile({ ...activeProfile, username: newName });
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-100 font-medium focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Avatar URL Input */}
                  <div className="mb-3">
                    <label className="text-xs text-slate-400 block mb-1">Avatar Image URL</label>
                    <input
                      type="text"
                      placeholder="Leave blank for default"
                      value={char.avatarUrl || ""}
                      onChange={(e) => {
                        const url = e.target.value;
                        setSoloParty(prev => prev.map(c => c.id === char.id ? { ...c, avatarUrl: url } : c));
                        if (char.id === "char_1" && activeProfile) {
                          handleSaveProfile({ ...activeProfile, avatarUrl: url });
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Class selection */}
                  <div className="mb-3">
                    <label className="text-xs text-slate-400 block mb-1">Base Guild Role</label>
                    <select
                      value={char.class}
                      onChange={(e) => handleSoloClassChange(char.id, e.target.value as ClassName)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                    >
                      <option value="Warrior">Warrior (Melee, high HP and Defense)</option>
                      <option value="Archer">Archer (Scale DEX + STR)</option>
                      <option value="Mage">Mage (Scale INT, magical AOE)</option>
                      <option value="Cleric">Cleric (Scale FTH, heal/shelter)</option>
                      <option value="Rogue">Rogue (Scale DEX + LCK, high crit)</option>
                      <option value="Bard">Bard (Scale CHA + LCK, support)</option>
                    </select>
                  </div>

                  {/* Race Selection */}
                  <div className="mb-3">
                    <label className="text-xs text-slate-400 block mb-1">Race Choice</label>
                    <select
                      value={char.race || "Human"}
                      onChange={(e) => {
                        const raceVal = e.target.value as any;
                        setSoloParty(prev => prev.map(c => c.id === char.id ? { ...c, race: raceVal } : c));
                        if (char.id === "char_1" && activeProfile) {
                          handleSaveProfile({ ...activeProfile, race: raceVal });
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                    >
                      {racesList.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  {/* Position selector removed */}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/40 text-xs font-mono grid grid-cols-3 gap-1.5 text-center text-slate-400 bg-slate-900/30 p-2 rounded">
                  <div>STR: {char.stats.STR}</div>
                  <div>DEX: {char.stats.DEX}</div>
                  <div>CON: {char.stats.CON}</div>
                  <div>INT: {char.stats.INT}</div>
                  <div>FTH: {char.stats.FTH}</div>
                  <div>LCK: {char.stats.LCK}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleStartSolo}
            className="w-full py-4 mt-6 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-mono font-bold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 hover:brightness-110 active:scale-[0.99] transition-all text-md uppercase cursor-pointer"
            id="btn-embark-solo"
          >
            <Swords className="w-5 h-5" /> Embark on Campaign Solo
          </button>
        </div>
      )}

      {/* Multiplayer Synchronizer Options */}
      {p2pMode === "multiplayer" && (
        <div className="space-y-6">
          {!roomId ? (
            <div className="p-6 bg-slate-850/50 rounded-xl border border-slate-800 space-y-6 max-w-md mx-auto">
              <div className="text-center space-y-2">
                <Users className="w-12 h-12 text-amber-400 mx-auto" />
                <h3 className="text-lg font-mono font-bold uppercase text-slate-200">P2P Multiplayer Connection</h3>
                <p className="text-xs text-slate-400">
                  Connect with other players to embark on a campaign together.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800">
                {/* Host Option */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-mono font-bold block uppercase">Option A: Host a Campaign</span>
                  <button
                    onClick={generateAndSetRoom}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 font-mono text-xs font-bold uppercase rounded-lg shadow-md transition-all cursor-pointer"
                  >
                    Generate Room Code & Host
                  </button>
                </div>

                <div className="flex items-center my-3">
                  <div className="flex-1 border-t border-slate-800"></div>
                  <span className="px-3 text-xs font-mono text-slate-500 uppercase">Or</span>
                  <div className="flex-1 border-t border-slate-800"></div>
                </div>

                {/* Join Option */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-mono font-bold block uppercase">Option B: Join Existing Campaign</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Room Code (e.g. MED-1234)"
                      value={tempRoomId}
                      onChange={(e) => setTempRoomId(e.target.value.toUpperCase())}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                    />
                    <button
                      onClick={() => {
                        const code = tempRoomId.trim();
                        if (code) {
                          setRoomId(code);
                          setLobbyPlayers([]);
                          setMyReady(false);
                          setIsLobbyHost(false);
                        }
                      }}
                      disabled={!tempRoomId.trim()}
                      className={`px-4 py-2 font-mono font-bold text-xs uppercase rounded-lg transition-all shrink-0 cursor-pointer ${
                        tempRoomId.trim()
                          ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                          : "bg-slate-800 text-slate-650 border border-slate-850 cursor-not-allowed"
                      }`}
                    >
                      Join
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-md font-mono text-amber-300 uppercase font-semibold">Active Sync Room Code</h3>
                  <p className="text-xs text-slate-400">Share this code with your friends so they can join you.</p>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="bg-slate-900 border-2 border-amber-500/20 text-center font-mono font-bold tracking-widest text-amber-400 px-4 py-2.5 rounded-lg text-md min-w-[120px]">
                    {roomId}
                  </span>
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
                      if ((window as any).showNotification) {
                        (window as any).showNotification("Room code copied to clipboard!", "success");
                      }
                    }}
                    className="px-3 py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs border border-slate-700 cursor-pointer"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => {
                      setRoomId("");
                      setTempRoomId("");
                      setLobbyPlayers([]);
                      setMyReady(false);
                      setIsLobbyHost(false);
                    }}
                    className="px-3 py-2.5 rounded bg-red-950/45 hover:bg-red-900/45 text-red-400 font-mono text-xs border border-red-900/30"
                  >
                    Leave
                  </button>
                </div>
              </div>
              
              <div className="text-xs font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 p-2.5 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>P2P WebSocket attached to room <strong>{roomId}</strong>. Lobby events are synced across tabs.</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* My Config card */}
            <div className="p-5 bg-slate-800/60 rounded-xl border border-amber-500/20 space-y-4">
              <h4 className="text-sm font-mono text-amber-400 uppercase font-bold tracking-wider border-b border-slate-700/50 pb-2">
                Your Character Card
              </h4>
              
              <div>
                <label className="text-xs text-slate-400 block mb-1">Your Peer Name</label>
                <input
                  type="text"
                  value={myLobbyName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setMyLobbyName(name);
                    if (myProfile) {
                      handleSaveProfile({ ...myProfile, username: name });
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 font-medium focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  placeholder="Paste profile image link"
                  value={myProfile?.avatarUrl || ""}
                  onChange={(e) => {
                    const url = e.target.value;
                    if (myProfile) {
                      handleSaveProfile({ ...myProfile, avatarUrl: url });
                    } else {
                      setMyProfile({
                        id: "profile_" + Math.random().toString(36).substr(2, 9),
                        username: myLobbyName,
                        level: 1,
                        xp: 0,
                        gold: 150,
                        talentPoints: 3,
                        unlockedTalents: [],
                        avatarUrl: url
                      });
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Base Guild Role</label>
                <select
                  value={myLobbyClass}
                  onChange={(e) => {
                    const cls = e.target.value as ClassName;
                    setMyLobbyClass(cls);
                    if (myProfile) {
                      const classTP = myProfile.talentPointsByClass?.[cls] !== undefined 
                        ? myProfile.talentPointsByClass[cls] 
                        : (myProfile.level ?? 1) + 2;
                      const classUnlocks = myProfile.unlockedTalentsByClass?.[cls] || [];
                      
                      const talentPointsByClass = myProfile.talentPointsByClass || {};
                      const unlockedTalentsByClass = myProfile.unlockedTalentsByClass || {};
                      talentPointsByClass[cls] = classTP;
                      unlockedTalentsByClass[cls] = classUnlocks;

                      handleSaveProfile({
                        ...myProfile,
                        class: cls,
                        talentPoints: classTP,
                        unlockedTalents: classUnlocks,
                        talentPointsByClass,
                        unlockedTalentsByClass,
                      });
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                >
                  <option value="Warrior">Warrior (Melee, high HP and Defense)</option>
                  <option value="Archer">Archer (Scale DEX + STR)</option>
                  <option value="Mage">Mage (Scale INT, magical AOE)</option>
                  <option value="Cleric">Cleric (Scale FTH, heal/shelter)</option>
                  <option value="Rogue">Rogue (Scale DEX + LCK, high crit)</option>
                  <option value="Bard">Bard (Scale CHA + LCK, support)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Race Choice</label>
                <select
                  value={myProfile?.race || "Human"}
                  onChange={(e) => {
                    const r = e.target.value as any;
                    if (myProfile) {
                      handleSaveProfile({ ...myProfile, race: r });
                    } else {
                      setMyProfile({
                        id: "profile_" + Math.random().toString(36).substr(2, 9),
                        username: myLobbyName,
                        level: 1,
                        xp: 0,
                        gold: 150,
                        talentPoints: 3,
                        unlockedTalents: [],
                        avatarUrl: "",
                        race: r
                      });
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                >
                  {racesList.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setMyReady(!myReady)}
                  className={`w-full py-2.5 rounded font-mono font-bold text-xs uppercase cursor-pointer border ${
                    myReady
                      ? "bg-emerald-500 text-slate-950 border-emerald-500 hover:bg-emerald-600"
                      : "bg-slate-800 text-amber-500 border-amber-500/30 hover:border-amber-500/60"
                  }`}
                >
                  {myReady ? "✓ Ready to Embark" : "Set Ready Status"}
                </button>
              </div>
            </div>

            {/* Sync Lobby connected clients card */}
            <div className="p-5 bg-slate-800/40 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-mono text-amber-400 uppercase font-bold tracking-wider border-b border-slate-700/50 pb-2 mb-3">
                  Connected Peers ({lobbyPlayers.length + 1}/6)
                </h4>
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto">
                  {/* Me */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-950/20 border border-indigo-900/40">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 anim-pulse animate-pulse"></div>
                      <span className="text-sm font-bold">{myLobbyName} (You)</span>
                    </div>
                    <span className="text-xs font-mono text-amber-300">{myLobbyClass} • Slot {myGridX}</span>
                  </div>

                  {/* Connected tab peers */}
                  {lobbyPlayers.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-xs text-slate-500 font-mono italic">Waiting for peers to join...</p>
                      <span className="text-[10px] text-slate-500 block mt-1">Open another tab & enter code {roomId}</span>
                    </div>
                  ) : (
                    lobbyPlayers.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded bg-slate-800 border border-slate-700">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${p.ready ? "bg-emerald-500" : "bg-amber-500"}`}></div>
                          <span className="text-sm font-medium">{p.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono text-amber-400 block">{p.cls}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">Slot {p.gridX} • {p.ready ? "READY" : "WAIT"}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700/50 mt-4">
                <button
                  onClick={handleStartMultiplayer}
                  disabled={!myReady || lobbyPlayers.some(p => !p.ready)}
                  className={`w-full py-3.5 rounded-lg font-mono font-bold uppercase text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer ${
                    myReady && !lobbyPlayers.some(p => !p.ready)
                      ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                      : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                  }`}
                  id="btn-embark-multi"
                >
                  <Swords className="w-4 h-4" /> Start Multiplayer Run
                </button>
                {!myReady && (
                  <p className="text-[10px] text-amber-500 text-center font-mono mt-1.5 flex items-center justify-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> Ready up yourself first to enable embarking!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
