import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";
import { useConfirmDialog } from "../context/ConfirmDialogContext.jsx";

const emptyForm = {
  id: null,
  name: "",
  description: "",
  worker_ids: [],
  duration: 60,
  price: 1500,
  is_active: true
};

function formatPrice(value) {
  return Number(value).toLocaleString("ru-RU");
}

export default function ManageServicesPage() {
  const confirm = useConfirmDialog();
  const [services, setServices] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [servicesResponse, workersResponse] = await Promise.all([
        api.services.getAdminAll(),
        api.workers.getAll()
      ]);

      setServices(servicesResponse);
      setWorkers(workersResponse);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeCount = services.filter((service) => service.is_active).length;
  const assignedCount = services.filter((service) => service.workers_count > 0).length;
  const averageDuration = services.length
    ? Math.round(
        services.reduce((sum, service) => sum + Number(service.duration), 0) /
          services.length
      )
    : 0;

  const openCreateModal = () => {
    setForm(emptyForm);
    setModalError("");
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setForm({
      id: service.id,
      name: service.name,
      description: service.description,
      worker_ids: (service.workers || []).map((worker) => Number(worker.id)),
      duration: String(service.duration),
      price: String(Number(service.price)),
      is_active: service.is_active
    });
    setModalError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalError("");
    setForm(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const toggleWorker = (workerId) => {
    setForm((current) => {
      const hasWorker = current.worker_ids.includes(workerId);

      return {
        ...current,
        worker_ids: hasWorker
          ? current.worker_ids.filter((id) => id !== workerId)
          : [...current.worker_ids, workerId]
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setModalError("");
    setError("");
    setMessage("");

    try {
      const payload = {
        name: form.name,
        description: form.description,
        worker_ids: form.worker_ids,
        duration: Number(form.duration),
        price: Number(form.price),
        is_active: Boolean(form.is_active)
      };

      if (form.id) {
        await api.services.update(form.id, payload);
        setMessage("Услуга обновлена");
      } else {
        await api.services.create(payload);
        setMessage("Услуга добавлена");
      }

      closeModal();
      await loadData();
    } catch (submitError) {
      setModalError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (service) => {
    const approved = await confirm({
      title: "Удалить услугу?",
      description: `Услуга «${service.name}» будет полностью удалена из системы, если по ней нет записей.`,
      confirmText: "Да, удалить",
      cancelText: "Нет",
      tone: "danger"
    });

    if (!approved) {
      return;
    }

    try {
      setError("");
      setMessage("");
      await api.services.removePermanent(service.id);
      setMessage("Услуга полностью удалена");
      await loadData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <div className="space-y-6">
      <section className="admin-card p-5 md:p-6">
        <div className="ui-section-header">
          <div className="ui-section-copy">
            <div className="admin-chip">Услуги</div>
            <h1 className="ui-section-title">Управление услугами</h1>
            <p className="ui-section-description">
              Добавляйте новые позиции, быстро редактируйте стоимость, длительность
              и назначайте сотрудника через отдельное окно без перегруженной страницы.
            </p>
          </div>

          <Button
            className="lg:w-auto"
            fullWidth
            icon={
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-base leading-none">
                +
              </span>
            }
            onClick={openCreateModal}
            type="button"
            variant="primary"
            size="lg"
          >
            Новая услуга
          </Button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="ui-stat-card">
            <div className="ui-stat-label">Активных услуг</div>
            <div className="ui-stat-value">{activeCount}</div>
          </div>
          <div className="ui-stat-card">
            <div className="ui-stat-label">Назначено сотрудникам</div>
            <div className="ui-stat-value">{assignedCount}</div>
          </div>
          <div className="ui-stat-card">
            <div className="ui-stat-label">Средняя длительность</div>
            <div className="ui-stat-value">{averageDuration ? `${averageDuration} мин` : "—"}</div>
          </div>
        </div>

        {error && <div className="ui-alert-error mt-4">{error}</div>}
        {message && <div className="ui-alert-info mt-4">{message}</div>}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {services.map((service) => (
          <article key={service.id} className="admin-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-2xl font-bold leading-tight text-slate-900">
                    {service.name}
                  </h2>
                  <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-600">
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                      />
                    </svg>
                    {service.duration} мин
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      service.is_active
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-600"
                        : "border border-slate-200 bg-slate-100 text-slate-500"
                    }`}
                  >
                    {service.is_active ? "Активна" : "Скрыта"}
                  </span>

                  <div className="text-right">
                    <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                      Стоимость
                    </div>
                    <div className="mt-1 text-base font-semibold text-slate-900">
                      {formatPrice(service.price)} ₽
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ui-card-muted mt-4 px-4 py-3.5">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                Описание услуги
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {service.description || "Описание пока не добавлено."}
              </p>
            </div>

            <div className="ui-card-muted mt-4 px-4 py-3.5">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                Исполнители
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                {service.staff_name || "Не назначены"}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {service.workers_count
                  ? `${service.workers_count} доступны для записи`
                  : "Сотрудники пока не добавлены"}
              </div>
            </div>

            <div className="mt-4 flex w-full gap-2">
                <Button
                  className="flex-1"
                  onClick={() => openEditModal(service)}
                  type="button"
                  variant="secondary"
                  size="sm"
                >
                  Редактировать
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleDelete(service)}
                  type="button"
                  variant="danger"
                  size="sm"
                >
                  Удалить
                </Button>
            </div>
          </article>
        ))}
      </section>

      {!services.length && (
        <section className="admin-card p-6 text-sm text-slate-500">
          Пока нет ни одной услуги. Создайте первую через кнопку «Новая услуга».
        </section>
      )}

      <Modal
        description={
          form.id
            ? "Измените параметры услуги и сохраните обновлённую карточку."
            : "Заполните основные данные, назначьте сотрудника и добавьте услугу в каталог."
        }
        onClose={closeModal}
        open={modalOpen}
        title={form.id ? "Редактировать услугу" : "Новая услуга"}
        footer={
          <>
            <Button onClick={closeModal} type="button" variant="secondary">
              Отмена
            </Button>
            <Button
              form="service-form"
              type="submit"
              disabled={submitting}
              loading={submitting}
              variant="primary"
            >
              {form.id ? "Сохранить услугу" : "Создать услугу"}
            </Button>
          </>
        }
      >
        <form className="space-y-4" id="service-form" onSubmit={handleSubmit}>
          <label className="block">
            <span className="ui-label">Название услуги</span>
            <input
              className="admin-input"
              name="name"
              onChange={handleChange}
              placeholder="Например: мужская стрижка"
              required
              value={form.name}
            />
          </label>

          <label className="block">
            <span className="ui-label">Комментарий</span>
            <textarea
              className="ui-textarea min-h-28"
              name="description"
              onChange={handleChange}
              placeholder="Коротко опишите, что входит в услугу"
              value={form.description}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="ui-label">Длительность, минут</span>
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
          </div>

          <div className="block">
            <span className="ui-label">Исполнители услуги</span>
            <div className="grid gap-3 md:grid-cols-2">
              {workers.map((worker) => {
                const checked = form.worker_ids.includes(worker.id);

                return (
                  <label
                    key={worker.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                      checked
                        ? "border-violet-200 bg-violet-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <input
                      checked={checked}
                      onChange={() => toggleWorker(worker.id)}
                      type="checkbox"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-900">
                        {worker.full_name}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {worker.position}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            {!workers.length && (
              <div className="ui-alert border-dashed border-slate-200 bg-slate-50 text-slate-500">
                Сначала добавьте работников во вкладке «Работники».
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="ui-label">Стоимость</span>
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

            <label className="ui-card-muted flex h-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700">
              <input
                checked={form.is_active}
                name="is_active"
                onChange={handleChange}
                type="checkbox"
              />
              Показывать услугу в каталоге
            </label>
          </div>

          {modalError && <div className="ui-alert-error">{modalError}</div>}
        </form>
      </Modal>
    </div>
  );
}
