package com.smartcampus.hub.notification.realtime;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class NotificationWebSocketSessionRegistry {

    private final ConcurrentHashMap<String, Set<WebSocketSession>> sessionsByUserEmail = new ConcurrentHashMap<>();

    public void register(String userEmail, WebSocketSession session) {
        sessionsByUserEmail
                .computeIfAbsent(userEmail, ignored -> ConcurrentHashMap.newKeySet())
                .add(session);
    }

    public void unregister(String userEmail, WebSocketSession session) {
        Set<WebSocketSession> sessions = sessionsByUserEmail.get(userEmail);
        if (sessions == null) {
            return;
        }

        sessions.remove(session);
        if (sessions.isEmpty()) {
            sessionsByUserEmail.remove(userEmail);
        }
    }

    public Set<WebSocketSession> getSessions(String userEmail) {
        return sessionsByUserEmail.getOrDefault(userEmail, Set.of());
    }

    public void unregisterClosedSession(String userEmail, WebSocketSession session) {
        unregister(userEmail, session);
        if (session.isOpen()) {
            try {
                session.close();
            } catch (IOException ignored) {
                // Best effort cleanup for stale sockets.
            }
        }
    }
}
