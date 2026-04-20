package com.smartcampus.hub.ticket.controller;

import com.smartcampus.hub.auth.dto.CurrentUserResponse;
import com.smartcampus.hub.auth.service.AuthService;
import com.smartcampus.hub.ticket.dto.*;
import com.smartcampus.hub.ticket.entity.Ticket;
import com.smartcampus.hub.ticket.entity.TicketAttachment;
import com.smartcampus.hub.ticket.service.AttachmentService;
import com.smartcampus.hub.ticket.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

/**
 * TicketController - REST endpoints for ticket management
 */
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final AttachmentService attachmentService;
    private final AuthService authService;

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(Authentication authentication,
            @Valid @RequestBody TicketRequest request) {
        CurrentUserResponse currentUser = authService.getCurrentUser(authentication);

        Ticket ticket = Ticket.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .build();

        Ticket createdTicket = ticketService.createTicket(ticket, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(TicketMapper.toResponse(createdTicket));
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        List<TicketResponse> responses = ticketService.getAllTickets().stream()
                .map(TicketMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id) {
        Ticket ticket = ticketService.getTicketById(id);
        return ResponseEntity.ok(TicketMapper.toResponse(ticket));
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<AttachmentResponse> uploadAttachment(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        TicketAttachment attachment = attachmentService.uploadAttachment(id, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(TicketMapper.toAttachmentResponse(attachment));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTechnician(@PathVariable Long id,
            @Valid @RequestBody AssignmentRequest request) {
        Ticket updatedTicket = ticketService.assignTechnician(id, request.getTechnicianId());
        return ResponseEntity.ok(TicketMapper.toResponse(updatedTicket));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(@PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        Ticket updatedTicket = ticketService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(TicketMapper.toResponse(updatedTicket));
    }
}
