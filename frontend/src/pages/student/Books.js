import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { bookService } from '../../services/bookService';
import { BOOK_GENRES } from '../../utils/constants';
import BookCard from '../../components/BookCard';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const StudentBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [genre, setGenre] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const booksPerPage = 12;

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page: currentPage - 1, size: booksPerPage };
      if (searchTerm) params.search = searchTerm;
      if (genre) params.genre = genre;

      const data = await bookService.getAll(params);
      if (Array.isArray(data)) {
        setBooks(data);
        setTotalPages(1);
      } else {
        setBooks(data.content || data.books || []);
        setTotalPages(data.totalPages || Math.ceil((data.totalElements || 0) / booksPerPage) || 1);
      }
    } catch (err) {
      setError('Failed to load books. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, genre]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleGenreChange = (value) => {
    setGenre(value);
    setCurrentPage(1);
  };

  return (
    <Container fluid>
      <h3 className="mb-4 fw-bold">Browse Books</h3>

      {error && <AlertMessage variant="danger" message={error} />}

      <Row className="mb-4">
        <Col md={6}>
          <Form onSubmit={handleSearch}>
            <Form.Control
              type="text"
              placeholder="Search by title, author, ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form>
        </Col>
        <Col md={3}>
          <Form.Select value={genre} onChange={(e) => handleGenreChange(e.target.value)}>
            <option value="">All Genres</option>
            {BOOK_GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {loading ? (
        <LoadingSpinner message="Loading books..." />
      ) : books.length === 0 ? (
        <EmptyState title="No books found" message="Try adjusting your search or filters." />
      ) : (
        <>
          <Row>
            {books.map((book) => (
              <Col md={6} lg={4} xl={3} key={book.id} className="mb-4">
                <BookCard book={book} basePath="/student/books" />
              </Col>
            ))}
          </Row>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </Container>
  );
};

export default StudentBooks;
