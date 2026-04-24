package com.smartcampus.hub.notification.realtime;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.hub.notification.dto.NotificationResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

@Component
public class WebSocketNotificationRealtimeGateway implements NotificationRealtimeGateway {

    private static final String NOTIFICATION_CREATED_EVENT = "notification.created";

    private final NotificationWebSocketSessionRegistry sessionRegistry;
    private final ObjectMapper objectMapper;

    public WebSocketNotificationRealtimeGateway(NotificationWebSocketSessionRegistry sessionRegistry,
                                                ObjectMapper objectMapper) {
        this.sessionRegistry = sessionRegistry;
        this.objectMapper = objectMapper;
    }

    @Override
    public void publishToUser(String userEmail, NotificationResponse notification) {
        String payload = serialize(notification);

        for (WebSocketSession session : sessionRegistry.getSessions(userEmail)) {
            if (!session.isOpen()) {
                sessionRegistry.unregisterClosedSession(userEmail, session);
                continue;
            }

            try {
                synchronized (session) {
                    session.sendMessage(new TextMessage(payload));
                }
            } catch (Exception ex) {
                sessionRegistry.unregisterClosedSession(userEmail, session);
            }
        }
    }

    private String serialize(NotificationResponse notification) {
        try {
            return objectMapper.writeValueAsString(
                    new NotificationRealtimeEnvelope(NOTIFICATION_CREATED_EVENT, notification)
            );
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Failed to serialize realtime notification payload", ex);
        }
    }
}
