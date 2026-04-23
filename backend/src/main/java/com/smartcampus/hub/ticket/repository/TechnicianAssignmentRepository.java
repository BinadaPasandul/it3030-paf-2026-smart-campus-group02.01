package com.smartcampus.hub.ticket.repository;

import com.smartcampus.hub.ticket.entity.TechnicianAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TechnicianAssignmentRepository extends JpaRepository<TechnicianAssignment, Long> {
    Optional<TechnicianAssignment> findByTicketId(Long ticketId);
}
