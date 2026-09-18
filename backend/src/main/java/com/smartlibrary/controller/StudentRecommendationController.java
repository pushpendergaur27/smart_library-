package com.smartlibrary.controller;

import com.smartlibrary.dto.RecommendationResponse;
import com.smartlibrary.entity.Student;
import com.smartlibrary.repository.StudentRepository;
import com.smartlibrary.service.RecommendationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/student")
public class StudentRecommendationController {

    private static final Logger log = LoggerFactory.getLogger(StudentRecommendationController.class);
    private final RecommendationService recommendationService;
    private final StudentRepository studentRepository;

    public StudentRecommendationController(RecommendationService recommendationService,
                                           StudentRepository studentRepository) {
        this.recommendationService = recommendationService;
        this.studentRepository = studentRepository;
    }

    private Long getCurrentStudentId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return studentRepository.findByEmail(email).map(Student::getId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<RecommendationResponse>> getRecommendations() {
        try {
            Long studentId = getCurrentStudentId();
            List<RecommendationResponse> result = recommendationService.getRecommendations(studentId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error loading recommendations", e);
            return ResponseEntity.ok(Collections.emptyList());
        }
    }
}
