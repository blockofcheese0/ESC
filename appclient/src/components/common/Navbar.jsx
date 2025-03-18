import React from 'react';
import { Navbar as BsNavbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BsNavbar bg="primary" variant="dark" expand="lg">
      <Container>
        <BsNavbar.Brand as={Link} to="/">Therapy Management System</BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BsNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {currentUser ? (
              currentUser.isTherapist ? (
                <>
                  <Nav.Link as={Link} to="/therapist">Dashboard</Nav.Link>
                  <Nav.Link as={Link} to="/therapist/goal/new">Create Goal</Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/client">Dashboard</Nav.Link>
                  <Nav.Link as={Link} to="/client/todos">My Tasks</Nav.Link>
                  <Nav.Link as={Link} to="/client/join">Join Therapist</Nav.Link>
                </>
              )
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
          {currentUser && (
            <Nav>
              <span className="navbar-text me-3">
                Welcome, {currentUser.username}
              </span>
              <Button variant="outline-light" onClick={handleLogout}>
                Logout
              </Button>
            </Nav>
          )}
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;