package com.smartcampus.hub.ticket.repository;

/**
 * TicketRepository - JPA Repository for ticket database operations
 */
import com.smartcampus.hub.ticket.entity.Ticket;
import com.smartcampus.hub.ticket.entity.TicketStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    @Override
    @EntityGraph(attributePaths = {
            "createdBy",
            "assignedTo"
    })
    List<Ticket> findAll();

    @Override
    @EntityGraph(attributePaths = {
            "createdBy",
            "assignedTo"
    })
    Optional<Ticket> findById(Long id);

    @EntityGraph(attributePaths = {
            "createdBy",
            "assignedTo"
    })
    List<Ticket> findByCreatedByIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {
            "createdBy",
            "assignedTo"
    })
    List<Ticket> findByAssignedToId(Long userId);

    List<Ticket> findByStatus(TicketStatus status);
}
