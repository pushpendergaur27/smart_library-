import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { librarianService } from '../../services/librarianService';
import LoadingSpinner from '../../components/LoadingSpinner';

const LibrarianProfile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await librarianService.getProfile();
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
        });
      } catch (err) {
        if (user) {
          setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const updated = await librarianService.updateProfile(formData);
      setUser(updated);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading profile..." />;

  return (
    <Container fluid>
      <h3 className="mb-4 fw-bold">Librarian Profile</h3>

      <Row>
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              {message.text && <Alert variant={message.type}>{message.text}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control type="email" name="email" value={formData.email} disabled />
                  <Form.Text className="text-muted">Email cannot be changed.</Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                </Form.Group>

                <Button variant="primary" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center p-4">
              <div className="bg-dark text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                {formData.name?.charAt(0)?.toUpperCase() || 'L'}
              </div>
              <h5 className="fw-bold">{formData.name || 'Librarian'}</h5>
              <p className="text-muted mb-1">{formData.email}</p>
              <span className="badge bg-dark">LIBRARIAN</span>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LibrarianProfile;
