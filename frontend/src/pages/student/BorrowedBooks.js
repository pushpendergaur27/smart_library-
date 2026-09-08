import React, { useState, useEffect } from 'react';
import { Container, Table, Badge } from 'react-bootstrap';
import { borrowService } from '../../services/borrowService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import AlertMessage from '../../components/AlertMessage';
import { formatDate, isOverdue, getDaysUntilDue } from '../../utils/helpers';

const BorrowedBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBorrowed = async () => {
      try {
        const data = await borrowService.getBorrowedBooks();
        setBooks(Array.isArray(data) ? data : data.borrowedBooks || data.content || []);
      } catch (err) {
        setError('Failed to load borrowed books.');
      } finally {
        setLoading(false);
      }
    };
    fetchBorrowed();
  }, []);

  if (loading) return <LoadingSpinner message="Loading borrowed books..." />;

  return (
    <Container fluid>
      <h3 className="mb-4 fw-bold">Currently Borrowed Books</h3>

      {error && <AlertMessage variant="danger" message={error} />}

      {books.length === 0 ? (
        <EmptyState
          title="No borrowed books"
          message="You haven't borrowed any books yet. Go browse our catalog!"
        />
      ) : (
        <div className="table-responsive">
          <Table hover align="middle" className="border-0 shadow-sm">
            <thead className="table-dark">
              <tr>
                <th>Book Title</th>
                <th>Author</th>
                <th>Barcode</th>
                <th>Borrowed On</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => {
                const overdue = isOverdue(book.dueDate);
                const daysLeft = getDaysUntilDue(book.dueDate);
                return (
                  <tr key={book.id || book.borrowId}>
                    <td className="fw-semibold">{book.title || book.bookTitle || 'N/A'}</td>
                    <td>{book.author || book.bookAuthor || 'N/A'}</td>
                    <td><code>{book.barcode || book.copyBarcode || 'N/A'}</code></td>
                    <td>{formatDate(book.borrowDate || book.borrowedAt)}</td>
                    <td>{formatDate(book.dueDate)}</td>
                    <td>
                      {overdue ? (
                        <Badge bg="danger">Overdue</Badge>
                      ) : daysLeft !== null && daysLeft <= 3 ? (
                        <Badge bg="warning" text="dark">Due in {daysLeft} day(s)</Badge>
                      ) : (
                        <Badge bg="success">Active</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default BorrowedBooks;
