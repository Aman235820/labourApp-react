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
  FaSignOutAlt
} from 'react-icons/fa';
import '../styles/Sidebar.css';

function Sidebar({ isOpen, setIsOpen, isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

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

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleUserAccountClick = (e) => {
    e.preventDefault();
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
        <div className="sidebar-header">
          <h5 className="mb-0">
            <FaTools className="me-2" />
            {isOpen && 'InstaLab'}
          </h5>
          {isOpen && <p className="text-muted small mb-0">Quick Navigation</p>}
        </div>

        <Nav className="flex-column sidebar-nav">
          <div className="sidebar-section">
            {isOpen && (
              <h6 className="sidebar-section-title">
                <FaHome className="me-2" />
                Main
              </h6>
            )}
            <Nav.Link 
              as={Link} 
              to="/" 
              className={`sidebar-link ${isActive('/') ? 'active' : ''}`}
              onClick={closeSidebar}
              title={!isOpen ? 'Home' : ''}
            >
              <FaHome className="me-2" />
              {isOpen && 'Home'}
            </Nav.Link>
          </div>

          <div className="sidebar-section">
            {isOpen && (
              <h6 className="sidebar-section-title">
                <FaUsers className="me-2" />
                Join us as a Customer 
              </h6>
            )}
            <Nav.Link 
              as={Link} 
              to="/register" 
              className={`sidebar-link ${isActive('/register') ? 'active' : ''}`}
              onClick={closeSidebar}
              title={!isOpen ? 'Create Customer Account' : ''}
            >
              <FaUserPlus className="me-2" />
              {isOpen && 'Create Customer Account'}
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/login" 
              className={`sidebar-link ${isActive('/login') ? 'active' : ''}`}
              onClick={closeSidebar}
              title={!isOpen ? 'Customer Login' : ''}
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
              <h6 className="sidebar-section-title">
                <FaUserTie className="me-2" />
                Join us as a Service Provider
              </h6>
            )}
            <Nav.Link 
              as={Link} 
              to="/labourRegister" 
              className={`sidebar-link ${isActive('/labourRegister') ? 'active' : ''}`}
              onClick={closeSidebar}
              title={!isOpen ? 'Register as a Service Provider' : ''}
            >
              <FaUserPlus className="me-2" />
              {isOpen && 'Register as a Service Provider'}
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/labourLogin" 
              className={`sidebar-link ${isActive('/labourLogin') ? 'active' : ''}`}
              onClick={closeSidebar}
              title={!isOpen ? 'Service Provider Login' : ''}
            >
              <FaSignInAlt className="me-2" />
              {isOpen && 'Service Provider Login'}
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/labourDashboard" 
              className={`sidebar-link ${isActive('/labourDashboard') ? 'active' : ''}`}
              onClick={closeSidebar}
              title={!isOpen ? 'My Dashboard' : ''}
            >
              <FaClipboardList className="me-2" />
              {isOpen && 'My Dashboard'}
            </Nav.Link>
          </div>

          <div className="sidebar-section">
            {isOpen && (
              <h6 className="sidebar-section-title">
                <FaUserShield className="me-2" />
                Admin
              </h6>
            )}
            <Nav.Link 
              as={Link} 
              to="/admin" 
              className={`sidebar-link ${isActive('/admin') ? 'active' : ''}`}
              onClick={closeSidebar}
              title={!isOpen ? 'Admin Panel' : ''}
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
              onClick={handleLogout}
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
              © 2024 InstaLab
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default Sidebar; 