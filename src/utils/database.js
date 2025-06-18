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
        session_id VARCHAR,
        message_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
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
