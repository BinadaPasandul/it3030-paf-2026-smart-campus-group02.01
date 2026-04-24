package com.smartcampus.hub.config;

import com.smartcampus.hub.notification.realtime.AuthenticatedNotificationWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

@Configuration
@EnableWebSocket
public class NotificationWebSocketConfig implements WebSocketConfigurer {

    private static final String FRONTEND_BASE_URL = "http://localhost:3000";

    private final AuthenticatedNotificationWebSocketHandler notificationWebSocketHandler;

    public NotificationWebSocketConfig(AuthenticatedNotificationWebSocketHandler notificationWebSocketHandler) {
        this.notificationWebSocketHandler = notificationWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(notificationWebSocketHandler, "/ws/notifications")
                .addInterceptors(new HttpSessionHandshakeInterceptor())
                .setAllowedOrigins(FRONTEND_BASE_URL);
    }
}
