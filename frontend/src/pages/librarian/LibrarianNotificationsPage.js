import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Badge } from 'react-bootstrap';
import { librarianService } from '../../services/librarianService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import AlertMessage from '../../components/AlertMessage';
import { formatDateTime } from '../../utils/helpers';
import { FiBell, FiCheck, FiBookOpen, FiAlertTriangle } from 'react-icons/fi';

const typeBadge = (type) => {
  switch (type) {
    case 'BOOK_OVERDUE':
      return <Badge bg="danger"><FiAlertTriangle className="me-1" />Overdue</Badge>;
    case 'STUDENT_BORROWED':
      return <Badge bg="info"><FiBookOpen className="me-1" />Borrowed</Badge>;
    default:
      return <Badge bg="secondary">{type}</Badge>;
  }
};

const LibrarianNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await librarianService.getNotifications();
      setNotifications(Array.isArray(data) ? data : data.notifications || data.content || []);
    } catch (err) {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await librarianService.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await librarianService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  if (loading) return <LoadingSpinner message="Loading notifications..." />;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">
          <FiBell className="me-2" />Notifications
          {unreadCount > 0 && <Badge bg="danger" className="ms-2">{unreadCount}</Badge>}
        </h3>
        {unreadCount > 0 && (
          <Button variant="outline-primary" size="sm" onClick={handleMarkAllAsRead}>
            <FiCheck className="me-1" /> Mark all as read
          </Button>
        )}
      </div>

      <p className="text-muted mb-4">
        Alerts for student borrows and overdue books, with calculated fines.
      </p>

      {error && <AlertMessage variant="danger" message={error} />}

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          message="No borrow or overdue alerts yet. New events will appear here."
        />
      ) : (
        <div className="d-flex flex-column gap-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`border-0 shadow-sm ${!notification.read ? 'border-start border-primary border-3' : ''}`}
            >
              <Card.Body className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    {typeBadge(notification.type)}
                    <h6 className={`mb-0 ${!notification.read ? 'fw-bold' : ''}`}>
                      {notification.message || 'Notification'}
                    </h6>
                  </div>
                  <small className="text-secondary">
                    {formatDateTime(notification.createdAt || notification.timestamp)}
                  </small>
                </div>
                {!notification.read && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleMarkAsRead(notification.id)}
                    title="Mark as read"
                  >
                    <FiCheck />
                  </Button>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
};

export default LibrarianNotificationsPage;
