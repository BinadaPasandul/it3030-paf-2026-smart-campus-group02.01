package com.smartcampus.hub.notification.realtime;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.security.Principal;

@Component
public class AuthenticatedNotificationWebSocketHandler extends TextWebSocketHandler {

    private final NotificationWebSocketSessionRegistry sessionRegistry;

    public AuthenticatedNotificationWebSocketHandler(NotificationWebSocketSessionRegistry sessionRegistry) {
        this.sessionRegistry = sessionRegistry;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Principal principal = session.getPrincipal();
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Authentication is required"));
            return;
        }

        sessionRegistry.register(principal.getName(), session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Principal principal = session.getPrincipal();
        if (principal != null && principal.getName() != null) {
            sessionRegistry.unregister(principal.getName(), session);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        // The server is push-only for notifications.
    }
}
