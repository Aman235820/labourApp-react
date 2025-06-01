import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import UserHome from './components/UserHome';
import Navigation from './components/Navigation';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// // Protected Route Component
// const ProtectedRoute = ({ children }) => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//         return <Navigate to="/login" replace />;
//     }
//     return children;
// };

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <div className="pt-5 mt-3">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/userHome"  element={ <UserHome /> }/>
                 {/* // <ProtectedRoute>
                // </ProtectedRoute> */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
