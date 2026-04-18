import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminAnalyticsPage from "./AdminAnalyticsPage.jsx";
import BookingsPage from "./BookingsPage.jsx";
import AdminDashboardPage from "./AdminDashboardPage.jsx";
import CalendarPage from "./CalendarPage.jsx";
import ManageServicesPage from "./ManageServicesPage.jsx";
import WorkersPage from "./WorkersPage.jsx";

const tabs = [
  {
    id: "overview",
    label: "Дашборд",
    helper: "Обзор бизнеса",
    icon: (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <path
          d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-9.5Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    )
  },
  {
    id: "bookings",
    label: "Записи",
    helper: "Календарь и заявки",
    icon: (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <path
          d="M7 3v4M17 3v4M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    )
  },
  {
    id: "calendar",
    label: "График",
    helper: "Рабочие часы",
    icon: (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <path
          d="M4 19h16M7 15l3-3 2 2 5-6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    )
  },
  {
    id: "services",
    label: "Услуги",
    helper: "Каталог и цены",
    icon: (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <path
          d="M7 7h10M7 12h10M7 17h6M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    )
  },
  {
    id: "workers",
    label: "Работники",
    helper: "Сотрудники и роли",
    icon: (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <path
          d="M15 19v-1a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v1M9.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM20 19v-1a3 3 0 0 0-2-2.83M14 5.17a3 3 0 0 1 0 5.66"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    )
  },
  {
    id: "analytics",
    label: "Аналитика",
    helper: "Выручка и метрики",
    icon: (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <path
          d="M5 19V10M12 19V5M19 19v-8M4 19h16"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    )
  }
];

export default function AdminPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const activeMeta = tabs.find((tab) => tab.id === activeTab) || tabs[0];
  const firstRenderRef = useRef(true);

  const content = useMemo(() => {
    switch (activeTab) {
      case "bookings":
        return <BookingsPage />;
      case "workers":
        return <WorkersPage />;
      case "analytics":
        return <AdminAnalyticsPage />;
      case "services":
        return <ManageServicesPage />;
      case "calendar":
        return <CalendarPage />;
      case "overview":
      default:
        return <AdminDashboardPage />;
    }
  }, [activeTab]);

  const setTab = (tabId) => {
    if (tabId === activeTab) {
      return;
    }

    navigate(`/admin?tab=${tabId}`);
  };

  useEffect(() => {
    if (typeof window === "undefined" || !window.history) {
      return;
    }

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const resetScroll = () => {
      window.scrollTo({ top: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    resetScroll();

    const rafId = window.requestAnimationFrame(() => {
      resetScroll();
    });

    const timeoutId = window.setTimeout(() => {
      resetScroll();
    }, 0);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [activeTab]);

  return (
    <div className="admin-shell">
      <div className="md:grid md:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-white md:min-h-[calc(100vh-180px)] md:border-b-0 md:border-r">
          <div className="p-3 sm:p-4 md:p-5">
            <div className="hidden md:block">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                Панель управления
              </div>
              <h2 className="mt-3 text-2xl font-bold text-slate-900">
                Админка ALONE
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Управляйте расписанием, услугами и текущей загрузкой в одном месте.
              </p>
            </div>

            <div className="md:hidden">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                    Админка
                  </div>
                  <div className="mt-1 text-lg font-bold text-slate-900">
                    {activeMeta.label}
                  </div>
                </div>
              </div>
            </div>

            <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 md:mt-8 md:grid md:gap-2 md:overflow-visible md:pb-0">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    className={`admin-sidebar-link shrink-0 md:w-full ${
                      isActive ? "admin-sidebar-link-active" : ""
                    }`}
                    onClick={() => setTab(tab.id)}
                    type="button"
                  >
                    <span className="flex items-start gap-3">
                      {tab.icon}
                      <span className="min-w-0 text-left">
                        <span className="block">{tab.label}</span>
                        <span className="mt-1 hidden text-xs font-medium text-slate-400 md:block">
                          {tab.helper}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="admin-card mt-6 hidden p-4 md:block">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                Быстрый фокус
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Следите за новыми заявками, отмечайте услуги как выполненные и
                держите расписание в актуальном состоянии.
              </p>
            </div>
          </div>
        </aside>

        <section className="min-w-0 bg-[#f7f8fc] p-3 sm:p-4 md:p-6 xl:p-8">
          <div className="mb-6 hidden items-center justify-between border-b border-slate-200 pb-5 md:flex">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                {activeMeta.helper}
              </div>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                {activeMeta.label}
              </h1>
            </div>
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500">
              Офисный режим ALONE
            </div>
          </div>

          <div>{content}</div>
        </section>
      </div>
    </div>
  );
}
