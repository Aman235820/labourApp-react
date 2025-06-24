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
  },

  async setLocation(coords) {
    try {
      const round2 = (num) => Math.round(num * 100) / 100;
      const newLat = round2(coords.latitude);
      const newLon = round2(coords.longitude);
      const stored = localStorage.getItem('userLocation');
      let shouldUpdate = true;
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.coords) {
            const storedLat = round2(parsed.coords.latitude);
            const storedLon = round2(parsed.coords.longitude);
            if (storedLat === newLat && storedLon === newLon) {
              shouldUpdate = false;
            }
          }
        } catch {}
      }
      if (shouldUpdate) {
        const address = await this.getLocationFromCoordinates(coords.latitude, coords.longitude);
        localStorage.setItem('userLocation', JSON.stringify({ coords, address }));
        window.dispatchEvent(new Event('locationUpdated'));
      }
    } catch (error) {
      console.error('Error setting location:', error);
    }
  }
};

export default LocationService; 