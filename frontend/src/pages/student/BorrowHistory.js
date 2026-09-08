import React, { useState, useEffect } from 'react';
import { Container, Table, Badge } from 'react-bootstrap';
import { borrowService } from '../../services/borrowService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import AlertMessage from '../../components/AlertMessage';
import { formatDate } from '../../utils/helpers';

const BorrowHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await borrowService.getBorrowHistory();
        setHistory(Array.isArray(data) ? data : data.history || data.content || []);
      } catch (err) {
        setError('Failed to load borrow history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <LoadingSpinner message="Loading borrow history..." />;

  return (
    <Container fluid>
      <h3 className="mb-4 fw-bold">Borrow History</h3>

      {error && <AlertMessage variant="danger" message={error} />}

      {history.length === 0 ? (
        <EmptyState
          title="No borrow history"
          message="You haven't borrowed any books yet."
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
                <th>Returned On</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => (
                <tr key={record.id || record.borrowId}>
                  <td className="fw-semibold">{record.title || record.bookTitle || 'N/A'}</td>
                  <td>{record.author || record.bookAuthor || 'N/A'}</td>
                  <td><code>{record.barcode || record.copyBarcode || 'N/A'}</code></td>
                  <td>{formatDate(record.borrowDate || record.borrowedAt)}</td>
                  <td>{formatDate(record.returnDate || record.returnedAt)}</td>
                  <td>{formatDate(record.dueDate)}</td>
                  <td>
                    <Badge bg={record.returnDate || record.returnedAt ? 'success' : 'warning'} text={record.returnDate || record.returnedAt ? undefined : 'dark'}>
                      {record.returnDate || record.returnedAt ? 'Returned' : record.status || 'Borrowed'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default BorrowHistory;
