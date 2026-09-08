package com.smartlibrary.repository;

import com.smartlibrary.entity.Librarian;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LibrarianRepository extends JpaRepository<Librarian, Long> {
    Optional<Librarian> findByEmail(String email);
    boolean existsByEmail(String email);
}
