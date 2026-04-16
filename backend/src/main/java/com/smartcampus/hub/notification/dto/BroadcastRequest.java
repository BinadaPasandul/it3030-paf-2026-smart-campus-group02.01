package com.smartcampus.hub.notification.dto;

import com.smartcampus.hub.notification.entity.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request body for the admin broadcast endpoint:
 * {@code POST /api/admin/notifications/broadcast}
 *
 * <p>Broadcasts a system-level notification to every active user.
 */
public class BroadcastRequest {

    @NotBlank(message = "Message must not be blank")
    private String message;

    @NotNull(message = "Type must not be null")
    private NotificationType type;

    /** Optional: LOW / NORMAL / HIGH — defaults to HIGH for broadcasts. */
    private String priority = "HIGH";

    // ── Constructors ───────────────────────────────────────────────────────

    public BroadcastRequest() {
    }

    // ── Getters & Setters ──────────────────────────────────────────────────

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}
