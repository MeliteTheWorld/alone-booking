import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import DatePickerField from "../components/DatePickerField.jsx";
import SelectField from "../components/SelectField.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateLabel(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
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
  const selectedServiceMeta =
    services.find((service) => String(service.id) === String(selectedService)) || null;

  const serviceOptions = services.map((service) => ({
    value: String(service.id),
    service
  }));

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
      setSlots((currentSlots) =>
        currentSlots.filter((slot) => slot !== selectedTime)
      );
      setSelectedTime("");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="surface p-6 md:p-8 xl:p-10">
        <div className="chip">Онлайн-запись</div>
        <h1 className="mt-4 font-display text-3xl font-bold text-slate-900 md:text-4xl">
          Записаться на услугу
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
          Выберите услугу, дату и удобный слот. Мы сразу покажем свободное окно,
          мастера, длительность и итоговую стоимость визита.
        </p>

        {!isAuthenticated && (
          <div className="mt-6 rounded-3xl border border-violet-200 bg-violet-50 p-5 text-sm text-violet-700">
            Для подтверждения записи нужен аккаунт клиента.{" "}
            <Link className="font-semibold underline" to="/auth?mode=login">
              Войти
            </Link>
          </div>
        )}

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 lg:grid-cols-2">
              <SelectField
                label="Услуга"
                onChange={setSelectedService}
                options={serviceOptions}
                placeholder="Выберите услугу"
                renderOption={(option, isActive) => (
                  <div>
                    <div className={`font-semibold ${isActive ? "text-violet-700" : "text-slate-900"}`}>
                      {option.service.name}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {option.service.staff_name || "Не назначен"} • {option.service.duration} мин •{" "}
                      {Number(option.service.price).toLocaleString("ru-RU")} ₽
                    </div>
                  </div>
                )}
                renderValue={(option) => (
                  <span className="block truncate">
                    {option.service.name} • {option.service.staff_name || "Не назначен"} • {option.service.duration} мин •{" "}
                    {Number(option.service.price).toLocaleString("ru-RU")} ₽
                  </span>
                )}
                value={selectedService}
              />

              <DatePickerField
                label="Дата визита"
                min={todayString()}
                onChange={setSelectedDate}
                value={selectedDate}
              />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-700">Свободные слоты</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {selectedServiceMeta
                      ? `На ${formatDateLabel(selectedDate)} доступно ${slots.length} вариантов`
                      : "Сначала выберите услугу, чтобы увидеть доступное время"}
                  </div>
                </div>
                {selectedTime && (
                  <div className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-700">
                    Выбрано: {selectedTime}
                  </div>
                )}
              </div>

              <div className="mt-4">
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
                    {selectedServiceMeta
                      ? "На выбранную дату свободных слотов нет"
                      : "Выберите услугу, чтобы увидеть время"}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50 px-4 py-3 text-sm text-fuchsia-700">
                {error}
              </div>
            )}
            {message && (
              <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-700">
                {message}
              </div>
            )}

            <button
              className="btn-primary w-full"
              disabled={!isAuthenticated || !selectedTime || submitting}
              type="submit"
            >
              {submitting ? "Сохраняем..." : "Подтвердить запись"}
            </button>
          </form>

          <div className="space-y-5">
            <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 md:p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                Сводка визита
              </div>
              {selectedServiceMeta ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {selectedServiceMeta.name}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {selectedServiceMeta.description}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                      <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                        Исполнитель
                      </div>
                      <div className="mt-2 font-semibold text-slate-900">
                        {selectedServiceMeta.staff_name || "Не назначен"}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                      <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                        Длительность
                      </div>
                      <div className="mt-2 font-semibold text-slate-900">
                        {selectedServiceMeta.duration} минут
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                      <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                        Стоимость
                      </div>
                      <div className="mt-2 font-semibold text-slate-900">
                        {Number(selectedServiceMeta.price).toLocaleString("ru-RU")} ₽
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                      <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                        Дата и время
                      </div>
                      <div className="mt-2 font-semibold text-slate-900">
                        {formatDateLabel(selectedDate)}
                        {selectedTime ? ` • ${selectedTime}` : ""}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
                  Выберите услугу, чтобы увидеть мастера, длительность, стоимость и
                  итоговую сводку по визиту.
                </div>
              )}
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 md:p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                Что дальше
              </div>
              <div className="mt-4 space-y-3">
                {[
                  "После подтверждения запись сразу попадёт в ваш профиль.",
                  "Администратор увидит заявку в календаре и подтвердит время.",
                  "Если планы изменятся, запись можно перенести или отменить из профиля."
                ].map((item, index) => (
                  <div
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    key={item}
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                      {index + 1}
                    </div>
                    <div className="text-sm leading-6 text-slate-600">{item}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
