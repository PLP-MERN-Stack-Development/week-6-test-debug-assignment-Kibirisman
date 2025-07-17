import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    if (process.env.NODE_ENV === 'production') {
      // Log to external service like Sentry, LogRocket, etc.
      console.error('Production error:', error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="container">
            <div className="card" style={{ marginTop: '50px', textAlign: 'center' }}>
              <h1 style={{ color: '#dc3545', marginBottom: '20px' }}>
                Oops! Something went wrong
              </h1>
              <p style={{ marginBottom: '20px', fontSize: '18px', color: '#666' }}>
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              
              <div style={{ marginBottom: '20px' }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.reload()}
                  style={{ marginRight: '10px' }}
                >
                  Reload Page
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                >
                  Try Again
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details style={{ textAlign: 'left', marginTop: '20px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#dc3545' }}>
                    Error Details (Development Only)
                  </summary>
                  <pre style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '15px', 
                    borderRadius: '4px',
                    marginTop: '10px',
                    fontSize: '12px',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {this.state.error && this.state.error.toString()}
                    <br />
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;