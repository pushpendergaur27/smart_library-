package com.smartlibrary.controller;

import com.smartlibrary.dto.NotificationResponse;
import com.smartlibrary.entity.Student;
import com.smartlibrary.repository.StudentRepository;
import com.smartlibrary.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class NotificationController {

    private final NotificationService notificationService;
    private final StudentRepository studentRepository;

    public NotificationController(NotificationService notificationService, StudentRepository studentRepository) {
        this.notificationService = notificationService;
        this.studentRepository = studentRepository;
    }

    private Long getCurrentStudentId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return studentRepository.findByEmail(email).map(Student::getId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationResponse>> getNotifications() {
        return ResponseEntity.ok(notificationService.getStudentNotifications(getCurrentStudentId()));
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<Map<String, String>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id, getCurrentStudentId());
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    @PutMapping("/notifications/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead() {
        notificationService.markAllAsRead(getCurrentStudentId());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
