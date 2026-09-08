import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { librarianService } from '../../services/librarianService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiBook, FiUsers, FiArrowLeftCircle, FiBookmark, FiCopy, FiBarChart2 } from 'react-icons/fi';

const LibrarianDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await librarianService.getDashboard();
        setStats(data);
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
    { title: 'Total Books', value: stats?.totalBooks || 0, icon: <FiBook size={28} />, color: 'primary', link: '/librarian/books' },
    { title: 'Total Copies', value: stats?.totalCopies || 0, icon: <FiCopy size={28} />, color: 'info', link: '/librarian/copies' },
    { title: 'Active Borrows', value: stats?.activeBorrows || 0, icon: <FiArrowLeftCircle size={28} />, color: 'warning', link: '/librarian/returns' },
    { title: 'Registered Students', value: stats?.totalStudents || 0, icon: <FiUsers size={28} />, color: 'success', link: '/librarian/students' },
    { title: 'Pending Reservations', value: stats?.pendingReservations || 0, icon: <FiBookmark size={28} />, color: 'danger', link: '/librarian/reservations' },
    { title: 'Overdue Books', value: stats?.overdueBooks || 0, icon: <FiBarChart2 size={28} />, color: 'dark', link: '/librarian/reports' },
  ];

  return (
    <Container fluid>
      <h3 className="mb-4 fw-bold">Librarian Dashboard</h3>

      <Row>
        {statCards.map((stat) => (
          <Col md={4} lg={2} key={stat.title} className="mb-3">
            <Card as={Link} to={stat.link} className="text-decoration-none border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div className={`bg-${stat.color} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2`} style={{ width: '50px', height: '50px' }}>
                  <span className={`text-${stat.color}`}>{stat.icon}</span>
                </div>
                <h4 className="mb-0 fw-bold">{stat.value}</h4>
                <small className="text-muted">{stat.title}</small>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="mt-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 fw-bold">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4} className="mb-2">
                  <Link to="/librarian/books/add" className="btn btn-primary w-100">Add New Book</Link>
                </Col>
                <Col md={4} className="mb-2">
                  <Link to="/librarian/returns" className="btn btn-outline-primary w-100">Process Returns</Link>
                </Col>
                <Col md={4} className="mb-2">
                  <Link to="/librarian/reports" className="btn btn-outline-primary w-100">View Reports</Link>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 fw-bold">System Info</h5>
            </Card.Header>
            <Card.Body>
              <p className="mb-2"><strong>Library Name:</strong> Smart Library</p>
              <p className="mb-2"><strong>Total Book Titles:</strong> {stats?.totalBooks || 0}</p>
              <p className="mb-2"><strong>Available Copies:</strong> {stats?.availableCopies || 0}</p>
              <p className="mb-0"><strong>Borrowed Copies:</strong> {stats?.borrowedCopies || 0}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LibrarianDashboard;
