import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHome, FaUserShield, FaMapMarkerAlt, FaBars, FaLocationArrow } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle';
import LocationModal from './LocationModal';
import '../styles/Navigation.css';

function Navigation({ sidebarOpen, setIsOpen, isMobile, requestLocation }) {
  const { t } = useTranslation();
  const [cityName, setCityName] = useState('');
  const [locationError, setLocationError] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);

  const updateCity = () => {
    try {
      const locationData = JSON.parse(localStorage.getItem('userLocation'));
      console.log('Location data from localStorage:', locationData);
      
      if (!locationData || !locationData.address) {
        if (requestLocation) {
          requestLocation().catch(error => {
            console.error('Location request failed:', error);
            setLocationError('Location access denied');
          });
        }
        setCityName('');
        return;
      }
      
      
      // Check different possible address structures
      let city = '';
      if (locationData.address.address) {
        // Structure: locationData.address.address.city
        city = locationData.address.address.city || 
               locationData.address.address.town || 
               locationData.address.address.village || 
               locationData.address.address.suburb ||
               locationData.address.address.hamlet || '';
      } else if (locationData.address.display_name) {
        // Structure from search results
        const parts = locationData.address.display_name.split(',');
        city = parts[0] || '';
      } else {
        // Structure: locationData.address.city (direct)
        city = locationData.address.city || 
               locationData.address.town || 
               locationData.address.village || 
               locationData.address.suburb ||
               locationData.address.hamlet || '';
      }
      
      // Handle manual address format
      if (!city && locationData.displayName) {
        city = locationData.displayName;
      }
      
      setCityName(city);
      setLocationError(''); // Clear any previous error
    } catch (error) {
      console.error('Error parsing location data:', error);
      setCityName('');
      setLocationError('Location error');
    }
  };

  useEffect(() => {
    updateCity();
    window.addEventListener('locationUpdated', updateCity);
    return () => window.removeEventListener('locationUpdated', updateCity);
  }, [requestLocation]);

  const toggleSidebar = () => {
    setIsOpen(!sidebarOpen);
  };

  const handleLocationClick = () => {
    setShowLocationModal(true);
  };

  const handleLocationSelect = (selectedLocation) => {
    setShowLocationModal(false);
    if (selectedLocation && selectedLocation.display_name) {
      const locationToStore = {
        address: selectedLocation
      };
      localStorage.setItem('userLocation', JSON.stringify(locationToStore));
      updateCity();
    }
  };

  const handleLocationRequest = () => {
    if (requestLocation) {
      setLocationError(''); // Clear previous error
      requestLocation().catch(error => {
        console.error('Location request failed:', error);
        setLocationError('Location access denied');
      });
    }
  };

  return (
    <>
      <Navbar 
        bg="dark" 
        variant="dark" 
        expand="lg" 
        className={`mb-3 ${isMobile ? 'navbar-mobile' : 'navbar-desktop'} ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
      >
        <Container fluid>
          {/* Hamburger Menu Button - only visible on mobile */}
          <Button
            variant="outline-light"
            className="sidebar-toggle-btn me-2 d-lg-none"
            onClick={toggleSidebar}
            aria-label={t('navigation.toggleSidebar')}
          >
            <FaBars size={14} />
          </Button>

          {/* Brand - Always visible with responsive sizing */}
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center flex-grow-1">
            <img
              src="/images/instaHelpLogo.jpg"
              className="navbar-logo me-2"
              alt="InstaHelp Logo"
            />
            <span className="brand-text">{t('navigation.brand')}</span>
          </Navbar.Brand>
          
          {/* Location Display - Left side */}
          <div className="location-display d-none d-md-flex align-items-center me-3" onClick={handleLocationClick}>
            <FaMapMarkerAlt className="me-2 text-info" />
            <span className="location-text">
              <span className="text-muted">{t('navigation.showingServicesIn')} </span>
              <span className="fw-bold text-white">
                {cityName || locationError || t('navigation.setLocation')}
              </span>
            </span>
            {(!cityName && !locationError) && (
              <Button
                variant="outline-light"
                size="sm"
                className="ms-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLocationRequest();
                }}
                title={t('navigation.requestLocationPermission')}
              >
                <FaLocationArrow size={12} />
              </Button>
            )}
          </div>

          {/* Language Toggle */}
          <LanguageToggle />

          {/* Navigation Links */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/" className="nav-link">
                <FaHome className="me-1" />
                <span className="d-none d-sm-inline">{t('navigation.home')}</span>
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Location Modal */}
      <LocationModal
        show={showLocationModal}
        onHide={() => setShowLocationModal(false)}
        onLocationSelect={handleLocationSelect}
      />
    </>
  );
}

export default Navigation; 