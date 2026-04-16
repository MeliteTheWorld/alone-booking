import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminAnalyticsPage from "./AdminAnalyticsPage.jsx";
import AdminDashboardPage from "./AdminDashboardPage.jsx";
import CalendarPage from "./CalendarPage.jsx";
import ManageServicesPage from "./ManageServicesPage.jsx";

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
    id: "calendar",
    label: "Календарь",
    helper: "Записи и график",
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
    id: "services",
    label: "Услуги",
    helper: "Каталог и мастера",
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

  const content = useMemo(() => {
    switch (activeTab) {
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
    navigate(`/admin?tab=${tabId}`);
  };

  return (
    <div className="admin-shell">
      <div className="md:grid md:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-white md:min-h-[calc(100vh-180px)] md:border-b-0 md:border-r">
          <div className="p-4 md:p-5">
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

            <nav className="mt-4 grid gap-2 md:mt-8">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    className={`admin-sidebar-link w-full ${
                      isActive ? "admin-sidebar-link-active" : ""
                    }`}
                    onClick={() => setTab(tab.id)}
                    type="button"
                  >
                    <span className="flex items-start gap-3">
                      {tab.icon}
                      <span className="min-w-0 text-left">
                        <span className="block">{tab.label}</span>
                        <span className="mt-1 block text-xs font-medium text-slate-400">
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

        <section className="min-w-0 bg-[#f7f8fc] p-4 md:p-6 xl:p-8">
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

          <div key={activeTab}>{content}</div>
        </section>
      </div>
    </div>
  );
}
