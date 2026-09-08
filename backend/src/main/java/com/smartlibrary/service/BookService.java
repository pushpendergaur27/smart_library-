package com.smartlibrary.service;

import com.smartlibrary.dto.*;
import com.smartlibrary.entity.Book;
import com.smartlibrary.entity.BookCopy;
import com.smartlibrary.entity.BookCopy.CopyStatus;
import com.smartlibrary.exception.ResourceNotFoundException;
import com.smartlibrary.repository.BookCopyRepository;
import com.smartlibrary.repository.BookRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;

    public BookService(BookRepository bookRepository, BookCopyRepository bookCopyRepository) {
        this.bookRepository = bookRepository;
        this.bookCopyRepository = bookCopyRepository;
    }

    public List<BookResponse> getAllBooks() {
        return bookRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public BookResponse getBookById(Long id) {
        Book book = bookRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        return toResponse(book);
    }

    public List<BookResponse> searchBooks(String query) {
        if (query == null || query.trim().isEmpty()) return getAllBooks();
        return bookRepository.search(query.trim()).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<BookResponse> searchAdvanced(String title, String author, String isbn, String genre) {
        List<Book> results = bookRepository.searchAdvanced(title, author, isbn, genre);
        return results.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public BookResponse createBook(BookRequest request) {
        Book book = new Book();
        book.setIsbn(request.getIsbn());
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setPublisher(request.getPublisher());
        book.setGenre(request.getGenre());
        book.setDescription(request.getDescription());
        book.setCoverImage(request.getCoverImage());
        book.setLanguage(request.getLanguage());
        book.setEdition(request.getEdition());
        book.setPublicationYear(request.getPublicationYear());
        book = bookRepository.save(book);
        return toResponse(book);
    }

    @Transactional
    public BookResponse updateBook(Long id, BookRequest request) {
        Book book = bookRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        book.setIsbn(request.getIsbn());
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setPublisher(request.getPublisher());
        book.setGenre(request.getGenre());
        book.setDescription(request.getDescription());
        book.setCoverImage(request.getCoverImage());
        book.setLanguage(request.getLanguage());
        book.setEdition(request.getEdition());
        book.setPublicationYear(request.getPublicationYear());
        book = bookRepository.save(book);
        return toResponse(book);
    }

    @Transactional
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        bookRepository.delete(book);
    }

    private BookResponse toResponse(Book book) {
        BookResponse response = new BookResponse();
        response.setId(book.getId());
        response.setIsbn(book.getIsbn());
        response.setTitle(book.getTitle());
        response.setAuthor(book.getAuthor());
        response.setPublisher(book.getPublisher());
        response.setGenre(book.getGenre());
        response.setDescription(book.getDescription());
        response.setCoverImage(book.getCoverImage());
        response.setLanguage(book.getLanguage());
        response.setEdition(book.getEdition());
        response.setPublicationYear(book.getPublicationYear());
        response.setCreatedAt(book.getCreatedAt());

        long total = bookCopyRepository.countByBookId(book.getId());
        long available = bookCopyRepository.countByBookIdAndStatus(book.getId(), CopyStatus.AVAILABLE);
        response.setTotalCopies((int) total);
        response.setAvailableCopies((int) available);

        List<CopyResponse> copies = bookCopyRepository.findByBookId(book.getId()).stream()
                .map(this::toCopyResponse).collect(Collectors.toList());
        response.setCopies(copies);
        return response;
    }

    private CopyResponse toCopyResponse(BookCopy copy) {
        CopyResponse response = new CopyResponse();
        response.setId(copy.getId());
        response.setBookId(copy.getBook().getId());
        response.setBookTitle(copy.getBook().getTitle());
        response.setLibraryBarcode(copy.getLibraryBarcode());
        response.setFloor(copy.getFloor());
        response.setSection(copy.getSection());
        response.setShelf(copy.getShelf());
        response.setRack(copy.getRack());
        response.setRowNumber(copy.getRowNumber());
        response.setStatus(copy.getStatus().name());
        return response;
    }
}
