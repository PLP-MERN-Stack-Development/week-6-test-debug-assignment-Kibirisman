import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { bugAPI } from '../services/api';

const BugList = () => {
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    assignee: '',
    search: '',
    page: 1,
    limit: 10,
  });

  const { data, isLoading, error, refetch } = useQuery(
    ['bugs', filters],
    () => bugAPI.getBugs(filters),
    {
      keepPreviousData: true,
      retry: 2,
      refetchOnWindowFocus: false,
    }
  );

  const bugs = data?.data?.data || [];
  const pagination = {
    page: data?.data?.page || 1,
    totalPages: data?.data?.totalPages || 1,
    total: data?.data?.total || 0,
    count: data?.data?.count || 0,
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      category: '',
      assignee: '',
      search: '',
      page: 1,
      limit: 10,
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      open: 'badge-open',
      'in-progress': 'badge-in-progress',
      resolved: 'badge-resolved',
      closed: 'badge-resolved',
    };
    return `badge ${statusClasses[status] || 'badge-open'}`;
  };

  const getPriorityBadge = (priority) => {
    const priorityClasses = {
      low: 'badge-low',
      medium: 'badge-medium',
      high: 'badge-high',
      critical: 'badge-high',
    };
    return `badge ${priorityClasses[priority] || 'badge-medium'}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bug-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Bug Reports</h1>
        <Link to="/bugs/new" className="btn btn-primary">
          Report New Bug
        </Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '20px' }}>Filters</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-control"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className="form-control"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-control"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="database">Database</option>
              <option value="api">API</option>
              <option value="ui/ux">UI/UX</option>
              <option value="performance">Performance</option>
              <option value="security">Security</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Assignee</label>
            <input
              type="text"
              className="form-control"
              placeholder="Filter by assignee"
              value={filters.assignee}
              onChange={(e) => handleFilterChange('assignee', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Search</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search in title and description..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button onClick={() => refetch()} className="btn btn-primary">
            Apply Filters
          </button>
          <button onClick={clearFilters} className="btn btn-secondary">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div style={{ marginBottom: '20px', color: '#666' }}>
        Showing {pagination.count} of {pagination.total} bugs
        {filters.search && (
          <span> for "{filters.search}"</span>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="loading">Loading bugs...</div>
      )}

      {/* Error State */}
      {error && (
        <div className="error">
          Failed to load bugs: {error.response?.data?.error || error.message}
          <button onClick={() => refetch()} className="btn btn-primary" style={{ marginLeft: '10px' }}>
            Retry
          </button>
        </div>
      )}

      {/* Bug List */}
      {!isLoading && !error && (
        <>
          {bugs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <h3>No bugs found</h3>
              <p>No bugs match your current filters.</p>
              <Link to="/bugs/new" className="btn btn-primary">
                Report the first bug
              </Link>
            </div>
          ) : (
            <div className="bug-list-container">
              {bugs.map((bug) => (
                <div key={bug._id} className="card" style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <span className={getStatusBadge(bug.status)}>
                          {bug.status}
                        </span>
                        <span className={getPriorityBadge(bug.priority)}>
                          {bug.priority}
                        </span>
                        <span className="badge" style={{ backgroundColor: '#6c757d', color: 'white' }}>
                          {bug.category}
                        </span>
                      </div>
                      
                      <h3 style={{ margin: '0 0 10px 0' }}>
                        <Link
                          to={`/bugs/${bug._id}`}
                          style={{ color: '#333', textDecoration: 'none' }}
                        >
                          {bug.title}
                        </Link>
                      </h3>
                      
                      <p style={{ color: '#666', margin: '0 0 10px 0' }}>
                        {bug.description.length > 150
                          ? `${bug.description.substring(0, 150)}...`
                          : bug.description}
                      </p>
                      
                      <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#666' }}>
                        <span>Reporter: {bug.reporter}</span>
                        {bug.assignee && <span>Assignee: {bug.assignee}</span>}
                        <span>Created: {formatDate(bug.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Link to={`/bugs/${bug._id}`} className="btn btn-sm btn-primary">
                        View
                      </Link>
                      <Link to={`/bugs/${bug._id}/edit`} className="btn btn-sm btn-secondary">
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px' }}>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 15px' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BugList;