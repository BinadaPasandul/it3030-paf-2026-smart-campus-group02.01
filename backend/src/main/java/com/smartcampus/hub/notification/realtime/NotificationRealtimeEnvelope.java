package com.smartcampus.hub.notification.realtime;

import com.smartcampus.hub.notification.dto.NotificationResponse;

public class NotificationRealtimeEnvelope {

    private final String event;
    private final NotificationResponse notification;

    public NotificationRealtimeEnvelope(String event, NotificationResponse notification) {
        this.event = event;
        this.notification = notification;
    }

    public String getEvent() {
        return event;
    }

    public NotificationResponse getNotification() {
        return notification;
    }
}
