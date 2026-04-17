import Button from "./Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function ClockIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
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

function PeopleIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M16 19a4 4 0 0 0-8 0M15 7a3 3 0 1 1 0 6M9 7a3 3 0 1 1 0 6M20 19a4 4 0 0 0-3-3.87M7 16.13A4 4 0 0 0 4 19"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
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

  return "Долгая процедура";
}

function getWorkerSummary(workers, isAdmin) {
  if (!workers.length) {
    return isAdmin ? "Добавьте сотрудников в админке" : "Сотрудники не назначены";
  }

  if (workers.length === 1) {
    return workers[0].full_name || "1 сотрудник";
  }

  return `${workers.length} сотрудника в записи`;
}

export default function ServiceCard({ service }) {
  const { isAdmin } = useAuth();
  const workers = service.workers || [];
  const hasWorkers = workers.length > 0;

  const actionLabel = isAdmin
    ? hasWorkers
      ? "в админку"
      : "добавить сотрудников"
    : hasWorkers
      ? "записаться"
      : "сотрудники не назначены";

  const actionTo = isAdmin
    ? hasWorkers
      ? "/admin"
      : "/admin?tab=workers"
    : `/bookings/new?serviceId=${service.id}`;

  const actionVariant = isAdmin
    ? hasWorkers
      ? "secondary"
      : "outline"
    : hasWorkers
      ? "primary"
      : "disabled";

  return (
    <article className="ui-card flex h-full flex-col p-5 sm:p-6 lg:p-8">
      <div className="min-h-[auto] sm:min-h-[118px] lg:min-h-[126px]">
        <h3 className="text-[1.18rem] font-bold leading-tight text-slate-950 sm:text-[1.28rem]">
          {service.name}
        </h3>
        <p className="mt-3 min-h-[auto] text-[14px] leading-7 text-slate-500 sm:mt-4 sm:min-h-[52px]">
          {service.description || "Описание услуги пока не добавлено."}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2.5 text-[13px] text-slate-400 sm:mt-4 sm:gap-3 sm:text-[14px]">
        <div className="inline-flex items-center gap-2">
          <ClockIcon />
          <span>{service.duration} минут</span>
        </div>
        <span className="text-slate-300">•</span>
        <span>{getDurationBadge(service.duration)}</span>
      </div>

      <div className="mt-3 inline-flex items-center gap-2 text-[14px] text-slate-500">
        <PeopleIcon />
        <span>{getWorkerSummary(workers, isAdmin)}</span>
      </div>

      <div className="mt-auto pt-7 sm:pt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[1.75rem] font-semibold leading-none text-slate-950 sm:text-[2rem]">
            {Number(service.price).toLocaleString("ru-RU")} ₽
          </div>

          <Button
            className="w-full sm:w-auto sm:min-w-[170px]"
            disabled={!hasWorkers && !isAdmin}
            size="lg"
            to={hasWorkers || isAdmin ? actionTo : undefined}
            type="button"
            variant={actionVariant}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </article>
  );
}
