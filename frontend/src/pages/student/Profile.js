import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, Alert, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import LoadingSpinner from '../../components/LoadingSpinner';

const StudentProfile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await studentService.getProfile();
        setFormData({
          name: data.name || '',
          email: data.email || '',
          studentId: data.studentId || '',
          phone: data.phone || '',
        });
      } catch (err) {
        if (user) {
          setFormData({
            name: user.name || '',
            email: user.email || '',
            studentId: user.studentId || '',
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
      const updated = await studentService.updateProfile(formData);
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
      <h3 className="mb-4 fw-bold">My Profile</h3>

      <Row>
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              {message.text && <Alert variant={message.type}>{message.text}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                  />
                  <Form.Text className="text-muted">Email cannot be changed.</Form.Text>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Student ID</Form.Label>
                      <Form.Control
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

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
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                {formData.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <h5 className="fw-bold">{formData.name || 'Student'}</h5>
              <p className="text-muted mb-1">{formData.email}</p>
              {formData.studentId && (
                <Badge bg="secondary" className="mt-2">ID: {formData.studentId}</Badge>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentProfile;
