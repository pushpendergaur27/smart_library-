package com.smartlibrary.controller;

import com.smartlibrary.dto.BorrowRecordResponse;
import com.smartlibrary.dto.ReservationResponse;
import com.smartlibrary.dto.ReturnRequest;
import com.smartlibrary.entity.BookCopy;
import com.smartlibrary.repository.BookCopyRepository;
import com.smartlibrary.service.BorrowService;
import com.smartlibrary.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/librarian")
public class LibrarianReturnController {

    private final BorrowService borrowService;
    private final ReservationService reservationService;
    private final BookCopyRepository bookCopyRepository;

    public LibrarianReturnController(BorrowService borrowService, ReservationService reservationService,
                                     BookCopyRepository bookCopyRepository) {
        this.borrowService = borrowService;
        this.reservationService = reservationService;
        this.bookCopyRepository = bookCopyRepository;
    }

    @PostMapping("/return")
    public ResponseEntity<Map<String, Object>> returnBook(@Valid @RequestBody ReturnRequest request) {
        BorrowRecordResponse record = borrowService.returnBook(request.getBarcode(), null);
        BookCopy copy = bookCopyRepository.findByLibraryBarcodeWithBook(request.getBarcode()).orElse(null);
        if (copy != null) {
            reservationService.processReservationQueue(copy.getBook().getId(), copy);
        }
        return ResponseEntity.ok(Map.of("message", "Book returned successfully", "record", record));
    }

    @GetMapping("/reservations")
    public ResponseEntity<List<ReservationResponse>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }
}
