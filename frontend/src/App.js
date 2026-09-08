import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import AppNavbar from './components/AppNavbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

import StudentLayout from './layouts/StudentLayout';
import LibrarianLayout from './layouts/LibrarianLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import StudentDashboard from './pages/student/Dashboard';
import StudentBooks from './pages/student/Books';
import StudentBookDetail from './pages/student/BookDetail';
import ScanBarcode from './pages/student/Scan';
import BorrowedBooks from './pages/student/BorrowedBooks';
import BorrowHistory from './pages/student/BorrowHistory';
import StudentReservations from './pages/student/Reservations';
import StudentNotifications from './pages/student/Notifications';
import StudentProfile from './pages/student/Profile';

import LibrarianDashboard from './pages/librarian/Dashboard';
import LibrarianBooks from './pages/librarian/BooksPage';
import LibrarianAddBook from './pages/librarian/AddBookPage';
import LibrarianEditBook from './pages/librarian/EditBookPage';
import LibrarianBookDetails from './pages/librarian/BookDetailsPage';
import LibrarianCopies from './pages/librarian/CopiesPage';
import LibrarianStudents from './pages/librarian/StudentsPage';
import LibrarianReturns from './pages/librarian/ReturnsPage';
import LibrarianReservations from './pages/librarian/LibrarianReservations';
import LibrarianReports from './pages/librarian/ReportsPage';
import LibrarianProfile from './pages/librarian/LibrarianProfile';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (isAuthenticated) {
    if (user?.role === 'LIBRARIAN') return <Navigate to="/librarian/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }
  return children;
};

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) return <LoadingSpinner fullPage message="Loading..." />;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="books" element={<StudentBooks />} />
        <Route path="books/:id" element={<StudentBookDetail />} />
        <Route path="scan" element={<ScanBarcode />} />
        <Route path="borrowed-books" element={<BorrowedBooks />} />
        <Route path="borrow-history" element={<BorrowHistory />} />
        <Route path="reservations" element={<StudentReservations />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* Librarian Routes */}
      <Route
        path="/librarian"
        element={
          <ProtectedRoute allowedRoles={['LIBRARIAN']}>
            <LibrarianLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<LibrarianDashboard />} />
        <Route path="books" element={<LibrarianBooks />} />
        <Route path="books/add" element={<LibrarianAddBook />} />
        <Route path="books/:id/edit" element={<LibrarianEditBook />} />
        <Route path="books/:id" element={<LibrarianBookDetails />} />
        <Route path="copies" element={<LibrarianCopies />} />
        <Route path="students" element={<LibrarianStudents />} />
        <Route path="returns" element={<LibrarianReturns />} />
        <Route path="reservations" element={<LibrarianReservations />} />
        <Route path="reports" element={<LibrarianReports />} />
        <Route path="profile" element={<LibrarianProfile />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppNavbar />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
