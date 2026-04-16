import { useEffect, useState } from "react";
import { api } from "../api/client.js";

const emptyForm = {
  id: null,
  name: "",
  description: "",
  staff_name: "",
  duration: 60,
  price: 1500,
  is_active: true
};

export default function ManageServicesPage() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadServices = async () => {
    try {
      setServices(await api.services.getAdminAll());
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        duration: Number(form.duration),
        price: Number(form.price)
      };

      if (form.id) {
        await api.services.update(form.id, payload);
        setMessage("Услуга обновлена");
      } else {
        await api.services.create(payload);
        setMessage("Услуга добавлена");
      }

      setForm(emptyForm);
      await loadServices();
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  const handleEdit = (service) => {
    setForm({
      id: service.id,
      name: service.name,
      description: service.description,
      staff_name: service.staff_name || "",
      duration: service.duration,
      price: service.price,
      is_active: service.is_active
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.services.remove(id);
      setMessage("Услуга скрыта из каталога");
      await loadServices();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="admin-card p-5 md:p-8">
        <div className="admin-chip">Каталог услуг</div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">
          Управление услугами
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Добавляйте новые услуги, назначайте исполнителя и управляйте тем, что видит клиент.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <div className="mb-2 text-sm font-semibold text-slate-700">Название услуги</div>
          <input
            className="admin-input"
            name="name"
            onChange={handleChange}
            placeholder="Название услуги"
            required
            value={form.name}
          />
          </label>
          <label className="block">
            <div className="mb-2 text-sm font-semibold text-slate-700">Описание</div>
          <textarea
            className="admin-input min-h-28"
            name="description"
            onChange={handleChange}
            placeholder="Краткое описание"
            value={form.description}
          />
          </label>
          <label className="block">
            <div className="mb-2 text-sm font-semibold text-slate-700">Исполнитель</div>
          <input
            className="admin-input"
            name="staff_name"
            onChange={handleChange}
            placeholder="Исполнитель: Фамилия Имя"
            required
            value={form.staff_name}
          />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <div className="mb-2 text-sm font-semibold text-slate-700">Длительность</div>
              <input
                className="admin-input"
                min="15"
                name="duration"
                onChange={handleChange}
                required
                type="number"
                value={form.duration}
              />
            </label>
            <label className="block">
              <div className="mb-2 text-sm font-semibold text-slate-700">Стоимость</div>
              <input
                className="admin-input"
                min="0"
                name="price"
                onChange={handleChange}
                required
                type="number"
                value={form.price}
              />
            </label>
          </div>
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              checked={form.is_active}
              name="is_active"
              onChange={handleChange}
              type="checkbox"
            />
            Услуга активна
          </label>
          {error && <div className="text-sm text-fuchsia-700">{error}</div>}
          {message && <div className="text-sm text-violet-700">{message}</div>}
          <button className="admin-primary w-full" type="submit">
            {form.id ? "Сохранить изменения" : "Добавить услугу"}
          </button>
        </form>
      </section>

      <section className="space-y-4">
        {services.map((service) => (
          <article key={service.id} className="admin-card p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {service.name}
                  </h2>
                  {!service.is_active && (
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                      скрыта
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {service.description}
                </p>
                <p className="mt-3 text-sm text-slate-500">
                  Исполнитель:{" "}
                  <span className="font-semibold text-slate-900">
                    {service.staff_name || "Не назначен"}
                  </span>
                </p>
                <p className="mt-3 text-sm text-slate-500">
                  {service.duration} минут •{" "}
                  {Number(service.price).toLocaleString("ru-RU")} ₽
                </p>
              </div>
              <div className="flex w-full flex-wrap gap-3 sm:w-auto">
                <button
                  className="admin-secondary w-full sm:w-auto"
                  onClick={() => handleEdit(service)}
                  type="button"
                >
                  Редактировать
                </button>
                <button
                  className="admin-danger w-full sm:w-auto"
                  onClick={() => handleDelete(service.id)}
                  type="button"
                >
                  Удалить
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
