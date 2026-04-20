package com.smartcampus.hub.ticket.repository;

/**
 * TicketRepository - JPA Repository for ticket database operations
 */
import com.smartcampus.hub.ticket.entity.Ticket;
import com.smartcampus.hub.ticket.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCreatedById(Long userId);
    List<Ticket> findByAssignedToId(Long userId);
    List<Ticket> findByStatus(TicketStatus status);
}
