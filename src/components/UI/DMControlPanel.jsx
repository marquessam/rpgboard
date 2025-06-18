// src/components/UI/DMControlPanel.jsx - Collapsible panel for DM controls
import React from 'react';
import { ChevronDown, ChevronUp, Plus, RotateCcw, Upload, Settings } from 'lucide-react';
import TerrainControls from '../BattleMap/TerrainControls';

const DMControlPanel = ({
  isCollapsed,
  onToggleCollapse,
  gridSize,
  onGridSizeChange,
  onAddCharacter,
  paintMode,
  selectedTerrain,
  onSelectedTerrainChange,
  customTerrainSprites,
  onClearTerrain,
  onUpload
}) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out">
      
      {/* Header */}
      <button
        onClick={onToggleCollapse}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <Settings size={20} className="text-red-400" />
          <h3 className="text-lg font-bold text-slate-100">DM Controls</h3>
          <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
            DM Only
          </span>
        </div>
        {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
      </button>

      {/* Collapsible Content */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isCollapsed ? 'max-h-0' : 'max-h-96'
      }`}>
        <div className="p-4 pt-0 space-y-4">
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-2 text-sm">Grid Size</label>
              <select
                value={gridSize}
                onChange={(e) => onGridSizeChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value={10}>10x10</option>
                <option value={15}>15x15</option>
                <option value={20}>20x20</option>
                <option value={25}>25x25</option>
                <option value={30}>30x30</option>
              </select>
            </div>
            
            <div>
              <label className="block text-slate-300 font-medium mb-2 text-sm">Characters</label>
              <button
                onClick={onAddCharacter}
                className="w-full bg-green-500 hover:bg-green-600 border border-green-400 px-3 py-2 rounded-lg font-medium text-white transition-all duration-200 shadow-lg shadow-green-500/25 hover:scale-105"
              >
                <Plus size={16} className="inline mr-1" />
                Add Character
              </button>
            </div>
            
            <div>
              <label className="block text-slate-300 font-medium mb-2 text-sm">Terrain</label>
              <button
                onClick={onClearTerrain}
                className="w-full bg-red-500 hover:bg-red-600 border border-red-400 px-3 py-2 rounded-lg font-medium text-white transition-all duration-200 shadow-lg shadow-red-500/25 hover:scale-105"
              >
                <RotateCcw size={16} className="inline mr-1" />
                Clear Terrain
              </button>
            </div>
          </div>

          {/* Terrain Controls (only when in paint mode) */}
          {paintMode && (
            <div className="border-t border-slate-600 pt-4">
              <TerrainControls
                selectedTerrain={selectedTerrain}
                onSelectedTerrainChange={onSelectedTerrainChange}
                customTerrainSprites={customTerrainSprites}
                onClearTerrain={onClearTerrain}
                onUpload={onUpload}
              />
            </div>
          )}
          
          {/* Tips */}
          <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-3">
            <h4 className="text-sm font-medium text-slate-200 mb-2">💡 Quick Tips</h4>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Click characters to select for actions</li>
              <li>• Use paint mode to add terrain</li>
              <li>• Dead monsters can be looted</li>
              <li>• Toggle player mode to see player view</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DMControlPanel;
