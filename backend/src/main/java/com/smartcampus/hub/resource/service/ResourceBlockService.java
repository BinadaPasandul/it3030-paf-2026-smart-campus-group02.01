package com.smartcampus.hub.resource.service;

import com.smartcampus.hub.resource.dto.CreateResourceBlockRequest;
import com.smartcampus.hub.resource.dto.ResourceBlockResponse;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ResourceBlockService {

    ResourceBlockResponse createResourceBlock(Long resourceId, CreateResourceBlockRequest request, String createdByEmail);

    List<ResourceBlockResponse> getCurrentAndUpcomingBlocks(Long resourceId);

    List<ResourceBlockResponse> getBlocksForDate(Long resourceId, LocalDate date);

    void deleteResourceBlock(Long resourceId, Long blockId);

    void deleteBlocksForResource(Long resourceId);

    void ensureNoBlockConflict(Long resourceId, LocalDate date, LocalTime startTime, LocalTime endTime);
}
