package com.smartcampus.hub.ticket.dto;

import com.smartcampus.hub.ticket.entity.TicketStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * TicketResponse - DTO for returning ticket information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponse {
    private Long id;
    private String title;
    private String description;
    private TicketStatus status;
    private Long createdById;
    private String createdByName;
    private Long assignedToId;
    private String assignedToName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<CommentResponse> comments;
    private List<AttachmentResponse> attachments;
}
