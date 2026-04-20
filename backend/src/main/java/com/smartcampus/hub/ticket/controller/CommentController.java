package com.smartcampus.hub.ticket.controller;

import com.smartcampus.hub.auth.dto.CurrentUserResponse;
import com.smartcampus.hub.auth.service.AuthService;
import com.smartcampus.hub.ticket.dto.CommentRequest;
import com.smartcampus.hub.ticket.dto.CommentResponse;
import com.smartcampus.hub.ticket.dto.TicketMapper;
import com.smartcampus.hub.ticket.entity.Comment;
import com.smartcampus.hub.ticket.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * CommentController - REST endpoints for comment management
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final AuthService authService;

    @PostMapping("/tickets/{ticketId}/comments")
    public ResponseEntity<CommentResponse> addComment(Authentication authentication,
            @PathVariable Long ticketId,
            @Valid @RequestBody CommentRequest request) {
        CurrentUserResponse currentUser = authService.getCurrentUser(authentication);
        Comment comment = commentService.addComment(ticketId, request.getContent(), currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(TicketMapper.toCommentResponse(comment));
    }

    @PutMapping("/comments/{id}")
    public ResponseEntity<CommentResponse> updateComment(Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request) {
        CurrentUserResponse currentUser = authService.getCurrentUser(authentication);
        Comment updatedComment = commentService.updateComment(id, request.getContent(), currentUser.getId());
        return ResponseEntity.ok(TicketMapper.toCommentResponse(updatedComment));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(Authentication authentication,
            @PathVariable Long id) {
        CurrentUserResponse currentUser = authService.getCurrentUser(authentication);
        commentService.deleteComment(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
