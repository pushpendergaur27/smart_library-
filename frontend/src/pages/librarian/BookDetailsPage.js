import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Table, Button } from 'react-bootstrap';
import { bookService } from '../../services/bookService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import { FiArrowLeft } from 'react-icons/fi';

const LibrarianBookDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <LoadingSpinner message="Loading book details..." />;
  if (error) return <Container><AlertMessage variant="danger" message={error} /></Container>;
  if (!book) return <Container><AlertMessage variant="warning" message="Book not found." /></Container>;

  const copies = book.copies || book.physicalCopies || [];
  const availableCopies = book.availableCopies ?? book.availableCopiesCount ?? 0;
  const totalCopies = book.totalCopies ?? book.totalCopiesCount ?? 0;

  return (
    <Container fluid>
      <Button variant="outline-secondary" className="mb-3" onClick={() => navigate(-1)}>
        <FiArrowLeft className="me-1" /> Back
      </Button>

      <Row>
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm">
            {book.coverImage || book.imageUrl ? (
              <img src={book.coverImage || book.imageUrl} alt={book.title} className="card-img-top" style={{ maxHeight: '400px', objectFit: 'cover' }} />
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
                <div>
                  <Button variant="outline-primary" size="sm" className="me-2" onClick={() => navigate(`/librarian/books/${id}/edit`)}>
                    Edit
                  </Button>
                  {book.genre && <Badge bg="primary">{book.genre}</Badge>}
                </div>
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
            </Card.Body>
          </Card>

          {copies.length > 0 && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0 fw-bold">Physical Copies ({copies.length})</h5>
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
                    {copies.map((copy) => (
                      <tr key={copy.id}>
                        <td><code>{copy.barcode || copy.id}</code></td>
                        <td>{copy.floor || copy.location?.floor || 'N/A'}</td>
                        <td>{copy.section || copy.location?.section || 'N/A'}</td>
                        <td>{copy.shelf || copy.location?.shelf || 'N/A'}</td>
                        <td>{copy.rack || copy.location?.rack || 'N/A'}</td>
                        <td>{copy.row || copy.location?.row || 'N/A'}</td>
                        <td><Badge className={getStatusBadgeClass(copy.status)}>{copy.status}</Badge></td>
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

export default LibrarianBookDetailsPage;
