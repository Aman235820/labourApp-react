import React, { createContext, useState, useContext, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { 
  storeStatsData, 
  getStoredStatsData, 
  isDataFromSevenDaysAgo, 
  calculateGrowthPercentage,
  formatDate 
} from '../utils/statsUtils';

const StatsContext = createContext();

export const StatsProvider = ({ children }) => {
  const [statsData, setStatsData] = useState({
    current: {
      users: 0,
      labours: 0,
      bookings: 0
    },
    previous: {
      users: 0,
      labours: 0,
      bookings: 0
    },
    growth: {
      users: 0,
      labours: 0,
      bookings: 0
    },
    isLoading: false,
    error: null,
    lastUpdated: null
  });

  // Fetch current stats
  const fetchCurrentStats = async () => {
    try {
      setStatsData(prev => ({ ...prev, isLoading: true, error: null }));

      // Fetch current counts
      const [usersResponse, laboursResponse, bookingsResponse] = await Promise.all([
        adminService.getAllUsers(0, 1, 'userId', 'asc'),
        adminService.getAllLabours(0, 1, 'labourId', 'asc'),
        adminService.getAllBookings(0, 1, 'bookingId', 'asc')
      ]);

      const currentStats = {
        users: usersResponse?.totalElements || 0,
        labours: laboursResponse?.totalElements || 0,
        bookings: bookingsResponse?.totalElements || 0
      };

      // Get previous week's data from localStorage
      const storedData = getStoredStatsData();
      let previousStats = currentStats; // Default to current if no previous data

      if (storedData && isDataFromSevenDaysAgo(storedData)) {
        previousStats = storedData.stats;
      }

      // Calculate growth percentages
      const growthStats = {
        users: calculateGrowthPercentage(currentStats.users, previousStats.users),
        labours: calculateGrowthPercentage(currentStats.labours, previousStats.labours),
        bookings: calculateGrowthPercentage(currentStats.bookings, previousStats.bookings)
      };

      const newStatsData = {
        current: currentStats,
        previous: previousStats,
        growth: growthStats,
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      };

      setStatsData(newStatsData);

      // Store current data for future comparison (7 days from now)
      storeStatsData(currentStats);

    } catch (error) {
      console.error('Error fetching stats:', error);
      setStatsData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to fetch statistics'
      }));
    }
  };

  // Initialize stats on mount
  useEffect(() => {
    fetchCurrentStats();
  }, []);

  // Refresh stats function
  const refreshStats = () => {
    fetchCurrentStats();
  };

  const value = {
    statsData,
    refreshStats
  };

  return (
    <StatsContext.Provider value={value}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStats = () => {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
}; 