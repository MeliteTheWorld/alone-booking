import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import AnimatedCollapse from "./AnimatedCollapse.jsx";
import BookingStatusBadge from "./BookingStatusBadge.jsx";

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M7 3v4M17 3v4M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default function ProfileBookingsTab() {
  const [bookings, setBookings] = useState([]);
  const [editing, setEditing] = useState(null);
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState("");

  const loadBookings = async () => {
    try {
      setBookings(await api.bookings.getAll());
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (id) => {
    try {
      await api.bookings.cancel(id);
      await loadBookings();
    } catch (cancelError) {
      setError(cancelError.message);
    }
  };

  const openEditor = async (booking) => {
    const bookingDate = booking.booking_date.slice(0, 10);
    setEditing({
      id: booking.id,
      serviceId: booking.service_id,
      date: bookingDate,
      time: booking.booking_time.slice(0, 5)
    });

    try {
      const response = await api.schedule.getSlots(
        booking.service_id,
        bookingDate,
        booking.id
      );
      setSlots(response.slots);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  const updateDate = async (date) => {
    const nextEditing = { ...editing, date, time: "" };
    setEditing(nextEditing);

    try {
      const response = await api.schedule.getSlots(
        nextEditing.serviceId,
        date,
        nextEditing.id
      );
      setSlots(response.slots);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  const submitReschedule = async () => {
    try {
      await api.bookings.update(editing.id, {
        booking_date: editing.date,
        booking_time: editing.time
      });
      setEditing(null);
      setSlots([]);
      await loadBookings();
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  const canManageBooking = (status) => ["pending", "confirmed"].includes(status);

  return (
    <div className="space-y-5">
      {error && <div className="admin-card border-fuchsia-200 bg-fuchsia-50 px-5 py-4 text-sm text-fuchsia-700">{error}</div>}

      {bookings.length ? (
        bookings.map((booking) => {
          const isEditingCurrent = editing?.id === booking.id;
          const editorDate = isEditingCurrent
            ? editing.date
            : booking.booking_date.slice(0, 10);
          const editorTime = isEditingCurrent ? editing.time : "";

          return (
            <article
              key={booking.id}
              className="admin-card grid gap-4 p-5 md:p-6 lg:grid-cols-[1fr_auto]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-2xl font-bold text-slate-900">
                    {booking.service_name}
                  </h2>
                  <BookingStatusBadge status={booking.status} />
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  {formatDate(booking.booking_date)} в {booking.booking_time.slice(0, 5)}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Длительность: {booking.duration} минут • Стоимость:{" "}
                  {Number(booking.price).toLocaleString("ru-RU")} ₽
                </p>

                <AnimatedCollapse
                  className="mt-5"
                  open={isEditingCurrent && canManageBooking(booking.status)}
                >
                  <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <label className="block">
                      <span className="ui-label">Новая дата</span>
                      <div className="ui-field-wrap">
                        <input
                          className="ui-date-field"
                          min={todayString()}
                          onChange={(event) => updateDate(event.target.value)}
                          type="date"
                          value={editorDate}
                        />
                        <span className="ui-field-icon">
                          <CalendarIcon />
                        </span>
                      </div>
                    </label>
                    <div>
                      <div className="ui-label">Свободные слоты</div>
                      {slots.length ? (
                        <div className="ui-slot-grid">
                          {slots.map((slot) => (
                            <button
                              key={slot}
                              className={`ui-slot-button ${
                                editorTime === slot ? "ui-slot-button-active" : ""
                              }`}
                              onClick={() =>
                                setEditing((current) => ({
                                  ...current,
                                  time: slot
                                }))
                              }
                              type="button"
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="ui-slot-button ui-slot-button-disabled w-full justify-center">
                          Свободные слоты не найдены
                        </div>
                      )}
                    </div>
                    <button
                      className="admin-primary"
                      disabled={!editorTime}
                      onClick={submitReschedule}
                      type="button"
                    >
                      Сохранить перенос
                    </button>
                  </div>
                </AnimatedCollapse>
              </div>

              {canManageBooking(booking.status) && (
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <button
                    className="admin-secondary w-full sm:w-auto"
                    onClick={() => openEditor(booking)}
                    type="button"
                  >
                    Изменить время
                  </button>
                  <button
                    className="admin-danger w-full sm:w-auto"
                    onClick={() => handleCancel(booking.id)}
                    type="button"
                  >
                    Отменить
                  </button>
                </div>
              )}

              {booking.status === "in_progress" && (
                <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-700">
                  Услуга уже в работе. Изменение времени и отмена недоступны.
                </div>
              )}

              {booking.status === "completed" && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Услуга оказана. Запись переведена в завершённые.
                </div>
              )}
            </article>
          );
        })
      ) : (
        <div className="admin-card px-5 py-6 text-sm text-slate-500">
          У вас пока нет записей. Выберите услугу и создайте первое бронирование.
        </div>
      )}
    </div>
  );
}
