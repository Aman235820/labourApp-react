import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHome, FaUserShield } from 'react-icons/fa';
import '../styles/Navigation.css';

function Navigation() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
            src="/logo.svg"
            width="40"
            height="40"
            className="d-inline-block align-top me-2"
            alt="InstaLab Logo"
          />
          InstaLab
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className="nav-link">
              <FaHome className="me-1" />
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/admin" className="nav-link">
              <FaUserShield className="me-1" />
              Admin Panel
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation; 