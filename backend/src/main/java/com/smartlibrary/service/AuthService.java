package com.smartlibrary.service;

import com.smartlibrary.dto.*;
import com.smartlibrary.entity.Student;
import com.smartlibrary.entity.Student.Role;
import com.smartlibrary.exception.ConflictException;
import com.smartlibrary.repository.StudentRepository;
import com.smartlibrary.repository.LibrarianRepository;
import com.smartlibrary.entity.Librarian;
import com.smartlibrary.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final StudentRepository studentRepository;
    private final LibrarianRepository librarianRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(StudentRepository studentRepository, LibrarianRepository librarianRepository,
                       PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.studentRepository = studentRepository;
        this.librarianRepository = librarianRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse register(RegisterRequest request) {
        if (studentRepository.existsByEmail(request.getEmail()) ||
            librarianRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered");
        }

        String role = request.getRole() != null ? request.getRole().toUpperCase() : "STUDENT";

        if ("LIBRARIAN".equals(role)) {
            Librarian librarian = new Librarian();
            librarian.setName(request.getName());
            librarian.setEmail(request.getEmail());
            librarian.setPassword(passwordEncoder.encode(request.getPassword()));
            librarian.setPhone(request.getPhone());
            librarian.setRole(Role.LIBRARIAN);
            librarianRepository.save(librarian);
            return new AuthResponse(null, "LIBRARIAN", librarian.getName(), librarian.getEmail(), librarian.getId());
        } else {
            Student student = new Student();
            student.setName(request.getName());
            student.setEmail(request.getEmail());
            student.setPassword(passwordEncoder.encode(request.getPassword()));
            student.setPhone(request.getPhone());
            student.setCourse(request.getCourse());
            student.setYear(request.getYear());
            student.setRole(Role.STUDENT);
            studentRepository.save(student);
            return new AuthResponse(null, "STUDENT", student.getName(), student.getEmail(), student.getId());
        }
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication);

        Student student = studentRepository.findByEmail(request.getEmail()).orElse(null);
        if (student != null) {
            return new AuthResponse(token, student.getRole().name(), student.getName(), student.getEmail(), student.getId());
        }

        Librarian librarian = librarianRepository.findByEmail(request.getEmail()).orElse(null);
        if (librarian != null) {
            return new AuthResponse(token, librarian.getRole().name(), librarian.getName(), librarian.getEmail(), librarian.getId());
        }

        throw new ConflictException("User not found");
    }
}
