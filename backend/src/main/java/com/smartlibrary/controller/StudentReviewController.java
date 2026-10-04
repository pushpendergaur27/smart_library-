package com.smartlibrary.controller;

import com.smartlibrary.dto.BookReviewRequest;
import com.smartlibrary.dto.BookReviewResponse;
import com.smartlibrary.entity.Student;
import com.smartlibrary.repository.StudentRepository;
import com.smartlibrary.service.BookReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student")
public class StudentReviewController {

    private final BookReviewService reviewService;
    private final StudentRepository studentRepository;

    public StudentReviewController(BookReviewService reviewService, StudentRepository studentRepository) {
        this.reviewService = reviewService;
        this.studentRepository = studentRepository;
    }

    private Long getCurrentStudentId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return studentRepository.findByEmail(email).map(Student::getId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    @PostMapping("/books/{bookId}/reviews")
    public ResponseEntity<BookReviewResponse> submitReview(
            @PathVariable Long bookId,
            @Valid @RequestBody BookReviewRequest request) {
        return ResponseEntity.ok(reviewService.submitReview(bookId, getCurrentStudentId(), request));
    }
}
