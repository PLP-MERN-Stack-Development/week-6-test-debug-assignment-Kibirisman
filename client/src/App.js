import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BugList from './pages/BugList';
import BugForm from './pages/BugForm';
import BugDetail from './pages/BugDetail';
import NotFound from './pages/NotFound';
import DebugPanel from './components/DebugPanel';
import debugUtils from './utils/debugUtils';

function App() {
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  useEffect(() => {
    // Check if debug mode should be enabled
    const debugMode = localStorage.getItem('debugMode') === 'true' || process.env.NODE_ENV === 'development';
    
    if (debugMode) {
      setShowDebugPanel(true);
      debugUtils.log('Bug Tracker application started', {
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      });
    }

    // Add keyboard shortcut for debug panel (Ctrl+Shift+P)
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setShowDebugPanel(!showDebugPanel);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDebugPanel]);

  // Global error handler
  useEffect(() => {
    const handleError = (error) => {
      debugUtils.log('Global error caught', {
        message: error.message,
        stack: error.stack,
      }, 'error');
    };

    const handleUnhandledRejection = (event) => {
      debugUtils.log('Unhandled promise rejection', {
        reason: event.reason,
      }, 'error');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/bugs" element={<BugList />} />
            <Route path="/bugs/new" element={<BugForm />} />
            <Route path="/bugs/:id" element={<BugDetail />} />
            <Route path="/bugs/:id/edit" element={<BugForm isEdit />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        {/* Debug Panel */}
        <DebugPanel 
          show={showDebugPanel} 
          onClose={() => setShowDebugPanel(false)} 
        />
        
        {/* Debug Toggle Button for Production */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            style={{
              position: 'fixed',
              bottom: '20px',
              left: '20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              cursor: 'pointer',
              zIndex: 9999,
              fontSize: '16px',
            }}
            title="Toggle Debug Panel (Ctrl+Shift+P)"
          >
            🐛
          </button>
        )}
      </div>
    </Router>
  );
}

export default App;