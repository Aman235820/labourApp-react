import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHome, FaUserShield, FaMapMarkerAlt, FaBars } from 'react-icons/fa';
import '../styles/Navigation.css';
import { requestLocation } from '../App';

function Navigation({ sidebarOpen, setIsOpen, isMobile }) {
  const [cityName, setCityName] = useState('');

  useEffect(() => {
    const updateCity = () => {
      try {
        const locationData = JSON.parse(localStorage.getItem('userLocation'));
        if (!locationData || !locationData.address) {
          requestLocation();
          setCityName('');
          return;
        }
        const city = locationData.address.address.city || locationData.address.town || locationData.address.village || '';
        setCityName(city);
      } catch (error) {
        setCityName('');
      }
    };
    updateCity();
    window.addEventListener('locationUpdated', updateCity);
    return () => window.removeEventListener('locationUpdated', updateCity);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!sidebarOpen);
  };

  // Calculate navbar left position based on sidebar state
  const getNavbarLeftPosition = () => {
    if (isMobile) {
      return '0'; // Full width on mobile
    }
    return sidebarOpen ? '280px' : '70px'; // Adjust based on sidebar width
  };

  return (
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
        <div className="city-display d-none d-md-flex">
          <FaMapMarkerAlt className="me-2" />
          <span>{cityName || 'Location not set'}</span>
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
  );
}

export default Navigation; 