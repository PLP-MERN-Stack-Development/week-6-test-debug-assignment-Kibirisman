import React, { useState, useEffect } from 'react';
import debugUtils from '../utils/debugUtils';

const DebugPanel = ({ show = false, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (show) {
      // Update logs periodically
      const interval = setInterval(() => {
        setLogs([...debugUtils.logs]);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [show]);

  if (!show) return null;

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.type === filter;
  });

  const logTypes = ['all', 'info', 'warn', 'error', 'api', 'render', 'state', 'performance'];

  const getLogColor = (type) => {
    const colors = {
      info: '#17a2b8',
      warn: '#ffc107',
      error: '#dc3545',
      api: '#28a745',
      render: '#6f42c1',
      state: '#fd7e14',
      performance: '#20c997',
    };
    return colors[type] || '#333';
  };

  const formatLogData = (data) => {
    if (!data) return '';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const clearLogs = () => {
    debugUtils.clearLogs();
    setLogs([]);
  };

  const exportLogs = () => {
    debugUtils.exportDebugData();
  };

  const demonstrateBugs = () => {
    debugUtils.demonstrateBugs();
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: isMinimized ? '200px' : '500px',
        height: isMinimized ? '50px' : '600px',
        backgroundColor: '#1a1a1a',
        color: '#fff',
        border: '1px solid #333',
        borderRadius: '8px',
        fontFamily: "'Courier New', monospace",
        fontSize: '12px',
        zIndex: 10000,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 15px',
          borderBottom: isMinimized ? 'none' : '1px solid #333',
          backgroundColor: '#2a2a2a',
          cursor: 'pointer',
        }}
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <strong>🐛 Debug Panel</strong>
        <div style={{ display: 'flex', gap: '5px' }}>
          {!isMinimized && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearLogs();
                }}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10px',
                }}
              >
                Clear
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  exportLogs();
                }}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10px',
                }}
              >
                Export
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  demonstrateBugs();
                }}
                style={{
                  background: '#ffc107',
                  color: 'black',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10px',
                }}
              >
                Demo Bugs
              </button>
            </>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '10px',
            }}
          >
            {isMinimized ? '□' : '_'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose && onClose();
            }}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '10px',
            }}
          >
            ×
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Controls */}
          <div style={{ padding: '10px 15px', borderBottom: '1px solid #333' }}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ marginRight: '10px' }}>Filter:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  background: '#333',
                  color: '#fff',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  padding: '2px 5px',
                  fontSize: '11px',
                }}
              >
                {logTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ fontSize: '11px', color: '#ccc' }}>
              Total logs: {logs.length} | Filtered: {filteredLogs.length}
            </div>
          </div>

          {/* Logs */}
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '10px 15px',
              lineHeight: '1.4',
            }}
          >
            {filteredLogs.length === 0 ? (
              <div style={{ color: '#666', fontStyle: 'italic' }}>
                No logs to display
              </div>
            ) : (
              filteredLogs.slice(-50).map((log, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: '8px',
                    padding: '5px',
                    backgroundColor: '#2a2a2a',
                    borderRadius: '4px',
                    borderLeft: `3px solid ${getLogColor(log.type)}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3px' }}>
                    <span style={{ color: '#666', fontSize: '10px' }}>
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>
                    <span
                      style={{
                        color: getLogColor(log.type),
                        fontWeight: 'bold',
                        marginLeft: '8px',
                        fontSize: '10px',
                      }}
                    >
                      [{log.type.toUpperCase()}]
                    </span>
                  </div>
                  <div style={{ marginBottom: '3px' }}>
                    {log.message}
                  </div>
                  {log.data && (
                    <pre
                      style={{
                        color: '#ccc',
                        fontSize: '10px',
                        margin: '3px 0 0 0',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        maxHeight: '100px',
                        overflow: 'auto',
                      }}
                    >
                      {formatLogData(log.data)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '10px 15px',
              borderTop: '1px solid #333',
              backgroundColor: '#2a2a2a',
              fontSize: '10px',
              color: '#666',
            }}
          >
            Debug mode active | Press Ctrl+Shift+D to toggle
          </div>
        </>
      )}
    </div>
  );
};

export default DebugPanel;