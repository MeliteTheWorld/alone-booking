const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function getNotificationsWsUrl(token) {
  const baseUrl = API_URL.replace(/\/api\/?$/, "");
  const resolvedBaseUrl = baseUrl
    ? /^https?:\/\//.test(baseUrl)
      ? baseUrl
      : typeof window !== "undefined"
        ? `${window.location.origin}${baseUrl}`
        : baseUrl
    : typeof window !== "undefined"
      ? window.location.origin
      : "";
  const wsBaseUrl = resolvedBaseUrl.startsWith("https://")
    ? resolvedBaseUrl.replace("https://", "wss://")
    : resolvedBaseUrl.replace("http://", "ws://");

  return `${wsBaseUrl}/ws/notifications?token=${encodeURIComponent(token)}`;
}

async function request(path, options = {}) {
  const token = localStorage.getItem("booking-token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Произошла ошибка запроса");
  }

  return data;
}

export const api = {
  auth: {
    register: (payload) =>
      request("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    login: (payload) =>
      request("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    me: () => request("/auth/me"),
    updateProfile: (payload) =>
      request("/auth/me", {
        method: "PATCH",
        body: JSON.stringify(payload)
      })
  },
  services: {
    getAll: () => request("/services"),
    getAdminAll: () => request("/services/admin/all"),
    create: (payload) =>
      request("/services", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    update: (id, payload) =>
      request(`/services/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      }),
    remove: (id) =>
      request(`/services/${id}`, {
        method: "DELETE"
      }),
    removePermanent: (id) =>
      request(`/services/${id}/permanent`, {
        method: "DELETE"
      })
  },
  workers: {
    getAll: () => request("/workers"),
    create: (payload) =>
      request("/workers", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    update: (id, payload) =>
      request(`/workers/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      }),
    remove: (id) =>
      request(`/workers/${id}`, {
        method: "DELETE"
      })
  },
  bookings: {
    getAll: () => request("/bookings"),
    create: (payload) =>
      request("/bookings", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    update: (id, payload) =>
      request(`/bookings/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      }),
    cancel: (id) =>
      request(`/bookings/${id}`, {
        method: "DELETE"
      }),
    remove: (id) =>
      request(`/bookings/${id}/permanent`, {
        method: "DELETE"
      }),
    updateStatus: (id, status) =>
      request(`/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      }),
    summary: () => request("/bookings/dashboard/summary"),
    analytics: () => request("/bookings/dashboard/analytics")
  },
  schedule: {
    getSlots: (serviceId, date, workerId, excludeBookingId) => {
      const params = new URLSearchParams({
        serviceId: String(serviceId),
        workerId: String(workerId),
        date
      });

      if (excludeBookingId) {
        params.set("excludeBookingId", String(excludeBookingId));
      }

      return request(`/schedule/slots?${params.toString()}`);
    },
    getHours: () => request("/schedule/hours"),
    updateHours: (dayOfWeek, payload) =>
      request(`/schedule/hours/${dayOfWeek}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      }),
    getLoad: (from, to) =>
      request(`/schedule/load?from=${from}&to=${to}`)
  },
  notifications: {
    getAll: () => request("/notifications"),
    markRead: (id) =>
      request(`/notifications/${id}/read`, {
        method: "PATCH"
      }),
    markAllRead: () =>
      request("/notifications/read-all", {
        method: "PATCH"
      })
  }
};
