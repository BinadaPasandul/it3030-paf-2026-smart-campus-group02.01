package com.smartcampus.hub.ticket.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * AssignmentRequest - DTO for assigning a technician to a ticket
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentRequest {
    @NotNull(message = "Technician ID is required")
    private Long technicianId;
}
