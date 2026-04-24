package com.smartcampus.hub.resource.service;

import com.smartcampus.hub.booking.entity.Booking;
import com.smartcampus.hub.booking.entity.BookingStatus;
import com.smartcampus.hub.booking.repository.BookingRepository;
import com.smartcampus.hub.exception.DuplicateEntityException;
import com.smartcampus.hub.exception.ResourceInUseException;
import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.resource.dto.ResourceBookingSlotResponse;
import com.smartcampus.hub.resource.dto.CreateResourceRequest;
import com.smartcampus.hub.resource.dto.ResourceBlockResponse;
import com.smartcampus.hub.resource.dto.ResourceResponse;
import com.smartcampus.hub.resource.dto.UpdateResourceRequest;
import com.smartcampus.hub.resource.entity.EquipmentType;
import com.smartcampus.hub.resource.entity.Resource;
import com.smartcampus.hub.resource.entity.ResourceStatus;
import com.smartcampus.hub.resource.entity.ResourceType;
import com.smartcampus.hub.resource.repository.ResourceRepository;
import com.smartcampus.hub.resource.validation.CampusBuildingCodeRule;
import com.smartcampus.hub.resource.validation.SportsEntertainmentVenue;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Transactional
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final ResourceBlockService resourceBlockService;

    public ResourceServiceImpl(ResourceRepository resourceRepository,
                               BookingRepository bookingRepository,
                               ResourceBlockService resourceBlockService) {
        this.resourceRepository = resourceRepository;
        this.bookingRepository = bookingRepository;
        this.resourceBlockService = resourceBlockService;
    }

    @Override
    public ResourceResponse createResource(CreateResourceRequest request) {
        String normalizedCode = CampusBuildingCodeRule.normalize(request.getCode());
        String normalizedLocation = CampusBuildingCodeRule.normalize(request.getLocation());

        validateAvailabilityWindow(request.getAvailableFrom(), request.getAvailableTo());
        validateResourceAttributes(
                normalizedCode,
                normalizedLocation,
                request.getType(),
                request.getEquipmentType(),
                request.getCapacity()
        );

        if (resourceRepository.existsByCode(normalizedCode)) {
            throw new DuplicateEntityException("Resource code already exists");
        }

        Resource resource = new Resource();
        resource.setName(request.getName());
        resource.setCode(normalizedCode);
        resource.setType(request.getType());
        resource.setEquipmentType(resolveEquipmentType(request.getType(), request.getEquipmentType()));
        resource.setCapacity(request.getCapacity());
        resource.setLocation(normalizedLocation);
        resource.setDescription(request.getDescription());
        resource.setAvailableFrom(request.getAvailableFrom());
        resource.setAvailableTo(request.getAvailableTo());
        resource.setStatus(ResourceStatus.ACTIVE);

        return mapToResponse(resourceRepository.save(resource), true, null);
    }

    @Override
    public List<ResourceResponse> getAllResources(
            ResourceType type,
            String location,
            Integer minCapacity,
            ResourceStatus status,
            LocalDate selectedDate
    ) {
        Specification<Resource> spec = Specification.where(null);

        if (type != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("type"), type));
        }

        if (location != null && !location.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%"));
        }

        if (minCapacity != null) {
            spec = spec.and((root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("capacity"), minCapacity));
        }

        return resourceRepository.findAll(spec)
                .stream()
                .map(resource -> mapToResponse(resource, false, selectedDate))
                .filter(resource -> status == null || resource.getStatus() == status)
                .filter(resource -> selectedDate == null || Boolean.TRUE.equals(resource.getAvailableOnSelectedDate()))
                .toList();
    }

    @Override
    public ResourceResponse getResourceById(Long id, LocalDate selectedDate) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        return mapToResponse(resource, true, selectedDate);
    }

    @Override
    public ResourceResponse updateResource(Long id, UpdateResourceRequest request) {
        String normalizedCode = CampusBuildingCodeRule.normalize(request.getCode());
        String normalizedLocation = CampusBuildingCodeRule.normalize(request.getLocation());

        validateAvailabilityWindow(request.getAvailableFrom(), request.getAvailableTo());
        validateResourceAttributes(
                normalizedCode,
                normalizedLocation,
                request.getType(),
                request.getEquipmentType(),
                request.getCapacity()
        );

        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        if (resourceRepository.existsByCodeAndIdNot(normalizedCode, id)) {
            throw new DuplicateEntityException("Resource code already exists");
        }

        resource.setName(request.getName());
        resource.setCode(normalizedCode);
        resource.setType(request.getType());
        resource.setEquipmentType(resolveEquipmentType(request.getType(), request.getEquipmentType()));
        resource.setCapacity(request.getCapacity());
        resource.setLocation(normalizedLocation);
        resource.setDescription(request.getDescription());
        resource.setAvailableFrom(request.getAvailableFrom());
        resource.setAvailableTo(request.getAvailableTo());

        return mapToResponse(resourceRepository.save(resource), true, null);
    }

    @Override
    public ResourceResponse updateResourceStatus(Long id, ResourceStatus status) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        resource.setStatus(status);

        return mapToResponse(resourceRepository.save(resource), true, null);
    }

    @Override
    public void deleteResource(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        if (bookingRepository.existsByResourceId(id)) {
            throw new ResourceInUseException(
                    "This resource cannot be deleted because it is linked to existing bookings. Mark it as OUT_OF_SERVICE instead."
            );
        }

        resourceBlockService.deleteBlocksForResource(id);
        resourceRepository.delete(resource);
    }

    private void validateAvailabilityWindow(java.time.LocalTime from, java.time.LocalTime to) {
        if (from == null || to == null) {
            return;
        }

        if (!from.isBefore(to)) {
            throw new IllegalArgumentException("Available from time must be before available to time");
        }
    }

    private void validateResourceAttributes(String code,
                                            String location,
                                            ResourceType type,
                                            EquipmentType equipmentType,
                                            Integer capacity) {
        if (type == ResourceType.EQUIPMENT) {
            if (equipmentType == null) {
                throw new IllegalArgumentException("Equipment type is required for EQUIPMENT resources.");
            }

            if (capacity != null && capacity < 0) {
                throw new IllegalArgumentException("Capacity must be 0 or greater.");
            }
            return;
        }

        if (equipmentType != null) {
            throw new IllegalArgumentException("Equipment type can only be used when the resource type is EQUIPMENT.");
        }

        if (capacity == null) {
            throw new IllegalArgumentException("Capacity is required for this resource type.");
        }

        if (capacity < 0) {
            throw new IllegalArgumentException("Capacity must be 0 or greater.");
        }

        if (type == ResourceType.SPORTS_ENTERTAINMENT) {
            if (!SportsEntertainmentVenue.isValidLocation(location)) {
                throw new IllegalArgumentException(
                        "SPORTS_ENTERTAINMENT resources must use one of these venues: "
                                + String.join(", ", SportsEntertainmentVenue.getAllowedLocations())
                                + "."
                );
            }
            return;
        }

        validateBuildingCodeRule(code, location, type);
    }

    private void validateBuildingCodeRule(String code, String location, ResourceType type) {
        if (type != ResourceType.LAB && type != ResourceType.LECTURE_HALL) {
            return;
        }

        CampusBuildingCodeRule rule = CampusBuildingCodeRule.findMatchingRule(code)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid resource code "
                                + code
                                + ". For LAB and LECTURE_HALL resources, use a code starting with "
                                + CampusBuildingCodeRule.getSupportedPrefixes()
                                + "."
                ));

        if (!rule.matchesLocation(location)) {
            throw new IllegalArgumentException(
                    "Location does not match the expected building for code "
                            + code
                            + ". Expected: "
                            + rule.getBuildingName()
                            + "."
            );
        }
    }

    private EquipmentType resolveEquipmentType(ResourceType type, EquipmentType equipmentType) {
        return type == ResourceType.EQUIPMENT ? equipmentType : null;
    }

    private ResourceResponse mapToResponse(Resource resource, boolean includeBlocks, LocalDate selectedDate) {
        List<ResourceBlockResponse> blocks = resourceBlockService.getCurrentAndUpcomingBlocks(resource.getId());
        ResourceBlockResponse currentBlock = blocks.stream()
                .filter(ResourceBlockResponse::isActiveNow)
                .findFirst()
                .orElse(null);

        ResourceStatus effectiveStatus = resource.getStatus() != ResourceStatus.ACTIVE || currentBlock != null
                ? ResourceStatus.OUT_OF_SERVICE
                : ResourceStatus.ACTIVE;

        ResourceResponse response = new ResourceResponse();
        response.setId(resource.getId());
        response.setName(resource.getName());
        response.setCode(resource.getCode());
        response.setType(resource.getType());
        response.setEquipmentType(resource.getEquipmentType());
        response.setCapacity(resource.getCapacity());
        response.setLocation(resource.getLocation());
        response.setDescription(resource.getDescription());
        response.setStatus(effectiveStatus);
        response.setBaseStatus(resource.getStatus());
        response.setCurrentlyBlocked(currentBlock != null);
        response.setPermanentlyUnavailable(resource.getStatus() != ResourceStatus.ACTIVE);
        response.setCurrentBlockReason(currentBlock != null ? currentBlock.getReason() : null);
        response.setScheduledBlockCount(blocks.size());
        response.setNextScheduledBlock(blocks.isEmpty() ? null : blocks.get(0));
        response.setScheduledBlocks(includeBlocks ? blocks : List.of());
        response.setSelectedDateBookings(List.of());
        response.setBookedDates(includeBlocks
                ? bookingRepository.findAllApprovedBookedDatesByResourceId(resource.getId())
                : List.of());
        applySelectedDateAvailability(response, resource, selectedDate);
        response.setAvailableFrom(resource.getAvailableFrom());
        response.setAvailableTo(resource.getAvailableTo());
        response.setCreatedAt(resource.getCreatedAt());
        response.setUpdatedAt(resource.getUpdatedAt());
        return response;
    }

    // Catalogue discovery stays intentionally date-level: resources remain discoverable on a selected date
    // unless they are permanently unavailable or blocked for that full day.
    private void applySelectedDateAvailability(ResourceResponse response, Resource resource, LocalDate selectedDate) {
        if (selectedDate == null) {
            response.setSelectedDateBlocks(List.of());
            response.setSelectedDateBookings(List.of());
            return;
        }

        List<ResourceBlockResponse> selectedDateBlocks = resourceBlockService.getBlocksForDate(resource.getId(), selectedDate);
        List<ResourceBookingSlotResponse> selectedDateBookings = bookingRepository
                .findByResourceIdAndBookingDateAndStatusOrderByStartTimeAsc(
                        resource.getId(),
                        selectedDate,
                        BookingStatus.APPROVED
                )
                .stream()
                .map(this::mapToSelectedDateBooking)
                .toList();
        boolean blockedAllDay = selectedDateBlocks.stream().anyMatch(ResourceBlockResponse::isAllDay);
        boolean availableOnSelectedDate = resource.getStatus() == ResourceStatus.ACTIVE && !blockedAllDay;

        response.setSelectedDate(selectedDate);
        response.setAvailableOnSelectedDate(availableOnSelectedDate);
        response.setBlockedAllDayOnSelectedDate(blockedAllDay);
        response.setSelectedDateBlocks(selectedDateBlocks);
        response.setSelectedDateBookings(selectedDateBookings);
        response.setSelectedDateAvailabilityMessage(
                buildSelectedDateAvailabilityMessage(resource, selectedDate, blockedAllDay, selectedDateBlocks)
        );
    }

    private ResourceBookingSlotResponse mapToSelectedDateBooking(Booking booking) {
        ResourceBookingSlotResponse response = new ResourceBookingSlotResponse();
        response.setId(booking.getId());
        response.setBookingDate(booking.getBookingDate());
        response.setStartTime(booking.getStartTime());
        response.setEndTime(booking.getEndTime());
        response.setPurpose(booking.getPurpose());
        return response;
    }

    private String buildSelectedDateAvailabilityMessage(Resource resource,
                                                        LocalDate selectedDate,
                                                        boolean blockedAllDay,
                                                        List<ResourceBlockResponse> selectedDateBlocks) {
        String formattedDate = selectedDate.format(DateTimeFormatter.ofPattern("MMM d, yyyy"));

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            return "Unavailable on " + formattedDate + " because this resource is permanently out of service.";
        }

        if (blockedAllDay) {
            return "Unavailable on " + formattedDate + " because it is blocked all day.";
        }

        if (!selectedDateBlocks.isEmpty()) {
            return "Available on " + formattedDate + ", but some blocked time windows still apply.";
        }

        return "Available on " + formattedDate + ".";
    }
}
