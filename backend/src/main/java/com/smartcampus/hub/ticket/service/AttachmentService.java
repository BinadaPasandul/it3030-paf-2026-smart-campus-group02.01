package com.smartcampus.hub.ticket.service;

import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.ticket.entity.Ticket;
import com.smartcampus.hub.ticket.entity.TicketAttachment;
import com.smartcampus.hub.ticket.repository.TicketAttachmentRepository;
import com.smartcampus.hub.ticket.repository.TicketRepository;
import com.smartcampus.hub.util.FileValidationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * AttachmentService - Business logic for ticket file attachments
 */
@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final TicketAttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Transactional
    public TicketAttachment uploadAttachment(Long ticketId, MultipartFile file) {
        // 1. Validate Ticket Existence
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        // 2. Validate Attachment Count (Limit 3)
        if (ticket.getAttachments().size() >= 3) {
            throw new IllegalStateException("Maximum of 3 attachments allowed per ticket.");
        }

        // 3. Validate File Type and Size using Utility
        FileValidationUtils.validateImage(file);
        FileValidationUtils.validateFileSize(file, 5 * 1024 * 1024); // 5MB limit

        try {
            // Prepare directory
            String ticketUploadSubDir = "tickets/" + ticketId;
            Path uploadPath = Paths.get(uploadDir, ticketUploadSubDir);
            
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Prepare unique filename (UUID)
            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
            
            // Save file to disk
            Path filePath = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Relative path for the database and frontend access
            String relativePath = "/uploads/" + ticketUploadSubDir + "/" + uniqueFileName;

            TicketAttachment attachment = TicketAttachment.builder()
                    .fileName(originalFileName)
                    .fileType(file.getContentType())
                    .filePath(relativePath)
                    .ticket(ticket)
                    .build();

            // Maintain bidirectional consistency
            ticket.addAttachment(attachment);

            return attachmentRepository.save(attachment);

        } catch (IOException e) {
            throw new RuntimeException("Failed to save attachment due to a disk I/O error: " + e.getMessage());
        }
    }
}
