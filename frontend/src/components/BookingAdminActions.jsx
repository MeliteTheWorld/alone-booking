const ACTIONS_BY_STATUS = {
  pending: [
    {
      status: "confirmed",
      label: "Подтвердить",
      className: "admin-primary"
    },
    {
      status: "cancelled",
      label: "Отменить",
      className: "admin-danger"
    }
  ],
  confirmed: [
    {
      status: "in_progress",
      label: "В работу",
      className: "admin-primary"
    },
    {
      status: "cancelled",
      label: "Отменить",
      className: "admin-secondary"
    }
  ],
  in_progress: [
    {
      status: "completed",
      label: "Услуга оказана",
      className: "admin-primary"
    }
  ],
  completed: [],
  cancelled: []
};

export default function BookingAdminActions({
  status,
  onAction,
  onDelete,
  fullWidth = false,
  compact = false,
  stacked = false
}) {
  const actions = ACTIONS_BY_STATUS[status] || [];
  const totalActions = actions.length + (onDelete ? 1 : 0);

  if (!actions.length && !onDelete) {
    return null;
  }

  const containerClass = fullWidth
    ? `grid gap-3 ${totalActions > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`
    : stacked
      ? `flex flex-col ${compact ? "gap-2" : "gap-3"}`
      : `flex flex-wrap ${compact ? "gap-2" : "gap-3"}`;
  const buttonSizeClass = compact
    ? "!rounded-xl !px-3 !py-2 !text-xs whitespace-nowrap"
    : "";

  return (
    <div className={containerClass}>
      {actions.map((action) => (
        <button
          key={action.status}
          className={`${action.className} ${fullWidth ? "w-full" : ""} ${buttonSizeClass}`}
          onClick={() => onAction(action.status)}
          type="button"
        >
          {action.label}
        </button>
      ))}
      {onDelete && (
        <button
          className={`admin-danger ${fullWidth ? "w-full" : ""} ${buttonSizeClass}`}
          onClick={onDelete}
          type="button"
        >
          Удалить
        </button>
      )}
    </div>
  );
}
