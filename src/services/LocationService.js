const LocationService = {
  watchId: null,
  isWatching: false,

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
      console.log('setLocation called with coords:', coords);
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
            // Only update if location has changed significantly (more than ~10 kilometers)
            const latDiff = Math.abs(storedLat - newLat);
            const lonDiff = Math.abs(storedLon - newLon);
            if (latDiff < 0.09 && lonDiff < 0.09) {
              shouldUpdate = false;
              console.log('Location hasn\'t changed significantly, skipping update');
            }
          }
        } catch {}
      }
      
      if (shouldUpdate) {
        console.log('Location changed, updating...');
        const address = await this.getLocationFromCoordinates(coords.latitude, coords.longitude);
        console.log('Address received from API:', address);
        
        const locationData = { coords, address };
        console.log('Storing location data:', locationData);
        
        localStorage.setItem('userLocation', JSON.stringify(locationData));
        window.dispatchEvent(new Event('locationUpdated'));
        console.log('Location updated and event dispatched');
      }
    } catch (error) {
      console.error('Error setting location:', error);
    }
  },

  startWatchingLocation() {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    if (this.isWatching) {
      console.log('Already watching location');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // Cache for 1 minute
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        console.log('Location updated:', position.coords);
        this.setLocation(position.coords);
      },
      (error) => {
        console.error('Error watching location:', error);
        switch(error.code) {
          case error.PERMISSION_DENIED:
            console.error('User denied the request for Geolocation.');
            break;
          case error.POSITION_UNAVAILABLE:
            console.error('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            console.error('The request to get user location timed out.');
            break;
          default:
            console.error('An unknown error occurred.');
            break;
        }
      },
      options
    );

    this.isWatching = true;
    console.log('Started watching location with ID:', this.watchId);
  },

  stopWatchingLocation() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isWatching = false;
      console.log('Stopped watching location');
    }
  },

  async getCurrentLocation() {
    console.log('getCurrentLocation called');
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.error('Geolocation is not supported by this browser.');
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      console.log('Requesting current position...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Position received:', position.coords);
          this.setLocation(position.coords);
          resolve(position.coords);
        },
        (error) => {
          console.error('Geolocation error:', error);
          switch(error.code) {
            case error.PERMISSION_DENIED:
              console.error('User denied the request for Geolocation.');
              reject(new Error('Location permission denied. Please enable location access in your browser settings.'));
              break;
            case error.POSITION_UNAVAILABLE:
              console.error('Location information is unavailable.');
              reject(new Error('Location information is unavailable.'));
              break;
            case error.TIMEOUT:
              console.error('The request to get user location timed out.');
              reject(new Error('Location request timed out.'));
              break;
            default:
              console.error('An unknown error occurred.');
              reject(new Error('An unknown error occurred while getting location.'));
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  },

  // Clear stored location data
  clearLocation() {
    localStorage.removeItem('userLocation');
    localStorage.removeItem('recentLocations');
    window.dispatchEvent(new Event('locationUpdated'));
    console.log('Location data cleared');
  },

  // Manually set location with custom data
  setManualLocation(locationData) {
    localStorage.setItem('userLocation', JSON.stringify(locationData));
    window.dispatchEvent(new Event('locationUpdated'));
    console.log('Manual location set:', locationData);
  }
};

export default LocationService; 