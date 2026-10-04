package com.smartlibrary.repository;

import com.smartlibrary.entity.BookReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookReviewRepository extends JpaRepository<BookReview, Long> {

    @Query("SELECT r FROM BookReview r JOIN FETCH r.student WHERE r.book.id = :bookId ORDER BY r.createdAt DESC")
    List<BookReview> findByBookIdWithStudent(@Param("bookId") Long bookId);

    Optional<BookReview> findByBookIdAndStudentId(Long bookId, Long studentId);

    @Query("SELECT AVG(r.rating) FROM BookReview r WHERE r.book.id = :bookId")
    Double findAverageRatingByBookId(@Param("bookId") Long bookId);

    long countByBookId(Long bookId);

    @Query("SELECT r FROM BookReview r JOIN FETCH r.book b JOIN FETCH r.student s")
    List<BookReview> findAllWithBookAndStudent();
}
