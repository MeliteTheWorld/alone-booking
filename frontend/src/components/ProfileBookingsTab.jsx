import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useNotifications } from "../context/NotificationsContext.jsx";
import BookingStatusBadge from "./BookingStatusBadge.jsx";
import Button from "./Button.jsx";
import DatePickerField from "./DatePickerField.jsx";
import Modal from "./Modal.jsx";
import { getLocalIsoDate } from "../utils/date.js";

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function todayString() {
  return getLocalIsoDate();
}

function getStateNote(status) {
  if (status === "in_progress") {
    return {
      tone: "info",
      text: "Услуга уже в работе. Изменение времени и отмена недоступны."
    };
  }

  if (status === "completed") {
    return {
      tone: "success",
      text: "Услуга оказана. Запись переведена в завершённые."
    };
  }

  return null;
}

export default function ProfileBookingsTab() {
  const { refresh: refreshNotifications } = useNotifications();
  const [bookings, setBookings] = useState([]);
  const [editing, setEditing] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const canManageBooking = (status) => ["pending", "confirmed"].includes(status);

  const loadSlots = async (payload) => {
    setSlotsLoading(true);
    try {
      const response = await api.schedule.getSlots(
        payload.serviceId,
        payload.date,
        payload.workerId,
        payload.id
      );
      setSlots(response.slots);
    } catch (loadError) {
      setError(loadError.message);
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      setError("");
      await api.bookings.cancel(id);
      await refreshNotifications({ silent: true });
      await loadBookings();
    } catch (cancelError) {
      setError(cancelError.message);
    }
  };

  const openEditor = async (booking) => {
    const nextEditing = {
      id: booking.id,
      serviceId: booking.service_id,
      serviceName: booking.service_name,
      workerId: booking.worker_id,
      workerName: booking.worker_name || "Не назначен",
      date: booking.booking_date.slice(0, 10),
      time: booking.booking_time.slice(0, 5),
      duration: booking.duration,
      price: booking.price
    };

    setEditing(nextEditing);
    setSlots([]);
    await loadSlots(nextEditing);
  };

  const closeEditor = () => {
    setEditing(null);
    setSlots([]);
    setSlotsLoading(false);
  };

  const updateDate = async (date) => {
    const nextEditing = { ...editing, date, time: "" };
    setEditing(nextEditing);
    await loadSlots(nextEditing);
  };

  const submitReschedule = async () => {
    try {
      setSaving(true);
      setError("");
      await api.bookings.update(editing.id, {
        booking_date: editing.date,
        booking_time: editing.time
      });
      await refreshNotifications({ silent: true });
      closeEditor();
      await loadBookings();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {error && <div className="ui-alert-error">{error}</div>}

      {bookings.length ? (
        bookings.map((booking) => {
          const stateNote = getStateNote(booking.status);

          return (
            <article key={booking.id} className="admin-card p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-display text-2xl font-bold text-slate-900">
                      {booking.service_name}
                    </h2>
                    <BookingStatusBadge status={booking.status} />
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-500 md:grid-cols-2">
                    <div>
                      <span className="font-semibold text-slate-700">Дата и время:</span>{" "}
                      {formatDate(booking.booking_date)} в {booking.booking_time.slice(0, 5)}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Исполнитель:</span>{" "}
                      {booking.worker_name || "Не назначен"}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Длительность:</span>{" "}
                      {booking.duration} минут
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Стоимость:</span>{" "}
                      {Number(booking.price).toLocaleString("ru-RU")} ₽
                    </div>
                  </div>

                  {stateNote && (
                    <div
                      className={`mt-4 ${
                        stateNote.tone === "success" ? "ui-alert-success" : "ui-alert-info"
                      }`}
                    >
                      {stateNote.text}
                    </div>
                  )}
                </div>

                {canManageBooking(booking.status) && (
                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <Button
                      className="w-full sm:w-auto"
                      onClick={() => openEditor(booking)}
                      type="button"
                      variant="secondary"
                    >
                      Изменить время
                    </Button>
                    <Button
                      className="w-full sm:w-auto"
                      onClick={() => handleCancel(booking.id)}
                      type="button"
                      variant="danger"
                    >
                      Отменить
                    </Button>
                  </div>
                )}
              </div>
            </article>
          );
        })
      ) : (
        <div className="admin-card px-5 py-6 text-sm text-slate-500">
          У вас пока нет записей. Выберите услугу и создайте первое бронирование.
        </div>
      )}

      <Modal
        description={
          editing
            ? "Выберите новую дату и свободный слот. После сохранения запись обновится и снова уйдёт на проверку."
            : ""
        }
        footer={
          <>
            <Button onClick={closeEditor} type="button" variant="secondary">
              Отмена
            </Button>
            <Button
              disabled={!editing?.time}
              loading={saving}
              onClick={submitReschedule}
              type="button"
              variant={editing?.time ? "primary" : "disabled"}
            >
              Сохранить перенос
            </Button>
          </>
        }
        onClose={closeEditor}
        open={Boolean(editing)}
        title={editing ? "Изменить время записи" : ""}
        widthClassName="max-w-2xl"
      >
        {editing && (
          <div className="space-y-5">
            <div className="ui-card-muted px-4 py-4">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                Запись
              </div>
              <div className="mt-2 text-lg font-semibold text-slate-900">
                {editing.serviceName}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                {editing.workerName} • {editing.duration} минут •{" "}
                {Number(editing.price).toLocaleString("ru-RU")} ₽
              </div>
            </div>

            <DatePickerField
              label="Новая дата"
              min={todayString()}
              onChange={updateDate}
              value={editing.date}
            />

            <div>
              <div className="ui-label">Свободные слоты</div>
              {slotsLoading ? (
                <div className="ui-alert border-slate-200 bg-slate-50 text-slate-500">
                  Загружаем свободное время...
                </div>
              ) : slots.length ? (
                <div className="ui-slot-grid">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      className={`ui-slot-button ${
                        editing.time === slot ? "ui-slot-button-active" : ""
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
                  На выбранную дату свободных слотов нет
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
