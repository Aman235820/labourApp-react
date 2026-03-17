import axios from 'axios';

const fallbackBaseUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:4000'
    : 'https://labourapp.onrender.com';
const appUrl = process.env.REACT_APP_API_BASEURL || fallbackBaseUrl;
const baseurl = `${appUrl}/labourapp`;

const unwrapResponseDTO = (data) => {
    if (data && typeof data === 'object' && data.hasError === true) {
        throw data;
    }
    return data;
};

const normalizeAxiosError = (error) => error?.response?.data ?? error;

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
        return unwrapResponseDTO(response.data);
    } catch (error) {
        throw normalizeAxiosError(error);
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
        return unwrapResponseDTO(response.data);
    } catch (error) {
        throw normalizeAxiosError(error);
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
        return unwrapResponseDTO(response.data);
    } catch (error) {
        throw normalizeAxiosError(error);
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
        return unwrapResponseDTO(response.data);
    } catch (error) {
        throw normalizeAxiosError(error);
    }
}; 