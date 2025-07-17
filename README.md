# MERN Bug Tracker - Testing and Debugging Assignment

A comprehensive bug tracking application built with the MERN stack, featuring extensive testing strategies and debugging tools to ensure application reliability.

## 🏗️ Project Structure

```
mern-bug-tracker/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components for routing
│   │   ├── services/       # API service layer
│   │   ├── utils/          # Utility functions and debugging tools
│   │   └── tests/          # Frontend test files
│   │       ├── unit/       # Unit tests for components
│   │       └── __mocks__/  # Mock files for testing
│   └── package.json
├── server/                 # Express.js backend application
│   ├── src/
│   │   ├── config/         # Database and logger configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions and validation
│   ├── tests/              # Backend test files
│   │   ├── unit/           # Unit tests for models and utilities
│   │   ├── integration/    # API integration tests
│   │   └── setup.js        # Test environment setup
│   └── package.json
├── jest.config.js          # Jest configuration for the entire project
└── README.md
```

## 🚀 Features

### Core Functionality
- **Bug Reporting**: Create detailed bug reports with title, description, priority, and steps to reproduce
- **Bug Management**: View, edit, delete, assign, and resolve bugs
- **Advanced Filtering**: Filter bugs by status, priority, category, assignee, and search functionality
- **Bug Statistics**: Dashboard with comprehensive bug metrics and analytics
- **Responsive Design**: Mobile-friendly interface with modern UI components

### Testing & Quality Assurance
- **Unit Testing**: Comprehensive unit tests for components, models, and utility functions
- **Integration Testing**: API endpoint testing with real database operations
- **Code Coverage**: Targeted 70%+ code coverage across all modules
- **Error Boundaries**: React error boundaries for graceful error handling
- **Input Validation**: Robust server-side and client-side validation

### Debugging & Monitoring
- **Debug Panel**: Interactive debugging panel with real-time log monitoring
- **Performance Monitoring**: Request timing and memory usage tracking
- **Error Logging**: Comprehensive error logging with context and stack traces
- **Intentional Bugs**: Demonstration bugs for debugging practice
- **Development Tools**: Debug mode with detailed API request/response logging

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (MongoDB Atlas)
- **Mongoose** - ODM for MongoDB
- **Jest** - Testing framework
- **Supertest** - HTTP assertions for API testing
- **Winston** - Logging library
- **Express-validator** - Input validation

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **React Testing Library** - Component testing
- **React Toastify** - Notifications

### Testing & Development Tools
- **Jest** - JavaScript testing framework
- **MongoDB Memory Server** - In-memory MongoDB for testing
- **Supertest** - API testing
- **React Testing Library** - React component testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (credentials provided)

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd week-6-test-debug-assignment-Kibirisman
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install all dependencies (client and server)
   npm run install-all
   ```

3. **Environment Setup**
   
   Copy the `.env.example` file to `.env` and update with your MongoDB Atlas credentials:
   ```bash
   cp server/.env.example server/.env
   ```
   
   Then update the `.env` file with your actual database credentials:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bug-tracker?retryWrites=true&w=majority&appName=Cluster0
   MONGODB_TEST_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bug-tracker-test?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRE=7d
   ```

4. **Start the application**
   ```bash
   # Start both client and server concurrently
   npm run dev
   
   # Or start individually:
   npm run server  # Start backend server (port 5000)
   npm run client  # Start frontend client (port 3000)
   ```

## 🧪 Testing Strategy

### Unit Testing

#### Backend Unit Tests
- **Model Tests**: Mongoose model validation, virtuals, and instance methods
- **Validation Tests**: Input validation rules and error handling
- **Utility Tests**: Helper functions and debugging utilities

#### Frontend Unit Tests
- **Component Tests**: React component rendering and user interactions
- **Hook Tests**: Custom React hooks and state management
- **Utility Tests**: Client-side utility functions and API helpers

### Integration Testing

#### API Integration Tests
- **CRUD Operations**: Complete testing of all bug management endpoints
- **Authentication**: User authentication and authorization flows
- **Error Handling**: API error responses and edge cases
- **Database Operations**: Real database interactions with test data

### Running Tests

```bash
# Run all tests
npm test

# Run server tests only
npm run test:server

# Run client tests only
npm run test:client

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests with coverage
npm run test:coverage
```

### Coverage Goals

Our testing strategy targets:
- **Statements**: 70%+
- **Branches**: 60%+
- **Functions**: 70%+
- **Lines**: 70%+

## 🐛 Debugging Features

### Development Debug Tools

#### Backend Debugging
- **Request Debugging**: Detailed logging of all HTTP requests and responses
- **Performance Monitoring**: Request timing and memory usage tracking
- **Error Debugging**: Comprehensive error logging with context
- **Database Query Logging**: MongoDB query logging and performance metrics

#### Frontend Debugging
- **Debug Panel**: Interactive debugging panel with real-time logs
- **Performance Monitoring**: Component render timing and optimization hints
- **Error Boundaries**: Graceful error handling with detailed error information
- **API Request Monitoring**: Detailed logging of API calls and responses

### Debug Mode Activation

#### Frontend Debug Mode
```javascript
// Enable debug mode
localStorage.setItem('debugMode', 'true');

// Or use keyboard shortcut: Ctrl+Shift+D
// Or click the debug button in development mode
```

#### Backend Debug Mode
```bash
# Add debug query parameter to API requests
GET /api/bugs?debug=true

# Demonstrate intentional bugs for debugging practice
GET /api/bugs?demonstrateBugs=true
```

### Intentional Bugs for Learning

The application includes intentional bugs for debugging practice:

1. **Null Reference Errors**: Accessing properties of null objects
2. **Array Index Errors**: Accessing array elements out of bounds
3. **Async Error Handling**: Unhandled promise rejections
4. **Validation Errors**: Input validation edge cases
5. **Memory Leaks**: Performance issues demonstration

## 📊 Code Coverage Reports

Generate and view code coverage reports:

```bash
# Generate coverage reports for both client and server
npm run test:coverage

# Coverage reports will be generated in:
# - server/coverage/ (Backend coverage)
# - client/coverage/ (Frontend coverage)
```

Coverage reports include:
- **HTML Reports**: Interactive coverage visualization
- **JSON Reports**: Machine-readable coverage data
- **LCOV Reports**: Integration with code coverage tools
- **Text Reports**: Console-friendly coverage summaries

## 🔍 Error Handling

### Backend Error Handling
- **Global Error Handler**: Catches and logs all unhandled errors
- **Validation Errors**: Comprehensive input validation with detailed error messages
- **Database Errors**: MongoDB operation error handling
- **Authentication Errors**: JWT and authentication error management

### Frontend Error Handling
- **Error Boundaries**: React error boundaries for component error isolation
- **API Error Handling**: Axios interceptors for API error management
- **Form Validation**: Real-time form validation with user-friendly error messages
- **Global Error Handler**: Window-level error and unhandled rejection handling

## 📱 API Documentation

### Base URL
```
Development: http://localhost:5000/api
```

### Endpoints

#### Health Check
```
GET /api/health
```

#### Bugs
```
GET    /api/bugs           # Get all bugs (with filtering and pagination)
GET    /api/bugs/stats     # Get bug statistics
GET    /api/bugs/:id       # Get single bug
POST   /api/bugs           # Create new bug
PUT    /api/bugs/:id       # Update bug
DELETE /api/bugs/:id       # Delete bug
PUT    /api/bugs/:id/assign   # Assign bug to user
PUT    /api/bugs/:id/resolve  # Resolve bug
```

### Query Parameters for GET /api/bugs
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `status`: Filter by status (open, in-progress, resolved, closed)
- `priority`: Filter by priority (low, medium, high, critical)
- `category`: Filter by category (frontend, backend, database, api, ui/ux, performance, security, other)
- `assignee`: Filter by assignee name
- `search`: Search in title and description
- `debug`: Enable debug mode (development only)

## 🚀 Deployment

### Production Build
```bash
# Build the client application
npm run build

# Start the production server
npm start
```

### Environment Variables
Ensure all environment variables are properly set for production:
- `NODE_ENV=production`
- `MONGODB_URI`: Production database connection string
- `JWT_SECRET`: Secure JWT secret key
- `PORT`: Server port (default: 5000)

## 🤝 Contributing

### Development Workflow
1. **Setup Development Environment**: Follow installation instructions
2. **Run Tests**: Ensure all tests pass before making changes
3. **Write Tests**: Add tests for new features or bug fixes
4. **Debug Mode**: Use debug tools to identify and fix issues
5. **Code Coverage**: Maintain or improve code coverage
6. **Documentation**: Update documentation for new features

### Testing Guidelines
- Write unit tests for all new components and functions
- Add integration tests for new API endpoints
- Maintain 70%+ code coverage
- Use descriptive test names and clear assertions
- Mock external dependencies appropriately

### Debugging Guidelines
- Use the built-in debug tools for troubleshooting
- Log relevant information for debugging purposes
- Handle errors gracefully with appropriate user feedback
- Use performance monitoring to identify bottlenecks

## 📝 Assignment Evaluation Criteria

This project demonstrates:

1. **Comprehensive Testing**: Unit, integration, and component tests with high coverage
2. **Effective Debugging**: Built-in debugging tools and error handling strategies
3. **Code Quality**: Well-structured, maintainable code with proper error handling
4. **Documentation**: Clear documentation of testing strategies and debugging techniques
5. **Real-world Application**: Functional bug tracker with practical features

## 🔗 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Testing Best Practices](https://www.mongodb.com/blog/post/mongodb-testing-best-practices)
- [Node.js Debugging Guide](https://nodejs.org/en/docs/guides/debugging-getting-started/)

## 🐛 Known Issues & Debugging Exercises

The application includes several intentional bugs for debugging practice:

1. **Backend Bugs**: Check the debug helper for server-side debugging exercises
2. **Frontend Bugs**: Use the debug panel to practice client-side debugging
3. **Performance Issues**: Monitor slow requests and memory usage
4. **Error Handling**: Test error boundaries and validation edge cases

Use the debug tools provided to identify, understand, and fix these issues as part of the learning experience.

---

**Note**: This application is designed for educational purposes to demonstrate comprehensive testing and debugging strategies in MERN stack applications. The intentional bugs and debugging features are included to provide hands-on learning opportunities.