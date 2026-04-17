import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationsContext.jsx";

function formatTimestamp(value) {
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const {
    items,
    unreadCount,
    loading,
    refresh,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleToggle = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen) {
      await refresh({ silent: true });
    }
  };

  const openNotification = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    setOpen(false);

    if (notification.link_path) {
      navigate(notification.link_path);
    }
  };

  const handleDelete = async (event, notificationId) => {
    event.stopPropagation();
    event.preventDefault();
    await removeNotification(notificationId);
  };

  const handleClearAll = async () => {
    await clearAll();
  };

  const canClear = items.length > 0;

  return (
    <div className="relative" ref={rootRef}>
      <button
        className="ui-icon-button relative"
        onClick={handleToggle}
        type="button"
      >
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
          <path
            d="M6.3 8.8A5.7 5.7 0 0 1 12 3a5.7 5.7 0 0 1 5.7 5.8v2.1c0 .9.3 1.8.8 2.5l.5.7a1 1 0 0 1-.8 1.6H5.8a1 1 0 0 1-.8-1.6l.5-.7c.5-.7.8-1.6.8-2.5V8.8ZM10 19a2 2 0 1 0 4 0"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] sm:w-[min(380px,calc(100vw-32px))]">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
            <div>
              <div className="text-sm font-semibold text-slate-900">Уведомления</div>
              <div className="mt-1 text-xs text-slate-500">
                {unreadCount ? `${unreadCount} непрочитанных` : "Все уведомления прочитаны"}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                className="text-xs font-semibold text-violet-600 disabled:text-slate-300"
                disabled={!unreadCount}
                onClick={markAllAsRead}
                type="button"
              >
                Прочитать все
              </button>
              <button
                className="text-xs font-semibold text-rose-600 disabled:text-slate-300"
                disabled={!canClear}
                onClick={handleClearAll}
                type="button"
              >
                Очистить всё
              </button>
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-3 sm:max-h-[420px]">
            {loading && !items.length ? (
              <div className="ui-alert border-slate-200 bg-slate-50 text-slate-500">
                Загружаем уведомления...
              </div>
            ) : items.length ? (
              <div className="space-y-2">
                {items.map((notification) => (
                  <div
                    className={`rounded-2xl border px-4 py-4 ${
                      notification.is_read
                        ? "border-slate-200 bg-slate-50"
                        : "border-violet-200 bg-violet-50/70"
                    }`}
                    key={notification.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        className="block min-w-0 flex-1 text-left"
                        onClick={() => openNotification(notification)}
                        type="button"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-semibold text-slate-900">
                                {notification.title}
                              </div>
                              {!notification.is_read && (
                                <span className="h-2.5 w-2.5 rounded-full bg-violet-600" />
                              )}
                            </div>
                            <div className="mt-2 text-sm leading-6 text-slate-600">
                              {notification.message}
                            </div>
                          </div>
                          <div className="shrink-0 text-[11px] text-slate-400">
                            {formatTimestamp(notification.created_at)}
                          </div>
                        </div>
                      </button>
                      <button
                        aria-label="Удалить уведомление"
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                        onClick={(event) => handleDelete(event, notification.id)}
                        type="button"
                      >
                        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <path
                            d="M9 4.5h6M4.5 7.5h15M10 10.5v6M14 10.5v6M6.5 7.5l.8 10a2 2 0 0 0 2 1.8h5.4a2 2 0 0 0 2-1.8l.8-10"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                          />
                        </svg>
                      </button>
                    </div>

                    {!notification.is_read && (
                      <button
                        className="mt-3 text-xs font-semibold text-violet-600"
                        onClick={() => markAsRead(notification.id)}
                        type="button"
                      >
                        Отметить как прочитанное
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Пока уведомлений нет.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
