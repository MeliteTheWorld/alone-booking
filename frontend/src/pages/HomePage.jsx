import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const productHighlights = [
  {
    label: "Запись без звонков",
    value: "24/7"
  },
  {
    label: "Роли в системе",
    value: "Клиент + админ"
  },
  {
    label: "Формат проекта",
    value: "Готовый MVP"
  }
];

const quickSteps = [
  {
    title: "Выберите услугу",
    description: "Клиент сразу видит каталог, стоимость, длительность и исполнителя."
  },
  {
    title: "Забронируйте время",
    description: "Система показывает свободные слоты и отправляет запись на подтверждение."
  },
  {
    title: "Управляйте статусом",
    description: "Администратор подтверждает визит, переводит услугу в работу и завершает её."
  }
];

const roleCards = [
  {
    title: "Для клиента",
    items: [
      "Выбор услуги и мастера",
      "Просмотр свободных слотов",
      "Запись, перенос и отмена в профиле"
    ]
  },
  {
    title: "Для администратора",
    items: [
      "Единая админка с календарём",
      "Подтверждение и завершение услуг",
      "Управление услугами и рабочими часами"
    ]
  }
];

export default function HomePage() {
  const { isAuthenticated, isAdmin } = useAuth();

  const secondaryCta = isAuthenticated
    ? isAdmin
      ? { to: "/admin", label: "Открыть админку" }
      : { to: "/profile", label: "Перейти в профиль" }
    : { to: "/auth", label: "Войти в аккаунт" };

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="surface p-6 md:p-8 xl:p-10">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px] xl:items-start">
          <div className="max-w-3xl">
            <div className="chip">Онлайн-запись для малого бизнеса</div>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 md:text-4xl xl:text-5xl">
              Удобная запись клиентов и понятное управление расписанием.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
              ALONE помогает салонам, мастерам и клиникам принимать записи без
              переписок и ручного учёта. Клиент быстро выбирает время, а администратор
              контролирует весь цикл услуги в одном месте.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link className="btn-primary w-full sm:w-auto" to="/services">
                Перейти к услугам
              </Link>
              <Link className="btn-secondary w-full sm:w-auto" to={secondaryCta.to}>
                {secondaryCta.label}
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {productHighlights.map((item) => (
                <div
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4"
                  key={item.label}
                >
                  <div className="text-lg font-bold text-slate-900">{item.value}</div>
                  <div className="mt-1 text-sm text-slate-500">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 md:p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
              Как это работает
            </div>
            <div className="mt-4 space-y-3">
              {quickSteps.map((step, index) => (
                <div
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-4"
                  key={step.title}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50 text-sm font-bold text-violet-700">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{step.title}</div>
                      <div className="mt-1 text-sm leading-6 text-slate-500">
                        {step.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {roleCards.map((card) => (
          <div className="surface p-6" key={card.title}>
            <h2 className="text-2xl font-bold text-slate-900">{card.title}</h2>
            <div className="mt-4 space-y-3">
              {card.items.map((item) => (
                <div
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
