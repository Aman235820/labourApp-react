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

export const registerUser = async (userData) => {
    try {
        const response = await api.post('/user/registerUser', userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await api.post('/user/userLogin', credentials);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}; 