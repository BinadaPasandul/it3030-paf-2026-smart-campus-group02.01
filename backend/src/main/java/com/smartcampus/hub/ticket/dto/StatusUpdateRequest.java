package com.smartcampus.hub.ticket.dto;

import com.smartcampus.hub.ticket.entity.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * StatusUpdateRequest - DTO for patching ticket status
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdateRequest {
    @NotNull(message = "Status is required")
    private TicketStatus status;

    private String resolutionNotes;
    private String rejectionReason;
}
