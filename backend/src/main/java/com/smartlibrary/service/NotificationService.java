package com.smartlibrary.service;

import com.smartlibrary.dto.NotificationResponse;
import com.smartlibrary.entity.Notification;
import com.smartlibrary.exception.ResourceNotFoundException;
import com.smartlibrary.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<NotificationResponse> getStudentNotifications(Long studentId) {
        return notificationRepository.findByStudentIdOrderByCreatedAtDesc(studentId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long notificationId, Long studentId) {
        int updated = notificationRepository.markAsRead(notificationId, studentId);
        if (updated == 0) throw new ResourceNotFoundException("Notification not found");
    }

    @Transactional
    public void markAllAsRead(Long studentId) {
        notificationRepository.markAllAsRead(studentId);
    }

    private NotificationResponse toResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setMessage(notification.getMessage());
        response.setType(notification.getType().name());
        response.setRead(notification.isRead());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }
}
