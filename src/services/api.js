import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000'; // Update this with your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication endpoints
export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Labour endpoints
export const labour = {
  getProfile: () => api.get('/labour/profile'),
  updateProfile: (data) => api.put('/labour/profile', data),
  searchJobs: (filters) => api.get('/jobs', { params: filters }),
  applyForJob: (jobId) => api.post(`/jobs/${jobId}/apply`),
};

// Contractor endpoints
export const contractor = {
  getProfile: () => api.get('/contractor/profile'),
  updateProfile: (data) => api.put('/contractor/profile', data),
  postJob: (jobData) => api.post('/jobs', jobData),
  getPostedJobs: () => api.get('/contractor/jobs'),
  getApplications: (jobId) => api.get(`/jobs/${jobId}/applications`),
  updateApplicationStatus: (jobId, applicationId, status) =>
    api.put(`/jobs/${jobId}/applications/${applicationId}`, { status }),
};

export default api; 