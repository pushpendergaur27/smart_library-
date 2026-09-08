import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Table } from 'react-bootstrap';
import { bookService } from '../../services/bookService';
import { reservationService } from '../../services/reservationService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import AlertMessage from '../../components/AlertMessage';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import { FiArrowLeft, FiMapPin, FiClock } from 'react-icons/fi';

const StudentBookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reserving, setReserving] = useState(false);
  const [reserveMsg, setReserveMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await bookService.getById(id);
        setBook(data);
      } catch (err) {
        setError('Failed to load book details.');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleReserve = async () => {
    setReserving(true);
    setReserveMsg({ type: '', text: '' });
    try {
      await reservationService.reserveBook(book.id);
      setReserveMsg({ type: 'success', text: 'Book reserved successfully! You will be notified when it becomes available.' });
    } catch (err) {
      setReserveMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to reserve book.' });
    } finally {
      setReserving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading book details..." />;
  if (error) return <Container><AlertMessage variant="danger" message={error} /></Container>;
  if (!book) return <Container><EmptyState title="Book not found" /></Container>;

  const availableCopies = book.availableCopies ?? book.availableCopiesCount ?? 0;
  const totalCopies = book.totalCopies ?? book.totalCopiesCount ?? 0;
  const copies = book.copies || book.physicalCopies || [];
  const locations = copies.filter((c) => c.location || c.floor || c.shelf);

  return (
    <Container fluid>
      <Button variant="outline-secondary" className="mb-3" onClick={() => navigate(-1)}>
        <FiArrowLeft className="me-1" /> Back
      </Button>

      <Row>
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm">
            {book.coverImage || book.imageUrl ? (
              <img
                src={book.coverImage || book.imageUrl}
                alt={book.title}
                className="card-img-top"
                style={{ maxHeight: '400px', objectFit: 'cover' }}
              />
            ) : (
              <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
                <span style={{ fontSize: '4rem' }}>📚</span>
              </div>
            )}
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h3 className="fw-bold mb-1">{book.title}</h3>
                  <p className="text-muted mb-0">by {book.author}</p>
                </div>
                {book.genre && <Badge bg="primary">{book.genre}</Badge>}
              </div>

              <Row className="mb-3">
                <Col sm={6}>
                  <p><strong>ISBN:</strong> <code>{book.isbn}</code></p>
                  <p><strong>Publisher:</strong> {book.publisher || 'N/A'}</p>
                  <p><strong>Edition:</strong> {book.edition || 'N/A'}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Language:</strong> {book.language || 'English'}</p>
                  <p><strong>Year:</strong> {book.publicationYear || book.year || 'N/A'}</p>
                  <p>
                    <strong>Availability:</strong>{' '}
                    <span className={availableCopies > 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                      {availableCopies} / {totalCopies} available
                    </span>
                  </p>
                </Col>
              </Row>

              {book.description && (
                <div className="mb-3">
                  <h6 className="fw-bold">Description</h6>
                  <p className="text-muted">{book.description}</p>
                </div>
              )}

              {availableCopies === 0 && (
                <Button
                  variant="warning"
                  onClick={handleReserve}
                  disabled={reserving}
                >
                  {reserving ? 'Reserving...' : 'Reserve This Book'}
                </Button>
              )}

              {reserveMsg.text && (
                <AlertMessage variant={reserveMsg.type} message={reserveMsg.text} />
              )}
            </Card.Body>
          </Card>

          {locations.length > 0 && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0 fw-bold"><FiMapPin className="me-2" />Physical Locations</h5>
              </Card.Header>
              <Card.Body>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Copy ID</th>
                      <th>Floor</th>
                      <th>Section</th>
                      <th>Shelf</th>
                      <th>Rack</th>
                      <th>Row</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.map((copy) => (
                      <tr key={copy.id}>
                        <td><code>{copy.barcode || copy.id}</code></td>
                        <td>{copy.floor || copy.location?.floor || 'N/A'}</td>
                        <td>{copy.section || copy.location?.section || 'N/A'}</td>
                        <td>{copy.shelf || copy.location?.shelf || 'N/A'}</td>
                        <td>{copy.rack || copy.location?.rack || 'N/A'}</td>
                        <td>{copy.row || copy.location?.row || 'N/A'}</td>
                        <td>
                          <Badge className={getStatusBadgeClass(copy.status)}>
                            {copy.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default StudentBookDetail;
