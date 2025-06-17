// src/utils/constants.js - Updated with D&D 5e data
export const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#84cc16'];

export const borderColors = ['#ffffff', '#000000', '#ef4444', '#f59e0b', '#84cc16', '#06b6d4', '#6366f1', '#8b5cf6', '#ec4899', '#fbbf24', '#10b981', '#64748b'];

export const colorOptions = [
  { value: '#6366f1', name: 'Blue' },
  { value: '#8b5cf6', name: 'Purple' },
  { value: '#ec4899', name: 'Pink' },
  { value: '#ef4444', name: 'Red' },
  { value: '#f59e0b', name: 'Orange' },
  { value: '#10b981', name: 'Green' },
  { value: '#06b6d4', name: 'Cyan' },
  { value: '#84cc16', name: 'Lime' }
];

export const borderColorOptions = [
  { value: '#ffffff', name: 'White' },
  { value: '#000000', name: 'Black' },
  { value: '#ef4444', name: 'Red' },
  { value: '#f59e0b', name: 'Orange' },
  { value: '#84cc16', name: 'Lime' },
  { value: '#06b6d4', name: 'Cyan' },
  { value: '#6366f1', name: 'Blue' },
  { value: '#8b5cf6', name: 'Purple' },
  { value: '#ec4899', name: 'Pink' },
  { value: '#fbbf24', name: 'Yellow' },
  { value: '#10b981', name: 'Green' },
  { value: '#64748b', name: 'Grey' }
];

export const gridColors = {
  white: { name: 'White', color: 'rgba(255, 255, 255, 0.4)' },
  grey: { name: 'Grey', color: 'rgba(148, 163, 184, 0.4)' },
  black: { name: 'Black', color: 'rgba(0, 0, 0, 0.6)' }
};

export const terrainTypes = {
  grass: { name: 'Grass', color: '#4ade80', icon: '🌱' },
  water: { name: 'Water', color: '#3b82f6', icon: '🌊' },
  stone: { name: 'Stone', color: '#6b7280', icon: '🪨' },
  sand: { name: 'Sand', color: '#fbbf24', icon: '🏖️' },
  forest: { name: 'Forest', color: '#059669', icon: '🌲' },
  mountain: { name: 'Mountain', color: '#78716c', icon: '⛰️' },
  lava: { name: 'Lava', color: '#dc2626', icon: '🌋' },
  ice: { name: 'Ice', color: '#06b6d4', icon: '🧊' }
};

// D&D 5e specific constants
export const damageTypes = [
  'acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning',
  'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder'
];

export const abilityScores = [
  { key: 'str', name: 'Strength', short: 'STR' },
  { key: 'dex', name: 'Dexterity', short: 'DEX' },
  { key: 'con', name: 'Constitution', short: 'CON' },
  { key: 'int', name: 'Intelligence', short: 'INT' },
  { key: 'wis', name: 'Wisdom', short: 'WIS' },
  { key: 'cha', name: 'Charisma', short: 'CHA' }
];

export const skills = {
  acrobatics: { name: 'Acrobatics', ability: 'dex' },
  animalHandling: { name: 'Animal Handling', ability: 'wis' },
  arcana: { name: 'Arcana', ability: 'int' },
  athletics: { name: 'Athletics', ability: 'str' },
  deception: { name: 'Deception', ability: 'cha' },
  history: { name: 'History', ability: 'int' },
  insight: { name: 'Insight', ability: 'wis' },
  intimidation: { name: 'Intimidation', ability: 'cha' },
  investigation: { name: 'Investigation', ability: 'int' },
  medicine: { name: 'Medicine', ability: 'wis' },
  nature: { name: 'Nature', ability: 'int' },
  perception: { name: 'Perception', ability: 'wis' },
  performance: { name: 'Performance', ability: 'cha' },
  persuasion: { name: 'Persuasion', ability: 'cha' },
  religion: { name: 'Religion', ability: 'int' },
  sleightOfHand: { name: 'Sleight of Hand', ability: 'dex' },
  stealth: { name: 'Stealth', ability: 'dex' },
  survival: { name: 'Survival', ability: 'wis' }
};

export const savingThrows = [
  { key: 'str', name: 'Strength' },
  { key: 'dex', name: 'Dexterity' },
  { key: 'con', name: 'Constitution' },
  { key: 'int', name: 'Intelligence' },
  { key: 'wis', name: 'Wisdom' },
  { key: 'cha', name: 'Charisma' }
];

export const challengeRatings = [
  { cr: '0', xp: 10, proficiency: 2 },
  { cr: '1/8', xp: 25, proficiency: 2 },
  { cr: '1/4', xp: 50, proficiency: 2 },
  { cr: '1/2', xp: 100, proficiency: 2 },
  { cr: '1', xp: 200, proficiency: 2 },
  { cr: '2', xp: 450, proficiency: 2 },
  { cr: '3', xp: 700, proficiency: 2 },
  { cr: '4', xp: 1100, proficiency: 2 },
  { cr: '5', xp: 1800, proficiency: 3 },
  { cr: '6', xp: 2300, proficiency: 3 },
  { cr: '7', xp: 2900, proficiency: 3 },
  { cr: '8', xp: 3900, proficiency: 3 },
  { cr: '9', xp: 5000, proficiency: 4 },
  { cr: '10', xp: 5900, proficiency: 4 }
];

export const spellSchools = [
  'abjuration', 'conjuration', 'divination', 'enchantment',
  'evocation', 'illusion', 'necromancy', 'transmutation'
];

export const spellLevels = [
  { level: 0, name: 'Cantrip' },
  { level: 1, name: '1st Level' },
  { level: 2, name: '2nd Level' },
  { level: 3, name: '3rd Level' },
  { level: 4, name: '4th Level' },
  { level: 5, name: '5th Level' },
  { level: 6, name: '6th Level' },
  { level: 7, name: '7th Level' },
  { level: 8, name: '8th Level' },
  { level: 9, name: '9th Level' }
];

export const alignments = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
];

export const newCharacterTemplate = {
  id: Date.now(),
  name: 'New Character',
  portrait: null,
  sprite: null,
  x: 5,
  y: 5,
  hp: 20,
  maxHp: 20,
  // D&D 5e stats
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
  ac: 10, // Will be calculated as 10 + DEX modifier
  proficiencyBonus: 2,
  speed: 30,
  // Appearance
  color: '#6366f1',
  borderColor: '#ffffff',
  // Character info
  type: 'humanoid',
  alignment: 'True Neutral',
  level: 1,
  class: '',
  race: '',
  background: '',
  // Abilities
  actions: [],
  spells: [],
  conditions: [],
  // Skills and saves (will be expanded later)
  skillProficiencies: [],
  saveProficiencies: [],
  // Roleplay
  quickMessage: 'Hello! What can I do for you?',
  // Combat
  initiative: 0,
  isMonster: false
};

export const defaultPlayerActions = [
  {
    name: 'Unarmed Strike',
    type: 'weapon_attack',
    attackBonus: 0, // Will be calculated based on STR/DEX + proficiency
    damageRoll: '1+STR',
    damageType: 'bludgeoning',
    range: 'melee',
    icon: '👊'
  },
  {
    name: 'Improvised Weapon',
    type: 'weapon_attack',
    attackBonus: 0,
    damageRoll: '1d4+STR',
    damageType: 'bludgeoning',
    range: 'melee/thrown (20/60)',
    icon: '🔨'
  }
];

export const creatureTypes = [
  'aberration', 'beast', 'celestial', 'construct', 'dragon', 'elemental',
  'fey', 'fiend', 'giant', 'humanoid', 'monstrosity', 'ooze',
  'plant', 'undead'
];

// Range and distance utilities
export const calculateDistance = (char1, char2) => {
  if (!char1 || !char2) return 999; // Invalid characters
  const dx = Math.abs((char1.x || 0) - (char2.x || 0));
  const dy = Math.abs((char1.y || 0) - (char2.y || 0));
  // Use Chebyshev distance (max of dx, dy) for D&D grid movement
  return Math.max(dx, dy);
};

export const isInRange = (attacker, target, actionRange) => {
  if (!attacker || !target || !actionRange) return true; // Default to allow if data missing
  
  const distance = calculateDistance(attacker, target);
  
  if (actionRange === 'melee' || actionRange.toLowerCase().includes('melee')) {
    return distance <= 1; // Adjacent squares
  }
  
  // For ranged attacks, extract the range number
  const rangeMatch = actionRange.match(/(\d+)/);
  if (rangeMatch) {
    const range = parseInt(rangeMatch[1]);
    // Convert feet to grid squares (assuming 5 feet per square)
    const rangeInSquares = Math.ceil(range / 5);
    return distance <= rangeInSquares;
  }
  
  // Default to allowing the action if we can't parse range
  return true;
};

export const getRangeDescription = (actionRange) => {
  if (!actionRange) return 'Unknown range';
  
  if (actionRange === 'melee' || actionRange.toLowerCase().includes('melee')) {
    return 'Adjacent only';
  }
  
  const rangeMatch = actionRange.match(/(\d+)/);
  if (rangeMatch) {
    const range = parseInt(rangeMatch[1]);
    const rangeInSquares = Math.ceil(range / 5);
    return `${rangeInSquares} squares (${range} ft)`;
  }
  
  return actionRange || 'Unknown range';
};
export const commonWeapons = {
  dagger: {
    name: 'Dagger',
    damage: '1d4',
    damageType: 'piercing',
    properties: ['finesse', 'light', 'thrown'],
    range: 'melee/thrown (20/60)'
  },
  shortsword: {
    name: 'Shortsword',
    damage: '1d6',
    damageType: 'piercing',
    properties: ['finesse', 'light'],
    range: 'melee'
  },
  longsword: {
    name: 'Longsword',
    damage: '1d8',
    damageType: 'slashing',
    properties: ['versatile (1d10)'],
    range: 'melee'
  },
  greataxe: {
    name: 'Greataxe',
    damage: '1d12',
    damageType: 'slashing',
    properties: ['heavy', 'two-handed'],
    range: 'melee'
  },
  shortbow: {
    name: 'Shortbow',
    damage: '1d6',
    damageType: 'piercing',
    properties: ['ammunition', 'two-handed'],
    range: 'ranged (80/320)'
  },
  longbow: {
    name: 'Longbow',
    damage: '1d8',
    damageType: 'piercing',
    properties: ['ammunition', 'heavy', 'two-handed'],
    range: 'ranged (150/600)'
  }
};
