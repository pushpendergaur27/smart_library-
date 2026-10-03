import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { truncateText } from '../utils/helpers';

const openLibraryCover = (isbn) => {
  if (!isbn) return null;
  const clean = String(isbn).replace(/[^0-9Xx]/g, '');
  if (clean.length < 10) return null;
  return `https://covers.openlibrary.org/b/isbn/${clean}-M.jpg?default=false`;
};

const BookCard = ({ book, basePath = '/student/books' }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const availableCopies = book.availableCopies ?? book.availableCopiesCount ?? 0;
  const totalCopies = book.totalCopies ?? book.totalCopiesCount ?? 0;
  const cover = book.coverImage || book.imageUrl || openLibraryCover(book.isbn);

  return (
    <Card className="h-100 shadow-sm book-card">
      <Link to={`${basePath}/${book.id}`} className="text-decoration-none" aria-label={book.title}>
        <div
          className="bg-light d-flex align-items-center justify-content-center overflow-hidden"
          style={{ height: '200px' }}
        >
          {cover && !imgFailed ? (
            <img
              src={cover}
              alt={book.title || 'Book cover'}
              loading="lazy"
              onError={() => setImgFailed(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div className="text-center p-3">
              <span style={{ fontSize: '3rem', color: '#6c757d' }}>📚</span>
              <small className="d-block text-muted mt-1">No Cover</small>
            </div>
          )}
        </div>
      </Link>
      <Card.Body className="d-flex flex-column">
        <Card.Title
          as={Link}
          to={`${basePath}/${book.id}`}
          className="text-decoration-none text-dark fs-6 fw-bold"
          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
        >
          {truncateText(book.title, 60)}
        </Card.Title>
        <Card.Text className="text-muted small mb-1" style={{ wordBreak: 'break-word' }}>
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
    </Card>
  );
};

export default BookCard;
