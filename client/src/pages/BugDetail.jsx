import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { bugAPI } from '../services/api';

const BugDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assigneeInput, setAssigneeInput] = useState('');
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [resolutionData, setResolutionData] = useState({
    resolvedBy: '',
    resolution: '',
  });
  const [showResolveForm, setShowResolveForm] = useState(false);

  // Fetch bug data
  const { data, isLoading, error } = useQuery(
    ['bug', id],
    () => bugAPI.getBug(id),
    {
      retry: 2,
      refetchOnWindowFocus: false,
    }
  );

  const bug = data?.data?.data;

  // Delete bug mutation
  const deleteMutation = useMutation(bugAPI.deleteBug, {
    onSuccess: () => {
      queryClient.invalidateQueries('bugs');
      queryClient.invalidateQueries('bugStats');
      toast.success('Bug deleted successfully!');
      navigate('/bugs');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete bug');
    },
  });

  // Assign bug mutation
  const assignMutation = useMutation(
    ({ bugId, assignee }) => bugAPI.assignBug(bugId, assignee),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['bug', id]);
        queryClient.invalidateQueries('bugs');
        toast.success('Bug assigned successfully!');
        setShowAssignForm(false);
        setAssigneeInput('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to assign bug');
      },
    }
  );

  // Resolve bug mutation
  const resolveMutation = useMutation(
    ({ bugId, resolution }) => bugAPI.resolveBug(bugId, resolution),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['bug', id]);
        queryClient.invalidateQueries('bugs');
        queryClient.invalidateQueries('bugStats');
        toast.success('Bug resolved successfully!');
        setShowResolveForm(false);
        setResolutionData({ resolvedBy: '', resolution: '' });
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to resolve bug');
      },
    }
  );

  const handleDelete = () => {
    deleteMutation.mutate(id);
  };

  const handleAssign = (e) => {
    e.preventDefault();
    if (!assigneeInput.trim()) {
      toast.error('Please enter an assignee name');
      return;
    }
    assignMutation.mutate({ bugId: id, assignee: assigneeInput.trim() });
  };

  const handleResolve = (e) => {
    e.preventDefault();
    if (!resolutionData.resolvedBy.trim() || !resolutionData.resolution.trim()) {
      toast.error('Please fill in all resolution fields');
      return;
    }
    resolveMutation.mutate({ bugId: id, resolution: resolutionData });
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
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <div className="loading">Loading bug details...</div>;
  }

  if (error) {
    return (
      <div className="error">
        Failed to load bug: {error.response?.data?.error || error.message}
        <div style={{ marginTop: '20px' }}>
          <Link to="/bugs" className="btn btn-primary">
            Back to Bug List
          </Link>
        </div>
      </div>
    );
  }

  if (!bug) {
    return (
      <div className="error">
        Bug not found
        <div style={{ marginTop: '20px' }}>
          <Link to="/bugs" className="btn btn-primary">
            Back to Bug List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bug-detail">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h1>{bug.title}</h1>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <span className={getStatusBadge(bug.status)}>
              {bug.status}
            </span>
            <span className={getPriorityBadge(bug.priority)}>
              {bug.priority}
            </span>
            <span className="badge" style={{ backgroundColor: '#6c757d', color: 'white' }}>
              {bug.category}
            </span>
            <span className="badge" style={{ backgroundColor: '#17a2b8', color: 'white' }}>
              {bug.severity}
            </span>
            <span className="badge" style={{ backgroundColor: '#6f42c1', color: 'white' }}>
              {bug.environment}
            </span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to={`/bugs/${id}/edit`} className="btn btn-primary">
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn btn-danger"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        <div>
          {/* Description */}
          <div className="card">
            <h3>Description</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{bug.description}</p>
          </div>

          {/* Expected vs Actual Behavior */}
          {(bug.expectedBehavior || bug.actualBehavior) && (
            <div className="card">
              <h3>Expected vs Actual Behavior</h3>
              {bug.expectedBehavior && (
                <div style={{ marginBottom: '15px' }}>
                  <strong>Expected:</strong>
                  <p style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>{bug.expectedBehavior}</p>
                </div>
              )}
              {bug.actualBehavior && (
                <div>
                  <strong>Actual:</strong>
                  <p style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>{bug.actualBehavior}</p>
                </div>
              )}
            </div>
          )}

          {/* Steps to Reproduce */}
          {bug.stepsToReproduce && bug.stepsToReproduce.length > 0 && (
            <div className="card">
              <h3>Steps to Reproduce</h3>
              <ol>
                {bug.stepsToReproduce.map((step, index) => (
                  <li key={index} style={{ marginBottom: '5px' }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Resolution */}
          {bug.resolution && (
            <div className="card">
              <h3>Resolution</h3>
              <p style={{ whiteSpace: 'pre-wrap' }}>{bug.resolution}</p>
              {bug.resolvedBy && (
                <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                  Resolved by: {bug.resolvedBy}
                </p>
              )}
              {bug.resolvedAt && (
                <p style={{ fontSize: '14px', color: '#666' }}>
                  Resolved on: {formatDate(bug.resolvedAt)}
                </p>
              )}
            </div>
          )}

          {/* Tags */}
          {bug.tags && bug.tags.length > 0 && (
            <div className="card">
              <h3>Tags</h3>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {bug.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="badge"
                    style={{ backgroundColor: '#f8f9fa', color: '#333', border: '1px solid #dee2e6' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Bug Information */}
          <div className="card">
            <h3>Bug Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <strong>Reporter:</strong> {bug.reporter}
              </div>
              <div>
                <strong>Assignee:</strong> {bug.assignee || 'Unassigned'}
              </div>
              <div>
                <strong>Created:</strong> {formatDate(bug.createdAt)}
              </div>
              <div>
                <strong>Updated:</strong> {formatDate(bug.updatedAt)}
              </div>
              {bug.ageInDays !== undefined && (
                <div>
                  <strong>Age:</strong> {bug.ageInDays} days
                </div>
              )}
              {bug.resolutionTimeInHours && (
                <div>
                  <strong>Resolution Time:</strong> {bug.resolutionTimeInHours} hours
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <h3>Actions</h3>
            
            {/* Assign Bug */}
            {!showAssignForm ? (
              <button
                onClick={() => setShowAssignForm(true)}
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: '10px' }}
              >
                {bug.assignee ? 'Reassign Bug' : 'Assign Bug'}
              </button>
            ) : (
              <form onSubmit={handleAssign} style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  value={assigneeInput}
                  onChange={(e) => setAssigneeInput(e.target.value)}
                  placeholder="Enter assignee name"
                  className="form-control"
                  style={{ marginBottom: '10px' }}
                />
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    type="submit"
                    disabled={assignMutation.isLoading}
                    className="btn btn-primary btn-sm"
                  >
                    {assignMutation.isLoading ? 'Assigning...' : 'Assign'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignForm(false);
                      setAssigneeInput('');
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Resolve Bug */}
            {bug.status !== 'resolved' && bug.status !== 'closed' && (
              <>
                {!showResolveForm ? (
                  <button
                    onClick={() => setShowResolveForm(true)}
                    className="btn btn-success"
                    style={{ width: '100%' }}
                  >
                    Resolve Bug
                  </button>
                ) : (
                  <form onSubmit={handleResolve}>
                    <input
                      type="text"
                      value={resolutionData.resolvedBy}
                      onChange={(e) => setResolutionData(prev => ({ ...prev, resolvedBy: e.target.value }))}
                      placeholder="Resolved by"
                      className="form-control"
                      style={{ marginBottom: '10px' }}
                    />
                    <textarea
                      value={resolutionData.resolution}
                      onChange={(e) => setResolutionData(prev => ({ ...prev, resolution: e.target.value }))}
                      placeholder="Resolution details"
                      className="form-control"
                      rows="3"
                      style={{ marginBottom: '10px' }}
                    />
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        type="submit"
                        disabled={resolveMutation.isLoading}
                        className="btn btn-success btn-sm"
                      >
                        {resolveMutation.isLoading ? 'Resolving...' : 'Resolve'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowResolveForm(false);
                          setResolutionData({ resolvedBy: '', resolution: '' });
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div className="card" style={{ maxWidth: '400px', margin: '20px' }}>
            <h3 style={{ color: '#dc3545' }}>Confirm Delete</h3>
            <p>Are you sure you want to delete this bug? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isLoading}
                className="btn btn-danger"
              >
                {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back to List */}
      <div style={{ marginTop: '30px' }}>
        <Link to="/bugs" className="btn btn-secondary">
          ← Back to Bug List
        </Link>
      </div>
    </div>
  );
};

export default BugDetail;