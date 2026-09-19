import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Table, Form, Alert } from 'react-bootstrap';
import { bookService } from '../../services/bookService';
import { borrowService } from '../../services/borrowService';
import { reservationService } from '../../services/reservationService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import AlertMessage from '../../components/AlertMessage';
import { getStatusBadgeClass } from '../../utils/helpers';
import { FiArrowLeft, FiMapPin, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const StudentBookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [barcode, setBarcode] = useState('');
  const [borrowing, setBorrowing] = useState(false);
  const [borrowResult, setBorrowResult] = useState(null);
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

  const handleBorrow = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    setBorrowing(true);
    setBorrowResult(null);
    try {
      const response = await borrowService.borrowBook(barcode.trim());
      setBorrowResult({ success: true, message: response.message || 'Book borrowed successfully!' });
      setBarcode('');
      const updated = await bookService.getById(id);
      setBook(updated);
    } catch (err) {
      setBorrowResult({
        success: false,
        message: err.response?.data?.message || 'Failed to borrow book. Check the barcode and try again.',
      });
    } finally {
      setBorrowing(false);
    }
  };

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

  const availableCopies = book.availableCopies ?? 0;
  const totalCopies = book.totalCopies ?? 0;
  const copies = book.copies || [];
  const availableCopiesList = copies.filter((c) => c.status === 'AVAILABLE');

  return (
    <Container fluid>
      <Button variant="outline-secondary" className="mb-3" onClick={() => navigate(-1)}>
        <FiArrowLeft className="me-1" /> Back
      </Button>

      <Row>
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm">
            {book.coverImage ? (
              <img
                src={book.coverImage}
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

          {availableCopies > 0 && (
            <Card className="border-0 shadow-sm mt-3">
              <Card.Header className="bg-success bg-opacity-10 border-bottom">
                <h6 className="mb-0 fw-bold text-success">Borrow This Book</h6>
              </Card.Header>
              <Card.Body>
                <p className="text-muted small mb-2">Enter the barcode from the book's library sticker to borrow it.</p>
                <Form onSubmit={handleBorrow}>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="text"
                      placeholder="e.g. 9780134685991-C1"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                    />
                  </Form.Group>
                  <Button variant="success" type="submit" disabled={borrowing || !barcode.trim()} className="w-100">
                    {borrowing ? 'Borrowing...' : 'Borrow Book'}
                  </Button>
                </Form>
                {borrowResult && (
                  <div className="mt-3">
                    {borrowResult.success ? (
                      <Alert variant="success" className="d-flex align-items-center mb-0">
                        <FiCheckCircle className="me-2" /> {borrowResult.message}
                      </Alert>
                    ) : (
                      <Alert variant="danger" className="d-flex align-items-center mb-0">
                        <FiXCircle className="me-2" /> {borrowResult.message}
                      </Alert>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {availableCopies === 0 && (
            <Card className="border-0 shadow-sm mt-3">
              <Card.Body>
                <p className="text-muted mb-2">All copies are currently borrowed.</p>
                <Button variant="warning" onClick={handleReserve} disabled={reserving} className="w-100">
                  {reserving ? 'Reserving...' : 'Reserve This Book'}
                </Button>
                {reserveMsg.text && (
                  <div className="mt-2">
                    <AlertMessage variant={reserveMsg.type} message={reserveMsg.text} />
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
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
                  <p><strong>Year:</strong> {book.publicationYear || 'N/A'}</p>
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
            </Card.Body>
          </Card>

          {availableCopiesList.length > 0 && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0 fw-bold"><FiMapPin className="me-2" />Available Copies - Enter Barcode Below</h5>
              </Card.Header>
              <Card.Body>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Barcode</th>
                      <th>Floor</th>
                      <th>Section</th>
                      <th>Shelf</th>
                      <th>Rack</th>
                      <th>Row</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableCopiesList.map((copy) => (
                      <tr key={copy.id}>
                        <td><code>{copy.barcode || copy.libraryBarcode}</code></td>
                        <td>{copy.floor || 'N/A'}</td>
                        <td>{copy.section || 'N/A'}</td>
                        <td>{copy.shelf || 'N/A'}</td>
                        <td>{copy.rack || 'N/A'}</td>
                        <td>{copy.rowNumber || 'N/A'}</td>
                        <td>
                          <Badge className={getStatusBadgeClass(copy.status)}>
                            {copy.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <p className="text-muted small mt-2">Copy the barcode from the table above into the borrow form on the left.</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default StudentBookDetail;
