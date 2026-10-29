# Void Soul

A browser RPG where a party of heroes travels through branching chapters, fights turn-based encounters, resolves events, and develops classes, talents, and equipment. Play solo or cooperate through the included WebSocket relay.

## Goal

Keep your party alive and defeat the final boss of **Chapter 5** to win the campaign. The adventure begins in the corrupted Glimmering Woods of Eldrath, then branches into different routes and final regions.

Win individual battles by defeating all enemies. A full party wipe ends the run. The selected route determines the later chapters and final encounter; the campaign is broader than the original Lich King storyline described in older notes.

## Run it

Requirements: Node.js 22.12 or newer, npm, Git for cloning, and a modern browser.

Open PowerShell and run:

```powershell
git clone https://github.com/hobeless48-create/Voidsoul.git
cd Voidsoul
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:3000/`. The development server provides the frontend, profile API, and WebSocket sync endpoint. Core gameplay needs no AI API key.

Keep the server running while playing. Profiles and multiplayer depend on its endpoints.

## How to play solo

1. Create or load a profile, then open **Start Campaign** in the tavern/profile screen.
2. Use **Solo Camp Creator** to assemble a party of up to four heroes. Choose names, races, classes, and formation positions.
3. Choose **Embark on Campaign Solo** to enter the map.
4. Select a route node. Nodes can lead to ordinary combat, elite combat, events, or a merchant.
5. In battle, wait for a hero's turn in the initiative order. Choose **Fight**, select an available skill, and choose a legal enemy or ally target.
6. Use **Concentrate Focus (+2 Energy)** when you need resources for another skill, or use items to recover and respond to status effects.
7. Between encounters, use camp to rest, craft, manage gear, trade, and store resources. Read event choices before committing to a stat check or its consequences.
8. Spend progression rewards and take class advancements when eligible. Clear each chapter's boss, choose later routes, and reach the Chapter 5 finale.

A first party can combine a Warrior on the frontline with an Archer or Mage and a Cleric or Bard for support. Use the in-game Help Guide to compare class roles and skills.

## Current play loop

**Tavern and party setup → map choice → battle or event → camp and upgrades → next area → chapter boss → next route → final victory or defeat.**

The Forest opening has eight areas; later chapter routes generally use five.

| Chapter | Possible regions |
| --- | --- |
| 1 | Forest |
| 2 | Cave or Dungeon |
| 3 | Abandoned Trail or Trading City |
| 4 | Lich Castle, Peaceful City, Sky Island, or Frontline |
| 5 | Void, White Citadel, Mysterious Lab, or Horizon Castle |

The route branches after the opening chapter and again after Chapter 3. Your earlier route limits which later regions are available.

## Rules notes

### Party and formation

A party contains up to four heroes on a 3 × 3 formation grid. The first column is the frontline and the third is the backline. Warrior classes cannot be placed in the back column.

The six base classes are **Warrior, Archer, Mage, Cleric, Rogue, and Bard**. They fill different damage, defense, healing, and support roles. Formation and a skill's target type determine who can be affected.

### Turns and combat

Combatants roll initiative at battle start; higher results act first. Skills have Energy requirements, targeting rules, and cooldowns. Use Focus to recover Energy instead of repeatedly attempting an unavailable skill.

Damage and healing scale with class stats and skill multipliers. The current defense helper applies percentage mitigation:

`round(base damage × 100 / (100 + DEF))`

It then applies flat damage reduction with a minimum of 1 damage, plus relevant talent adjustments. Other effects, such as block, shields, guard, accuracy, and dodge, also matter. Dodge chance is capped at 30%.

Burn, poison, bleed, taunt, stagger, shields, regeneration, and other effects can change a fight. Read the status icons, skill description, and combat log before choosing a target.

### Progression and defeat

- Gain XP, develop talents, and improve equipment as the run progresses.
- Class advancement milestones occur at levels **15, 30, 50, and 75**. Later milestones add further specialization.
- A fallen hero can return after the surviving party wins a battle, gaining a **Fallen** stack and recovering at reduced HP.
- Fallen stacks penalize damage, healing received, and shielding received. After three stacks, falling again permanently removes the hero.
- If everyone falls, the run ends instead of granting the normal post-victory recovery.

### Events, equipment, and camp

Events can reward gold, XP, items, or buffs, but failed choices can cause damage, debuffs, or another battle. Check which hero and stats a choice uses.

Equipment has ten slots: weapon, offhand, helmet, chest, legs, boots, ring, bracelet, necklace, and charm. Materials from encounters feed camp crafting. Use the Blacksmith and the available recipes to decide which upgrades you can afford.

## Controls

The game uses labeled buttons and selection panels:

| Screen | Main interactions |
| --- | --- |
| Tavern / profile | Create or load heroes, manage progression, and start a campaign |
| Party builder | Choose classes and races, edit heroes, and arrange formation |
| Map | Select an available path or event option |
| Battle | Select Fight, a skill, its target, an item, or Focus |
| Camp | Rest, craft, equip, trade, and manage storage |
| Help Guide | Read class, combat, progression, and crafting references |

## Multiplayer

1. Both players open the game through the **same running server**. On separate devices, use a reachable server address instead of each device's `localhost`.
2. In the multiplayer lobby, the host chooses **Generate Room Code & Host** and shares the room code.
3. Other players join that room and configure their heroes and positions.
4. Everyone selects **Set Ready Status**. The host chooses **Start Multiplayer Run** when all players are ready.
5. Cooperate on combat, route voting, event choices, and shared resources.

The current transport uses a WebSocket relay; the lobby's P2P wording does not mean the game works without the server. Same-origin browser tabs also use BroadcastChannel for local synchronization.

For hosted multiplayer, deploy the frontend and Node server together on a host that supports persistent processes and WebSockets. The included [render.yaml](render.yaml) describes a Render web service.

## Saves and production serving

Profiles are stored as JSON files under `saves/` by the local server. Back up that directory separately to preserve player progress, and use the same server to access those profiles.

To build and serve the production app:

```powershell
npm run build
npm start
```

The server listens on port 3000 or the value of the `PORT` environment variable. `npm run preview` serves only the built frontend; it does not supply the production profile API or WebSocket relay.

## Useful files

- [Application](src/App.tsx) — campaign phases, route progression, rewards, victory, and defeat.
- [Lobby](src/components/BroadcastLobby.tsx) — party setup, room codes, readiness, and starting runs.
- [Battle scene](src/components/BattleScene.tsx) — initiative, skills, status effects, and Fallen recovery.
- [Combat math](src/utils/combatMath.ts) — current damage, defense, accuracy, and dodge calculations.
- [Camp](src/components/CampingMenu.tsx) and [class advancement](src/components/ClassAdvancement.tsx) — between-battle upgrades.
- [Help Guide](src/components/HelpGuide.tsx) — the in-game guide.
- [Profile screen](src/components/ProfileView.tsx), [sync bridge](src/utils/sync.ts), and [production server](server/index.js) — profiles and multiplayer.
- [Original game guide](game_guide.txt) — story and early mechanics; some defense and route descriptions predate the current implementation.

## Checks

Run from the repository root:

```powershell
npm run lint
npm test
npm run build
```

`lint` runs TypeScript checking. The test suite covers combat and skill behavior. For a manual check, create a party, finish a battle, use camp, reload a saved profile, and test room readiness with two browsers connected to the same server.
