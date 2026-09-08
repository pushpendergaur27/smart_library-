import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button } from 'react-bootstrap';
import { reservationService } from '../../services/reservationService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import AlertMessage from '../../components/AlertMessage';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { formatDate } from '../../utils/helpers';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelId, setCancelId] = useState(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await reservationService.getMyReservations();
      setReservations(Array.isArray(data) ? data : data.reservations || data.content || []);
    } catch (err) {
      setError('Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setCanceling(true);
    try {
      await reservationService.cancelReservation(cancelId);
      setReservations((prev) => prev.filter((r) => r.id !== cancelId));
      setCancelId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel reservation.');
    } finally {
      setCanceling(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading reservations..." />;

  return (
    <Container fluid>
      <h3 className="mb-4 fw-bold">My Reservations</h3>

      {error && <AlertMessage variant="danger" message={error} />}

      {reservations.length === 0 ? (
        <EmptyState
          title="No reservations"
          message="You haven't reserved any books yet."
        />
      ) : (
        <div className="table-responsive">
          <Table hover align="middle" className="border-0 shadow-sm">
            <thead className="table-dark">
              <tr>
                <th>Book Title</th>
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
                  <td className="fw-semibold">{res.bookTitle || res.book?.title || 'N/A'}</td>
                  <td>{formatDate(res.reservationDate || res.reservedAt || res.createdAt)}</td>
                  <td>{formatDate(res.expiryDate || res.expiresAt)}</td>
                  <td>{res.queuePosition || res.position || 'N/A'}</td>
                  <td>
                    <Badge
                      bg={
                        res.status === 'WAITING' ? 'info' :
                        res.status === 'READY' ? 'success' :
                        res.status === 'COLLECTED' ? 'primary' :
                        res.status === 'EXPIRED' ? 'warning' :
                        res.status === 'CANCELLED' ? 'danger' : 'secondary'
                      }
                    >
                      {res.status || 'Pending'}
                    </Badge>
                  </td>
                  <td>
                    {(res.status === 'WAITING' || res.status === 'READY') && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => setCancelId(res.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <ConfirmationDialog
        show={!!cancelId}
        onHide={() => setCancelId(null)}
        onConfirm={handleCancel}
        title="Cancel Reservation"
        message="Are you sure you want to cancel this reservation?"
        confirmText="Cancel Reservation"
        loading={canceling}
      />
    </Container>
  );
};

export default Reservations;
