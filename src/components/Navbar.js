import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Navbar as RNavbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  Nav,
  NavItem,
  NavLink,
  Container,
} from 'reactstrap';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <RNavbar expand="md" light className="navbar">
      <Container>
        <NavbarBrand tag={Link} to="/" className="navbar-brand">
          Labour App
        </NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="ms-auto" navbar>
            <NavItem>
              <NavLink tag={Link} to="/jobs" className="nav-link">
                Find Jobs
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/post-job" className="nav-link">
                Post a Job
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/login" className="nav-link">
                Login
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/register" className="nav-link">
                Register
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/dashboard" className="nav-link">
                Dashboard
              </NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Container>
    </RNavbar>
  );
}

export default Navbar; 