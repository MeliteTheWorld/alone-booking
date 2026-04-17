import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import BookingAdminActions from "../components/BookingAdminActions.jsx";
import BookingStatusBadge from "../components/BookingStatusBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getLocalIsoDate } from "../utils/date.js";

function isoDate(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return getLocalIsoDate(date);
}

function bookingDateTime(booking) {
  return new Date(`${booking.booking_date.slice(0, 10)}T${booking.booking_time}`);
}

function isUpcomingBooking(booking) {
  return (
    ["pending", "confirmed", "in_progress"].includes(booking.status) &&
    booking.booking_date.slice(0, 10) >= isoDate(0)
  );
}

function monthMatrix(referenceDate, bookingsByDate) {
  const first = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7));

  return Array.from({ length: 35 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    const key = getLocalIsoDate(day);
    return {
      key,
      date: day,
      count: bookingsByDate[key] || 0,
      isCurrentMonth: day.getMonth() === referenceDate.getMonth(),
      isToday: key === isoDate(0)
    };
  });
}

const statsConfig = [
  {
    key: "services",
    label: "Активные услуги",
    helper: "доступно для записи"
  },
  {
    key: "todayBookings",
    label: "Записи на сегодня",
    helper: "текущий рабочий день"
  },
  {
    key: "activeBookings",
    label: "Активные записи",
    helper: "ожидают завершения"
  },
  {
    key: "clients",
    label: "Клиенты",
    helper: "в клиентской базе"
  }
];

const weekLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [load, setLoad] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [actionableBookings, setActionableBookings] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    try {
      const [summaryPayload, loadPayload, bookingsPayload] = await Promise.all([
        api.bookings.summary(),
        api.schedule.getLoad(isoDate(0), isoDate(6)),
        api.bookings.getAll()
      ]);

      const sortedUpcoming = bookingsPayload
        .filter(isUpcomingBooking)
        .sort((left, right) => bookingDateTime(left) - bookingDateTime(right));

      setSummary(summaryPayload);
      setLoad(loadPayload);
      setUpcomingBookings(sortedUpcoming.slice(0, 6));
      setActionableBookings(
        sortedUpcoming
          .filter((booking) =>
            ["pending", "confirmed", "in_progress"].includes(booking.status)
          )
          .slice(0, 3)
      );
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      setError("");
      await api.bookings.updateStatus(id, status);
      setMessage(
        status === "confirmed"
          ? "Запись подтверждена"
          : status === "in_progress"
            ? "Услуга переведена в работу"
            : status === "completed"
              ? "Услуга отмечена как оказанная"
              : "Запись отменена администратором"
      );
      await loadData();
    } catch (statusError) {
      setError(statusError.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Удалить запись из системы полностью?");

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      await api.bookings.remove(id);
      setMessage("Запись удалена");
      await loadData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const bookingsCountByDate = useMemo(
    () =>
      upcomingBookings.reduce((acc, booking) => {
        const key = booking.booking_date.slice(0, 10);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
    [upcomingBookings]
  );

  const miniCalendar = useMemo(
    () => monthMatrix(new Date(), bookingsCountByDate),
    [bookingsCountByDate]
  );

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="admin-chip">Обзор бизнеса</div>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">
            С возвращением, {user?.name || "администратор"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Здесь собрана ключевая картина по записям, загрузке и текущим задачам на сегодня.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link className="admin-secondary w-full sm:w-auto" to="/admin?tab=calendar">
            Полный календарь
          </Link>
          <Link className="admin-primary w-full sm:w-auto" to="/admin?tab=services">
            Управление услугами
          </Link>
        </div>
      </div>

      {error && (
        <div className="admin-card border-fuchsia-200 bg-fuchsia-50 px-5 py-4 text-sm text-fuchsia-700">
          {error}
        </div>
      )}
      {message && (
        <div className="admin-card border-violet-200 bg-violet-50 px-5 py-4 text-sm text-violet-700">
          {message}
        </div>
      )}

      {summary && (
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statsConfig.map((item, index) => (
            <div className="admin-card p-5" key={item.key}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-500">{item.label}</div>
                  <div className="mt-3 text-3xl font-bold text-slate-900">
                    {summary[item.key]}
                  </div>
                  <div className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">
                    {item.helper}
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <span className="text-lg font-bold">{index + 1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_320px]">
        <section className="admin-card overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-5 md:px-6 md:py-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Ближайшие записи</h2>
              <p className="mt-1 text-sm text-slate-500">
                Показываем только три ближайшие записи, чтобы администратор сразу видел главный приоритет.
              </p>
            </div>
            <Link className="text-sm font-semibold text-violet-600 hover:text-violet-700" to="/admin?tab=calendar">
              Смотреть все
            </Link>
          </div>

          {actionableBookings.length ? (
            <div className="grid gap-4 p-3 sm:p-4 md:p-5 xl:grid-cols-1">
              {actionableBookings.map((booking) => (
                <div
                  className="rounded-[28px] border border-slate-200 bg-white p-4 sm:p-5 md:p-6"
                  key={booking.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-xl font-bold leading-tight text-slate-900 md:text-2xl">
                        {booking.service_name}
                      </div>
                      <div className="mt-2 text-sm text-slate-500 sm:hidden">
                        Приоритетная запись
                      </div>
                      <div className="mt-2 hidden text-sm text-slate-500 sm:block">
                        Ближайшая запись клиента в работе администратора
                      </div>
                    </div>
                    <BookingStatusBadge status={booking.status} />
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                        Клиент
                      </div>
                      <div className="mt-2 font-semibold text-slate-900">
                        {booking.user_name}
                      </div>
                      <div className="mt-1 truncate text-sm text-slate-500">
                        {booking.user_email}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                        Дата
                      </div>
                      <div className="mt-2 font-semibold text-slate-900">
                        {new Date(booking.booking_date).toLocaleDateString("ru-RU", {
                          day: "2-digit",
                          month: "long"
                        })}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {new Date(booking.booking_date).toLocaleDateString("ru-RU", {
                          weekday: "long"
                        })}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.14em] text-violet-500">
                        Время
                      </div>
                      <div className="mt-2 text-2xl font-bold text-violet-700">
                        {booking.booking_time.slice(0, 5)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <BookingAdminActions
                      compact
                      fullWidth
                      onAction={(status) => handleStatusChange(booking.id, status)}
                      onDelete={() => handleDelete(booking.id)}
                      status={booking.status}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-8 text-sm text-slate-500">
              Сейчас нет записей, которые требуют действий администратора.
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="admin-card p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Текущий месяц</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Быстрый взгляд на активные даты.
                </p>
              </div>
              <div className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
                {new Date().toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              {weekLabels.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1.5">
              {miniCalendar.map((day) => (
                <div
                  key={day.key}
                  className={`flex min-h-[44px] flex-col items-center justify-center rounded-2xl border text-sm ${
                    day.isToday
                      ? "border-violet-200 bg-violet-50 text-violet-700"
                      : day.isCurrentMonth
                        ? "border-slate-200 bg-white text-slate-700"
                        : "border-slate-100 bg-slate-50 text-slate-300"
                  }`}
                >
                  <span className="font-semibold">{day.date.getDate()}</span>
                  {day.count > 0 && (
                    <span className="mt-1 text-[10px] font-semibold text-violet-500">
                      {day.count}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="admin-card p-4 sm:p-5">
            <h2 className="text-xl font-bold text-slate-900">Загрузка на неделю</h2>
            <div className="mt-5 space-y-4">
              {load.map((day) => (
                <div key={day.date}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-700">
                      {new Date(day.date).toLocaleDateString("ru-RU", {
                        day: "2-digit",
                        month: "short"
                      })}
                    </span>
                    <span className="text-slate-500">
                      {day.bookings_count} записей • {day.load}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-violet-500"
                      style={{ width: `${day.load}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-card p-4 sm:p-5">
            <h2 className="text-xl font-bold text-slate-900">Требуют внимания</h2>
            <div className="mt-4 space-y-3">
              {upcomingBookings.slice(0, 4).map((booking) => (
                <div
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  key={booking.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-slate-900">{booking.service_name}</div>
                    <BookingStatusBadge status={booking.status} />
                  </div>
                  <div className="mt-2 text-sm text-slate-500">
                    {booking.user_name} • {booking.booking_time.slice(0, 5)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
