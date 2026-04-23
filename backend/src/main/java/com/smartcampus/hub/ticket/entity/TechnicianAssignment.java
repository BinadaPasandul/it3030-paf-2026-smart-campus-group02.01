package com.smartcampus.hub.ticket.entity;

import com.smartcampus.hub.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * TechnicianAssignment - Entity to manage the assignment of a technician to a ticket
 */
@Entity
@Table(name = "technician_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechnicianAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", unique = true, nullable = false)
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id", nullable = false)
    private User technician;

    @Column(nullable = false)
    private LocalDateTime assignedAt;

    @PrePersist
    protected void onAssign() {
        assignedAt = LocalDateTime.now();
    }
}
