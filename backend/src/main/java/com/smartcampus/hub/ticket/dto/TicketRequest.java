package com.smartcampus.hub.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * TicketRequest - DTO for creating a new ticket
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;
}
