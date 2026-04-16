import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

function todayString() {
  return new Date().toISOString().slice(0, 10);
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
          <select
            className="field"
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

          <input
            className="field"
            min={todayString()}
            onChange={(event) => setSelectedDate(event.target.value)}
            type="date"
            value={selectedDate}
          />

          <select
            className="field"
            disabled={!slots.length}
            onChange={(event) => setSelectedTime(event.target.value)}
            required
            value={selectedTime}
          >
            <option value="">
              {slots.length ? "Выберите время" : "Свободные слоты не найдены"}
            </option>
            {slots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>

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
