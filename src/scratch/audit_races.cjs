const fs = require('fs');

const skillsDb = fs.readFileSync('src/skills_db.ts', 'utf8');
const battleScene = fs.readFileSync('src/components/BattleScene.tsx', 'utf8');
const combatMath = fs.readFileSync('src/utils/combatMath.ts', 'utf8');
const allCode = skillsDb + ' ' + battleScene + ' ' + combatMath;

const races = ["Human", "Elf", "Dwarves", "Orc", "Goblin", "Dragonborn", "Undead", "Vampire", "Succubus", "Slime", "Beastman", "Dryad", "Troll"];

const missing = races.filter(race => {
  // A race is implemented if it appears in code with logic. Let's just check if it's explicitly mentioned anywhere else besides standard data declarations.
  // Actually, we can just do a regex count. If it only appears once, it's missing.
  return allCode.split(`"${race}"`).length <= 2;
});

console.log('Unimplemented Races:', missing);

// Now for advanced skills. Let's pull advanced skills from skills_db.ts
const advancedSkillsRegex = /id:\s*['"]([a-z0-9_]+)['"]/g;
const allSkills = [];
let match;
while ((match = advancedSkillsRegex.exec(skillsDb)) !== null) {
  allSkills.push(match[1]);
}

const missingSkills = allSkills.filter(id => {
  return !allCode.includes(`"${id}"`) && !allCode.includes(`'${id}'`);
});
console.log('Unimplemented Skills (not explicit):', missingSkills.length);
