package com.smartlibrary.service;

import com.smartlibrary.dto.ReservationResponse;
import com.smartlibrary.entity.*;
import com.smartlibrary.entity.Reservation.ReservationStatus;
import com.smartlibrary.entity.BookCopy.CopyStatus;
import com.smartlibrary.exception.BadRequestException;
import com.smartlibrary.exception.ResourceNotFoundException;
import com.smartlibrary.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final StudentRepository studentRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final NotificationRepository notificationRepository;

    @Value("${app.reservation.pickup-hours:24}")
    private int pickupHours;

    public ReservationService(ReservationRepository reservationRepository, BookRepository bookRepository,
                              BookCopyRepository bookCopyRepository, StudentRepository studentRepository,
                              BorrowRecordRepository borrowRecordRepository, NotificationRepository notificationRepository) {
        this.reservationRepository = reservationRepository;
        this.bookRepository = bookRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.studentRepository = studentRepository;
        this.borrowRecordRepository = borrowRecordRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public ReservationResponse reserveBook(Long bookId, Long studentId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        reservationRepository.findActiveByStudentAndBook(studentId, bookId)
                .ifPresent(r -> { throw new BadRequestException("You already have an active reservation for this book."); });

        long borrowed = borrowRecordRepository.countActiveBorrowByStudentAndBook(studentId, bookId);
        if (borrowed > 0) {
            throw new BadRequestException("You have already borrowed this book.");
        }

        long availableCopies = bookCopyRepository.countByBookIdAndStatus(bookId, CopyStatus.AVAILABLE);
        if (availableCopies > 0) {
            throw new BadRequestException("Copies are available. Please borrow directly instead of reserving.");
        }

        int queuePosition = reservationRepository.getMaxQueuePositionByBookId(bookId) + 1;

        Reservation reservation = new Reservation();
        reservation.setStudent(student);
        reservation.setBook(book);
        reservation.setReservationDate(LocalDateTime.now());
        reservation.setStatus(ReservationStatus.WAITING);
        reservation.setQueuePosition(queuePosition);
        reservation = reservationRepository.save(reservation);
        return toResponse(reservation);
    }

    @Transactional
    public void processReservationQueue(Long bookId, BookCopy copy) {
        List<Reservation> waitingReservations = reservationRepository.findWaitingByBookId(bookId);
        if (!waitingReservations.isEmpty()) {
            Reservation next = waitingReservations.get(0);
            next.setStatus(ReservationStatus.READY);
            next.setExpiryDate(LocalDateTime.now().plusHours(pickupHours));
            reservationRepository.save(next);

            Notification notification = new Notification();
            notification.setStudent(next.getStudent());
            notification.setMessage("Your reserved book \"" + next.getBook().getTitle() + "\" is ready for pickup! Please collect within " + pickupHours + " hours.");
            notification.setType(Notification.NotificationType.RESERVATION_READY);
            notificationRepository.save(notification);

            copy.setStatus(CopyStatus.RESERVED);
            bookCopyRepository.save(copy);
        }
    }

    @Transactional
    public void processExpiredReservations() {
        List<Reservation> expiredReady = reservationRepository.findExpiredReadyReservations();
        for (Reservation reservation : expiredReady) {
            reservation.setStatus(ReservationStatus.EXPIRED);
            reservationRepository.save(reservation);

            Notification notification = new Notification();
            notification.setStudent(reservation.getStudent());
            notification.setMessage("Your reservation for \"" + reservation.getBook().getTitle() + "\" has expired.");
            notification.setType(Notification.NotificationType.RESERVATION_EXPIRED);
            notificationRepository.save(notification);

            List<BookCopy> copies = bookCopyRepository.findByBookId(reservation.getBook().getId());
            for (BookCopy c : copies) {
                if (c.getStatus() == CopyStatus.RESERVED) {
                    c.setStatus(CopyStatus.AVAILABLE);
                    bookCopyRepository.save(c);
                    processReservationQueue(reservation.getBook().getId(), c);
                    break;
                }
            }
        }
    }

    public List<ReservationResponse> getStudentReservations(Long studentId) {
        return reservationRepository.findAll().stream()
                .filter(r -> r.getStudent().getId().equals(studentId))
                .filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<ReservationResponse> getAllReservations() {
        return reservationRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void cancelReservation(Long reservationId, Long studentId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
        if (!reservation.getStudent().getId().equals(studentId)) {
            throw new BadRequestException("You can only cancel your own reservations.");
        }
        if (reservation.getStatus() != ReservationStatus.WAITING && reservation.getStatus() != ReservationStatus.READY) {
            throw new BadRequestException("Cannot cancel reservation in current status: " + reservation.getStatus());
        }
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
    }

    @Transactional
    public void processReservationById(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
        if (reservation.getStatus() != ReservationStatus.WAITING) {
            throw new BadRequestException("Only WAITING reservations can be processed.");
        }
        reservation.setStatus(ReservationStatus.READY);
        reservation.setExpiryDate(LocalDateTime.now().plusHours(pickupHours));
        reservationRepository.save(reservation);

        Notification notification = new Notification();
        notification.setStudent(reservation.getStudent());
        notification.setMessage("Your reserved book \"" + reservation.getBook().getTitle() + "\" is ready for pickup! Please collect within " + pickupHours + " hours.");
        notification.setType(Notification.NotificationType.RESERVATION_READY);
        notificationRepository.save(notification);
    }

    private ReservationResponse toResponse(Reservation reservation) {
        ReservationResponse response = new ReservationResponse();
        response.setId(reservation.getId());
        response.setBookTitle(reservation.getBook().getTitle());
        response.setBookId(reservation.getBook().getId());
        response.setStudentName(reservation.getStudent().getName());
        response.setStudentId(reservation.getStudent().getId());
        response.setReservationDate(reservation.getReservationDate());
        response.setExpiryDate(reservation.getExpiryDate());
        response.setStatus(reservation.getStatus().name());
        response.setQueuePosition(reservation.getQueuePosition());
        return response;
    }
}
