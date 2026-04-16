import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";

const monthLabels = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек"
];

const statusLabels = {
  pending: "Ожидают подтверждения",
  confirmed: "Подтверждены",
  in_progress: "В работе",
  completed: "Завершены",
  cancelled: "Отменены"
};

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("ru-RU")} ₽`;
}

function formatMonthLabel(month, year = new Date().getFullYear()) {
  if (!month) {
    return "—";
  }

  return `${monthLabels[month - 1]} ${year}`;
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.bookings
      .analytics()
      .then(setAnalytics)
      .catch((loadError) => setError(loadError.message));
  }, []);

  const monthlyChart = useMemo(() => {
    const mapped = new Map(
      (analytics?.monthlyRevenue || []).map((item) => [Number(item.month), item])
    );

    const maxRevenue = Math.max(
      1,
      ...Array.from({ length: 12 }, (_, index) =>
        Number(mapped.get(index + 1)?.revenue || 0)
      )
    );

    return Array.from({ length: 12 }, (_, index) => {
      const source = mapped.get(index + 1);
      const revenue = Number(source?.revenue || 0);

      return {
        month: index + 1,
        label: monthLabels[index],
        revenue,
        completedCount: Number(source?.completed_count || 0),
        width: `${Math.max((revenue / maxRevenue) * 100, revenue > 0 ? 14 : 8)}%`
      };
    });
  }, [analytics]);

  const metrics = analytics?.overview
    ? [
        {
          label: "Выручка за день",
          value: formatMoney(analytics.overview.revenue_today),
          helper: "по завершённым услугам"
        },
        {
          label: "Выручка за месяц",
          value: formatMoney(analytics.overview.revenue_month),
          helper: "текущий календарный месяц"
        },
        {
          label: "Выручка за год",
          value: formatMoney(analytics.overview.revenue_year),
          helper: "текущий календарный год"
        },
        {
          label: "Клиенты",
          value: analytics.overview.clients_total,
          helper: `+${analytics.overview.clients_this_month} за месяц`
        },
        {
          label: "Услуги",
          value: analytics.overview.services_total,
          helper: `${analytics.overview.services_active} активных`
        },
        {
          label: "Записи",
          value: analytics.overview.bookings_total,
          helper: `${analytics.overview.bookings_active} активных сейчас`
        }
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <div className="admin-chip">Выручка и метрики</div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">
          Аналитика бизнеса
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Здесь собрана выручка по периодам, состояние клиентской базы, динамика
          завершённых услуг и самые сильные направления по доходу.
        </p>
      </div>

      {error && (
        <div className="admin-card border-fuchsia-200 bg-fuchsia-50 px-5 py-4 text-sm text-fuchsia-700">
          {error}
        </div>
      )}

      {analytics && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {metrics.map((item) => (
              <div className="admin-card p-5" key={item.label}>
                <div className="text-sm font-medium text-slate-500">{item.label}</div>
                <div className="mt-3 text-3xl font-bold text-slate-900">
                  {item.value}
                </div>
                <div className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">
                  {item.helper}
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
            <section className="admin-card p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Выручка по месяцам</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Только завершённые услуги за текущий год.
                  </p>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                  {new Date().getFullYear()}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {monthlyChart.map((item) => (
                  <div key={item.month}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-slate-700">{item.label}</span>
                      <span className="text-slate-500">
                        {formatMoney(item.revenue)} • {item.completedCount} услуг
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100">
                      <div
                        className="h-3 rounded-full bg-violet-500"
                        style={{ width: item.width }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="space-y-6">
              <section className="admin-card p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                  Самый прибыльный месяц
                </div>
                <div className="mt-4 text-2xl font-bold text-slate-900">
                  {analytics.topMonth
                    ? formatMonthLabel(analytics.topMonth.month, analytics.topMonth.year)
                    : "Пока нет данных"}
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  {analytics.topMonth
                    ? `${formatMoney(analytics.topMonth.revenue)} • ${analytics.topMonth.completed_count} завершённых услуг`
                    : "После первых завершённых услуг здесь появится лучший месяц."}
                </div>
              </section>

              <section className="admin-card p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                  Статусы записей
                </div>
                <div className="mt-4 space-y-3">
                  {analytics.statusBreakdown.map((item) => (
                    <div
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      key={item.status}
                    >
                      <span className="text-sm font-medium text-slate-700">
                        {statusLabels[item.status] || item.status}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="admin-card p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Топ услуг</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Самые прибыльные направления по завершённым визитам.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {analytics.topServices.length ? (
                  analytics.topServices.map((service, index) => (
                    <div
                      className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4"
                      key={service.id}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                            #{index + 1}
                          </div>
                          <div className="mt-1 text-lg font-bold text-slate-900">
                            {service.name}
                          </div>
                          <div className="mt-2 text-sm text-slate-500">
                            {service.completed_count} завершённых услуг
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-slate-900">
                            {formatMoney(service.revenue)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    Пока нет завершённых услуг для построения рейтинга.
                  </div>
                )}
              </div>
            </section>

            <section className="admin-card p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Топ клиентов</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Кто чаще всего завершает визиты и приносит выручку.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {analytics.topClients.length ? (
                  analytics.topClients.map((client, index) => (
                    <div
                      className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4"
                      key={client.id}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                            #{index + 1}
                          </div>
                          <div className="mt-1 text-lg font-bold text-slate-900">
                            {client.name}
                          </div>
                          <div className="mt-1 text-sm text-slate-500">
                            {client.email}
                          </div>
                          <div className="mt-2 text-sm text-slate-500">
                            {client.completed_count} завершённых услуг
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-slate-900">
                            {formatMoney(client.revenue)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    Пока нет завершённых визитов для анализа клиентской базы.
                  </div>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
