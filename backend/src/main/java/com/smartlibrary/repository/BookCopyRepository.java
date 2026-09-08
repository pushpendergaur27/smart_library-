package com.smartlibrary.repository;

import com.smartlibrary.entity.BookCopy;
import com.smartlibrary.entity.BookCopy.CopyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface BookCopyRepository extends JpaRepository<BookCopy, Long> {
    Optional<BookCopy> findByLibraryBarcode(String libraryBarcode);
    boolean existsByLibraryBarcode(String libraryBarcode);

    List<BookCopy> findByBookId(Long bookId);

    @Query("SELECT COUNT(c) FROM BookCopy c WHERE c.book.id = :bookId AND c.status = :status")
    long countByBookIdAndStatus(@Param("bookId") Long bookId, @Param("status") CopyStatus status);

    @Query("SELECT COUNT(c) FROM BookCopy c WHERE c.book.id = :bookId")
    long countByBookId(@Param("bookId") Long bookId);
}
