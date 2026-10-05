package com.smartlibrary.repository;

import com.smartlibrary.entity.LibrarianNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface LibrarianNotificationRepository extends JpaRepository<LibrarianNotification, Long> {

    List<LibrarianNotification> findAllByOrderByCreatedAtDesc();

    boolean existsByTypeAndBorrowId(LibrarianNotification.Type type, Long borrowId);

    long countByIsReadFalse();

    @Modifying
    @Transactional
    @Query("UPDATE LibrarianNotification n SET n.isRead = true WHERE n.id = :id")
    int markAsRead(@Param("id") Long id);

    @Modifying
    @Transactional
    @Query("UPDATE LibrarianNotification n SET n.isRead = true WHERE n.isRead = false")
    int markAllAsRead();
}
