import api from './config';

const jobService = {
  // Get all jobs
  getAllJobs: () => api.get('/jobs'),
  
  // Get job by ID
  getJobById: (jobId) => api.get(`/jobs/${jobId}`),
  
  // Search jobs with filters
  searchJobs: (filters) => api.get('/jobs/search', { params: filters }),
  
  // Get jobs by category
  getJobsByCategory: (category) => api.get(`/jobs/category/${category}`),
  
  // Get jobs by location
  getJobsByLocation: (location) => api.get(`/jobs/location/${location}`),
};

export default jobService; 