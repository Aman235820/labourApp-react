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
    // Get user's location when app starts
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('User Location:', {
            latitude,
            longitude
          });
          // You can store the coordinates in localStorage or state management if needed
          localStorage.setItem('userLocation', JSON.stringify({ latitude, longitude }));
        },
        (error) => {
          console.error('Error getting location:', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
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
