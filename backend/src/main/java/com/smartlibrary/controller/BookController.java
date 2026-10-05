package com.smartlibrary.controller;

import com.smartlibrary.dto.BookRequest;
import com.smartlibrary.dto.BookResponse;
import com.smartlibrary.dto.BookReviewsResponse;
import com.smartlibrary.service.BookReviewService;
import com.smartlibrary.service.BookService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;
    private final BookReviewService reviewService;

    public BookController(BookService bookService, BookReviewService reviewService) {
        this.bookService = bookService;
        this.reviewService = reviewService;
    }

    @GetMapping
    public ResponseEntity<?> getAllBooks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String genre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        List<BookResponse> allBooks;
        if (search != null && !search.trim().isEmpty()) {
            allBooks = bookService.searchBooks(search.trim());
        } else if (genre != null && !genre.trim().isEmpty()) {
            allBooks = bookService.searchAdvanced(null, null, null, genre.trim());
        } else {
            allBooks = bookService.getAllBooks();
        }

        int total = allBooks.size();
        int safeSize = Math.max(1, size);
        int start = Math.max(0, page) * safeSize;
        List<BookResponse> content = start >= total
                ? List.of()
                : allBooks.subList(start, Math.min(start + safeSize, total));
        int totalPages = Math.max(1, (int) Math.ceil(total / (double) safeSize));
        return ResponseEntity.ok(Map.of(
                "content", content,
                "totalElements", total,
                "totalPages", totalPages,
                "number", Math.max(0, page),
                "size", safeSize));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookResponse> getBookById(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getBookById(id));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<BookReviewsResponse> getBookReviews(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getBookReviews(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<BookResponse>> searchBooks(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String isbn,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String q) {
        if (q != null && !q.trim().isEmpty()) {
            return ResponseEntity.ok(bookService.searchBooks(q));
        }
        if (title != null || author != null || isbn != null || genre != null) {
            return ResponseEntity.ok(bookService.searchAdvanced(title, author, isbn, genre));
        }
        return ResponseEntity.ok(bookService.getAllBooks());
    }
}
