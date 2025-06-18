// src/components/BattleMap/BattleMap.jsx - Enhanced with full player access
import React, { useState } from 'react';
import { Sword, Plus, Eye } from 'lucide-react';
import CharacterToken from './CharacterToken';
import TerrainCell from './TerrainCell';
import GridOverlay from './GridOverlay';
import CharacterActions from '../Character/CharacterActions';

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
  onUpload,
  isDMMode = true
}) => {
  const [hoveredCharacter, setHoveredCharacter] = useState(null);
  const [draggedCharacter, setDraggedCharacter] = useState(null);

  const handleGridClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cellSize = Math.min(rect.width, rect.height) / gridSize;
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    
    if (paintMode && isDMMode && onTerrainChange) {
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
    // Allow everyone to move any character (removed DM restriction)
    if (paintMode || !onMoveCharacter) return;
    
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

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-2xl transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center">
          <Sword className="mr-3" size={24} />
          Battle Map
          {!isDMMode && (
            <span className="ml-3 text-sm bg-blue-500/20 text-blue-300 px-2 py-1 rounded flex items-center">
              <Eye size={14} className="mr-1" />
              Player View
            </span>
          )}
        </h2>
        
        {/* Character controls - Available to everyone */}
        {onAddCharacter && (
          <div className="flex gap-3 items-center">
            <button
              onClick={onAddCharacter}
              className="bg-green-500 hover:bg-green-600 border border-green-400 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 shadow-lg shadow-green-500/25 hover:scale-105"
            >
              <Plus size={16} className="inline mr-2" />
              Add Character
            </button>
          </div>
        )}
      </div>

      <div className="relative mb-6">
        <div 
          className={`battle-grid aspect-square w-full max-w-4xl mx-auto bg-slate-700 border-2 border-slate-600 rounded-lg relative transition-all duration-200 ${
            paintMode && isDMMode ? 'cursor-crosshair' : 'cursor-pointer'
          } shadow-inner hover:border-slate-500`}
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
              paintMode={paintMode && isDMMode}
              isDMMode={isDMMode}
              onMouseDown={(e) => handleCharacterDrag(character, e)} // Everyone can drag
              onClick={(e) => handleCharacterClick(character, e)}
              onMouseEnter={() => setHoveredCharacter(character)}
              onMouseLeave={() => setHoveredCharacter(null)}
            />
          ))}

          {showGrid && (
            <GridOverlay gridSize={gridSize} gridColor={gridColor} />
          )}
        </div>

        {/* Character Quick Actions - Available to everyone */}
        {onEditCharacter && onMakeCharacterSpeak && (
          <CharacterActions
            characters={characters}
            onEditCharacter={onEditCharacter}
            onMakeCharacterSpeak={onMakeCharacterSpeak}
          />
        )}
      </div>

      {/* Selection Info */}
      {selectedCharacter && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg transition-all duration-200">
          <div className="text-blue-300 text-sm font-medium mb-1 flex items-center justify-between">
            <span>
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
            </span>
            <span className="text-xs text-green-400">
              Full Control Available
            </span>
          </div>
          <div className="text-xs text-slate-400">
            AC {selectedCharacter.ac || 10} • 
            HP {selectedCharacter.hp !== undefined ? selectedCharacter.hp : selectedCharacter.maxHp}/{selectedCharacter.maxHp} • 
            Position ({selectedCharacter.x}, {selectedCharacter.y})
            {selectedCharacter.conditions && selectedCharacter.conditions.length > 0 && (
              <span className="ml-2">
                • Conditions: {selectedCharacter.conditions.map(c => c.name).join(', ')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Player Mode Notice - Updated */}
      {!isDMMode && (
        <div className="mt-4 p-3 bg-green-700/20 border border-green-600 rounded-lg">
          <div className="text-green-300 text-sm">
            <strong>Player Mode:</strong> You have full control over all characters. You can create, edit, move, 
            delete, and manage any character. Terrain editing is DM-only.
          </div>
        </div>
      )}
    </div>
  );
};

export default BattleMap;
