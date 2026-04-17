import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import ServiceCard from "../components/ServiceCard.jsx";

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="m21 21-4.35-4.35M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

const filterOptions = [
  { value: "all", label: "Все услуги" },
  { value: "short", label: "До 45 минут" },
  { value: "medium", label: "46-75 минут" },
  { value: "long", label: "От 76 минут" },
  { value: "assigned", label: "С назначенным мастером" }
];

function getFilterMatch(service, activeFilter) {
  if (activeFilter === "short") {
    return Number(service.duration) <= 45;
  }

  if (activeFilter === "medium") {
    return Number(service.duration) > 45 && Number(service.duration) <= 75;
  }

  if (activeFilter === "long") {
    return Number(service.duration) > 75;
  }

  if (activeFilter === "assigned") {
    return Number(service.workers_count) > 0;
  }

  return true;
}

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    async function loadServices() {
      try {
        setServices(await api.services.getAll());
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, []);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredServices = services.filter((service) => {
    const matchesFilter = getFilterMatch(service, activeFilter);
    const matchesSearch = !normalizedSearch
      ? true
      : [service.name, service.description, service.staff_name]
          .concat((service.workers || []).map((worker) => worker.full_name))
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch));

    return matchesFilter && matchesSearch;
  });

  const priceFrom = services.length
    ? Math.min(...services.map((service) => Number(service.price)))
    : 0;

  return (
    <div className="space-y-8 md:space-y-10">
      <section className="surface p-5 md:p-8">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
          <div>
            <div className="chip">Каталог услуг</div>
            <h1 className="mt-4 text-3xl font-bold text-slate-950 md:text-4xl">
              Услуги
            </h1>
            <div className="mt-2 text-sm text-slate-500">
              Найдено {filteredServices.length} из {services.length} • от{" "}
              {priceFrom.toLocaleString("ru-RU")} ₽
            </div>
          </div>

          <label className="block">
            <span className="mb-3 block text-sm font-semibold text-slate-700">
              Поиск по каталогу
            </span>
            <div className="ui-input-shell rounded-[20px] px-4 py-3.5">
              <span className="mr-3 text-slate-400">
                <SearchIcon />
              </span>
              <input
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Например: маникюр, мужская стрижка"
                type="text"
                value={search}
              />
            </div>
          </label>
        </div>

        <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50 p-3">
          <div className="ui-tab-group">
            {filterOptions.map((option) => {
              const isActive = activeFilter === option.value;

              return (
                <button
                  className={isActive ? "ui-tab ui-tab-active" : "ui-tab"}
                  key={option.value}
                  onClick={() => setActiveFilter(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {loading && <div className="surface p-6 md:p-8 xl:p-10">Загрузка услуг...</div>}
      {error && <div className="surface p-6 md:p-8 xl:p-10 text-fuchsia-700">{error}</div>}

      {!loading && !error && !filteredServices.length && (
        <div className="surface p-6 md:p-8 xl:p-10">
          <h2 className="text-2xl font-bold text-slate-900">Ничего не найдено</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Попробуйте убрать часть текста из поиска или переключить фильтр. Каталог
            показывает только активные услуги, доступные для записи.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
