package com.smartcampus.hub.notification.entity;

import com.smartcampus.hub.user.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Persistent notification record stored in the {@code notifications} table.
 *
 * <p>Every notification is owned by exactly one {@link User} and carries:
 * <ul>
 *   <li>A {@link NotificationType} (granular event) and a {@link NotificationCategory}
 *       (coarse UI grouping used for filtering)</li>
 *   <li>An optional {@code referenceId} + {@code referenceType} so the frontend can
 *       deep-link to the exact booking or ticket that caused the notification</li>
 *   <li>A simple {@code priority} string: LOW / NORMAL / HIGH</li>
 * </ul>
 *
 * <p><strong>Integration note for Module B / C:</strong><br>
 * Do NOT create this entity directly — always go through
 * {@code NotificationService.sendNotification()}.
 */
@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notification_user_id",   columnList = "user_id"),
        @Index(name = "idx_notification_is_read",   columnList = "is_read"),
        @Index(name = "idx_notification_created_at", columnList = "created_at")
})
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The user who receives this notification. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 60)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationCategory category;

    /** The human-readable text shown in the UI (max 512 chars). */
    @Column(nullable = false, length = 512)
    private String message;

    /** False by default; flipped to true by the mark-as-read endpoints. */
    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    /** Controls visual emphasis in the frontend: LOW / NORMAL / HIGH */
    @Column(length = 10)
    private String priority = "NORMAL";

    /**
     * Optional FK to the triggering entity (booking id, ticket id, …).
     * Allows the frontend to navigate to the relevant page on click.
     */
    @Column(name = "reference_id")
    private Long referenceId;

    /**
     * Discriminator for {@link #referenceId}: e.g. {@code "BOOKING"}, {@code "TICKET"}.
     */
    @Column(name = "reference_type", length = 30)
    private String referenceType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ── Lifecycle ──────────────────────────────────────────────────────────

    @PrePersist
    protected void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // ── Constructors ───────────────────────────────────────────────────────

    public Notification() {
    }

    /**
     * Convenience constructor used by {@code NotificationServiceImpl}.
     */
    public Notification(User user,
                        NotificationType type,
                        NotificationCategory category,
                        String message,
                        String priority,
                        Long referenceId,
                        String referenceType) {
        this.user          = user;
        this.type          = type;
        this.category      = category;
        this.message       = message;
        this.priority      = (priority != null) ? priority : "NORMAL";
        this.referenceId   = referenceId;
        this.referenceType = referenceType;
    }

    // ── Getters & Setters ──────────────────────────────────────────────────

    public Long getId() { return id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public NotificationCategory getCategory() { return category; }
    public void setCategory(NotificationCategory category) { this.category = category; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }

    public String getReferenceType() { return referenceType; }
    public void setReferenceType(String referenceType) { this.referenceType = referenceType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
