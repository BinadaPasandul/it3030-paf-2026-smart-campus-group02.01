package com.smartcampus.hub.ticket.service;

import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.notification.entity.NotificationType;
import com.smartcampus.hub.notification.service.NotificationService;
import com.smartcampus.hub.ticket.dto.StatusUpdateRequest;
import com.smartcampus.hub.ticket.entity.TechnicianAssignment;
import com.smartcampus.hub.ticket.entity.Ticket;
import com.smartcampus.hub.ticket.entity.TicketStatus;
import com.smartcampus.hub.ticket.repository.TicketRepository;
import com.smartcampus.hub.user.entity.Role;
import com.smartcampus.hub.user.entity.User;
import com.smartcampus.hub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

/**
 * TicketService — Business logic for ticket lifecycle management.
 *
 * <p>Notification integration follows the same pattern as BookingService:
 * {@link NotificationService} is injected via {@code @Lazy} setter to avoid a
 * circular dependency between the notification and ticket beans.
 *
 * <p><strong>Notification message templates</strong> are centralised in the private
 * {@code notifyXxx()} helpers at the bottom of this class. Change message wording
 * there without touching business logic.
 */
@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository   userRepository;

    // ── NotificationService: setter injection (not constructor) because
    // @RequiredArgsConstructor already owns the constructor for the final fields above.
    // @Lazy prevents a circular dependency chain at startup.
    private NotificationService notificationService;

    @Autowired
    public void setNotificationService(@Lazy NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  CRUD & Queries (unchanged from original — no notification side effects
    //  on read operations)
    // ═══════════════════════════════════════════════════════════════════════

    @Transactional
    public Ticket createTicket(Ticket ticket, Long creatorId) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + creatorId));

        ticket.setCreatedBy(creator);
        ticket.setStatus(TicketStatus.OPEN);
        Ticket saved = ticketRepository.save(ticket);

        notifyTicketCreated(saved, creatorId);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll().stream()
                .sorted(Comparator.comparing(Ticket::getCreatedAt).reversed())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Ticket> getTicketsForCreator(Long creatorId) {
        return ticketRepository.findByCreatedByIdOrderByCreatedAtDesc(creatorId);
    }

    @Transactional(readOnly = true)
    public List<Ticket> getTicketsForTechnician(Long technicianId) {
        return ticketRepository.findByAssignedToIdOrderByUpdatedAtDesc(technicianId);
    }

    @Transactional(readOnly = true)
    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Ticket getTicketForUser(Long ticketId, Long userId, Role role) {
        Ticket ticket = getTicketById(ticketId);
        if (!canAccessTicket(ticket, userId, role)) {
            throw new AccessDeniedException("You are not authorized to view this ticket.");
        }
        return ticket;
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  State-changing operations (all fire notifications after successful save)
    // ═══════════════════════════════════════════════════════════════════════

    @Transactional
    public Ticket assignTechnician(Long ticketId, Long technicianId) {
        Ticket ticket    = getTicketById(ticketId);
        User technician  = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + technicianId));

        if (technician.getRole() != Role.TECHNICIAN) {
            throw new IllegalArgumentException("Selected user is not a technician.");
        }
        if (!technician.isActive()) {
            throw new IllegalArgumentException("Selected technician account is inactive.");
        }

        // Create or update the assignment record
        TechnicianAssignment assignment = ticket.getAssignment();
        if (assignment == null) {
            assignment = TechnicianAssignment.builder()
                    .ticket(ticket)
                    .technician(technician)
                    .assignedAt(LocalDateTime.now())
                    .build();
            ticket.setAssignment(assignment);
        } else {
            assignment.setTechnician(technician);
            assignment.setAssignedAt(LocalDateTime.now());
        }

        ticket.setAssignedTo(technician);
        ticket.setStatus(TicketStatus.IN_PROGRESS);

        Ticket saved = ticketRepository.save(ticket);

        notifyTechnicianAssigned(saved, technician);
        return saved;
    }

    @Transactional
    public Ticket updateStatus(Long ticketId, StatusUpdateRequest request, Long userId, Role userRole) {
        Ticket ticket        = getTicketById(ticketId);
        boolean isAdmin      = userRole == Role.ADMIN;
        boolean isAssignedTech = userRole == Role.TECHNICIAN
                && ticket.getAssignedTo() != null
                && ticket.getAssignedTo().getId().equals(userId);

        if (!isAdmin && !isAssignedTech) {
            throw new AccessDeniedException("You are not authorized to update this ticket's status.");
        }

        TicketStatus currentStatus = ticket.getStatus();
        TicketStatus newStatus     = request.getStatus();

        if (currentStatus != newStatus) {
            validateStatusTransition(currentStatus, newStatus, userRole, request);
        }

        ticket.setStatus(newStatus);
        if (request.getResolutionNotes() != null) {
            ticket.setResolutionNotes(request.getResolutionNotes());
        }
        if (request.getRejectionReason() != null) {
            ticket.setRejectionReason(request.getRejectionReason());
        }

        Ticket saved = ticketRepository.save(ticket);

        notifyStatusChanged(saved, newStatus, request);
        return saved;
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Notification helpers — change message wording HERE, not in business logic
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Fired when a user successfully submits a new ticket.
     * Recipient: the ticket creator.
     */
    private void notifyTicketCreated(Ticket ticket, Long creatorId) {
        String message = String.format(
                "Your ticket \"%s\" (#%d) has been submitted successfully. Status: OPEN.",
                ticket.getTitle(), ticket.getId()
        );
        notificationService.sendNotification(
                creatorId,
                message,
                NotificationType.TICKET_STATUS_CHANGED,
                ticket.getId(),
                "TICKET"
        );
    }

    /**
     * Fired when an admin assigns a technician to a ticket.
     * Recipients: ticket owner (HIGH) + technician (HIGH).
     */
    private void notifyTechnicianAssigned(Ticket ticket, User technician) {
        Long ownerId = ticket.getCreatedBy().getId();

        // Notify the ticket owner
        String ownerMessage = String.format(
                "A technician (%s) has been assigned to your ticket \"%s\" (#%d). Status: IN_PROGRESS.",
                technician.getFullName(), ticket.getTitle(), ticket.getId()
        );
        notificationService.sendNotificationWithPriority(
                ownerId, ownerMessage,
                NotificationType.TICKET_ASSIGNED,
                ticket.getId(), "TICKET", "HIGH"
        );

        // Notify the technician themselves
        String techMessage = String.format(
                "You have been assigned to ticket \"%s\" (#%d). Please review and begin work.",
                ticket.getTitle(), ticket.getId()
        );
        notificationService.sendNotificationWithPriority(
                technician.getId(), techMessage,
                NotificationType.TICKET_ASSIGNED,
                ticket.getId(), "TICKET", "HIGH"
        );
    }

    /**
     * Fired after any status update. Dispatches the appropriate message
     * based on the new status.
     * Recipient: ticket owner.
     */
    private void notifyStatusChanged(Ticket ticket, TicketStatus newStatus, StatusUpdateRequest request) {
        Long   ownerId  = ticket.getCreatedBy().getId();
        String title    = ticket.getTitle();
        Long   savedId  = ticket.getId();
        String message;
        String priority;

        switch (newStatus) {
            case REJECTED -> {
                String reason = (request.getRejectionReason() != null && !request.getRejectionReason().isBlank())
                        ? " Reason: " + request.getRejectionReason() : "";
                message  = String.format("Your ticket \"%s\" (#%d) has been REJECTED.%s", title, savedId, reason);
                priority = "HIGH";
            }
            case RESOLVED -> {
                String notes = (request.getResolutionNotes() != null && !request.getResolutionNotes().isBlank())
                        ? " Notes: " + request.getResolutionNotes() : "";
                message  = String.format("Your ticket \"%s\" (#%d) has been RESOLVED.%s", title, savedId, notes);
                priority = "HIGH";
            }
            case CLOSED -> {
                message  = String.format("Your ticket \"%s\" (#%d) has been CLOSED.", title, savedId);
                priority = "NORMAL";
            }
            default -> {
                message  = String.format("Your ticket \"%s\" (#%d) status changed to %s.", title, savedId, newStatus);
                priority = "NORMAL";
            }
        }

        notificationService.sendNotificationWithPriority(
                ownerId, message,
                NotificationType.TICKET_STATUS_CHANGED,
                savedId, "TICKET", priority
        );
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Private validation helpers (unchanged from original)
    // ═══════════════════════════════════════════════════════════════════════

    private void validateStatusTransition(TicketStatus current, TicketStatus next,
                                          Role role, StatusUpdateRequest request) {
        if (next == TicketStatus.REJECTED) {
            if (role != Role.ADMIN) {
                throw new IllegalArgumentException("Only administrators can reject tickets.");
            }
            if (request.getRejectionReason() == null || request.getRejectionReason().isBlank()) {
                throw new IllegalArgumentException("A rejection reason must be provided.");
            }
            if (current == TicketStatus.CLOSED || current == TicketStatus.RESOLVED) {
                throw new IllegalArgumentException("Cannot reject a ticket that is already " + current);
            }
            return;
        }

        if (next == TicketStatus.RESOLVED
                && (request.getResolutionNotes() == null || request.getResolutionNotes().isBlank())) {
            throw new IllegalArgumentException("Resolution notes must be provided when resolving a ticket.");
        }

        boolean valid = false;
        switch (current) {
            case OPEN        -> valid = (next == TicketStatus.IN_PROGRESS);
            case IN_PROGRESS -> valid = (next == TicketStatus.RESOLVED);
            case RESOLVED    -> valid = (next == TicketStatus.CLOSED);
            case CLOSED, REJECTED -> valid = false;
        }

        if (!valid) {
            throw new IllegalArgumentException("Invalid status transition: " + current + " -> " + next);
        }
    }

    private boolean canAccessTicket(Ticket ticket, Long userId, Role role) {
        if (role == Role.ADMIN) return true;
        boolean isCreator  = ticket.getCreatedBy() != null && ticket.getCreatedBy().getId().equals(userId);
        boolean isTech     = role == Role.TECHNICIAN
                && ticket.getAssignedTo() != null
                && ticket.getAssignedTo().getId().equals(userId);
        return isCreator || isTech;
    }
}
