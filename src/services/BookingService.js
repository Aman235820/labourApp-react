import axios from 'axios';

const appUrl = process.env.REACT_APP_API_BASEURL;
const baseurl = `${appUrl}/labourapp/user`;

export const bookLabour = async (bookingData) => {
    try {
        const endpoint = `${baseurl}/bookLabour`;
        const response = await axios.post(endpoint, bookingData, {
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
        const endpoint = `${baseurl}/viewMyBookings/${userId}`;
        const response = await axios.get(endpoint);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
    }
};

export const rateLabour = async (ratingData) => {
    try {
        const endpoint = `${baseurl}/rateLabour`;
        const response = await axios.post(endpoint, ratingData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to rate labour');
    }
}; 