import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FiBook, FiBookmark, FiClock, FiBell, FiStar } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { borrowService } from '../../services/borrowService';
import { reservationService } from '../../services/reservationService';
import { notificationService } from '../../services/notificationService';
import { recommendationService } from '../../services/recommendationService';
import BookCard from '../../components/BookCard';

const StudentDashboard = () => {
  const [stats, setStats] = useState({ borrowed: 0, overdue: 0, reservations: 0, notifications: 0 });
  const [recentBooks, setRecentBooks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [borrowed, reservations, notifications, recs] = await Promise.allSettled([
          borrowService.getBorrowedBooks(),
          reservationService.getMyReservations(),
          notificationService.getNotifications(),
          recommendationService.getRecommendations(),
        ]);

        const borrowedBooks = borrowed.status === 'fulfilled' ? (Array.isArray(borrowed.value) ? borrowed.value : []) : [];
        const res = reservations.status === 'fulfilled' ? (Array.isArray(reservations.value) ? reservations.value : []) : [];
        const notifs = notifications.status === 'fulfilled' ? (Array.isArray(notifications.value) ? notifications.value : []) : [];
        const unreadNotifs = notifs.filter((n) => !n.read);

        const today = new Date();
        const overdueBooks = borrowedBooks.filter(
          (b) => b.dueDate && new Date(b.dueDate) < today
        );

        setStats({
          borrowed: borrowedBooks.length,
          overdue: overdueBooks.length,
          reservations: res.length,
          notifications: unreadNotifs.length,
        });
        setRecentBooks(borrowedBooks.slice(0, 5));
        setRecommendations(recs.status === 'fulfilled' ? recs.value : []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  const statCards = [
    { title: 'Borrowed Books', value: stats.borrowed, icon: <FiBook size={28} />, color: 'primary', link: '/student/borrowed-books' },
    { title: 'Overdue Books', value: stats.overdue, icon: <FiClock size={28} />, color: 'danger', link: '/student/borrowed-books' },
    { title: 'Reservations', value: stats.reservations, icon: <FiBookmark size={28} />, color: 'warning', link: '/student/reservations' },
    { title: 'Notifications', value: stats.notifications, icon: <FiBell size={28} />, color: 'info', link: '/student/notifications' },
  ];

  return (
    <Container fluid>
      <h3 className="mb-4 fw-bold">Student Dashboard</h3>

      <Row className="mb-4">
        {statCards.map((stat) => (
          <Col md={3} key={stat.title} className="mb-3">
            <Card as={Link} to={stat.link} className="text-decoration-none border-0 shadow-sm h-100">
              <Card.Body className="d-flex align-items-center">
                <div className={`bg-${stat.color} bg-opacity-10 rounded p-3 me-3`}>
                  <span className={`text-${stat.color}`}>{stat.icon}</span>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{stat.value}</h3>
                  <small className="text-muted">{stat.title}</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 fw-bold">Recent Borrowed Books</h5>
            </Card.Header>
            <Card.Body>
              {recentBooks.length === 0 ? (
                <p className="text-muted text-center py-3">No borrowed books yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Due Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBooks.map((book) => {
                        const isOverdue = book.dueDate && new Date(book.dueDate) < new Date();
                        return (
                          <tr key={book.id || book.copyId}>
                            <td>{book.title || book.bookTitle || 'N/A'}</td>
                            <td>{book.dueDate ? new Date(book.dueDate).toLocaleDateString() : 'N/A'}</td>
                            <td>
                              <span className={`badge ${isOverdue ? 'bg-danger' : 'bg-success'}`}>
                                {isOverdue ? 'Overdue' : 'Active'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 fw-bold">Quick Actions</h5>
            </Card.Header>
            <Card.Body className="d-grid gap-2">
              <Link to="/student/scan" className="btn btn-primary">Scan & Borrow</Link>
              <Link to="/student/books" className="btn btn-outline-primary">Browse Books</Link>
              <Link to="/student/reservations" className="btn btn-outline-primary">My Reservations</Link>
              <Link to="/student/borrow-history" className="btn btn-outline-primary">Borrow History</Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {recommendations.length > 0 && (
        <Row className="mt-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom d-flex align-items-center">
                <FiStar className="me-2 text-warning" />
                <h5 className="mb-0 fw-bold">Recommended For You</h5>
              </Card.Header>
              <Card.Body>
                {recommendations.map((section, idx) => (
                  <div key={idx} className="mb-4">
                    <h6 className="text-muted fw-bold mb-3">{section.reason}</h6>
                    <Row>
                      {section.books.map((book) => (
                        <Col md={4} lg={2} key={book.id} className="mb-3">
                          <BookCard book={book} basePath="/student/books" />
                        </Col>
                      ))}
                    </Row>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default StudentDashboard;
