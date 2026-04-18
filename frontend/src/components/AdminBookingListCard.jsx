import BookingStatusBadge from "./BookingStatusBadge.jsx";

function formatTime(booking) {
  return booking.booking_time.slice(0, 5);
}

function formatDate(booking) {
  return new Date(booking.booking_date).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long"
  });
}

export default function AdminBookingListCard({
  booking,
  selected = false,
  onClick,
  compact = false
}) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      className={`w-full rounded-[24px] border text-left transition ${
        selected
          ? "border-violet-200 bg-violet-50 shadow-[0_12px_30px_rgba(142,99,245,0.12)]"
          : "border-slate-200 bg-white"
      } ${compact ? "px-4 py-3" : "px-4 py-4 sm:px-5"}`}
      onClick={onClick}
      type={onClick ? "button" : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
              {formatTime(booking)}
            </div>
            {!compact && (
              <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                {formatDate(booking)}
              </div>
            )}
          </div>

          <div className={`mt-3 font-bold text-slate-900 ${compact ? "text-base" : "text-lg"}`}>
            {booking.service_name}
          </div>
          <div className="mt-1 text-sm text-slate-600">{booking.user_name}</div>
          <div className="mt-1 text-sm text-slate-500">
            {booking.worker_name} • {booking.worker_position || "Исполнитель"}
          </div>
        </div>

        <BookingStatusBadge status={booking.status} />
      </div>
    </Wrapper>
  );
}
