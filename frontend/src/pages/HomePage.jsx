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

function UsersIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
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

function ChartIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M5 19V9M12 19V5M19 19v-7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path d="M4 19h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 3 18 5.3V10c0 4.2-2.7 8-6 9.3C8.7 18 6 14.2 6 10V5.3L12 3Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="m9.5 11.8 1.6 1.7 3.4-3.8"
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

function MobileIcon() {
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

const problems = [
  {
    title: "Ручная запись",
    description:
      "Клиенты пишут в мессенджеры и звонят, а администратор вручную собирает свободные окна."
  },
  {
    title: "Сложно управлять услугами",
    description:
      "Услуги, сотрудники, статусы и расписание часто разнесены по разным таблицам и чатам."
  },
  {
    title: "Нет прозрачной аналитики",
    description:
      "Бизнесу сложно быстро понять загрузку, количество записей и выручку за нужный период."
  }
];

const clientFeatures = [
  "Выбор услуги",
  "Выбор исполнителя",
  "Выбор даты и времени",
  "Профиль и история визитов"
];

const adminFeatures = [
  "Календарь и расписание",
  "Услуги и работники",
  "Статусы записей",
  "Аналитика и уведомления"
];

const productCards = [
  {
    icon: <CalendarIcon />,
    title: "Запись к конкретному мастеру",
    description:
      "Клиент записывается не просто на услугу, а к выбранному исполнителю со своими свободными слотами."
  },
  {
    icon: <UsersIcon />,
    title: "Работники и роли",
    description:
      "Администратор управляет сотрудниками, а услуги автоматически получают назначаемых исполнителей."
  },
  {
    icon: <ChartIcon />,
    title: "Аналитика бизнеса",
    description:
      "Панель показывает выручку, клиентов, услуги, загрузку по дням и ключевые показатели MVP."
  },
  {
    icon: <ShieldIcon />,
    title: "Подтверждения и защита",
    description:
      "Глобальные confirm-модалки и антиспам-ограничения снижают число ошибок и случайных действий."
  }
];

const techStack = [
  "React + Vite",
  "Tailwind CSS",
  "Node.js + Express",
  "PostgreSQL",
  "JWT",
  "WebSocket",
  "Nginx + PM2",
  "PWA"
];

const roadmap = [
  "Онлайн-оплата",
  "Telegram / email уведомления",
  "Персональные графики работников",
  "Мультифилиальность",
  "Расширенная аналитика",
  "AI-подбор лучшего времени"
];

const sectionSurfaceClass =
  "surface overflow-hidden px-4 py-6 sm:px-5 sm:py-7 md:px-8 md:py-10";

const subCardClass =
  "rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_34px_rgba(15,23,42,0.05)]";

function MetricCard({ label, value }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      <div className="mt-3 text-3xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      <div className="absolute inset-6 rounded-[36px] bg-violet-200/40 blur-3xl" />
      <div className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-white p-5 shadow-[0_28px_70px_rgba(15,23,42,0.12)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
              Система записи
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">ALONE</div>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
            MVP
          </div>
        </div>

        <div className="mt-5 rounded-[26px] border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Календарь записи</div>
              <div className="text-xs text-slate-500">Апрель 2026</div>
            </div>
            <div className="rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white">
              16 апр.
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-7 gap-2">
            {[13, 14, 15, 16, 17, 18, 19].map((date) => (
              <div
                className={`flex h-10 items-center justify-center rounded-2xl text-sm font-semibold ${
                  date === 16 ? "bg-violet-600 text-white" : "bg-white text-slate-700"
                }`}
                key={date}
              >
                {date}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[22px] border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Услуга
            </div>
            <div className="mt-2 text-base font-bold text-slate-900">Мужская стрижка</div>
            <div className="mt-1 text-sm text-slate-500">45 минут • 1 500 ₽</div>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Исполнитель
            </div>
            <div className="mt-2 text-base font-bold text-slate-900">Субботин Павел</div>
            <div className="mt-1 text-sm text-slate-500">Барбер</div>
          </div>
        </div>

        <div className="mt-4 rounded-[22px] bg-violet-600 px-4 py-4 text-white shadow-[0_16px_32px_rgba(124,78,228,0.22)]">
          <div className="text-sm font-semibold">Статус визита</div>
          <div className="mt-1 text-xl font-bold">Ожидает подтверждения</div>
        </div>
      </div>
    </div>
  );
}

function ArchitectureMockup() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 text-center shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Frontend
        </div>
        <div className="mt-2 text-lg font-bold text-slate-900">React + Vite</div>
      </div>
      <div className="hidden text-center text-2xl text-violet-400 lg:block">→</div>
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 text-center shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Backend
        </div>
        <div className="mt-2 text-lg font-bold text-slate-900">Express API</div>
      </div>
      <div className="hidden text-center text-2xl text-violet-400 lg:block">→</div>
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 text-center shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Данные
        </div>
        <div className="mt-2 text-lg font-bold text-slate-900">PostgreSQL</div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { isAuthenticated, isAdmin } = useAuth();

  const secondaryCta = isAuthenticated
    ? isAdmin
      ? { to: "/admin", label: "Открыть админку" }
      : { to: "/profile", label: "Открыть профиль" }
    : { to: "/auth", label: "Открыть демо" };

  return (
    <div className="space-y-10 md:space-y-12 xl:space-y-14">
      <section className="surface overflow-hidden px-4 py-6 sm:px-5 sm:py-7 md:px-8 md:py-10 xl:px-12 xl:py-12">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_420px] xl:items-center">
          <div className="max-w-3xl">
            <div className="chip">ПРЕЗЕНТАЦИЯ ПРОЕКТА</div>

            <h1 className="mt-5 max-w-3xl text-3xl font-extrabold leading-[0.98] text-slate-900 sm:text-4xl md:mt-6 md:text-5xl xl:text-[4.3rem]">
              ALONE — веб-система онлайн-записи и управления услугами
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base sm:leading-8 md:mt-6 md:text-lg">
              ALONE — это веб-система, которая помогает бизнесу работать быстрее, а клиентам — записываться за пару кликов.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <Link className="btn-primary min-w-[190px]" to="/services">
                Посмотреть продукт
              </Link>
              <Link className="btn-secondary min-w-[190px]" to={secondaryCta.to}>
                {secondaryCta.label}
              </Link>
            </div>
          </div>

          <HeroMockup />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Роли в системе" value="2" />
        <MetricCard label="Ключевые модули" value="5" />
        <MetricCard label="Текущий статус" value="MVP" />
      </section>

      <section className={sectionSurfaceClass}>
        <div className="chip">ПРОБЛЕМА</div>
        <div className="mt-5 max-w-3xl">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Зачем вообще нужен такой продукт
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-500 md:text-base">
            Малый бизнес в сфере услуг часто ведёт запись вручную: через звонки,
            мессенджеры и таблицы. Это неудобно для клиента и создаёт лишнюю
            нагрузку на администратора.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {problems.map((problem) => (
            <article className={subCardClass} key={problem.title}>
              <div className="text-xl font-bold text-slate-900">{problem.title}</div>
              <p className="mt-3 text-sm leading-7 text-slate-500">{problem.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className={sectionSurfaceClass}>
          <div className="chip">ДЛЯ КЛИЕНТА</div>
          <h2 className="mt-5 text-3xl font-bold text-slate-900">Понятный путь записи</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Клиент выбирает услугу, конкретного исполнителя, дату, свободный слот
            и подтверждает запись через модальное окно.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {clientFeatures.map((item) => (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700" key={item}>
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className={sectionSurfaceClass}>
          <div className="chip">ДЛЯ БИЗНЕСА</div>
          <h2 className="mt-5 text-3xl font-bold text-slate-900">Единая админ-панель</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Администратор управляет услугами, работниками, календарём, статусами
            записей и аналитикой в одной системе без перегруженных экранов.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {adminFeatures.map((item) => (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700" key={item}>
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className={sectionSurfaceClass}>
        <div className="chip">КЛЮЧЕВЫЕ ВОЗМОЖНОСТИ</div>
        <div className="mt-5 max-w-3xl">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Что уже реализовано в MVP
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-500 md:text-base">
            Проект уже включает клиентскую часть, кабинет пользователя, админку,
            статусы записей, работников, аналитику, уведомления и mobile-first UX.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {productCards.map((card) => (
            <article className={subCardClass} key={card.title}>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                {card.icon}
              </div>
              <h3 className="mt-5 text-2xl font-bold text-slate-900">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={sectionSurfaceClass}>
        <div className="chip">ЛОГИКА ЗАПИСИ</div>
        <div className="mt-5 max-w-3xl">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Сценарий пользователя внутри системы
          </h2>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-5">
          {[ 
            "Выбор услуги",
            "Выбор исполнителя",
            "Выбор даты",
            "Выбор времени",
            "Подтверждение записи"
          ].map((step, index) => (
            <article
              className="rounded-[28px] border border-slate-300 bg-white p-6 shadow-[0_16px_34px_rgba(15,23,42,0.06)]"
              key={step}
            >
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-500">
                Шаг {index + 1}
              </div>
              <div className="mt-3 text-lg font-bold text-slate-900">{step}</div>
            </article>
          ))}
        </div>
      </section>

      <section className={sectionSurfaceClass}>
        <div className="chip">СТАТУСЫ ЗАПИСЕЙ</div>
        <div className="mt-5 grid gap-4 lg:grid-cols-5">
          {[
            ["pending", "Ожидает подтверждения"],
            ["confirmed", "Подтверждена"],
            ["in_progress", "В работе"],
            ["completed", "Завершена"],
            ["cancelled", "Отменена"]
          ].map(([code, label]) => (
            <div
              className="rounded-[24px] border border-slate-200 bg-white p-5 text-center shadow-[0_14px_28px_rgba(15,23,42,0.05)]"
              key={code}
            >
              <div className="text-sm font-bold text-violet-600">{code}</div>
              <div className="mt-2 text-sm text-slate-600">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={sectionSurfaceClass}>
        <div className="chip">АРХИТЕКТУРА</div>
        <div className="mt-5 max-w-3xl">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Технологическая схема проекта
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-500 md:text-base">
            Проект построен как современное fullstack-приложение с отдельными
            слоями интерфейса, API, базы данных и realtime-уведомлений.
          </p>
        </div>

        <div className="mt-8">
          <ArchitectureMockup />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {techStack.map((item) => (
            <div
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600"
              key={item}
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className={sectionSurfaceClass}>
        <div className="chip">РЕЗУЛЬТАТ</div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <article className={subCardClass}>
            <div className="text-2xl font-bold text-slate-900">Готовый MVP</div>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Проект уже работает как демонстрационный продукт и покрывает
              клиентский и административный контур.
            </p>
          </article>
          <article className={subCardClass}>
            <div className="text-2xl font-bold text-slate-900">Рабочий production</div>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Система развёрнута на VPS, работает через Nginx и PM2 и может
              обновляться через `git pull` и deploy script.
            </p>
          </article>
          <article className={subCardClass}>
            <div className="text-2xl font-bold text-slate-900">Mobile-first UX</div>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Интерфейс адаптирован под телефоны и поддерживает PWA-режим для
              установки как mobile web app.
            </p>
          </article>
        </div>
      </section>

      <section className="surface overflow-hidden p-4 md:p-6">
        <div className="rounded-[36px] bg-[linear-gradient(135deg,#7c4ee4_0%,#8e63f5_100%)] px-6 py-10 text-white md:px-10 md:py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
            <div>
              <div className="chip !border-white/20 !bg-white/10 !text-violet-50 before:!bg-white">
                ПЕРСПЕКТИВЫ РАЗВИТИЯ
              </div>
              <h2 className="mt-5 max-w-3xl text-3xl font-extrabold leading-tight md:text-4xl">
                ALONE можно развивать как полноценный сервис для малого бизнеса
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-violet-100 md:text-base">
                Следующий шаг — превратить MVP в зрелый продукт с оплатой,
                расширенной аналитикой, уведомлениями и AI-подсказками.
              </p>
            </div>

            <div className="grid gap-3">
              {roadmap.map((item) => (
                <div
                  className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
