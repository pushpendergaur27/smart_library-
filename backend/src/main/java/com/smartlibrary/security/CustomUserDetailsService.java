package com.smartlibrary.security;

import com.smartlibrary.entity.Student;
import com.smartlibrary.entity.Librarian;
import com.smartlibrary.repository.StudentRepository;
import com.smartlibrary.repository.LibrarianRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final StudentRepository studentRepository;
    private final LibrarianRepository librarianRepository;

    public CustomUserDetailsService(StudentRepository studentRepository, LibrarianRepository librarianRepository) {
        this.studentRepository = studentRepository;
        this.librarianRepository = librarianRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return studentRepository.findByEmail(email)
                .map(student -> new User(
                        student.getEmail(),
                        student.getPassword(),
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + student.getRole().name()))
                ))
                .orElseGet(() -> librarianRepository.findByEmail(email)
                        .map(librarian -> new User(
                                librarian.getEmail(),
                                librarian.getPassword(),
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + librarian.getRole().name()))
                        ))
                        .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email))
                );
    }
}
