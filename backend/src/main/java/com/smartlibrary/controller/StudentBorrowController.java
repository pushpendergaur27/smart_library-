package com.smartlibrary.controller;

import com.smartlibrary.dto.BorrowRecordResponse;
import com.smartlibrary.dto.BorrowRequest;
import com.smartlibrary.entity.BookCopy;
import com.smartlibrary.entity.Student;
import com.smartlibrary.repository.BookCopyRepository;
import com.smartlibrary.repository.StudentRepository;
import com.smartlibrary.service.BorrowService;
import com.smartlibrary.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentBorrowController {

    private final BorrowService borrowService;
    private final ReservationService reservationService;
    private final StudentRepository studentRepository;
    private final BookCopyRepository bookCopyRepository;

    public StudentBorrowController(BorrowService borrowService, ReservationService reservationService,
                                   StudentRepository studentRepository, BookCopyRepository bookCopyRepository) {
        this.borrowService = borrowService;
        this.reservationService = reservationService;
        this.studentRepository = studentRepository;
        this.bookCopyRepository = bookCopyRepository;
    }

    private Long getCurrentStudentId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return studentRepository.findByEmail(email).map(Student::getId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    @PostMapping("/borrow")
    public ResponseEntity<Map<String, Object>> borrowBook(@Valid @RequestBody BorrowRequest request) {
        Long studentId = getCurrentStudentId();
        BorrowRecordResponse record = borrowService.borrowBook(request.getBarcode(), studentId);
        BookCopy copy = bookCopyRepository.findByLibraryBarcode(request.getBarcode()).orElse(null);
        if (copy != null) {
            reservationService.processReservationQueue(copy.getBook().getId(), copy);
        }
        return ResponseEntity.ok(Map.of("message", "Book borrowed successfully", "record", record));
    }

    @GetMapping("/borrowed-books")
    public ResponseEntity<List<BorrowRecordResponse>> getBorrowedBooks() {
        return ResponseEntity.ok(borrowService.getStudentBorrowedBooks(getCurrentStudentId()));
    }

    @GetMapping("/borrow-history")
    public ResponseEntity<List<BorrowRecordResponse>> getBorrowHistory() {
        return ResponseEntity.ok(borrowService.getStudentBorrowHistory(getCurrentStudentId()));
    }
}
