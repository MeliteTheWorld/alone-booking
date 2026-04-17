import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
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

function StackIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M4 7.5 12 4l8 3.5L12 11 4 7.5ZM4 12l8 3.5 8-3.5M4 16.5 12 20l8-3.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M13 3 5.8 12.1a1 1 0 0 0 .78 1.62H11l-1 7 7.2-9.08a1 1 0 0 0-.78-1.62H12L13 3Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM11 17h2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="m12 3 1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M4 4h6v6H4V4ZM14 4h6v6h-6V4ZM4 14h6v6H4v-6ZM14 14h6v6h-6v-6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CircleLogo() {
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-[25%] bg-violet-600 text-white shadow-[0_10px_26px_rgba(124,78,228,0.28)]">
      <span className="h-4.5 w-4.5 rotate-45 rounded-[6px] border-2 border-white" />
    </span>
  );
}

const brandMarks = [
  "барбершопы",
  "салоны",
  "косметология",
  "мастера",
  "студии"
];

const featureCards = [
  {
    title: "24/7 запись без звонков",
    description:
      "Клиент сам выбирает услугу, мастера и время. Администратору не нужно собирать запись вручную.",
    icon: <CalendarIcon />
  },
  {
    title: "Все в одной системе",
    description:
      "Расписание, услуги, сотрудники, статусы записей и профиль клиента находятся в одном интерфейсе.",
    icon: <StackIcon />
  },
  {
    title: "Готовое решение для MVP",
    description:
      "Подходит для показа проекта, тестового запуска и демонстрации полноценного продукта.",
    icon: <BoltIcon />
  }
];

const workflowSteps = [
  {
    title: "Выберите услугу",
    description:
      "Клиент видит каталог, стоимость, длительность и доступных исполнителей."
  },
  {
    title: "Забронируйте время",
    description:
      "Система показывает только свободные слоты у выбранного сотрудника на нужную дату."
  },
  {
    title: "Управляйте статусом",
    description:
      "Администратор подтверждает визит, переводит его в работу и отмечает услугу как завершённую."
  }
];

const clientBenefits = [
  "Онлайн-запись 24/7",
  "История визитов",
  "Перенос и отмена",
  "Выбор исполнителя"
];

const businessBenefits = [
  "Календарь записей",
  "Работники и роли",
  "Аналитика выручки",
  "Контроль статусов"
];

function HeroCalendarCard() {
  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const dates = [13, 14, 15, 16, 17, 18, 19];

  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      <div className="absolute inset-5 rounded-[32px] bg-violet-200/30 blur-3xl" />
      <div className="relative rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
              ALONE booking
            </div>
            <div className="mt-2 text-xl font-bold text-slate-900">Апрель 2026</div>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
            Запись
          </div>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          {days.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-7 gap-2">
          {dates.map((date) => (
            <div
              className={`flex h-10 items-center justify-center rounded-2xl text-sm font-semibold ${
                date === 16
                  ? "bg-violet-600 text-white shadow-[0_12px_24px_rgba(124,78,228,0.22)]"
                  : "bg-slate-50 text-slate-700"
              }`}
              key={date}
            >
              {date}
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Доступное время
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["12:30", "15:00", "16:30", "18:00"].map((time) => (
              <div
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  time === "12:30"
                    ? "bg-violet-100 text-violet-700"
                    : "bg-white text-slate-600"
                }`}
                key={time}
              >
                {time}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-[22px] border border-slate-200 bg-white px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">Субботин Павел</div>
            <div className="text-xs text-slate-500">Барбер</div>
          </div>
          <div className="rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white">
            12:30
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientShowcaseCard() {
  return (
    <div className="grid gap-6 rounded-[34px] border border-sky-100 bg-[linear-gradient(180deg,#eef9ff_0%,#e9f7ff_100%)] p-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center lg:p-8">
      <div>
        <div className="chip">ДЛЯ КЛИЕНТОВ</div>
        <h3 className="mt-4 text-3xl font-bold leading-tight text-slate-900">
          Записывайтесь в пару кликов
        </h3>
        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">
          Забудьте о звонках и ожидании ответа в мессенджерах. Полный контроль над
          визитом прямо в личном кабинете.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {clientBenefits.map((item) => (
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700" key={item}>
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              {item}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Link className="btn-primary" to="/services">
            Начать запись
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[240px] rounded-[28px] border border-white/80 bg-white p-3 shadow-[0_26px_50px_rgba(15,23,42,0.12)]">
        <div className="rounded-[24px] bg-[linear-gradient(180deg,#f6f7ff_0%,#eef4ff_100%)] p-4">
          <div className="mx-auto flex h-[360px] w-full max-w-[200px] flex-col rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
            <div className="mx-auto h-1.5 w-16 rounded-full bg-slate-200" />
            <div className="mt-6 text-center text-sm font-semibold text-slate-900">
              Добро пожаловать в ALONE
            </div>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl bg-violet-50 px-3 py-3 text-center text-sm font-semibold text-violet-700">
                Записаться
              </div>
              <div className="rounded-2xl bg-slate-50 px-3 py-3 text-center text-sm text-slate-600">
                История визитов
              </div>
              <div className="rounded-2xl bg-slate-50 px-3 py-3 text-center text-sm text-slate-600">
                Перенос записи
              </div>
            </div>
            <div className="mt-auto rounded-2xl bg-violet-600 px-3 py-3 text-center text-sm font-semibold text-white">
              Подтвердить
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BusinessShowcaseCard() {
  return (
    <div className="grid gap-6 rounded-[34px] border border-violet-100 bg-[linear-gradient(180deg,#f5f0ff_0%,#f7f4ff_100%)] p-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center lg:p-8">
      <div>
        <div className="chip">ДЛЯ БИЗНЕСА</div>
        <h3 className="mt-4 text-3xl font-bold leading-tight text-slate-900">
          Управляйте бизнесом легко
        </h3>
        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">
          Контролируйте загрузку мастеров, ведите каталог услуг, управляйте
          сотрудниками и следите за ключевыми метриками в одной системе.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {businessBenefits.map((item) => (
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700" key={item}>
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              {item}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Link className="btn-primary" to="/admin">
            Управлять салоном
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[240px] rounded-[28px] border border-white/80 bg-white p-3 shadow-[0_26px_50px_rgba(15,23,42,0.12)]">
        <div className="rounded-[24px] bg-[linear-gradient(180deg,#ffffff_0%,#f7f8ff_100%)] p-4">
          <div className="grid gap-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-violet-50 p-3">
                <div className="text-xs text-slate-400">Выручка</div>
                <div className="mt-2 text-lg font-bold text-slate-900">146К</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <div className="text-xs text-slate-400">Записи</div>
                <div className="mt-2 text-lg font-bold text-slate-900">84</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <div className="text-xs text-slate-400">Мастера</div>
                <div className="mt-2 text-lg font-bold text-slate-900">6</div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-end gap-2">
                {[48, 70, 42, 92, 60, 80].map((height, index) => (
                  <div
                    className={`flex-1 rounded-t-xl ${index === 3 ? "bg-violet-500" : "bg-violet-200"}`}
                    key={height}
                    style={{ height }}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-[0_10px_22px_rgba(15,23,42,0.05)]">
              <div className="text-sm font-semibold text-slate-900">
                Ближайшие записи
              </div>
              <div className="mt-3 space-y-2">
                {["Стрижка • 12:30", "Маникюр • 15:00", "Консультация • 17:30"].map((item) => (
                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600" key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { isAuthenticated, isAdmin } = useAuth();

  const secondaryCta = isAuthenticated
    ? isAdmin
      ? { to: "/admin", label: "Открыть админку" }
      : { to: "/profile", label: "Перейти в профиль" }
    : { to: "/auth", label: "Посмотреть демо" };

  return (
    <div className="space-y-10 md:space-y-14">
      <section className="surface overflow-hidden px-6 py-8 md:px-8 md:py-10 xl:px-12 xl:py-14">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1.05fr)_420px] xl:items-center">
          <div className="max-w-3xl">
            <div className="chip">MVP ДЛЯ УСЛУГ И МАЛОГО БИЗНЕСА</div>

            <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-[0.98] text-slate-900 md:text-5xl xl:text-[4.2rem]">
              Удобная запись клиентов и{" "}
              <span className="text-violet-600">понятное</span> управление
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-500 md:text-lg">
              ALONE помогает барбершопам, салонам и мастерам автоматизировать
              запись, работать с услугами, сотрудниками и календарём в одном
              интерфейсе.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="btn-primary min-w-[180px]" to="/services">
                Начать бесплатно
              </Link>
              <Link className="btn-secondary min-w-[180px]" to={secondaryCta.to}>
                {secondaryCta.label}
              </Link>
            </div>
          </div>

          <HeroCalendarCard />
        </div>
      </section>

      <section className="surface px-6 py-8 md:px-8 md:py-10">
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Нам доверяют форматы услуг
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {brandMarks.map((mark) => (
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-400" key={mark}>
              <CircleLogo />
              <span className="capitalize">{mark}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="surface px-6 py-10 md:px-8 md:py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Ваш сервис в одном окне
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-500 md:text-base">
            Все необходимые инструменты для порядка в записи, контроля загрузки и
            понятной работы с клиентами без лишней сложности.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {featureCards.map((feature) => (
            <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.05)]" key={feature.title}>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                {feature.icon}
              </div>
              <h3 className="mt-5 text-xl font-bold leading-tight text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface px-6 py-10 md:px-8 md:py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Как это работает
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-500 md:text-base">
            Три понятных шага, которые превращают хаотичную запись в аккуратный
            управляемый процесс.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {workflowSteps.map((step, index) => {
            const icons = [<PhoneIcon key="phone" />, <SparklesIcon key="spark" />, <GridIcon key="grid" />];

            return (
              <article className="text-center" key={step.title}>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                  {icons[index]}
                </div>
                <div className="mt-5 text-xl font-bold text-slate-900">{step.title}</div>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-5">
        <ClientShowcaseCard />
        <BusinessShowcaseCard />
      </section>

      <section className="surface p-4 md:p-6">
        <div className="rounded-[36px] bg-[linear-gradient(135deg,#7c4ee4_0%,#8e63f5_100%)] px-6 py-10 text-center text-white md:px-10 md:py-12">
          <h2 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight md:text-4xl">
            Готовы навести порядок в записи и управлении услугами?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-violet-100 md:text-base">
            Используйте ALONE как демонстрационный продукт, MVP для защиты или
            стартовую систему для реальной автоматизации записи.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-violet-700" to="/services">
              Попробовать бесплатно
            </Link>
            <div className="text-sm font-medium text-violet-100">
              Подходит для барбершопов, салонов и частных мастеров
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
