package com.smartcampus.hub.ticket.entity;

import com.smartcampus.hub.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Comment - Entity for user comments on a ticket
 */
@Entity
@Table(name = "ticket_comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Comment content cannot be empty")
    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
