import axios from 'axios';

const BASE_URL = 'http://localhost:4000/labourapp/labourReq';

export const searchLabourByCategory = async (category, pageNumber = 0, pageSize = 10, sortBy = "rating", sortOrder = "desc") => {
    try {
        console.log(`${BASE_URL}/findByCategory?category=${category}`);
        console.log('Pagination params:', { pageNumber, pageSize, sortBy, sortOrder });

        const response = await axios.post(`${BASE_URL}/findByCategory?category=${category}`, {
            pageNumber,
            pageSize,
            sortBy,
            sortOrder
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch labor search results');
    }
}; 