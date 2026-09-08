package com.smartlibrary.repository;

import com.smartlibrary.entity.Reservation;
import com.smartlibrary.entity.Reservation.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("SELECT r FROM Reservation r WHERE r.student.id = :studentId AND r.status IN ('WAITING', 'READY')")
    List<Reservation> findActiveByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT r FROM Reservation r WHERE r.book.id = :bookId AND r.status = 'WAITING' ORDER BY r.queuePosition ASC")
    List<Reservation> findWaitingByBookId(@Param("bookId") Long bookId);

    @Query("SELECT r FROM Reservation r WHERE r.student.id = :studentId AND r.book.id = :bookId AND r.status IN ('WAITING', 'READY')")
    Optional<Reservation> findActiveByStudentAndBook(@Param("studentId") Long studentId, @Param("bookId") Long bookId);

    @Query("SELECT r FROM Reservation r WHERE r.status = 'WAITING' ORDER BY r.reservationDate ASC")
    List<Reservation> findAllWaiting();

    @Query("SELECT COALESCE(MAX(r.queuePosition), 0) FROM Reservation r WHERE r.book.id = :bookId AND r.status = 'WAITING'")
    int getMaxQueuePositionByBookId(@Param("bookId") Long bookId);

    @Query("SELECT r FROM Reservation r WHERE r.status = 'READY' AND r.expiryDate < CURRENT_TIMESTAMP")
    List<Reservation> findExpiredReadyReservations();

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.status IN ('WAITING', 'READY')")
    long countPending();
}
