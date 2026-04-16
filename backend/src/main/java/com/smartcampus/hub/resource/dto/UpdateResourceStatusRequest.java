package com.smartcampus.hub.resource.dto;

import com.smartcampus.hub.resource.entity.ResourceStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateResourceStatusRequest {

    @NotNull(message = "Status is required")
    private ResourceStatus status;

    public ResourceStatus getStatus() {
        return status;
    }
}