
// src/components/Character/CharacterStats.jsx
import React from 'react';
import { getStatModifier } from '../../utils/helpers';

const CharacterStats = ({ character, onChange }) => {
  const stats = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

  const handleStatChange = (stat, value) => {
    onChange(prev => ({
      ...prev,
      [stat]: parseInt(value) || 10
    }));
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map(stat => (
        <div key={stat}>
          <label className="block text-slate-300 font-medium mb-1 capitalize text-sm">{stat}</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="30"
              value={character[stat]}
              onChange={(e) => handleStatChange(stat, e.target.value)}
              className="w-16 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <span className="text-slate-400 text-sm">
              ({getStatModifier(character[stat]) >= 0 ? '+' : ''}{getStatModifier(character[stat])})
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CharacterStats;
