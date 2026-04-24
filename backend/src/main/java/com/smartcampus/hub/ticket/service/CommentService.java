package com.smartcampus.hub.ticket.service;

import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.notification.entity.NotificationType;
import com.smartcampus.hub.notification.service.NotificationService;
import com.smartcampus.hub.ticket.entity.Comment;
import com.smartcampus.hub.ticket.entity.Ticket;
import com.smartcampus.hub.ticket.repository.CommentRepository;
import com.smartcampus.hub.ticket.repository.TicketRepository;
import com.smartcampus.hub.user.entity.User;
import com.smartcampus.hub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * CommentService — Business logic for ticket comments.
 *
 * <p>Notification wording is isolated in {@link #notifyCommentAdded}
 * so it can be updated without touching business logic.
 */
@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository  ticketRepository;
    private final UserRepository    userRepository;

    // @Lazy setter — same pattern as TicketService to avoid circular dependency
    private NotificationService notificationService;

    @Autowired
    public void setNotificationService(@Lazy NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Comment operations
    // ═══════════════════════════════════════════════════════════════════════

    @Transactional
    public Comment addComment(Long ticketId, String content, Long userId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        User commenter = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Comment comment = Comment.builder()
                .content(content)
                .ticket(ticket)
                .createdBy(commenter)
                .build();

        Comment saved = commentRepository.save(comment);

        // Only notify if the commenter is NOT the ticket owner (no self-notifications)
        notifyCommentAdded(ticket, commenter, content);

        return saved;
    }

    @Transactional
    public Comment updateComment(Long commentId, String content, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        if (!comment.getCreatedBy().getId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to edit this comment");
        }

        comment.setContent(content);
        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        if (!comment.getCreatedBy().getId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to delete this comment");
        }

        commentRepository.delete(comment);
    }

    @Transactional(readOnly = true)
    public List<Comment> getCommentsByTicketId(Long ticketId) {
        return commentRepository.findByTicketId(ticketId);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Notification helper — change message wording HERE only
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Notifies the ticket owner when someone else adds a comment.
     * Self-comments are intentionally skipped.
     *
     * @param ticket    the ticket the comment was added to
     * @param commenter the user who wrote the comment
     * @param content   the raw comment text (will be truncated in the preview)
     */
    private void notifyCommentAdded(Ticket ticket, User commenter, String content) {
        Long ownerId      = ticket.getCreatedBy().getId();
        Long commenterId  = commenter.getId();

        // Skip if the ticket owner is commenting on their own ticket
        if (ownerId.equals(commenterId)) {
            return;
        }

        String preview = truncate(content, 80);
        String message = String.format(
                "%s added a comment on your ticket \"%s\" (#%d): \"%s\"",
                commenter.getFullName(), ticket.getTitle(), ticket.getId(), preview
        );

        notificationService.sendNotification(
                ownerId,
                message,
                NotificationType.TICKET_COMMENT_ADDED,
                ticket.getId(),
                "TICKET"
        );
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Utility
    // ═══════════════════════════════════════════════════════════════════════

    /** Shortens long comment text so notification messages are concise. */
    private String truncate(String text, int maxLen) {
        if (text == null || text.isBlank()) return "";
        return text.length() <= maxLen ? text : text.substring(0, maxLen) + "...";
    }
}
