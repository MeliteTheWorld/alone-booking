import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl surface p-8 text-center">
      <div className="chip">404</div>
      <h1 className="mt-4 font-display text-4xl font-bold text-slate-900">
        Страница не найдена
      </h1>
      <p className="mt-3 text-slate-500">
        Вернитесь на главную или откройте каталог услуг.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link className="btn-secondary" to="/">
          Главная
        </Link>
        <Link className="btn-primary" to="/services">
          Услуги
        </Link>
      </div>
    </div>
  );
}
