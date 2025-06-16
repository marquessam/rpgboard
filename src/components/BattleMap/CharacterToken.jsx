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

// src/components/BattleMap/TerrainCell.jsx
import React from 'react';
import { terrainTypes } from '../../utils/constants';
import { parseCellKey } from '../../utils/helpers';

const TerrainCell = ({ cellKey, terrainType, gridSize, customSprite }) => {
  const { x, y } = parseCellKey(cellKey);
  
  return (
    <div
      className="absolute"
      style={{
        left: `${x * (100/gridSize)}%`,
        top: `${y * (100/gridSize)}%`,
        width: `${100/gridSize}%`,
        height: `${100/gridSize}%`,
        backgroundColor: customSprite ? 'transparent' : (terrainTypes[terrainType]?.color || '#4ade80'),
        opacity: customSprite ? 1 : 0.6
      }}
    >
      {customSprite && (
        <img 
          src={customSprite} 
          alt={terrainType}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

export default TerrainCell;

// src/components/BattleMap/GridOverlay.jsx
import React from 'react';
import { gridColors } from '../../utils/constants';

const GridOverlay = ({ gridSize, gridColor }) => {
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(to right, ${gridColors[gridColor].color} 1px, transparent 1px),
          linear-gradient(to bottom, ${gridColors[gridColor].color} 1px, transparent 1px)
        `,
        backgroundSize: `${100/gridSize}% ${100/gridSize}%`,
        zIndex: 100
      }}
    />
  );
};

export default GridOverlay;

// src/components/BattleMap/TerrainControls.jsx
import React from 'react';
import { RotateCcw, Upload } from 'lucide-react';
import { terrainTypes } from '../../utils/constants';

const TerrainControls = ({
  selectedTerrain,
  onSelectedTerrainChange,
  customTerrainSprites,
  onClearTerrain,
  onUpload
}) => {
  return (
    <div className="mb-6 p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-slate-100 font-medium">Terrain Tools:</span>
        <button
          onClick={onClearTerrain}
          className="bg-red-500 hover:bg-red-600 border border-red-400 px-3 py-1 rounded font-medium text-white transition-all duration-200"
        >
          <RotateCcw size={14} className="inline mr-1" />
          Clear All
        </button>
        <button
          onClick={() => onUpload('terrain')}
          className="bg-blue-500 hover:bg-blue-600 border border-blue-400 px-3 py-1 rounded font-medium text-white transition-all duration-200"
        >
          <Upload size={14} className="inline mr-1" />
          Upload Sprite for {terrainTypes[selectedTerrain]?.name}
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(terrainTypes).map(([key, terrain]) => (
          <button
            key={key}
            onClick={() => onSelectedTerrainChange(key)}
            className={`p-3 rounded-lg border transition-all duration-200 font-medium ${
              selectedTerrain === key 
                ? 'border-blue-400 bg-blue-500/20 text-white' 
                : 'border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <div className="text-lg mb-1">
              {customTerrainSprites[key] ? (
                <img src={customTerrainSprites[key]} alt={terrain.name} className="w-6 h-6 mx-auto object-cover rounded" />
              ) : (
                terrain.icon
              )}
            </div>
            <div className="text-xs">{terrain.name}</div>
            {customTerrainSprites[key] && (
              <div className="text-xs text-green-400">Custom</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TerrainControls;
