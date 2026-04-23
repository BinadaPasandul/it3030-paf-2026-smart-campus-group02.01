package com.smartcampus.hub.ticket.service;

import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.ticket.entity.Comment;
import com.smartcampus.hub.ticket.entity.Ticket;
import com.smartcampus.hub.ticket.repository.CommentRepository;
import com.smartcampus.hub.ticket.repository.TicketRepository;
import com.smartcampus.hub.user.entity.User;
import com.smartcampus.hub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * CommentService - Business logic for ticket comments
 */
@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    @Transactional
    public Comment addComment(Long ticketId, String content, Long userId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Comment comment = Comment.builder()
                .content(content)
                .ticket(ticket)
                .createdBy(user)
                .build();

        return commentRepository.save(comment);
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

    public List<Comment> getCommentsByTicketId(Long ticketId) {
        return commentRepository.findByTicketId(ticketId);
    }
}
