package com.smartcampus.hub.notification.realtime;

import com.smartcampus.hub.notification.dto.NotificationResponse;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Component
public class NotificationRealtimePublisher {

    private final NotificationRealtimeGateway notificationRealtimeGateway;

    public NotificationRealtimePublisher(NotificationRealtimeGateway notificationRealtimeGateway) {
        this.notificationRealtimeGateway = notificationRealtimeGateway;
    }

    public void publishAfterCommit(String userEmail, NotificationResponse notification) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            notificationRealtimeGateway.publishToUser(userEmail, notification);
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                notificationRealtimeGateway.publishToUser(userEmail, notification);
            }
        });
    }
}
