import api from './config';

const contractorService = {
  // Get contractor profile
  getProfile: (contractorId) => api.get(`/contractor/${contractorId}`),
  
  // Update contractor profile
  updateProfile: (contractorId, profileData) => api.put(`/contractor/${contractorId}`, profileData),
  
  // Post a new job
  createJob: (jobData) => api.post('/jobs', jobData),
  
  // Get jobs posted by contractor
  getPostedJobs: (contractorId) => api.get(`/contractor/${contractorId}/jobs`),
  
  // Get applications for a specific job
  getJobApplications: (jobId) => api.get(`/jobs/${jobId}/applications`),
  
  // Update application status
  updateApplicationStatus: (jobId, applicationId, status) => 
    api.put(`/jobs/${jobId}/applications/${applicationId}`, { status }),
  
  // Delete a job posting
  deleteJob: (jobId) => api.delete(`/jobs/${jobId}`),
};

export default contractorService; 