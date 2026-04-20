package com.smartcampus.hub.ticket.entity;

import com.smartcampus.hub.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Ticket - Core Entity representing a maintenance or incident report
 */
@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "Description is required")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    /**
     * The specific user (Technician) assigned to this ticket.
     * Often linked redundancy-wise but useful for quick queries.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    @Size(max = 3, message = "Each ticket can have maximum 3 attachments")
    @Builder.Default
    private List<TicketAttachment> attachments = new ArrayList<>();

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    @OneToOne(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    private TechnicianAssignment assignment;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods for bidirectional relationships
    public void addAttachment(TicketAttachment attachment) {
        if (attachments.size() < 3) {
            attachments.add(attachment);
            attachment.setTicket(this);
        } else {
            throw new IllegalStateException("Maximum of 3 attachments allowed per ticket.");
        }
    }

    public void removeAttachment(TicketAttachment attachment) {
        attachments.remove(attachment);
        attachment.setTicket(null);
    }

    public void addComment(Comment comment) {
        comments.add(comment);
        comment.setTicket(this);
    }

    public void removeComment(Comment comment) {
        comments.remove(comment);
        comment.setTicket(null);
    }
}
