import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import ServiceCard from "../components/ServiceCard.jsx";

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
    return Boolean(service.staff_name && service.staff_name !== "Не назначен");
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
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch));

    return matchesFilter && matchesSearch;
  });

  const priceFrom = services.length
    ? Math.min(...services.map((service) => Number(service.price)))
    : 0;

  return (
    <div className="space-y-5 md:space-y-6">
      <section className="surface p-5 md:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-violet-100 bg-violet-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-violet-600">
                Каталог услуг
              </div>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
                Услуги
              </h1>
              <div className="mt-1 text-sm text-slate-500">
                Найдено {filteredServices.length} из {services.length} • от{" "}
                {priceFrom.toLocaleString("ru-RU")} ₽
              </div>
            </div>

            <label className="block lg:w-[360px]">
              <span className="ui-label">Поиск по каталогу</span>
              <input
                className="field"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Например: маникюр, мужская стрижка"
                type="text"
                value={search}
              />
            </label>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => {
                const isActive = activeFilter === option.value;

                return (
                  <button
                    className={
                      isActive
                        ? "rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(15,23,42,0.12)]"
                        : "rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600"
                    }
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
        </div>
      </section>

      {loading && <div className="surface p-6">Загрузка услуг...</div>}
      {error && <div className="surface p-6 text-fuchsia-700">{error}</div>}

      {!loading && !error && !filteredServices.length && (
        <div className="surface p-6 md:p-8">
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
