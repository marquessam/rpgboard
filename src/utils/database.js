// src/utils/database.js - Enhanced with real-time multiplayer support
const API_BASE = '/.netlify/functions/database';

// Helper function to make API requests
const apiRequest = async (operation, options = {}) => {
  try {
    const url = new URL(API_BASE, window.location.origin);
    url.searchParams.set('operation', operation);
    
    // Add session and user context
    if (options.sessionId) {
      url.searchParams.set('sessionId', options.sessionId);
    }
    if (options.userId) {
      url.searchParams.set('userId', options.userId);
    }
    
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

// Session Management
export const joinSession = async (sessionId, userId, userName, userColor, isDM = false) => {
  try {
    const result = await apiRequest('join-session', {
      method: 'POST',
      sessionId,
      userId,
      body: { userName, userColor, isDM }
    });
    return result.success;
  } catch (error) {
    console.error('Failed to join session:', error);
    return false;
  }
};

export const leaveSession = async (sessionId, userId) => {
  try {
    const result = await apiRequest('leave-session', {
      method: 'POST',
      sessionId,
      userId
    });
    return result.success;
  } catch (error) {
    console.error('Failed to leave session:', error);
    return false;
  }
};

export const sendHeartbeat = async (sessionId, userId, cursorX = 0, cursorY = 0) => {
  try {
    const result = await apiRequest('heartbeat', {
      method: 'POST',
      sessionId,
      userId,
      body: { cursorX, cursorY }
    });
    return result.success;
  } catch (error) {
    console.error('Failed to send heartbeat:', error);
    return false;
  }
};

export const getSessionUsers = async (sessionId) => {
  try {
    const result = await apiRequest('get-session-users', {
      sessionId
    });
    return result || [];
  } catch (error) {
    console.error('Failed to get session users:', error);
    return [];
  }
};

// Real-time sync
export const getSessionUpdates = async (sessionId, userId, since = null) => {
  try {
    const result = await apiRequest('get-updates', {
      sessionId,
      userId,
      params: since ? { since } : {}
    });
    return result || [];
  } catch (error) {
    console.error('Failed to get session updates:', error);
    return [];
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
export const saveImage = async (imageData, imageType = 'sprite', name = 'image', sessionId = 'default') => {
  try {
    const result = await apiRequest('save-image', {
      method: 'POST',
      sessionId,
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
export const saveCharacter = async (character, sessionId = 'default', userId = 'system') => {
  try {
    const result = await apiRequest('save-character', {
      method: 'POST',
      sessionId,
      userId,
      body: character
    });
    return result.success;
  } catch (error) {
    console.error('Failed to save character:', error);
    return false;
  }
};

export const loadCharacters = async (sessionId = 'default') => {
  try {
    const result = await apiRequest('load-characters', {
      sessionId
    });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Failed to load characters:', error);
    return [];
  }
};

export const deleteCharacter = async (characterId, sessionId = 'default', userId = 'system') => {
  try {
    const result = await apiRequest('delete-character', {
      method: 'DELETE',
      sessionId,
      userId,
      params: { characterId }
    });
    return result.success;
  } catch (error) {
    console.error('Failed to delete character:', error);
    return false;
  }
};

// Game session operations
export const saveGameSession = async (sessionData, sessionId = 'default', userId = 'system') => {
  try {
    const result = await apiRequest('save-game-state', {
      method: 'POST',
      sessionId,
      userId,
      body: sessionData
    });
    return result.success;
  } catch (error) {
    console.error('Failed to save game session:', error);
    return false;
  }
};

export const loadGameSession = async (sessionId = 'default') => {
  try {
    const result = await apiRequest('load-game-state', {
      sessionId
    });
    return result || null;
  } catch (error) {
    console.error('Failed to load game session:', error);
    return null;
  }
};

// Get database statistics
export const getDatabaseStats = async (sessionId = 'default') => {
  try {
    const result = await apiRequest('stats', {
      sessionId
    });
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

// Cleanup function (can be called periodically)
export const cleanupOldData = async () => {
  try {
    const result = await apiRequest('cleanup', {
      method: 'POST'
    });
    return result.success;
  } catch (error) {
    console.error('Failed to cleanup old data:', error);
    return false;
  }
};
