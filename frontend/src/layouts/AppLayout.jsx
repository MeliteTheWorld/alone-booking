import InstallPrompt from "../components/InstallPrompt.jsx";
import { Outlet, useLocation } from "react-router-dom";
import NavBar from "../components/NavBar.jsx";

const PAGE_MOTION_COOLDOWN_MS = 60_000;

export default function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAuthRoute = location.pathname.startsWith("/auth");
  const pageMotionKey = isAuthRoute
    ? location.pathname
    : `${location.pathname}${location.search}`;
  const shouldAnimatePage = (() => {
    if (typeof window === "undefined") {
      return true;
    }

    const storageKey = `ui-page-motion:${pageMotionKey}`;
    const now = Date.now();
    const previousVisit = Number.parseInt(
      window.sessionStorage.getItem(storageKey) ?? "0",
      10
    );

    window.sessionStorage.setItem(storageKey, String(now));

    return !previousVisit || now - previousVisit > PAGE_MOTION_COOLDOWN_MS;
  })();
  const pageEnterClass = shouldAnimatePage ? "ui-page-enter" : "";

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 md:px-6 md:py-8 xl:px-8 xl:py-10">
        {isAdminRoute ? (
          <div className={pageEnterClass} key={pageMotionKey}>
            <Outlet />
          </div>
        ) : (
          <div className="admin-shell">
            <div
              className={`bg-[#f7f8fc] ${
                isAuthRoute
                  ? "px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 xl:px-8 xl:py-10"
                  : "p-3 sm:p-4 md:p-6 xl:p-8"
              }`}
            >
              <div className={pageEnterClass} key={pageMotionKey}>
                <Outlet />
              </div>
            </div>
          </div>
        )}
      </main>
      <InstallPrompt />
    </div>
  );
}
