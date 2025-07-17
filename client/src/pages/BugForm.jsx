import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { bugAPI } from '../services/api';

const BugForm = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reporter: '',
    status: 'open',
    priority: 'medium',
    category: 'other',
    severity: 'major',
    environment: 'development',
    assignee: '',
    expectedBehavior: '',
    actualBehavior: '',
    stepsToReproduce: [''],
    tags: [''],
  });

  const [errors, setErrors] = useState({});

  // Fetch existing bug data for edit mode
  const { data: bugResponse, isLoading: isLoadingBug } = useQuery(
    ['bug', id],
    () => bugAPI.getBug(id),
    {
      enabled: isEdit && !!id,
      retry: 2,
      onSuccess: (data) => {
        const bug = data.data.data;
        setFormData({
          title: bug.title || '',
          description: bug.description || '',
          reporter: bug.reporter || '',
          status: bug.status || 'open',
          priority: bug.priority || 'medium',
          category: bug.category || 'other',
          severity: bug.severity || 'major',
          environment: bug.environment || 'development',
          assignee: bug.assignee || '',
          expectedBehavior: bug.expectedBehavior || '',
          actualBehavior: bug.actualBehavior || '',
          stepsToReproduce: bug.stepsToReproduce?.length > 0 ? bug.stepsToReproduce : [''],
          tags: bug.tags?.length > 0 ? bug.tags : [''],
        });
      },
      onError: (error) => {
        toast.error('Failed to load bug data');
        navigate('/bugs');
      },
    }
  );

  // Create bug mutation
  const createMutation = useMutation(bugAPI.createBug, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('bugs');
      queryClient.invalidateQueries('bugStats');
      toast.success('Bug created successfully!');
      navigate(`/bugs/${data.data.data._id}`);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || 'Failed to create bug';
      toast.error(errorMessage);
      
      if (error.response?.data?.details) {
        const validationErrors = {};
        error.response.data.details.forEach(detail => {
          validationErrors[detail.path] = detail.msg;
        });
        setErrors(validationErrors);
      }
    },
  });

  // Update bug mutation
  const updateMutation = useMutation(
    (data) => bugAPI.updateBug(id, data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('bugs');
        queryClient.invalidateQueries(['bug', id]);
        queryClient.invalidateQueries('bugStats');
        toast.success('Bug updated successfully!');
        navigate(`/bugs/${id}`);
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.error || 'Failed to update bug';
        toast.error(errorMessage);
        
        if (error.response?.data?.details) {
          const validationErrors = {};
          error.response.data.details.forEach(detail => {
            validationErrors[detail.path] = detail.msg;
          });
          setErrors(validationErrors);
        }
      },
    }
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleArrayChange = (arrayName, index, value) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => i === index ? value : item),
    }));
  };

  const addArrayItem = (arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], ''],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.reporter.trim()) {
      newErrors.reporter = 'Reporter is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    // Clean up form data
    const cleanedData = {
      ...formData,
      stepsToReproduce: formData.stepsToReproduce.filter(step => step.trim() !== ''),
      tags: formData.tags.filter(tag => tag.trim() !== ''),
    };

    if (isEdit) {
      updateMutation.mutate(cleanedData);
    } else {
      createMutation.mutate(cleanedData);
    }
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  if (isEdit && isLoadingBug) {
    return <div className="loading">Loading bug data...</div>;
  }

  return (
    <div className="bug-form">
      <h1>{isEdit ? 'Edit Bug' : 'Report New Bug'}</h1>

      <form onSubmit={handleSubmit} className="card">
        {/* Basic Information */}
        <h3>Basic Information</h3>
        
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input
            type="text"
            name="title"
            className={`form-control ${errors.title ? 'error' : ''}`}
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Brief description of the bug"
          />
          {errors.title && <div className="form-error">{errors.title}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea
            name="description"
            className={`form-control ${errors.description ? 'error' : ''}`}
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            placeholder="Detailed description of the bug"
          />
          {errors.description && <div className="form-error">{errors.description}</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Reporter *</label>
            <input
              type="text"
              name="reporter"
              className={`form-control ${errors.reporter ? 'error' : ''}`}
              value={formData.reporter}
              onChange={handleInputChange}
              placeholder="Your name"
            />
            {errors.reporter && <div className="form-error">{errors.reporter}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              name="status"
              className="form-control"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              name="priority"
              className="form-control"
              value={formData.priority}
              onChange={handleInputChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              name="category"
              className="form-control"
              value={formData.category}
              onChange={handleInputChange}
            >
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
            <label className="form-label">Severity</label>
            <select
              name="severity"
              className="form-control"
              value={formData.severity}
              onChange={handleInputChange}
            >
              <option value="minor">Minor</option>
              <option value="major">Major</option>
              <option value="critical">Critical</option>
              <option value="blocker">Blocker</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Environment</label>
            <select
              name="environment"
              className="form-control"
              value={formData.environment}
              onChange={handleInputChange}
            >
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Assignee</label>
          <input
            type="text"
            name="assignee"
            className="form-control"
            value={formData.assignee}
            onChange={handleInputChange}
            placeholder="Person assigned to fix this bug"
          />
        </div>

        {/* Bug Details */}
        <h3 style={{ marginTop: '30px' }}>Bug Details</h3>

        <div className="form-group">
          <label className="form-label">Expected Behavior</label>
          <textarea
            name="expectedBehavior"
            className="form-control"
            value={formData.expectedBehavior}
            onChange={handleInputChange}
            rows="3"
            placeholder="What should have happened?"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Actual Behavior</label>
          <textarea
            name="actualBehavior"
            className="form-control"
            value={formData.actualBehavior}
            onChange={handleInputChange}
            rows="3"
            placeholder="What actually happened?"
          />
        </div>

        {/* Steps to Reproduce */}
        <div className="form-group">
          <label className="form-label">Steps to Reproduce</label>
          {formData.stepsToReproduce.map((step, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                className="form-control"
                value={step}
                onChange={(e) => handleArrayChange('stepsToReproduce', index, e.target.value)}
                placeholder={`Step ${index + 1}`}
              />
              {formData.stepsToReproduce.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('stepsToReproduce', index)}
                  className="btn btn-danger btn-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('stepsToReproduce')}
            className="btn btn-secondary btn-sm"
          >
            Add Step
          </button>
        </div>

        {/* Tags */}
        <div className="form-group">
          <label className="form-label">Tags</label>
          {formData.tags.map((tag, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                className="form-control"
                value={tag}
                onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                placeholder="Tag"
              />
              {formData.tags.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('tags', index)}
                  className="btn btn-danger btn-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('tags')}
            className="btn btn-secondary btn-sm"
          >
            Add Tag
          </button>
        </div>

        {/* Submit Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Saving...' : (isEdit ? 'Update Bug' : 'Create Bug')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/bugs')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BugForm;