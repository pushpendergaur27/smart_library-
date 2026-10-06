import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import AppNavbar from './components/AppNavbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

import StudentLayout from './layouts/StudentLayout';
import LibrarianLayout from './layouts/LibrarianLayout';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const StudentBooks = lazy(() => import('./pages/student/Books'));
const StudentBookDetail = lazy(() => import('./pages/student/BookDetail'));
const ScanBarcode = lazy(() => import('./pages/student/Scan'));
const BorrowedBooks = lazy(() => import('./pages/student/BorrowedBooks'));
const BorrowHistory = lazy(() => import('./pages/student/BorrowHistory'));
const StudentReservations = lazy(() => import('./pages/student/Reservations'));
const StudentNotifications = lazy(() => import('./pages/student/Notifications'));
const StudentProfile = lazy(() => import('./pages/student/Profile'));

const LibrarianDashboard = lazy(() => import('./pages/librarian/Dashboard'));
const LibrarianBooks = lazy(() => import('./pages/librarian/BooksPage'));
const LibrarianAddBook = lazy(() => import('./pages/librarian/AddBookPage'));
const LibrarianEditBook = lazy(() => import('./pages/librarian/EditBookPage'));
const LibrarianBookDetails = lazy(() => import('./pages/librarian/BookDetailsPage'));
const LibrarianCopies = lazy(() => import('./pages/librarian/CopiesPage'));
const LibrarianStudents = lazy(() => import('./pages/librarian/StudentsPage'));
const LibrarianReturns = lazy(() => import('./pages/librarian/ReturnsPage'));
const LibrarianReservations = lazy(() => import('./pages/librarian/LibrarianReservations'));
const LibrarianReports = lazy(() => import('./pages/librarian/ReportsPage'));
const LibrarianProfile = lazy(() => import('./pages/librarian/LibrarianProfile'));
const LibrarianBorrows = lazy(() => import('./pages/librarian/BorrowsPage'));
const LibrarianNotifications = lazy(() => import('./pages/librarian/LibrarianNotificationsPage'));

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
    <Suspense fallback={<LoadingSpinner fullPage message="Loading..." />}>
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
        <Route path="borrows" element={<LibrarianBorrows />} />
        <Route path="returns" element={<LibrarianReturns />} />
        <Route path="reservations" element={<LibrarianReservations />} />
        <Route path="notifications" element={<LibrarianNotifications />} />
        <Route path="reports" element={<LibrarianReports />} />
        <Route path="profile" element={<LibrarianProfile />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
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
