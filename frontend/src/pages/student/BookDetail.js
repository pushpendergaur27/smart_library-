import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Table, Form, Alert } from 'react-bootstrap';
import { bookService } from '../../services/bookService';
import { borrowService } from '../../services/borrowService';
import { reservationService } from '../../services/reservationService';
import { externalBookService } from '../../services/externalBookService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import AlertMessage from '../../components/AlertMessage';
import { getStatusBadgeClass } from '../../utils/helpers';
import { FiArrowLeft, FiMapPin, FiCheckCircle, FiXCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const openLibraryCover = (isbn) => {
  if (!isbn) return null;
  const clean = String(isbn).replace(/[^0-9Xx]/g, '');
  if (clean.length < 10) return null;
  return `https://covers.openlibrary.org/b/isbn/${clean}-M.jpg?default=false`;
};

const Stars = ({ rating }) => (
  <span>
    {[1, 2, 3, 4, 5].map((i) => (
      <span key={i} style={{ color: rating >= i - 0.25 ? '#f5a623' : '#dee2e6' }}>★</span>
    ))}
    <span className="text-muted ms-1">{rating.toFixed(1)}</span>
  </span>
);

const StudentBookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [barcode, setBarcode] = useState('');
  const [borrowDays, setBorrowDays] = useState(14);
  const [borrowCopies, setBorrowCopies] = useState(1);
  const [borrowing, setBorrowing] = useState(false);
  const [borrowResult, setBorrowResult] = useState(null);
  const [reserving, setReserving] = useState(false);
  const [reserveMsg, setReserveMsg] = useState({ type: '', text: '' });
  const [facts, setFacts] = useState(null);
  const [showLocation, setShowLocation] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const [reviewsData, setReviewsData] = useState(null);
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState({ type: '', text: '' });

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

  useEffect(() => {
    if (book?.isbn) {
      externalBookService.facts(book.isbn)
        .then(setFacts)
        .catch(() => setFacts(null));
    }
  }, [book?.isbn]);

  useEffect(() => {
    bookService.getReviews(id)
      .then(setReviewsData)
      .catch(() => setReviewsData(null));
  }, [id]);

  const myReview = reviewsData?.reviews?.find((r) => r.studentId === user?.id);

  useEffect(() => {
    if (myReview) {
      setMyRating(myReview.rating);
      setMyComment(myReview.comment || '');
    }
  }, [myReview?.id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewMsg({ type: '', text: '' });
    try {
      await bookService.submitReview(id, { rating: myRating, comment: myComment });
      const updated = await bookService.getReviews(id);
      setReviewsData(updated);
      setReviewMsg({ type: 'success', text: myReview ? 'Review updated!' : 'Review submitted. Thanks!' });
    } catch (err) {
      setReviewMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to submit review.' });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleBorrow = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    const days = Math.max(1, Math.min(30, parseInt(borrowDays, 10) || 14));
    const maxCopies = Math.max(1, availableCopiesList.length);
    const copies = Math.max(1, Math.min(maxCopies, parseInt(borrowCopies, 10) || 1));
    setBorrowing(true);
    setBorrowResult(null);
    try {
      const response = await borrowService.borrowBook(barcode.trim(), days, copies);
      setBorrowResult({ success: true, message: response.message || 'Book borrowed successfully!' });
      setBarcode('');
      setBorrowCopies(1);
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
  const cover = !coverFailed && (book.coverImage || book.imageUrl || openLibraryCover(book.isbn));
  const rent = book.rent != null && Number(book.rent) > 0 ? `₹${Number(book.rent).toLocaleString()}` : 'Free';

  const detailRows = [
    ['ISBN', <code key="isbn">{book.isbn}</code>],
    ['Publisher', book.publisher || 'N/A'],
    ['Edition', book.edition || 'N/A'],
    ['Language', book.language || 'English'],
    ['Year', book.publicationYear || 'N/A'],
    ['Pages', facts?.pageCount ? `${facts.pageCount} pages` : 'N/A'],
    ['Rent', <span key="rent" className="text-success fw-bold">{rent}</span>],
    ['Rating', facts?.rating != null
      ? <span key="rating"><Stars rating={facts.rating} /> <small className="text-muted">({facts.ratingsCount || 0} ratings)</small></span>
      : 'N/A'],
    ['Availability', (
      <span key="avail" className={availableCopies > 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
        {availableCopies} / {totalCopies} available
      </span>
    )],
  ];

  return (
    <Container fluid>
      <Button variant="outline-secondary" className="mb-3" onClick={() => navigate(-1)}>
        <FiArrowLeft className="me-1" /> Back
      </Button>

      <Row>
        <Col lg={5} className="mb-4">
          <Card className="border-0 shadow-sm">
            {cover ? (
              <img
                src={cover}
                alt={book.title || 'Book cover'}
                onError={() => setCoverFailed(true)}
                className="card-img-top bg-light"
                style={{ height: '420px', objectFit: 'contain', padding: '16px' }}
              />
            ) : (
              <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '420px' }}>
                <div className="text-center">
                  <span style={{ fontSize: '4rem' }}>📚</span>
                  <small className="d-block text-muted mt-2">No Cover</small>
                </div>
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
                    <Form.Label className="small fw-bold">Barcode</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. 9780134685991-C1"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                    />
                  </Form.Group>
                  <Row className="g-2 mb-3">
                    <Col xs={6}>
                      <Form.Label className="small fw-bold">Days</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max="30"
                        value={borrowDays}
                        onChange={(e) => setBorrowDays(e.target.value)}
                      />
                    </Col>
                    <Col xs={6}>
                      <Form.Label className="small fw-bold">Copies</Form.Label>
                      <Form.Select
                        value={borrowCopies > Math.max(1, availableCopiesList.length) ? Math.max(1, availableCopiesList.length) : borrowCopies}
                        onChange={(e) => setBorrowCopies(Number(e.target.value))}
                      >
                        {Array.from({ length: Math.max(1, availableCopiesList.length) }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Row>
                  <p className="text-muted small mb-3">
                    Due: <strong>{new Date(Date.now() + (Math.max(1, Math.min(30, parseInt(borrowDays, 10) || 14))) * 86400000).toLocaleDateString()}</strong>
                    {' '}· 1–30 days · up to {availableCopiesList.length} {availableCopiesList.length === 1 ? 'copy' : 'copies'}
                  </p>
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

        <Col lg={7}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h3 className="fw-bold mb-1">{book.title}</h3>
                  <p className="text-muted mb-0">by {book.author}</p>
                </div>
                {book.genre && <Badge bg="primary">{book.genre}</Badge>}
              </div>

              <div className="mb-3">
                {detailRows.map(([label, value]) => (
                  <div key={label} className="d-flex py-2 border-bottom" style={{ gap: '16px' }}>
                    <div style={{ width: '130px', minWidth: '130px' }} className="fw-bold">{label}:</div>
                    <div style={{ wordBreak: 'break-word' }}>{value}</div>
                  </div>
                ))}
              </div>

              {book.description && (
                <div>
                  <h6 className="fw-bold">Description</h6>
                  <p className="text-muted mb-0">{book.description}</p>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-bottom d-flex align-items-center justify-content-between">
              <h5 className="mb-0 fw-bold">★ Student Reviews</h5>
              {reviewsData?.reviewCount > 0 && (
                <span className="text-muted small">
                  <strong>{reviewsData.averageRating?.toFixed(1)}</strong> / 5 · {reviewsData.reviewCount} {reviewsData.reviewCount === 1 ? 'review' : 'reviews'}
                </span>
              )}
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmitReview} className="mb-4 pb-3 border-bottom">
                <div className="d-flex align-items-center mb-2" style={{ gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      role="button"
                      onClick={() => setMyRating(n)}
                      style={{ cursor: 'pointer', fontSize: '1.6rem', color: myRating >= n ? '#f5a623' : '#dee2e6' }}
                    >
                      ★
                    </span>
                  ))}
                  <span className="text-muted small ms-2">{myRating}/5</span>
                </div>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Share your thoughts about this book (optional)..."
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value)}
                  className="mb-2"
                />
                <div className="d-flex align-items-center gap-2">
                  <Button variant="primary" type="submit" size="sm" disabled={submittingReview}>
                    {submittingReview ? 'Submitting...' : myReview ? 'Update Review' : 'Submit Review'}
                  </Button>
                  {reviewMsg.text && (
                    <Alert variant={reviewMsg.type} className="py-1 px-2 mb-0 small">{reviewMsg.text}</Alert>
                  )}
                </div>
              </Form>

              {reviewsData?.reviews?.length === 0 ? (
                <p className="text-muted text-center mb-0">No reviews yet — be the first to review this book!</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {reviewsData?.reviews?.map((review) => (
                    <div key={review.id}>
                      <div className="d-flex justify-content-between align-items-center">
                        <strong className="small">{review.studentName}</strong>
                        <small className="text-muted">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                        </small>
                      </div>
                      <div style={{ color: '#f5a623', fontSize: '0.95rem' }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <span key={n} style={{ color: review.rating >= n ? '#f5a623' : '#dee2e6' }}>★</span>
                        ))}
                        {review.studentId === user?.id && <span className="text-muted small ms-2">(you)</span>}
                      </div>
                      {review.comment && <p className="text-muted small mb-0">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>

          {availableCopiesList.length > 0 && (
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Button
                  variant="outline-primary"
                  className="w-100 d-flex align-items-center justify-content-center"
                  onClick={() => setShowLocation((v) => !v)}
                  aria-expanded={showLocation}
                >
                  <FiMapPin className="me-2" />
                  {showLocation ? 'Hide Location' : 'Show Location'} ({availableCopiesList.length} {availableCopiesList.length === 1 ? 'copy' : 'copies'})
                  {showLocation ? <FiChevronUp className="ms-2" /> : <FiChevronDown className="ms-2" />}
                </Button>

                {showLocation && (
                  <div className="mt-3">
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
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default StudentBookDetail;
