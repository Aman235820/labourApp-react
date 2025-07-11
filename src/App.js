import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import LocationService from './services/LocationService';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Lazy load all components
const Register = lazy(() => import('./components/Register'));
const Login = lazy(() => import('./components/Login'));
const Home = lazy(() => import('./components/Home'));
const UserHome = lazy(() => import('./components/UserHome'));
const LabourProfile = lazy(() => import('./components/LabourProfile'));
const LabourDetailsPage = lazy(() => import('./components/LabourDetailsPage'));
const LabourListPage = lazy(() => import('./components/LabourListPage'));
const LabourLogin = lazy(() => import('./components/LabourLogin'));
const LabourDashboard = lazy(() => import('./components/LabourDashboard'));
const LabourRegister = lazy(() => import('./components/LabourRegister'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AadhaarQrDecoder = lazy(() => import('./aadhar/AadhaarQrDecoder'));

// Loading fallback component
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#f8f9fa'
  }}>
    <Spinner animation="border" role="status" variant="primary">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  </div>
);

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile and manage sidebar state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      setSidebarOpen(false); // Always start closed
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Start automatic location watching
  useEffect(() => {
    // Start watching location automatically
    LocationService.startWatchingLocation();
    
    // Also try to get current location once on app load
    const checkInitialLocation = async () => {
      const existingLocation = localStorage.getItem('userLocation');
      if (!existingLocation) {
        try {
          await LocationService.getCurrentLocation();
        } catch (error) {
          console.log('Initial location request failed:', error.message);
        }
      }
    };
    
    checkInitialLocation();
    
    // Cleanup function to stop watching when component unmounts
    return () => {
      LocationService.stopWatchingLocation();
    };
  }, []);

  // Move geolocation request to a user-triggered event
  const requestLocation = () => {
    LocationService.getCurrentLocation().catch(error => {
      console.error('Error getting location:', error);
    });
  };

  return (
    <Router future={{ v7_startTransition: true }}>
      <div className="app-container">
        <Navigation 
          sidebarOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          isMobile={isMobile}
          requestLocation={requestLocation}
        />
        <Sidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen}
          isMobile={isMobile}
        />
        <div className={`main-content ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
            <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/userHome" element={<UserHome />} />
                <Route path="/labour/:labourId" element={<LabourProfile />} />
                <Route path="/labour-details/:labourId" element={<LabourDetailsPage />} />
                <Route path="/labour-list" element={<LabourListPage />} />
                <Route path="/labourLogin" element={<LabourLogin />} />
                <Route path="/labourRegister" element={<LabourRegister />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/labourDashboard" element={<LabourDashboard />} />
                <Route path="/aadhar" element={<AadhaarQrDecoder />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </Router>
  );
}

export default App;
