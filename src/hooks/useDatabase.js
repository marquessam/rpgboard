// src/hooks/useDatabase.js - Enhanced with debugging and better error handling
import { useState, useEffect } from 'react';

// Note: Using dynamic imports for database functions to handle environments where they might not be available
const importDatabaseFunctions = async () => {
  try {
    const dbModule = await import('../utils/database.js');
    return dbModule;
  } catch (error) {
    console.warn('Database module not available:', error);
    return null;
  }
};

export const useDatabase = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(null);
  const [dbFunctions, setDbFunctions] = useState(null);

  // Initialize database connection on first load
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setIsLoading(true);
        setConnectionError(null);
        
        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
          console.log('⚠️ Database: Server-side environment detected, skipping database initialization');
          setIsLoading(false);
          return;
        }

        // Import database functions
        console.log('🔄 Database: Loading database module...');
        const db = await importDatabaseFunctions();
        if (!db) {
          throw new Error('Database module could not be loaded');
        }
        setDbFunctions(db);

        // Check if we have the environment variable
        // Note: NETLIFY_DATABASE_URL is automatically provided by Netlify when using @netlify/neon
        console.log('🔍 Database: Checking for database configuration...');
        
        // Check database health
        console.log('📡 Database: Testing connection...');
        const health = await db.checkDatabaseHealth();
        
        if (health.healthy) {
          console.log('✅ Database: Connection successful');
          console.log('📅 Database: Server time:', health.timestamp);
          setIsConnected(true);

          // Initialize database tables
          console.log('🔧 Database: Initializing tables...');
          const initialized = await db.initDatabase();
          setIsInitialized(initialized);
          
          if (initialized) {
            console.log('✅ Database: Tables initialized successfully');
            
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
            console.warn('⚠️ Database: Table initialization failed');
          }
        } else {
          throw new Error(health.error || 'Database health check failed');
        }
      } catch (error) {
        console.error('💥 Database: Initialization failed:', error);
        setIsConnected(false);
        setIsInitialized(false);
        setConnectionError(error.message);
        
        // Determine if this is a configuration issue vs availability issue
        if (error.message.includes('NETLIFY_DATABASE_URL') || error.message.includes('environment')) {
          console.log('💡 Database: This appears to be a configuration issue');
          console.log('💡 Database: To set up a database, run: npx netlify db init');
          console.log('💡 Database: Or set NETLIFY_DATABASE_URL in your environment');
        } else {
          console.log('⚠️ Database: Using local storage fallback');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  // Enhanced image operations with better error handling
  const uploadImage = async (imageData, imageType = 'sprite', name = 'image') => {
    if (!isConnected || !dbFunctions) {
      console.warn('Database: Upload failed - not connected');
      throw new Error('Database not connected');
    }

    try {
      console.log(`📤 Database: Uploading ${imageType} image: ${name}`);
      const imageId = await dbFunctions.saveImage(imageData, imageType, name);
      
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
    if (!isConnected || !dbFunctions || !imageId) {
      return null;
    }

    try {
      console.log(`📥 Database: Loading image: ${imageId}`);
      const imageData = await dbFunctions.loadImage(imageId);
      
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
    if (!isConnected || !dbFunctions) {
      console.warn('Database: Character save failed - not connected');
      return false;
    }

    try {
      console.log(`📤 Database: Saving character: ${character.name} (${character.id})`);
      const success = await dbFunctions.saveCharacter(character);
      
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
    if (!isConnected || !dbFunctions) {
      console.log('Database: Character load skipped - not connected');
      return [];
    }

    try {
      console.log('📥 Database: Loading characters...');
      const characters = await dbFunctions.loadCharacters();
      console.log(`✅ Database: Loaded ${characters.length} characters`);
      return characters;
    } catch (error) {
      console.error('💥 Database: Character load failed:', error);
      return [];
    }
  };

  const deleteCharacterFromDb = async (characterId) => {
    if (!isConnected || !dbFunctions) {
      console.warn('Database: Character delete failed - not connected');
      return false;
    }

    try {
      console.log(`🗑️ Database: Deleting character: ${characterId}`);
      const success = await dbFunctions.deleteCharacter(characterId);
      
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
    if (!isConnected || !dbFunctions) {
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

      const success = await dbFunctions.saveGameSession(sessionData);
      
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
    if (!isConnected || !dbFunctions) {
      console.log('Database: Game state load skipped - not connected');
      return null;
    }

    try {
      console.log('📥 Database: Loading game state...');
      const gameData = await dbFunctions.loadGameSession('default-session');
      
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
        return 'Connecting to database...';
      case 'connected':
        return 'Connected to cloud database';
      case 'error':
        return `Database error: ${connectionError}`;
      case 'disconnected':
        return 'Database not available - using local storage';
      default:
        return 'Unknown status';
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
      if (!isConnected || !dbFunctions) return null;
      try {
        return await dbFunctions.getDatabaseStats();
      } catch (error) {
        console.error('Database stats error:', error);
        return null;
      }
    }
  };
};
