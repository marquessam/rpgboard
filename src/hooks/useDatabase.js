// src/hooks/useDatabase.js - React hook for database operations
import { useState, useEffect } from 'react';
import { 
  initDatabase, 
  saveImage, 
  loadImage, 
  saveCharacter, 
  loadCharacters,
  deleteCharacter as dbDeleteCharacter,
  saveGameSession,
  loadGameSession,
  saveChatMessage,
  loadChatMessages,
  saveCombatMessage,
  loadCombatMessages,
  checkDatabaseHealth 
} from '../utils/database';

export const useDatabase = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize database connection on first load
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setIsLoading(true);
        
        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }

        // Check database health
        const health = await checkDatabaseHealth();
        setIsConnected(health.healthy);

        if (health.healthy) {
          // Initialize database tables
          const initialized = await initDatabase();
          setIsInitialized(initialized);
          
          if (initialized) {
            console.log('✅ Database connected and initialized');
          }
        } else {
          console.warn('⚠️ Database not available, using local storage fallback');
        }
      } catch (error) {
        console.warn('⚠️ Database initialization failed, using local storage fallback:', error);
        setIsConnected(false);
        setIsInitialized(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  // Image operations
  const uploadImage = async (imageData, imageType = 'sprite', name = 'image') => {
    if (!isConnected) {
      console.warn('Database not connected, cannot upload image');
      return null;
    }

    try {
      const imageId = await saveImage(imageData, imageType, name);
      if (imageId) {
        console.log(`✅ Image uploaded to database: ${imageId}`);
        return imageId;
      }
      return null;
    } catch (error) {
      console.error('Failed to upload image:', error);
      return null;
    }
  };

  const getImage = async (imageId) => {
    if (!isConnected || !imageId) {
      return null;
    }

    try {
      const imageData = await loadImage(imageId);
      return imageData;
    } catch (error) {
      console.error('Failed to load image:', error);
      return null;
    }
  };

  // Character operations
  const saveCharacterToDb = async (character) => {
    if (!isConnected) {
      return false;
    }

    try {
      const success = await saveCharacter(character);
      if (success) {
        console.log(`✅ Character saved to database: ${character.name}`);
      }
      return success;
    } catch (error) {
      console.error('Failed to save character:', error);
      return false;
    }
  };

  const loadCharactersFromDb = async () => {
    if (!isConnected) {
      return [];
    }

    try {
      const characters = await loadCharacters();
      console.log(`✅ Loaded ${characters.length} characters from database`);
      return characters;
    } catch (error) {
      console.error('Failed to load characters:', error);
      return [];
    }
  };

  const deleteCharacterFromDb = async (characterId) => {
    if (!isConnected) {
      return false;
    }

    try {
      const success = await dbDeleteCharacter(characterId);
      if (success) {
        console.log(`✅ Character deleted from database: ${characterId}`);
      }
      return success;
    } catch (error) {
      console.error('Failed to delete character:', error);
      return false;
    }
  };

  // Game session operations
  const saveGameState = async (gameData) => {
    if (!isConnected) {
      return false;
    }

    try {
      const sessionData = {
        id: 'default-session',
        name: 'Current Game',
        ...gameData,
        timestamp: new Date().toISOString()
      };

      const success = await saveGameSession(sessionData);
      if (success) {
        console.log('✅ Game state saved to database');
      }
      return success;
    } catch (error) {
      console.error('Failed to save game state:', error);
      return false;
    }
  };

  const loadGameState = async () => {
    if (!isConnected) {
      return null;
    }

    try {
      const gameData = await loadGameSession('default-session');
      if (gameData) {
        console.log('✅ Game state loaded from database');
      }
      return gameData;
    } catch (error) {
      console.error('Failed to load game state:', error);
      return null;
    }
  };

  // Message operations
  const saveChatToDb = async (message) => {
    if (!isConnected) {
      return false;
    }

    try {
      const success = await saveChatMessage(message, 'default-session');
      return success;
    } catch (error) {
      console.error('Failed to save chat message:', error);
      return false;
    }
  };

  const loadChatFromDb = async (limit = 100) => {
    if (!isConnected) {
      return [];
    }

    try {
      const messages = await loadChatMessages('default-session', limit);
      return messages;
    } catch (error) {
      console.error('Failed to load chat messages:', error);
      return [];
    }
  };

  const saveCombatToDb = async (message) => {
    if (!isConnected) {
      return false;
    }

    try {
      const success = await saveCombatMessage(message, 'default-session');
      return success;
    } catch (error) {
      console.error('Failed to save combat message:', error);
      return false;
    }
  };

  const loadCombatFromDb = async (limit = 100) => {
    if (!isConnected) {
      return [];
    }

    try {
      const messages = await loadCombatMessages('default-session', limit);
      return messages;
    } catch (error) {
      console.error('Failed to load combat messages:', error);
      return [];
    }
  };

  return {
    // Connection status
    isConnected,
    isInitialized,
    isLoading,
    
    // Image operations
    uploadImage,
    getImage,
    
    // Character operations
    saveCharacterToDb,
    loadCharactersFromDb,
    deleteCharacterFromDb,
    
    // Game state operations
    saveGameState,
    loadGameState,
    
    // Message operations
    saveChatToDb,
    loadChatFromDb,
    saveCombatToDb,
    loadCombatFromDb
  };
};
