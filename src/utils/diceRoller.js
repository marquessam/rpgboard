// src/utils/diceRoller.js - Enhanced with D&D 5e features
export const rollDice = (notation, options = {}) => {
  try {
    const {
      advantage = false,
      disadvantage = false,
      critRange = 20,
      fumbleRange = 1
    } = options;

    // Parse dice notation (supports XdY+Z format)
    const match = notation.match(/(\d*)d(\d+)([+-]\d+)?/i);
    if (!match) return null;

    const numDice = parseInt(match[1]) || 1;
    const dieSize = parseInt(match[2]);
    const modifier = parseInt(match[3]) || 0;

    if (numDice > 100 || dieSize > 1000) return null;

    const rolls = [];
    let total = 0;
    let isCrit = false;
    let isFumble = false;
    
    // Handle advantage/disadvantage for d20 rolls
    if (dieSize === 20 && numDice === 1 && (advantage || disadvantage)) {
      const roll1 = Math.floor(Math.random() * dieSize) + 1;
      const roll2 = Math.floor(Math.random() * dieSize) + 1;
      
      const selectedRoll = advantage ? Math.max(roll1, roll2) : Math.min(roll1, roll2);
      rolls.push(selectedRoll);
      total = selectedRoll;
      
      isCrit = selectedRoll >= critRange;
      isFumble = selectedRoll <= fumbleRange;
      
      return {
        notation,
        rolls: [roll1, roll2],
        selectedRoll,
        modifier,
        total: total + modifier,
        advantage,
        disadvantage,
        isCrit,
        isFumble,
        detail: `[${roll1}, ${roll2}] ${advantage ? 'ADV' : 'DIS'} → ${selectedRoll}${modifier !== 0 ? ` ${modifier >= 0 ? '+' : ''}${modifier}` : ''} = ${total + modifier}`
      };
    }
    
    // Normal dice rolling
    for (let i = 0; i < numDice; i++) {
      const roll = Math.floor(Math.random() * dieSize) + 1;
      rolls.push(roll);
      total += roll;
      
      // Check for crits/fumbles on d20s
      if (dieSize === 20) {
        if (roll >= critRange) isCrit = true;
        if (roll <= fumbleRange) isFumble = true;
      }
    }
    
    total += modifier;

    return {
      notation,
      rolls,
      modifier,
      total,
      isCrit,
      isFumble,
      detail: `${rolls.join(' + ')}${modifier !== 0 ? ` ${modifier >= 0 ? '+' : ''}${modifier}` : ''} = ${total}`
    };
  } catch (e) {
    return null;
  }
};

// Roll ability check with modifiers
export const rollAbilityCheck = (abilityMod, proficient = false, proficiencyBonus = 2, options = {}) => {
  const totalMod = abilityMod + (proficient ? proficiencyBonus : 0);
  const result = rollDice('1d20', options);
  
  if (!result) return null;
  
  return {
    ...result,
    abilityMod,
    proficiencyBonus: proficient ? proficiencyBonus : 0,
    totalModifier: totalMod,
    total: result.rolls[0] + totalMod,
    detail: `${result.detail.split('=')[0].trim()} + ${totalMod} = ${result.rolls[0] + totalMod}`
  };
};

// Roll saving throw
export const rollSavingThrow = (abilityMod, proficient = false, proficiencyBonus = 2, dc = 15, options = {}) => {
  const result = rollAbilityCheck(abilityMod, proficient, proficiencyBonus, options);
  
  if (!result) return null;
  
  const success = result.total >= dc;
  
  return {
    ...result,
    dc,
    success,
    type: 'saving_throw'
  };
};

// Roll attack with to-hit bonus
export const rollAttack = (attackBonus, options = {}) => {
  const result = rollDice('1d20', options);
  
  if (!result) return null;
  
  return {
    ...result,
    attackBonus,
    total: result.rolls[0] + attackBonus,
    detail: `${result.detail.split('=')[0].trim()} + ${attackBonus} = ${result.rolls[0] + attackBonus}`,
    type: 'attack'
  };
};

// Roll damage with potential critical hit
export const rollDamage = (damageRoll, isCrit = false) => {
  const baseResult = rollDice(damageRoll);
  
  if (!baseResult || !isCrit) return baseResult;
  
  // For critical hits, roll damage dice twice
  const critResult = rollDice(damageRoll);
  
  if (!critResult) return baseResult;
  
  return {
    ...baseResult,
    critRolls: critResult.rolls,
    total: baseResult.total + critResult.total - baseResult.modifier, // Don't double the modifier
    isCrit: true,
    detail: `${baseResult.detail} + ${critResult.rolls.join(' + ')} (CRIT) = ${baseResult.total + critResult.total - baseResult.modifier}`
  };
};

// Roll initiative
export const rollInitiative = (dexMod, options = {}) => {
  const result = rollDice('1d20', options);
  
  if (!result) return null;
  
  return {
    ...result,
    dexMod,
    total: result.rolls[0] + dexMod,
    detail: `${result.detail.split('=')[0].trim()} + ${dexMod} = ${result.rolls[0] + dexMod}`,
    type: 'initiative'
  };
};

// Parse complex dice expressions like "2d6+1d4+3"
export const parseComplexDice = (expression) => {
  try {
    // Remove spaces
    expression = expression.replace(/\s/g, '');
    
    // Split by + and - while keeping the operators
    const parts = expression.split(/([+-])/).filter(part => part !== '');
    
    let total = 0;
    let allRolls = [];
    let details = [];
    let currentSign = 1;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (part === '+') {
        currentSign = 1;
        continue;
      } else if (part === '-') {
        currentSign = -1;
        continue;
      }
      
      // Check if it's a dice expression or a flat number
      if (part.includes('d')) {
        const result = rollDice(part);
        if (result) {
          total += result.total * currentSign;
          allRolls.push(...result.rolls.map(r => r * currentSign));
          details.push(`${currentSign === -1 ? '-' : ''}${result.detail}`);
        }
      } else {
        const num = parseInt(part);
        if (!isNaN(num)) {
          total += num * currentSign;
          details.push(`${currentSign === -1 ? '-' : ''}${num}`);
        }
      }
      
      currentSign = 1; // Reset for next iteration
    }
    
    return {
      expression,
      total,
      allRolls,
      detail: details.join(' ') + ` = ${total}`
    };
  } catch (e) {
    return null;
  }
};

// Quick roll functions for common D&D scenarios
export const quickRolls = {
  d4: () => rollDice('1d4'),
  d6: () => rollDice('1d6'),
  d8: () => rollDice('1d8'),
  d10: () => rollDice('1d10'),
  d12: () => rollDice('1d12'),
  d20: () => rollDice('1d20'),
  d100: () => rollDice('1d100'),
  
  advantage: () => rollDice('1d20', { advantage: true }),
  disadvantage: () => rollDice('1d20', { disadvantage: true }),
  
  deathSave: () => {
    const result = rollDice('1d20');
    if (result) {
      result.deathSave = {
        success: result.total >= 10,
        critSuccess: result.total === 20,
        critFailure: result.total === 1
      };
    }
    return result;
  }
};

// Determine success level for various DCs
export const getSuccessLevel = (total, dc) => {
  const difference = total - dc;
  
  if (difference >= 10) return 'critical_success';
  if (difference >= 5) return 'great_success';
  if (difference >= 0) return 'success';
  if (difference >= -5) return 'failure';
  return 'critical_failure';
};

// Common DCs for quick reference
export const commonDCs = {
  trivial: 5,
  easy: 10,
  medium: 15,
  hard: 20,
  veryHard: 25,
  nearlyImpossible: 30
};
