package com.smartcampus.hub.notification.service;

import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.notification.dto.NotificationResponse;
import com.smartcampus.hub.notification.entity.Notification;
import com.smartcampus.hub.notification.entity.NotificationCategory;
import com.smartcampus.hub.notification.entity.NotificationType;
import com.smartcampus.hub.notification.realtime.NotificationRealtimePublisher;
import com.smartcampus.hub.notification.repository.NotificationRepository;
import com.smartcampus.hub.user.entity.User;
import com.smartcampus.hub.user.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * Full implementation of {@link NotificationService}.
 *
 * <p>Design principles:
 * <ul>
 *   <li>All DB writes are transactional.</li>
 *   <li>Ownership is always verified before mutating a notification.</li>
 *   <li>{@link #broadcastSystemAlert} iterates over all active users —
 *       acceptable for a campus-scale system; revisit if user count &gt; 10 k.</li>
 * </ul>
 */
@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    // ── Category mapping ──────────────────────────────────────────────────
    // Derived automatically from NoficationType so we never forget to update
    // this when a new type is added.
    private static final Map<NotificationType, NotificationCategory> CATEGORY_MAP = Map.ofEntries(
            // Booking
            Map.entry(NotificationType.BOOKING_APPROVED,            NotificationCategory.BOOKING),
            Map.entry(NotificationType.BOOKING_REJECTED,            NotificationCategory.BOOKING),
            Map.entry(NotificationType.BOOKING_CANCELLED,           NotificationCategory.BOOKING),
            Map.entry(NotificationType.REMINDER_PENDING_BOOKING,    NotificationCategory.BOOKING),
            // Ticket
            Map.entry(NotificationType.TICKET_STATUS_CHANGED,       NotificationCategory.TICKET),
            Map.entry(NotificationType.TICKET_ASSIGNED,             NotificationCategory.TICKET),
            Map.entry(NotificationType.TICKET_COMMENT_ADDED,        NotificationCategory.TICKET),
            Map.entry(NotificationType.COMMENT_REPLIED,             NotificationCategory.TICKET),
            Map.entry(NotificationType.ADMIN_RESPONSE,              NotificationCategory.TICKET),
            Map.entry(NotificationType.USER_MENTIONED,              NotificationCategory.TICKET),
            Map.entry(NotificationType.REMINDER_UNRESOLVED_TICKET,  NotificationCategory.TICKET),
            // User
            Map.entry(NotificationType.WELCOME,                     NotificationCategory.USER),
            Map.entry(NotificationType.ROLE_CHANGED,                NotificationCategory.USER),
            Map.entry(NotificationType.ACCOUNT_WARNING,             NotificationCategory.USER),
            Map.entry(NotificationType.NEW_LOGIN,                   NotificationCategory.USER),
            // System
            Map.entry(NotificationType.SYSTEM_MAINTENANCE,          NotificationCategory.SYSTEM),
            Map.entry(NotificationType.SYSTEM_DOWNTIME,             NotificationCategory.SYSTEM),
            Map.entry(NotificationType.FEATURE_ANNOUNCEMENT,        NotificationCategory.SYSTEM)
    );

    private final NotificationRepository notificationRepository;
    private final UserRepository         userRepository;
    private final NotificationRealtimePublisher notificationRealtimePublisher;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   UserRepository userRepository,
                                   NotificationRealtimePublisher notificationRealtimePublisher) {
        this.notificationRepository = notificationRepository;
        this.userRepository         = userRepository;
        this.notificationRealtimePublisher = notificationRealtimePublisher;
    }

    // ── Core send ──────────────────────────────────────────────────────────

    @Override
    public void sendNotification(Long userId,
                                 String message,
                                 NotificationType type,
                                 Long referenceId,
                                 String referenceType) {
        sendNotificationWithPriority(userId, message, type, referenceId, referenceType, "NORMAL");
    }

    @Override
    public void sendNotificationWithPriority(Long userId,
                                             String message,
                                             NotificationType type,
                                             Long referenceId,
                                             String referenceType,
                                             String priority) {
        User user = findUser(userId);
        NotificationCategory category = CATEGORY_MAP.getOrDefault(type, NotificationCategory.SYSTEM);

        Notification notification = new Notification(user, type, category, message,
                                                     priority, referenceId, referenceType);
        Notification savedNotification = notificationRepository.save(notification);
        NotificationResponse response = toResponse(savedNotification);

        if (type == NotificationType.REMINDER_PENDING_BOOKING) {
            notificationRealtimePublisher.publishAfterCommit(user.getEmail(), response);
        }
    }

    // ── Retrieval ──────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsForUser(Long userId) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        return notificationRepository
                .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsByCategory(Long userId,
                                                                  NotificationCategory category) {
        return notificationRepository
                .findByUserIdAndCategoryOrderByCreatedAtDesc(userId, category)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ── Mutation ───────────────────────────────────────────────────────────

    @Override
    public NotificationResponse markAsRead(Long notificationId, Long userId) {
        Notification notification = findOwnedNotification(notificationId, userId);
        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    @Override
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllReadByUserId(userId);
    }

    @Override
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = findOwnedNotification(notificationId, userId);
        notificationRepository.delete(notification);
    }

    // ── Special senders ────────────────────────────────────────────────────

    @Override
    public void sendWelcomeNotification(Long userId, String userName) {
        sendNotificationWithPriority(
                userId,
                "Welcome to Smart Campus Hub, " + userName + "! Your account has been created successfully.",
                NotificationType.WELCOME,
                null, null,
                "HIGH"
        );
    }

    @Override
    public void sendRoleChangedNotification(Long userId, String oldRole, String newRole) {
        sendNotificationWithPriority(
                userId,
                "Your role has been updated from " + oldRole + " to " + newRole + ".",
                NotificationType.ROLE_CHANGED,
                null, null,
                "HIGH"
        );
    }

    @Override
    public void sendAccountWarning(Long userId, String reason) {
        sendNotificationWithPriority(
                userId,
                "Your account has received a warning: " + reason,
                NotificationType.ACCOUNT_WARNING,
                null, null,
                "HIGH"
        );
    }

    @Override
    public void sendNewLoginNotification(Long userId, String ipAddress) {
        sendNotificationWithPriority(
                userId,
                "🔐 You have logged in. If this wasn't you, please contact the admin immediately.",
                NotificationType.NEW_LOGIN,
                null, null,
                "HIGH"
        );
    }

    @Override
    public void broadcastSystemAlert(String message, NotificationType type, String priority) {
        List<User> activeUsers = userRepository.findByActiveTrue();
        NotificationCategory category = CATEGORY_MAP.getOrDefault(type, NotificationCategory.SYSTEM);
        String resolvedPriority = (priority != null && !priority.isBlank()) ? priority : "HIGH";

        List<Notification> notifications = activeUsers.stream()
                .map(user -> new Notification(user, type, category, message, resolvedPriority, null, null))
                .toList();

        notificationRepository.saveAll(notifications);
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    /**
     * Fetches a notification that must belong to {@code userId}.
     * Throws {@link ResourceNotFoundException} if not found,
     * {@link AccessDeniedException} if the notification belongs to someone else.
     */
    private Notification findOwnedNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification not found with id: " + notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to access this notification");
        }
        return notification;
    }

    /** Maps a {@link Notification} entity to its response DTO. */
    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getMessage(),
                n.getType(),
                n.getCategory(),
                n.isRead(),
                n.getPriority(),
                n.getReferenceId(),
                n.getReferenceType(),
                n.getCreatedAt()
        );
    }
}
