// src/utils/constants.js
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

export const newCharacterTemplate = {
  id: Date.now(),
  name: 'New Character',
  portrait: null,
  sprite: null,
  x: 5,
  y: 5,
  hp: 20,
  maxHp: 20,
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
  color: '#6366f1',
  borderColor: '#ffffff',
  quickMessage: 'Hello! What can I do for you?'
};
