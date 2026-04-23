package com.smartcampus.hub.ticket.service;

import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.ticket.entity.TechnicianAssignment;
import com.smartcampus.hub.ticket.entity.Ticket;
import com.smartcampus.hub.ticket.entity.TicketStatus;
import com.smartcampus.hub.ticket.dto.StatusUpdateRequest;
import com.smartcampus.hub.ticket.repository.TicketRepository;
import com.smartcampus.hub.user.entity.User;
import com.smartcampus.hub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

/**
 * TicketService - Business logic for ticket lifecycle management
 */
@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    @Transactional
    public Ticket createTicket(Ticket ticket, Long creatorId) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + creatorId));
        
        ticket.setCreatedBy(creator);
        ticket.setStatus(TicketStatus.OPEN);
        return ticketRepository.save(ticket);
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
    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    @Transactional
    public Ticket assignTechnician(Long ticketId, Long technicianId) {
        Ticket ticket = getTicketById(ticketId);
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + technicianId));

        // Create or update technician assignment
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
        ticket.setStatus(TicketStatus.IN_PROGRESS); // Auto-update status to IN_PROGRESS on assignment
        
        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket updateStatus(Long ticketId, StatusUpdateRequest request, Long userId, com.smartcampus.hub.user.entity.Role userRole) {
        Ticket ticket = getTicketById(ticketId);
        
        // Authorization Check: Only ADMIN or Assigned Technician
        boolean isAdmin = userRole == com.smartcampus.hub.user.entity.Role.ADMIN;
        boolean isAssignedTechnician = ticket.getAssignedTo() != null && ticket.getAssignedTo().getId().equals(userId);

        if (!isAdmin && !isAssignedTechnician) {
            throw new org.springframework.security.access.AccessDeniedException("You are not authorized to update this ticket's status.");
        }

        TicketStatus currentStatus = ticket.getStatus();
        TicketStatus newStatus = request.getStatus();

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
        
        return ticketRepository.save(ticket);
    }

    private void validateStatusTransition(TicketStatus current, TicketStatus next, com.smartcampus.hub.user.entity.Role role, StatusUpdateRequest request) {
        // ADMIN can reject at any point except from terminal states
        if (next == TicketStatus.REJECTED) {
            if (role != com.smartcampus.hub.user.entity.Role.ADMIN) {
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

        boolean valid = false;
        switch (current) {
            case OPEN -> valid = (next == TicketStatus.IN_PROGRESS);
            case IN_PROGRESS -> valid = (next == TicketStatus.RESOLVED);
            case RESOLVED -> valid = (next == TicketStatus.CLOSED);
            case CLOSED, REJECTED -> valid = false; // Terminal states
        }

        if (!valid) {
            throw new IllegalArgumentException("Invalid status transition: " + current + " -> " + next);
        }
    }
}
