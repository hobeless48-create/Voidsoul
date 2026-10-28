const fs = require('fs');

const talentsContent = fs.readFileSync('src/talents_db.ts', 'utf8');

// A super basic parser to find if a talent has explicit properties
// This uses regex to find blocks of code for each talent
const talentBlocksRegex = /{\s*id:\s*['"]([a-z0-9_]+)['"][\s\S]*?}/g;
let match;
const unhandledTalents = [];

const autoHandledProps = [
  'statsBonus',
  'flatMaxHp',
  'flatDef',
  'flatDamageReduction',
  'flatCrit',
  'flatDodge',
];

const skillsDb = fs.readFileSync('src/skills_db.ts', 'utf8');
const battleScene = fs.readFileSync('src/components/BattleScene.tsx', 'utf8');
const combatMath = fs.readFileSync('src/utils/combatMath.ts', 'utf8');
const allCode = skillsDb + ' ' + battleScene + ' ' + combatMath;

while ((match = talentBlocksRegex.exec(talentsContent)) !== null) {
  const id = match[1];
  const block = match[0];
  
  // Does this block only contain autoHandledProps (and standard metadata)?
  // Standard metadata: id, name, description, cost, isPassive, gridX, gridY, parents, requiresWeapon
  const standardProps = [
    'id', 'name', 'description', 'cost', 'isPassive', 'gridX', 'gridY', 'parents', 'requiresWeapon'
  ];
  
  // Remove standard and auto properties from the block string to see if anything else is there
  // Actually, wait, it's easier to just check if there is an explicit mention in code OR if it's purely stats.
  // Let's just check if it's explicitly mentioned in the code.
  const isExplicitlyHandled = allCode.includes(`"${id}"`) || allCode.includes(`'${id}'`);
  
  // If not explicitly handled, does it ONLY provide autoHandledProps?
  // Let's read the description. If the description mentions things like "has a 30% chance to Stun", that is NOT an auto-handled prop!
  // If the description only mentions "Permanent +X stat" and we see `statsBonus` etc., it's fine.
  
  if (!isExplicitlyHandled) {
    unhandledTalents.push({ id, block });
  }
}

console.log('Talents without explicit hardcoded references:', unhandledTalents.length);
unhandledTalents.forEach(t => {
  console.log('---');
  console.log(t.id);
  // parse out the description line
  const descMatch = t.block.match(/description:\s*['"](.*?)['"]/);
  if (descMatch) {
    console.log('Desc:', descMatch[1]);
  }
});
