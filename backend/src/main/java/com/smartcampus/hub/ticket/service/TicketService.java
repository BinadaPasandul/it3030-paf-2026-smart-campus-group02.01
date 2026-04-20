package com.smartcampus.hub.ticket.service;

import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.ticket.entity.TechnicianAssignment;
import com.smartcampus.hub.ticket.entity.Ticket;
import com.smartcampus.hub.ticket.entity.TicketStatus;
import com.smartcampus.hub.ticket.repository.TicketRepository;
import com.smartcampus.hub.user.entity.User;
import com.smartcampus.hub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

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
    public Ticket updateStatus(Long ticketId, TicketStatus status) {
        Ticket ticket = getTicketById(ticketId);
        ticket.setStatus(status);
        return ticketRepository.save(ticket);
    }
}
