package com.smartcampus.hub.resource.dto;

import com.smartcampus.hub.resource.entity.EquipmentType;
import com.smartcampus.hub.resource.entity.ResourceStatus;
import com.smartcampus.hub.resource.entity.ResourceType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public class ResourceResponse {

    private Long id;
    private String name;
    private String code;
    private ResourceType type;
    private EquipmentType equipmentType;
    private Integer capacity;
    private String location;
    private String description;
    private ResourceStatus status;
    private ResourceStatus baseStatus;
    private boolean currentlyBlocked;
    private boolean permanentlyUnavailable;
    private String currentBlockReason;
    private int scheduledBlockCount;
    private ResourceBlockResponse nextScheduledBlock;
    private List<ResourceBlockResponse> scheduledBlocks;
    private LocalDate selectedDate;
    private Boolean availableOnSelectedDate;
    private boolean blockedAllDayOnSelectedDate;
    private String selectedDateAvailabilityMessage;
    private List<ResourceBlockResponse> selectedDateBlocks;
    private List<ResourceBookingSlotResponse> selectedDateBookings;
    private List<LocalDate> bookedDates;
    private LocalTime availableFrom;
    private LocalTime availableTo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ResourceResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public ResourceType getType() {
        return type;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    public EquipmentType getEquipmentType() {
        return equipmentType;
    }

    public void setEquipmentType(EquipmentType equipmentType) {
        this.equipmentType = equipmentType;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }

    public ResourceStatus getBaseStatus() {
        return baseStatus;
    }

    public void setBaseStatus(ResourceStatus baseStatus) {
        this.baseStatus = baseStatus;
    }

    public boolean isCurrentlyBlocked() {
        return currentlyBlocked;
    }

    public void setCurrentlyBlocked(boolean currentlyBlocked) {
        this.currentlyBlocked = currentlyBlocked;
    }

    public boolean isPermanentlyUnavailable() {
        return permanentlyUnavailable;
    }

    public void setPermanentlyUnavailable(boolean permanentlyUnavailable) {
        this.permanentlyUnavailable = permanentlyUnavailable;
    }

    public String getCurrentBlockReason() {
        return currentBlockReason;
    }

    public void setCurrentBlockReason(String currentBlockReason) {
        this.currentBlockReason = currentBlockReason;
    }

    public int getScheduledBlockCount() {
        return scheduledBlockCount;
    }

    public void setScheduledBlockCount(int scheduledBlockCount) {
        this.scheduledBlockCount = scheduledBlockCount;
    }

    public ResourceBlockResponse getNextScheduledBlock() {
        return nextScheduledBlock;
    }

    public void setNextScheduledBlock(ResourceBlockResponse nextScheduledBlock) {
        this.nextScheduledBlock = nextScheduledBlock;
    }

    public List<ResourceBlockResponse> getScheduledBlocks() {
        return scheduledBlocks;
    }

    public void setScheduledBlocks(List<ResourceBlockResponse> scheduledBlocks) {
        this.scheduledBlocks = scheduledBlocks;
    }

    public LocalDate getSelectedDate() {
        return selectedDate;
    }

    public void setSelectedDate(LocalDate selectedDate) {
        this.selectedDate = selectedDate;
    }

    public Boolean getAvailableOnSelectedDate() {
        return availableOnSelectedDate;
    }

    public void setAvailableOnSelectedDate(Boolean availableOnSelectedDate) {
        this.availableOnSelectedDate = availableOnSelectedDate;
    }

    public boolean isBlockedAllDayOnSelectedDate() {
        return blockedAllDayOnSelectedDate;
    }

    public void setBlockedAllDayOnSelectedDate(boolean blockedAllDayOnSelectedDate) {
        this.blockedAllDayOnSelectedDate = blockedAllDayOnSelectedDate;
    }

    public String getSelectedDateAvailabilityMessage() {
        return selectedDateAvailabilityMessage;
    }

    public void setSelectedDateAvailabilityMessage(String selectedDateAvailabilityMessage) {
        this.selectedDateAvailabilityMessage = selectedDateAvailabilityMessage;
    }

    public List<ResourceBlockResponse> getSelectedDateBlocks() {
        return selectedDateBlocks;
    }

    public void setSelectedDateBlocks(List<ResourceBlockResponse> selectedDateBlocks) {
        this.selectedDateBlocks = selectedDateBlocks;
    }

    public List<ResourceBookingSlotResponse> getSelectedDateBookings() {
        return selectedDateBookings;
    }

    public void setSelectedDateBookings(List<ResourceBookingSlotResponse> selectedDateBookings) {
        this.selectedDateBookings = selectedDateBookings;
    }

    public List<LocalDate> getBookedDates() {
        return bookedDates;
    }

    public void setBookedDates(List<LocalDate> bookedDates) {
        this.bookedDates = bookedDates;
    }

    public LocalTime getAvailableFrom() {
        return availableFrom;
    }

    public void setAvailableFrom(LocalTime availableFrom) {
        this.availableFrom = availableFrom;
    }

    public LocalTime getAvailableTo() {
        return availableTo;
    }

    public void setAvailableTo(LocalTime availableTo) {
        this.availableTo = availableTo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
