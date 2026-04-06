import axios from 'axios';

const fallbackBaseUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:4000'
    : 'https://labourapp.onrender.com';
const appUrl = process.env.REACT_APP_API_BASEURL || fallbackBaseUrl;
const baseurl = `${appUrl}/labourapp/labourReq`;

/**
 * POST /labourReq/findByCategory
 * @param {string} category
 * @param {number} pageNumber
 * @param {number} pageSize
 * @param {string} sortBy
 * @param {string} sortOrder
 * @param {{ isExactMatch?: boolean }} [options] — set isExactMatch when user picks a concrete service
 *   (e.g. subservices pill). Do not set for free-text search box flows.
 */
export const searchLabourByCategory = async (
  category,
  pageNumber = 0,
  pageSize = 10,
  sortBy = 'rating',
  sortOrder = 'desc',
  options = {}
) => {
  try {
    const isExactMatch = Boolean(options?.isExactMatch);
    const params = new URLSearchParams();
    if (isExactMatch) {
      params.set('isExactMatch', 'true');
    }
    params.set('category', category);
    const endpoint = `${baseurl}/findByCategory?${params.toString()}`;

    const response = await axios.post(
      endpoint,
      {
        pageNumber,
        pageSize,
        sortBy,
        sortOrder,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch labor search results');
  }
};
