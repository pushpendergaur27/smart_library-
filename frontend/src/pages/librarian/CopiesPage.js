import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Form, Row, Col, Modal } from 'react-bootstrap';
import { librarianService } from '../../services/librarianService';
import { bookService } from '../../services/bookService';
import { COPY_STATUSES } from '../../utils/constants';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import AlertMessage from '../../components/AlertMessage';
import { getStatusBadgeClass } from '../../utils/helpers';

const CopiesPage = () => {
  const [copies, setCopies] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCopy, setSelectedCopy] = useState(null);
  const [adding, setAdding] = useState(false);
  const [bookFilter, setBookFilter] = useState('');
  const [newCopy, setNewCopy] = useState({
    bookId: '',
    barcode: '',
    floor: '',
    section: '',
    shelf: '',
    rack: '',
    row: '',
  });
  const [editLocation, setEditLocation] = useState({
    floor: '',
    section: '',
    shelf: '',
    rack: '',
    row: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [copiesData, booksData] = await Promise.allSettled([
        librarianService.getCopies(),
        bookService.getAll(),
      ]);
      if (copiesData.status === 'fulfilled') {
        setCopies(Array.isArray(copiesData.value) ? copiesData.value : copiesData.value.copies || copiesData.value.content || []);
      }
      if (booksData.status === 'fulfilled') {
        const bd = booksData.value;
        setBooks(Array.isArray(bd) ? bd : bd.content || bd.books || []);
      }
    } catch (err) {
      setError('Failed to load copies.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCopy = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError('');
    try {
      const copyData = {
        bookId: newCopy.bookId,
        barcode: newCopy.barcode,
        location: {
          floor: newCopy.floor,
          section: newCopy.section,
          shelf: newCopy.shelf,
          rack: newCopy.rack,
          row: newCopy.row,
        },
      };
      const created = await librarianService.createCopy(copyData);
      setCopies((prev) => [...prev, created]);
      setShowAddModal(false);
      setNewCopy({ bookId: '', barcode: '', floor: '', section: '', shelf: '', rack: '', row: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add copy.');
    } finally {
      setAdding(false);
    }
  };

  const handleEditLocation = async () => {
    if (!selectedCopy) return;
    try {
      await librarianService.updateCopyLocation(selectedCopy.id, editLocation);
      setCopies((prev) =>
        prev.map((c) =>
          c.id === selectedCopy.id
            ? { ...c, location: editLocation, floor: editLocation.floor, section: editLocation.section, shelf: editLocation.shelf, rack: editLocation.rack, row: editLocation.row }
            : c
        )
      );
      setShowEditModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update location.');
    }
  };

  const openEditModal = (copy) => {
    setSelectedCopy(copy);
    const loc = copy.location || {};
    setEditLocation({
      floor: loc.floor || copy.floor || '',
      section: loc.section || copy.section || '',
      shelf: loc.shelf || copy.shelf || '',
      rack: loc.rack || copy.rack || '',
      row: loc.row || copy.row || '',
    });
    setShowEditModal(true);
  };

  const filteredCopies = bookFilter
    ? copies.filter((c) => (c.bookId || c.book?.id?.toString()) === bookFilter)
    : copies;

  if (loading) return <LoadingSpinner message="Loading copies..." />;

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Manage Copies</h3>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>+ Add Copy</Button>
      </div>

      {error && <AlertMessage variant="danger" message={error} />}

      <div className="mb-3">
        <Form.Select
          style={{ maxWidth: '300px' }}
          value={bookFilter}
          onChange={(e) => setBookFilter(e.target.value)}
        >
          <option value="">All Books</option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>{book.title}</option>
          ))}
        </Form.Select>
      </div>

      {filteredCopies.length === 0 ? (
        <EmptyState title="No copies found" message="Add copies for your books." />
      ) : (
        <div className="table-responsive">
          <Table hover align="middle" className="border-0 shadow-sm">
            <thead className="table-dark">
              <tr>
                <th>Barcode</th>
                <th>Book</th>
                <th>Floor</th>
                <th>Section</th>
                <th>Shelf</th>
                <th>Rack</th>
                <th>Row</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCopies.map((copy) => {
                const loc = copy.location || {};
                return (
                  <tr key={copy.id}>
                    <td><code>{copy.barcode || 'N/A'}</code></td>
                    <td>{copy.bookTitle || copy.book?.title || 'N/A'}</td>
                    <td>{loc.floor || copy.floor || 'N/A'}</td>
                    <td>{loc.section || copy.section || 'N/A'}</td>
                    <td>{loc.shelf || copy.shelf || 'N/A'}</td>
                    <td>{loc.rack || copy.rack || 'N/A'}</td>
                    <td>{loc.row || copy.row || 'N/A'}</td>
                    <td><Badge className={getStatusBadgeClass(copy.status)}>{copy.status}</Badge></td>
                    <td>
                      <Button variant="outline-primary" size="sm" onClick={() => openEditModal(copy)}>
                        Edit Location
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}

      {/* Add Copy Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Copy</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddCopy}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Book *</Form.Label>
              <Form.Select required value={newCopy.bookId} onChange={(e) => setNewCopy({ ...newCopy, bookId: e.target.value })}>
                <option value="">Select a book</option>
                {books.map((book) => (
                  <option key={book.id} value={book.id}>{book.title} - {book.author}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Barcode *</Form.Label>
              <Form.Control type="text" required value={newCopy.barcode} onChange={(e) => setNewCopy({ ...newCopy, barcode: e.target.value })} placeholder="Enter unique barcode" />
            </Form.Group>
            <h6 className="fw-bold">Physical Location</h6>
            <Row>
              <Col md={4}><Form.Group className="mb-3"><Form.Label>Floor</Form.Label><Form.Control value={newCopy.floor} onChange={(e) => setNewCopy({ ...newCopy, floor: e.target.value })} placeholder="e.g., 1" /></Form.Group></Col>
              <Col md={4}><Form.Group className="mb-3"><Form.Label>Section</Form.Label><Form.Control value={newCopy.section} onChange={(e) => setNewCopy({ ...newCopy, section: e.target.value })} placeholder="e.g., A" /></Form.Group></Col>
              <Col md={4}><Form.Group className="mb-3"><Form.Label>Shelf</Form.Label><Form.Control value={newCopy.shelf} onChange={(e) => setNewCopy({ ...newCopy, shelf: e.target.value })} placeholder="e.g., 3" /></Form.Group></Col>
            </Row>
            <Row>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>Rack</Form.Label><Form.Control value={newCopy.rack} onChange={(e) => setNewCopy({ ...newCopy, rack: e.target.value })} placeholder="e.g., B" /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>Row</Form.Label><Form.Control value={newCopy.row} onChange={(e) => setNewCopy({ ...newCopy, row: e.target.value })} placeholder="e.g., 2" /></Form.Group></Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={adding}>{adding ? 'Adding...' : 'Add Copy'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Location Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Location - {selectedCopy?.barcode}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}><Form.Group className="mb-3"><Form.Label>Floor</Form.Label><Form.Control value={editLocation.floor} onChange={(e) => setEditLocation({ ...editLocation, floor: e.target.value })} /></Form.Group></Col>
            <Col md={6}><Form.Group className="mb-3"><Form.Label>Section</Form.Label><Form.Control value={editLocation.section} onChange={(e) => setEditLocation({ ...editLocation, section: e.target.value })} /></Form.Group></Col>
          </Row>
          <Row>
            <Col md={4}><Form.Group className="mb-3"><Form.Label>Shelf</Form.Label><Form.Control value={editLocation.shelf} onChange={(e) => setEditLocation({ ...editLocation, shelf: e.target.value })} /></Form.Group></Col>
            <Col md={4}><Form.Group className="mb-3"><Form.Label>Rack</Form.Label><Form.Control value={editLocation.rack} onChange={(e) => setEditLocation({ ...editLocation, rack: e.target.value })} /></Form.Group></Col>
            <Col md={4}><Form.Group className="mb-3"><Form.Label>Row</Form.Label><Form.Control value={editLocation.row} onChange={(e) => setEditLocation({ ...editLocation, row: e.target.value })} /></Form.Group></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleEditLocation}>Save Location</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CopiesPage;
