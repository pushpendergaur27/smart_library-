import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { bookService } from '../../services/bookService';
import { BOOK_GENRES } from '../../utils/constants';
import { FiArrowLeft } from 'react-icons/fi';

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
    description: '',
    coverImage: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
              <Col md={6}>
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
              <Col md={6}>
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
