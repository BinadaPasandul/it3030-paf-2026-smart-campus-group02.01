package com.smartcampus.hub.booking.dto;

import com.smartcampus.hub.booking.entity.BookingStatus;
import jakarta.validation.constraints.NotNull;

public class BookingReviewDTO {

    @NotNull(message = "Status is required")
    private BookingStatus status;

    private String reason;

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
