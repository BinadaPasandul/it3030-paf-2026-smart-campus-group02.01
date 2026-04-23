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
    private String category;
    private com.smartcampus.hub.ticket.entity.TicketPriority priority;
    private String location;
    private String contactDetails;
    private String resolutionNotes;
    private String rejectionReason;
    private Long createdById;
    private String createdByName;
    private Long assignedToId;
    private String assignedToName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<CommentResponse> comments;
    private List<AttachmentResponse> attachments;
}
