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


