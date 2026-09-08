import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Nav } from 'react-bootstrap';
import {
  FiGrid, FiBook, FiPlusSquare, FiCopy, FiUsers, FiArrowLeftCircle,
  FiBookmark, FiBarChart2, FiUser,
} from 'react-icons/fi';

const LibrarianLayout = () => {
  const { user } = useAuth();

  const sidebarLinks = [
    { to: '/librarian/dashboard', icon: <FiGrid />, label: 'Dashboard' },
    { to: '/librarian/books', icon: <FiBook />, label: 'Manage Books' },
    { to: '/librarian/books/add', icon: <FiPlusSquare />, label: 'Add Book' },
    { to: '/librarian/copies', icon: <FiCopy />, label: 'Manage Copies' },
    { to: '/librarian/students', icon: <FiUsers />, label: 'Students' },
    { to: '/librarian/returns', icon: <FiArrowLeftCircle />, label: 'Process Returns' },
    { to: '/librarian/reservations', icon: <FiBookmark />, label: 'Reservations' },
    { to: '/librarian/reports', icon: <FiBarChart2 />, label: 'Reports' },
    { to: '/librarian/profile', icon: <FiUser />, label: 'Profile' },
  ];

  return (
    <div className="d-flex" style={{ minHeight: 'calc(100vh - 56px)' }}>
      <nav
        className="bg-dark border-end p-3 d-none d-md-block"
        style={{ width: '250px', minWidth: '250px' }}
      >
        <div className="mb-3 px-2">
          <small className="text-light text-uppercase fw-bold">Librarian Menu</small>
        </div>
        <Nav className="flex-column">
          {sidebarLinks.map((link) => (
            <Nav.Link
              key={link.to}
              as={NavLink}
              to={link.to}
              className={({ isActive }) =>
                `d-flex align-items-center py-2 px-3 mb-1 rounded ${isActive ? 'bg-primary text-white' : 'text-light'}`
              }
            >
              <span className="me-2">{link.icon}</span>
              {link.label}
            </Nav.Link>
          ))}
        </Nav>
      </nav>
      <main className="flex-grow-1 p-4 bg-light">
        <Outlet />
      </main>
    </div>
  );
};

export default LibrarianLayout;
