const debugHelper = require('../utils/debugHelper');
const logger = require('../config/logger');

// Request debugging middleware
const requestDebugger = (req, res, next) => {
  const context = debugHelper.createRequestContext(req);
  const sessionId = context.sessionId;
  
  // Start debug session
  debugHelper.startSession(sessionId, context);
  
  // Add session ID to request for other middleware to use
  req.debugSessionId = sessionId;
  
  // Track request start time
  req.startTime = Date.now();
  
  // Log initial request
  debugHelper.logOperation(sessionId, 'REQUEST_START', {
    method: req.method,
    url: req.url,
    query: req.query,
    body: req.body,
    headers: req.headers,
  });

  // Override res.json to capture response data
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - req.startTime;
    
    // Log response
    debugHelper.logOperation(sessionId, 'RESPONSE_SENT', {
      statusCode: res.statusCode,
      data: data,
      duration,
    });

    // Debug response
    debugHelper.debugResponse(req, res, data, duration);

    // End debug session
    const summary = debugHelper.endSession(sessionId);
    
    // Log session summary if it was long or had errors
    if (summary && (summary.totalDuration > 1000 || summary.errorCount > 0)) {
      logger.warn('Slow or error-prone request detected:', summary);
    }

    return originalJson.call(this, data);
  };

  next();
};

// Error debugging middleware
const errorDebugger = (err, req, res, next) => {
  if (req.debugSessionId) {
    debugHelper.logError(req.debugSessionId, err, {
      method: req.method,
      url: req.url,
      query: req.query,
      body: req.body,
    });
  }

  // Log error details
  logger.error('Request error occurred:', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    sessionId: req.debugSessionId,
  });

  next(err);
};

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const markId = `request-${req.method}-${req.url}-${Date.now()}`;
  
  debugHelper.startPerformanceMark(markId, `${req.method} ${req.url}`);
  
  // Add mark ID to request
  req.performanceMarkId = markId;
  
  // Override res.end to capture when response is finished
  const originalEnd = res.end;
  res.end = function(...args) {
    const performanceData = debugHelper.endPerformanceMark(markId);
    
    if (performanceData && performanceData.duration > 500) {
      logger.warn('Slow request detected:', {
        url: req.url,
        method: req.method,
        duration: performanceData.duration,
      });
    }
    
    return originalEnd.apply(this, args);
  };
  
  next();
};

// Memory monitoring middleware
const memoryMonitor = (req, res, next) => {
  // Log memory usage for heavy requests
  if (req.method === 'POST' || req.method === 'PUT') {
    const memoryBefore = process.memoryUsage();
    
    res.on('finish', () => {
      const memoryAfter = process.memoryUsage();
      const memoryDiff = {
        rss: memoryAfter.rss - memoryBefore.rss,
        heapTotal: memoryAfter.heapTotal - memoryBefore.heapTotal,
        heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
      };
      
      if (memoryDiff.heapUsed > 10 * 1024 * 1024) { // 10MB
        logger.warn('High memory usage detected:', {
          url: req.url,
          method: req.method,
          memoryDiff: debugHelper.formatBytes(memoryDiff.heapUsed),
        });
      }
    });
  }
  
  next();
};

// Debug endpoint middleware
const debugEndpoint = (req, res, next) => {
  if (req.query.debug === 'true' && process.env.NODE_ENV === 'development') {
    // Add debug information to response
    const originalJson = res.json;
    res.json = function(data) {
      const debugInfo = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        duration: Date.now() - req.startTime,
        memory: debugHelper.getMemoryUsage(),
        sessionId: req.debugSessionId,
      };
      
      const debugResponse = {
        ...data,
        __debug: debugInfo,
      };
      
      return originalJson.call(this, debugResponse);
    };
  }
  
  next();
};

// Database operation debugger
const databaseDebugger = {
  logQuery: (operation, model, query, options = {}) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Database ${operation}:`, {
        model,
        query,
        options,
        timestamp: new Date().toISOString(),
      });
    }
  },

  logResult: (operation, result, duration) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Database ${operation} result:`, {
        resultCount: Array.isArray(result) ? result.length : result ? 1 : 0,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });
    }
  },
};

// Intentional bug demonstration middleware
const bugDemonstrator = (req, res, next) => {
  // Only run in development and when specifically requested
  if (req.query.demonstrateBugs === 'true' && process.env.NODE_ENV === 'development') {
    logger.info('Demonstrating bugs as requested');
    
    try {
      debugHelper.demonstrateBug();
    } catch (error) {
      logger.error('Error during bug demonstration:', error);
    }
  }
  
  next();
};

module.exports = {
  requestDebugger,
  errorDebugger,
  performanceMonitor,
  memoryMonitor,
  debugEndpoint,
  databaseDebugger,
  bugDemonstrator,
};