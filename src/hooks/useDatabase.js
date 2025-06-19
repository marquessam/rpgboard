// src/hooks/useDatabase.js - Updated for Netlify Functions architecture
import { useState, useEffect } from 'react';
import * as db from '../utils/database.js';

export const useDatabase = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(null);

  // Initialize database connection on first load
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setIsLoading(true);
        setConnectionError(null);
        
        console.log('🔄 Database: Testing connection through Netlify Function...');
        
        // Test the connection
        const health = await db.checkDatabaseHealth();
        
        if (health.healthy) {
          console.log('✅ Database: Connection successful via Netlify Function');
          console.log('📅 Database: Server time:', health.timestamp);
          setIsConnected(true);
          setIsInitialized(true);

          // Get initial stats
          try {
            const stats = await db.getDatabaseStats();
            if (stats) {
              console.log('📊 Database: Current stats:', stats);
            }
          } catch (error) {
            console.warn('⚠️ Database: Could not get stats:', error);
          }
        } else {
          throw new Error(health.error || 'Database health check failed');
        }
      } catch (error) {
        console.error('💥 Database: Connection failed:', error);
        setIsConnected(false);
        setIsInitialized(false);
        setConnectionError(error.message);
        
        // Provide helpful debugging information
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          console.log('🚨 Network Error: This could mean:');
          console.log('   1. Netlify Functions are not running (if in dev mode, run: netlify dev)');
          console.log('   2. The function deployment failed');
          console.log('   3. CORS issues');
        } else if (error.message.includes('NETLIFY_DATABASE_URL')) {
          console.log('🚨 Database Configuration Error:');
          console.log('   1. Run: netlify db init');
          console.log('   2. Or set NETLIFY_DATABASE_URL in your environment');
        } else {
          console.log('🚨 Unknown Error: Check the Netlify Function logs');
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to ensure the function is ready
    const timer = setTimeout(initializeDatabase, 100);
    return () => clearTimeout(timer);
  }, []);

  // Enhanced image operations with better error handling
  const uploadImage = async (imageData, imageType = 'sprite', name = 'image') => {
    if (!isConnected) {
      throw new Error('Database not connected');
    }

    try {
      console.log(`📤 Database: Uploading ${imageType} image: ${name}`);
      const imageId = await db.saveImage(imageData, imageType, name);
      
      if (imageId) {
        console.log(`✅ Database: Image uploaded successfully: ${imageId}`);
        return imageId;
      } else {
        throw new Error('Image upload returned no ID');
      }
    } catch (error) {
      console.error('💥 Database: Image upload failed:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  };

  const getImage = async (imageId) => {
    if (!isConnected || !imageId) {
      return null;
    }

    try {
      console.log(`📥 Database: Loading image: ${imageId}`);
      const imageData = await db.loadImage(imageId);
      
      if (imageData) {
        console.log(`✅ Database: Image loaded successfully: ${imageId}`);
      } else {
        console.warn(`⚠️ Database: Image not found: ${imageId}`);
      }
      
      return imageData;
    } catch (error) {
      console.error('💥 Database: Image load failed:', error);
      return null;
    }
  };

  // Enhanced character operations
  const saveCharacterToDb = async (character) => {
    if (!isConnected) {
      console.warn('Database: Character save failed - not connected');
      return false;
    }

    try {
      console.log(`📤 Database: Saving character: ${character.name} (${character.id})`);
      const success = await db.saveCharacter(character);
      
      if (success) {
        console.log(`✅ Database: Character saved successfully: ${character.name}`);
      } else {
        console.warn(`⚠️ Database: Character save returned false: ${character.name}`);
      }
      
      return success;
    } catch (error) {
      console.error('💥 Database: Character save failed:', error);
      return false;
    }
  };

  const loadCharactersFromDb = async () => {
    if (!isConnected) {
      console.log('Database: Character load skipped - not connected');
      return [];
    }

    try {
      console.log('📥 Database: Loading characters...');
      const characters = await db.loadCharacters();
      console.log(`✅ Database: Loaded ${characters.length} characters`);
      return characters;
    } catch (error) {
      console.error('💥 Database: Character load failed:', error);
      return [];
    }
  };

  const deleteCharacterFromDb = async (characterId) => {
    if (!isConnected) {
      console.warn('Database: Character delete failed - not connected');
      return false;
    }

    try {
      console.log(`🗑️ Database: Deleting character: ${characterId}`);
      const success = await db.deleteCharacter(characterId);
      
      if (success) {
        console.log(`✅ Database: Character deleted successfully: ${characterId}`);
      }
      
      return success;
    } catch (error) {
      console.error('💥 Database: Character delete failed:', error);
      return false;
    }
  };

  // Enhanced game state operations
  const saveGameState = async (gameData) => {
    if (!isConnected) {
      console.log('Database: Game state save skipped - not connected');
      return false;
    }

    try {
      console.log('📤 Database: Saving game state...');
      const sessionData = {
        id: 'default-session',
        name: 'Current Game',
        ...gameData,
        timestamp: new Date().toISOString()
      };

      const success = await db.saveGameSession(sessionData);
      
      if (success) {
        console.log('✅ Database: Game state saved successfully');
      }
      
      return success;
    } catch (error) {
      console.error('💥 Database: Game state save failed:', error);
      return false;
    }
  };

  const loadGameState = async () => {
    if (!isConnected) {
      console.log('Database: Game state load skipped - not connected');
      return null;
    }

    try {
      console.log('📥 Database: Loading game state...');
      const gameData = await db.loadGameSession('default-session');
      
      if (gameData) {
        console.log('✅ Database: Game state loaded successfully');
      } else {
        console.log('ℹ️ Database: No saved game state found');
      }
      
      return gameData;
    } catch (error) {
      console.error('💥 Database: Game state load failed:', error);
      return null;
    }
  };

  // Connection status helpers
  const getConnectionStatus = () => {
    if (isLoading) return 'connecting';
    if (isConnected && isInitialized) return 'connected';
    if (connectionError) return 'error';
    return 'disconnected';
  };

  const getStatusMessage = () => {
    const status = getConnectionStatus();
    switch (status) {
      case 'connecting':
        return 'Connecting to database via Netlify Function...';
      case 'connected':
        return 'Connected to cloud database via Netlify Function';
      case 'error':
        return `Database error: ${connectionError}`;
      case 'disconnected':
        return 'Database not available - using local storage';
      default:
        return 'Unknown status';
    }
  };

  // Test connection function for debugging
  const testConnection = async () => {
    try {
      setIsLoading(true);
      const result = await db.testConnection();
      
      if (result.success) {
        setIsConnected(true);
        setIsInitialized(true);
        setConnectionError(null);
      } else {
        setIsConnected(false);
        setConnectionError(result.message);
      }
      
      return result;
    } catch (error) {
      setIsConnected(false);
      setConnectionError(error.message);
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Connection status
    isConnected,
    isInitialized,
    isLoading,
    connectionError,
    connectionStatus: getConnectionStatus(),
    statusMessage: getStatusMessage(),
    
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
    
    // Debug helpers
    getDatabaseStats: async () => {
      if (!isConnected) return null;
      try {
        return await db.getDatabaseStats();
      } catch (error) {
        console.error('Database stats error:', error);
        return null;
      }
    },
    
    // Test connection for debugging
    testConnection
  };
};
