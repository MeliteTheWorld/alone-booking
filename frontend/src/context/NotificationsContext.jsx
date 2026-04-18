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
const WS_DISABLE_COOLDOWN_MS = 5 * 60 * 1000;

function getWsDisabledUntil() {
  if (typeof window === "undefined") {
    return 0;
  }

  return Number.parseInt(
    window.sessionStorage.getItem("notifications-ws-disabled-until") ?? "0",
    10
  );
}

function disableWsTemporarily() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    "notifications-ws-disabled-until",
    String(Date.now() + WS_DISABLE_COOLDOWN_MS)
  );
}

function clearWsDisableFlag() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem("notifications-ws-disabled-until");
}

export function NotificationsProvider({ children }) {
  const { isAuthenticated, token } = useAuth();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const itemsRef = useRef([]);
  const audioMapRef = useRef({});
  const lastPlayedAtRef = useRef(0);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const wsFallbackRef = useRef(false);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const successAudio = new Audio("/sounds/success.mp3");
    const adminBookingAudio = new Audio("/sounds/Knock.mp3");

    successAudio.preload = "auto";
    adminBookingAudio.preload = "auto";

    audioMapRef.current = {
      default: successAudio,
      booking_created_admin: adminBookingAudio
    };

    return () => {
      audioMapRef.current = {};
    };
  }, []);

  const playNotificationSound = useCallback((notificationType = "default") => {
    const audio =
      audioMapRef.current[notificationType] || audioMapRef.current.default;

    if (!audio) {
      return;
    }

    const now = Date.now();

    if (now - lastPlayedAtRef.current < 600) {
      return;
    }

    lastPlayedAtRef.current = now;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, []);

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
        const nextItems = payload.items || [];
        const previousItems = itemsRef.current;

        if (silent && previousItems) {
          const previousIds = new Set(previousItems.map((item) => item.id));
          const newestIncomingNotification = nextItems.find(
            (item) => !previousIds.has(item.id)
          );

          if (newestIncomingNotification) {
            playNotificationSound(newestIncomingNotification.type);
          }
        }

        setItems(nextItems);
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
    [isAuthenticated, playNotificationSound]
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
    const stopPolling = () => {
      if (pollingIntervalRef.current) {
        window.clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };

    const startPolling = () => {
      if (pollingIntervalRef.current) {
        return;
      }

      pollingIntervalRef.current = window.setInterval(() => {
        refresh({ silent: true });
      }, 30000);
    };

    if (!isAuthenticated || !token) {
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      stopPolling();
      wsFallbackRef.current = false;
      socketRef.current?.close();
      socketRef.current = null;
      return;
    }

    let cancelled = false;

    const connect = () => {
      if (cancelled) {
        return;
      }

      if (
        wsFallbackRef.current ||
        getWsDisabledUntil() > Date.now()
      ) {
        wsFallbackRef.current = true;
        startPolling();
        return;
      }

      let hasOpened = false;
      const socket = new WebSocket(getNotificationsWsUrl(token));
      socketRef.current = socket;

      socket.addEventListener("open", () => {
        hasOpened = true;
        clearWsDisableFlag();
        stopPolling();
        refresh({ silent: true });
      });

      socket.addEventListener("message", (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "notification.created" && data.payload) {
            const exists = itemsRef.current.some((item) => item.id === data.payload.id);

            if (exists) {
              return;
            }

            setItems((currentItems) => [data.payload, ...currentItems].slice(0, 25));

            setUnreadCount((currentCount) =>
              !data.payload.is_read ? currentCount + 1 : currentCount
            );

            playNotificationSound(data.payload.type);
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
            return;
          }

          if (data.type === "notification.deleted" && data.payload) {
            let removedUnread = false;

            setItems((currentItems) =>
              currentItems.filter((item) => {
                if (item.id !== data.payload.id) {
                  return true;
                }

                removedUnread = !item.is_read;
                return false;
              })
            );

            setUnreadCount((currentCount) =>
              removedUnread ? Math.max(0, currentCount - 1) : currentCount
            );
            return;
          }

          if (data.type === "notifications.cleared") {
            setItems([]);
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

        if (!hasOpened) {
          disableWsTemporarily();
          wsFallbackRef.current = true;
          startPolling();
          return;
        }

        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, 3000);
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

      stopPolling();
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [isAuthenticated, token, refresh, playNotificationSound]);

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

  const removeNotification = useCallback(async (notificationId) => {
    await api.notifications.remove(notificationId);

    let removedUnread = false;

    setItems((currentItems) =>
      currentItems.filter((item) => {
        if (item.id !== notificationId) {
          return true;
        }

        removedUnread = !item.is_read;
        return false;
      })
    );

    setUnreadCount((currentCount) =>
      removedUnread ? Math.max(0, currentCount - 1) : currentCount
    );
  }, []);

  const clearAll = useCallback(async () => {
    await api.notifications.clearAll();
    setItems([]);
    setUnreadCount(0);
  }, []);

  const value = useMemo(
    () => ({
      items,
      unreadCount,
      loading,
      refresh,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll
    }),
    [
      items,
      unreadCount,
      loading,
      refresh,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll
    ]
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
