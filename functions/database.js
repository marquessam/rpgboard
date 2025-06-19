// functions/database.js - Enhanced with better error handling and debugging
import { neon } from '@netlify/neon';

const sql = neon(); // This will work on the server-side with NETLIFY_DATABASE_URL

// Initialize database tables
const initDatabase = async () => {
  try {
    console.log('🔧 Initializing database tables...');
    
    // Characters table
    await sql`
      CREATE TABLE IF NOT EXISTS characters (
        id VARCHAR PRIMARY KEY,
        session_id VARCHAR NOT NULL DEFAULT 'default',
        name VARCHAR NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        updated_by VARCHAR DEFAULT 'system'
      )
    `;
    console.log('✅ Characters table ready');

    // Images table for storing sprites and portraits
    await sql`
      CREATE TABLE IF NOT EXISTS images (
        id VARCHAR PRIMARY KEY,
        session_id VARCHAR DEFAULT 'default',
        name VARCHAR NOT NULL,
        type VARCHAR NOT NULL,
        data TEXT NOT NULL,
        mime_type VARCHAR DEFAULT 'image/png',
        size_bytes INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Images table ready');

    // Game sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        updated_by VARCHAR DEFAULT 'system'
      )
    `;
    console.log('✅ Game sessions table ready');

    // Session users table - track who's in each session
    await sql`
      CREATE TABLE IF NOT EXISTS session_users (
        id VARCHAR PRIMARY KEY,
        session_id VARCHAR NOT NULL,
        user_name VARCHAR NOT NULL,
        user_color VARCHAR DEFAULT '#6366f1',
        last_seen TIMESTAMP DEFAULT NOW(),
        is_dm BOOLEAN DEFAULT false,
        cursor_x INTEGER DEFAULT 0,
        cursor_y INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Session users table ready');

    // Session updates table - track changes for real-time sync
    await sql`
      CREATE TABLE IF NOT EXISTS session_updates (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR NOT NULL,
        update_type VARCHAR NOT NULL,
        data JSONB NOT NULL,
        updated_by VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Session updates table ready');

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_characters_session ON characters(session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_session_users_session ON session_users(session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_session_updates_session ON session_updates(session_id, created_at DESC)`;
    console.log('✅ Database indexes ready');

    console.log('🎉 Database initialization completed successfully!');
    return true;
  } catch (error) {
    console.error('💥 Database initialization error:', error);
    return false;
  }
};

export default async (request, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  try {
    const url = new URL(request.url);
    const operation = url.searchParams.get('operation');
    const sessionId = url.searchParams.get('sessionId') || 'default';
    const userId = url.searchParams.get('userId') || 'anonymous';
    
    console.log(`📨 Database function called: ${operation} for session: ${sessionId}`);
    
    // Check if database is available
    if (!process.env.NETLIFY_DATABASE_URL && !process.env.DATABASE_URL) {
      console.error('❌ No database URL found in environment variables');
      return new Response(JSON.stringify({
        error: 'Database not configured. Run: netlify db init',
        healthy: false
      }), { 
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' } 
      });
    }
    
    // Initialize database if needed
    const initResult = await initDatabase();
    if (!initResult) {
      console.error('❌ Database initialization failed');
      return new Response(JSON.stringify({
        error: 'Database initialization failed',
        healthy: false
      }), { 
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' } 
      });
    }

    switch (operation) {
      case 'health':
        console.log('🏥 Health check requested');
        const [result] = await sql`SELECT NOW() as current_time`;
        const healthResponse = {
          healthy: true,
          timestamp: result.current_time,
          message: 'Database connection successful'
        };
        console.log('✅ Health check passed:', healthResponse);
        return new Response(JSON.stringify(healthResponse), { 
          headers: { ...headers, 'Content-Type': 'application/json' } 
        });

      case 'stats':
        console.log('📊 Stats requested for session:', sessionId);
        const [charCount] = await sql`SELECT COUNT(*) as count FROM characters WHERE session_id = ${sessionId}`;
        const [imageCount] = await sql`SELECT COUNT(*) as count FROM images WHERE session_id = ${sessionId}`;
        const [userCount] = await sql`SELECT COUNT(*) as count FROM session_users WHERE session_id = ${sessionId} AND last_seen > NOW() - INTERVAL '5 minutes'`;
        const stats = {
          characters: parseInt(charCount.count),
          images: parseInt(imageCount.count),
          activeUsers: parseInt(userCount.count),
          sessionId
        };
        console.log('📈 Stats result:', stats);
        return new Response(JSON.stringify(stats), { 
          headers: { ...headers, 'Content-Type': 'application/json' } 
        });

      // Session Management
      case 'join-session':
        if (request.method === 'POST') {
          console.log('👥 User joining session:', { sessionId, userId });
          
          const { userName, userColor, isDM } = await request.json();
          console.log('📝 User data:', { userName, userColor, isDM });
          
          // Upsert user in session
          await sql`
            INSERT INTO session_users (id, session_id, user_name, user_color, is_dm, last_seen)
            VALUES (${userId}, ${sessionId}, ${userName}, ${userColor}, ${isDM}, NOW())
            ON CONFLICT (id) 
            DO UPDATE SET 
              user_name = ${userName},
              user_color = ${userColor},
              is_dm = ${isDM},
              last_seen = NOW()
          `;
          console.log('✅ User added to session_users table');

          // Add session update
          await sql`
            INSERT INTO session_updates (session_id, update_type, data, updated_by)
            VALUES (${sessionId}, 'user_joined', ${JSON.stringify({ userName, userColor, isDM })}, ${userId})
          `;
          console.log('✅ Session update recorded');

          const successResponse = { success: true, message: 'Successfully joined session' };
          console.log('🎉 Join session successful:', successResponse);
          return new Response(JSON.stringify(successResponse), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        }
        break;

      case 'leave-session':
        if (request.method === 'POST') {
          console.log('👋 User leaving session:', { sessionId, userId });
          
          await sql`DELETE FROM session_users WHERE id = ${userId}`;
          
          // Add session update
          await sql`
            INSERT INTO session_updates (session_id, update_type, data, updated_by)
            VALUES (${sessionId}, 'user_left', ${JSON.stringify({ userId })}, ${userId})
          `;

          const successResponse = { success: true, message: 'Successfully left session' };
          console.log('✅ Leave session successful:', successResponse);
          return new Response(JSON.stringify(successResponse), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        }
        break;

      case 'heartbeat':
        if (request.method === 'POST') {
          const { cursorX, cursorY } = await request.json();
          
          await sql`
            UPDATE session_users 
            SET last_seen = NOW(), cursor_x = ${cursorX || 0}, cursor_y = ${cursorY || 0}
            WHERE id = ${userId}
          `;

          return new Response(JSON.stringify({ success: true }), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        }
        break;

      case 'get-session-users':
        const users = await sql`
          SELECT * FROM session_users 
          WHERE session_id = ${sessionId} 
          AND last_seen > NOW() - INTERVAL '5 minutes'
          ORDER BY created_at ASC
        `;
        return new Response(JSON.stringify(users), { 
          headers: { ...headers, 'Content-Type': 'application/json' } 
        });

      // Real-time sync
      case 'get-updates':
        const since = url.searchParams.get('since') || '1970-01-01';
        const updates = await sql`
          SELECT * FROM session_updates 
          WHERE session_id = ${sessionId} 
          AND created_at > ${since}
          AND updated_by != ${userId}
          ORDER BY created_at ASC
          LIMIT 50
        `;
        return new Response(JSON.stringify(updates), { 
          headers: { ...headers, 'Content-Type': 'application/json' } 
        });

      case 'save-image':
        if (request.method === 'POST') {
          const { imageData, imageType, name } = await request.json();
          const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          const mimeMatch = imageData.match(/data:([^;]+);/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
          const sizeBytes = Math.round((imageData.length * 3) / 4);
          
          await sql`
            INSERT INTO images (id, session_id, name, type, data, mime_type, size_bytes, updated_at)
            VALUES (${imageId}, ${sessionId}, ${name}, ${imageType}, ${imageData}, ${mimeType}, ${sizeBytes}, NOW())
          `;
          
          return new Response(JSON.stringify({ imageId }), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        }
        break;

      case 'get-image':
        const imageId = url.searchParams.get('imageId');
        if (imageId) {
          const [image] = await sql`SELECT * FROM images WHERE id = ${imageId}`;
          return new Response(JSON.stringify(image ? { data: image.data } : null), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        }
        break;

      case 'save-character':
        if (request.method === 'POST') {
          const character = await request.json();
          await sql`
            INSERT INTO characters (id, session_id, name, data, updated_at, updated_by)
            VALUES (${character.id}, ${sessionId}, ${character.name}, ${JSON.stringify(character)}, NOW(), ${userId})
            ON CONFLICT (id) 
            DO UPDATE SET 
              name = ${character.name},
              data = ${JSON.stringify(character)},
              updated_at = NOW(),
              updated_by = ${userId}
          `;

          // Add session update for real-time sync
          await sql`
            INSERT INTO session_updates (session_id, update_type, data, updated_by)
            VALUES (${sessionId}, 'character_updated', ${JSON.stringify(character)}, ${userId})
          `;
          
          return new Response(JSON.stringify({ success: true }), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        }
        break;

      case 'load-characters':
        const characters = await sql`
          SELECT * FROM characters 
          WHERE session_id = ${sessionId}
          ORDER BY updated_at DESC
        `;
        return new Response(JSON.stringify(characters.map(row => row.data)), { 
          headers: { ...headers, 'Content-Type': 'application/json' } 
        });

      case 'delete-character':
        if (request.method === 'DELETE') {
          const characterId = url.searchParams.get('characterId');
          await sql`DELETE FROM characters WHERE id = ${characterId} AND session_id = ${sessionId}`;
          
          // Add session update
          await sql`
            INSERT INTO session_updates (session_id, update_type, data, updated_by)
            VALUES (${sessionId}, 'character_deleted', ${JSON.stringify({ characterId })}, ${userId})
          `;
          
          return new Response(JSON.stringify({ success: true }), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        }
        break;

      case 'save-game-state':
        if (request.method === 'POST') {
          const gameState = await request.json();
          await sql`
            INSERT INTO game_sessions (id, name, data, updated_at, updated_by)
            VALUES (${sessionId}, ${gameState.name || 'Game Session'}, ${JSON.stringify(gameState)}, NOW(), ${userId})
            ON CONFLICT (id) 
            DO UPDATE SET 
              data = ${JSON.stringify(gameState)},
              updated_at = NOW(),
              updated_by = ${userId}
          `;

          // Add session update
          await sql`
            INSERT INTO session_updates (session_id, update_type, data, updated_by)
            VALUES (${sessionId}, 'game_state_updated', ${JSON.stringify({ terrain: gameState.terrain, gridSize: gameState.gridSize })}, ${userId})
          `;
          
          return new Response(JSON.stringify({ success: true }), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        }
        break;

      case 'load-game-state':
        const [gameSession] = await sql`
          SELECT * FROM game_sessions WHERE id = ${sessionId}
        `;
        return new Response(JSON.stringify(gameSession ? gameSession.data : null), { 
          headers: { ...headers, 'Content-Type': 'application/json' } 
        });

      // Cleanup old session updates (called periodically)
      case 'cleanup':
        await sql`
          DELETE FROM session_updates 
          WHERE created_at < NOW() - INTERVAL '1 hour'
        `;
        await sql`
          DELETE FROM session_users 
          WHERE last_seen < NOW() - INTERVAL '10 minutes'
        `;
        return new Response(JSON.stringify({ success: true }), { 
          headers: { ...headers, 'Content-Type': 'application/json' } 
        });

      default:
        console.error('❌ Unknown operation:', operation);
        return new Response(JSON.stringify({ 
          error: `Unknown operation: ${operation}`,
          availableOperations: ['health', 'stats', 'join-session', 'leave-session']
        }), { 
          status: 400, 
          headers: { ...headers, 'Content-Type': 'application/json' } 
        });
    }

  } catch (error) {
    console.error('💥 Database function error:', error);
    
    // More detailed error information
    const errorResponse = {
      error: error.message,
      healthy: false,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(errorResponse), { 
      status: 500, 
      headers: { ...headers, 'Content-Type': 'application/json' } 
    });
  }
};
