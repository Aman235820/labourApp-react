import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, InputGroup, ListGroup, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { FaMapMarkerAlt, FaSearch, FaLocationArrow, FaTimes, FaMapPin, FaEdit } from 'react-icons/fa';
import LocationService from '../services/LocationService';
import { useTranslation } from 'react-i18next';
import '../styles/LocationModal.css';

const LocationModal = ({ show, onHide, onLocationSelect }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('detect'); // 'detect', 'search', 'manual'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [error, setError] = useState('');
  const [recentLocations, setRecentLocations] = useState([]);
  const [manualAddress, setManualAddress] = useState({
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Debounced search function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSearch = useCallback(
    debounce((query) => {
      handleSearch(query);
    }, 500),
    []
  );

  useEffect(() => {
    if (show) {
      loadRecentLocations();
      loadCurrentLocation();
      setError(''); // Clear any previous errors
    }
  }, [show]);

  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, debouncedSearch]);

  const loadRecentLocations = () => {
    const recent = JSON.parse(localStorage.getItem('recentLocations') || '[]');
    setRecentLocations(recent);
  };

  const loadCurrentLocation = () => {
    const currentLocation = localStorage.getItem('userLocation');
    if (currentLocation) {
      try {
        const parsed = JSON.parse(currentLocation);
        setDetectedLocation(parsed);
      } catch (error) {
        console.error('Error parsing current location:', error);
      }
    }
  };

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    setError('');
    
    try {
      const coords = await LocationService.getCurrentLocation();
      const address = await LocationService.getLocationFromCoordinates(coords.latitude, coords.longitude);
      
      const locationData = { coords, address };
      setDetectedLocation(locationData);
      
      // Store in localStorage
      localStorage.setItem('userLocation', JSON.stringify(locationData));
      window.dispatchEvent(new Event('locationUpdated'));
      
    } catch (error) {
      setError(error.message || 'Failed to detect location. Please try again or search manually.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&countrycodes=in&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'LabourApp/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search locations');
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      setError('Failed to search locations. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = (location) => {
    let formattedLocation;
    
    if (location.coords) {
      // Auto-detected location
      formattedLocation = {
        coords: location.coords,
        address: location.address,
        displayName: getDisplayName(location.address)
      };
    } else if (location.lat && location.lon) {
      // Search result
      const cityName = location.address?.city || location.address?.town || location.address?.village || 
                      location.display_name.split(',')[0] || 'Unknown';
      formattedLocation = {
        coords: { latitude: parseFloat(location.lat), longitude: parseFloat(location.lon) },
        address: { display_name: location.display_name, ...location.address },
        displayName: cityName
      };
    } else {
      // Manual entry
      formattedLocation = {
        coords: null,
        address: manualAddress,
        displayName: `${manualAddress.area}, ${manualAddress.city}`
      };
    }

    // Save to recent locations
    saveToRecentLocations(formattedLocation);
    
    // Store as current location
    localStorage.setItem('userLocation', JSON.stringify(formattedLocation));
    window.dispatchEvent(new Event('locationUpdated'));
    
    if (onLocationSelect) {
      onLocationSelect(formattedLocation);
    }
    
    onHide();
  };

  const saveToRecentLocations = (location) => {
    const recent = JSON.parse(localStorage.getItem('recentLocations') || '[]');
    const newRecent = [location, ...recent.filter(r => r.displayName !== location.displayName)].slice(0, 5);
    localStorage.setItem('recentLocations', JSON.stringify(newRecent));
  };

  const getDisplayName = (address) => {
    if (address.address) {
      const city = address.address.city || address.address.town || address.address.village || '';
      const area = address.address.suburb || address.address.neighbourhood || address.address.road || '';
      return area && city ? `${area}, ${city}` : city || address.display_name;
    }
    return address.display_name || 'Unknown location';
  };

  const handleManualSubmit = () => {
    if (!manualAddress.city || !manualAddress.area) {
      setError('Please fill in at least the area and city fields.');
      return;
    }
    handleLocationSelect(manualAddress);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const formatSearchResult = (result) => {
    const parts = result.display_name.split(',');
    const mainLocation = parts[0];
    const subLocation = parts.slice(1, 3).join(',').trim();
    
    return {
      main: mainLocation,
      sub: subLocation || result.type
    };
  };

  const renderDetectTab = () => (
    <div className="location-tab-content">
      <div className="text-center mb-4">
        <FaLocationArrow className="location-icon mb-3" />
        <h5>{t('locationModal.autoDetectYourLocation')}</h5>
        <p className="text-muted">{t('locationModal.useDeviceLocation')}</p>
      </div>
      
      {detectedLocation && (
        <div className="detected-location mb-3">
          <div className="d-flex align-items-center">
            <FaMapPin className="text-success me-2" />
            <div>
              <strong>{t('locationModal.currentLocation')}</strong>
              <div className="text-muted">{getDisplayName(detectedLocation.address)}</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="d-grid gap-2">
        <Button 
          variant="primary" 
          onClick={handleAutoDetect}
          disabled={isDetecting}
          className="detect-btn"
        >
          {isDetecting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {t('locationModal.detecting')}
            </>
          ) : (
            <>
              <FaLocationArrow className="me-2" />
              {t('locationModal.detectMyLocation')}
            </>
          )}
        </Button>
        
        {detectedLocation && (
          <Button 
            variant="success" 
            onClick={() => handleLocationSelect(detectedLocation)}
            className="use-location-btn"
          >
            <FaMapPin className="me-2" />
            {t('locationModal.useThisLocation')}
          </Button>
        )}
      </div>
    </div>
  );

  const renderSearchTab = () => (
    <div className="location-tab-content">
      <div className="search-section mb-4">
        <InputGroup className="search-input-group">
          <Form.Control
            type="text"
            placeholder={t('locationModal.searchForArea')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <Button variant="outline-secondary" onClick={clearSearch} className="clear-btn">
            <FaTimes />
          </Button>
        </InputGroup>
      </div>

      {isSearching && (
        <div className="text-center mb-3">
          <Spinner animation="border" size="sm" className="me-2" />
          {t('locationModal.searching')}
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="search-results">
          <h6 className="mb-3">{t('locationModal.searchResults')}</h6>
          <ListGroup className="search-results-list">
            {searchResults.map((result, index) => {
              const formatted = formatSearchResult(result);
              return (
                <ListGroup.Item
                  key={index}
                  action
                  onClick={() => handleLocationSelect(result)}
                  className="search-result-item"
                >
                  <div className="d-flex align-items-center">
                    <FaMapPin className="text-primary me-3" />
                    <div className="flex-grow-1">
                      <div className="fw-medium">{formatted.main}</div>
                      <small className="text-muted">{formatted.sub}</small>
                    </div>
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </div>
      )}

      {recentLocations.length > 0 && !searchQuery && (
        <div className="recent-locations">
          <h6 className="mb-3">Recent Locations</h6>
          <ListGroup className="recent-locations-list">
            {recentLocations.map((location, index) => (
              <ListGroup.Item
                key={index}
                action
                onClick={() => handleLocationSelect(location)}
                className="recent-location-item"
              >
                <div className="d-flex align-items-center">
                  <FaMapMarkerAlt className="text-secondary me-3" />
                  <div>
                    <div className="fw-medium">{location.displayName}</div>
                    <small className="text-muted">Recent</small>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      )}
    </div>
  );

  const renderManualTab = () => (
    <div className="location-tab-content">
      <div className="manual-form">
        <h6 className="mb-3">{t('locationModal.enterAddressManually')}</h6>
        
        <Form>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('locationModal.streetBuilding')}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={t('locationModal.enterStreetBuilding')}
                  value={manualAddress.street}
                  onChange={(e) => setManualAddress({...manualAddress, street: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('locationModal.areaLocality')}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={t('locationModal.enterAreaLocality')}
                  value={manualAddress.area}
                  onChange={(e) => setManualAddress({...manualAddress, area: e.target.value})}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('locationModal.city')}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={t('locationModal.enterCityName')}
                  value={manualAddress.city}
                  onChange={(e) => setManualAddress({...manualAddress, city: e.target.value})}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('locationModal.state')}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={t('locationModal.enterStateName')}
                  value={manualAddress.state}
                  onChange={(e) => setManualAddress({...manualAddress, state: e.target.value})}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('locationModal.pinCode')}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={t('locationModal.enterPinCode')}
                  value={manualAddress.pincode}
                  onChange={(e) => setManualAddress({...manualAddress, pincode: e.target.value})}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
        
        <div className="d-grid">
          <Button 
            variant="primary" 
            onClick={handleManualSubmit}
            disabled={!manualAddress.city || !manualAddress.area}
            className="submit-manual-btn"
          >
            <FaEdit className="me-2" />
            {t('locationModal.useThisAddress')}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg" 
      centered
      className="location-modal"
    >
      <Modal.Header closeButton className="location-modal-header">
        <Modal.Title>
          <FaMapMarkerAlt className="me-2" />
          {t('locationModal.selectYourLocation')}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="location-modal-body">
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}
        
        <div className="location-tabs">
          <div className="tab-buttons mb-4">
            <Button
              variant={activeTab === 'detect' ? 'primary' : 'outline-primary'}
              onClick={() => setActiveTab('detect')}
              className="tab-btn"
            >
              <FaLocationArrow className="me-2" />
              {t('locationModal.autoDetect')}
            </Button>
            <Button
              variant={activeTab === 'search' ? 'primary' : 'outline-primary'}
              onClick={() => setActiveTab('search')}
              className="tab-btn"
            >
              <FaSearch className="me-2" />
              {t('locationModal.search')}
            </Button>
            <Button
              variant={activeTab === 'manual' ? 'primary' : 'outline-primary'}
              onClick={() => setActiveTab('manual')}
              className="tab-btn"
            >
              <FaEdit className="me-2" />
              {t('locationModal.manual')}
            </Button>
          </div>
          
          <div className="tab-content">
            {activeTab === 'detect' && renderDetectTab()}
            {activeTab === 'search' && renderSearchTab()}
            {activeTab === 'manual' && renderManualTab()}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default LocationModal; 