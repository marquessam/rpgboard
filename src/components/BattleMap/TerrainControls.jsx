
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
