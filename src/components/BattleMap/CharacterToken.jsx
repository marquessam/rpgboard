// src/components/BattleMap/CharacterToken.jsx - Updated with selection
import React from 'react';
import { getHealthColor, getStatModifier } from '../../utils/helpers';

const CharacterToken = ({
  character,
  gridSize,
  isDragged,
  isHovered,
  isSelected,
  showNames,
  paintMode,
  onMouseDown,
  onClick,
  onMouseEnter,
  onMouseLeave
}) => {
  const handleMouseDown = (e) => {
    if (onClick) {
      onClick(e);
    }
    if (onMouseDown) {
      onMouseDown(e);
    }
  };

  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-all duration-200 ${
        paintMode ? 'pointer-events-none' : 'cursor-move'
      } ${isSelected ? 'z-30' : ''}`}
      style={{
        left: `${(character.x + 0.5) * (100/gridSize)}%`,
        top: `${(character.y + 0.5) * (100/gridSize)}%`,
        zIndex: isDragged ? 50 : (isSelected ? 30 : 10)
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      title={character.name}
    >
      {/* Selection Ring */}
      {isSelected && (
        <div 
          className="absolute inset-0 rounded-lg border-2 border-blue-400 animate-pulse"
          style={{
            width: '72px',
            height: '72px',
            left: '-4px',
            top: '-4px'
          }}
        />
      )}

      {character.sprite ? (
        <img
          src={character.sprite}
          alt={character.name}
          className={`w-16 h-16 rounded-lg border-2 object-contain shadow-lg transition-all duration-200 ${
            isSelected ? 'border-blue-400 shadow-blue-400/50' : ''
          }`}
          style={{ 
            borderColor: isSelected ? '#60a5fa' : (character.borderColor || '#ffffff')
          }}
        />
      ) : (
        <div
          className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center text-lg font-bold shadow-lg transition-all duration-200 ${
            isSelected ? 'border-blue-400 shadow-blue-400/50' : ''
          }`}
          style={{ 
            backgroundColor: character.color,
            color: 'white',
            borderColor: isSelected ? '#60a5fa' : (character.borderColor || '#ffffff')
          }}
        >
          {character.name.charAt(0)}
        </div>
      )}
      
      {/* Monster Indicator */}
      {character.isMonster && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full border border-white">
          M
        </div>
      )}

      {/* Low HP Indicator */}
      {(character.hp || character.maxHp) / character.maxHp <= 0.25 && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-red-500">
          ⚠️
        </div>
      )}

      {showNames && (
        <div 
          className={`absolute top-14 left-1/2 transform -translate-x-1/2 text-xs font-bold px-2 py-1 rounded shadow-lg border ${
            isSelected ? 'border-blue-400' : 'border-white'
          }`}
          style={{
            backgroundColor: character.color || '#6366f1',
            color: 'white',
            borderColor: isSelected ? '#60a5fa' : (character.borderColor || '#ffffff')
          }}
        >
          {character.name}
          {character.isMonster && (
            <div className="text-xs opacity-75">CR {character.cr}</div>
          )}
        </div>
      )}
      
      {isHovered && !isSelected && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-slate-800 border border-slate-600 rounded p-2 shadow-lg z-50 whitespace-nowrap">
          <div className="text-white text-xs font-bold mb-1">
            {character.name}
            {character.isMonster && (
              <span className="ml-1 text-red-300">(CR {character.cr})</span>
            )}
          </div>
          <div className="text-white text-xs mb-1">
            AC: {character.ac || (10 + getStatModifier(character.dex))} • 
            HP: {character.hp || character.maxHp || 20}/{character.maxHp || 20}
          </div>
          <div className="w-20 h-2 bg-slate-600 rounded overflow-hidden">
            <div 
              className="h-full transition-all duration-300"
              style={{ 
                width: `${((character.hp || character.maxHp || 20) / (character.maxHp || 20)) * 100}%`,
                backgroundColor: getHealthColor(character.hp || character.maxHp || 20, character.maxHp || 20)
              }}
            />
          </div>
          {character.isMonster && (
            <div className="text-yellow-300 text-xs mt-1">
              Click to select for actions
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CharacterToken;
