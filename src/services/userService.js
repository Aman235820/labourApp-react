import axios from 'axios';

const API_URL = 'http://localhost:4000/labourapp';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true // This is important for CORS
});

export const registerUser = async (userData, otp) => {
    try {
        const response = await api.post(`/auth/registerUser?otp=${otp}`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const loginUser = async ({ mobileNumber, otp }) => {
    try {
        const response = await api.post(`/auth/userLogin?otp=${otp}`, { mobileNumber });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const requestOTP = async (mobile, role) => {
    try {
        const response = await api.post('/auth/requestOTP', { mobile, role });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await api.delete(`/admin/removeUser/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}; 