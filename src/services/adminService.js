import axios from 'axios';

export const adminService = {
  getAllLabours: async (pageNumber, pageSize, sortBy, sortOrder) => {
    const response = await axios.post('http://localhost:4000/labourapp/admin/getAllLabours', {
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
    const response = await axios.get(`http://localhost:4000/labourapp/labourReq/getLabourById/${labourId}`);
    return response.data;
  },

  getAllUsers: async (pageNumber, pageSize, sortBy, sortOrder) => {
    const response = await axios.post('http://localhost:4000/labourapp/admin/getAllUsers', {
      pageNumber: pageNumber,
      pageSize: pageSize,
      sortBy: sortBy,
      sortOrder: sortOrder,
    });
    return response.data;
  },

  removeLabour: async (labourId) => {
    const response = await axios.delete(`http://localhost:4000/labourapp/admin/removeLabour/${labourId}`);
    return response.data;
  },

  removeUser: async (userId) => {
    const response = await axios.delete(`http://localhost:4000/labourapp/admin/removeUser/${userId}`);
    return response.data;
  },

  getAllBookings: async (pageNumber, pageSize, sortBy, sortOrder) => {
    const response = await axios.post('http://localhost:4000/labourapp/admin/getAllBookings', {
      pageNumber: pageNumber,
      pageSize: pageSize,
      sortBy: sortBy,
      sortOrder: sortOrder,
    });
    return response.data;
  },

  deleteBooking: async (bookingId) => {
    const response = await axios.delete(`http://localhost:4000/labourapp/admin/deleteBooking/${bookingId}`, {
      data: ''  // Adding empty data as per the API specification
    });
    return response.data;
  },

  getAppStats: async () => {
    const response = await axios.get('http://localhost:4000/labourapp/admin/getAppStats');
    return response.data;
  },

  uploadLabours: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post('http://localhost:4000/labourapp/admin/uploadLabours', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
}; 