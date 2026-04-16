import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function ChevronIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
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

export default function BookingPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(
    searchParams.get("serviceId") || ""
  );
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAdmin) {
    return <Navigate replace to="/admin?tab=calendar" />;
  }

  useEffect(() => {
    api.services
      .getAll()
      .then(setServices)
      .catch((loadError) => setError(loadError.message));
  }, []);

  useEffect(() => {
    async function loadSlots() {
      if (!selectedService || !selectedDate) {
        setSlots([]);
        return;
      }

      try {
        const response = await api.schedule.getSlots(selectedService, selectedDate);
        setSlots(response.slots);
        setSelectedTime("");
      } catch (loadError) {
        setError(loadError.message);
      }
    }

    loadSlots();
  }, [selectedService, selectedDate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await api.bookings.create({
        service_id: Number(selectedService),
        booking_date: selectedDate,
        booking_time: selectedTime
      });
      setMessage("Запись создана. Администратор увидит её в календаре.");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="surface p-8">
        <div className="chip">Онлайн-запись</div>
        <h1 className="mt-4 font-display text-4xl font-bold text-slate-900">
          Записаться на услугу
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
          Клиент выбирает услугу, дату и свободный слот. Сервис учитывает
          длительность процедуры и уже существующие бронирования.
        </p>

        {!isAuthenticated && (
          <div className="mt-6 rounded-3xl border border-violet-200 bg-violet-50 p-5 text-sm text-violet-700">
            Для подтверждения записи нужен аккаунт клиента.{" "}
            <Link className="font-semibold underline" to="/auth?mode=login">
              Войти
            </Link>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="ui-label">Услуга</span>
            <div className="ui-field-wrap">
              <select
                className="ui-select-field"
                onChange={(event) => setSelectedService(event.target.value)}
                value={selectedService}
              >
                <option value="">Выберите услугу</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} • {service.staff_name || "Не назначен"} • {service.duration} мин •{" "}
                    {Number(service.price).toLocaleString("ru-RU")} ₽
                  </option>
                ))}
              </select>
              <span className="ui-field-icon">
                <ChevronIcon />
              </span>
            </div>
          </label>

          <label className="block">
            <span className="ui-label">Дата</span>
            <div className="ui-field-wrap">
              <input
                className="ui-date-field"
                min={todayString()}
                onChange={(event) => setSelectedDate(event.target.value)}
                type="date"
                value={selectedDate}
              />
              <span className="ui-field-icon">
                <CalendarIcon />
              </span>
            </div>
          </label>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-700">Время</div>
            <div className="mt-3">
              {slots.length ? (
                <div className="ui-slot-grid">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      className={`ui-slot-button ${
                        selectedTime === slot ? "ui-slot-button-active" : ""
                      }`}
                      onClick={() => setSelectedTime(slot)}
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
          </div>

          {error && <div className="text-sm text-fuchsia-700">{error}</div>}
          {message && <div className="text-sm text-violet-700">{message}</div>}

          <button
            className="btn-primary w-full"
            disabled={!isAuthenticated || !selectedTime || submitting}
            type="submit"
          >
            {submitting ? "Сохраняем..." : "Подтвердить запись"}
          </button>
        </form>
      </section>

      <aside className="surface p-8">
        <h2 className="font-display text-3xl font-bold text-slate-900">Как это работает</h2>
        <div className="mt-5 space-y-4 text-sm leading-7 text-slate-500">
          <p>
            Свободные слоты рассчитываются автоматически на основе рабочих часов
            и длительности услуги.
          </p>
          <p>
            При попытке занять уже занятый интервал backend вернёт конфликт, а
            пользователь увидит понятное сообщение.
          </p>
          <p>
            После создания запись попадает в раздел «Мои записи» и календарь
            администратора.
          </p>
        </div>
      </aside>
    </div>
  );
}
