import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHome, FaUserShield, FaMapMarkerAlt, FaBars, FaLocationArrow } from 'react-icons/fa';
import '../styles/Navigation.css';
import LocationModal from './LocationModal';

function Navigation({ sidebarOpen, setIsOpen, isMobile, requestLocation }) {
  const [cityName, setCityName] = useState('');
  const [locationError, setLocationError] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    const updateCity = () => {
      try {
        const locationData = JSON.parse(localStorage.getItem('userLocation'));
        console.log('Location data from localStorage:', locationData);
        
        if (!locationData || !locationData.address) {
          console.log('No location data or address found, requesting location...');
          if (requestLocation) {
            requestLocation().catch(error => {
              console.error('Location request failed:', error);
              setLocationError('Location access denied');
            });
          }
          setCityName('');
          return;
        }
        
        console.log('Address structure:', locationData.address);
        
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
        
        console.log('Extracted city:', city);
        setCityName(city);
        setLocationError(''); // Clear any previous error
      } catch (error) {
        console.error('Error parsing location data:', error);
        setCityName('');
        setLocationError('Location error');
      }
    };
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

  const handleLocationSelect = (location) => {
    console.log('Location selected:', location);
    // The location is already saved in the modal, just close it
    setShowLocationModal(false);
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

  // Calculate navbar left position based on sidebar state
  const getNavbarLeftPosition = () => {
    if (isMobile) {
      return '0'; // Full width on mobile
    }
    return sidebarOpen ? '280px' : '70px'; // Adjust based on sidebar width
  };

  return (
    <>
      <Navbar 
        bg="dark" 
        variant="dark" 
        expand="lg" 
        className="mb-3"
        style={{
          left: getNavbarLeftPosition(),
          transition: 'left 0.3s ease-in-out'
        }}
      >
        <Container fluid>
          {/* Hamburger Menu Button */}
          <Button
            variant="outline-light"
            className="sidebar-toggle-btn me-3"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <FaBars size={18} />
          </Button>

          {/* Brand */}
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <img
              src="/images/instaHelpLogo.jpg"
              width="32"
              height="32"
              className="d-inline-block align-top me-2"
              alt="InstaHelp Logo"
              style={{
                borderRadius: '4px',
                objectFit: 'cover'
              }}
            />
            <span className="brand-text">InstaHelp</span>
          </Navbar.Brand>
          
          {/* City Display */}
          <div className="city-display d-none d-md-flex" onClick={handleLocationClick}>
            <FaMapMarkerAlt className="me-2" />
            <span className="city-text">
              {cityName || locationError || 'Set Location'}
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
                title="Request location permission"
              >
                <FaLocationArrow size={12} />
              </Button>
            )}
          </div>

          {/* Navigation Links */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/" className="nav-link">
                <FaHome className="me-1" />
                <span className="d-none d-sm-inline">Home</span>
              </Nav.Link>
              <Nav.Link as={Link} to="/admin" className="nav-link">
                <FaUserShield className="me-1" />
                <span className="d-none d-sm-inline">Admin</span>
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