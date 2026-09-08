import React from 'react';
import { Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getStatusBadgeClass } from '../utils/helpers';

const BookTable = ({ books, basePath = '/student/books', showActions = false, onEdit, onDelete }) => {
  if (!books || books.length === 0) {
    return null;
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-dark">
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>ISBN</th>
            <th>Genre</th>
            <th>Available</th>
            <th>Total</th>
            {showActions && <th className="text-center">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>
                <Link to={`${basePath}/${book.id}`} className="text-decoration-none fw-semibold">
                  {book.title}
                </Link>
              </td>
              <td>{book.author}</td>
              <td><code>{book.isbn}</code></td>
              <td>
                <Badge bg="secondary">{book.genre || 'N/A'}</Badge>
              </td>
              <td>
                <span className={book.availableCopies > 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                  {book.availableCopies ?? book.availableCopiesCount ?? 0}
                </span>
              </td>
              <td>{book.totalCopies ?? book.totalCopiesCount ?? 0}</td>
              {showActions && (
                <td className="text-center">
                  {onEdit && (
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEdit(book)}>
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(book)}>
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookTable;
