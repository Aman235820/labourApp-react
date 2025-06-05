import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUser, FaTools, FaUserPlus, FaClipboardList } from 'react-icons/fa';
import '../styles/Navigation.css';

function Navigation() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <FaTools className="text-primary me-2" />
          InstaLab
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className="d-flex align-items-center">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/admin" className="d-flex align-items-center">
              <FaUser className="me-1" />
              Admin Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/register" className="d-flex align-items-center">
              <FaUserPlus className="me-1" />
              Register
            </Nav.Link>
            <Nav.Link as={Link} to="/labourRegister" className="d-flex align-items-center">
              <FaClipboardList className="me-1" />
              Register as Labour
            </Nav.Link>
            <Nav.Link as={Link} to="/login" className="d-flex align-items-center">
              <FaUser className="me-1" />
              Login
            </Nav.Link>
            <Nav.Link as={Link} to="/labourLogin" className="d-flex align-items-center">
              <FaTools className="me-1" />
              Login as Labour
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation; 