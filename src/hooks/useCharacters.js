// src/hooks/useCharacters.js - Fixed version with proper setCharacters export
import { useLocalStorage } from './useLocalStorage';
import { newCharacterTemplate, colors } from '../utils/constants';
import { getStatModifier } from '../utils/helpers';

export const useCharacters = () => {
  const [characters, setCharacters] = useLocalStorage('characters', []);

  const addCharacter = () => {
    const newChar = { 
      ...newCharacterTemplate, 
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      color: colors[characters.length % colors.length],
      // D&D 5e specific defaults
      ac: 10 + getStatModifier(newCharacterTemplate.dex),
      proficiencyBonus: 2,
      speed: 30,
      conditions: [],
      actions: [],
      spells: [],
      // Ensure position is set
      x: Math.floor(Math.random() * 20),
      y: Math.floor(Math.random() * 20)
    };
    
    console.log('Adding new character:', newChar);
    setCharacters(prev => {
      const updated = [...prev, newChar];
      console.log('Updated characters list:', updated);
      return updated;
    });
    return newChar;
  };

  const addMonster = (monsterTemplate) => {
    const monster = {
      ...monsterTemplate,
      id: monsterTemplate.id || `monster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      // Ensure position is set
      x: monsterTemplate.x || Math.floor(Math.random() * 20),
      y: monsterTemplate.y || Math.floor(Math.random() * 20),
      isMonster: true,
      conditions: monsterTemplate.conditions || [],
      actions: monsterTemplate.actions || [],
      spells: monsterTemplate.spells || []
    };
    
    console.log('Adding monster:', monster);
    setCharacters(prev => {
      const updated = [...prev, monster];
      console.log('Updated characters list with monster:', updated);
      return updated;
    });
    return monster;
  };

  const updateCharacter = (updatedChar) => {
    console.log('Updating character:', updatedChar);
    
    // Ensure D&D properties are set
    const charWithDefaults = {
      ...updatedChar,
      ac: updatedChar.ac || (10 + getStatModifier(updatedChar.dex || 10)),
      proficiencyBonus: updatedChar.proficiencyBonus || 2,
      speed: updatedChar.speed || 30,
      conditions: updatedChar.conditions || [],
      actions: updatedChar.actions || [],
      spells: updatedChar.spells || []
    };
    
    setCharacters(prev => {
      const updated = prev.map(char => 
        char.id === updatedChar.id ? charWithDefaults : char
      );
      console.log('Characters after update:', updated);
      return updated;
    });
  };

  const deleteCharacter = (id) => {
    console.log('Deleting character:', id);
    setCharacters(prev => {
      const updated = prev.filter(char => char.id !== id);
      console.log('Characters after deletion:', updated);
      return updated;
    });
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
    setCharacters, // Make sure this is exported!
    addCharacter,
    addMonster,
    updateCharacter,
    deleteCharacter,
    moveCharacter,
    addCondition,
    removeCondition,
    healCharacter,
    damageCharacter
  };
};
