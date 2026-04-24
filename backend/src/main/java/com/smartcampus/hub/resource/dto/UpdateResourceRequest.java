package com.smartcampus.hub.resource.dto;

import com.smartcampus.hub.resource.entity.EquipmentType;
import com.smartcampus.hub.resource.entity.ResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public class UpdateResourceRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Code is required")
    private String code;

    @NotNull(message = "Type is required")
    private ResourceType type;

    private Integer capacity;

    private EquipmentType equipmentType;

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

    public EquipmentType getEquipmentType() {
        return equipmentType;
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
