import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function ClockIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 7.5v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function FlashIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M13 3 5.8 12.1a1 1 0 0 0 .78 1.62H11l-1 7 7.2-9.08a1 1 0 0 0-.78-1.62H12l1-7.02Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg aria-hidden="true" className="h-8 w-8" fill="none" viewBox="0 0 24 24">
      <path
        d="M15 19v-1a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v1M9.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM20 19v-1a3 3 0 0 0-2-2.83M14 5.17a3 3 0 0 1 0 5.66"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ChevronIcon({ expanded }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function RowChevronIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24">
      <path
        d="m10 7 5 5-5 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function getDurationBadge(duration) {
  if (Number(duration) <= 45) {
    return "Быстрый визит";
  }

  if (Number(duration) <= 75) {
    return "Стандартный формат";
  }

  return "Длительная услуга";
}

function formatWorkerName(worker) {
  return worker?.full_name || [worker?.last_name, worker?.first_name].filter(Boolean).join(" ");
}

function getWorkerInitials(worker) {
  const fullName = formatWorkerName(worker);
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function ServiceCard({ service }) {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showAllWorkers, setShowAllWorkers] = useState(false);
  const workers = service.workers || [];
  const hasWorkers = workers.length > 0;
  const visibleWorkers = workers.length > 2 && !showAllWorkers ? workers.slice(0, 2) : workers;
  const hiddenWorkersCount = Math.max(workers.length - 2, 0);
  const actionLabel = isAdmin
    ? hasWorkers
      ? "в админку"
      : "добавить сотрудников"
    : hasWorkers
      ? "записаться"
      : "сотрудники не назначены";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.07)]">
      <div className="flex min-h-[112px] items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-[1.22rem] font-extrabold leading-[1.08] text-slate-900 sm:text-[1.35rem]">
            {service.name}
          </h3>
          <p className="mt-2 min-h-[72px] text-[13px] leading-7 text-slate-500 sm:text-[14px]">
            {service.description || "Описание услуги пока не добавлено."}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <div className="whitespace-nowrap text-[1.35rem] font-extrabold leading-none text-violet-600 sm:text-[1.55rem]">
            {Number(service.price).toLocaleString("ru-RU")}&nbsp;₽
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5 text-[13px] font-bold text-violet-600">
          <ClockIcon />
          <span>{service.duration} минут</span>
        </div>

        <div className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1.5 text-[13px] font-semibold text-sky-700">
          <FlashIcon />
          <span>{getDurationBadge(service.duration)}</span>
        </div>
      </div>

      <div className="mt-6 text-[0.92rem] font-extrabold uppercase tracking-[0.12em] text-slate-500">
        Исполнители
      </div>

      <div className="mt-3 flex min-h-[264px] flex-1 flex-col rounded-[24px] border border-slate-200 bg-slate-50/85 p-4">
        {hasWorkers ? (
          <div className="space-y-1.5">
            {visibleWorkers.map((worker) => (
              <div
                className="flex items-center gap-3 rounded-[20px] border border-white bg-white px-3.5 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
                key={worker.id}
              >
                <div className="relative shrink-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ede9fe,#e2e8f0)] text-sm font-extrabold text-slate-700">
                    {getWorkerInitials(worker) || "М"}
                  </div>
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-bold text-slate-900">
                    {formatWorkerName(worker)}
                  </div>
                  <div className="mt-0.5 truncate text-[13px] text-slate-500">
                    {worker.position || "Исполнитель услуги"}
                  </div>
                </div>

                <RowChevronIcon />
              </div>
            ))}

            {workers.length > 2 && (
              <button
                className="flex w-full items-center justify-between rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-left text-[14px] font-semibold text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
                onClick={() => setShowAllWorkers((current) => !current)}
                type="button"
              >
                <span>
                  {showAllWorkers
                    ? "Скрыть дополнительных сотрудников"
                    : `Показать еще ${hiddenWorkersCount} ${
                        hiddenWorkersCount === 1
                          ? "сотрудника"
                          : hiddenWorkersCount >= 2 && hiddenWorkersCount <= 4
                            ? "сотрудников"
                            : "сотрудников"
                      }`}
                </span>
                <ChevronIcon expanded={showAllWorkers} />
              </button>
            )}
          </div>
        ) : (
          <button
            className={`flex min-h-[210px] flex-1 flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-200 bg-white/65 px-4 py-5 text-center ${
              isAdmin ? "transition hover:border-violet-200 hover:bg-violet-50/60" : ""
            }`}
            onClick={() => {
              if (isAdmin) {
                navigate("/admin?tab=workers");
              }
            }}
            type="button"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
              <PeopleIcon />
            </div>
            <div className="mt-4 text-[15px] font-semibold text-slate-700">
              {isAdmin ? "Добавьте сотрудников в админке" : "Сотрудников нет"}
            </div>
            {!isAdmin && (
              <div className="mt-2 max-w-[240px] text-[13px] leading-6 text-slate-400">
                Пожалуйста, выберите другую услугу или обратитесь к администратору
              </div>
            )}
          </button>
        )}
      </div>

      <div className="mt-5">
        {isAdmin ? (
          <Link
            className="inline-flex h-14 w-full items-center justify-center rounded-[20px] bg-slate-100 px-6 text-[15px] font-bold text-slate-700"
            to={hasWorkers ? "/admin" : "/admin?tab=workers"}
          >
            {actionLabel}
          </Link>
        ) : hasWorkers ? (
          <Link
            className="inline-flex h-14 w-full items-center justify-center rounded-[20px] bg-violet-100 px-6 text-[15px] font-bold text-violet-700"
            to={`/bookings/new?serviceId=${service.id}`}
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            className="inline-flex h-14 w-full cursor-not-allowed items-center justify-center rounded-[20px] border border-slate-200 bg-slate-100 px-6 text-[15px] font-bold text-slate-400"
            disabled
            type="button"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </article>
  );
}
