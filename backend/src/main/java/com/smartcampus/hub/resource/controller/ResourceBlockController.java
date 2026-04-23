package com.smartcampus.hub.resource.controller;

import com.smartcampus.hub.resource.dto.CreateResourceBlockRequest;
import com.smartcampus.hub.resource.dto.ResourceBlockResponse;
import com.smartcampus.hub.resource.service.ResourceBlockService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources/{resourceId}/blocks")
public class ResourceBlockController {

    private final ResourceBlockService resourceBlockService;

    public ResourceBlockController(ResourceBlockService resourceBlockService) {
        this.resourceBlockService = resourceBlockService;
    }

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ResourceBlockResponse> createResourceBlock(
            @PathVariable Long resourceId,
            @Valid @RequestBody CreateResourceBlockRequest request
    ) {
        ResourceBlockResponse response = resourceBlockService.createResourceBlock(resourceId, request, getCurrentUserEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @GetMapping
    public ResponseEntity<List<ResourceBlockResponse>> getResourceBlocks(@PathVariable Long resourceId) {
        return ResponseEntity.ok(resourceBlockService.getCurrentAndUpcomingBlocks(resourceId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{blockId}")
    public ResponseEntity<Void> deleteResourceBlock(@PathVariable Long resourceId, @PathVariable Long blockId) {
        resourceBlockService.deleteResourceBlock(resourceId, blockId);
        return ResponseEntity.noContent().build();
    }
}
