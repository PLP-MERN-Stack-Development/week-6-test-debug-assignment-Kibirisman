// Debug utilities for the frontend
class DebugUtils {
  constructor() {
    this.isDebugMode = process.env.NODE_ENV === 'development' || localStorage.getItem('debugMode') === 'true';
    this.logs = [];
    this.performanceMarks = new Map();
    this.originalConsole = { ...console }; // Store original console methods
    
    // Initialize debug mode if in development
    if (this.isDebugMode) {
      this.enableDebugMode();
    }
  }

  // Enable debug mode
  enableDebugMode() {
    console.log('🐛 Debug mode enabled');
    localStorage.setItem('debugMode', 'true');
    this.isDebugMode = true;
    
    // Add debug panel to page
    this.addDebugPanel();
    
    // Override console methods to capture logs
    this.interceptConsole();
    
    // Monitor React errors
    this.setupErrorMonitoring();
    
    // Monitor API calls
    this.monitorAPIRequests();
  }

  // Disable debug mode
  disableDebugMode() {
    console.log('🐛 Debug mode disabled');
    localStorage.removeItem('debugMode');
    this.isDebugMode = false;
    
    // Remove debug panel
    this.removeDebugPanel();
  }

  // Toggle debug mode
  toggleDebugMode() {
    if (this.isDebugMode) {
      this.disableDebugMode();
    } else {
      this.enableDebugMode();
    }
  }

  // Log debug messages
  log(message, data = null, type = 'info') {
    if (!this.isDebugMode) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      message,
      data,
      type,
      stack: new Error().stack,
    };

    this.logs.push(logEntry);
    
    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs.shift();
    }

    this.originalConsole.log(`🐛 [${type.toUpperCase()}] ${message}`, data);
    
    // Update debug panel if it exists
    this.updateDebugPanel();
  }

  // Log component renders
  logComponentRender(componentName, props = {}) {
    this.log(`Component rendered: ${componentName}`, { props }, 'render');
  }

  // Log state changes
  logStateChange(componentName, oldState, newState) {
    this.log(`State change in ${componentName}`, { oldState, newState }, 'state');
  }

  // Log API calls
  logAPICall(method, url, data = null, response = null, duration = null) {
    this.log(`API ${method.toUpperCase()} ${url}`, {
      requestData: data,
      response,
      duration: duration ? `${duration}ms` : null,
    }, 'api');
  }

  // Performance monitoring
  startPerformanceMark(name, description = '') {
    if (!this.isDebugMode) return;

    const mark = {
      name,
      description,
      startTime: performance.now(),
      startTimestamp: Date.now(),
    };

    this.performanceMarks.set(name, mark);
    console.time(name);
    this.log(`Performance mark started: ${name}`, { description }, 'performance');
  }

  endPerformanceMark(name) {
    if (!this.isDebugMode) return;

    const mark = this.performanceMarks.get(name);
    if (!mark) {
      console.warn(`Performance mark not found: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - mark.startTime;

    console.timeEnd(name);
    this.performanceMarks.delete(name);

    const result = {
      name,
      description: mark.description,
      duration: Math.round(duration * 100) / 100, // Round to 2 decimal places
      startTimestamp: mark.startTimestamp,
      endTimestamp: Date.now(),
    };

    this.log(`Performance mark ended: ${name}`, result, 'performance');
    
    // Warn about slow operations
    if (duration > 100) {
      console.warn(`⚠️ Slow operation detected: ${name} took ${duration}ms`);
    }

    return result;
  }

  // Monitor React component errors
  setupErrorMonitoring() {
    window.addEventListener('error', (event) => {
      this.log('Global error caught', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      }, 'error');
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.log('Unhandled promise rejection', {
        reason: event.reason,
        promise: event.promise,
      }, 'error');
    });
  }

  // Monitor API requests
  monitorAPIRequests() {
    // This would typically integrate with your API client
    // For now, we'll just provide a method to manually log API calls
  }

  // Intercept console methods
  interceptConsole() {
    ['log', 'warn', 'error', 'info'].forEach(method => {
      console[method] = (...args) => {
        // Call original console method
        this.originalConsole[method](...args);
        
        // Log to our debug system (but avoid recursion by using a flag)
        if (!this._loggingToDebugSystem) {
          this._loggingToDebugSystem = true;
          try {
            this.log(`Console.${method}`, args, method);
          } finally {
            this._loggingToDebugSystem = false;
          }
        }
      };
    });
  }

  // Add debug panel to the page
  addDebugPanel() {
    if (document.getElementById('debug-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 400px;
        max-height: 500px;
        background: #1a1a1a;
        color: #fff;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 15px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        z-index: 10000;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #333;
        ">
          <strong>🐛 Debug Panel</strong>
          <div>
            <button id="debug-clear" style="
              background: #dc3545;
              color: white;
              border: none;
              padding: 4px 8px;
              border-radius: 4px;
              cursor: pointer;
              margin-right: 5px;
              font-size: 10px;
            ">Clear</button>
            <button id="debug-close" style="
              background: #6c757d;
              color: white;
              border: none;
              padding: 4px 8px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 10px;
            ">×</button>
          </div>
        </div>
        <div id="debug-content" style="
          max-height: 400px;
          overflow-y: auto;
          line-height: 1.4;
        ">
          <div style="color: #28a745;">Debug mode enabled</div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // Add event listeners
    document.getElementById('debug-clear').addEventListener('click', () => {
      this.clearLogs();
    });

    document.getElementById('debug-close').addEventListener('click', () => {
      this.disableDebugMode();
    });

    // Make panel draggable
    this.makeDraggable(panel);
  }

  // Remove debug panel
  removeDebugPanel() {
    const panel = document.getElementById('debug-panel');
    if (panel) {
      panel.remove();
    }
  }

  // Update debug panel content
  updateDebugPanel() {
    const content = document.getElementById('debug-content');
    if (!content) return;

    // Show last 20 logs
    const recentLogs = this.logs.slice(-20);
    content.innerHTML = recentLogs.map(log => {
      const color = this.getLogColor(log.type);
      const time = new Date(log.timestamp).toLocaleTimeString();
      return `
        <div style="color: ${color}; margin-bottom: 5px;">
          <span style="color: #666;">[${time}]</span>
          <span style="font-weight: bold;">[${log.type.toUpperCase()}]</span>
          ${log.message}
          ${log.data ? `<br><span style="color: #ccc; margin-left: 20px;">${JSON.stringify(log.data, null, 2).substring(0, 200)}...</span>` : ''}
        </div>
      `;
    }).join('');

    // Scroll to bottom
    content.scrollTop = content.scrollHeight;
  }

  // Get color for log type
  getLogColor(type) {
    const colors = {
      info: '#17a2b8',
      warn: '#ffc107',
      error: '#dc3545',
      api: '#28a745',
      render: '#6f42c1',
      state: '#fd7e14',
      performance: '#20c997',
    };
    return colors[type] || '#fff';
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    this.updateDebugPanel();
  }

  // Make element draggable
  makeDraggable(element) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    element.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;

      if (e.target === element || element.contains(e.target)) {
        isDragging = true;
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
    });

    document.addEventListener('mouseup', () => {
      initialX = currentX;
      initialY = currentY;
      isDragging = false;
    });
  }

  // Get debug information for components
  getComponentDebugInfo(componentName, props = {}, state = {}) {
    return {
      componentName,
      props,
      state,
      timestamp: new Date().toISOString(),
      renderCount: this.logs.filter(log => 
        log.type === 'render' && log.message.includes(componentName)
      ).length + 1,
    };
  }

  // Export debug data
  exportDebugData() {
    const debugData = {
      logs: this.logs,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    const blob = new Blob([JSON.stringify(debugData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Demonstrate intentional bugs for debugging practice
  demonstrateBugs() {
    this.log('Demonstrating intentional bugs for debugging practice', null, 'info');

    // Bug 1: Null reference error
    setTimeout(() => {
      try {
        const obj = null;
        console.log(obj.property); // This will throw an error
      } catch (error) {
        this.log('Bug 1: Null reference error', { error: error.message }, 'error');
      }
    }, 1000);

    // Bug 2: Array index out of bounds
    setTimeout(() => {
      try {
        const array = [1, 2, 3];
        console.log(array[10].toString()); // This will throw an error
      } catch (error) {
        this.log('Bug 2: Array access error', { error: error.message }, 'error');
      }
    }, 2000);

    // Bug 3: Async error
    setTimeout(() => {
      Promise.reject(new Error('Intentional async error'))
        .catch(error => {
          this.log('Bug 3: Async error', { error: error.message }, 'error');
        });
    }, 3000);

    // Bug 4: State mutation error (would be caught in React)
    this.log('Bug 4: Direct state mutation (anti-pattern)', {
      warning: 'This would cause issues in React components'
    }, 'warn');
  }
}

// Create singleton instance
const debugUtils = new DebugUtils();

// Add global access for easy debugging
if (typeof window !== 'undefined') {
  window.debugUtils = debugUtils;
  
  // Add keyboard shortcut to toggle debug mode (Ctrl+Shift+D)
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      debugUtils.toggleDebugMode();
    }
  });
}

export default debugUtils;