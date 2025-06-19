// src/utils/database.js - Fixed for client-side use with direct Neon access
import { neon } from '@neondatabase/serverless';

// For client-side use, we need to provide the connection string directly
// Since we can't access server-side environment variables from the browser,
// we'll need to configure this differently

let sql = null;
let isInitialized = false;

// Initialize database connection with client-side approach
const initializeConnection = () => {
  try {
    // Option 1: Check if running in Netlify Functions environment
    if (typeof process !== 'undefined' && process.env && process.env.NETLIFY_DATABASE_URL) {
      console.log('🔧 Database: Using server-side environment variable');
      sql = neon(process.env.NETLIFY_DATABASE_URL);
      return true;
    }
    
    // Option 2: Check for Netlify-specific environment access
    if (typeof Netlify !== 'undefined' && Netlify.env) {
      console.log('🔧 Database: Using Netlify.env');
      sql = neon(Netlify.env.get('NETLIFY_DATABASE_URL'));
      return true;
    }
    
    // Option 3: Check for client-side environment variable (requires VITE_ prefix)
    if (import.meta.env && import.meta.env.VITE_NETLIFY_DATABASE_URL) {
      console.log('🔧 Database: Using Vite environment variable');
      sql = neon(import.meta.env.VITE_NETLIFY_DATABASE_URL);
      return true;
    }
    
    // Option 4: Fallback - connection string not available in client
    console.warn('⚠️ Database: No connection string found in client environment');
    console.log('💡 Database: This is expected - server-side environment variables are not available in the browser');
    console.log('💡 Database: Consider using Netlify Functions for database operations');
    return false;
    
  } catch (error) {
    console.error('💥 Database: Connection initialization failed:', error);
    return false;
  }
};

// Initialize database tables
export const initDatabase = async () => {
  if (!sql) {
    const connected = initializeConnection();
    if (!connected) {
      console.log('🔄 Database: Skipping table initialization - no connection available');
      return false;
    }
  }

  try {
    console.log('🔧 Database: Creating tables...');
    
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

    console.log('✅ Database: Tables created successfully');
    isInitialized = true;
    return true;
  } catch (error) {
    console.error('💥 Database: Table creation failed:', error);
    return false;
  }
};

// Check if we have a working database connection
export const checkDatabaseHealth = async () => {
  try {
    if (!sql) {
      const connected = initializeConnection();
      if (!connected) {
        return {
          healthy: false,
          error: 'Connection string not found - this is expected in client-side applications'
        };
      }
    }

    const [result] = await sql`SELECT NOW() as current_time`;
    return {
      healthy: true,
      timestamp: result.current_time
    };
  } catch (error) {
    console.error('💥 Database: Health check failed:', error);
    return {
      healthy: false,
      error: error.message
    };
  }
};

// Image operations - with better error handling
export const saveImage = async (imageData, imageType = 'sprite', name = 'image') => {
  if (!sql) {
    throw new Error('Database connection not available');
  }

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
    
    console.log(`✅ Database: Image saved successfully: ${imageId}`);
    return imageId;
  } catch (error) {
    console.error('💥 Database: Image save failed:', error);
    throw new Error(`Failed to save image: ${error.message}`);
  }
};

export const loadImage = async (imageId) => {
  if (!sql) {
    console.warn('Database connection not available for image loading');
    return null;
  }

  try {
    const [result] = await sql`SELECT * FROM images WHERE id = ${imageId}`;
    return result ? result.data : null;
  } catch (error) {
    console.error('💥 Database: Image load failed:', error);
    return null;
  }
};

export const loadImagesByType = async (imageType) => {
  if (!sql) {
    return [];
  }

  try {
    const result = await sql`SELECT * FROM images WHERE type = ${imageType} ORDER BY created_at DESC`;
    return result;
  } catch (error) {
    console.error('💥 Database: Images by type load failed:', error);
    return [];
  }
};

export const deleteImage = async (imageId) => {
  if (!sql) {
    return false;
  }

  try {
    await sql`DELETE FROM images WHERE id = ${imageId}`;
    return true;
  } catch (error) {
    console.error('💥 Database: Image delete failed:', error);
    return false;
  }
};

// Character operations
export const saveCharacter = async (character) => {
  if (!sql) {
    console.warn('Database connection not available for character saving');
    return false;
  }

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
    console.error('💥 Database: Character save failed:', error);
    return false;
  }
};

export const loadCharacters = async () => {
  if (!sql) {
    console.log('Database connection not available for character loading');
    return [];
  }

  try {
    const result = await sql`SELECT * FROM characters ORDER BY updated_at DESC`;
    return result.map(row => row.data);
  } catch (error) {
    console.error('💥 Database: Character load failed:', error);
    return [];
  }
};

export const deleteCharacter = async (characterId) => {
  if (!sql) {
    return false;
  }

  try {
    await sql`DELETE FROM characters WHERE id = ${characterId}`;
    return true;
  } catch (error) {
    console.error('💥 Database: Character delete failed:', error);
    return false;
  }
};

// Game session operations
export const saveGameSession = async (sessionData) => {
  if (!sql) {
    return false;
  }

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
    console.error('💥 Database: Game session save failed:', error);
    return false;
  }
};

export const loadGameSession = async (sessionId = 'default-session') => {
  if (!sql) {
    return null;
  }

  try {
    const [result] = await sql`SELECT * FROM game_sessions WHERE id = ${sessionId}`;
    return result ? result.data : null;
  } catch (error) {
    console.error('💥 Database: Game session load failed:', error);
    return null;
  }
};

// Chat operations
export const saveChatMessage = async (message, sessionId = 'default-session') => {
  if (!sql) {
    return false;
  }

  try {
    await sql`
      INSERT INTO chat_messages (session_id, message_data)
      VALUES (${sessionId}, ${JSON.stringify(message)})
    `;
    return true;
  } catch (error) {
    console.error('💥 Database: Chat message save failed:', error);
    return false;
  }
};

export const loadChatMessages = async (sessionId = 'default-session', limit = 100) => {
  if (!sql) {
    return [];
  }

  try {
    const result = await sql`
      SELECT message_data FROM chat_messages 
      WHERE session_id = ${sessionId}
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `;
    return result.map(row => row.message_data).reverse();
  } catch (error) {
    console.error('💥 Database: Chat messages load failed:', error);
    return [];
  }
};

// Combat messages operations
export const saveCombatMessage = async (message, sessionId = 'default-session') => {
  if (!sql) {
    return false;
  }

  try {
    await sql`
      INSERT INTO combat_messages (session_id, message_data)
      VALUES (${sessionId}, ${JSON.stringify(message)})
    `;
    return true;
  } catch (error) {
    console.error('💥 Database: Combat message save failed:', error);
    return false;
  }
};

export const loadCombatMessages = async (sessionId = 'default-session', limit = 100) => {
  if (!sql) {
    return [];
  }

  try {
    const result = await sql`
      SELECT message_data FROM combat_messages 
      WHERE session_id = ${sessionId}
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `;
    return result.map(row => row.message_data).reverse();
  } catch (error) {
    console.error('💥 Database: Combat messages load failed:', error);
    return [];
  }
};

// Utility functions
export const clearOldMessages = async (sessionId = 'default-session', daysOld = 7) => {
  if (!sql) {
    return false;
  }

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
    console.error('💥 Database: Clear old messages failed:', error);
    return false;
  }
};

export const getDatabaseStats = async () => {
  if (!sql) {
    return null;
  }

  try {
    const [charCount] = await sql`SELECT COUNT(*) as count FROM characters`;
    const [imageCount] = await sql`SELECT COUNT(*) as count FROM images`;
    const [chatCount] = await sql`SELECT COUNT(*) as count FROM chat_messages`;
    const [combatCount] = await sql`SELECT COUNT(*) as count FROM combat_messages`;
    
    return {
      characters: parseInt(charCount.count),
      images: parseInt(imageCount.count),
      chatMessages: parseInt(chatCount.count),
      combatMessages: parseInt(combatCount.count)
    };
  } catch (error) {
    console.error('💥 Database: Stats failed:', error);
    return null;
  }
};
