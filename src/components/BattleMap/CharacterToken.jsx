// src/components/BattleMap/CharacterToken.jsx
import React from 'react';
import { getHealthColor } from '../../utils/helpers';

const CharacterToken = ({
  character,
  gridSize,
  isDragged,
  isHovered,
  showNames,
  paintMode,
  onMouseDown,
  onMouseEnter,
  onMouseLeave
}) => {
  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform ${
        paintMode ? 'pointer-events-none' : 'cursor-move'
      }`}
      style={{
        left: `${(character.x + 0.5) * (100/gridSize)}%`,
        top: `${(character.y + 0.5) * (100/gridSize)}%`,
        zIndex: isDragged ? 50 : 10
      }}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      title={character.name}
    >
      {character.sprite ? (
        <img
          src={character.sprite}
          alt={character.name}
          className="w-16 h-16 rounded-lg border-2 object-contain shadow-lg"
          style={{ borderColor: character.borderColor || '#ffffff' }}
        />
      ) : (
        <div
          className="w-16 h-16 rounded-lg border-2 flex items-center justify-center text-lg font-bold shadow-lg"
          style={{ 
            backgroundColor: character.color,
            color: 'white',
            borderColor: character.borderColor || '#ffffff'
          }}
        >
          {character.name.charAt(0)}
        </div>
      )}
      
      {showNames && (
        <div 
          className="absolute top-14 left-1/2 transform -translate-x-1/2 text-xs font-bold px-2 py-1 rounded shadow-lg border"
          style={{
            backgroundColor: character.color || '#6366f1',
            color: 'white',
            borderColor: character.borderColor || '#ffffff'
          }}
        >
          {character.name}
        </div>
      )}
      
      {isHovered && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-800 border border-slate-600 rounded p-2 shadow-lg z-50 whitespace-nowrap">
          <div className="text-white text-xs font-bold mb-1">{character.name}</div>
          <div className="text-white text-xs mb-1">HP: {character.hp || character.maxHp || 20}/{character.maxHp || 20}</div>
          <div className="w-16 h-2 bg-slate-600 rounded overflow-hidden">
            <div 
              className="h-full transition-all duration-300"
              style={{ 
                width: `${((character.hp || character.maxHp || 20) / (character.maxHp || 20)) * 100}%`,
                backgroundColor: getHealthColor(character.hp || character.maxHp || 20, character.maxHp || 20)
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterToken;
