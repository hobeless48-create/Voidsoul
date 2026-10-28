/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ClassName, TalentNode, Stats, Character } from "../types";
import { START_STATS, CLASS_AVATARS } from "../skills_db";
import { TALENT_TREES } from "../talents_db";
import { syncBridge } from "../utils/sync";
import { BroadcastLobby } from "./BroadcastLobby";
import {
  Play,
  Sparkles,
  BookOpen,
  User,
  RefreshCw,
  CheckCircle2,
  RotateCcw,
  Shield,
  Coins,
  AlertCircle,
} from "lucide-react";

interface ProfileViewProps {
  onStartGame: (
    party: Character[],
    p2pMode: "solo" | "multiplayer",
    roomId: string,
    myPlayerId: string,
  ) => void;
  onClose: () => void;
}

type TabType = "start" | "class" | "skilltree" | "profile" | "reset";

export const racesList = [
  "Human",
  "Elf",
  "Dwarves",
  "Dragonborn",
  "Goblin",
  "Vampire",
  "Succubus",
  "Dryad",
] as const;

export const raceDescriptions: Record<(typeof racesList)[number], string> = {
  Human: "Advantage: +1 stat point to use when level up. Disadvantage: None.",
  Elf: "Advantage: Crit Chance & Crit Damage +20% flat. 50% chance to double material drops. Disadvantage: Takes x2 damage from Poison.",
  Dwarves:
    "Advantage: +10% Max HP. Crafted items gain +10% stats for every 10 levels. Disadvantage: None.",
  Dragonborn:
    "Advantage: +10% Strength. Def increased by +20% or +8 flat (whichever is higher). Disadvantage: Takes x2 damage from Bleed.",
  Goblin: "Advantage: +25% more gold. +1 Initiative roll. Disadvantage: None.",
  Vampire:
    "Advantage: Drains 20% of damage dealt to restore HP. Disadvantage: -20% final stats reduction.",
  Succubus:
    "Advantage: +25% Charisma. Reduces narrative event requirements by 20% (does not stack). Disadvantage: -20% Max HP. Takes x2 damage from Burn.",
  Dryad:
    "Advantage: +20% outgoing healing. Team gains +10% EXP gain (does not stack). Disadvantage: Takes x2 damage from Burn.",
};

export function getTalentNodeCost(
  node: TalentNode,
  selectedClass: ClassName,
  unlockedTalents: string[],
) {
  if (node.cost === 0) return 0;
  const unlockedNonFreeCount = unlockedTalents.filter((id) => {
    const tree = TALENT_TREES[selectedClass] || [];
    const n = tree.find((t) => t.id === id);
    return n && n.cost > 0;
  }).length;
  return node.cost + unlockedNonFreeCount;
}

export function ProfileView({
  onStartGame,
}: {
  onStartGame: ProfileViewProps["onStartGame"];
}) {
  const [activeTab, setActiveTab] = useState<TabType>("start");
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "create">("login");
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Edit fields
  const [avatarUrl, setAvatarUrl] = useState("");
  const [editNameInput, setEditNameInput] = useState("");
  const [selectedClass, setSelectedClass] = useState<ClassName>("Warrior");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const classesList: ClassName[] = [
    "Warrior",
    "Archer",
    "Mage",
    "Cleric",
    "Rogue",
    "Bard",
  ];

  const classDescriptions: Record<ClassName, string> = {
    Warrior:
      "Frontline/midline tank with high HP and Defense. Specializes in sword techniques.",
    Archer:
      "Ranged physical damage dealer scaling on DEX and STR. Locks target down from afar.",
    Mage: "Magical spellcaster with strong AoE spells and burn damage. Scales on INT.",
    Cleric: "Holy support healer who shields and heals. Scales on FTH.",
    Rogue:
      "High critical chance and bleed damage specialist. Scales on DEX and LCK.",
    Bard: "Charismatic support who buffs allies and debuffs enemy defenses. Scales on CHA.",
  };

  // On mount: load last used profile if credentials exist in localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("active_profile_name");
    const savedPassword = localStorage.getItem("active_profile_password");
    if (savedName && savedPassword) {
      setUsernameInput(savedName);
      setPasswordInput(savedPassword);
      handleLoadProfile(savedName, savedPassword);
    } else {
      setIsLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (profile?.class) {
      setSelectedClass(profile.class as ClassName);
    }
  }, [profile?.class]);

  useEffect(() => {
    if (profile) {
      setAvatarUrl(profile.avatarUrl || "");
    }
  }, [profile?.avatarUrl]);

  useEffect(() => {
    if (profile) {
      setEditNameInput(profile.username || "");
    }
  }, [profile?.username]);

  // Helper to load profile
  const handleLoadProfile = async (
    nameToLoad = usernameInput,
    passwordToVerify = passwordInput,
  ) => {
    const trimmed = nameToLoad.trim();
    if (!trimmed) {
      setErrorMsg("Please enter a character name.");
      setIsLoadingProfile(false);
      return;
    }
    if (!passwordToVerify || passwordToVerify.length < 1) {
      setErrorMsg("Password cannot be empty.");
      setIsLoadingProfile(false);
      return;
    }
    setIsLoadingProfile(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch(
        `/api/profile?username=${encodeURIComponent(trimmed)}`,
      );
      if (res.status === 404) {
        setErrorMsg(
          "Character not found. Please register this character first.",
        );
        setProfile(null);
        return;
      }
      if (!res.ok) {
        setErrorMsg("Failed to retrieve character data.");
        setIsLoadingProfile(false);
        return;
      }
      const loaded = await res.json();
      if (loaded) {
        const savedPass =
          loaded.password !== undefined ? String(loaded.password) : "";
        if (savedPass !== String(passwordToVerify)) {
          setErrorMsg("Incorrect password.");
          setProfile(null);
          return;
        }

        // Use username as the stable ID to prevent collisions on page refresh
        if (!loaded.id || loaded.id.startsWith("profile_")) {
          loaded.id = trimmed;
          // Persist the fix back to the server
          syncBridge.saveProfile(trimmed, { ...loaded, id: trimmed });
        }
        if (!loaded.race) {
          loaded.race = "Human";
        }
        const activeCls = (loaded.class || "Warrior") as ClassName;
        const talentPointsByClass = loaded.talentPointsByClass || {};
        const unlockedTalentsByClass = loaded.unlockedTalentsByClass || {};

        if (talentPointsByClass[activeCls] === undefined) {
          talentPointsByClass[activeCls] =
            loaded.talentPoints !== undefined ? loaded.talentPoints : 0;
        }
        if (unlockedTalentsByClass[activeCls] === undefined) {
          unlockedTalentsByClass[activeCls] = loaded.unlockedTalents || [];
        }

        loaded.talentPointsByClass = talentPointsByClass;
        loaded.unlockedTalentsByClass = unlockedTalentsByClass;
        loaded.talentPoints = talentPointsByClass[activeCls];
        loaded.unlockedTalents = unlockedTalentsByClass[activeCls];

        setProfile(loaded);
        setAvatarUrl(loaded.avatarUrl || "");
        localStorage.setItem("active_profile_name", loaded.username);
        localStorage.setItem("active_profile_password", savedPass);
        setSelectedClass(activeCls);
        setSuccessMsg(`Welcome back, ${loaded.username}!`);
      } else {
        setErrorMsg("Failed to parse character data.");
      }
    } catch (err) {
      setErrorMsg("Error communicating with tavern storage.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Helper to create profile
  const handleCreateProfile = async () => {
    const trimmed = usernameInput.trim();
    if (!trimmed) {
      setErrorMsg("Please enter a character name.");
      return;
    }
    if (!passwordInput || passwordInput.length < 1) {
      setErrorMsg("Password cannot be empty.");
      return;
    }
    setIsLoadingProfile(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const checkRes = await fetch(
        `/api/profile?username=${encodeURIComponent(trimmed)}`,
      );
      if (checkRes.ok) {
        setErrorMsg(
          "This name is already registered. Choose another or log in.",
        );
        setIsLoadingProfile(false);
        return;
      }

      const defaultProfile = {
        id: trimmed, // Use username as the stable ID
        username: trimmed,
        password: passwordInput,
        level: 1,
        xp: 0,
        gold: 150,
        talentPoints: 0,
        unlockedTalents: [],
        avatarUrl: "",
        class: "Warrior",
        race: "Human",
        talentPointsByClass: { Warrior: 0 },
        unlockedTalentsByClass: { Warrior: [] },
        inventory: [],
      };

      const success = await syncBridge.saveProfile(trimmed, defaultProfile);
      if (success) {
        setProfile(defaultProfile);
        setAvatarUrl("");
        localStorage.setItem("active_profile_name", trimmed);
        localStorage.setItem("active_profile_password", passwordInput);
        setSelectedClass("Warrior");
        setSuccessMsg(`Character "${trimmed}" created successfully!`);
        setActiveTab("start");
      } else {
        setErrorMsg("Could not save character to disk.");
      }
    } catch (err) {
      setErrorMsg("Error communicating with tavern storage.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Auto-save wrapper
  const handleSaveProfile = async (updatedProfile: any) => {
    if (!updatedProfile?.username) return;
    try {
      const success = await syncBridge.saveProfile(
        updatedProfile.username,
        updatedProfile,
      );
      if (success) {
        setProfile(updatedProfile);
        setSuccessMsg("Changes saved successfully to host disk!");
        if ((window as any).showNotification) {
          (window as any).showNotification(
            "Profile auto-saved to disk!",
            "success",
          );
        }
      } else {
        setErrorMsg("Could not write profile to disk.");
      }
    } catch (err) {
      setErrorMsg("Failed to reach server for profile save.");
    }
  };

  // Select class
  const handleSelectClass = (cls: ClassName) => {
    if (!profile) return;
    setSelectedClass(cls);
    setSelectedNodeId(null);

    const talentPointsByClass = profile.talentPointsByClass || {};
    const unlockedTalentsByClass = profile.unlockedTalentsByClass || {};

    const classTP =
      talentPointsByClass[cls] !== undefined ? talentPointsByClass[cls] : 0;
    const classUnlocks = unlockedTalentsByClass[cls] || [];

    talentPointsByClass[cls] = classTP;
    unlockedTalentsByClass[cls] = classUnlocks;

    const updated = {
      ...profile,
      class: cls,
      talentPoints: classTP,
      unlockedTalents: classUnlocks,
      talentPointsByClass,
      unlockedTalentsByClass,
    };
    handleSaveProfile(updated);
  };

  // Rename Player Profile
  const handleRenamePlayer = async () => {
    if (!profile) return;
    const trimmed = editNameInput.trim();
    if (!trimmed) {
      setErrorMsg("New name cannot be empty.");
      return;
    }
    if (trimmed === profile.username) {
      return; // No change
    }
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoadingProfile(true);

    try {
      // Check if new username is already taken
      const existing = await syncBridge.loadProfile(trimmed);
      if (existing) {
        setErrorMsg("This name is already taken by another character.");
        setIsLoadingProfile(false);
        return;
      }

      // Rename profile
      const oldUsername = profile.username;
      const updatedProfile = { ...profile, username: trimmed };
      const success = await syncBridge.saveProfile(
        trimmed,
        updatedProfile,
        oldUsername,
      );
      if (success) {
        setProfile(updatedProfile);
        localStorage.setItem("active_profile_name", trimmed);
        setSuccessMsg("Character renamed successfully!");
        if ((window as any).showNotification) {
          (window as any).showNotification(
            `Character renamed to ${trimmed}!`,
            "success",
          );
        }
      } else {
        setErrorMsg("Could not save renamed character to storage.");
      }
    } catch (err) {
      setErrorMsg("Failed to rename profile due to network error.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Update avatar
  const handleUpdateAvatar = (url: string) => {
    if (!profile) return;
    setAvatarUrl(url);
    const updated = {
      ...profile,
      avatarUrl: url,
    };
    handleSaveProfile(updated);
  };

  // Prerequisite link check helper
  const canUnlockNode = (node: TalentNode): boolean => {
    if (!profile) return false;
    if (node.cost === 0) return true; // Node 1 is free/default
    if (!node.parents || node.parents.length === 0) return true;

    // Must have at least one parent unlocked
    const unlocked = profile.unlockedTalents || [];
    const tree = TALENT_TREES[selectedClass] || [];
    return node.parents.some((pId) => {
      if (unlocked.includes(pId)) return true;
      const pNode = tree.find((n) => n.id === pId);
      return pNode ? pNode.cost === 0 : false;
    });
  };

  // Buy Talent Node
  const handleBuyTalent = (node: TalentNode) => {
    if (!profile) return;
    const currentPoints = profile.talentPoints ?? 0;
    const cost = getTalentNodeCost(
      node,
      selectedClass,
      profile.unlockedTalents || [],
    );
    if (currentPoints < cost) {
      setErrorMsg("Insufficient Talent Points (TP)!");
      return;
    }
    if (!canUnlockNode(node)) {
      setErrorMsg(
        "Prerequisites not met. Unlock preceding connected nodes first.",
      );
      return;
    }

    const nextUnlocks = [...(profile.unlockedTalents || []), node.id];
    const newPoints = currentPoints - cost;

    const talentPointsByClass = profile.talentPointsByClass || {};
    const unlockedTalentsByClass = profile.unlockedTalentsByClass || {};

    talentPointsByClass[selectedClass] = newPoints;
    unlockedTalentsByClass[selectedClass] = nextUnlocks;

    const updated = {
      ...profile,
      talentPoints: newPoints,
      unlockedTalents: nextUnlocks,
      talentPointsByClass,
      unlockedTalentsByClass,
    };
    handleSaveProfile(updated);
  };

  // Reset / Refund Talents
  const handleResetTalents = () => {
    if (!profile) return;
    const tree = TALENT_TREES[selectedClass] || [];
    const unlocked = profile.unlockedTalents || [];
    const nonFreeUnlocked = tree.filter(
      (n) => unlocked.includes(n.id) && n.cost > 0,
    );
    const K = nonFreeUnlocked.length;
    const sumBaseCosts = nonFreeUnlocked.reduce((sum, n) => sum + n.cost, 0);
    const sumAdditionalCosts = (K * (K - 1)) / 2;
    const totalSpent = sumBaseCosts + sumAdditionalCosts;
    const refundedTP = (profile.talentPoints || 0) + totalSpent;

    const talentPointsByClass = profile.talentPointsByClass || {};
    const unlockedTalentsByClass = profile.unlockedTalentsByClass || {};

    talentPointsByClass[selectedClass] = refundedTP;
    unlockedTalentsByClass[selectedClass] = [];

    const updated = {
      ...profile,
      talentPoints: refundedTP,
      unlockedTalents: [],
      talentPointsByClass,
      unlockedTalentsByClass,
    };

    handleSaveProfile(updated);
    setSelectedNodeId(null);
    if ((window as any).showNotification) {
      (window as any).showNotification(
        `Refunded all TP for ${selectedClass}! Skill tree reset.`,
        "success",
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLoadProfile();
    }
  };

  // Renders the Visual Coordinate Skill Tree
  const renderVisualSkilltree = () => {
    if (!profile) return null;
    const tree = TALENT_TREES[selectedClass] || [];
    const unlocked = profile.unlockedTalents || [];

    // Dimensions: 25x25 cell grid. We will treat coordinates as percentage mapping (coordinate / 25 * 100%)
    return (
      <div className="relative w-full aspect-square md:aspect-video bg-slate-950/80 border border-slate-800 rounded-xl p-2 md:p-6 overflow-hidden">
        {/* SVG connection lines overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {tree.map((node) => {
            if (!node.parents || node.parents.length === 0) return null;

            return node.parents.map((parentId) => {
              const parentNode = tree.find((n) => n.id === parentId);
              if (!parentNode) return null;

              // Convert 25x25 coordinates to percentage values
              const x1 = `${(parentNode.gridX || 0) * 4}%`;
              const y1 = `${(parentNode.gridY || 0) * 4}%`;
              const x2 = `${(node.gridX || 0) * 4}%`;
              const y2 = `${(node.gridY || 0) * 4}%`;

              const parentUnlocked =
                unlocked.includes(parentNode.id) || parentNode.cost === 0;
              const childUnlocked = unlocked.includes(node.id);

              let strokeColor = "rgba(71, 85, 105, 0.4)"; // Locked gray
              let strokeWidth = "2";
              let strokeDash = "4 4";

              if (parentUnlocked && childUnlocked) {
                strokeColor = "#10b981"; // Active emerald green
                strokeWidth = "3";
                strokeDash = "0";
              } else if (parentUnlocked) {
                strokeColor = "#6366f1"; // Connected buyable indigo
                strokeWidth = "2.5";
                strokeDash = "2 2";
              }

              return (
                <line
                  key={`${parentNode.id}-${node.id}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                  className="transition-all duration-300"
                />
              );
            });
          })}
        </svg>

        {/* Render grid slots */}
        {tree.map((node) => {
          const isUnlocked = unlocked.includes(node.id) || node.cost === 0;
          const isSelected = selectedNodeId === node.id;
          const canBuy = canUnlockNode(node);

          // Placement percentages
          const leftPos = `${(node.gridX || 0) * 4}%`;
          const topPos = `${(node.gridY || 0) * 4}%`;

          let ringColor = "border-slate-800 text-slate-500 bg-slate-900";
          if (isUnlocked) {
            ringColor =
              "border-emerald-500 text-emerald-300 bg-emerald-950/40 shadow-lg shadow-emerald-500/20";
          } else if (canBuy) {
            ringColor =
              "border-indigo-500 text-indigo-300 bg-indigo-950/20 animate-pulse";
          }

          if (isSelected) {
            ringColor += " ring-2 ring-amber-400 border-amber-400";
          }

          return (
            <button
              key={node.id}
              onClick={() => setSelectedNodeId(node.id)}
              style={{
                position: "absolute",
                left: leftPos,
                top: topPos,
                transform: "translate(-50%, -50%)",
              }}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-mono font-bold text-xs z-10 transition-all hover:scale-110 cursor-pointer ${ringColor}`}
              title={node.name}
            >
              {node.cost === 0
                ? "F"
                : node.id
                    .split("_")
                    [node.id.split("_").length - 1].replace("t", "")}
            </button>
          );
        })}
      </div>
    );
  };

  if (isLoadingProfile && !profile) {
    return (
      <div className="w-full max-w-6xl mx-auto bg-slate-900 border-2 border-indigo-500/30 rounded-2xl p-10 text-center text-slate-100 flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="w-12 h-12 text-indigo-400 mx-auto animate-spin mb-4" />
        <h4 className="text-md font-mono font-bold uppercase text-slate-300">
          Entering the Tavern...
        </h4>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full max-w-md mx-auto bg-slate-950/80 border-2 border-indigo-500/30 rounded-2xl p-6 md:p-8 text-slate-100 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[450px] animate-[fadeIn_0.3s_ease-out]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full pointer-events-none blur-xl"></div>
        <div className="space-y-4">
          <div className="text-center pb-2">
            <h2 className="text-2xl font-mono font-bold tracking-wider text-indigo-400 flex items-center justify-center gap-2 uppercase">
              🍻 Tavern Entrance
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">
              Register a character name and password to begin your campaign.
            </p>
          </div>

          <div className="flex gap-2 p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => {
                setAuthMode("login");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-1.5 rounded-md text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                authMode === "login"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Recall Hero
            </button>
            <button
              onClick={() => {
                setAuthMode("create");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-1.5 rounded-md text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                authMode === "create"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Register Hero
            </button>
          </div>

          <div className="space-y-3 pt-2 font-mono text-xs">
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1">
                Character Name
              </label>
              <input
                type="text"
                placeholder="e.g. Galahad"
                value={usernameInput}
                onChange={(e) =>
                  setUsernameInput(
                    e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""),
                  )
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-center font-bold tracking-widest focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 font-mono flex items-center gap-1.5 bg-rose-950/20 border border-rose-900/30 p-2 rounded animate-pulse">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </p>
          )}

          {successMsg && (
            <p className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 bg-emerald-950/20 border border-emerald-900/30 p-2 rounded">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {successMsg}
            </p>
          )}
        </div>

        <button
          onClick={
            authMode === "login"
              ? () => handleLoadProfile()
              : handleCreateProfile
          }
          className="w-full py-3 mt-6 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:brightness-110 active:scale-95 text-white font-mono text-xs font-bold uppercase rounded-lg shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          {authMode === "login" ? (
            <>
              <Play className="w-4 h-4" /> Recall & Embark
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Register & Begin
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto bg-slate-900 border-2 border-indigo-500/30 rounded-2xl p-6 md:p-8 text-slate-100 shadow-2xl relative overflow-hidden flex flex-col min-h-[600px]">
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-bl-full pointer-events-none blur-2xl"></div>

      {/* Title */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-mono font-bold tracking-wider text-slate-100 flex items-center gap-2 uppercase">
            🎭 Hero Profiler & Preparation Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure profile stats, choose class archetype, build skill trees,
            and start your campaign.
          </p>
        </div>
        {profile && (
          <div className="hidden sm:flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 font-mono text-xs">
            <span className="text-slate-400">Hero:</span>
            <span className="text-amber-400 font-bold">{profile.username}</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">Class:</span>
            <span className="text-indigo-400 font-bold">{selectedClass}</span>
          </div>
        )}
      </div>

      {/* Navigation Tab Toggles */}
      <div className="flex gap-1.5 border-b border-slate-800 pb-4 mb-6 overflow-x-auto select-none">
        {(
          [
            { id: "start", label: "🎮 1. Start Campaign", icon: Play },
            { id: "class", label: "⚔️ 2. Class Selection", icon: Shield },
            { id: "skilltree", label: "🌳 3. Skill Tree Grid", icon: BookOpen },
            { id: "profile", label: "👤 4. Profile Settings", icon: User },
            { id: "reset", label: "🔄 5. Reset Skills", icon: RefreshCw },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-lg font-mono font-bold text-xs uppercase transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? "bg-indigo-600 text-white shadow shadow-indigo-600/30"
                  : "bg-slate-800 hover:bg-slate-750 text-slate-400 border border-transparent hover:border-slate-700"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content renderer */}
      <div className="flex-1 flex flex-col">
        {/* Tab 1: Start Lobby */}
        <div
          className={`w-full flex-1 ${activeTab === "start" ? "" : "hidden"}`}
        >
          {isLoadingProfile ? (
            <div className="p-10 text-center bg-slate-950/40 border border-slate-800 rounded-xl space-y-4">
              <RefreshCw className="w-12 h-12 text-indigo-400 mx-auto animate-spin" />
              <h4 className="text-md font-mono font-bold uppercase text-slate-300">
                Loading Profile...
              </h4>
            </div>
          ) : profile ? (
            <BroadcastLobby
              onStartGame={onStartGame}
              activeProfile={profile}
              onProfileUpdate={(updated) => setProfile(updated)}
            />
          ) : (
            <div className="p-10 text-center bg-slate-950/40 border border-slate-850 rounded-xl space-y-4">
              <AlertCircle className="w-12 h-12 text-indigo-400 mx-auto" />
              <h4 className="text-md font-mono font-bold uppercase text-slate-300">
                No Profile Loaded
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Please open the **Profile Settings** tab and load or create a
                character profile before preparing.
              </p>
              <button
                onClick={() => setActiveTab("profile")}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-mono font-bold"
              >
                Go to Profile Settings
              </button>
            </div>
          )}
        </div>

        {/* Tab 2: Class Selection - Hidden in Multiplayer Broadcasting Lobby */}
        {activeTab === "class" && (
          <div className="space-y-6 flex-1 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-mono font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-850 pb-2">
                Choose Guild Role Class
              </h3>
              {!profile ? (
                <p className="text-xs text-slate-500 italic">
                  Load profile to select classes.
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic mb-4">
                  Note: In multiplayer, you are automatically in the lobby with
                  your selected class.
                </p>
              )}
              {!profile ? (
                <p className="text-xs text-slate-500 italic">
                  Load profile to select classes.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {classesList.map((cls) => {
                      const isSelected = selectedClass === cls;
                      return (
                        <button
                          key={cls}
                          onClick={() => handleSelectClass(cls)}
                          className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between h-[110px] cursor-pointer ${
                            isSelected
                              ? "bg-indigo-500/10 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/5"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-sm font-bold font-mono">
                              {cls}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                            )}
                          </div>
                          <span className="text-xs text-slate-500 leading-normal mt-2 line-clamp-2">
                            {classDescriptions[cls]}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Attributes base display */}
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-indigo-400 font-bold font-mono block uppercase mb-2">
                      Base {selectedClass} Attributes
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 text-center">
                      {Object.entries(START_STATS[selectedClass] || {}).map(
                        ([stat, val]) => (
                          <div
                            key={stat}
                            className="bg-slate-950 p-2.5 rounded border border-slate-850"
                          >
                            <span className="text-[10px] text-slate-500 block font-mono font-semibold">
                              {stat}
                            </span>
                            <strong className="text-sm text-slate-200 font-bold block">
                              {val}
                            </strong>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Race Selection Display */}
                  <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-mono font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-850 pb-2">
                      Choose Character Race
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {racesList.map((raceName) => {
                        const isSelected = profile.race === raceName;
                        return (
                          <button
                            key={raceName}
                            onClick={() => {
                              const updated = { ...profile, race: raceName };
                              handleSaveProfile(updated);
                            }}
                            className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[140px] cursor-pointer ${
                              isSelected
                                ? "bg-indigo-500/10 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/5"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                            }`}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="text-sm font-bold font-mono">
                                {raceName}
                              </span>
                              {isSelected && (
                                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 leading-normal mt-2">
                              {raceDescriptions[raceName]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Skilltree */}
        {activeTab === "skilltree" && (
          <div className="space-y-6 flex-1 animate-[fadeIn_0.2s_ease-out]">
            {!profile ? (
              <div className="p-10 text-center bg-slate-950/40 border border-slate-850 rounded-xl">
                <p className="text-xs text-slate-500 italic">
                  Please load a profile first to customize the skill tree.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Tree Display */}
                <div className="lg:col-span-2 flex flex-col">
                  {renderVisualSkilltree()}
                </div>

                {/* Node Inspector Panel */}
                <div className="lg:col-span-1 bg-slate-950/70 p-5 rounded-xl border border-slate-800 flex flex-col justify-between min-h-[300px]">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-850 pb-2 mb-4">
                      🔎 Node Inspector
                    </h4>

                    {selectedNodeId ? (
                      (() => {
                        const tree = TALENT_TREES[selectedClass] || [];
                        const node = tree.find((n) => n.id === selectedNodeId);
                        if (!node) return null;

                        const isUnlocked =
                          (profile.unlockedTalents || []).includes(node.id) ||
                          node.cost === 0;
                        const buyable = canUnlockNode(node);
                        const cost = getTalentNodeCost(
                          node,
                          selectedClass,
                          profile.unlockedTalents || [],
                        );
                        const hasPoints = (profile.talentPoints ?? 0) >= cost;

                        return (
                          <div className="space-y-4">
                            <div>
                              <span className="text-xs text-slate-500 font-mono block uppercase">
                                Node Name
                              </span>
                              <strong className="text-md text-slate-100 block font-bold mt-0.5">
                                {node.name}
                              </strong>
                              <div className="flex gap-2 mt-1.5">
                                <span className="text-[10px] font-mono text-indigo-300 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                                  cost: {cost} TP
                                </span>
                                {node.cost === 0 && (
                                  <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                            </div>

                            <div>
                              <span className="text-xs text-slate-500 font-mono block uppercase mb-1">
                                Ability Description
                              </span>
                              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 border border-slate-850 p-3 rounded-lg">
                                {node.description}
                              </p>
                            </div>

                            {node.parents && node.parents.length > 0 && (
                              <div>
                                <span className="text-xs text-slate-500 font-mono block uppercase">
                                  Prerequisites
                                </span>
                                <div className="flex gap-1 mt-1 flex-wrap">
                                  {node.parents.map((pId) => {
                                    const parent = tree.find(
                                      (n) => n.id === pId,
                                    );
                                    const parentUnlocked =
                                      (profile.unlockedTalents || []).includes(
                                        pId,
                                      ) ||
                                      (() => {
                                        const pNode = tree.find(
                                          (n) => n.id === pId,
                                        );
                                        return pNode ? pNode.cost === 0 : false;
                                      })();
                                    return (
                                      <span
                                        key={pId}
                                        className={`text-[9px] font-mono px-2 py-0.5 border rounded ${
                                          parentUnlocked
                                            ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-400"
                                            : "bg-slate-900 border-slate-800 text-slate-500"
                                        }`}
                                      >
                                        {parent ? parent.name : pId}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            <div className="pt-4 border-t border-slate-850/60">
                              {isUnlocked ? (
                                <span className="w-full py-2 bg-emerald-950/30 border border-emerald-800 text-emerald-400 font-mono text-xs font-bold uppercase rounded flex items-center justify-center gap-1.5">
                                  ✓ Node Active
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleBuyTalent(node)}
                                  disabled={!buyable || !hasPoints}
                                  className={`w-full py-3 bg-gradient-to-r text-xs font-mono font-bold uppercase rounded flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer ${
                                    buyable && hasPoints
                                      ? "from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white hover:brightness-110 active:scale-95"
                                      : "from-slate-900 to-slate-950 border border-slate-850 text-slate-600 cursor-not-allowed"
                                  }`}
                                >
                                  {buyable
                                    ? hasPoints
                                      ? `Unlock node (+${cost} TP)`
                                      : "Need Talent Points"
                                    : "Requires preceding nodes"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-xs text-slate-500 italic text-center py-10">
                        Click on a skill node inside the grid to inspect details
                        and unlock.
                      </p>
                    )}
                  </div>

                  <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg text-xs font-mono flex justify-between items-center mt-4 text-slate-400">
                    <span>Active Profile TP pool:</span>
                    <strong className="text-indigo-400 font-bold">
                      {profile.talentPoints ?? 0} TP
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Profile settings */}
        {activeTab === "profile" && (
          <div className="space-y-6 flex-1 animate-[fadeIn_0.2s_ease-out] max-w-xl mx-auto w-full">
            <div className="bg-slate-950/70 p-6 rounded-xl border border-slate-800 space-y-5">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <h3 className="text-sm font-mono font-bold text-indigo-400 uppercase tracking-widest">
                  Character Profile Details
                </h3>
                <button
                  onClick={() => {
                    setProfile(null);
                    localStorage.removeItem("active_profile_name");
                    localStorage.removeItem("active_profile_password");
                    setUsernameInput("");
                    setPasswordInput("");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className="px-3 py-1 bg-rose-950/50 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  Logout / Switch Hero
                </button>
              </div>

              <div className="space-y-4">
                {errorMsg && (
                  <p className="text-xs text-rose-400 font-mono flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
                  </p>
                )}
                {successMsg && (
                  <p className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {successMsg}
                  </p>
                )}

                {profile && (() => {
                  const xpVal = profile.xp || 0;
                  const lobbyLvl = profile.level ?? 1;
                  const xpForNext = Math.floor((lobbyLvl * (lobbyLvl + 1)) / 2 * 3);
                  const xpPrev = Math.floor((lobbyLvl * (lobbyLvl - 1)) / 2 * 3);
                  const xpInLevel = xpVal - xpPrev;
                  const xpNeeded = xpForNext - xpPrev;
                  const xpPct = Math.min(100, Math.round((xpInLevel / Math.max(1, xpNeeded)) * 100));
                  const tpc = profile.talentPointsByClass || {};
                  const utc = profile.unlockedTalentsByClass || {};

                  return (
                  <div className="space-y-4 pt-1 font-mono text-xs">
                    <div className="space-y-1.5 border-b border-slate-800/50 pb-3">
                      <label className="text-xs text-slate-400 uppercase block mb-1">
                        Player Name
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editNameInput}
                          onChange={(e) => setEditNameInput(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={handleRenamePlayer}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-mono font-bold transition-all cursor-pointer"
                        >
                          Rename
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Race:</span>
                      <strong className="text-amber-300 font-bold text-sm">
                        {profile.race || "Human"}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Gold:</span>
                      <strong className="text-yellow-400 font-bold text-sm">
                        {profile.gold ?? 0} G
                      </strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Player Level:</span>
                      <strong className="text-amber-400 font-bold text-sm">
                        Lv {lobbyLvl}
                      </strong>
                    </div>

                    {/* XP Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500">XP: {xpVal}</span>
                        <span className="text-slate-600">Next Lv: {xpForNext}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2.5 border border-slate-700">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-amber-400 h-2.5 rounded-full transition-all"
                          style={{ width: `${xpPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-600">
                        {xpInLevel} / {xpNeeded} XP ({xpPct}%)
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">
                        Unspent TP (current class):
                      </span>
                      <strong className="text-indigo-400 font-bold text-sm">
                        {profile.talentPoints ?? 0} TP
                      </strong>
                    </div>

                    {/* Per-Class Levels & TP */}
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Class Progress
                      </span>
                      {classesList.map(cls => {
                        const clsTP = tpc[cls] || 0;
                        const clsUnlocks = (utc[cls] || []).length;
                        const tree = TALENT_TREES[cls] || [];
                        const maxNodes = tree.length;
                        return (
                          <div key={cls} className="flex justify-between items-center text-[11px]">
                            <span className={`font-bold ${selectedClass === cls ? "text-indigo-300" : "text-slate-500"}`}>
                              {cls}
                            </span>
                            <div className="flex gap-3">
                              <span className="text-indigo-400" title="Talent Points">{clsTP} TP</span>
                              <span className="text-slate-600">|</span>
                              <span className="text-emerald-500" title={`Talents unlocked: ${clsUnlocks}/${maxNodes}`}>
                                {clsUnlocks}/{maxNodes} nodes
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Inventory Summary */}
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                        Inventory
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {(profile.inventory || []).length} items
                      </span>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 uppercase block mb-1">
                        Avatar Image link
                      </label>
                      <input
                        type="text"
                        placeholder="Paste image link"
                        value={avatarUrl}
                        onChange={(e) => handleUpdateAvatar(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {avatarUrl && (
                      <div className="flex justify-center pt-2">
                        <img
                          src={avatarUrl}
                          alt="Avatar Preview"
                          className="w-24 h-24 rounded-xl border border-slate-700 object-cover shadow-md"
                          onError={(e) => {
                            (e.target as any).src =
                              CLASS_AVATARS[selectedClass] ||
                              "https://via.placeholder.com/150";
                          }}
                        />
                      </div>
                    )}
                  </div>
                )})()}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Reset Skills */}
        {activeTab === "reset" && (
          <div className="space-y-6 flex-1 animate-[fadeIn_0.2s_ease-out] max-w-md mx-auto w-full text-center">
            <div className="bg-slate-950/70 p-6 rounded-xl border border-slate-850 space-y-6">
              <RotateCcw className="w-16 h-16 text-amber-500 mx-auto animate-spin-slow" />
              <div className="space-y-2">
                <h4 className="text-md font-mono font-bold uppercase text-slate-200">
                  Reset Unlocked Talents
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to lock all nodes and refund your spent
                  Talent Points (TP) back to your pool? This updates your
                  profile on host disk immediately.
                </p>
              </div>

              {!profile ? (
                <p className="text-xs text-slate-600 italic">
                  No profile loaded to reset.
                </p>
              ) : (
                <button
                  onClick={handleResetTalents}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 font-mono text-xs font-bold uppercase rounded-lg shadow-md transition-all cursor-pointer"
                >
                  Confirm Reset & Refund TP
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
