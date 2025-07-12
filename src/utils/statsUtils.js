// Utility functions for stats management

/**
 * Store current stats data with timestamp
 * @param {Object} stats - Current stats data
 */
export const storeStatsData = (stats) => {
  const data = {
    stats,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('statsData', JSON.stringify(data));
};

/**
 * Retrieve stored stats data
 * @returns {Object|null} - Stored stats data or null if not found/invalid
 */
export const getStoredStatsData = () => {
  try {
    const stored = localStorage.getItem('statsData');
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    return data;
  } catch (error) {
    console.error('Error parsing stored stats data:', error);
    return null;
  }
};

/**
 * Check if stored data is from 7 days ago or more
 * @param {Object} storedData - Stored stats data
 * @returns {boolean} - True if data is from 7+ days ago
 */
export const isDataFromSevenDaysAgo = (storedData) => {
  if (!storedData || !storedData.timestamp) return false;
  
  const storedDate = new Date(storedData.timestamp);
  const now = new Date();
  const daysDiff = Math.floor((now - storedDate) / (1000 * 60 * 60 * 24));
  
  return daysDiff >= 7;
};

/**
 * Calculate growth percentage between two values
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} - Growth percentage (rounded)
 */
export const calculateGrowthPercentage = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
};

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string in dd-mmm-yyyy format
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Format as dd-mmm-yyyy
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en', { month: 'short' });
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Get days difference between two dates
 * @param {string} dateString1 - First date (ISO string)
 * @param {string} dateString2 - Second date (ISO string)
 * @returns {number} - Days difference
 */
export const getDaysDifference = (dateString1, dateString2) => {
  try {
    const date1 = new Date(dateString1);
    const date2 = new Date(dateString2);
    return Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));
  } catch (error) {
    return 0;
  }
}; 