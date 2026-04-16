const STATUS_MAP = {
  pending: "border border-amber-200 bg-amber-50 text-amber-700",
  confirmed: "border border-violet-200 bg-violet-50 text-violet-700",
  in_progress: "border border-cyan-200 bg-cyan-50 text-cyan-700",
  completed: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border border-slate-200 bg-slate-100 text-slate-500"
};

const LABEL_MAP = {
  pending: "Ожидает подтверждения",
  confirmed: "Подтверждена",
  in_progress: "В работе",
  completed: "Услуга оказана",
  cancelled: "Отменена"
};

export default function BookingStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        STATUS_MAP[status] || "border border-slate-200 bg-slate-100 text-slate-700"
      }`}
    >
      {LABEL_MAP[status] || status}
    </span>
  );
}
