import axios from 'axios';

const appUrl = process.env.REACT_APP_API_BASEURL;
const baseurl = `${appUrl}/labourapp/labourReq`;

export const searchLabourByCategory = async (category, pageNumber = 0, pageSize = 10, sortBy = "rating", sortOrder = "desc") => {
    try {
        // Properly encode the category parameter to handle special characters
        const encodedCategory = encodeURIComponent(category);
        const endpoint = `${baseurl}/findByCategory?category=${encodedCategory}`;
        console.log(endpoint);
        console.log('Pagination params:', { pageNumber, pageSize, sortBy, sortOrder });

        const response = await axios.post(endpoint, {
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