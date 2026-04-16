package com.smartcampus.hub.notification.service;

import com.smartcampus.hub.notification.dto.NotificationResponse;
import com.smartcampus.hub.notification.entity.NotificationCategory;
import com.smartcampus.hub.notification.entity.NotificationType;

import java.util.List;

/**
 * Public contract for the Notification module.
 *
 * <h2>Cross-module integration (Module B &amp; C)</h2>
 * <p>Inject this interface (not the impl) and call
 * {@link #sendNotification(Long, String, NotificationType, Long, String)}.
 * Everything else is handled internally.
 *
 * <pre>
 * // Example — inside BookingService (Module B):
 * notificationService.sendNotification(
 *     booking.getUserId(),
 *     "✅ Your booking for " + resource.getName() + " has been approved.",
 *     NotificationType.BOOKING_APPROVED,
 *     booking.getId(),
 *     "BOOKING"
 * );
 * </pre>
 */
public interface NotificationService {

    // ── Core send method (called by ALL modules) ───────────────────────────

    /**
     * Creates and persists a new notification for the given user.
     * Priority defaults to NORMAL.
     *
     * @param userId        ID of the recipient user
     * @param message       Human-readable text shown in the UI (max 512 chars)
     * @param type          Specific notification event type
     * @param referenceId   Optional ID of the related entity (booking / ticket)
     * @param referenceType Optional entity type name: "BOOKING" or "TICKET"
     */
    void sendNotification(Long userId,
                          String message,
                          NotificationType type,
                          Long referenceId,
                          String referenceType);

    /**
     * Like {@link #sendNotification} but lets the caller override priority.
     *
     * @param priority LOW / NORMAL / HIGH
     */
    void sendNotificationWithPriority(Long userId,
                                      String message,
                                      NotificationType type,
                                      Long referenceId,
                                      String referenceType,
                                      String priority);

    // ── Retrieval ──────────────────────────────────────────────────────────

    List<NotificationResponse> getNotificationsForUser(Long userId);

    List<NotificationResponse> getUnreadNotifications(Long userId);

    long getUnreadCount(Long userId);

    List<NotificationResponse> getNotificationsByCategory(Long userId, NotificationCategory category);

    // ── User actions ───────────────────────────────────────────────────────

    NotificationResponse markAsRead(Long notificationId, Long userId);

    void markAllAsRead(Long userId);

    void deleteNotification(Long notificationId, Long userId);

    // ── Special senders (called by this module's own hooks / admin) ────────

    /** Sent once when a new user account is created (first OAuth login). */
    void sendWelcomeNotification(Long userId, String userName);

    /** Sent when an admin changes a user's role. */
    void sendRoleChangedNotification(Long userId, String oldRole, String newRole);

    /** Admin-issued account warning with a custom reason. */
    void sendAccountWarning(Long userId, String reason);

    /** Sent after every successful OAuth login, noting the IP. */
    void sendNewLoginNotification(Long userId, String ipAddress);

    /**
     * Broadcasts a system-level notification to ALL active users.
     * Used for maintenance notices, downtime alerts, feature announcements.
     */
    void broadcastSystemAlert(String message, NotificationType type, String priority);
}
