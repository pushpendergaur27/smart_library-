import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Button, Form } from 'react-bootstrap';
import { bookService } from '../../services/bookService';
import { BOOK_GENRES } from '../../utils/constants';
import BookTable from '../../components/BookTable';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import ConfirmationDialog from '../../components/ConfirmationDialog';

const LibrarianBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [genre, setGenre] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteBook, setDeleteBook] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const booksPerPage = 10;

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
      setError('Failed to load books.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, genre]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleDelete = async () => {
    if (!deleteBook) return;
    setDeleting(true);
    try {
      await bookService.delete(deleteBook.id);
      setBooks((prev) => prev.filter((b) => b.id !== deleteBook.id));
      setDeleteBook(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete book.');
      setDeleteBook(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Manage Books</h3>
        <Link to="/librarian/books/add" className="btn btn-primary">
          + Add New Book
        </Link>
      </div>

      {error && <AlertMessage variant="danger" message={error} />}

      <div className="mb-3">
        <Form onSubmit={(e) => { e.preventDefault(); setCurrentPage(1); }}>
          <div className="d-flex gap-2">
            <Form.Control
              type="text"
              placeholder="Search by title, author, ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Form.Select
              style={{ width: 'auto', minWidth: '150px' }}
              value={genre}
              onChange={(e) => { setGenre(e.target.value); setCurrentPage(1); }}
            >
              <option value="">All Genres</option>
              {BOOK_GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </Form.Select>
            <Button type="submit" variant="primary">Search</Button>
          </div>
        </Form>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading books..." />
      ) : books.length === 0 ? (
        <EmptyState
          title="No books found"
          message="Start by adding your first book."
          action={
            <Link to="/librarian/books/add" className="btn btn-primary">
              Add Book
            </Link>
          }
        />
      ) : (
        <>
          <BookTable
            books={books}
            basePath="/librarian/books"
            showActions
            onEdit={(book) => navigate(`/librarian/books/${book.id}/edit`)}
            onDelete={(book) => setDeleteBook(book)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      <ConfirmationDialog
        show={!!deleteBook}
        onHide={() => setDeleteBook(null)}
        onConfirm={handleDelete}
        title="Delete Book"
        message={`Are you sure you want to delete "${deleteBook?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleting}
      />
    </Container>
  );
};

export default LibrarianBooks;
