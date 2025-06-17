// src/components/UI/Header.jsx
import React from 'react';
import { Image, Paintbrush, LayoutGrid, Users } from 'lucide-react';

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
            <LayoutGrid size={16} className="inline mr-2" />
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
