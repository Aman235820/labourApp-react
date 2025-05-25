import api from './config';

const labourService = {
  // Get all available jobs
  getAllJobs: () => api.get('/jobs'),
  
  // Get job by ID
  getJobById: (jobId) => api.get(`/jobs/${jobId}`),
  
  // Apply for a job
  applyForJob: (jobId, applicationData) => api.post(`/jobs/${jobId}/apply`, applicationData),
  
  // Get labour profile
  getProfile: (labourId) => api.get(`/labour/${labourId}`),
  
  // Update labour profile
  updateProfile: (labourId, profileData) => api.put(`/labour/${labourId}`, profileData),
  
  // Get applied jobs
  getAppliedJobs: (labourId) => api.get(`/labour/${labourId}/applications`),
};

export default labourService; 