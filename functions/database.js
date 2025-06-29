// functions/database.js - VERSION WITH CLEAN RESET
import { neon } from '@neondatabase/serverless';

// FIXED: Explicit environment variable handling
const getDatabaseUrl = () => {
  const url = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
  console.log('🔍 Database URL check:', {
    NETLIFY_DATABASE_URL: process.env.NETLIFY_DATABASE_URL ? 'SET' : 'NOT SET',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    hasUrl: !!url
  });
  return url;
};

// Initialize database tables with CLEAN RESET
const initDatabase = async () => {
  let sql;
  try {
    console.log('🔧 Initializing database tables with clean reset...');
    
    const databaseUrl = getDatabaseUrl();
    if (!databaseUrl) {
      throw new Error('No database URL found in environment variables');
    }
    
    // FIXED: Pass URL explicitly to neon()
    sql = neon(databaseUrl);
    
    // STEP 1: Drop existing tables to start fresh
    console.log('🗑️ Dropping existing tables...');
    try {
      await sql`DROP TABLE IF EXISTS session_updates CASCADE`;
      await sql`DROP TABLE IF EXISTS session_users CASCADE`;
      await sql`DROP TABLE IF EXISTS characters CASCADE`;
      await sql`DROP TABLE IF EXISTS images CASCADE`;
      await sql`DROP TABLE IF EXISTS game_sessions CASCADE`;
      console.log('✅ Old tables dropped');
    } catch (dropError) {
      console.log('ℹ️ Some tables may not have existed:', dropError.message);
    }
    
    // STEP 2: Create tables with correct schema
    console.log('📋 Creating characters table...');
    await sql`
      CREATE TABLE characters (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL DEFAULT 'default',
        name TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_by TEXT DEFAULT 'system'
      )
    `;
    console.log('✅ Characters table created');

    console.log('📋 Creating images table...');
    await sql`
      CREATE TABLE images (
        id TEXT PRIMARY KEY,
        session_id TEXT DEFAULT 'default',
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        data TEXT NOT NULL,
        mime_type TEXT DEFAULT 'image/png',
        size_bytes INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Images table created');

    console.log('📋 Creating game_sessions table...');
    await sql`
      CREATE TABLE game_sessions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_by TEXT DEFAULT 'system'
      )
    `;
    console.log('✅ Game sessions table created');

    console.log('📋 Creating session_users table...');
    await sql`
      CREATE TABLE session_users (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        user_color TEXT DEFAULT '#6366f1',
        last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_dm BOOLEAN DEFAULT false,
        cursor_x INTEGER DEFAULT 0,
        cursor_y INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Session users table created');

    console.log('📋 Creating session_updates table...');
    await sql`
      CREATE TABLE session_updates (
        id SERIAL PRIMARY KEY,
        session_id TEXT NOT NULL,
        update_type TEXT NOT NULL,
        data JSONB NOT NULL,
        updated_by TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Session updates table created');

    // STEP 3: Create indexes for better performance
    console.log('📋 Creating indexes...');
    await sql`CREATE INDEX idx_characters_session ON characters(session_id)`;
    await sql`CREATE INDEX idx_session_users_session ON session_users(session_id)`;
    await sql`CREATE INDEX idx_session_updates_session ON session_updates(session_id, created_at DESC)`;
    console.log('✅ Database indexes created');

    console.log('🎉 Database initialization completed successfully!');
    return { success: true, sql };
  } catch (error) {
    console.error('💥 Database initialization error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return { success: false, error: error.message, details: error };
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
    
    console.log(`📨 Database function called: ${operation} for session: ${sessionId}, user: ${userId}`);
    
    // Initialize database with clean reset
    const initResult = await initDatabase();
    if (!initResult.success) {
      console.error('❌ Database initialization failed:', initResult.error);
      return new Response(JSON.stringify({
        error: `Database initialization failed: ${initResult.error}`,
        healthy: false,
        details: initResult.details
      }), { 
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' } 
      });
    }

    // Get the sql instance
    const sql = initResult.sql;

    switch (operation) {
      case 'health':
        console.log('🏥 Health check requested');
        try {
          const [result] = await sql`SELECT CURRENT_TIMESTAMP as current_time`;
          const healthResponse = {
            healthy: true,
            timestamp: result.current_time,
            message: 'Database connection successful'
          };
          console.log('✅ Health check passed:', healthResponse);
          return new Response(JSON.stringify(healthResponse), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        } catch (healthError) {
          console.error('💥 Health check failed:', healthError);
          return new Response(JSON.stringify({
            healthy: false,
            error: healthError.message,
            timestamp: new Date().toISOString()
          }), { 
            status: 500,
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        }

      case 'test':
        console.log('🧪 Testing database connection...');
        try {
          const testQuery = await sql`SELECT CURRENT_TIMESTAMP as test_time, version() as postgres_version`;
          console.log('✅ Database test successful:', testQuery[0]);
          
          // Test table access
          const tableTest = await sql`SELECT COUNT(*) as count FROM characters`;
          console.log('✅ Table access test successful:', tableTest[0]);
          
          return new Response(JSON.stringify({
            success: true,
            result: testQuery[0],
            tableTest: tableTest[0],
            message: 'Database connection and tables working!',
            environment: {
              NETLIFY_DATABASE_URL: !!process.env.NETLIFY_DATABASE_URL,
              DATABASE_URL: !!process.env.DATABASE_URL
            }
          }), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        } catch (error) {
          console.error('💥 Database test failed:', error);
          return new Response(JSON.stringify({
            success: false,
            error: error.message,
            stack: error.stack,
            environment: {
              NETLIFY_DATABASE_URL: !!process.env.NETLIFY_DATABASE_URL,
              DATABASE_URL: !!process.env.DATABASE_URL
            }
          }), { 
            status: 500,
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        }

      case 'stats':
        console.log('📊 Stats requested for session:', sessionId);
        try {
          const [charCount] = await sql`SELECT COUNT(*) as count FROM characters WHERE session_id = ${sessionId}`;
          const [imageCount] = await sql`SELECT COUNT(*) as count FROM images WHERE session_id = ${sessionId}`;
          const [userCount] = await sql`SELECT COUNT(*) as count FROM session_users WHERE session_id = ${sessionId} AND last_seen > CURRENT_TIMESTAMP - INTERVAL '5 minutes'`;
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
        } catch (statsError) {
          console.error('💥 Stats error:', statsError);
          return new Response(JSON.stringify({
            characters: 0,
            images: 0,
            activeUsers: 0,
            sessionId,
            error: statsError.message
          }), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        }

      case 'join-session':
        if (request.method === 'POST') {
          console.log('👥 User joining session:', { sessionId, userId });
          
          let requestBody;
          try {
            const bodyText = await request.text();
            console.log('📄 Raw request body:', bodyText);
            requestBody = JSON.parse(bodyText);
          } catch (error) {
            console.error('❌ Failed to parse request body:', error);
            return new Response(JSON.stringify({
              error: 'Invalid request body',
              success: false
            }), { 
              status: 400,
              headers: { ...headers, 'Content-Type': 'application/json' } 
            });
          }
          
          const { userName, userColor, isDM } = requestBody;
          console.log('📝 User data:', { userName, userColor, isDM });
          
          // Validate required fields
          if (!userName || !userColor) {
            console.error('❌ Missing required fields:', { userName, userColor });
            return new Response(JSON.stringify({
              error: 'Missing userName or userColor',
              success: false
            }), { 
              status: 400,
              headers: { ...headers, 'Content-Type': 'application/json' } 
            });
          }
          
          try {
            // Simple upsert using INSERT ... ON CONFLICT
            await sql`
              INSERT INTO session_users (id, session_id, user_name, user_color, is_dm, last_seen)
              VALUES (${userId}, ${sessionId}, ${userName}, ${userColor}, ${isDM || false}, CURRENT_TIMESTAMP)
              ON CONFLICT (id) DO UPDATE SET
                session_id = EXCLUDED.session_id,
                user_name = EXCLUDED.user_name,
                user_color = EXCLUDED.user_color,
                is_dm = EXCLUDED.is_dm,
                last_seen = EXCLUDED.last_seen
            `;
            console.log('✅ User added to session_users table');

            // Add session update
            const updateData = { 
              userName: userName, 
              userColor: userColor, 
              isDM: isDM || false,
              userId: userId
            };
            
            await sql`
              INSERT INTO session_updates (session_id, update_type, data, updated_by)
              VALUES (${sessionId}, 'user_joined', ${JSON.stringify(updateData)}, ${userId})
            `;
            console.log('✅ Session update recorded');

            const successResponse = { 
              success: true, 
              message: 'Successfully joined session',
              sessionId: sessionId,
              userId: userId
            };
            console.log('🎉 Join session successful:', successResponse);
            return new Response(JSON.stringify(successResponse), { 
              headers: { ...headers, 'Content-Type': 'application/json' } 
            });
          } catch (dbError) {
            console.error('💥 Database error in join-session:', dbError);
            return new Response(JSON.stringify({
              error: 'Database error while joining session',
              success: false,
              details: dbError.message
            }), { 
              status: 500,
              headers: { ...headers, 'Content-Type': 'application/json' } 
            });
          }
        }
        break;

      case 'leave-session':
        if (request.method === 'POST') {
          console.log('👋 User leaving session:', { sessionId, userId });
          
          try {
            await sql`DELETE FROM session_users WHERE id = ${userId} AND session_id = ${sessionId}`;
            
            // Add session update
            const updateData = { userId: userId };
            await sql`
              INSERT INTO session_updates (session_id, update_type, data, updated_by)
              VALUES (${sessionId}, 'user_left', ${JSON.stringify(updateData)}, ${userId})
            `;

            const successResponse = { 
              success: true, 
              message: 'Successfully left session',
              sessionId: sessionId,
              userId: userId
            };
            console.log('✅ Leave session successful:', successResponse);
            return new Response(JSON.stringify(successResponse), { 
              headers: { ...headers, 'Content-Type': 'application/json' } 
            });
          } catch (dbError) {
            console.error('💥 Database error in leave-session:', dbError);
            return new Response(JSON.stringify({
              error: 'Database error while leaving session',
              success: false,
              details: dbError.message
            }), { 
              status: 500,
              headers: { ...headers, 'Content-Type': 'application/json' } 
            });
          }
        }
        break;

      case 'heartbeat':
        if (request.method === 'POST') {
          try {
            const bodyText = await request.text();
            const { cursorX, cursorY } = bodyText ? JSON.parse(bodyText) : {};
            
            await sql`
              UPDATE session_users 
              SET last_seen = CURRENT_TIMESTAMP, cursor_x = ${cursorX || 0}, cursor_y = ${cursorY || 0}
              WHERE id = ${userId} AND session_id = ${sessionId}
            `;

            return new Response(JSON.stringify({ success: true }), { 
              headers: { ...headers, 'Content-Type': 'application/json' } 
            });
          } catch (error) {
            console.error('💥 Heartbeat error:', error);
            return new Response(JSON.stringify({ 
              success: false, 
              error: error.message 
            }), { 
              headers: { ...headers, 'Content-Type': 'application/json' } 
            });
          }
        }
        break;

      case 'get-session-users':
        try {
          const users = await sql`
            SELECT * FROM session_users 
            WHERE session_id = ${sessionId} 
            AND last_seen > CURRENT_TIMESTAMP - INTERVAL '5 minutes'
            ORDER BY created_at ASC
          `;
          console.log(`📋 Found ${users.length} active users in session ${sessionId}`);
          return new Response(JSON.stringify(users), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        } catch (error) {
          console.error('💥 Error getting session users:', error);
          return new Response(JSON.stringify([]), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        }

      case 'get-updates':
        try {
          const since = url.searchParams.get('since') || '1970-01-01';
          console.log(`🔄 Getting updates since ${since} for session ${sessionId}, excluding user ${userId}`);
          
          const updates = await sql`
            SELECT * FROM session_updates 
            WHERE session_id = ${sessionId} 
            AND created_at > ${since}::timestamp
            AND updated_by != ${userId}
            ORDER BY created_at ASC
            LIMIT 50
          `;
          
          console.log(`📦 Found ${updates.length} updates for session ${sessionId}`);
          
          // Filter out any null data before sending
          const validUpdates = updates.filter(update => 
            update && update.data && update.update_type && update.updated_by
          );
          
          console.log(`✅ Sending ${validUpdates.length} valid updates`);
          return new Response(JSON.stringify(validUpdates), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        } catch (error) {
          console.error('💥 Error getting updates:', error);
          return new Response(JSON.stringify([]), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        }

      case 'save-character':
        if (request.method === 'POST') {
          try {
            const bodyText = await request.text();
            const character = JSON.parse(bodyText);
            
            if (!character || !character.id || !character.name) {
              console.error('❌ Invalid character data:', character);
              return new Response(JSON.stringify({ 
                success: false, 
                error: 'Invalid character data' 
              }), { 
                status: 400,
                headers: { ...headers, 'Content-Type': 'application/json' } 
              });
            }
            
            // Use upsert with ON CONFLICT
            await sql`
              INSERT INTO characters (id, session_id, name, data, updated_at, updated_by)
              VALUES (${character.id}, ${sessionId}, ${character.name}, ${JSON.stringify(character)}, CURRENT_TIMESTAMP, ${userId})
              ON CONFLICT (id) DO UPDATE SET
                session_id = EXCLUDED.session_id,
                name = EXCLUDED.name,
                data = EXCLUDED.data,
                updated_at = EXCLUDED.updated_at,
                updated_by = EXCLUDED.updated_by
            `;

            // Add session update for real-time sync
            await sql`
              INSERT INTO session_updates (session_id, update_type, data, updated_by)
              VALUES (${sessionId}, 'character_updated', ${JSON.stringify(character)}, ${userId})
            `;
            
            console.log(`✅ Character saved: ${character.name} (${character.id})`);
            return new Response(JSON.stringify({ success: true }), { 
              headers: { ...headers, 'Content-Type': 'application/json' } 
            });
          } catch (error) {
            console.error('💥 Error saving character:', error);
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Failed to save character',
              details: error.message 
            }), { 
              status: 500,
              headers: { ...headers, 'Content-Type': 'application/json' } 
            });
          }
        }
        break;

      case 'load-characters':
        try {
          const characters = await sql`
            SELECT * FROM characters 
            WHERE session_id = ${sessionId}
            ORDER BY updated_at DESC
          `;
          
          const characterData = characters.map(row => {
            try {
              return row.data;
            } catch (error) {
              console.error('Error parsing character data:', error);
              return null;
            }
          }).filter(char => char !== null);
          
          console.log(`📋 Loaded ${characterData.length} characters for session ${sessionId}`);
          return new Response(JSON.stringify(characterData), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        } catch (error) {
          console.error('💥 Error loading characters:', error);
          return new Response(JSON.stringify([]), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        }

      case 'delete-character':
        if (request.method === 'DELETE') {
          try {
            const characterId = url.searchParams.get('characterId');
            if (!characterId) {
              return new Response(JSON.stringify({ 
                success: false, 
                error: 'Missing characterId' 
              }), { 
                status: 400,
                headers: { ...headers, 'Content-Type': 'application/json' } 
              });
            }
            
            await sql`DELETE FROM characters WHERE id = ${characterId} AND session_id = ${sessionId}`;
            
            // Add session update
            await sql`
              INSERT INTO session_updates (session_id, update_type, data, updated_by)
              VALUES (${sessionId}, 'character_deleted', ${JSON.stringify({ characterId })}, ${userId})
            `;
            
            console.log(`🗑️ Character deleted: ${characterId}`);
            return new Response(JSON.stringify({ success: true }), { 
              headers: { ...headers, 'Content-Type': 'application/json' } 
            });
          } catch (error) {
            console.error('💥 Error deleting character:', error);
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Failed to delete character',
              details: error.message 
            }), { 
              status: 500,
              headers: { ...headers, 'Content-Type': 'application/json' } 
            });
          }
        }
        break;

      case 'save-game-state':
        if (request.method === 'POST') {
          try {
            const bodyText = await request.text();
            const gameState = JSON.parse(bodyText);
            
            if (!gameState) {
              return new Response(JSON.stringify({ 
                success: false, 
                error: 'Missing game state data' 
              }), { 
                status: 400,
                headers: { ...headers, 'Content-Type': 'application/json' } 
              });
            }
            
            // Use upsert with ON CONFLICT
            await sql`
              INSERT INTO game_sessions (id, name, data, updated_at, updated_by)
              VALUES (${sessionId}, ${gameState.name || 'Game Session'}, ${JSON.stringify(gameState)}, CURRENT_TIMESTAMP, ${userId})
              ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                data = EXCLUDED.data,
                updated_at = EXCLUDED.updated_at,
                updated_by = EXCLUDED.updated_by
            `;

            // Add session update for terrain/grid changes only
            if (gameState.terrain !== undefined || gameState.gridSize !== undefined) {
              const updateData = {};
              if (gameState.terrain !== undefined) updateData.terrain = gameState.terrain;
              if (gameState.gridSize !== undefined) updateData.gridSize = gameState.gridSize;
              
              await sql`
                INSERT INTO session_updates (session_id, update_type, data, updated_by)
                VALUES (${sessionId}, 'game_state_updated', ${JSON.stringify(updateData)}, ${userId})
              `;
            }
            
            console.log(`✅ Game state saved for session: ${sessionId}`);
            return new Response(JSON.stringify({ success: true }), { 
              headers: { ...headers, 'Content-Type': 'application/json' } 
            });
          } catch (error) {
            console.error('💥 Error saving game state:', error);
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Failed to save game state',
              details: error.message 
            }), { 
              status: 500,
              headers: { ...headers, 'Content-Type': 'application/json' } 
            });
          }
        }
        break;

      case 'load-game-state':
        try {
          const [gameSession] = await sql`
            SELECT * FROM game_sessions WHERE id = ${sessionId}
          `;
          
          const gameData = gameSession ? gameSession.data : null;
          console.log(`📋 Loaded game state for session ${sessionId}:`, gameData ? 'Found' : 'Not found');
          
          return new Response(JSON.stringify(gameData), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        } catch (error) {
          console.error('💥 Error loading game state:', error);
          return new Response(JSON.stringify(null), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        }

      case 'save-image':
        if (request.method === 'POST') {
          try {
            const bodyText = await request.text();
            const { imageData, imageType, name } = JSON.parse(bodyText);
            
            if (!imageData || !name) {
              return new Response(JSON.stringify({ 
                error: 'Missing imageData or name' 
              }), { 
                status: 400,
                headers: { ...headers, 'Content-Type': 'application/json' } 
              });
            }
            
            const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const mimeMatch = imageData.match(/data:([^;]+);/);
            const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
            const sizeBytes = Math.round((imageData.length * 3) / 4);
            
            await sql`
              INSERT INTO images (id, session_id, name, type, data, mime_type, size_bytes, updated_at)
              VALUES (${imageId}, ${sessionId}, ${name}, ${imageType || 'sprite'}, ${imageData}, ${mimeType}, ${sizeBytes}, CURRENT_TIMESTAMP)
            `;
            
            console.log(`✅ Image saved: ${imageId}`);
            return new Response(JSON.stringify({ imageId }), { 
              headers: { ...headers, 'Content-Type': 'application/json' } 
            });
          } catch (error) {
            console.error('💥 Error saving image:', error);
            return new Response(JSON.stringify({ 
              error: 'Failed to save image', 
              details: error.message 
            }), { 
              status: 500,
              headers: { ...headers, 'Content-Type': 'application/json' } 
            });
          }
        }
        break;

      case 'get-image':
        try {
          const imageId = url.searchParams.get('imageId');
          if (!imageId) {
            return new Response(JSON.stringify({ data: null }), { 
              headers: { ...headers, 'Content-Type': 'application/json' } 
            });
          }
          
          const [image] = await sql`SELECT * FROM images WHERE id = ${imageId}`;
          return new Response(JSON.stringify(image ? { data: image.data } : { data: null }), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        } catch (error) {
          console.error('💥 Error getting image:', error);
          return new Response(JSON.stringify({ data: null }), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        }

      case 'cleanup':
        try {
          await sql`
            DELETE FROM session_updates 
            WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 hour'
          `;
          await sql`
            DELETE FROM session_users 
            WHERE last_seen < CURRENT_TIMESTAMP - INTERVAL '10 minutes'
          `;
          
          console.log('🧹 Cleanup completed');
          return new Response(JSON.stringify({ success: true }), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        } catch (error) {
          console.error('💥 Cleanup error:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message 
          }), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        }

      default:
        console.error('❌ Unknown operation:', operation);
        return new Response(JSON.stringify({ 
          error: `Unknown operation: ${operation}`,
          availableOperations: [
            'health', 'stats', 'join-session', 'leave-session', 'heartbeat',
            'get-session-users', 'get-updates', 'save-character', 'load-characters',
            'delete-character', 'save-game-state', 'load-game-state', 'save-image',
            'get-image', 'cleanup', 'test'
          ]
        }), { 
          status: 400, 
          headers: { ...headers, 'Content-Type': 'application/json' } 
        });
    }

  } catch (error) {
    console.error('💥 Database function error:', error);
    
    const errorResponse = {
      error: error.message,
      healthy: false,
      operation: url.searchParams.get('operation'),
      sessionId: url.searchParams.get('sessionId'),
      userId: url.searchParams.get('userId'),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      environment: {
        NETLIFY_DATABASE_URL: !!process.env.NETLIFY_DATABASE_URL,
        DATABASE_URL: !!process.env.DATABASE_URL
      }
    };
    
    return new Response(JSON.stringify(errorResponse), { 
      status: 500, 
      headers: { ...headers, 'Content-Type': 'application/json' } 
    });
  }
};
