import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ConfirmDialogProvider } from "./context/ConfirmDialogContext.jsx";
import { NotificationsProvider } from "./context/NotificationsContext.jsx";
import "./index.css";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

async function clearLocalPwaState() {
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }

  if ("caches" in window) {
    const cacheKeys = await window.caches.keys();
    await Promise.all(
      cacheKeys
        .filter((key) => key.startsWith("smart-booking-") || key.startsWith("alone-"))
        .map((key) => window.caches.delete(key))
    );
  }
}

window.addEventListener("load", () => {
  const isLocalEnvironment = LOCAL_HOSTS.has(window.location.hostname);

  if (isLocalEnvironment) {
    clearLocalPwaState().catch((error) =>
      console.error("Local PWA cleanup failed:", error)
    );
    return;
  }

  if (import.meta.env.PROD && "serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((error) =>
        console.error("Service worker registration failed:", error)
      );
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider>
          <ConfirmDialogProvider>
            <App />
          </ConfirmDialogProvider>
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
