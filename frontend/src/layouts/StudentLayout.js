import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Nav } from 'react-bootstrap';
import {
  FiGrid, FiBook, FiUser, FiClock, FiBookmark, FiBell, FiCamera, FiSettings,
} from 'react-icons/fi';

const StudentLayout = () => {
  const { user } = useAuth();

  const sidebarLinks = [
    { to: '/student/dashboard', icon: <FiGrid />, label: 'Dashboard' },
    { to: '/student/books', icon: <FiBook />, label: 'Browse Books' },
    { to: '/student/scan', icon: <FiCamera />, label: 'Scan Barcode' },
    { to: '/student/borrowed-books', icon: <FiBookmark />, label: 'Borrowed Books' },
    { to: '/student/borrow-history', icon: <FiClock />, label: 'Borrow History' },
    { to: '/student/reservations', icon: <FiBook />, label: 'Reservations' },
    { to: '/student/notifications', icon: <FiBell />, label: 'Notifications' },
    { to: '/student/profile', icon: <FiUser />, label: 'Profile' },
  ];

  return (
    <div className="d-flex" style={{ minHeight: 'calc(100vh - 56px)' }}>
      <nav
        className="bg-light border-end p-3 d-none d-md-block"
        style={{ width: '250px', minWidth: '250px' }}
      >
        <div className="mb-3 px-2">
          <small className="text-muted text-uppercase fw-bold">Student Menu</small>
        </div>
        <Nav className="flex-column">
          {sidebarLinks.map((link) => (
            <Nav.Link
              key={link.to}
              as={NavLink}
              to={link.to}
              className={({ isActive }) =>
                `d-flex align-items-center py-2 px-3 mb-1 rounded ${isActive ? 'bg-primary text-white' : 'text-dark'}`
              }
            >
              <span className="me-2">{link.icon}</span>
              {link.label}
            </Nav.Link>
          ))}
        </Nav>
      </nav>
      <main className="flex-grow-1 p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
