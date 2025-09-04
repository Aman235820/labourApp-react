import axios from 'axios';

const appUrl = process.env.REACT_APP_API_BASEURL || 'https://labourapp.onrender.com';
const baseurl = `${appUrl}/labourapp`;

export const enterpriseService = {
  registerEnterprise: async (enterpriseData, otp) => {
    try {
      const endpoint = `${baseurl}/enterprise/registerEnterprise?otp=${otp}`;
      const response = await axios.post(endpoint, enterpriseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update a single field for an enterprise
  // field: string, value: any
  // Uses PATCH semantics to only update the provided field
  updateEnterpriseField: async (enterpriseId, field, value, token) => {
    try {
      const endpoint = `${baseurl}/enterprise/updateField/${enterpriseId}`;
      const response = await axios.patch(
        endpoint,
        { field, value },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateEnterpriseDetails: async (enterpriseId, detailsData, token) => {
    try {
      const endpoint = `${baseurl}/enterprise/updateDetails/${enterpriseId}`;
      const response = await axios.put(endpoint, detailsData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  completeRegistration: async (completeData, otp) => {
    try {
      const endpoint = `${baseurl}/enterprise/completeRegistration?otp=${otp}`;
      const response = await axios.post(endpoint, completeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  loginEnterprise: async (mobileNumber, otp) => {
    try {
      const endpoint = `${baseurl}/enterprise/enterpriseLogin?mobileNumber=${mobileNumber}&otp=${otp}`;
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  requestOTP: async (mobile, role = 'ENTERPRISE') => {
    try {
      const endpoint = `${baseurl}/auth/requestOTP`;
      const response = await axios.post(endpoint, { mobile, role });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};


