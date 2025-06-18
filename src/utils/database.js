// src/utils/database.js - Complete database integration
import { neon } from '@netlify/neon';

// Initialize database connection
const sql = neon(); // Automatically uses NETLIFY_DATABASE_URL

// Initialize database tables
export const initDatabase = async () => {
  try {
    // Characters table
    await sql`
      CREATE TABLE IF NOT EXISTS characters (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Images table for storing sprites and portraits
    await sql`
      CREATE TABLE IF NOT EXISTS images (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        type VARCHAR NOT NULL, -- 'sprite', 'portrait', 'terrain', 'scene'
        data TEXT NOT NULL, -- base64 encoded image data
        mime_type VARCHAR DEFAULT 'image/png',
        size_bytes INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Game sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Chat messages table
    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR DEFAULT 'default-session',
        message_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Combat messages table
    await sql`
      CREATE TABLE IF NOT EXISTS combat_messages (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR DEFAULT 'default-session',
        message_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
};

// Image operations
export const saveImage = async (imageData, imageType = 'sprite', name = 'image') => {
  try {
    const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Extract mime type and size from data URL
    const mimeMatch = imageData.match(/data:([^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
    const sizeBytes = Math.round((imageData.length * 3) / 4); // Rough base64 size calculation
    
    await sql`
      INSERT INTO images (id, name, type, data, mime_type, size_bytes, updated_at)
      VALUES (${imageId}, ${name}, ${imageType}, ${imageData}, ${mimeType}, ${sizeBytes}, NOW())
    `;
    
    return imageId;
  } catch (error) {
    console.error('Error saving image:', error);
    return null;
  }
};

export const loadImage = async (imageId) => {
  try {
    const [result] = await sql`SELECT * FROM images WHERE id = ${imageId}`;
    return result ? result.data : null;
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
};

export const loadImagesByType = async (imageType) => {
  try {
    const result = await sql`SELECT * FROM images WHERE type = ${imageType} ORDER BY created_at DESC`;
    return result;
  } catch (error) {
    console.error('Error loading images by type:', error);
    return [];
  }
};

export const deleteImage = async (imageId) => {
  try {
    await sql`DELETE FROM images WHERE id = ${imageId}`;
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

// Character operations
export const saveCharacter = async (character) => {
  try {
    await sql`
      INSERT INTO characters (id, name, data, updated_at)
      VALUES (${character.id}, ${character.name}, ${JSON.stringify(character)}, NOW())
      ON CONFLICT (id) 
      DO UPDATE SET 
        name = ${character.name},
        data = ${JSON.stringify(character)},
        updated_at = NOW()
    `;
    return true;
  } catch (error) {
    console.error('Error saving character:', error);
    return false;
  }
};

export const loadCharacters = async () => {
  try {
    const result = await sql`SELECT * FROM characters ORDER BY updated_at DESC`;
    return result.map(row => row.data);
  } catch (error) {
    console.error('Error loading characters:', error);
    return [];
  }
};

export const deleteCharacter = async (characterId) => {
  try {
    await sql`DELETE FROM characters WHERE id = ${characterId}`;
    return true;
  } catch (error) {
    console.error('Error deleting character:', error);
    return false;
  }
};

// Game session operations
export const saveGameSession = async (sessionData) => {
  try {
    const sessionId = sessionData.id || 'default-session';
    await sql`
      INSERT INTO game_sessions (id, name, data, updated_at)
      VALUES (${sessionId}, ${sessionData.name || 'Game Session'}, ${JSON.stringify(sessionData)}, NOW())
      ON CONFLICT (id)
      DO UPDATE SET 
        data = ${JSON.stringify(sessionData)},
        updated_at = NOW()
    `;
    return true;
  } catch (error) {
    console.error('Error saving game session:', error);
    return false;
  }
};

export const loadGameSession = async (sessionId = 'default-session') => {
  try {
    const [result] = await sql`SELECT * FROM game_sessions WHERE id = ${sessionId}`;
    return result ? result.data : null;
  } catch (error) {
    console.error('Error loading game session:', error);
    return null;
  }
};

// Chat operations
export const saveChatMessage = async (message, sessionId = 'default-session') => {
  try {
    await sql`
      INSERT INTO chat_messages (session_id, message_data)
      VALUES (${sessionId}, ${JSON.stringify(message)})
    `;
    return true;
  } catch (error) {
    console.error('Error saving chat message:', error);
    return false;
  }
};

export const loadChatMessages = async (sessionId = 'default-session', limit = 100) => {
  try {
    const result = await sql`
      SELECT message_data FROM chat_messages 
      WHERE session_id = ${sessionId}
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `;
    return result.map(row => row.message_data).reverse();
  } catch (error) {
    console.error('Error loading chat messages:', error);
    return [];
  }
};

// Combat messages operations
export const saveCombatMessage = async (message, sessionId = 'default-session') => {
  try {
    await sql`
      INSERT INTO combat_messages (session_id, message_data)
      VALUES (${sessionId}, ${JSON.stringify(message)})
    `;
    return true;
  } catch (error) {
    console.error('Error saving combat message:', error);
    return false;
  }
};

export const loadCombatMessages = async (sessionId = 'default-session', limit = 100) => {
  try {
    const result = await sql`
      SELECT message_data FROM combat_messages 
      WHERE session_id = ${sessionId}
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `;
    return result.map(row => row.message_data).reverse();
  } catch (error) {
    console.error('Error loading combat messages:', error);
    return [];
  }
};

// Utility functions
export const clearOldMessages = async (sessionId = 'default-session', daysOld = 7) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    await sql`
      DELETE FROM chat_messages 
      WHERE session_id = ${sessionId} 
      AND created_at < ${cutoffDate.toISOString()}
    `;
    
    await sql`
      DELETE FROM combat_messages 
      WHERE session_id = ${sessionId} 
      AND created_at < ${cutoffDate.toISOString()}
    `;
    
    return true;
  } catch (error) {
    console.error('Error clearing old messages:', error);
    return false;
  }
};

export const getDatabaseStats = async () => {
  try {
    const [charCount] = await sql`SELECT COUNT(*) as count FROM characters`;
    const [imageCount] = await sql`SELECT COUNT(*) as count FROM images`;
    const [chatCount] = await sql`SELECT COUNT(*) as count FROM chat_messages`;
    const [combatCount] = await sql`SELECT COUNT(*) as count FROM combat_messages`;
    
    return {
      characters: charCount.count,
      images: imageCount.count,
      chatMessages: chatCount.count,
      combatMessages: combatCount.count
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return null;
  }
};

// Database health check
export const checkDatabaseHealth = async () => {
  try {
    const [result] = await sql`SELECT NOW() as current_time`;
    return {
      healthy: true,
      timestamp: result.current_time
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      healthy: false,
      error: error.message
    };
  }
};

// Initialize database on app start (for production)
export const initializeOnStartup = async () => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return false; // Skip in server-side rendering
    }
    
    // Check if database connection is available
    const health = await checkDatabaseHealth();
    if (!health.healthy) {
      console.warn('Database not available, using local storage fallback');
      return false;
    }
    
    // Initialize database tables
    await initDatabase();
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.warn('Database initialization failed, using local storage fallback:', error);
    return false;
  }
};
