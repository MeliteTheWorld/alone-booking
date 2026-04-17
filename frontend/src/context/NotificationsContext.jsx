import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { api, getNotificationsWsUrl } from "../api/client.js";
import { useAuth } from "./AuthContext.jsx";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { isAuthenticated, token } = useAuth();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const refresh = useCallback(
    async ({ silent = false } = {}) => {
      if (!isAuthenticated) {
        setItems([]);
        setUnreadCount(0);
        return;
      }

      if (!silent) {
        setLoading(true);
      }

      try {
        const payload = await api.notifications.getAll();
        setItems(payload.items || []);
        setUnreadCount(payload.unread_count || 0);
      } catch (error) {
        if (!silent) {
          setItems([]);
          setUnreadCount(0);
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    refresh();
  }, [isAuthenticated, refresh]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      socketRef.current?.close();
      socketRef.current = null;
      return;
    }

    let cancelled = false;

    const connect = () => {
      if (cancelled) {
        return;
      }

      const socket = new WebSocket(getNotificationsWsUrl(token));
      socketRef.current = socket;

      socket.addEventListener("open", () => {
        refresh({ silent: true });
      });

      socket.addEventListener("message", (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "notification.created" && data.payload) {
            let shouldIncrementUnread = false;

            setItems((currentItems) => {
              const exists = currentItems.some((item) => item.id === data.payload.id);

              if (exists) {
                return currentItems;
              }

              shouldIncrementUnread = !data.payload.is_read;
              return [data.payload, ...currentItems].slice(0, 25);
            });

            setUnreadCount((currentCount) =>
              shouldIncrementUnread ? currentCount + 1 : currentCount
            );
            return;
          }

          if (data.type === "notification.read" && data.payload) {
            let wasUnread = false;

            setItems((currentItems) =>
              currentItems.map((item) => {
                if (item.id !== data.payload.id) {
                  return item;
                }

                wasUnread = !item.is_read;
                return {
                  ...item,
                  is_read: true,
                  read_at: data.payload.read_at
                };
              })
            );

            setUnreadCount((currentCount) =>
              wasUnread ? Math.max(0, currentCount - 1) : currentCount
            );
            return;
          }

          if (data.type === "notifications.read_all" && data.payload) {
            setItems((currentItems) =>
              currentItems.map((item) => ({
                ...item,
                is_read: true,
                read_at: item.read_at || data.payload.read_at
              }))
            );
            setUnreadCount(0);
          }
        } catch (error) {
          console.error("Notifications websocket message failed:", error);
        }
      });

      socket.addEventListener("close", () => {
        if (cancelled) {
          return;
        }

        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, 2000);
      });

      socket.addEventListener("error", () => {
        socket.close();
      });
    };

    connect();

    return () => {
      cancelled = true;

      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [isAuthenticated, token, refresh]);

  const markAsRead = useCallback(async (notificationId) => {
    await api.notifications.markRead(notificationId);

    let wasUnread = false;

    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== notificationId) {
          return item;
        }

        wasUnread = !item.is_read;
        return { ...item, is_read: true };
      })
    );

    setUnreadCount((currentCount) =>
      wasUnread ? Math.max(0, currentCount - 1) : currentCount
    );
  }, []);

  const markAllAsRead = useCallback(async () => {
    await api.notifications.markAllRead();
    setItems((currentItems) =>
      currentItems.map((item) => ({
        ...item,
        is_read: true
      }))
    );
    setUnreadCount(0);
  }, []);

  const value = useMemo(
    () => ({
      items,
      unreadCount,
      loading,
      refresh,
      markAsRead,
      markAllAsRead
    }),
    [items, unreadCount, loading, refresh, markAsRead, markAllAsRead]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
