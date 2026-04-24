package com.smartcampus.hub.notification.realtime;

import com.smartcampus.hub.notification.dto.NotificationResponse;

public interface NotificationRealtimeGateway {

    void publishToUser(String userEmail, NotificationResponse notification);
}
