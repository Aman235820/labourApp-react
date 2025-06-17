import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import Navigation from './components/Navigation';
import LocationService from './services/LocationService';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Lazy load all components
const Register = lazy(() => import('./components/Register'));
const Login = lazy(() => import('./components/Login'));
const Home = lazy(() => import('./components/Home'));
const UserHome = lazy(() => import('./components/UserHome'));
const LabourProfile = lazy(() => import('./components/LabourProfile'));
const LabourLogin = lazy(() => import('./components/LabourLogin'));
const LabourDashboard = lazy(() => import('./components/LabourDashboard'));
const LabourRegister = lazy(() => import('./components/LabourRegister'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

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
  // Move geolocation request to a user-triggered event
  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          LocationService.setLocation(position.coords);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <Router future={{ v7_startTransition: true }}>
      <Navigation />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
        <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/userHome" element={<UserHome />} />
            <Route path="/labour/:labourId" element={<LabourProfile />} />
            <Route path="/labourLogin" element={<LabourLogin />} />
            <Route path="/labourRegister" element={<LabourRegister />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/labourDashboard" element={<LabourDashboard />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
