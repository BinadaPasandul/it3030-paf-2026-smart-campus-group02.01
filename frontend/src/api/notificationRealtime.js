const NOTIFICATION_SOCKET_URL = "ws://localhost:8080/ws/notifications";
const RECONNECT_DELAY_MS = 3000;

export function connectToNotificationRealtime({ onNotification, onConnectionChange }) {
  let socket = null;
  let reconnectTimer = null;
  let isDisposed = false;

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const scheduleReconnect = () => {
    if (isDisposed || reconnectTimer) {
      return;
    }

    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, RECONNECT_DELAY_MS);
  };

  const connect = () => {
    if (isDisposed) {
      return;
    }

    socket = new WebSocket(NOTIFICATION_SOCKET_URL);

    socket.onopen = () => {
      onConnectionChange?.(true);
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.event === "notification.created" && payload.notification) {
          onNotification?.(payload.notification);
        }
      } catch (error) {
        console.error("Failed to parse realtime notification payload", error);
      }
    };

    socket.onerror = () => {
      onConnectionChange?.(false);
    };

    socket.onclose = () => {
      onConnectionChange?.(false);
      socket = null;
      scheduleReconnect();
    };
  };

  connect();

  return () => {
    isDisposed = true;
    clearReconnectTimer();
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
  };
}
