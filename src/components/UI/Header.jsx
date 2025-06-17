// src/components/UI/Header.jsx
import React from 'react';
import { Image, Paintbrush, Grid3X3, Users } from 'lucide-react';

const Header = ({
  onShowScene,
  paintMode,
  onTogglePaint,
  showGrid,
  onToggleGrid,
  gridColor,
  onGridColorChange,
  showNames,
  onToggleNames
}) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 mb-6 shadow-2xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          ⚔️ RPG Battle Tool
        </h1>
        <div className="flex gap-3">
          <button
            onClick={onShowScene}
            className="bg-purple-500 hover:bg-purple-600 border border-purple-400 px-4 py-2 rounded-lg transition-all duration-200 font-medium text-white shadow-lg shadow-purple-500/25"
          >
            <Image size={16} className="inline mr-2" />
            Show Scene
          </button>
          <button
            onClick={onTogglePaint}
            className={`px-4 py-2 rounded-lg border transition-all duration-200 font-medium ${
              paintMode 
                ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/25' 
                : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500'
            }`}
          >
            <Paintbrush size={16} className="inline mr-2" />
            {paintMode ? 'Exit Paint' : 'Paint Terrain'}
          </button>
          <button
            onClick={onToggleGrid}
            className={`px-4 py-2 rounded-lg border transition-all duration-200 font-medium ${
              showGrid 
                ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/25' 
                : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500'
            }`}
          >
            <Grid3X3 size={16} className="inline mr-2" />
            Grid
          </button>
          <select
            value={gridColor}
            onChange={(e) => onGridColorChange(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            disabled={!showGrid}
          >
            <option value="white">White Grid</option>
            <option value="grey">Grey Grid</option>
            <option value="black">Black Grid</option>
          </select>
          <button
            onClick={onToggleNames}
            className={`px-4 py-2 rounded-lg border transition-all duration-200 font-medium ${
              showNames 
                ? 'bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/25' 
                : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500'
            }`}
          >
            <Users size={16} className="inline mr-2" />
            Names
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;

// src/components/BattleMap/BattleMap.jsx
import React, { useState } from 'react';
import { Sword, Plus, RotateCcw, Upload } from 'lucide-react';
import CharacterToken from './CharacterToken';
import TerrainCell from './TerrainCell';
import GridOverlay from './GridOverlay';
import TerrainControls from './TerrainControls';
import CharacterActions from '../Character/CharacterActions';
import { terrainTypes } from '../../utils/constants';

const BattleMap = ({
  gridSize,
  onGridSizeChange,
  characters,
  onAddCharacter,
  onEditCharacter,
  onMakeCharacterSpeak,
  onMoveCharacter,
  terrain,
  onTerrainChange,
  customTerrainSprites,
  paintMode,
  selectedTerrain,
  onSelectedTerrainChange,
  showGrid,
  gridColor,
  showNames,
  onUpload
}) => {
  const [hoveredCharacter, setHoveredCharacter] = useState(null);
  const [draggedCharacter, setDraggedCharacter] = useState(null);

  const handleGridClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cellSize = Math.min(rect.width, rect.height) / gridSize;
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    
    if (paintMode) {
      const cellKey = `${x}-${y}`;
      onTerrainChange(prev => ({
        ...prev,
        [cellKey]: selectedTerrain
      }));
    }
  };

  const handleCharacterDrag = (character, e) => {
    if (paintMode) return;
    
    e.preventDefault();
    const rect = e.currentTarget.closest('.battle-grid').getBoundingClientRect();
    const cellSize = Math.min(rect.width, rect.height) / gridSize;

    const handleMouseMove = (moveEvent) => {
      const x = Math.floor((moveEvent.clientX - rect.left) / cellSize);
      const y = Math.floor((moveEvent.clientY - rect.top) / cellSize);
      
      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        onMoveCharacter(character.id, x, y);
      }
    };

    const handleMouseUp = () => {
      setDraggedCharacter(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    setDraggedCharacter(character.id);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const clearTerrain = () => {
    onTerrainChange({});
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-100">
          <Sword className="inline mr-3" size={24} />
          Battle Map
        </h2>
        <div className="flex gap-3 items-center">
          <label className="text-slate-300 font-medium">Grid Size:</label>
          <select
            value={gridSize}
            onChange={(e) => onGridSizeChange(parseInt(e.target.value))}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            <option value={10}>10x10</option>
            <option value={15}>15x15</option>
            <option value={20}>20x20</option>
            <option value={25}>25x25</option>
            <option value={30}>30x30</option>
          </select>
          <button
            onClick={onAddCharacter}
            className="bg-green-500 hover:bg-green-600 border border-green-400 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 shadow-lg shadow-green-500/25"
          >
            <Plus size={16} className="inline mr-2" />
            Add Character
          </button>
        </div>
      </div>

      {paintMode && (
        <TerrainControls
          selectedTerrain={selectedTerrain}
          onSelectedTerrainChange={onSelectedTerrainChange}
          customTerrainSprites={customTerrainSprites}
          onClearTerrain={clearTerrain}
          onUpload={onUpload}
        />
      )}

      <div className="relative mb-6">
        <div 
          className={`battle-grid aspect-square w-full max-w-4xl mx-auto bg-slate-700 border-2 border-slate-600 rounded-lg relative ${
            paintMode ? 'cursor-crosshair' : 'cursor-pointer'
          } shadow-inner`}
          onClick={handleGridClick}
        >
          {/* Terrain */}
          {Object.entries(terrain).map(([cellKey, terrainType]) => (
            <TerrainCell
              key={cellKey}
              cellKey={cellKey}
              terrainType={terrainType}
              gridSize={gridSize}
              customSprite={customTerrainSprites[terrainType]}
            />
          ))}

          {/* Characters */}
          {characters.map(character => (
            <CharacterToken
              key={character.id}
              character={character}
              gridSize={gridSize}
              isDragged={draggedCharacter === character.id}
              isHovered={hoveredCharacter?.id === character.id}
              showNames={showNames}
              paintMode={paintMode}
              onMouseDown={(e) => handleCharacterDrag(character, e)}
              onMouseEnter={() => setHoveredCharacter(character)}
              onMouseLeave={() => setHoveredCharacter(null)}
            />
          ))}

          {showGrid && (
            <GridOverlay gridSize={gridSize} gridColor={gridColor} />
          )}
        </div>

        <CharacterActions
          characters={characters}
          onEditCharacter={onEditCharacter}
          onMakeCharacterSpeak={onMakeCharacterSpeak}
        />
      </div>
    </div>
  );
};

export default BattleMap;
