import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Card } from 'react-bootstrap';
import { reservationService } from '../../services/reservationService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import AlertMessage from '../../components/AlertMessage';
import { formatDate } from '../../utils/helpers';

const LibrarianReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await reservationService.getAllReservations();
      setReservations(Array.isArray(data) ? data : data.reservations || data.content || []);
    } catch (err) {
      setError('Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (id) => {
    setProcessingId(id);
    try {
      await reservationService.processReservation(id);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'FULFILLED' } : r))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process reservation.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading reservations..." />;

  return (
    <Container fluid>
      <h3 className="mb-4 fw-bold">Manage Reservations</h3>

      {error && <AlertMessage variant="danger" message={error} />}

      {reservations.length === 0 ? (
        <EmptyState title="No reservations" message="No pending reservations." />
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="table-responsive">
              <Table hover align="middle">
                <thead className="table-dark">
                  <tr>
                    <th>Student</th>
                    <th>Book</th>
                    <th>Reserved On</th>
                    <th>Expiry Date</th>
                    <th>Queue Position</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((res) => (
                    <tr key={res.id}>
                      <td>{res.studentName || res.student?.name || 'N/A'}</td>
                      <td className="fw-semibold">{res.bookTitle || res.book?.title || 'N/A'}</td>
                      <td>{formatDate(res.reservedAt || res.createdAt)}</td>
                      <td>{formatDate(res.expiryDate || res.expiresAt)}</td>
                      <td>{res.queuePosition || res.position || 'N/A'}</td>
                      <td>
                        <Badge
                          bg={
                            res.status === 'PENDING' || res.status === 'ACTIVE' ? 'warning' :
                            res.status === 'FULFILLED' ? 'success' :
                            res.status === 'EXPIRED' ? 'danger' : 'secondary'
                          }
                        >
                          {res.status}
                        </Badge>
                      </td>
                      <td>
                        {(res.status === 'PENDING' || res.status === 'ACTIVE') && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleProcess(res.id)}
                            disabled={processingId === res.id}
                          >
                            {processingId === res.id ? 'Processing...' : 'Fulfill'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default LibrarianReservations;
