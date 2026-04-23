package com.smartcampus.hub.resource.service;

import com.smartcampus.hub.booking.entity.Booking;
import com.smartcampus.hub.booking.repository.BookingRepository;
import com.smartcampus.hub.exception.BookingConflictException;
import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.resource.dto.CreateResourceBlockRequest;
import com.smartcampus.hub.resource.dto.ResourceBlockResponse;
import com.smartcampus.hub.resource.entity.Resource;
import com.smartcampus.hub.resource.entity.ResourceBlock;
import com.smartcampus.hub.resource.entity.ResourceStatus;
import com.smartcampus.hub.resource.repository.ResourceBlockRepository;
import com.smartcampus.hub.resource.repository.ResourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Transactional
public class ResourceBlockServiceImpl implements ResourceBlockService {

    private final ResourceBlockRepository resourceBlockRepository;
    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;

    public ResourceBlockServiceImpl(ResourceBlockRepository resourceBlockRepository,
                                    ResourceRepository resourceRepository,
                                    BookingRepository bookingRepository) {
        this.resourceBlockRepository = resourceBlockRepository;
        this.resourceRepository = resourceRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    public ResourceBlockResponse createResourceBlock(Long resourceId,
                                                     CreateResourceBlockRequest request,
                                                     String createdByEmail) {
        Resource resource = getResourceOrThrow(resourceId);

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new IllegalStateException(
                    "This resource is already permanently out of service. Restore it before scheduling a temporary block."
            );
        }

        validateRequestWindow(request);
        ensureNoApprovedBookingConflict(resourceId, request);

        ResourceBlock block = new ResourceBlock();
        block.setResource(resource);
        block.setBlockDate(request.getBlockDate());
        block.setAllDay(request.isAllDay());
        block.setStartTime(request.isAllDay() ? null : request.getStartTime());
        block.setEndTime(request.isAllDay() ? null : request.getEndTime());
        block.setReason(request.getReason().trim());
        block.setCreatedBy(createdByEmail);

        return mapToResponse(resourceBlockRepository.save(block));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResourceBlockResponse> getCurrentAndUpcomingBlocks(Long resourceId) {
        getResourceOrThrow(resourceId);

        return resourceBlockRepository
                .findCurrentAndUpcomingBlocksByResourceId(resourceId, LocalDate.now(), LocalTime.now())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void deleteResourceBlock(Long resourceId, Long blockId) {
        ResourceBlock block = resourceBlockRepository.findByIdAndResourceId(blockId, resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Scheduled block not found"));

        if (!canDelete(block)) {
            throw new IllegalStateException("Only current or future scheduled blocks can be removed.");
        }

        resourceBlockRepository.delete(block);
    }

    @Override
    public void deleteBlocksForResource(Long resourceId) {
        resourceBlockRepository.deleteByResourceId(resourceId);
    }

    @Override
    @Transactional(readOnly = true)
    public void ensureNoBlockConflict(Long resourceId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        List<ResourceBlock> overlaps = resourceBlockRepository.findOverlappingBlocks(resourceId, date, startTime, endTime);
        if (!overlaps.isEmpty()) {
            ResourceBlock overlap = overlaps.get(0);
            throw new BookingConflictException(
                    "Cannot complete this booking because the resource is scheduled out of service "
                            + formatWindow(overlap) + "."
            );
        }
    }

    private Resource getResourceOrThrow(Long resourceId) {
        return resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + resourceId));
    }

    private void validateRequestWindow(CreateResourceBlockRequest request) {
        if (request.isAllDay()) {
            return;
        }

        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new IllegalArgumentException("Start time and end time are required for a time-based block.");
        }

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Block start time must be before end time.");
        }

        if (LocalDate.now().equals(request.getBlockDate()) && !request.getEndTime().isAfter(LocalTime.now())) {
            throw new IllegalArgumentException("Time-based blocks for today must end in the future.");
        }
    }

    private void ensureNoApprovedBookingConflict(Long resourceId, CreateResourceBlockRequest request) {
        LocalTime startTime = request.isAllDay() ? LocalTime.MIN : request.getStartTime();
        LocalTime endTime = request.isAllDay() ? LocalTime.of(23, 59, 59) : request.getEndTime();

        List<Booking> conflicts = bookingRepository.findApprovedConflictingBookings(
                resourceId,
                request.getBlockDate(),
                startTime,
                endTime,
                null
        );

        if (!conflicts.isEmpty()) {
            Booking conflict = conflicts.get(0);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
            String blockWindow = request.isAllDay()
                    ? request.getBlockDate() + " for the full day"
                    : request.getBlockDate() + " " + request.getStartTime().format(formatter)
                    + "-" + request.getEndTime().format(formatter);

            throw new BookingConflictException(
                    "Cannot mark resource out of service for "
                            + blockWindow
                            + " because there is already an approved booking from "
                            + conflict.getStartTime().format(formatter)
                            + "-"
                            + conflict.getEndTime().format(formatter)
                            + "."
            );
        }
    }

    private ResourceBlockResponse mapToResponse(ResourceBlock block) {
        ResourceBlockResponse response = new ResourceBlockResponse();
        response.setId(block.getId());
        response.setBlockDate(block.getBlockDate());
        response.setAllDay(block.isAllDay());
        response.setStartTime(block.getStartTime());
        response.setEndTime(block.getEndTime());
        response.setReason(block.getReason());
        response.setCreatedBy(block.getCreatedBy());
        response.setActiveNow(block.isActiveAt(LocalDate.now(), LocalTime.now()));
        response.setCanDelete(canDelete(block));
        response.setCreatedAt(block.getCreatedAt());
        response.setUpdatedAt(block.getUpdatedAt());
        return response;
    }

    private boolean canDelete(ResourceBlock block) {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        if (block.getBlockDate().isAfter(today)) {
            return true;
        }

        return block.getBlockDate().isEqual(today)
                && (block.isAllDay() || (block.getEndTime() != null && block.getEndTime().isAfter(now)));
    }

    private String formatWindow(ResourceBlock block) {
        if (block.isAllDay()) {
            return "for " + block.getBlockDate() + " (all day)";
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        return "on " + block.getBlockDate()
                + " from " + block.getStartTime().format(formatter)
                + " to " + block.getEndTime().format(formatter);
    }
}
