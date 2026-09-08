package com.smartlibrary.controller;

import com.smartlibrary.dto.*;
import com.smartlibrary.service.BookService;
import com.smartlibrary.service.CopyService;
import com.smartlibrary.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/librarian")
public class LibrarianController {

    private final BookService bookService;
    private final CopyService copyService;
    private final ReservationService reservationService;

    public LibrarianController(BookService bookService, CopyService copyService, ReservationService reservationService) {
        this.bookService = bookService;
        this.copyService = copyService;
        this.reservationService = reservationService;
    }

    @PostMapping("/books")
    public ResponseEntity<BookResponse> createBook(@Valid @RequestBody BookRequest request) {
        return ResponseEntity.ok(bookService.createBook(request));
    }

    @PutMapping("/books/{id}")
    public ResponseEntity<BookResponse> updateBook(@PathVariable Long id, @Valid @RequestBody BookRequest request) {
        return ResponseEntity.ok(bookService.updateBook(id, request));
    }

    @DeleteMapping("/books/{id}")
    public ResponseEntity<Map<String, String>> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok(Map.of("message", "Book deleted successfully"));
    }

    @PostMapping("/copies")
    public ResponseEntity<CopyResponse> createCopy(@Valid @RequestBody CopyRequest request) {
        return ResponseEntity.ok(copyService.createCopy(request));
    }

    @PutMapping("/copies/{id}")
    public ResponseEntity<CopyResponse> updateCopy(@PathVariable Long id, @Valid @RequestBody CopyRequest request) {
        return ResponseEntity.ok(copyService.updateCopy(id, request));
    }

    @PatchMapping("/copies/{id}/status")
    public ResponseEntity<CopyResponse> updateCopyStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(copyService.updateCopyStatus(id, status));
    }

    @PutMapping("/copies/{id}/location")
    public ResponseEntity<CopyResponse> updateCopyLocation(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(copyService.updateCopyLocation(id, body));
    }

    @PutMapping("/reservations/{id}/process")
    public ResponseEntity<Map<String, String>> processReservation(@PathVariable Long id) {
        reservationService.processReservationById(id);
        return ResponseEntity.ok(Map.of("message", "Reservation processed successfully"));
    }
}
