import axios from 'axios';

const appUrl = process.env.REACT_APP_API_BASEURL;
const baseurl = `${appUrl}/labourapp`;

export const labourService = {
  // Get requested services for a labour
  getRequestedServices: async (labourId) => {
    try {
      const endpoint = `${baseurl}/labour/showRequestedServices/${labourId}`;
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get reviews for a labour
  getReviews: async (labourId, sortBy = 'reviewTime', sortOrder = 'desc') => {
    try {
      const endpoint = `${baseurl}/labour/showMyReviews/${labourId}?sortBy=${sortBy}&sortOrder=${sortOrder}`;
      
      // Get auth token if available (you might need to adjust this based on your auth implementation)
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else if (storedUser) {
        // Try to get token from user object
        const userData = JSON.parse(storedUser);
        if (userData.token) {
          headers.Authorization = `Bearer ${userData.token}`;
        }
      }
      
      const response = await axios.get(endpoint, { headers });
      
      // Check if the API returned an error
      if (response.data.hasError) {
        throw new Error(response.data.message || 'Failed to fetch reviews');
      }
      
      // Return the actual data from returnValue
      return response.data.returnValue || [];
    } catch (error) {
      console.error('Reviews API error:', error.message);
      // Return empty array instead of throwing to prevent breaking the page
      return [];
    }
  },

  // Get overall ratings for a labour
  getOverallRatings: async (labourId) => {
    try {
      const endpoint = `${baseurl}/labour/showMyRatings/${labourId}`;
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update booking status
  updateBookingStatus: async (labourId, bookingId, bookingStatusCode) => {
    try {
      const endpoint = `${baseurl}/labour/setBookingStatus?labourId=${labourId}&bookingId=${bookingId}&bookingStatusCode=${bookingStatusCode}`;
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Show requested services
  showRequestedServices: async (labourId) => {
    try {
      const endpoint = `${baseurl}/labour/showRequestedServices/${labourId}`;
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getLabourById: async (labourId) => {
    try {
      const endpoint = `${baseurl}/labourReq/getLabourById/${labourId}`;
      const response = await axios.get(endpoint);
      
      // Check if the API returned an error
      if (response.data.hasError) {
        throw new Error(response.data.message || 'Failed to fetch labour details');
      }
      
      // Return the actual data from returnValue
      return response.data.returnValue;
    } catch (error) {
      throw error;
    }
  },

  registerLabour: async (labourData, otp) => {
    try {
      const endpoint = `${baseurl}/auth/registerLabour?otp=${otp}`;
      const response = await axios.post(endpoint, labourData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  loginLabour: async (mobileNumber, otp) => {
    try {
      const endpoint = `${baseurl}/auth/labourLogin?mobileNumber=${mobileNumber}&otp=${otp}`;
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  requestOTP: async (mobile, role) => {
    try {
      const endpoint = `${baseurl}/auth/requestOTP`;
      const response = await axios.post(endpoint, { mobile, role });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteLabour: async (labourId) => {
    try {
      const endpoint = `${baseurl}/admin/removeLabour/${labourId}`;
      const response = await axios.delete(endpoint);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update labour details
  updateLabourDetails: async (labourData) => {
    try {
      const endpoint = `${baseurl}/labour/updateLabourDetails`;
      const response = await axios.patch(endpoint, labourData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get additional labour details (profile settings)
  getAdditionalLabourDetails: async (labourId) => {
    try {
      const endpoint = `${baseurl}/labour/getAdditionalLabourDetails/${labourId}`;
      const response = await axios.get(endpoint);
      
      // Check if the API returned an error
      if (response.data.hasError) {
        throw new Error(response.data.message || 'Failed to fetch additional labour details');
      }
      
      // Return the actual data from returnValue
      return response.data.returnValue;
    } catch (error) {
      console.error('Error fetching additional labour details:', error);
      // Return null instead of throwing to prevent breaking the page
      return null;
    }
  }
};

