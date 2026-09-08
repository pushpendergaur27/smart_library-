package com.smartlibrary.repository;

import com.smartlibrary.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :id AND n.student.id = :studentId")
    int markAsRead(@Param("id") Long id, @Param("studentId") Long studentId);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.student.id = :studentId AND n.isRead = false")
    int markAllAsRead(@Param("studentId") Long studentId);

    long countByStudentIdAndIsReadFalse(Long studentId);
}
