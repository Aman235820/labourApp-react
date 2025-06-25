import axios from 'axios';

const BASE_URL = 'http://localhost:4000/labourapp';

export const labourService = {
  // Get requested services for a labour
  getRequestedServices: async (labourId) => {
    try {
      const response = await axios.get(`${BASE_URL}/labour/showRequestedServices/${labourId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get reviews for a labour
  getReviews: async (labourId, sortBy, sortOrder) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/labour/showMyReviews/${labourId}?sortBy=${sortBy}&sortOrder=${sortOrder}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update booking status
  updateBookingStatus: async (labourId, bookingId, bookingStatusCode) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/labour/setBookingStatus?labourId=${labourId}&bookingId=${bookingId}&bookingStatusCode=${bookingStatusCode}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Show requested services
  showRequestedServices: async (labourId) => {
    try {
      const response = await axios.get(`${BASE_URL}/labour/showRequestedServices/${labourId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getLabourById: async (labourId) => {
    try {
      const response = await axios.get(`${BASE_URL}/labourReq/getLabourById/${labourId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  registerLabour: async (labourData, otp) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/registerLabour?otp=${otp}`, labourData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  loginLabour: async (mobileNumber, otp) => {
    try {
      const response = await axios.get(`${BASE_URL}/auth/labourLogin?mobileNumber=${mobileNumber}&otp=${otp}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  requestOTP: async (mobile, role) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/requestOTP`, { mobile, role });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteLabour: async (labourId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/admin/removeLabour/${labourId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

