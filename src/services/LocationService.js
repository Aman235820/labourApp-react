const LocationService = {
  async getLocationFromCoordinates(latitude, longitude) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            'User-Agent': 'LabourApp/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching location:', error);
      throw error;
    }
  }
};

export default LocationService; 