// src/components/BattleMap/CharacterToken.jsx - Enhanced with full player access
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
  isDMMode = true,
  onMouseDown,
  onClick,
  onMouseEnter,
  onMouseLeave
}) => {
  const handleMouseDown = (e) => {
    const currentHp = character.hp !== undefined ? character.hp : character.maxHp;
    const isDead = currentHp <= 0;
    
    // Everyone can interact with living characters
    // Anyone can loot dead monsters
    const canInteract = !isDead || (isDead && character.isMonster && !character.looted);
    
    if (canInteract && onClick) {
      onClick(e);
    }
    // Everyone can drag living characters (removed isDMMode restriction)
    if (onMouseDown && !isDead) {
      onMouseDown(e);
    }
  };

  // Calculate token size based on grid size
  const tokenSize = Math.max(24, Math.min(64, (800 / gridSize) * 0.8));
  const currentHp = character.hp !== undefined ? character.hp : character.maxHp;
  const isDead = currentHp <= 0;
  const canInteract = !isDead || (isDead && character.isMonster && !character.looted);

  // Determine cursor style - everyone gets full interaction
  const getCursorStyle = () => {
    if (paintMode) return 'pointer-events-none';
    if (!canInteract) return 'cursor-default';
    if (!isDead) return 'cursor-move';
    return 'cursor-pointer';
  };

  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
        getCursorStyle()
      } ${isSelected ? 'z-30' : ''} ${
        !isDead && canInteract ? 'hover:scale-110' : ''
      } ${isDead ? 'opacity-75' : ''}`}
      style={{
        left: `${(character.x + 0.5) * (100/gridSize)}%`,
        top: `${(character.y + 0.5) * (100/gridSize)}%`,
        zIndex: isDragged ? 50 : (isSelected ? 30 : 10)
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      title={`${character.name}${isDead ? ' (Dead)' : ''} - Click to select and control`}
    >
      {/* Selection Ring */}
      {isSelected && !isDead && (
        <div 
          className="absolute inset-0 rounded-lg border-2 border-blue-400 animate-pulse"
          style={{
            width: `${tokenSize + 8}px`,
            height: `${tokenSize + 8}px`,
            left: '-4px',
            top: '-4px'
          }}
        />
      )}

      {/* Death Overlay */}
      {isDead && (
        <div 
          className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center border-2 border-red-500"
          style={{
            width: `${tokenSize}px`,
            height: `${tokenSize}px`
          }}
        >
          <span className="text-red-500 font-bold" style={{ fontSize: `${Math.max(12, tokenSize * 0.3)}px` }}>
            {character.looted ? '💰' : '💀'}
          </span>
        </div>
      )}

      {/* Character Image/Token */}
      {character.sprite ? (
        <img
          src={character.sprite}
          alt={character.name}
          className={`rounded-lg border-2 object-contain shadow-lg transition-all duration-200 ${
            isSelected ? 'border-blue-400 shadow-blue-400/50' : ''
          } ${isDead ? 'grayscale' : ''}`}
          style={{ 
            width: `${tokenSize}px`,
            height: `${tokenSize}px`,
            borderColor: isSelected ? '#60a5fa' : (character.borderColor || '#ffffff')
          }}
        />
      ) : (
        <div
          className={`rounded-lg border-2 flex items-center justify-center font-bold shadow-lg transition-all duration-200 ${
            isSelected ? 'border-blue-400 shadow-blue-400/50' : ''
          } ${isDead ? 'grayscale' : ''}`}
          style={{ 
            width: `${tokenSize}px`,
            height: `${tokenSize}px`,
            fontSize: `${Math.max(12, tokenSize * 0.3)}px`,
            backgroundColor: character.color,
            color: 'white',
            borderColor: isSelected ? '#60a5fa' : (character.borderColor || '#ffffff')
          }}
        >
          {isDead ? '💀' : character.name.charAt(0)}
        </div>
      )}
      
      {/* Monster Indicator */}
      {character.isMonster && !isDead && (
        <div 
          className="absolute bg-red-500 text-white text-xs px-1 rounded-full border border-white"
          style={{
            top: `${-tokenSize * 0.1}px`,
            right: `${-tokenSize * 0.1}px`,
            fontSize: `${Math.max(8, tokenSize * 0.2)}px`
          }}
        >
          M
        </div>
      )}

      {/* Control Indicator - Shows for all players */}
      {!character.isMonster && (
        <div 
          className="absolute bg-blue-500 text-white text-xs px-1 rounded-full border border-white"
          style={{
            top: `${-tokenSize * 0.1}px`,
            left: `${-tokenSize * 0.1}px`,
            fontSize: `${Math.max(8, tokenSize * 0.2)}px`
          }}
        >
          {isDMMode ? 'D' : 'P'}
        </div>
      )}

      {/* Low HP Indicator */}
      {!isDead && currentHp / character.maxHp <= 0.25 && (
        <div 
          className="absolute left-1/2 transform -translate-x-1/2 text-red-500"
          style={{
            top: `${-tokenSize * 0.2}px`,
            fontSize: `${Math.max(12, tokenSize * 0.3)}px`
          }}
        >
          ⚠️
        </div>
      )}

      {/* Conditions Indicator */}
      {character.conditions && character.conditions.length > 0 && !isDead && (
        <div 
          className="absolute right-0 transform translate-x-1/2 text-yellow-500"
          style={{
            top: `${-tokenSize * 0.2}px`,
            fontSize: `${Math.max(10, tokenSize * 0.25)}px`
          }}
        >
          ✨
        </div>
      )}

      {/* Names */}
      {showNames && (
        <div 
          className={`absolute left-1/2 transform -translate-x-1/2 font-bold px-2 py-1 rounded shadow-lg border whitespace-nowrap transition-all duration-200 ${
            isSelected ? 'border-blue-400' : 'border-white'
          } ${isDead ? 'bg-red-800 text-red-200' : ''}`}
          style={{
            top: `${tokenSize + 4}px`,
            fontSize: `${Math.max(10, tokenSize * 0.2)}px`,
            backgroundColor: isDead ? '#7f1d1d' : (character.color || '#6366f1'),
            color: isDead ? '#fecaca' : 'white',
            borderColor: isSelected ? '#60a5fa' : (character.borderColor || '#ffffff')
          }}
        >
          {character.name} {isDead && character.looted ? '💰' : isDead ? '💀' : ''}
          {character.isMonster && !isDead && (
            <div style={{ fontSize: `${Math.max(8, tokenSize * 0.15)}px` }} className="opacity-75">
              CR {character.cr}
            </div>
          )}
          {isDead && character.looted && (
            <div style={{ fontSize: `${Math.max(8, tokenSize * 0.15)}px` }} className="opacity-75">
              (Looted)
            </div>
          )}
        </div>
      )}
      
      {/* Hover Info */}
      {isHovered && !isSelected && (
        <div 
          className="absolute left-1/2 transform -translate-x-1/2 bg-slate-800 border border-slate-600 rounded p-2 shadow-lg z-50 whitespace-nowrap"
          style={{
            top: `${-tokenSize - 80}px`
          }}
        >
          <div className="text-white text-xs font-bold mb-1">
            {character.name}
            {character.isMonster && (
              <span className="ml-1 text-red-300">(CR {character.cr})</span>
            )}
            {isDead && <span className="ml-1 text-red-400">(DEAD)</span>}
          </div>
          <div className="text-white text-xs mb-1">
            AC: {character.ac || (10 + getStatModifier(character.dex))} • 
            HP: {currentHp}/{character.maxHp}
          </div>
          <div className="w-20 h-2 bg-slate-600 rounded overflow-hidden">
            <div 
              className="h-full transition-all duration-300"
              style={{ 
                width: `${(currentHp / character.maxHp) * 100}%`,
                backgroundColor: isDead ? '#ef4444' : getHealthColor(currentHp, character.maxHp)
              }}
            />
          </div>
          
          {/* Interaction hints - Updated for full access */}
          {!isDead && (
            <div className="text-blue-300 text-xs mt-1">
              Click to select • Drag to move • Full control available
            </div>
          )}
          {isDead && character.isMonster && !character.looted && (
            <div className="text-yellow-300 text-xs mt-1">
              Click to search for loot
            </div>
          )}
          {isDead && character.isMonster && character.looted && (
            <div className="text-slate-400 text-xs mt-1">
              Already looted
            </div>
          )}
          {isDead && !character.isMonster && (
            <div className="text-red-300 text-xs mt-1">
              This character has been defeated
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CharacterToken;
