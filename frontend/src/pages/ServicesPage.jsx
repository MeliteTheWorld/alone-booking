import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import ServiceCard from "../components/ServiceCard.jsx";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <div className="chip">Каталог услуг</div>
        <h1 className="mt-4 section-title">Выберите услугу и свободный слот</h1>
        <p className="mt-3 text-slate-500">
          Клиент видит активные услуги и может сразу перейти к бронированию.
        </p>
      </div>

      {loading && <div className="surface p-6">Загрузка услуг...</div>}
      {error && <div className="surface p-6 text-fuchsia-700">{error}</div>}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
