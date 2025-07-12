# Stats System Documentation

## Overview

The stats system has been implemented using React Context API to store and manage user, labour, and booking counts with 7-day growth calculations.

## Features

### 1. Context API Implementation
- **StatsContext**: Centralized state management for statistics
- **StatsProvider**: Wraps the entire app to provide stats data
- **useStats Hook**: Custom hook to access stats data throughout the app

### 2. 7-Day Growth Tracking
- Stores current counts in localStorage with timestamp
- Compares current data with data from 7 days ago
- Calculates growth percentages for users, labourers, and bookings
- Shows growth indicators (up/down arrows) with percentages

### 3. Data Storage
- Uses localStorage to persist data between sessions
- Stores data with timestamp for accurate 7-day comparison
- Automatically updates stored data when new stats are fetched

## File Structure

```
src/
├── context/
│   └── StatsContext.js          # Main context provider
├── utils/
│   └── statsUtils.js            # Utility functions
├── components/
│   └── AdminStats.js            # Updated to use context
└── styles/
    └── AdminStats.css           # Updated styles
```

## Key Components

### StatsContext.js
- Manages stats state (current, previous, growth)
- Fetches data from admin APIs
- Calculates growth percentages
- Stores data in localStorage

### statsUtils.js
- `storeStatsData()`: Store stats with timestamp
- `getStoredStatsData()`: Retrieve stored data
- `isDataFromSevenDaysAgo()`: Check if data is old enough
- `calculateGrowthPercentage()`: Calculate growth
- `formatDate()`: Format dates for display

### AdminStats.js
- Uses `useStats()` hook to access context data
- Displays current counts and growth percentages
- Shows previous week data for comparison
- Includes refresh functionality

## How It Works

1. **Initial Load**: 
   - Fetches current counts from APIs
   - Checks localStorage for previous data
   - If data is 7+ days old, uses it for comparison
   - Otherwise, uses current data as baseline

2. **Growth Calculation**:
   - Compares current vs previous counts
   - Calculates percentage change
   - Shows positive/negative/neutral indicators

3. **Data Storage**:
   - Stores current data with timestamp
   - Data becomes "previous" after 7 days
   - Enables accurate growth tracking

## Usage

### In Components
```javascript
import { useStats } from '../context/StatsContext';

const MyComponent = () => {
  const { statsData, refreshStats } = useStats();
  
  // Access current counts
  const { users, labours, bookings } = statsData.current;
  
  // Access growth percentages
  const { users: userGrowth, labours: labourGrowth, bookings: bookingGrowth } = statsData.growth;
  
  // Refresh data
  const handleRefresh = () => {
    refreshStats();
  };
};
```

### Growth Indicators
- **Positive Growth**: Green up arrow with "+X%"
- **Negative Growth**: Red down arrow with "-X%"
- **No Change**: Gray clock icon with "0%"

## Benefits

1. **Centralized Data**: All stats data managed in one place
2. **Real Growth Tracking**: Actual 7-day comparisons, not random numbers
3. **Persistent Storage**: Data survives page refreshes
4. **Automatic Updates**: Context updates all components automatically
5. **Clean Architecture**: Separated concerns with utilities and context

## Future Enhancements

1. **Historical Data**: Store multiple data points for trend analysis
2. **Charts**: Add time-series charts showing growth over time
3. **Notifications**: Alert when growth exceeds thresholds
4. **Export**: Allow exporting stats data
5. **Real-time Updates**: WebSocket integration for live updates 