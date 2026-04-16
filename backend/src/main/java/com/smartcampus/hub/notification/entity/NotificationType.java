package com.smartcampus.hub.notification.entity;

/**
 * Defines every concrete notification event in the system.
 *
 * <p>Grouped by the module that triggers each type so teammates know
 * exactly which value to pass when calling
 * {@code NotificationService.sendNotification()}.
 */
public enum NotificationType {

    // ── Module B – Booking ──────────────────────────────────────────────
    BOOKING_APPROVED,
    BOOKING_REJECTED,
    BOOKING_CANCELLED,

    // ── Module C – Tickets & Comments ───────────────────────────────────
    TICKET_STATUS_CHANGED,
    TICKET_ASSIGNED,
    TICKET_COMMENT_ADDED,
    COMMENT_REPLIED,
    ADMIN_RESPONSE,
    USER_MENTIONED,

    // ── Module D (self) – User lifecycle ────────────────────────────────
    WELCOME,
    ROLE_CHANGED,
    ACCOUNT_WARNING,
    NEW_LOGIN,

    // ── Module D (self) – System-wide alerts ────────────────────────────
    SYSTEM_MAINTENANCE,
    SYSTEM_DOWNTIME,
    FEATURE_ANNOUNCEMENT,

    // ── Module D (self) – Scheduled smart reminders ──────────────────────
    REMINDER_PENDING_BOOKING,
    REMINDER_UNRESOLVED_TICKET
}
