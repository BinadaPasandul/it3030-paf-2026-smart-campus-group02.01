package com.smartcampus.hub.ticket.dto;

import com.smartcampus.hub.ticket.entity.Comment;
import com.smartcampus.hub.ticket.entity.Ticket;
import com.smartcampus.hub.ticket.entity.TicketAttachment;

import java.util.stream.Collectors;

/**
 * TicketMapper - Helper class to convert between Entities and DTOs
 */
public class TicketMapper {

    public static TicketResponse toResponse(Ticket ticket) {
        if (ticket == null)
            return null;

        return TicketResponse.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .createdById(ticket.getCreatedBy() != null ? ticket.getCreatedBy().getId() : null)
                .createdByName(ticket.getCreatedBy() != null ? ticket.getCreatedBy().getFullName()
                        : null)
                .assignedToId(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getId() : null)
                .assignedToName(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getFullName()
                        : null)
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .comments(ticket.getComments() != null
                        ? ticket.getComments().stream().map(TicketMapper::toCommentResponse)
                                .collect(Collectors.toList())
                        : null)
                .attachments(ticket.getAttachments() != null
                        ? ticket.getAttachments().stream().map(TicketMapper::toAttachmentResponse)
                                .collect(Collectors.toList())
                        : null)
                .build();
    }

    public static CommentResponse toCommentResponse(Comment comment) {
        if (comment == null)
            return null;

        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdById(comment.getCreatedBy() != null ? comment.getCreatedBy().getId() : null)
                .createdByName(comment.getCreatedBy() != null ? comment.getCreatedBy().getFullName()
                        : null)
                .createdAt(comment.getCreatedAt())
                .build();
    }

    public static AttachmentResponse toAttachmentResponse(TicketAttachment attachment) {
        if (attachment == null)
            return null;

        return AttachmentResponse.builder()
                .id(attachment.getId())
                .fileName(attachment.getFileName())
                .fileType(attachment.getFileType())
                .filePath(attachment.getFilePath())
                .build();
    }
}
