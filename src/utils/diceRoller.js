
// src/utils/diceRoller.js
export const rollDice = (notation) => {
  try {
    const match = notation.match(/(\d*)d(\d+)([+-]\d+)?/i);
    if (!match) return null;

    const numDice = parseInt(match[1]) || 1;
    const dieSize = parseInt(match[2]);
    const modifier = parseInt(match[3]) || 0;

    if (numDice > 20 || dieSize > 100) return null;

    const rolls = [];
    let total = 0;
    
    for (let i = 0; i < numDice; i++) {
      const roll = Math.floor(Math.random() * dieSize) + 1;
      rolls.push(roll);
      total += roll;
    }
    
    total += modifier;

    return {
      notation, 
      rolls, 
      modifier, 
      total,
      detail: `${rolls.join(' + ')}${modifier !== 0 ? ` ${modifier >= 0 ? '+' : ''}${modifier}` : ''} = ${total}`
    };
  } catch (e) {
    return null;
  }
};
