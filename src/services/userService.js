import axios from 'axios';

const appUrl = process.env.REACT_APP_API_BASEURL;
const baseurl = `${appUrl}/labourapp`;

export const registerUser = async (userData, otp) => {
    try {
        const endpoint = `${baseurl}/auth/registerUser?otp=${otp}`;
        const response = await axios.post(endpoint, userData, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const loginUser = async ({ mobileNumber, otp }) => {
    try {
        const endpoint = `${baseurl}/auth/userLogin?otp=${otp}`;
        const response = await axios.post(endpoint, { mobileNumber }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const requestOTP = async (mobile, role) => {
    try {
        const endpoint = `${baseurl}/auth/requestOTP`;
        const response = await axios.post(endpoint, { mobile, role }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteUser = async (userId) => {
    try {
        const endpoint = `${baseurl}/admin/removeUser/${userId}`;
        const response = await axios.delete(endpoint, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}; 