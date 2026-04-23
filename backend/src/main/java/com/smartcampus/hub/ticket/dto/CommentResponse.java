package com.smartcampus.hub.ticket.dto;

import lombok.*;

import java.time.LocalDateTime;

/**
 * CommentResponse - DTO for returning comment info
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {
    private Long id;
    private String content;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
}
