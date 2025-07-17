import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px 20px' }}>
      <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '4rem', color: '#dc3545', margin: '0 0 20px 0' }}>
          404
        </h1>
        <h2 style={{ marginBottom: '20px' }}>Page Not Found</h2>
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '30px' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
          <Link to="/bugs" className="btn btn-secondary">
            View Bugs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;