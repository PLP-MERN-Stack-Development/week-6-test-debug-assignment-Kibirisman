const logger = require('../config/logger');

class DebugHelper {
  constructor() {
    this.debugSessions = new Map();
    this.performanceMarks = new Map();
  }

  // Start a debug session
  startSession(sessionId, context = {}) {
    const session = {
      id: sessionId,
      startTime: Date.now(),
      context,
      operations: [],
      errors: [],
    };

    this.debugSessions.set(sessionId, session);
    logger.debug(`Debug session started: ${sessionId}`, { context });
    
    return session;
  }

  // Log an operation in a debug session
  logOperation(sessionId, operation, data = {}) {
    const session = this.debugSessions.get(sessionId);
    if (!session) {
      logger.warn(`Debug session not found: ${sessionId}`);
      return;
    }

    const operationLog = {
      operation,
      timestamp: Date.now(),
      data,
      duration: Date.now() - session.startTime,
    };

    session.operations.push(operationLog);
    logger.debug(`Operation logged: ${operation}`, { sessionId, data });
  }

  // Log an error in a debug session
  logError(sessionId, error, context = {}) {
    const session = this.debugSessions.get(sessionId);
    if (!session) {
      logger.warn(`Debug session not found: ${sessionId}`);
      return;
    }

    const errorLog = {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      context,
    };

    session.errors.push(errorLog);
    logger.error(`Error logged in session ${sessionId}:`, error, { context });
  }

  // End a debug session and return summary
  endSession(sessionId) {
    const session = this.debugSessions.get(sessionId);
    if (!session) {
      logger.warn(`Debug session not found: ${sessionId}`);
      return null;
    }

    const summary = {
      id: sessionId,
      totalDuration: Date.now() - session.startTime,
      operationCount: session.operations.length,
      errorCount: session.errors.length,
      operations: session.operations,
      errors: session.errors,
      context: session.context,
    };

    this.debugSessions.delete(sessionId);
    logger.debug(`Debug session ended: ${sessionId}`, { summary });

    return summary;
  }

  // Get current session data
  getSession(sessionId) {
    return this.debugSessions.get(sessionId);
  }

  // Performance monitoring
  startPerformanceMark(markId, description = '') {
    const mark = {
      id: markId,
      description,
      startTime: process.hrtime.bigint(),
      startTimestamp: Date.now(),
    };

    this.performanceMarks.set(markId, mark);
    logger.debug(`Performance mark started: ${markId}`, { description });

    return mark;
  }

  endPerformanceMark(markId) {
    const mark = this.performanceMarks.get(markId);
    if (!mark) {
      logger.warn(`Performance mark not found: ${markId}`);
      return null;
    }

    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - mark.startTime) / 1000000; // Convert to milliseconds

    const result = {
      id: markId,
      description: mark.description,
      duration,
      startTimestamp: mark.startTimestamp,
      endTimestamp: Date.now(),
    };

    this.performanceMarks.delete(markId);
    logger.debug(`Performance mark ended: ${markId}`, { duration: `${duration}ms` });

    return result;
  }

  // Memory usage tracking
  getMemoryUsage() {
    const usage = process.memoryUsage();
    const formattedUsage = {
      rss: this.formatBytes(usage.rss),
      heapTotal: this.formatBytes(usage.heapTotal),
      heapUsed: this.formatBytes(usage.heapUsed),
      external: this.formatBytes(usage.external),
      arrayBuffers: this.formatBytes(usage.arrayBuffers),
    };

    logger.debug('Memory usage:', formattedUsage);
    return formattedUsage;
  }

  // Format bytes to human readable format
  formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Create a request context for debugging
  createRequestContext(req) {
    return {
      method: req.method,
      url: req.url,
      headers: req.headers,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      sessionId: `${req.method}-${req.url}-${Date.now()}`,
    };
  }

  // Intentional bug for demonstration (debugging exercise)
  demonstrateBug() {
    logger.info('Demonstrating intentional bug for debugging exercise');
    
    // Bug 1: Undefined variable access
    try {
      console.log(undefinedVariable.property);
    } catch (error) {
      logger.error('Bug 1 - Undefined variable access:', error.message);
    }

    // Bug 2: Division by zero with unexpected input
    try {
      const result = this.calculatePercentage(100, 0);
      console.log('Percentage result:', result);
    } catch (error) {
      logger.error('Bug 2 - Division error:', error.message);
    }

    // Bug 3: Array access out of bounds
    try {
      const array = [1, 2, 3];
      const element = array[10].toString();
      console.log('Element:', element);
    } catch (error) {
      logger.error('Bug 3 - Array access error:', error.message);
    }

    // Bug 4: Async error handling
    this.asyncBugDemo().catch(error => {
      logger.error('Bug 4 - Async error:', error.message);
    });
  }

  calculatePercentage(value, total) {
    if (total === 0) {
      throw new Error('Cannot calculate percentage: total cannot be zero');
    }
    return (value / total) * 100;
  }

  async asyncBugDemo() {
    // Simulating an async operation that fails
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('Simulated async operation failed'));
      }, 1000);
    });
  }

  // Database query debugging helper
  debugQuery(query, params = {}) {
    const debugInfo = {
      query: query.toString(),
      params,
      timestamp: new Date().toISOString(),
    };

    logger.debug('Database query:', debugInfo);
    return debugInfo;
  }

  // API response debugging helper
  debugResponse(req, res, data, duration) {
    const debugInfo = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseSize: JSON.stringify(data).length,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    };

    logger.debug('API response:', debugInfo);
    return debugInfo;
  }
}

// Create singleton instance
const debugHelper = new DebugHelper();

module.exports = debugHelper;