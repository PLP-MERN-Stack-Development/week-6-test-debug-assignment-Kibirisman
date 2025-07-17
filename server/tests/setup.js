const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Setup in-memory MongoDB server before all tests
beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri);

    console.log('Test database connected successfully');
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  }
});

// Clean up database between tests
afterEach(async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error('Error cleaning up test database:', error);
  }
});

// Close database connection after all tests
afterAll(async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
    console.log('Test database disconnected successfully');
  } catch (error) {
    console.error('Error tearing down test database:', error);
  }
});

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';

// Suppress console output during tests (but keep for debugging)
// if (process.env.NODE_ENV === 'test') {
//   console.log = () => {};
//   console.warn = () => {};
//   console.error = () => {};
// }