package com.smartlibrary.controller;

import com.smartlibrary.dto.BookRequest;
import com.smartlibrary.dto.BookResponse;
import com.smartlibrary.service.BookService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
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
        int start = page * size;
        int end = Math.min(start + size, total);
        if (start >= total) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(allBooks.subList(start, end));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookResponse> getBookById(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getBookById(id));
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
