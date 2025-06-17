// src/utils/helpers.js
export const getStatModifier = (stat) => {
  return Math.floor((stat - 10) / 2);
};

export const getHealthColor = (current, max) => {
  const ratio = current / max;
  if (ratio > 0.5) return '#10b981'; // Green
  if (ratio > 0.25) return '#f59e0b'; // Orange
  return '#ef4444'; // Red
};

export const getCellKey = (x, y) => `${x}-${y}`;

export const parseCellKey = (cellKey) => {
  const [x, y] = cellKey.split('-').map(Number);
  return { x, y };
};
