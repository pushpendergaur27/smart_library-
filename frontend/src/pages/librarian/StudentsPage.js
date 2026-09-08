import React, { useState, useEffect } from 'react';
import { Container, Table, Card } from 'react-bootstrap';
import { librarianService } from '../../services/librarianService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import AlertMessage from '../../components/AlertMessage';
import { formatDate } from '../../utils/helpers';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await librarianService.getStudents();
        setStudents(Array.isArray(data) ? data : data.students || data.content || []);
      } catch (err) {
        setError('Failed to load students.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) return <LoadingSpinner message="Loading students..." />;

  return (
    <Container fluid>
      <h3 className="mb-4 fw-bold">Students</h3>

      {error && <AlertMessage variant="danger" message={error} />}

      {students.length === 0 ? (
        <EmptyState title="No students found" message="No students have registered yet." />
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="table-responsive">
              <Table hover align="middle">
                <thead className="table-dark">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Student ID</th>
                    <th>Phone</th>
                    <th>Registered On</th>
                    <th>Active Borrows</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="fw-semibold">{student.name}</td>
                      <td>{student.email}</td>
                      <td><code>{student.studentId || 'N/A'}</code></td>
                      <td>{student.phone || 'N/A'}</td>
                      <td>{formatDate(student.createdAt || student.registeredAt)}</td>
                      <td>{student.activeBorrows || student.borrowedBooksCount || 0}</td>
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

export default StudentsPage;
