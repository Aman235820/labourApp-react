import axios from 'axios';

const BASE_URL = 'http://localhost:4000/labourapp/user';

export const bookLabour = async (bookingData) => {
    try {
        const response = await axios.post(`${BASE_URL}/bookLabour`, bookingData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to book labour');
    }
};

export const getUserBookings = async (userId) => {
    try {
        const response = await axios.get(`${BASE_URL}/viewMyBookings/${userId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
    }
}; 