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
  }
}; 