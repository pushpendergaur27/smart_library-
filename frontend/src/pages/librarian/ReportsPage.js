import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { librarianService } from '../../services/librarianService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { FiBook, FiUsers, FiCopy, FiArrowLeftCircle, FiBarChart2 } from 'react-icons/fi';

const ReportsPage = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await librarianService.getReports();
        setReports(data);
      } catch (err) {
        setError('Failed to load reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <LoadingSpinner message="Loading reports..." />;

  return (
    <Container fluid>
      <h3 className="mb-4 fw-bold">Library Reports</h3>

      {error && <AlertMessage variant="danger" message={error} />}

      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <FiBook size={32} className="text-primary mb-2" />
              <h2 className="fw-bold">{reports?.totalBooks || 0}</h2>
              <p className="text-muted mb-0">Total Book Titles</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <FiCopy size={32} className="text-info mb-2" />
              <h2 className="fw-bold">{reports?.totalCopies || 0}</h2>
              <p className="text-muted mb-0">Total Physical Copies</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <FiUsers size={32} className="text-success mb-2" />
              <h2 className="fw-bold">{reports?.totalStudents || 0}</h2>
              <p className="text-muted mb-0">Registered Students</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <FiArrowLeftCircle size={32} className="text-warning mb-2" />
              <h2 className="fw-bold">{reports?.activeBorrows || 0}</h2>
              <p className="text-muted mb-0">Active Borrows</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <FiBarChart2 size={32} className="text-danger mb-2" />
              <h2 className="fw-bold">{reports?.overdueBooks || 0}</h2>
              <p className="text-muted mb-0">Overdue Books</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <FiBook size={32} className="text-secondary mb-2" />
              <h2 className="fw-bold">{reports?.totalBorrows || 0}</h2>
              <p className="text-muted mb-0">Total Borrows (All Time)</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {reports?.genreDistribution && Object.keys(reports.genreDistribution).length > 0 && (
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white border-bottom">
            <h5 className="mb-0 fw-bold">Genre Distribution</h5>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Genre</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(reports.genreDistribution).map(([genre, count]) => (
                    <tr key={genre}>
                      <td>{genre}</td>
                      <td><strong>{count}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      )}

      {reports?.popularBooks && reports.popularBooks.length > 0 && (
        <Card className="border-0 shadow-sm mt-4">
          <Card.Header className="bg-white border-bottom">
            <h5 className="mb-0 fw-bold">Most Popular Books</h5>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Book Title</th>
                    <th>Author</th>
                    <th>Borrow Count</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.popularBooks.map((book, idx) => (
                    <tr key={book.id || idx}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td><strong>{book.borrowCount || book.count}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default ReportsPage;
