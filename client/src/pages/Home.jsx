import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { bugAPI } from '../services/api';

const Home = () => {
  const { data: statsData, isLoading, error } = useQuery(
    'bugStats',
    () => bugAPI.getBugStats(),
    {
      retry: 2,
      refetchOnWindowFocus: false,
    }
  );

  const stats = statsData?.data?.data;

  return (
    <div className="home">
      <div className="hero-section" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: '#333' }}>
          🐛 Bug Tracker
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '30px' }}>
          A comprehensive MERN stack bug tracking application with testing and debugging features
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Link to="/bugs/new" className="btn btn-primary btn-lg">
            Report New Bug
          </Link>
          <Link to="/bugs" className="btn btn-secondary btn-lg">
            View All Bugs
          </Link>
        </div>
      </div>

      <div className="stats-section">
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Bug Statistics</h2>
        
        {isLoading && (
          <div className="loading">Loading statistics...</div>
        )}

        {error && (
          <div className="error">
            Failed to load statistics: {error.response?.data?.error || error.message}
          </div>
        )}

        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <h3 style={{ color: '#007bff', fontSize: '2.5rem', margin: '0 0 10px 0' }}>
                {stats.total}
              </h3>
              <p style={{ margin: 0, fontSize: '1.1rem', color: '#666' }}>Total Bugs</p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <h3 style={{ color: '#dc3545', fontSize: '2.5rem', margin: '0 0 10px 0' }}>
                {stats.byStatus.open}
              </h3>
              <p style={{ margin: 0, fontSize: '1.1rem', color: '#666' }}>Open Bugs</p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <h3 style={{ color: '#ffc107', fontSize: '2.5rem', margin: '0 0 10px 0' }}>
                {stats.byStatus.inProgress}
              </h3>
              <p style={{ margin: 0, fontSize: '1.1rem', color: '#666' }}>In Progress</p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <h3 style={{ color: '#28a745', fontSize: '2.5rem', margin: '0 0 10px 0' }}>
                {stats.byStatus.resolved}
              </h3>
              <p style={{ margin: 0, fontSize: '1.1rem', color: '#666' }}>Resolved</p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <h3 style={{ color: '#dc3545', fontSize: '2.5rem', margin: '0 0 10px 0' }}>
                {stats.byPriority.high}
              </h3>
              <p style={{ margin: 0, fontSize: '1.1rem', color: '#666' }}>High Priority</p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <h3 style={{ color: '#dc3545', fontSize: '2.5rem', margin: '0 0 10px 0' }}>
                {stats.byPriority.critical}
              </h3>
              <p style={{ margin: 0, fontSize: '1.1rem', color: '#666' }}>Critical</p>
            </div>
          </div>
        )}
      </div>

      <div className="features-section" style={{ marginTop: '50px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Features</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div className="card">
            <h3 style={{ color: '#007bff', marginBottom: '15px' }}>📝 Bug Reporting</h3>
            <p>Create detailed bug reports with title, description, priority, and steps to reproduce.</p>
          </div>

          <div className="card">
            <h3 style={{ color: '#007bff', marginBottom: '15px' }}>📊 Bug Tracking</h3>
            <p>Track bug status, assign to team members, and monitor progress through resolution.</p>
          </div>

          <div className="card">
            <h3 style={{ color: '#007bff', marginBottom: '15px' }}>🔍 Advanced Filtering</h3>
            <p>Filter bugs by status, priority, assignee, category, and search through descriptions.</p>
          </div>

          <div className="card">
            <h3 style={{ color: '#007bff', marginBottom: '15px' }}>🧪 Comprehensive Testing</h3>
            <p>Built with extensive unit, integration, and end-to-end tests for reliability.</p>
          </div>

          <div className="card">
            <h3 style={{ color: '#007bff', marginBottom: '15px' }}>🐛 Debugging Tools</h3>
            <p>Includes error boundaries, logging, and debugging techniques for troubleshooting.</p>
          </div>

          <div className="card">
            <h3 style={{ color: '#007bff', marginBottom: '15px' }}>📈 Analytics</h3>
            <p>View bug statistics, trends, and resolution metrics to improve your workflow.</p>
          </div>
        </div>
      </div>

      <div className="getting-started" style={{ marginTop: '50px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '20px' }}>Getting Started</h2>
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '30px' }}>
          Ready to start tracking bugs? Create your first bug report or browse existing issues.
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Link to="/bugs/new" className="btn btn-primary">
            Create Bug Report
          </Link>
          <Link to="/bugs" className="btn btn-outline-primary">
            Browse Bugs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;