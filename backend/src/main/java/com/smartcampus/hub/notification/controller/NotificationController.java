package com.smartcampus.hub.notification.controller;

import com.smartcampus.hub.auth.dto.CurrentUserResponse;
import com.smartcampus.hub.auth.service.AuthService;
import com.smartcampus.hub.notification.dto.BroadcastRequest;
import com.smartcampus.hub.notification.dto.NotificationResponse;
import com.smartcampus.hub.notification.entity.NotificationCategory;
import com.smartcampus.hub.notification.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for the Notification module.
 *
 * <p>All endpoints under {@code /api/notifications} are accessible only to
 * authenticated users and operate exclusively on the currently logged-in user's
 * notifications. The {@code /api/admin/notifications} endpoints require ADMIN role.
 *
 * <h2>Endpoints</h2>
 * <pre>
 * GET    /api/notifications                     → all notifications (optional ?category=)
 * GET    /api/notifications/unread              → unread only
 * GET    /api/notifications/unread-count        → { "count": N }
 * PATCH  /api/notifications/{id}/read           → mark one as read
 * PATCH  /api/notifications/read-all            → mark all as read
 * DELETE /api/notifications/{id}                → delete one
 * POST   /api/admin/notifications/broadcast     → system-wide broadcast (ADMIN only)
 * </pre>
 */
@RestController
@RequestMapping("/api")
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    public NotificationController(NotificationService notificationService,
                                  AuthService authService) {
        this.notificationService = notificationService;
        this.authService = authService;
    }

    // ── GET /api/notifications ─────────────────────────────────────────────

    /**
     * Retrieves all notifications for the logged-in user.
     * Optionally filter by category: {@code ?category=BOOKING|TICKET|USER|SYSTEM}
     */
    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            Authentication authentication,
            @RequestParam(required = false) String category) {

        Long userId = resolveUserId(authentication);

        List<NotificationResponse> result;
        if (category != null && !category.isBlank()) {
            NotificationCategory cat = NotificationCategory.valueOf(category.toUpperCase());
            result = notificationService.getNotificationsByCategory(userId, cat);
        } else {
            result = notificationService.getNotificationsForUser(userId);
        }

        return ResponseEntity.ok(result);
    }

    // ── GET /api/notifications/unread ─────────────────────────────────────

    @GetMapping("/notifications/unread")
    public ResponseEntity<List<NotificationResponse>> getUnread(
            Authentication authentication) {

        Long userId = resolveUserId(authentication);
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    // ── GET /api/notifications/unread-count ───────────────────────────────

    @GetMapping("/notifications/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            Authentication authentication) {

        Long userId = resolveUserId(authentication);
        long count  = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    // ── PATCH /api/notifications/{id}/read ────────────────────────────────

    @PatchMapping("/notifications/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {

        Long userId = resolveUserId(authentication);
        NotificationResponse updated = notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(updated);
    }

    // ── PATCH /api/notifications/read-all ─────────────────────────────────

    @PatchMapping("/notifications/read-all")
    public ResponseEntity<Void> markAllAsRead(
            Authentication authentication) {

        Long userId = resolveUserId(authentication);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();  // 204
    }

    // ── DELETE /api/notifications/{id} ────────────────────────────────────

    @DeleteMapping("/notifications/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id,
            Authentication authentication) {

        Long userId = resolveUserId(authentication);
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.noContent().build();  // 204
    }

    // ── POST /api/admin/notifications/broadcast ───────────────────────────

    /**
     * Broadcast a system-level notification to every active user.
     * Restricted to ADMIN role only.
     */
    @PostMapping("/admin/notifications/broadcast")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> broadcast(
            @Valid @RequestBody BroadcastRequest request) {

        notificationService.broadcastSystemAlert(
                request.getMessage(),
                request.getType(),
                request.getPriority()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Broadcast sent successfully"));
    }

    // ── Helper ─────────────────────────────────────────────────────────────

    private Long resolveUserId(Authentication authentication) {
        CurrentUserResponse currentUser = authService.getCurrentUser(authentication);
        return currentUser.getId();
    }
}
