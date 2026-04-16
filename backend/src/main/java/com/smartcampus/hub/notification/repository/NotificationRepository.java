package com.smartcampus.hub.notification.repository;

import com.smartcampus.hub.notification.entity.Notification;
import com.smartcampus.hub.notification.entity.NotificationCategory;
import com.smartcampus.hub.notification.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /** All notifications for a user, newest first. */
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    /** Only unread notifications for a user, newest first. */
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    /** Count of unread notifications (used for the bell badge). */
    long countByUserIdAndIsReadFalse(Long userId);

    /** Filtered by category, newest first. */
    List<Notification> findByUserIdAndCategoryOrderByCreatedAtDesc(Long userId, NotificationCategory category);

    /**
     * Used by the scheduler to avoid spamming the same reminder type twice
     * in a short window (e.g., don't send REMINDER_PENDING_BOOKING again if
     * one was already sent in the last 24 h).
     */
    @Query("SELECT n FROM Notification n " +
           "WHERE n.user.id = :userId " +
           "  AND n.type    = :type " +
           "  AND n.createdAt > :since")
    List<Notification> findRecentByTypeAndUser(@Param("userId") Long userId,
                                               @Param("type")   NotificationType type,
                                               @Param("since")  LocalDateTime since);

    /**
     * Bulk mark-all-read for a single user in one UPDATE query
     * (avoids loading every entity into memory).
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true " +
           "WHERE n.user.id = :userId AND n.isRead = false")
    int markAllReadByUserId(@Param("userId") Long userId);

    /**
     * Find one notification by id that belongs to a specific user.
     * Used to enforce ownership before any mutation.
     */
    Optional<Notification> findByIdAndUserId(Long id, Long userId);
}
