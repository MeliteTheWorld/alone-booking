import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import Button from "../components/Button.jsx";
import DatePickerField from "../components/DatePickerField.jsx";
import SelectField from "../components/SelectField.jsx";
import { useConfirmDialog } from "../context/ConfirmDialogContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifications } from "../context/NotificationsContext.jsx";
import { getLocalIsoDate } from "../utils/date.js";

function todayString() {
  return getLocalIsoDate();
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
  const { refresh: refreshNotifications } = useNotifications();
  const confirm = useConfirmDialog();
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(
    searchParams.get("serviceId") || ""
  );
  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const selectedServiceMeta =
    services.find((service) => String(service.id) === String(selectedService)) || null;
  const selectedWorkerMeta =
    selectedServiceMeta?.workers?.find(
      (worker) => String(worker.id) === String(selectedWorker)
    ) || null;
  const hasAssignedWorkers = (selectedServiceMeta?.workers || []).length > 0;

  const serviceOptions = services.map((service) => ({
    value: String(service.id),
    service
  }));

  const submitDisabledReason = (() => {
    if (!isAuthenticated) {
      return "Войдите в аккаунт";
    }

    if (!selectedService) {
      return "Выберите услугу";
    }

    if (!hasAssignedWorkers) {
      return "Нет доступных исполнителей";
    }

    if (!selectedWorker) {
      return "Выберите исполнителя";
    }

    if (!selectedDate) {
      return "Выберите дату";
    }

    if (!selectedTime) {
      return slots.length ? "Выберите время" : "Нет свободного времени";
    }

    if (submitting) {
      return "Сохраняем...";
    }

    return "";
  })();
  const canSubmit = !submitDisabledReason || submitDisabledReason === "Сохраняем...";

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
      if (!selectedService || !selectedWorker || !selectedDate) {
        setSlots([]);
        return;
      }

      try {
        const response = await api.schedule.getSlots(
          selectedService,
          selectedDate,
          selectedWorker
        );
        setSlots(response.slots);
        setSelectedTime("");
      } catch (loadError) {
        setError(loadError.message);
      }
    }

    loadSlots();
  }, [selectedService, selectedWorker, selectedDate]);

  useEffect(() => {
    setSelectedWorker("");
    setSelectedTime("");
  }, [selectedService]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const approved = await confirm({
      title: "Подтвердить запись?",
      description: selectedServiceMeta
        ? `Проверьте детали визита перед отправкой заявки администратору.`
        : "Подтвердите создание новой записи.",
      content: selectedServiceMeta ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
              Услуга
            </div>
            <div className="mt-2 text-base font-semibold text-slate-900">
              {selectedServiceMeta.name}
            </div>
            <div className="mt-1 text-sm text-slate-500">
              {selectedWorkerMeta?.full_name || "Исполнитель не выбран"} •{" "}
              {selectedWorkerMeta?.position || "Исполнитель"}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-4">
              <div className="text-xs uppercase tracking-[0.14em] text-violet-500">
                Дата визита
              </div>
              <div className="mt-2 text-lg font-bold text-slate-900">
                {formatDateLabel(selectedDate)}
              </div>
            </div>
            <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-4">
              <div className="text-xs uppercase tracking-[0.14em] text-violet-500">
                Время визита
              </div>
              <div className="mt-2 text-lg font-bold text-slate-900">
                {selectedTime}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                Длительность
              </div>
              <div className="mt-2 text-base font-semibold text-slate-900">
                {selectedServiceMeta.duration} минут
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                Стоимость
              </div>
              <div className="mt-2 text-base font-semibold text-slate-900">
                {Number(selectedServiceMeta.price).toLocaleString("ru-RU")} ₽
              </div>
            </div>
          </div>
        </div>
      ) : null,
      confirmText: "Да, записаться",
      cancelText: "Нет"
    });

    if (!approved) {
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await api.bookings.create({
        service_id: Number(selectedService),
        worker_id: Number(selectedWorker),
        booking_date: selectedDate,
        booking_time: selectedTime
      });
      await refreshNotifications({ silent: true });
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
          <div className="ui-alert-info mt-6 rounded-3xl p-5">
            Для подтверждения записи нужен аккаунт клиента.{" "}
            <Link className="ui-text-link underline" to="/auth?mode=login">
              Войти
            </Link>
          </div>
        )}

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 lg:grid-cols-2">
              <SelectField
                label="Услуга"
                onChange={(value) => setSelectedService(value)}
                options={serviceOptions}
                placeholder="Выберите услугу"
                renderOption={(option, isActive) => (
                  <div>
                    <div className={`font-semibold ${isActive ? "text-violet-700" : "text-slate-900"}`}>
                      {option.service.name}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {option.service.workers_count || 0} исполн. • {option.service.duration} мин •{" "}
                      {Number(option.service.price).toLocaleString("ru-RU")} ₽
                    </div>
                  </div>
                )}
                renderValue={(option) => (
                  <span className="block truncate">
                    {option.service.name} • {option.service.duration} мин •{" "}
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

            <SelectField
              label="Исполнитель"
              onChange={setSelectedWorker}
              options={(selectedServiceMeta?.workers || []).map((worker) => ({
                value: String(worker.id),
                worker
              }))}
              placeholder={
                selectedServiceMeta
                  ? "Выберите барбера или мастера"
                  : "Сначала выберите услугу"
              }
              renderOption={(option, isActive) => (
                <div>
                  <div className={`font-semibold ${isActive ? "text-violet-700" : "text-slate-900"}`}>
                    {option.worker.full_name}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{option.worker.position}</div>
                </div>
              )}
              renderValue={(option) => (
                <span className="block truncate">
                  {option.worker.full_name} • {option.worker.position}
                </span>
              )}
              value={selectedWorker}
            />

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-700">Свободные слоты</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {selectedServiceMeta
                      ? `На ${formatDateLabel(selectedDate)} доступно ${slots.length} вариантов`
                      : "Сначала выберите услугу и исполнителя, чтобы увидеть доступное время"}
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
                      ? selectedWorker
                        ? "На выбранную дату свободных слотов нет"
                        : "Выберите исполнителя, чтобы увидеть время"
                      : "Выберите услугу, чтобы увидеть время"}
                  </div>
                )}
              </div>
            </div>

            {error && <div className="ui-alert-error">{error}</div>}
            {message && <div className="ui-alert-info">{message}</div>}

            <Button
              className="w-full"
              disabled={!canSubmit || submitting}
              loading={submitting}
              size="lg"
              type="submit"
              variant={canSubmit ? "primary" : "disabled"}
            >
              {submitDisabledReason || "Подтвердить запись"}
            </Button>
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
                        {selectedWorkerMeta?.full_name || "Не выбран"}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {selectedWorkerMeta?.position || "Выберите сотрудника из списка"}
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
                  className="ui-card-muted flex items-start gap-3 px-4 py-3"
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
