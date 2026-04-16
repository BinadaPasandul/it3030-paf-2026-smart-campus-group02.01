package com.smartcampus.hub.resource.dto;

import com.smartcampus.hub.resource.entity.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public class CreateResourceRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Code is required")
    private String code;

    @NotNull(message = "Type is required")
    private ResourceType type;

    @NotNull(message = "Capacity is required")
    @Min(value = 0, message = "Capacity must be 0 or greater")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String description;

    @NotNull(message = "Available from time is required")
    private LocalTime availableFrom;

    @NotNull(message = "Available to time is required")
    private LocalTime availableTo;

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

    public LocalTime getAvailableFrom() {
        return availableFrom;
    }

    public LocalTime getAvailableTo() {
        return availableTo;
    }
}