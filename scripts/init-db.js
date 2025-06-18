// scripts/init-db.js - Database initialization script
import { initDatabase, checkDatabaseHealth, getDatabaseStats } from '../src/utils/database.js';

async function initializeDatabase() {
  console.log('🚀 Initializing RPG Battle Tool Database...');
  
  try {
    // Check if database is accessible
    console.log('📡 Checking database connection...');
    const health = await checkDatabaseHealth();
    
    if (!health.healthy) {
      console.error('❌ Database connection failed:', health.error);
      process.exit(1);
    }
    
    console.log('✅ Database connection successful');
    console.log('📅 Server time:', health.timestamp);
    
    // Initialize database tables
    console.log('🔧 Creating database tables...');
    const success = await initDatabase();
    
    if (!success) {
      console.error('❌ Database initialization failed');
      process.exit(1);
    }
    
    console.log('✅ Database tables created successfully');
    
    // Get database stats
    console.log('📊 Getting database statistics...');
    const stats = await getDatabaseStats();
    
    if (stats) {
      console.log('📈 Database Statistics:');
      console.log(`   Characters: ${stats.characters}`);
      console.log(`   Images: ${stats.images}`);
      console.log(`   Chat Messages: ${stats.chatMessages}`);
      console.log(`   Combat Messages: ${stats.combatMessages}`);
    }
    
    console.log('🎉 Database initialization complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run "npm run dev" to start development server');
    console.log('2. Upload sprites and portraits - they will be saved to the database');
    console.log('3. Create characters - they will be automatically synced to the cloud');
    
  } catch (error) {
    console.error('💥 Database initialization error:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();
