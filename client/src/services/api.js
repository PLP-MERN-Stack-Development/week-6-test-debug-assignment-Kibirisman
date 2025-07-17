import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data) {
      console.log('📤 Request Data:', config.data);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging and error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    console.log('📥 Response Data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          console.error('Bad Request:', data.error || data.message);
          break;
        case 401:
          console.error('Unauthorized:', data.error || data.message);
          break;
        case 403:
          console.error('Forbidden:', data.error || data.message);
          break;
        case 404:
          console.error('Not Found:', data.error || data.message);
          break;
        case 422:
          console.error('Validation Error:', data.details || data.error);
          break;
        case 500:
          console.error('Server Error:', data.error || data.message);
          break;
        default:
          console.error('Unknown Error:', data.error || data.message);
      }
    } else if (error.request) {
      // Network error
      console.error('Network Error:', error.message);
    } else {
      // Other error
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Bug API endpoints
export const bugAPI = {
  // Get all bugs with filters
  getBugs: (params = {}) => {
    return api.get('/bugs', { params });
  },

  // Get single bug
  getBug: (id) => {
    return api.get(`/bugs/${id}`);
  },

  // Create new bug
  createBug: (bugData) => {
    return api.post('/bugs', bugData);
  },

  // Update existing bug
  updateBug: (id, bugData) => {
    return api.put(`/bugs/${id}`, bugData);
  },

  // Delete bug
  deleteBug: (id) => {
    return api.delete(`/bugs/${id}`);
  },

  // Assign bug to user
  assignBug: (id, assignee) => {
    return api.put(`/bugs/${id}/assign`, { assignee });
  },

  // Resolve bug
  resolveBug: (id, resolution) => {
    return api.put(`/bugs/${id}/resolve`, resolution);
  },

  // Get bug statistics
  getBugStats: () => {
    return api.get('/bugs/stats');
  },
};

// Health check endpoint
export const healthAPI = {
  check: () => {
    return api.get('/health');
  },
};

export default api;