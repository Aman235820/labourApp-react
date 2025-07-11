import React, { useState, useEffect } from 'react';
import { Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaUserPlus, 
  FaSignInAlt, 
  FaUserCog, 
  FaBars, 
  FaTimes,
  FaUsers,
  FaTools,
  FaUserTie,
  FaClipboardList,
  FaUserShield,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
  FaMapMarkerAlt
} from 'react-icons/fa';
import '../styles/Sidebar.css';
import LocationModal from './LocationModal';

function Sidebar({ isOpen, setIsOpen, isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [cityName, setCityName] = useState(''); // State for city name
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkUserLoginStatus = () => {
      const userData = localStorage.getItem('user');
      
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          
          if (parsedUser && parsedUser.token) {
            setIsUserLoggedIn(true);
            setUserData(parsedUser);
          } else {
            setIsUserLoggedIn(false);
            setUserData(null);
          }
        } catch (error) {
          setIsUserLoggedIn(false);
          setUserData(null);
        }
      } else {
        setIsUserLoggedIn(false);
        setUserData(null);
      }
    };

    checkUserLoginStatus();
    
    // Listen for storage changes (works across tabs)
    window.addEventListener('storage', checkUserLoginStatus);
    
    // Listen for custom events (for same tab changes)
    window.addEventListener('userLoginStatusChanged', checkUserLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkUserLoginStatus);
      window.removeEventListener('userLoginStatusChanged', checkUserLoginStatus);
    };
  }, []);

  // Check for location updates
  useEffect(() => {
    const updateCity = () => {
      try {
        const locationData = JSON.parse(localStorage.getItem('userLocation'));
        console.log('Sidebar location data from localStorage:', locationData);
        
        if (!locationData || !locationData.address) {
          setCityName('');
          return;
        }
        
        // Check different possible address structures - match Navigation component logic
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
      } catch (error) {
        console.error('Error parsing location data in sidebar:', error);
        setCityName('');
      }
    };

    updateCity();
    
    // Listen for location updates
    window.addEventListener('locationUpdated', updateCity);
    window.addEventListener('storage', updateCity);
    
    return () => {
      window.removeEventListener('locationUpdated', updateCity);
      window.removeEventListener('storage', updateCity);
    };
  }, []);

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleSidebarNavigation = (action, path = null) => {
    // If sidebar is closed, open it first
    if (!isOpen) {
      setIsOpen(true);
      return;
    }
    
    // If sidebar is open, perform the action
    if (path) {
      // For navigation links, navigate to the path
      navigate(path);
      closeSidebar();
    } else if (action) {
      // For custom actions, execute them
      action();
    }
  };

  const handleUserAccountClick = (e) => {
    e.preventDefault();
    
    // If sidebar is closed, open it first
    if (!isOpen) {
      setIsOpen(true);
      return;
    }
    
    // If sidebar is open, perform the original action
    closeSidebar();
    
    // Check if user details exist in localStorage
    const userData = localStorage.getItem('user');
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && parsedUser.token) {
          // User is logged in, navigate to user home
          navigate('/userHome');
        } else {
          // User data exists but no token, navigate to login
          navigate('/login');
        }
      } catch (error) {
        // Invalid JSON, navigate to login
        navigate('/login');
      }
    } else {
      // User is not logged in, navigate to login page
      navigate('/login');
    }
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('rememberedEmail');
    
    // Dispatch custom event to notify about logout
    window.dispatchEvent(new Event('userLoginStatusChanged'));
    
    // Update state
    setIsUserLoggedIn(false);
    setUserData(null);
    
    // Close sidebar
    closeSidebar();
    
    // Navigate to home page
    navigate('/');
  };

  const handleLogoutClick = () => {
    // If sidebar is closed, open it first
    if (!isOpen) {
      setIsOpen(true);
      return;
    }
    
    // If sidebar is open, perform logout
    handleLogout();
  };

  const handleLocationClick = () => {
    // If sidebar is closed, open it first
    if (!isOpen) {
      setIsOpen(true);
      return;
    }

    // Show location modal
    setShowLocationModal(true);
  };

  const handleLocationSelect = (location) => {
    setShowLocationModal(false);
    setCityName(location.city || location.display_name || 'Unknown Location');
  };

  return (
    <>
      {/* Sidebar overlay for mobile */}
      {isOpen && isMobile && (
        <div 
          className="sidebar-overlay d-lg-none"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Desktop Sidebar Toggle Button */}
        <div className="sidebar-toggle-container d-none d-lg-block">
          <Button
            variant="outline-light"
            className="sidebar-toggle-btn-desktop"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle sidebar"
            title={isOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <FaBars />
          </Button>
        </div>

        <div className="sidebar-header">
          <h5 className="mb-0" style={{ display: 'flex', alignItems: 'center', cursor: !isOpen ? 'pointer' : 'default' }}>
            <span
              onClick={() => { if (!isOpen) setIsOpen(true); }}
              style={{ cursor: !isOpen ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}
              title={!isOpen ? 'Open Sidebar' : ''}
            >
              <FaTools className="me-2" />
            </span>
            {isOpen && 'InstaHelp'}
          </h5>
          {isOpen && <p className="text-muted small mb-0">Quick Navigation</p>}
        </div>

        <Nav className="flex-column sidebar-nav">
          {/* Mobile Quick Navigation - Only show on mobile */}
          {isMobile && (
            <div className="sidebar-section">
              {isOpen && (
                <h6 className="sidebar-section-title">
                  <FaHome className="me-2" />
                  Quick Navigation
                </h6>
              )}
              <Nav.Link 
                onClick={(e) => {
                  e.preventDefault();
                  handleSidebarNavigation(null, '/');
                }}
                className={`sidebar-link ${isActive('/') ? 'active' : ''}`}
                title={!isOpen ? 'Home' : ''}
                style={{ cursor: 'pointer' }}
              >
                <FaHome className="me-2" />
                {isOpen && 'Home'}
              </Nav.Link>
              <Nav.Link 
                onClick={(e) => {
                  e.preventDefault();
                  handleSidebarNavigation(null, '/admin');
                }}
                className={`sidebar-link ${isActive('/admin') ? 'active' : ''}`}
                title={!isOpen ? 'Admin Panel' : ''}
                style={{ cursor: 'pointer' }}
              >
                <FaUserShield className="me-2" />
                {isOpen && 'Admin Panel'}
              </Nav.Link>
              <Nav.Link 
                onClick={(e) => {
                  e.preventDefault();
                  handleLocationClick();
                }}
                className="sidebar-link"
                title={!isOpen ? 'Location' : ''}
                style={{ cursor: 'pointer' }}
              >
                <FaMapMarkerAlt className="me-2" />
                {isOpen && `Location: ${cityName || 'Set Location'}`}
              </Nav.Link>
            </div>
          )}

          <div className="sidebar-section">
           
            <Nav.Link 
              onClick={(e) => {
                e.preventDefault();
                handleSidebarNavigation(null, '/');
              }}
              className={`sidebar-link ${isActive('/') ? 'active' : ''}`}
              title={!isOpen ? 'Home' : ''}
              style={{ cursor: 'pointer' }}
            >
              <FaHome className="me-2" />
              {isOpen && 'Home'}
            </Nav.Link>
          </div>

          <div className="sidebar-section">
            {isOpen && (
              <h3 className="sidebar-section-title">
                <FaUsers className="me-2" />
                Join us as a Customer 
              </h3>
            )}
            <Nav.Link 
              onClick={(e) => {
                e.preventDefault();
                handleSidebarNavigation(null, '/register');
              }}
              className={`sidebar-link ${isActive('/register') ? 'active' : ''}`}
              title={!isOpen ? 'Create Customer Account' : ''}
              style={{ cursor: 'pointer' }}
            >
              <FaUserPlus className="me-2" />
              {isOpen && 'Create Customer Account'}
            </Nav.Link>
            <Nav.Link 
              onClick={(e) => {
                e.preventDefault();
                handleSidebarNavigation(null, '/login');
              }}
              className={`sidebar-link ${isActive('/login') ? 'active' : ''}`}
              title={!isOpen ? 'Customer Login' : ''}
              style={{ cursor: 'pointer' }}
            >
              <FaSignInAlt className="me-2" />
              {isOpen && 'Customer Login'}
            </Nav.Link>
            <Nav.Link 
              onClick={handleUserAccountClick}
              className={`sidebar-link ${isActive('/userHome') ? 'active' : ''}`}
              title={!isOpen ? 'My Account' : ''}
              style={{ cursor: 'pointer' }}
            >
              <FaUserCog className="me-2" />
              {isOpen && 'My Account'}
            </Nav.Link>
          </div>

          <div className="sidebar-section">
            {isOpen && (
              <h3 className="sidebar-section-title">
                <FaUserTie className="me-2" />
                Join us as a Service Provider
              </h3>
            )}
            <Nav.Link 
              onClick={(e) => {
                e.preventDefault();
                handleSidebarNavigation(null, '/labourRegister');
              }}
              className={`sidebar-link ${isActive('/labourRegister') ? 'active' : ''}`}
              title={!isOpen ? 'Register as a Service Provider' : ''}
              style={{ cursor: 'pointer' }}
            >
              <FaUserPlus className="me-2" />
              {isOpen && 'Register as a Service Provider'}
            </Nav.Link>
            <Nav.Link 
              onClick={(e) => {
                e.preventDefault();
                handleSidebarNavigation(null, '/labourLogin');
              }}
              className={`sidebar-link ${isActive('/labourLogin') ? 'active' : ''}`}
              title={!isOpen ? 'Service Provider Login' : ''}
              style={{ cursor: 'pointer' }}
            >
              <FaSignInAlt className="me-2" />
              {isOpen && 'Service Provider Login'}
            </Nav.Link>
            <Nav.Link 
              onClick={(e) => {
                e.preventDefault();
                handleSidebarNavigation(null, '/labourDashboard');
              }}
              className={`sidebar-link ${isActive('/labourDashboard') ? 'active' : ''}`}
              title={!isOpen ? 'My Dashboard' : ''}
              style={{ cursor: 'pointer' }}
            >
              <FaClipboardList className="me-2" />
              {isOpen && 'My Dashboard'}
            </Nav.Link>
          </div>

          <div className="sidebar-section">
            {isOpen && (
              <h3 className="sidebar-section-title">
                <FaUserShield className="me-2" />
                Admin
              </h3>
            )}
            <Nav.Link 
              onClick={(e) => {
                e.preventDefault();
                handleSidebarNavigation(null, '/admin');
              }}
              className={`sidebar-link ${isActive('/admin') ? 'active' : ''}`}
              title={!isOpen ? 'Admin Panel' : ''}
              style={{ cursor: 'pointer' }}
            >
              <FaUserShield className="me-2" />
              {isOpen && 'Admin Panel'}
            </Nav.Link>
          </div>
        </Nav>

        {/* Logout Section - Only show if user is logged in */}
        {isUserLoggedIn && (
          <div className="sidebar-logout-section">
            {isOpen && (
              <div className="user-info">
                <p className="text-muted small mb-2">
                  Logged in as: <strong>{userData?.name || 'Customer'}</strong>
                </p>
              </div>
            )}
            <Button
              variant="outline-light"
              size="sm"
              onClick={handleLogoutClick}
              className="sidebar-logout-btn"
              title={!isOpen ? 'Logout' : ''}
            >
              <FaSignOutAlt className="me-2" />
              {isOpen && 'Logout'}
            </Button>
          </div>
        )}

        <div className="sidebar-footer">
          {isOpen && (
            <p className="text-muted small mb-0">
              © 2024 InstaHelp
            </p>
          )}
        </div>
      </div>

      {/* Location Modal */}
      <LocationModal
        show={showLocationModal}
        onHide={() => setShowLocationModal(false)}
        onSelect={handleLocationSelect}
      />
    </>
  );
}

export default Sidebar; 