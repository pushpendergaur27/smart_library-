import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Form, InputGroup } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { librarianService } from '../../services/librarianService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import AlertMessage from '../../components/AlertMessage';
import { formatDate, formatDateTime } from '../../utils/helpers';
import { FiBookOpen, FiSearch } from 'react-icons/fi';

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'OVERDUE', label: 'Overdue' },
  { key: 'BORROWED', label: 'Active' },
  { key: 'RETURNED', label: 'Returned' },
];

const statusBadge = (status) => {
  switch (status) {
    case 'OVERDUE':
      return <Badge bg="danger">Overdue</Badge>;
    case 'BORROWED':
      return <Badge bg="warning" text="dark">Active</Badge>;
    default:
      return <Badge bg="success">Returned</Badge>;
  }
};

const formatFine = (value) => {
  const n = Number(value) || 0;
  return '\u20B9' + (Number.isInteger(n) ? n : n.toFixed(2));
};

const BorrowsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState((searchParams.get('status') || 'ALL').toUpperCase());
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchBorrows = async () => {
      try {
        const result = await librarianService.getBorrows();
        setData(result);
      } catch (err) {
        setError('Failed to load borrow records.');
      } finally {
        setLoading(false);
      }
    };
    fetchBorrows();
  }, []);

  const changeFilter = (key) => {
    setFilter(key);
    if (key === 'ALL') {
      setSearchParams({});
    } else {
      setSearchParams({ status: key });
    }
  };

  if (loading) return <LoadingSpinner message="Loading borrow records..." />;

  const borrows = data?.borrows || [];
  const finePerDay = data?.finePerDay ?? 5;

  const counts = {
    ALL: borrows.length,
    OVERDUE: borrows.filter((b) => b.status === 'OVERDUE').length,
    BORROWED: borrows.filter((b) => b.status === 'BORROWED').length,
    RETURNED: borrows.filter((b) => b.status === 'RETURNED').length,
  };

  const query = search.trim().toLowerCase();
  const visible = borrows.filter((b) => {
    if (filter !== 'ALL' && b.status !== filter) return false;
    if (!query) return true;
    return [b.studentName, b.studentEmail, b.bookTitle, b.bookAuthor, b.bookGenre, b.barcode]
      .some((field) => (field || '').toLowerCase().includes(query));
  });

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-1 flex-wrap gap-2">
        <h3 className="mb-0 fw-bold">
          <FiBookOpen className="me-2" />Borrowed Books
        </h3>
        <span className="text-muted small">
          Fine: <strong>{formatFine(finePerDay)}/day</strong> overdue
        </span>
      </div>
      <p className="text-muted mb-4">
        Every borrow with student details, book name &amp; genre, due dates, overdue days and calculated fine.
      </p>

      {error && <AlertMessage variant="danger" message={error} />}

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div className="d-flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={filter === f.key ? 'primary' : 'outline-primary'}
              onClick={() => changeFilter(f.key)}
            >
              {f.label} <Badge bg={filter === f.key ? 'light' : 'primary'} text={filter === f.key ? 'dark' : undefined} className="ms-1">
                {counts[f.key]}
              </Badge>
            </Button>
          ))}
        </div>
        <InputGroup style={{ maxWidth: '320px' }}>
          <InputGroup.Text><FiSearch /></InputGroup.Text>
          <Form.Control
            placeholder="Search student, book, genre, barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No borrow records"
          message={filter === 'ALL' && !query ? 'No books have been borrowed yet.' : 'No records match your filter.'}
        />
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="table-responsive">
              <Table hover align="middle" size="sm">
                <thead className="table-dark">
                  <tr>
                    <th>Student</th>
                    <th>Book</th>
                    <th>Genre</th>
                    <th>Barcode</th>
                    <th>Borrowed</th>
                    <th>Due Date</th>
                    <th>Returned</th>
                    <th>Status</th>
                    <th className="text-center">Days Overdue</th>
                    <th className="text-end">Fine</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((b) => (
                    <tr key={b.id} className={b.status === 'OVERDUE' ? 'table-danger' : ''}>
                      <td>
                        <div className="fw-semibold">{b.studentName}</div>
                        <small className="text-muted">{b.studentEmail}</small>
                        {(b.studentCourse || b.studentYear) && (
                          <div><small className="text-secondary">{[b.studentCourse, b.studentYear].filter(Boolean).join(' - ')}</small></div>
                        )}
                      </td>
                      <td>
                        <div className="fw-semibold">{b.bookTitle}</div>
                        <small className="text-muted">{b.bookAuthor}</small>
                      </td>
                      <td>{b.bookGenre || <span className="text-muted">-</span>}</td>
                      <td><code>{b.barcode}</code></td>
                      <td>{formatDateTime(b.borrowDate)}</td>
                      <td className={b.status === 'OVERDUE' ? 'fw-bold text-danger' : ''}>
                        {formatDateTime(b.dueDate)}
                      </td>
                      <td>{b.returnDate ? formatDateTime(b.returnDate) : '-'}</td>
                      <td>{statusBadge(b.status)}</td>
                      <td className="text-center">
                        {b.daysOverdue > 0 ? <strong className="text-danger">{b.daysOverdue}</strong> : '-'}
                      </td>
                      <td className="text-end">
                        {b.fineAmount > 0 ? <strong className="text-danger">{formatFine(b.fineAmount)}</strong> : formatFine(0)}
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

export default BorrowsPage;
