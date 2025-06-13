import axios from 'axios';

const BASE_URL = 'http://localhost:4000/labourapp/labour';

export const labourAuthService = {
  login: async (mobileNumber) => {
    const response = await axios.get(`${BASE_URL}/labourLogin?mobileNumber=${mobileNumber}`);
    return response.data;
  },

  register: async (formData) => {
    const response = await axios.post(`${BASE_URL}/registerLabour`, formData);
    return response.data;
  }
}; 