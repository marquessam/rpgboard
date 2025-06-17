// src/hooks/useCharacters.js
import { useLocalStorage } from './useLocalStorage';
import { newCharacterTemplate, colors } from '../utils/constants';

export const useCharacters = () => {
  const [characters, setCharacters] = useLocalStorage('characters', []);

  const addCharacter = () => {
    const newChar = { 
      ...newCharacterTemplate, 
      id: Date.now(),
      color: colors[characters.length % colors.length]
    };
    setCharacters(prev => [...prev, newChar]);
    return newChar;
  };

  const updateCharacter = (updatedChar) => {
    setCharacters(prev => prev.map(char => 
      char.id === updatedChar.id ? updatedChar : char
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

  return {
    characters,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    moveCharacter
  };
};
