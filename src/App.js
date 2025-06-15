import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import UserHome from './components/UserHome';
import Navigation from './components/Navigation';
import LabourProfile from './components/LabourProfile';
import LabourLogin from './components/LabourLogin';
import LabourDashboard from './components/LabourDashboard';
import LabourRegister from './components/LabourRegister';
import AdminDashboard from './components/AdminDashboard';
import LocationService from './services/LocationService';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Protected Route Component for Labour
const ProtectedLabourRoute = ({ children }) => {
  const isLabourLoggedIn = localStorage.getItem('isLabourLoggedIn');
  if (!isLabourLoggedIn) {
    return <Navigate to="/labourLogin" replace />;
  }
  return children;
};

function App() {
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const locationData = await LocationService.getLocationFromCoordinates(latitude, longitude);
            const locationToStore = {
              coordinates: { latitude, longitude },
              address: locationData
            };
            localStorage.setItem('userLocation', JSON.stringify(locationToStore));
          } catch (error) {
            // Handle error silently
          }
        },
        (error) => {
          // Handle error silently
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Navigation />
        <div className="pt-5 mt-3">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/userHome" element={<UserHome />} />
            <Route path="/labour/:labourId" element={<LabourProfile />} />
            <Route path="/labourLogin" element={<LabourLogin />} />
            <Route path="/labourRegister" element={<LabourRegister />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route 
              path="/labourDashboard" 
              element={
                <ProtectedLabourRoute>
                  <LabourDashboard />
                </ProtectedLabourRoute>
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
