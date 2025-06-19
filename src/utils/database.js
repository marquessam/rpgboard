// src/utils/database.js - Fixed to use Netlify Functions instead of direct connection
// This file makes HTTP requests to your Netlify Function instead of connecting directly

const API_BASE = '/.netlify/functions/database';

// Helper function to make API requests
const apiRequest = async (operation, options = {}) => {
  try {
    const url = new URL(API_BASE, window.location.origin);
    url.searchParams.set('operation', operation);
    
    // Add any additional query parameters
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    
    const fetchOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };
    
    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }
    
    console.log(`🌐 API Request: ${operation}`, { url: url.toString(), options: fetchOptions });
    
    const response = await fetch(url.toString(), fetchOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`✅ API Response: ${operation}`, result);
    return result;
    
  } catch (error) {
    console.error(`💥 API Error: ${operation}`, error);
    throw error;
  }
};

// Initialize database tables (calls the function to create tables)
export const initDatabase = async () => {
  try {
    const health = await checkDatabaseHealth();
    return health.healthy;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
};

// Check if we have a working database connection
export const checkDatabaseHealth = async () => {
  try {
    const result = await apiRequest('health');
    return {
      healthy: result.healthy,
      timestamp: result.timestamp
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message
    };
  }
};

// Image operations
export const saveImage = async (imageData, imageType = 'sprite', name = 'image') => {
  try {
    const result = await apiRequest('save-image', {
      method: 'POST',
      body: {
        imageData,
        imageType,
        name
      }
    });
    return result.imageId;
  } catch (error) {
    throw new Error(`Failed to save image: ${error.message}`);
  }
};

export const loadImage = async (imageId) => {
  try {
    const result = await apiRequest('get-image', {
      params: { imageId }
    });
    return result?.data || null;
  } catch (error) {
    console.error('Failed to load image:', error);
    return null;
  }
};

// Character operations
export const saveCharacter = async (character) => {
  try {
    const result = await apiRequest('save-character', {
      method: 'POST',
      body: character
    });
    return result.success;
  } catch (error) {
    console.error('Failed to save character:', error);
    return false;
  }
};

export const loadCharacters = async () => {
  try {
    const result = await apiRequest('load-characters');
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Failed to load characters:', error);
    return [];
  }
};

export const deleteCharacter = async (characterId) => {
  try {
    const result = await apiRequest('delete-character', {
      method: 'DELETE',
      params: { characterId }
    });
    return result.success;
  } catch (error) {
    console.error('Failed to delete character:', error);
    return false;
  }
};

// Game session operations
export const saveGameSession = async (sessionData) => {
  try {
    // For now, we'll store game sessions as special characters
    // You could extend the Netlify Function to handle game sessions separately
    const gameSessionCharacter = {
      id: 'game-session-' + (sessionData.id || 'default'),
      name: 'Game Session Data',
      ...sessionData,
      isGameSession: true
    };
    
    return await saveCharacter(gameSessionCharacter);
  } catch (error) {
    console.error('Failed to save game session:', error);
    return false;
  }
};

export const loadGameSession = async (sessionId = 'default-session') => {
  try {
    const characters = await loadCharacters();
    const gameSession = characters.find(char => 
      char.id === `game-session-${sessionId}` && char.isGameSession
    );
    return gameSession || null;
  } catch (error) {
    console.error('Failed to load game session:', error);
    return null;
  }
};

// Get database statistics
export const getDatabaseStats = async () => {
  try {
    const result = await apiRequest('stats');
    return result;
  } catch (error) {
    console.error('Failed to get database stats:', error);
    return null;
  }
};

// Test connection function
export const testConnection = async () => {
  try {
    console.log('🧪 Testing database connection...');
    const health = await checkDatabaseHealth();
    
    if (health.healthy) {
      console.log('✅ Database connection test successful');
      
      // Try to get stats
      const stats = await getDatabaseStats();
      console.log('📊 Database stats:', stats);
      
      return {
        success: true,
        message: 'Database connection is working',
        stats
      };
    } else {
      console.warn('⚠️ Database connection test failed:', health.error);
      return {
        success: false,
        message: health.error || 'Database connection failed'
      };
    }
  } catch (error) {
    console.error('💥 Database connection test error:', error);
    return {
      success: false,
      message: error.message
    };
  }
};
