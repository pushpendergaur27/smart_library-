import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { truncateText, getStatusBadgeClass } from '../utils/helpers';

const BookCard = ({ book, basePath = '/student/books' }) => {
  const availableCopies = book.availableCopies ?? book.availableCopiesCount ?? 0;
  const totalCopies = book.totalCopies ?? book.totalCopiesCount ?? 0;

  return (
    <Card className="h-100 shadow-sm book-card">
      <div className="d-flex" style={{ minHeight: '180px' }}>
        <div
          className="d-flex align-items-center justify-content-center bg-light"
          style={{ width: '140px', minWidth: '140px' }}
        >
          {book.coverImage || book.imageUrl ? (
            <img
              src={book.coverImage || book.imageUrl}
              alt={book.title}
              style={{ width: '100%', height: '180px', objectFit: 'cover' }}
            />
          ) : (
            <div className="text-center p-3">
              <span style={{ fontSize: '3rem', color: '#6c757d' }}>📚</span>
              <small className="d-block text-muted mt-1">No Cover</small>
            </div>
          )}
        </div>
        <Card.Body className="d-flex flex-column">
          <Card.Title as={Link} to={`${basePath}/${book.id}`} className="text-decoration-none text-dark fs-6 fw-bold">
            {truncateText(book.title, 60)}
          </Card.Title>
          <Card.Text className="text-muted small mb-1">
            by {book.author}
          </Card.Text>
          {book.genre && (
            <span className="badge bg-secondary mb-2" style={{ width: 'fit-content' }}>
              {book.genre}
            </span>
          )}
          <div className="mt-auto">
            <div className="d-flex justify-content-between align-items-center">
              <small className={availableCopies > 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                {availableCopies > 0 ? `${availableCopies} available` : 'Not available'}
              </small>
              <small className="text-muted">{totalCopies} total</small>
            </div>
          </div>
        </Card.Body>
      </div>
    </Card>
  );
};

export default BookCard;
