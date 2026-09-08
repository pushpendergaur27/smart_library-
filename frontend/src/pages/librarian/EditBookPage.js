import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { bookService } from '../../services/bookService';
import { BOOK_GENRES } from '../../utils/constants';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiArrowLeft } from 'react-icons/fi';

const EditBookPage = () => {
  const { id } = useParams();
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await bookService.getById(id);
        setFormData({
          title: data.title || '',
          author: data.author || '',
          isbn: data.isbn || '',
          publisher: data.publisher || '',
          genre: data.genre || '',
          edition: data.edition || '',
          language: data.language || 'English',
          publicationYear: data.publicationYear || data.year || '',
          description: data.description || '',
          coverImage: data.coverImage || data.imageUrl || '',
        });
      } catch (err) {
        setError('Failed to load book details.');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await bookService.update(id, formData);
      navigate('/librarian/books');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update book.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading book details..." />;

  return (
    <Container fluid>
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
        <FiArrowLeft className="me-1" /> Back
      </button>

      <h3 className="mb-4 fw-bold">Edit Book</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Author *</Form.Label>
                  <Form.Control type="text" name="author" value={formData.author} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ISBN *</Form.Label>
                  <Form.Control type="text" name="isbn" value={formData.isbn} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Publisher</Form.Label>
                  <Form.Control type="text" name="publisher" value={formData.publisher} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Genre *</Form.Label>
                  <Form.Select name="genre" value={formData.genre} onChange={handleChange} required>
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
                  <Form.Control type="text" name="edition" value={formData.edition} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Language</Form.Label>
                  <Form.Control type="text" name="language" value={formData.language} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Publication Year</Form.Label>
                  <Form.Control type="number" name="publicationYear" value={formData.publicationYear} onChange={handleChange} min="1000" max="2099" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cover Image URL</Form.Label>
                  <Form.Control type="url" name="coverImage" value={formData.coverImage} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={4} name="description" value={formData.description} onChange={handleChange} />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </Button>
              <Button variant="outline-secondary" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditBookPage;
