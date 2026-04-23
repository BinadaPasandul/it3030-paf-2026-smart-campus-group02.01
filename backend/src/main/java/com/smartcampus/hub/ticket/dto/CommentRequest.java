package com.smartcampus.hub.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * CommentRequest - DTO for adding or updating a comment
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentRequest {
    @NotBlank(message = "Comment content cannot be empty")
    private String content;
}
