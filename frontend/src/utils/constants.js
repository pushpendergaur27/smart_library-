export const BOOK_GENRES = [
  'Fiction',
  'Non-Fiction',
  'Science',
  'Technology',
  'Mathematics',
  'Engineering',
  'History',
  'Philosophy',
  'Literature',
  'Reference',
  'Textbook',
  'Biography',
  'Art',
  'Business',
  'Economics',
  'Psychology',
  'Sociology',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Other',
];

export const COPY_STATUSES = [
  'AVAILABLE',
  'BORROWED',
  'RESERVED',
  'MAINTENANCE',
  'DAMAGED',
  'LOST',
];

export const ROLES = {
  STUDENT: 'STUDENT',
  LIBRARIAN: 'LIBRARIAN',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    BOOKS: '/student/books',
    BOOK_DETAIL: '/student/books/:id',
    SCAN: '/student/scan',
    BORROWED: '/student/borrowed-books',
    HISTORY: '/student/borrow-history',
    RESERVATIONS: '/student/reservations',
    NOTIFICATIONS: '/student/notifications',
    PROFILE: '/student/profile',
  },
  LIBRARIAN: {
    DASHBOARD: '/librarian/dashboard',
    BOOKS: '/librarian/books',
    ADD_BOOK: '/librarian/books/add',
    EDIT_BOOK: '/librarian/books/:id/edit',
    COPIES: '/librarian/copies',
    STUDENTS: '/librarian/students',
    RETURNS: '/librarian/returns',
    RESERVATIONS: '/librarian/reservations',
    REPORTS: '/librarian/reports',
    PROFILE: '/librarian/profile',
  },
};
