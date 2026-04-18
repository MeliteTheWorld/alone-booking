import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import AdminBookingListCard from "../components/AdminBookingListCard.jsx";
import BookingAdminActions from "../components/BookingAdminActions.jsx";
import BookingStatusBadge from "../components/BookingStatusBadge.jsx";
import Button from "../components/Button.jsx";
import SelectField from "../components/SelectField.jsx";
import { useConfirmDialog } from "../context/ConfirmDialogContext.jsx";
import { useNotifications } from "../context/NotificationsContext.jsx";
import { getLocalIsoDate } from "../utils/date.js";

const weekDays = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatIso(date) {
  return getLocalIsoDate(date);
}

function monthTitle(date) {
  return date.toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric"
  });
}

function sameDay(left, right) {
  return formatIso(left) === formatIso(right);
}

function formatDayLabel(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    weekday: "long"
  });
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

function sortBookings(left, right) {
  return `${left.booking_date}T${left.booking_time}`.localeCompare(
    `${right.booking_date}T${right.booking_time}`
  );
}

function getDayStatusSummary(bookings) {
  const counts = bookings.reduce((acc, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1;
    return acc;
  }, {});

  return [
    {
      key: "pending",
      count: counts.pending || 0,
      className: "bg-amber-400"
    },
    {
      key: "confirmed",
      count: counts.confirmed || 0,
      className: "bg-violet-500"
    },
    {
      key: "in_progress",
      count: counts.in_progress || 0,
      className: "bg-cyan-500"
    },
    {
      key: "completed",
      count: counts.completed || 0,
      className: "bg-emerald-500"
    },
    {
      key: "cancelled",
      count: counts.cancelled || 0,
      className: "bg-slate-300"
    }
  ].filter((item) => item.count > 0);
}

const statusVisualMap = {
  all: {
    dot: "bg-slate-300",
    text: "text-slate-700",
    pill: "bg-slate-100 text-slate-700"
  },
  pending: {
    dot: "bg-amber-400",
    text: "text-amber-700",
    pill: "bg-amber-50 text-amber-700"
  },
  confirmed: {
    dot: "bg-violet-500",
    text: "text-violet-700",
    pill: "bg-violet-50 text-violet-700"
  },
  in_progress: {
    dot: "bg-cyan-500",
    text: "text-cyan-700",
    pill: "bg-cyan-50 text-cyan-700"
  },
  completed: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    pill: "bg-emerald-50 text-emerald-700"
  },
  cancelled: {
    dot: "bg-slate-400",
    text: "text-slate-500",
    pill: "bg-slate-100 text-slate-500"
  }
};

export default function BookingsPage() {
  const [searchParams] = useSearchParams();
  const confirm = useConfirmDialog();
  const { refresh: refreshNotifications } = useNotifications();
  const initialDate = searchParams.get("date") || getLocalIsoDate();
  const initialBookingId = searchParams.get("bookingId");
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedBookingId, setSelectedBookingId] = useState(initialBookingId);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const targetDate = new Date(`${initialDate}T00:00:00`);
    return new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
  });
  const [viewMode, setViewMode] = useState("active");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [workerFilter, setWorkerFilter] = useState("all");

  const loadData = async () => {
    try {
      const bookingsPayload = await api.bookings.getAll();
      setBookings(bookingsPayload);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const nextDate = searchParams.get("date");
    const nextBookingId = searchParams.get("bookingId");

    if (nextDate) {
      setSelectedDate(nextDate);
      const targetDate = new Date(`${nextDate}T00:00:00`);
      setCurrentMonth(new Date(targetDate.getFullYear(), targetDate.getMonth(), 1));
    }

    if (nextBookingId) {
      setSelectedBookingId(nextBookingId);
    }
  }, [searchParams]);

  const serviceOptions = useMemo(
    () =>
      [{ value: "all", label: "Все услуги" }].concat(
      Array.from(
        new Map(bookings.map((booking) => [booking.service_id, booking.service_name]))
      ).map(([id, name]) => ({ value: String(id), label: name }))
      ),
    [bookings]
  );

  const workerOptions = useMemo(
    () =>
      [{ value: "all", label: "Все исполнители" }].concat(
      Array.from(
        new Map(bookings.map((booking) => [booking.worker_id, booking.worker_name]))
      ).map(([id, name]) => ({ value: String(id), label: name }))
      ),
    [bookings]
  );

  const statusOptions = useMemo(
    () =>
      viewMode === "archive"
        ? [
            { value: "all", label: "Все архивные" },
            { value: "completed", label: "Оказаны" }
          ]
        : [
            { value: "all", label: "Все статусы" },
            { value: "pending", label: "Ожидают" },
            { value: "confirmed", label: "Подтверждены" },
            { value: "in_progress", label: "В работе" },
            { value: "cancelled", label: "Отменены" }
          ],
    [viewMode]
  );

  const filteredBookings = useMemo(
    () =>
      bookings
        .filter((booking) =>
          viewMode === "archive"
            ? booking.status === "completed"
            : booking.status !== "completed"
        )
        .filter((booking) =>
          statusFilter === "all" ? true : booking.status === statusFilter
        )
        .filter((booking) =>
          serviceFilter === "all"
            ? true
            : String(booking.service_id) === serviceFilter
        )
        .filter((booking) =>
          workerFilter === "all" ? true : String(booking.worker_id) === workerFilter
        )
        .sort(sortBookings),
    [bookings, viewMode, statusFilter, serviceFilter, workerFilter]
  );

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

  const selectedDayBookings = useMemo(
    () => [...(bookingsByDate[selectedDate] || [])].sort(sortBookings),
    [bookingsByDate, selectedDate]
  );

  const selectedBooking =
    selectedDayBookings.find(
      (booking) => String(booking.id) === String(selectedBookingId)
    ) ||
    selectedDayBookings[0] ||
    null;

  useEffect(() => {
    if (!selectedDayBookings.length) {
      setSelectedBookingId(null);
      return;
    }

    if (
      !selectedDayBookings.some(
        (booking) => String(booking.id) === String(selectedBookingId)
      )
    ) {
      setSelectedBookingId(selectedDayBookings[0].id);
    }
  }, [selectedDayBookings, selectedBookingId]);

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
    const approved = await confirm({
      title: "Удалить запись?",
      description: "Запись будет полностью удалена из системы.",
      confirmText: "Да, удалить",
      cancelText: "Нет",
      tone: "danger"
    });

    if (!approved) {
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

  const resetFilters = () => {
    setStatusFilter("all");
    setServiceFilter("all");
    setWorkerFilter("all");
  };

  const archiveCount = useMemo(
    () => bookings.filter((booking) => booking.status === "completed").length,
    [bookings]
  );

  const activeCount = useMemo(
    () => bookings.filter((booking) => booking.status !== "completed").length,
    [bookings]
  );

  return (
    <div className="space-y-5 md:space-y-6">
      <section className="admin-card p-4 sm:p-5 md:p-6">
        <div className="ui-section-header">
          <div className="ui-section-copy">
            <div className="admin-chip">Записи</div>
            <h1 className="ui-section-title">Календарь и управление бронированиями</h1>
            <p className="ui-section-description">
              Основной экран для ежедневной работы с записями: выбирайте дату,
              просматривайте список визитов и быстро управляйте статусами. Оказанные
              услуги автоматически уводятся в архив, чтобы не перегружать рабочий календарь.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button
            onClick={() => {
              setViewMode("active");
              setStatusFilter("all");
            }}
            type="button"
            variant={viewMode === "active" ? "primary" : "secondary"}
          >
            Активные
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
              {activeCount}
            </span>
          </Button>
          <Button
            onClick={() => {
              setViewMode("archive");
              setStatusFilter("all");
            }}
            type="button"
            variant={viewMode === "archive" ? "primary" : "secondary"}
            >
              Архив
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
                {archiveCount}
              </span>
            </Button>
          <div className="w-full sm:ml-auto sm:w-auto">
            <Button
              className="w-full !min-h-12 !rounded-2xl sm:w-auto"
              onClick={() => {
                const today = new Date();
                setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                setSelectedDate(getLocalIsoDate());
              }}
              type="button"
              variant="secondary"
            >
              Сегодня
            </Button>
          </div>
        </div>

        <div className="mt-5 grid items-end gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
          <SelectField
            label="Статус"
            onChange={setStatusFilter}
            options={statusOptions}
            renderOption={(option, isActive) => {
              const style = statusVisualMap[option.value] || statusVisualMap.all;

              return (
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                  <span className={`font-medium ${isActive ? style.text : "text-slate-700"}`}>
                    {option.label}
                  </span>
                </div>
              );
            }}
            renderValue={(option) => {
              const style = statusVisualMap[option.value] || statusVisualMap.all;

              return (
                <span
                  className={`inline-flex max-w-full items-center gap-2 rounded-full px-2.5 py-0.5 text-sm font-semibold ${style.pill}`}
                >
                  <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                  <span className="truncate">{option.label}</span>
                </span>
              );
            }}
            value={statusFilter}
          />
          <SelectField
            label="Услуга"
            onChange={setServiceFilter}
            options={serviceOptions}
            value={serviceFilter}
          />
          <SelectField
            label="Исполнитель"
            onChange={setWorkerFilter}
            options={workerOptions}
            value={workerFilter}
          />
          <div className="flex items-end">
            <Button
              className="w-full !min-h-12 !rounded-2xl lg:w-auto"
              onClick={resetFilters}
              type="button"
              variant="secondary"
            >
              Сбросить фильтры
            </Button>
          </div>
        </div>

        {error && <div className="ui-alert-error mt-4">{error}</div>}
        {message && <div className="ui-alert-info mt-4">{message}</div>}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_420px]">
        <section className="admin-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-5 md:px-6">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                  {viewMode === "archive" ? "Архив записей" : "Календарь записей"}
                </div>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  {monthTitle(currentMonth)}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="admin-secondary !h-10 !w-10 !rounded-xl !px-0 !py-0"
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                  )
                }
                type="button"
              >
                ‹
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
                ›
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-slate-200 bg-white">
            {weekDays.map((day) => (
              <div
                key={day}
                className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:text-[11px]"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day) => {
              const isSelected = day.iso === selectedDate;
              const statusSummary = getDayStatusSummary(day.bookings);

              return (
                <button
                  key={day.iso}
                  className={`min-h-[68px] border-b border-r p-2 text-left transition sm:min-h-[76px] sm:p-2.5 ${
                    day.isCurrentMonth ? "bg-white" : "bg-slate-50"
                  } ${
                    isSelected
                      ? "bg-violet-50/60 ring-2 ring-inset ring-violet-300"
                      : ""
                  } border-slate-200`}
                  onClick={() => setSelectedDate(day.iso)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-semibold ${
                        isSelected
                          ? "bg-violet-600 text-white"
                          : day.isToday
                            ? "bg-violet-50 text-violet-700"
                            : day.isCurrentMonth
                              ? "text-slate-700"
                              : "text-slate-300"
                      }`}
                    >
                      {day.date.getDate()}
                    </div>
                    {day.bookings.length > 0 && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                          isSelected
                            ? "bg-white text-violet-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {day.bookings.length}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex min-h-4 items-center gap-1">
                    {statusSummary.slice(0, 4).map((item) => (
                      <span
                        key={item.key}
                        className={`h-1.5 w-1.5 rounded-full ${item.className}`}
                      />
                    ))}
                    {statusSummary.length > 4 && (
                      <span className="text-[9px] font-semibold text-slate-400">
                        +{statusSummary.length - 4}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <div className="space-y-6">
          <section className="admin-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                  {viewMode === "archive" ? "Архив за день" : "Выбранный день"}
                </div>
                <h2 className="mt-2 text-xl font-bold capitalize text-slate-900">
                  {formatDayLabel(selectedDate)}
                </h2>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                {selectedDayBookings.length} записей
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                onClick={() =>
                  setSelectedDate(
                    getLocalIsoDate(addDays(new Date(`${selectedDate}T00:00:00`), -1))
                  )
                }
                type="button"
                variant="secondary"
              >
                ← День назад
              </Button>
              <Button
                onClick={() =>
                  setSelectedDate(
                    getLocalIsoDate(addDays(new Date(`${selectedDate}T00:00:00`), 1))
                  )
                }
                type="button"
                variant="secondary"
              >
                День вперёд →
              </Button>
            </div>

            <div className="mt-5 space-y-3">
              {selectedDayBookings.length ? (
                selectedDayBookings.map((booking) => (
                  <AdminBookingListCard
                    booking={booking}
                    key={booking.id}
                    onClick={() => setSelectedBookingId(booking.id)}
                    selected={String(selectedBooking?.id) === String(booking.id)}
                  />
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  {viewMode === "archive"
                    ? "На выбранную дату в архиве ничего нет."
                    : "На выбранную дату активных записей нет."}
                </div>
              )}
            </div>
          </section>

          <section className="admin-card p-4 sm:p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
              Детали записи
            </div>
            {selectedBooking ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-bold text-slate-900">
                      {selectedBooking.service_name}
                    </h3>
                    <BookingStatusBadge status={selectedBooking.status} />
                  </div>

                  <div className="mt-5 grid gap-x-5 gap-y-4 text-sm text-slate-500 sm:grid-cols-2">
                    <div>
                      <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                        Клиент
                      </div>
                      <div className="mt-2 text-lg font-semibold leading-tight text-slate-900">
                        {selectedBooking.user_name}
                      </div>
                      <div className="mt-1 break-all text-sm leading-5 text-slate-500">
                        {selectedBooking.user_email}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                        Исполнитель
                      </div>
                      <div className="mt-2 text-lg font-semibold leading-tight text-slate-900">
                        {selectedBooking.worker_name}
                      </div>
                      <div className="mt-1 text-sm leading-5 text-slate-500">
                        {selectedBooking.worker_position}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                        Визит
                      </div>
                      <div className="mt-2 text-base font-semibold leading-tight text-slate-900">
                        {new Date(selectedBooking.booking_date).toLocaleDateString(
                          "ru-RU",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric"
                          }
                        )}
                      </div>
                      <div className="mt-1 text-sm leading-5 text-slate-500">
                        {selectedBooking.booking_time.slice(0, 5)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                        Длительность
                      </div>
                      <div className="mt-2 text-base font-semibold leading-tight text-slate-900">
                        {selectedBooking.duration_minutes || selectedBooking.duration} минут
                      </div>
                      <div className="mt-1 text-sm font-semibold leading-5 text-slate-700">
                        {Number(selectedBooking.price).toLocaleString("ru-RU")} ₽
                      </div>
                    </div>
                  </div>
                </div>

                <BookingAdminActions
                  fullWidth
                  onAction={(status) => handleStatusChange(selectedBooking.id, status)}
                  onDelete={() => handleDelete(selectedBooking.id)}
                  status={selectedBooking.status}
                />
              </div>
            ) : (
              <div className="mt-4 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Выберите запись в списке дня, чтобы открыть детали и действия.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
