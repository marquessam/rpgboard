// netlify/functions/database.js - Server-side database API
import { neon } from '@netlify/neon';

const sql = neon(); // This will work on the server-side with NETLIFY_DATABASE_URL

// Initialize database tables
const initDatabase = async () => {
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
        type VARCHAR NOT NULL,
        data TEXT NOT NULL,
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

    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
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
    
    // Initialize database if needed
    await initDatabase();

    switch (operation) {
      case 'health':
        const [result] = await sql`SELECT NOW() as current_time`;
        return new Response(JSON.stringify({
          healthy: true,
          timestamp: result.current_time
        }), { headers: { ...headers, 'Content-Type': 'application/json' } });

      case 'stats':
        const [charCount] = await sql`SELECT COUNT(*) as count FROM characters`;
        const [imageCount] = await sql`SELECT COUNT(*) as count FROM images`;
        const stats = {
          characters: parseInt(charCount.count),
          images: parseInt(imageCount.count),
          chatMessages: 0,
          combatMessages: 0
        };
        return new Response(JSON.stringify(stats), { 
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
            INSERT INTO images (id, name, type, data, mime_type, size_bytes, updated_at)
            VALUES (${imageId}, ${name}, ${imageType}, ${imageData}, ${mimeType}, ${sizeBytes}, NOW())
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
            INSERT INTO characters (id, name, data, updated_at)
            VALUES (${character.id}, ${character.name}, ${JSON.stringify(character)}, NOW())
            ON CONFLICT (id) 
            DO UPDATE SET 
              name = ${character.name},
              data = ${JSON.stringify(character)},
              updated_at = NOW()
          `;
          return new Response(JSON.stringify({ success: true }), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        }
        break;

      case 'load-characters':
        const characters = await sql`SELECT * FROM characters ORDER BY updated_at DESC`;
        return new Response(JSON.stringify(characters.map(row => row.data)), { 
          headers: { ...headers, 'Content-Type': 'application/json' } 
        });

      case 'delete-character':
        if (request.method === 'DELETE') {
          const characterId = url.searchParams.get('characterId');
          await sql`DELETE FROM characters WHERE id = ${characterId}`;
          return new Response(JSON.stringify({ success: true }), { 
            headers: { ...headers, 'Content-Type': 'application/json' } 
          });
        }
        break;

      default:
        return new Response(JSON.stringify({ error: 'Unknown operation' }), { 
          status: 400, 
          headers: { ...headers, 'Content-Type': 'application/json' } 
        });
    }

  } catch (error) {
    console.error('Database function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      healthy: false 
    }), { 
      status: 500, 
      headers: { ...headers, 'Content-Type': 'application/json' } 
    });
  }
};
