import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ServiceCard({ service }) {
  const { isAdmin } = useAuth();

  return (
    <article className="surface flex h-full flex-col p-5 md:p-6">
      <div className="chip">{service.duration} мин</div>
      <h3 className="mt-4 font-display text-2xl font-bold text-slate-900">{service.name}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-500">
        {service.description}
      </p>
      <p className="mt-4 text-sm text-slate-500">
        Исполнитель:{" "}
        <span className="font-semibold text-slate-900">
          {service.staff_name || "Не назначен"}
        </span>
      </p>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm text-slate-500">Стоимость</div>
          <div className="text-xl font-bold text-slate-900">
            {Number(service.price).toLocaleString("ru-RU")} ₽
          </div>
        </div>
        {isAdmin ? (
          <Link className="btn-secondary w-full sm:w-auto" to="/admin">
            В админку
          </Link>
        ) : (
          <Link
            className="btn-primary w-full sm:w-auto"
            to={`/bookings/new?serviceId=${service.id}`}
          >
            Записаться
          </Link>
        )}
      </div>
    </article>
  );
}
