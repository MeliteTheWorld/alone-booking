import { Link, NavLink } from "react-router-dom";
import Button from "./Button.jsx";
import BrandLogo from "./BrandLogo.jsx";
import NotificationBell from "./NotificationBell.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getAvatarByKey } from "../utils/avatars.js";

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
  const selectedAvatar = getAvatarByKey(user?.avatar_key);
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/92 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-4 md:px-6 md:py-3 xl:px-8 xl:py-4">
        <div className="relative flex items-center justify-between gap-3">
          <BrandLogo compact to="/" />

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1.5 lg:flex">
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

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                {isAdmin && (
                  <Link
                    aria-label="Админ панель"
                    className="ui-icon-button hover:bg-violet-50 hover:text-violet-700"
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
                  className="ui-icon-button hover:bg-rose-50 hover:text-rose-600"
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
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-violet-50 text-sm font-bold text-violet-700 shadow-[0_8px_20px_rgba(142,99,245,0.08)] sm:h-10 sm:w-10"
                  to="/profile"
                >
                  {selectedAvatar ? (
                    <img
                      alt={user?.name || "Аватар профиля"}
                      className="h-full w-full object-cover"
                      src={selectedAvatar.src}
                    />
                  ) : (
                    (user?.name || "A").slice(0, 1).toUpperCase()
                  )}
                </Link>
              </>
            ) : (
              <>
                <Button className="!rounded-full !px-3 sm:!px-4 md:!px-5" size="sm" to="/auth" variant="secondary">
                  Войти
                </Button>
                <Button
                  className="!rounded-full !px-3 sm:!px-4 md:!px-5"
                  size="sm"
                  to="/auth?mode=register"
                  variant="primary"
                >
                  Регистрация
                </Button>
              </>
            )}
          </div>
        </div>

        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
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
