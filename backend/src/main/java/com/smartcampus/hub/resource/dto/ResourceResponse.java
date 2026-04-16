package com.smartcampus.hub.resource.dto;

import com.smartcampus.hub.resource.entity.ResourceStatus;
import com.smartcampus.hub.resource.entity.ResourceType;

import java.time.LocalDateTime;
import java.time.LocalTime;

public class ResourceResponse {

    private Long id;
    private String name;
    private String code;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private String description;
    private ResourceStatus status;
    private LocalTime availableFrom;
    private LocalTime availableTo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ResourceResponse(
            Long id,
            String name,
            String code,
            ResourceType type,
            Integer capacity,
            String location,
            String description,
            ResourceStatus status,
            LocalTime availableFrom,
            LocalTime availableTo,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.description = description;
        this.status = status;
        this.availableFrom = availableFrom;
        this.availableTo = availableTo;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCode() {
        return code;
    }

    public ResourceType getType() {
        return type;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public String getLocation() {
        return location;
    }

    public String getDescription() {
        return description;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public LocalTime getAvailableFrom() {
        return availableFrom;
    }

    public LocalTime getAvailableTo() {
        return availableTo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}