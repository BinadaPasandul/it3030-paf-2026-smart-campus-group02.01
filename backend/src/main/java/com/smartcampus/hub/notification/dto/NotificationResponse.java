package com.smartcampus.hub.notification.dto;

import com.smartcampus.hub.notification.entity.NotificationCategory;
import com.smartcampus.hub.notification.entity.NotificationType;

import java.time.LocalDateTime;

/**
 * Read-only DTO returned by every notification endpoint.
 *
 * <p>The {@code referenceId} + {@code referenceType} pair lets the frontend
 * build a deep-link: e.g., referenceType="BOOKING" + referenceId=42 →
 * navigate to {@code /bookings/42}.
 */
public class NotificationResponse {

    private Long id;
    private String message;
    private NotificationType type;
    private NotificationCategory category;
    private boolean isRead;
    private String priority;
    private Long referenceId;
    private String referenceType;
    private LocalDateTime createdAt;

    // ── Constructors ───────────────────────────────────────────────────────

    public NotificationResponse() {
    }

    public NotificationResponse(Long id,
                                String message,
                                NotificationType type,
                                NotificationCategory category,
                                boolean isRead,
                                String priority,
                                Long referenceId,
                                String referenceType,
                                LocalDateTime createdAt) {
        this.id            = id;
        this.message       = message;
        this.type          = type;
        this.category      = category;
        this.isRead        = isRead;
        this.priority      = priority;
        this.referenceId   = referenceId;
        this.referenceType = referenceType;
        this.createdAt     = createdAt;
    }

    // ── Getters & Setters ──────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public NotificationCategory getCategory() { return category; }
    public void setCategory(NotificationCategory category) { this.category = category; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }

    public String getReferenceType() { return referenceType; }
    public void setReferenceType(String referenceType) { this.referenceType = referenceType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
