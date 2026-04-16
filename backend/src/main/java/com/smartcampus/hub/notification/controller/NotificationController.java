package com.smartcampus.hub.notification.controller;

import com.smartcampus.hub.notification.dto.BroadcastRequest;
import com.smartcampus.hub.notification.dto.NotificationResponse;
import com.smartcampus.hub.notification.entity.NotificationCategory;
import com.smartcampus.hub.notification.service.NotificationService;
import com.smartcampus.hub.user.entity.User;
import com.smartcampus.hub.user.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

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
    private final UserRepository      userRepository;

    public NotificationController(NotificationService notificationService,
                                  UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository      = userRepository;
    }

    // ── GET /api/notifications ─────────────────────────────────────────────

    /**
     * Retrieves all notifications for the logged-in user.
     * Optionally filter by category: {@code ?category=BOOKING|TICKET|USER|SYSTEM}
     */
    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            @AuthenticationPrincipal OAuth2User oauthUser,
            @RequestParam(required = false) String category) {

        Long userId = resolveUserId(oauthUser);

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
            @AuthenticationPrincipal OAuth2User oauthUser) {

        Long userId = resolveUserId(oauthUser);
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    // ── GET /api/notifications/unread-count ───────────────────────────────

    @GetMapping("/notifications/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal OAuth2User oauthUser) {

        Long userId = resolveUserId(oauthUser);
        long count  = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    // ── PATCH /api/notifications/{id}/read ────────────────────────────────

    @PatchMapping("/notifications/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User oauthUser) {

        Long userId = resolveUserId(oauthUser);
        NotificationResponse updated = notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(updated);
    }

    // ── PATCH /api/notifications/read-all ─────────────────────────────────

    @PatchMapping("/notifications/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal OAuth2User oauthUser) {

        Long userId = resolveUserId(oauthUser);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();  // 204
    }

    // ── DELETE /api/notifications/{id} ────────────────────────────────────

    @DeleteMapping("/notifications/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User oauthUser) {

        Long userId = resolveUserId(oauthUser);
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

    /**
     * Resolves the authenticated user's database ID from the OAuth2 principal.
     * Falls back to email lookup if the principal doesn't carry the id directly.
     */
    private Long resolveUserId(OAuth2User oauthUser) {
        if (oauthUser == null) {
            throw new org.springframework.security.access.AccessDeniedException("Not authenticated");
        }

        // Try numeric id attribute first (set by some providers)
        Object rawId = oauthUser.getAttribute("id");
        if (rawId instanceof Long lid) return lid;
        if (rawId instanceof Integer iid) return iid.longValue();

        // Fall back to email lookup
        String email = oauthUser.getAttribute("email");
        if (email == null || email.isBlank()) {
            throw new org.springframework.security.access.AccessDeniedException("Cannot determine user identity");
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        return userOpt
                .map(User::getId)
                .orElseThrow(() -> new com.smartcampus.hub.exception.ResourceNotFoundException(
                        "Authenticated user not found in database: " + email));
    }
}
