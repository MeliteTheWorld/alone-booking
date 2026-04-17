import InstallPrompt from "../components/InstallPrompt.jsx";
import { Outlet, useLocation } from "react-router-dom";
import NavBar from "../components/NavBar.jsx";

export default function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAuthRoute = location.pathname.startsWith("/auth");

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 md:px-6 md:py-8 xl:px-8 xl:py-10">
        {isAdminRoute ? (
          <Outlet />
        ) : (
          <div className="admin-shell">
            <div
              className={`bg-[#f7f8fc] ${
                isAuthRoute
                  ? "px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 xl:px-8 xl:py-10"
                  : "p-3 sm:p-4 md:p-6 xl:p-8"
              }`}
            >
              <Outlet />
            </div>
          </div>
        )}
      </main>
      <InstallPrompt />
    </div>
  );
}
