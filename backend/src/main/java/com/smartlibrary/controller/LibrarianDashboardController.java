package com.smartlibrary.controller;

import com.smartlibrary.dto.*;
import com.smartlibrary.service.DashboardChartsService;
import com.smartlibrary.service.LibrarianService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/librarian")
public class LibrarianDashboardController {

    private final LibrarianService librarianService;
    private final DashboardChartsService chartsService;

    public LibrarianDashboardController(LibrarianService librarianService, DashboardChartsService chartsService) {
        this.librarianService = librarianService;
        this.chartsService = chartsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(librarianService.getDashboard());
    }

    @GetMapping("/dashboard/charts")
    public ResponseEntity<DashboardChartsResponse> getDashboardCharts() {
        return ResponseEntity.ok(chartsService.getCharts());
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
