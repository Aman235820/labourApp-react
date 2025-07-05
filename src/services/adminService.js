import axios from 'axios';

const appUrl = process.env.REACT_APP_API_BASEURL;
const baseurl = `${appUrl}/labourapp`;

export const adminService = {
  getAllLabours: async (pageNumber, pageSize, sortBy, sortOrder) => {
    const endpoint = `${baseurl}/admin/getAllLabours`;
    const response = await axios.post(endpoint, {
      pageNumber,
      pageSize,
      sortBy,
      sortOrder
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  getLabourById: async (labourId) => {
    const endpoint = `${baseurl}/labourReq/getLabourById/${labourId}`;
    const response = await axios.get(endpoint);
    return response.data;
  },

  getAllUsers: async (pageNumber, pageSize, sortBy, sortOrder) => {
    const endpoint = `${baseurl}/admin/getAllUsers`;
    const response = await axios.post(endpoint, {
      pageNumber: pageNumber,
      pageSize: pageSize,
      sortBy: sortBy,
      sortOrder: sortOrder,
    });
    return response.data;
  },

  removeLabour: async (labourId) => {
    const endpoint = `${baseurl}/admin/removeLabour/${labourId}`;
    const response = await axios.delete(endpoint);
    return response.data;
  },

  removeUser: async (userId) => {
    const endpoint = `${baseurl}/admin/removeUser/${userId}`;
    const response = await axios.delete(endpoint);
    return response.data;
  },

  getAllBookings: async (pageNumber, pageSize, sortBy, sortOrder) => {
    const endpoint = `${baseurl}/admin/getAllBookings`;
    const response = await axios.post(endpoint, {
      pageNumber: pageNumber,
      pageSize: pageSize,
      sortBy: sortBy,
      sortOrder: sortOrder,
    });
    return response.data;
  },

  deleteBooking: async (bookingId) => {
    const endpoint = `${baseurl}/admin/deleteBooking/${bookingId}`;
    const response = await axios.delete(endpoint, {
      data: ''  // Adding empty data as per the API specification
    });
    return response.data;
  },

  getAppStats: async () => {
    const endpoint = `${baseurl}/admin/getAppStats`;
    const response = await axios.get(endpoint);
    return response.data;
  },

  uploadLabours: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const endpoint = `${baseurl}/admin/uploadLabours`;
    const response = await axios.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
}; 