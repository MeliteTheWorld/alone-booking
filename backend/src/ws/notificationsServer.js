import { WebSocketServer } from "ws";
import { verifyToken } from "../middleware/auth.js";
import { registerNotificationConnection } from "./notificationHub.js";

export function setupNotificationWebSocket(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws/notifications"
  });

  wss.on("connection", (socket, request) => {
    try {
      const requestUrl = new URL(request.url, "http://localhost");
      const token = requestUrl.searchParams.get("token");

      if (!token) {
        socket.close(1008, "Missing token");
        return;
      }

      const user = verifyToken(token);
      registerNotificationConnection(user.id, socket);

      socket.send(
        JSON.stringify({
          type: "notifications.connected",
          payload: {
            user_id: user.id
          }
        })
      );
    } catch (error) {
      socket.close(1008, "Unauthorized");
    }
  });

  return wss;
}
