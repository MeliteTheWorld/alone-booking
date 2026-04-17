import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import AnimatedCollapse from "../components/AnimatedCollapse.jsx";
import BookingAdminActions from "../components/BookingAdminActions.jsx";
import BookingStatusBadge from "../components/BookingStatusBadge.jsx";
import { useNotifications } from "../context/NotificationsContext.jsx";

const weekDays = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];
const workDays = [
  "Воскресенье",
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота"
];

const eventPalette = [
  "border-violet-200 bg-violet-50 text-violet-700",
  "border-cyan-200 bg-cyan-50 text-cyan-700",
  "border-slate-200 bg-slate-50 text-slate-700"
];

function monthTitle(date) {
  return date.toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric"
  });
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatIso(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sameDay(left, right) {
  return formatIso(left) === formatIso(right);
}

function buildCalendarDays(monthDate, bookingsByDate) {
  const firstOfMonth = startOfMonth(monthDate);
  const mondayIndex = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = addDays(firstOfMonth, -mondayIndex);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    const iso = formatIso(date);

    return {
      date,
      iso,
      isCurrentMonth: date.getMonth() === monthDate.getMonth(),
      isToday: sameDay(date, new Date()),
      bookings: bookingsByDate[iso] || []
    };
  });
}

function formatDayLabel(date) {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    weekday: "long"
  });
}

function eventColor(serviceId, status) {
  if (status === "cancelled") {
    return "border-slate-200 bg-slate-100 text-slate-500";
  }

  if (status === "completed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "in_progress") {
    return "border-cyan-200 bg-cyan-50 text-cyan-700";
  }

  if (status === "confirmed") {
    return eventPalette[serviceId % eventPalette.length];
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

export default function CalendarPage() {
  const { refresh: refreshNotifications } = useNotifications();
  const [hours, setHours] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = async () => {
    try {
      const [hoursPayload, bookingsPayload] = await Promise.all([
        api.schedule.getHours(),
        api.bookings.getAll()
      ]);

      setHours(hoursPayload);
      setBookings(bookingsPayload);

      setSelectedBooking((current) => {
        if (!bookingsPayload.length) {
          return null;
        }

        if (!current) {
          return bookingsPayload[0];
        }

        return bookingsPayload.find((booking) => booking.id === current.id) || null;
      });
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredBookings = useMemo(() => {
    if (statusFilter === "all") {
      return bookings;
    }

    return bookings.filter((booking) => booking.status === statusFilter);
  }, [bookings, statusFilter]);

  const bookingsByDate = useMemo(
    () =>
      filteredBookings.reduce((acc, booking) => {
        const key = booking.booking_date.slice(0, 10);
        acc[key] = acc[key] || [];
        acc[key].push(booking);
        return acc;
      }, {}),
    [filteredBookings]
  );

  const calendarDays = useMemo(
    () => buildCalendarDays(currentMonth, bookingsByDate),
    [currentMonth, bookingsByDate]
  );
  const mobileDays = useMemo(
    () =>
      calendarDays.filter(
        (day) => day.isCurrentMonth && (day.bookings.length > 0 || day.isToday)
      ),
    [calendarDays]
  );

  const handleHourChange = async (dayOfWeek, field, value) => {
    const currentDay = hours.find((day) => day.day_of_week === dayOfWeek);
    const payload = {
      ...currentDay,
      [field]: value
    };

    try {
      await api.schedule.updateHours(dayOfWeek, payload);
      setMessage("Рабочие часы обновлены");
      await loadData();
    } catch (saveError) {
      setError(saveError.message);
    }
  };

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
            : "Запись отменена"
      );
      await refreshNotifications({ silent: true });
      await loadData();
    } catch (statusError) {
      setError(statusError.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Удалить запись из системы полностью?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      await api.bookings.remove(id);
      setMessage("Запись удалена");
      await refreshNotifications({ silent: true });
      await loadData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <div className="space-y-6">
      <section className="admin-card px-4 py-4 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="w-full text-2xl font-bold text-slate-900 sm:w-auto md:text-3xl">
              {monthTitle(currentMonth)}
            </h1>
            <button
              className="admin-secondary !h-10 !w-10 !rounded-xl !px-0 !py-0"
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                )
              }
              type="button"
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              className="admin-secondary !h-10 !rounded-xl !px-4 !py-0"
              onClick={() => {
                const today = new Date();
                setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
              }}
              type="button"
            >
              Сегодня
            </button>
            <button
              className="admin-secondary !h-10 !w-10 !rounded-xl !px-0 !py-0"
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                )
              }
              type="button"
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-xl bg-slate-100 p-1">
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-[#8e63f5] px-4 py-2 text-sm font-semibold text-white"
                type="button"
              >
                <span className="h-2 w-2 rounded-full bg-white/80" />
                Месяц
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-400"
                type="button"
              >
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                Неделя
              </button>
            </div>

            <button
              className="admin-secondary !h-10 !rounded-xl !px-4 !py-0"
              onClick={() => setFilterOpen((current) => !current)}
              type="button"
            >
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path
                  d="M4 6h16M7 12h10M10 18h4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.8"
                />
              </svg>
              Фильтры
            </button>
          </div>
        </div>

        <AnimatedCollapse className="mt-4" open={filterOpen}>
          <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            {[
              ["all", "Все"],
              ["pending", "Ожидают"],
              ["confirmed", "Подтверждённые"],
              ["in_progress", "В работе"],
              ["completed", "Оказанные"],
              ["cancelled", "Отменённые"]
            ].map(([value, label]) => (
              <button
                key={value}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  statusFilter === value
                    ? "bg-[#8e63f5] text-white"
                    : "bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
                onClick={() => setStatusFilter(value)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </AnimatedCollapse>
      </section>

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

      <section className="admin-card overflow-hidden">
        <div className="space-y-3 p-4 md:hidden">
          {mobileDays.length ? (
            mobileDays.map((day) => (
              <div
                key={day.iso}
                className="rounded-[24px] border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold capitalize text-slate-900">
                      {formatDayLabel(day.date)}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      {day.bookings.length
                        ? `${day.bookings.length} записей`
                        : "Свободный день"}
                    </div>
                  </div>
                  <div
                    className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-semibold ${
                      day.isToday
                        ? "bg-[#8e63f5] text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {day.date.getDate()}
                  </div>
                </div>

                {day.bookings.length ? (
                  <div className="mt-4 space-y-2">
                    {day.bookings.map((booking) => (
                      <button
                        key={booking.id}
                        className={`block w-full rounded-2xl border px-3 py-3 text-left text-xs font-semibold transition ${eventColor(
                          booking.service_id,
                          booking.status
                        )}`}
                        onClick={() => setSelectedBooking(booking)}
                        type="button"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span>{booking.booking_time.slice(0, 5)}</span>
                          <BookingStatusBadge status={booking.status} />
                        </div>
                        <div className="mt-1 text-sm text-slate-900">
                          {booking.user_name}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500">
                          {booking.service_name}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-400">
                    На этот день активных записей нет.
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
              В этом месяце пока нет записей. Попробуйте изменить месяц или
              снять фильтр.
            </div>
          )}
        </div>

        <div className="hidden md:block">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {weekDays.map((day) => (
              <div
                key={day}
                className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 lg:px-3 lg:py-4 lg:text-[11px]"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day) => (
              <div
                key={day.iso}
                className={`min-h-[118px] border-b border-r border-slate-200 p-2.5 lg:min-h-[132px] lg:p-3 ${
                  day.isCurrentMonth ? "bg-white" : "bg-slate-50"
                }`}
              >
                <div className="mb-2.5 flex items-start justify-between gap-2">
                  <div
                    className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold lg:h-7 lg:min-w-7 lg:px-2 lg:text-sm ${
                      day.isToday
                        ? "bg-[#8e63f5] text-white"
                        : day.isCurrentMonth
                          ? "text-slate-700"
                          : "text-slate-300"
                    }`}
                  >
                    {day.date.getDate()}
                  </div>
                  {day.bookings.length > 0 && (
                    <span className="text-[10px] font-semibold text-slate-400">
                      {day.bookings.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  {day.bookings.slice(0, 3).map((booking) => (
                    <button
                      key={booking.id}
                      className={`block w-full rounded-lg border px-2 py-1 text-left text-[9px] font-semibold leading-tight lg:text-[10px] ${eventColor(
                        booking.service_id,
                        booking.status
                      )}`}
                      onClick={() => setSelectedBooking(booking)}
                      type="button"
                    >
                      <div>{booking.booking_time.slice(0, 5)}</div>
                      <div className="truncate">{booking.user_name}</div>
                    </button>
                  ))}

                  {day.bookings.length > 3 && (
                    <div className="text-[10px] font-semibold text-slate-400">
                      +{day.bookings.length - 3} ещё
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="admin-card p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="admin-chip">
                Выбранная запись
              </div>
              <h2 className="mt-4 text-3xl font-bold text-slate-900">
                Детали и действия
              </h2>
            </div>
          </div>

          {selectedBooking ? (
            <div className="mt-6 space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {selectedBooking.service_name}
                  </h3>
                  <BookingStatusBadge status={selectedBooking.status} />
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-500 md:grid-cols-2">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Клиент
                    </div>
                    <div className="mt-1 font-semibold text-slate-900">
                      {selectedBooking.user_name}
                    </div>
                    <div>{selectedBooking.user_email}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Визит
                    </div>
                    <div className="mt-1 font-semibold text-slate-900">
                      {new Date(selectedBooking.booking_date).toLocaleDateString(
                        "ru-RU",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric"
                        }
                      )}
                    </div>
                    <div>{selectedBooking.booking_time.slice(0, 5)}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <BookingAdminActions
                  fullWidth
                  onAction={(status) => handleStatusChange(selectedBooking.id, status)}
                  onDelete={() => handleDelete(selectedBooking.id)}
                  status={selectedBooking.status}
                />
              </div>

              {["completed", "cancelled"].includes(selectedBooking.status) && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Для этой записи все действия уже завершены.
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-500">
              Выберите запись в календарной сетке, чтобы увидеть детали.
            </div>
          )}
        </section>

        <section className="admin-card p-5 md:p-6">
          <div className="admin-chip">
            Рабочие часы
          </div>
          <h2 className="mt-4 text-3xl font-bold text-slate-900">
            Настройки расписания
          </h2>
          <div className="mt-6 space-y-4">
            {hours.map((day) => (
              <div
                key={day.day_of_week}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="font-semibold text-slate-900">
                    {workDays[day.day_of_week]}
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-500">
                    <input
                      checked={day.is_working}
                      onChange={(event) =>
                        handleHourChange(
                          day.day_of_week,
                          "is_working",
                          event.target.checked
                        )
                      }
                      type="checkbox"
                    />
                    Рабочий
                  </label>
                </div>
                <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
                  <input
                    className="time-field"
                    onChange={(event) =>
                      handleHourChange(
                        day.day_of_week,
                        "start_time",
                        event.target.value
                      )
                    }
                    type="time"
                    value={day.start_time.slice(0, 5)}
                  />
                  <input
                    className="time-field"
                    onChange={(event) =>
                      handleHourChange(
                        day.day_of_week,
                        "end_time",
                        event.target.value
                      )
                    }
                    type="time"
                    value={day.end_time.slice(0, 5)}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
