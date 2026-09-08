package com.smartlibrary.controller;

import com.smartlibrary.dto.*;
import com.smartlibrary.service.LibrarianService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/librarian")
public class LibrarianDashboardController {

    private final LibrarianService librarianService;

    public LibrarianDashboardController(LibrarianService librarianService) {
        this.librarianService = librarianService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(librarianService.getDashboard());
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentResponse>> getStudents() {
        return ResponseEntity.ok(librarianService.getAllStudents());
    }

    @GetMapping("/reports")
    public ResponseEntity<ReportsResponse> getReports() {
        return ResponseEntity.ok(librarianService.getReports());
    }
}
