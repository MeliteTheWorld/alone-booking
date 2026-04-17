import { useEffect, useMemo, useRef, useState } from "react";

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function parseIsoDate(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value) {
  const date = parseIsoDate(value);

  if (!date) {
    return "Выберите дату";
  }

  return date.toLocaleDateString("ru-RU");
}

function buildCalendarDays(referenceDate) {
  const firstDay = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const calendarStart = new Date(firstDay);
  calendarStart.setDate(firstDay.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const current = new Date(calendarStart);
    current.setDate(calendarStart.getDate() + index);
    return current;
  });
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

export default function DatePickerField({
  label,
  value,
  min,
  onChange
}) {
  const minDate = useMemo(() => parseIsoDate(min), [min]);
  const selectedDate = useMemo(() => parseIsoDate(value), [value]);
  const [open, setOpen] = useState(false);
  const [monthDate, setMonthDate] = useState(
    selectedDate || minDate || new Date()
  );
  const rootRef = useRef(null);

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    setMonthDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const days = useMemo(() => buildCalendarDays(monthDate), [monthDate]);
  const selectedIso = selectedDate ? toIsoDate(selectedDate) : "";
  const minIso = minDate ? toIsoDate(minDate) : "";

  return (
    <label className="block">
      {label && <span className="ui-label">{label}</span>}

      <div className="ui-field-wrap" ref={rootRef}>
        <button
          className="ui-select-field text-left"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          {formatDisplayDate(value)}
        </button>
        <span className="ui-field-icon">
          <CalendarIcon />
        </span>

        {open && (
          <div className="ui-menu absolute left-0 top-[calc(100%+10px)] z-30 w-[320px] max-w-[calc(100vw-2rem)] p-4">
            <div className="flex items-center justify-between gap-3">
              <button
                className="ui-btn ui-btn-sm ui-btn-secondary h-9 w-9 !rounded-xl !px-0"
                onClick={() =>
                  setMonthDate(
                    new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1)
                  )
                }
                type="button"
              >
                ‹
              </button>

              <div className="text-sm font-semibold capitalize text-slate-900">
                {monthDate.toLocaleDateString("ru-RU", {
                  month: "long",
                  year: "numeric"
                })}
              </div>

              <button
                className="ui-btn ui-btn-sm ui-btn-secondary h-9 w-9 !rounded-xl !px-0"
                onClick={() =>
                  setMonthDate(
                    new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1)
                  )
                }
                type="button"
              >
                ›
              </button>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              {weekDays.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1">
              {days.map((day) => {
                const iso = toIsoDate(day);
                const isCurrentMonth = day.getMonth() === monthDate.getMonth();
                const isSelected = iso === selectedIso;
                const isDisabled = minIso ? iso < minIso : false;

                return (
                  <button
                    key={iso}
                    className={`flex h-10 items-center justify-center rounded-xl text-sm font-semibold ${
                      isSelected
                        ? "bg-violet-600 text-white"
                        : isDisabled
                          ? "cursor-not-allowed text-slate-300"
                          : isCurrentMonth
                            ? "text-slate-700 hover:bg-slate-100"
                            : "text-slate-400 hover:bg-slate-50"
                    }`}
                    disabled={isDisabled}
                    onClick={() => {
                      onChange(iso);
                      setOpen(false);
                    }}
                    type="button"
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
              <button
                className="ui-btn ui-btn-sm ui-btn-ghost"
                onClick={() => setOpen(false)}
                type="button"
              >
                Закрыть
              </button>
              <button
                className="ui-btn ui-btn-sm ui-btn-ghost text-violet-600"
                onClick={() => {
                  const today = new Date();
                  const todayIso = toIsoDate(today);

                  if (!minIso || todayIso >= minIso) {
                    setMonthDate(today);
                    onChange(todayIso);
                    setOpen(false);
                  }
                }}
                type="button"
              >
                Сегодня
              </button>
            </div>
          </div>
        )}
      </div>
    </label>
  );
}
