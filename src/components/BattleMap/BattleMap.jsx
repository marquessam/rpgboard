// src/components/BattleMap/BattleMap.jsx - Updated with character selection
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
  onSelectCharacter,
  selectedCharacter,
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
    } else {
      // Check if clicking on a character
      const clickedCharacter = characters.find(char => char.x === x && char.y === y);
      if (clickedCharacter) {
        onSelectCharacter(clickedCharacter);
      } else {
        // Clear selection if clicking empty space
        onSelectCharacter(null);
      }
    }
  };

  const handleCharacterDrag = (character, e) => {
    if (paintMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
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

  const handleCharacterClick = (character, e) => {
    e.stopPropagation();
    onSelectCharacter(character);
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
              isSelected={selectedCharacter?.id === character.id}
              showNames={showNames}
              paintMode={paintMode}
              onMouseDown={(e) => handleCharacterDrag(character, e)}
              onClick={(e) => handleCharacterClick(character, e)}
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

      {/* Selection Info */}
      {selectedCharacter && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="text-blue-300 text-sm font-medium mb-1">
            Selected: {selectedCharacter.name}
            {selectedCharacter.isMonster && (
              <span className="ml-2 text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                Monster
              </span>
            )}
            {(selectedCharacter.hp !== undefined ? selectedCharacter.hp : selectedCharacter.maxHp) <= 0 && (
              <span className="ml-2 text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                💀 DEFEATED
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400">
            AC {selectedCharacter.ac || 10} • 
            HP {selectedCharacter.hp !== undefined ? selectedCharacter.hp : selectedCharacter.maxHp}/{selectedCharacter.maxHp} • 
            Position ({selectedCharacter.x}, {selectedCharacter.y})
          </div>
        </div>
      )}
    </div>
  );
};

export default BattleMap;
