import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar, Nav, Container, Badge, Button } from 'react-bootstrap';
import { FiBook, FiUser, FiLogOut, FiMenu } from 'react-icons/fi';

const AppNavbar = () => {
  const { isAuthenticated, user, logout, isStudent, isLibrarian } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" sticky="top" className="shadow-sm">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <FiBook className="me-2" />
          Smart Library
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" active={location.pathname === '/'}>
              Home
            </Nav.Link>
            {isAuthenticated && isStudent && (
              <>
                <Nav.Link as={Link} to="/student/books" active={location.pathname.startsWith('/student/books')}>
                  Browse Books
                </Nav.Link>
                <Nav.Link as={Link} to="/student/scan" active={location.pathname === '/student/scan'}>
                  Scan
                </Nav.Link>
              </>
            )}
            {isAuthenticated && isLibrarian && (
              <>
                <Nav.Link as={Link} to="/librarian/dashboard" active={location.pathname === '/librarian/dashboard'}>
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/librarian/books" active={location.pathname.startsWith('/librarian/books')}>
                  Books
                </Nav.Link>
                <Nav.Link as={Link} to="/librarian/returns" active={location.pathname === '/librarian/returns'}>
                  Returns
                </Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                {isStudent && (
                  <Nav.Link as={Link} to="/student/notifications" className="me-2">
                    <FiMenu /> Notifications
                  </Nav.Link>
                )}
                <Nav.Link as={Link} to={isStudent ? '/student/profile' : '/librarian/profile'} className="me-2">
                  <FiUser className="me-1" />
                  {user?.name || user?.email || 'Profile'}
                  <Badge bg="light" text="dark" className="ms-1">{user?.role}</Badge>
                </Nav.Link>
                <Button variant="outline-light" size="sm" onClick={handleLogout} className="d-flex align-items-center">
                  <FiLogOut className="me-1" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" active={location.pathname === '/login'}>
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register" active={location.pathname === '/register'}>
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
