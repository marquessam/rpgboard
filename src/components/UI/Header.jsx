// src/components/UI/Header.jsx - Enhanced with grid size control and better organization
import React from 'react';
import { Image, Paintbrush, LayoutGrid, Users, Settings, Eye, EyeOff, Grid3X3 } from 'lucide-react';

const Header = ({
  isDMMode,
  onToggleDMMode,
  onShowScene,
  paintMode,
  onTogglePaint,
  showGrid,
  onToggleGrid,
  gridColor,
  onGridColorChange,
  showNames,
  onToggleNames,
  isDatabaseConnected,
  isDatabaseLoading,
  gridSize,
  onGridSizeChange
}) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 mb-4 shadow-2xl">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        
        {/* Title and Mode Toggle */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            ⚔️ RPG Battle Tool
          </h1>
          
          {/* Database Status */}
          {isDatabaseLoading && (
            <div className="flex items-center gap-2 text-blue-300 text-sm">
              <div className="animate-spin w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full"></div>
              Connecting...
            </div>
          )}
          {!isDatabaseLoading && isDatabaseConnected && (
            <div className="flex items-center gap-2 text-green-300 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Cloud Connected
            </div>
          )}
          
          {/* DM/Player Mode Toggle */}
          <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-1 border border-slate-600">
            <button
              onClick={onToggleDMMode}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isDMMode
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-600'
              }`}
            >
              <Settings size={16} />
              DM Mode
            </button>
            <button
              onClick={onToggleDMMode}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                !isDMMode
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-600'
              }`}
            >
              <Users size={16} />
              Player
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          
          {/* Grid Size Control - Always visible */}
          <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-1 border border-slate-600">
            <Grid3X3 size={16} className="text-slate-400 ml-2" />
            <select
              value={gridSize}
              onChange={(e) => onGridSizeChange(parseInt(e.target.value))}
              className="bg-transparent border-none text-white text-sm font-medium focus:outline-none focus:ring-0 pr-2"
            >
              <option value={10} className="bg-slate-700">10×10</option>
              <option value={15} className="bg-slate-700">15×15</option>
              <option value={20} className="bg-slate-700">20×20</option>
              <option value={25} className="bg-slate-700">25×25</option>
              <option value={30} className="bg-slate-700">30×30</option>
            </select>
          </div>
          
          {/* DM-only controls */}
          {isDMMode && (
            <>
              <button
                onClick={onShowScene}
                className="bg-purple-500 hover:bg-purple-600 border border-purple-400 px-4 py-2 rounded-lg transition-all duration-200 font-medium text-white shadow-lg shadow-purple-500/25 hover:scale-105"
              >
                <Image size={16} className="inline mr-2" />
                Show Scene
              </button>
              
              <button
                onClick={onTogglePaint}
                className={`px-4 py-2 rounded-lg border transition-all duration-200 font-medium hover:scale-105 ${
                  paintMode 
                    ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/25' 
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500'
                }`}
              >
                <Paintbrush size={16} className="inline mr-2" />
                {paintMode ? 'Exit Paint' : 'Paint Terrain'}
              </button>
            </>
          )}
          
          {/* Shared view controls */}
          <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-1 border border-slate-600">
            <button
              onClick={onToggleGrid}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 ${
                showGrid 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-600'
              }`}
            >
              <LayoutGrid size={16} />
              Grid
            </button>
            
            {showGrid && (
              <select
                value={gridColor}
                onChange={(e) => onGridColorChange(e.target.value)}
                className="px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="white">White</option>
                <option value="grey">Grey</option>
                <option value="black">Black</option>
              </select>
            )}
          </div>
          
          <button
            onClick={onToggleNames}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 font-medium hover:scale-105 ${
              showNames 
                ? 'bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/25' 
                : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500'
            }`}
          >
            {showNames ? <Eye size={16} /> : <EyeOff size={16} />}
            <span className="hidden sm:inline">Names</span>
          </button>
        </div>
      </div>
      
      {/* Mode indicator */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isDMMode ? 'bg-red-500' : 'bg-blue-500'}`}></div>
          <span className="text-xs text-slate-400">
            {isDMMode ? 'Dungeon Master Mode - All controls available' : 'Player Mode - Full access to character management'}
          </span>
        </div>
        
        {/* Grid Size indicator */}
        <div className="text-xs text-slate-400">
          Grid: {gridSize}×{gridSize} • {showGrid ? `${gridColor} grid` : 'No grid'} • {showNames ? 'Names visible' : 'Names hidden'}
        </div>
      </div>
    </div>
  );
};

export default Header;
