const userConnections = new Map();

function send(socket, payload) {
  if (socket.readyState !== 1) {
    return;
  }

  socket.send(JSON.stringify(payload));
}

export function registerNotificationConnection(userId, socket) {
  const key = String(userId);
  const currentConnections = userConnections.get(key) || new Set();
  currentConnections.add(socket);
  userConnections.set(key, currentConnections);

  socket.on("close", () => {
    unregisterNotificationConnection(userId, socket);
  });
}

export function unregisterNotificationConnection(userId, socket) {
  const key = String(userId);
  const currentConnections = userConnections.get(key);

  if (!currentConnections) {
    return;
  }

  currentConnections.delete(socket);

  if (!currentConnections.size) {
    userConnections.delete(key);
  }
}

export function broadcastNotificationsCreated(notifications) {
  for (const notification of notifications) {
    const connections = userConnections.get(String(notification.user_id));

    if (!connections?.size) {
      continue;
    }

    for (const socket of connections) {
      send(socket, {
        type: "notification.created",
        payload: notification
      });
    }
  }
}

export function broadcastNotificationRead(userId, notificationId, readAt) {
  const connections = userConnections.get(String(userId));

  if (!connections?.size) {
    return;
  }

  for (const socket of connections) {
    send(socket, {
      type: "notification.read",
      payload: {
        id: Number(notificationId),
        read_at: readAt
      }
    });
  }
}

export function broadcastNotificationsReadAll(userId, readAt) {
  const connections = userConnections.get(String(userId));

  if (!connections?.size) {
    return;
  }

  for (const socket of connections) {
    send(socket, {
      type: "notifications.read_all",
      payload: {
        read_at: readAt
      }
    });
  }
}
