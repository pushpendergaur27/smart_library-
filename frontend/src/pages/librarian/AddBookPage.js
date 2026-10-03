import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { bookService } from '../../services/bookService';
import { externalBookService } from '../../services/externalBookService';
import { BOOK_GENRES } from '../../utils/constants';
import { FiArrowLeft, FiSearch } from 'react-icons/fi';

const AddBookPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    genre: '',
    edition: '',
    language: 'English',
    publicationYear: '',
    rent: '',
    description: '',
    coverImage: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleExternalSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError('');
    setSearchResults([]);
    setSelectedIdx(null);
    try {
      const results = await externalBookService.search(searchQuery.trim());
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError('No matches found. Enter the details manually.');
      }
    } catch (err) {
      setSearchError('Book search failed. Enter the details manually.');
    } finally {
      setSearching(false);
    }
  };

  const matchGenre = (externalGenre) => {
    if (!externalGenre) return '';
    const g = externalGenre.toLowerCase();
    const found = BOOK_GENRES.find((genre) => genre.toLowerCase() === g)
      || BOOK_GENRES.find((genre) => g.includes(genre.toLowerCase()) || genre.toLowerCase().includes(g));
    return found || '';
  };

  const applyExternalBook = (book, idx) => {
    setSelectedIdx(idx);
    setFormData({
      title: book.title || '',
      author: (book.authors || []).join(', '),
      isbn: book.isbn || '',
      publisher: book.publisher || '',
      genre: matchGenre(book.genre),
      edition: '',
      language: 'English',
      publicationYear: book.publicationYear ? String(book.publicationYear) : '',
      description: book.description || '',
      coverImage: book.coverImage || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await bookService.create(formData);
      navigate('/librarian/books');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add book.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid>
      <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => navigate(-1)}
      >
        <FiArrowLeft className="me-1" /> Back
      </button>

      <h3 className="mb-4 fw-bold">Add New Book</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <h6 className="fw-bold mb-3">Import from Google Books</h6>
          <Form onSubmit={handleExternalSearch}>
            <Row>
              <Col md={8}>
                <Form.Control
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, author or ISBN..."
                />
              </Col>
              <Col md={4}>
                <Button variant="outline-primary" type="submit" className="w-100" disabled={searching}>
                  {searching ? (
                    <><Spinner size="sm" className="me-1" /> Searching...</>
                  ) : (
                    <><FiSearch className="me-1" /> Search Books</>
                  )}
                </Button>
              </Col>
            </Row>
          </Form>

          {searchError && <div className="text-muted small mt-2">{searchError}</div>}

          {searchResults.length > 0 && (
            <div className="mt-3 d-flex flex-column gap-2">
              {searchResults.map((book, idx) => (
                <div
                  key={idx}
                  className={`d-flex align-items-center gap-3 p-2 rounded border ${selectedIdx === idx ? 'border-primary bg-light' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => applyExternalBook(book, idx)}
                >
                  {book.coverImage && (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      style={{ width: 40, height: 56, objectFit: 'cover', borderRadius: 3 }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className="flex-grow-1">
                    <div className="fw-semibold small">{book.title}</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                      {(book.authors || []).join(', ')}
                      {book.publicationYear ? ` · ${book.publicationYear}` : ''}
                      {book.isbn ? ` · ISBN ${book.isbn}` : ''}
                    </div>
                  </div>
                  <Button
                    variant={selectedIdx === idx ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); applyExternalBook(book, idx); }}
                  >
                    {selectedIdx === idx ? '✓ Selected' : 'Use'}
                  </Button>
                </div>
              ))}
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                Data source: {searchResults[0]?.source}. Click a result to fill the form below — you can edit any field.
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter book title"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Author *</Form.Label>
                  <Form.Control
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    required
                    placeholder="Enter author name"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ISBN *</Form.Label>
                  <Form.Control
                    type="text"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleChange}
                    required
                    placeholder="Enter ISBN"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Publisher</Form.Label>
                  <Form.Control
                    type="text"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleChange}
                    placeholder="Enter publisher"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Genre *</Form.Label>
                  <Form.Select
                    name="genre"
                    value={formData.genre}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Genre</option>
                    {BOOK_GENRES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Edition</Form.Label>
                  <Form.Control
                    type="text"
                    name="edition"
                    value={formData.edition}
                    onChange={handleChange}
                    placeholder="e.g., 3rd Edition"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Language</Form.Label>
                  <Form.Control
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    placeholder="e.g., English"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Publication Year</Form.Label>
                  <Form.Control
                    type="number"
                    name="publicationYear"
                    value={formData.publicationYear}
                    onChange={handleChange}
                    placeholder="e.g., 2024"
                    min="1000"
                    max="2099"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Rent (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    name="rent"
                    value={formData.rent}
                    onChange={handleChange}
                    placeholder="e.g., 10"
                    min="0"
                    step="0.5"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Cover Image URL</Form.Label>
                  <Form.Control
                    type="url"
                    name="coverImage"
                    value={formData.coverImage}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter book description..."
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Adding Book...' : 'Add Book'}
              </Button>
              <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddBookPage;
