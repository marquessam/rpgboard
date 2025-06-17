// src/hooks/useCharacters.js - Updated with D&D 5e support
import { useLocalStorage } from './useLocalStorage';
import { newCharacterTemplate, colors } from '../utils/constants';
import { getStatModifier } from '../utils/helpers';

export const useCharacters = () => {
  const [characters, setCharacters] = useLocalStorage('characters', []);

  const addCharacter = () => {
    const newChar = { 
      ...newCharacterTemplate, 
      id: Date.now(),
      color: colors[characters.length % colors.length],
      // D&D 5e specific defaults
      ac: 10 + getStatModifier(newCharacterTemplate.dex),
      proficiencyBonus: 2,
      speed: 30,
      conditions: [],
      actions: []
    };
    setCharacters(prev => [...prev, newChar]);
    return newChar;
  };

  const updateCharacter = (updatedChar) => {
    // Ensure D&D properties are set
    const charWithDefaults = {
      ...updatedChar,
      ac: updatedChar.ac || (10 + getStatModifier(updatedChar.dex)),
      proficiencyBonus: updatedChar.proficiencyBonus || 2,
      speed: updatedChar.speed || 30,
      conditions: updatedChar.conditions || [],
      actions: updatedChar.actions || []
    };
    
    setCharacters(prev => prev.map(char => 
      char.id === updatedChar.id ? charWithDefaults : char
    ));
  };

  const deleteCharacter = (id) => {
    setCharacters(prev => prev.filter(char => char.id !== id));
  };

  const moveCharacter = (id, x, y) => {
    setCharacters(prev => prev.map(char => 
      char.id === id ? { ...char, x, y } : char
    ));
  };

  const addCondition = (characterId, condition) => {
    setCharacters(prev => prev.map(char => 
      char.id === characterId 
        ? { 
            ...char, 
            conditions: [...(char.conditions || []), condition]
          }
        : char
    ));
  };

  const removeCondition = (characterId, conditionIndex) => {
    setCharacters(prev => prev.map(char => 
      char.id === characterId 
        ? { 
            ...char, 
            conditions: (char.conditions || []).filter((_, index) => index !== conditionIndex)
          }
        : char
    ));
  };

  const healCharacter = (characterId, amount) => {
    setCharacters(prev => prev.map(char => {
      if (char.id === characterId) {
        const newHp = Math.min((char.hp || char.maxHp) + amount, char.maxHp);
        return { ...char, hp: newHp };
      }
      return char;
    }));
  };

  const damageCharacter = (characterId, amount) => {
    setCharacters(prev => prev.map(char => {
      if (char.id === characterId) {
        const newHp = Math.max((char.hp || char.maxHp) - amount, 0);
        return { ...char, hp: newHp };
      }
      return char;
    }));
  };

  return {
    characters,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    moveCharacter,
    addCondition,
    removeCondition,
    healCharacter,
    damageCharacter
  };
};
