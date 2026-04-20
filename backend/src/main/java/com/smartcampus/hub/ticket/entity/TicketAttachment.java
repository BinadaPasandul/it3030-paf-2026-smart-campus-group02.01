package com.smartcampus.hub.ticket.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * TicketAttachment - Entity for managing file attachments associated with a ticket
 */
@Entity
@Table(name = "ticket_attachments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "File name is required")
    private String fileName;

    @NotBlank(message = "File type is required")
    private String fileType;

    @NotBlank(message = "File path is required")
    private String filePath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;
}
