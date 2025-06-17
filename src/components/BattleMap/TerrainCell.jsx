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
