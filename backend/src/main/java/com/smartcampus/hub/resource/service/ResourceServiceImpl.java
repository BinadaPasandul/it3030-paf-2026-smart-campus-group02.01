package com.smartcampus.hub.resource.service;

import com.smartcampus.hub.booking.repository.BookingRepository;
import com.smartcampus.hub.exception.DuplicateEntityException;
import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.exception.ResourceInUseException;
import com.smartcampus.hub.resource.dto.CreateResourceRequest;
import com.smartcampus.hub.resource.dto.ResourceResponse;
import com.smartcampus.hub.resource.dto.UpdateResourceRequest;
import com.smartcampus.hub.resource.entity.Resource;
import com.smartcampus.hub.resource.entity.ResourceStatus;
import com.smartcampus.hub.resource.entity.ResourceType;
import com.smartcampus.hub.resource.repository.ResourceRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;

    public ResourceServiceImpl(ResourceRepository resourceRepository, BookingRepository bookingRepository) {
        this.resourceRepository = resourceRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    public ResourceResponse createResource(CreateResourceRequest request) {
        validateAvailabilityWindow(request.getAvailableFrom(), request.getAvailableTo());

        if (resourceRepository.existsByCode(request.getCode())) {
            throw new DuplicateEntityException("Resource code already exists");
        }

        Resource resource = new Resource();
        resource.setName(request.getName());
        resource.setCode(request.getCode());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setDescription(request.getDescription());
        resource.setAvailableFrom(request.getAvailableFrom());
        resource.setAvailableTo(request.getAvailableTo());
        resource.setStatus(ResourceStatus.ACTIVE);

        return mapToResponse(resourceRepository.save(resource));
    }

    @Override
    public List<ResourceResponse> getAllResources(
            ResourceType type,
            String location,
            Integer minCapacity,
            ResourceStatus status
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

        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }

        return resourceRepository.findAll(spec)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ResourceResponse getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        return mapToResponse(resource);
    }

    @Override
    public ResourceResponse updateResource(Long id, UpdateResourceRequest request) {
        validateAvailabilityWindow(request.getAvailableFrom(), request.getAvailableTo());

        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        if (resourceRepository.existsByCodeAndIdNot(request.getCode(), id)) {
            throw new DuplicateEntityException("Resource code already exists");
        }

        resource.setName(request.getName());
        resource.setCode(request.getCode());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setDescription(request.getDescription());
        resource.setAvailableFrom(request.getAvailableFrom());
        resource.setAvailableTo(request.getAvailableTo());

        return mapToResponse(resourceRepository.save(resource));
    }

    @Override
    public ResourceResponse updateResourceStatus(Long id, ResourceStatus status) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        resource.setStatus(status);

        return mapToResponse(resourceRepository.save(resource));
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

    private ResourceResponse mapToResponse(Resource resource) {
        return new ResourceResponse(
                resource.getId(),
                resource.getName(),
                resource.getCode(),
                resource.getType(),
                resource.getCapacity(),
                resource.getLocation(),
                resource.getDescription(),
                resource.getStatus(),
                resource.getAvailableFrom(),
                resource.getAvailableTo(),
                resource.getCreatedAt(),
                resource.getUpdatedAt()
        );
    }
}
