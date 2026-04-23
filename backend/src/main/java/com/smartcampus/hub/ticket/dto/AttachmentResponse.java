package com.smartcampus.hub.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AttachmentResponse - DTO for returning file attachment information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentResponse {
    private Long id;
    private String fileName;
    private String fileType;
    private String filePath;
}
