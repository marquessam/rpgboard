
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
