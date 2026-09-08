package com.smartlibrary.controller;

import com.smartlibrary.dto.ReservationRequest;
import com.smartlibrary.dto.ReservationResponse;
import com.smartlibrary.entity.Student;
import com.smartlibrary.repository.StudentRepository;
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
public class StudentReservationController {

    private final ReservationService reservationService;
    private final StudentRepository studentRepository;

    public StudentReservationController(ReservationService reservationService, StudentRepository studentRepository) {
        this.reservationService = reservationService;
        this.studentRepository = studentRepository;
    }

    private Long getCurrentStudentId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return studentRepository.findByEmail(email).map(Student::getId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    @PostMapping("/reservations")
    public ResponseEntity<Map<String, Object>> reserveBook(@Valid @RequestBody ReservationRequest request) {
        ReservationResponse reservation = reservationService.reserveBook(request.getBookId(), getCurrentStudentId());
        return ResponseEntity.ok(Map.of("message", "Book reserved successfully", "reservation", reservation));
    }

    @GetMapping("/reservations")
    public ResponseEntity<List<ReservationResponse>> getMyReservations() {
        return ResponseEntity.ok(reservationService.getStudentReservations(getCurrentStudentId()));
    }

    @DeleteMapping("/reservations/{id}")
    public ResponseEntity<Map<String, String>> cancelReservation(@PathVariable Long id) {
        reservationService.cancelReservation(id, getCurrentStudentId());
        return ResponseEntity.ok(Map.of("message", "Reservation cancelled successfully"));
    }
}
