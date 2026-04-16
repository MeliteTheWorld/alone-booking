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
      <main className="mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-10">
        {isAdminRoute ? (
          <Outlet />
        ) : (
          <div className="admin-shell">
            <div
              className={`bg-[#f7f8fc] ${isAuthRoute ? "px-4 py-6 md:px-8 md:py-10" : "p-4 md:p-8 xl:p-10"}`}
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
