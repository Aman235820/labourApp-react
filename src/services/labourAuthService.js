import axios from 'axios';

/** Set REACT_APP_API_BASEURL in .env (API origin only). */
const appUrl = String(process.env.REACT_APP_API_BASEURL || '').replace(/\/$/, '');
const baseurl = `${appUrl}/api/labour`;

export const labourAuthService = {
  login: async (mobileNumber) => {
    const endpoint = `${baseurl}/labourLogin?mobileNumber=${mobileNumber}`;
    const response = await axios.get(endpoint);
    return response.data;
  },

  register: async (formData) => {
    const endpoint = `${baseurl}/register`;
    const response = await axios.post(endpoint, formData);
    return response.data;
  }
}; 