const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

async function setupTestDatabase() {
  try {
    console.log('Setting up test database...');
    
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    console.log(`Test MongoDB instance started at: ${mongoUri}`);
    
    await mongoose.connect(mongoUri);
    console.log('Connected to test database successfully');
    
    // Create some test data if needed
    console.log('Test database setup completed');
    
    await mongoose.disconnect();
    await mongoServer.stop();
    
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  setupTestDatabase();
}

module.exports = setupTestDatabase;