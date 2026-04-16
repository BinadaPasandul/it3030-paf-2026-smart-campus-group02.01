package com.smartcampus.hub.resource.service;

import com.smartcampus.hub.resource.dto.CreateResourceRequest;
import com.smartcampus.hub.resource.dto.ResourceResponse;
import com.smartcampus.hub.resource.dto.UpdateResourceRequest;
import com.smartcampus.hub.resource.entity.ResourceStatus;
import com.smartcampus.hub.resource.entity.ResourceType;

import java.util.List;

public interface ResourceService {

    ResourceResponse createResource(CreateResourceRequest request);

    List<ResourceResponse> getAllResources(
            ResourceType type,
            String location,
            Integer minCapacity,
            ResourceStatus status
    );

    ResourceResponse getResourceById(Long id);

    ResourceResponse updateResource(Long id, UpdateResourceRequest request);

    ResourceResponse updateResourceStatus(Long id, ResourceStatus status);

    void deleteResource(Long id);
}