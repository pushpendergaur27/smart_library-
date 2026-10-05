package com.smartlibrary.service;

import com.smartlibrary.dto.NotificationResponse;
import com.smartlibrary.entity.LibrarianNotification;
import com.smartlibrary.entity.LibrarianNotification.Type;
import com.smartlibrary.entity.BorrowRecord;
import com.smartlibrary.exception.ResourceNotFoundException;
import com.smartlibrary.repository.LibrarianNotificationRepository;
import com.smartlibrary.repository.BorrowRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LibrarianNotificationService {

    private static final Logger log = LoggerFactory.getLogger(LibrarianNotificationService.class);

    private final LibrarianNotificationRepository notificationRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    @Value("${app.fine.per-day:5}")
    private double finePerDay;

    public LibrarianNotificationService(LibrarianNotificationRepository notificationRepository,
                                        BorrowRecordRepository borrowRecordRepository) {
        this.notificationRepository = notificationRepository;
        this.borrowRecordRepository = borrowRecordRepository;
    }

    @Transactional
    public void notifyStudentBorrowed(String studentName, String bookTitle, int copies,
                                      LocalDate dueDate, Long borrowId) {
        LibrarianNotification notification = new LibrarianNotification();
        notification.setType(Type.STUDENT_BORROWED);
        notification.setBorrowId(borrowId);
        notification.setMessage(studentName + " borrowed \"" + bookTitle + "\""
                + (copies > 1 ? " (" + copies + " copies)" : "")
                + ". Due: " + dueDate);
        notificationRepository.save(notification);
    }

    @Scheduled(fixedDelayString = "${app.notification.overdue-check-ms:900000}",
            initialDelayString = "${app.notification.overdue-initial-delay-ms:90000}")
    public void checkOverdueBorrows() {
        try {
            List<BorrowRecord> overdue = borrowRecordRepository.findOverdueBorrowsWithDetails();
            LocalDate today = LocalDate.now();
            for (BorrowRecord record : overdue) {
                if (notificationRepository.existsByTypeAndBorrowId(Type.BOOK_OVERDUE, record.getId())) {
                    continue;
                }
                long days = Math.max(1, ChronoUnit.DAYS.between(record.getDueDate().toLocalDate(), today));
                double fine = days * finePerDay;

                LibrarianNotification notification = new LibrarianNotification();
                notification.setType(Type.BOOK_OVERDUE);
                notification.setBorrowId(record.getId());
                notification.setMessage("OVERDUE: " + record.getStudent().getName()
                        + " has not returned \"" + record.getCopy().getBook().getTitle()
                        + "\" (copy " + record.getCopy().getLibraryBarcode()
                        + ") - " + days + " day(s) past due. Fine: " + formatFine(fine));
                notificationRepository.save(notification);
            }
        } catch (Exception e) {
            log.error("Overdue notification check failed", e);
        }
    }

    public List<NotificationResponse> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public long getUnreadCount() {
        return notificationRepository.countByIsReadFalse();
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        int updated = notificationRepository.markAsRead(notificationId);
        if (updated == 0) throw new ResourceNotFoundException("Notification not found");
    }

    @Transactional
    public void markAllAsRead() {
        notificationRepository.markAllAsRead();
    }

    private String formatFine(double fine) {
        return "Rs. " + (fine == Math.floor(fine) ? String.valueOf((long) fine) : String.format("%.2f", fine));
    }

    private NotificationResponse toResponse(LibrarianNotification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setMessage(notification.getMessage());
        response.setType(notification.getType().name());
        response.setRead(notification.isRead());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }
}
