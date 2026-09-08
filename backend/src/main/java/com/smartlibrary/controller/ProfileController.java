package com.smartlibrary.controller;

import com.smartlibrary.dto.ProfileUpdateRequest;
import com.smartlibrary.entity.Student;
import com.smartlibrary.entity.Librarian;
import com.smartlibrary.repository.StudentRepository;
import com.smartlibrary.repository.LibrarianRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class ProfileController {

    private final StudentRepository studentRepository;
    private final LibrarianRepository librarianRepository;

    public ProfileController(StudentRepository studentRepository, LibrarianRepository librarianRepository) {
        this.studentRepository = studentRepository;
        this.librarianRepository = librarianRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        return studentRepository.findByEmail(email)
                .map(student -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", student.getId());
                    response.put("name", student.getName());
                    response.put("email", student.getEmail());
                    response.put("phone", student.getPhone());
                    response.put("course", student.getCourse());
                    response.put("year", student.getYear());
                    response.put("role", student.getRole().name());
                    return ResponseEntity.ok((Object) response);
                })
                .orElseGet(() -> librarianRepository.findByEmail(email)
                        .map(librarian -> {
                            Map<String, Object> response = new HashMap<>();
                            response.put("id", librarian.getId());
                            response.put("name", librarian.getName());
                            response.put("email", librarian.getEmail());
                            response.put("phone", librarian.getPhone());
                            response.put("role", librarian.getRole().name());
                            return ResponseEntity.ok((Object) response);
                        })
                        .orElse(ResponseEntity.notFound().build()));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody ProfileUpdateRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        return studentRepository.findByEmail(email)
                .map(student -> {
                    if (request.getName() != null) student.setName(request.getName());
                    if (request.getPhone() != null) student.setPhone(request.getPhone());
                    if (request.getCourse() != null) student.setCourse(request.getCourse());
                    if (request.getYear() != null) student.setYear(request.getYear());
                    studentRepository.save(student);
                    return ResponseEntity.ok((Object) Map.of(
                            "id", student.getId(), "name", student.getName(),
                            "email", student.getEmail(), "role", student.getRole().name()
                    ));
                })
                .orElseGet(() -> librarianRepository.findByEmail(email)
                        .map(librarian -> {
                            if (request.getName() != null) librarian.setName(request.getName());
                            if (request.getPhone() != null) librarian.setPhone(request.getPhone());
                            librarianRepository.save(librarian);
                            return ResponseEntity.ok((Object) Map.of(
                                    "id", librarian.getId(), "name", librarian.getName(),
                                    "email", librarian.getEmail(), "role", librarian.getRole().name()
                            ));
                        })
                        .orElse(ResponseEntity.notFound().build()));
    }
}
