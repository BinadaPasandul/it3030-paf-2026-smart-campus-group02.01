package com.smartcampus.hub.ticket.dto;

import com.smartcampus.hub.ticket.entity.TicketPriority;
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

    @NotBlank(message = "Category is required")
    private String category;

    @Builder.Default
    private TicketPriority priority = TicketPriority.MEDIUM;

    @NotBlank(message = "Location is required")
    private String location;

    private String contactDetails;
}
