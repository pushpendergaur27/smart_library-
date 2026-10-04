package com.smartlibrary.service;

import com.smartlibrary.dto.BookReviewRequest;
import com.smartlibrary.dto.BookReviewResponse;
import com.smartlibrary.dto.BookReviewsResponse;
import com.smartlibrary.entity.Book;
import com.smartlibrary.entity.BookReview;
import com.smartlibrary.entity.Student;
import com.smartlibrary.exception.ResourceNotFoundException;
import com.smartlibrary.repository.BookRepository;
import com.smartlibrary.repository.BookReviewRepository;
import com.smartlibrary.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookReviewService {

    private final BookReviewRepository reviewRepository;
    private final BookRepository bookRepository;
    private final StudentRepository studentRepository;

    public BookReviewService(BookReviewRepository reviewRepository, BookRepository bookRepository,
                             StudentRepository studentRepository) {
        this.reviewRepository = reviewRepository;
        this.bookRepository = bookRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional
    public BookReviewResponse submitReview(Long bookId, Long studentId, BookReviewRequest request) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        BookReview review = reviewRepository.findByBookIdAndStudentId(bookId, studentId)
                .orElseGet(BookReview::new);
        review.setBook(book);
        review.setStudent(student);
        review.setRating(request.getRating());
        review.setComment(request.getComment() == null ? null : request.getComment().trim());
        review = reviewRepository.save(review);
        return toResponse(review);
    }

    @Transactional(readOnly = true)
    public BookReviewsResponse getBookReviews(Long bookId) {
        BookReviewsResponse response = new BookReviewsResponse();
        response.setAverageRating(reviewRepository.findAverageRatingByBookId(bookId));
        response.setReviewCount(reviewRepository.countByBookId(bookId));
        response.setReviews(reviewRepository.findByBookIdWithStudent(bookId).stream()
                .map(this::toResponse).collect(Collectors.toList()));
        return response;
    }

    private BookReviewResponse toResponse(BookReview review) {
        BookReviewResponse response = new BookReviewResponse();
        response.setId(review.getId());
        response.setBookId(review.getBook().getId());
        response.setStudentId(review.getStudent().getId());
        response.setStudentName(review.getStudent().getName());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setCreatedAt(review.getCreatedAt());
        return response;
    }
}
