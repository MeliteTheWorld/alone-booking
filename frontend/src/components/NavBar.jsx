import { Link, NavLink } from "react-router-dom";
import BrandLogo from "./BrandLogo.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const desktopLinkClass = ({ isActive }) =>
  `inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition ${
    isActive
      ? "bg-violet-50 text-violet-700"
      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
  }`;

const mobileLinkClass = ({ isActive }) =>
  `inline-flex shrink-0 items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition ${
    isActive
      ? "bg-violet-50 text-violet-700"
      : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
  }`;

const navItems = [
  {
    to: "/",
    label: "Главная",
    end: true
  },
  {
    to: "/services",
    label: "Услуги"
  }
];

export default function NavBar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/92 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-8 md:py-4">
        <div className="relative flex items-center justify-between gap-3">
          <BrandLogo compact to="/" />

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1.5 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                className={desktopLinkClass}
                end={item.end}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            {isAuthenticated ? (
              <>
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                  type="button"
                >
                  <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <path
                      d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                </button>
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
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
                </button>
                {isAdmin && (
                  <Link
                    aria-label="Админ панель"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-violet-50 hover:text-violet-700"
                    to="/admin"
                  >
                    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M7 10.2V9.1c0-2.8 2.2-5.1 5-5.1s5 2.3 5 5.1v1.1"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M4.5 11.2h15v4.9A2.9 2.9 0 0 1 16.6 19H7.4a2.9 2.9 0 0 1-2.9-2.9v-4.9Z"
                        stroke="currentColor"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                      />
                      <path
                        d="m7.2 8.2 4.8-3.1 4.8 3.1"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M8.8 14.4c.9.9 2 1.3 3.2 1.3s2.3-.4 3.2-1.3"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M12 11.2v2.1"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="1.8"
                      />
                    </svg>
                  </Link>
                )}
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                  onClick={logout}
                  type="button"
                >
                  <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M15 17l5-5-5-5M20 12H9M12 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                </button>
                <Link className="hidden text-right lg:block" to="/profile">
                  <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500">
                    {isAdmin ? "Администратор" : "Клиент"}
                  </div>
                </Link>
                <Link
                  aria-label="Профиль"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-violet-50 text-sm font-bold text-violet-700"
                  to="/profile"
                >
                  {(user?.name || "A").slice(0, 1).toUpperCase()}
                </Link>
              </>
            ) : (
              <>
                <Link
                  className="admin-secondary !rounded-full !px-4 !py-2.5 text-sm md:!px-5"
                  to="/auth"
                >
                  Войти
                </Link>
                <Link
                  className="admin-primary !rounded-full !px-4 !py-2.5 text-sm md:!px-5"
                  to="/auth?mode=register"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>

        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={mobileLinkClass}
              end={item.end}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
          {!isAuthenticated && (
            <NavLink className={mobileLinkClass} to="/auth">
              Аккаунт
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
