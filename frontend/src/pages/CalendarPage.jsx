import { useEffect, useState } from "react";
import { api } from "../api/client.js";

const workDays = [
  "Воскресенье",
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота"
];

function isoDate(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export default function CalendarPage() {
  const [hours, setHours] = useState([]);
  const [load, setLoad] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      const [hoursPayload, loadPayload] = await Promise.all([
        api.schedule.getHours(),
        api.schedule.getLoad(isoDate(0), isoDate(6))
      ]);

      setHours(hoursPayload);
      setLoad(loadPayload);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleHourChange = async (dayOfWeek, field, value) => {
    const currentDay = hours.find((day) => day.day_of_week === dayOfWeek);
    const payload = {
      ...currentDay,
      [field]: value
    };

    try {
      setError("");
      await api.schedule.updateHours(dayOfWeek, payload);
      setMessage("Рабочие часы обновлены");
      await loadData();
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  return (
    <div className="space-y-5 md:space-y-6">
      <section className="admin-card p-4 sm:p-5 md:p-6">
        <div className="ui-section-copy">
          <div className="admin-chip">График</div>
          <h1 className="ui-section-title">Рабочее время и загрузка</h1>
          <p className="ui-section-description">
            Здесь настраиваются рабочие часы бизнеса и быстро просматривается
            загрузка по ближайшей неделе. Для управления самими записями используйте
            отдельный раздел «Записи».
          </p>
        </div>

        {error && <div className="ui-alert-error mt-4">{error}</div>}
        {message && <div className="ui-alert-info mt-4">{message}</div>}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="admin-card p-5 md:p-6">
          <div className="admin-chip">Рабочие часы</div>
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
                    Рабочий день
                  </label>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
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

        <section className="admin-card p-5 md:p-6">
          <div className="admin-chip">Нагрузка</div>
          <h2 className="mt-4 text-3xl font-bold text-slate-900">
            Ближайшие 7 дней
          </h2>
          <div className="mt-6 space-y-4">
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
      </div>
    </div>
  );
}
