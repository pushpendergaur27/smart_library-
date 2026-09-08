import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FiBook, FiSearch, FiCamera, FiUsers } from 'react-icons/fi';

const Home = () => {
  return (
    <div className="bg-light min-vh-100">
      <section className="bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <h1 className="display-5 fw-bold">Smart Library Assistant</h1>
              <p className="lead mb-4">
                Your digital gateway to the university library. Search, borrow, and manage books with ease.
              </p>
              <div className="d-flex gap-3">
                <Link to="/login">
                  <Button variant="light" size="lg">Get Started</Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline-light" size="lg">Register</Button>
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <Container className="py-5">
        <h2 className="text-center mb-5 fw-bold">Features</h2>
        <Row>
          <Col md={3} className="mb-4">
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '70px', height: '70px' }}>
                  <FiSearch size={32} className="text-primary" />
                </div>
                <h5 className="fw-bold">Search Books</h5>
                <p className="text-muted">Find books by title, author, ISBN, or genre from our extensive catalog.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-4">
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '70px', height: '70px' }}>
                  <FiCamera size={32} className="text-success" />
                </div>
                <h5 className="fw-bold">Scan & Borrow</h5>
                <p className="text-muted">Use your camera to scan book barcodes for quick borrowing.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-4">
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '70px', height: '70px' }}>
                  <FiBook size={32} className="text-warning" />
                </div>
                <h5 className="fw-bold">Track Books</h5>
                <p className="text-muted">Monitor your borrowed books, due dates, and borrow history.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-4">
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '70px', height: '70px' }}>
                  <FiUsers size={32} className="text-info" />
                </div>
                <h5 className="fw-bold">Management</h5>
                <p className="text-muted">Full management tools for librarians to handle the library system.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
