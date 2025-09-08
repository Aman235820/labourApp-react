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

  // Update one or many enterprise fields (backend accepts partial payload)
  updateEnterpriseFields: async (enterpriseId, partialPayload, token) => {
    try {
      const endpoint = `${baseurl}/enterprise/updateEnterpriseField/${enterpriseId}`;
      const response = await axios.patch(
        endpoint,
        partialPayload,
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

  // Backwards-compatible helper that updates a single field using the same endpoint
  updateEnterpriseField: async (enterpriseId, field, value, token) => {
    return await (async () => {
      const payload = { [field]: value };
      return await enterpriseService.updateEnterpriseFields(enterpriseId, payload, token);
    })();
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
  },

  findEnterpriseById: async (enterpriseId, token) => {
    try {
      const endpoint = `${baseurl}/enterprise/findEnterpriseById/${enterpriseId}`;
      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};


