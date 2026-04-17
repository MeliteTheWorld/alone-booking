import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import Modal from "../components/Modal.jsx";
import { useConfirmDialog } from "../context/ConfirmDialogContext.jsx";

const emptyForm = {
  id: null,
  first_name: "",
  last_name: "",
  position: ""
};

function getAssignLabel(count) {
  if (count === 1) {
    return "1 услуга";
  }

  if (count >= 2 && count <= 4) {
    return `${count} услуги`;
  }

  return `${count} услуг`;
}

export default function WorkersPage() {
  const confirm = useConfirmDialog();
  const [workers, setWorkers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [modalError, setModalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadWorkers = async () => {
    try {
      setWorkers(await api.workers.getAll());
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => {
    loadWorkers();
  }, []);

  const assignedWorkersCount = workers.filter((worker) => worker.services_count > 0).length;
  const uniquePositionsCount = new Set(
    workers.map((worker) => worker.position?.trim()).filter(Boolean)
  ).size;

  const openCreateModal = () => {
    setForm(emptyForm);
    setModalError("");
    setModalOpen(true);
  };

  const openEditModal = (worker) => {
    setForm({
      id: worker.id,
      first_name: worker.first_name,
      last_name: worker.last_name,
      position: worker.position
    });
    setModalError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setForm(emptyForm);
    setModalError("");
    setModalOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setModalError("");
    setError("");
    setMessage("");

    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        position: form.position
      };

      if (form.id) {
        await api.workers.update(form.id, payload);
        setMessage("Работник обновлён");
      } else {
        await api.workers.create(payload);
        setMessage("Работник добавлен");
      }

      closeModal();
      await loadWorkers();
    } catch (submitError) {
      setModalError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (worker) => {
    const approved = await confirm({
      title: "Удалить работника?",
      description: `Работник «${worker.full_name}» будет удалён. Во всех услугах он автоматически снимется с назначения.`,
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
      await api.workers.remove(worker.id);
      setMessage("Работник удалён");
      await loadWorkers();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <div className="space-y-6">
      <section className="admin-card p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="admin-chip">Работники</div>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Команда и роли</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Управляйте списком сотрудников и выбирайте их прямо при создании услуг.
              После удаления работник автоматически снимается со всех услуг.
            </p>
          </div>

          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-[22px] bg-[linear-gradient(135deg,#7c4ee4_0%,#8e63f5_100%)] px-5 py-3.5 text-sm font-bold text-white shadow-[0_16px_34px_rgba(124,78,228,0.24)] lg:w-auto"
            onClick={openCreateModal}
            type="button"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-base leading-none">
              +
            </span>
            Добавить работника
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-xs uppercase tracking-[0.16em] text-slate-400">
              Всего работников
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{workers.length}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-xs uppercase tracking-[0.16em] text-slate-400">
              Назначены в услуги
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{assignedWorkersCount}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-xs uppercase tracking-[0.16em] text-slate-400">
              Уникальных ролей
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{uniquePositionsCount}</div>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-fuchsia-200 bg-fuchsia-50 px-4 py-3 text-sm text-fuchsia-700">
            {error}
          </div>
        )}
        {message && (
          <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-700">
            {message}
          </div>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {workers.map((worker) => (
          <article key={worker.id} className="admin-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{worker.full_name}</h2>
                <p className="mt-2 text-sm font-medium text-violet-600">{worker.position}</p>
              </div>

              <div className="flex w-full gap-2 sm:w-auto">
                <button
                  className="admin-secondary flex-1 sm:flex-none"
                  onClick={() => openEditModal(worker)}
                  type="button"
                >
                  Редактировать
                </button>
                <button
                  className="admin-danger flex-1 sm:flex-none"
                  onClick={() => handleDelete(worker)}
                  type="button"
                >
                  Удалить
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                  Назначен в услуги
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  {getAssignLabel(worker.services_count)}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                  Карточка сотрудника
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  {worker.last_name} {worker.first_name}
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      {!workers.length && (
        <section className="admin-card p-6 text-sm text-slate-500">
          Пока нет ни одного работника. Добавьте первого сотрудника, и он появится в
          выборе при создании услуг.
        </section>
      )}

      <Modal
        description={
          form.id
            ? "Измените имя, фамилию или должность сотрудника."
            : "Добавьте сотрудника, чтобы выбирать его при создании и редактировании услуг."
        }
        onClose={closeModal}
        open={modalOpen}
        title={form.id ? "Редактировать работника" : "Новый работник"}
        widthClassName="max-w-xl"
        footer={
          <>
            <button className="admin-secondary" onClick={closeModal} type="button">
              Отмена
            </button>
            <button
              className="admin-primary"
              form="worker-form"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Сохраняем..."
                : form.id
                  ? "Сохранить работника"
                  : "Добавить работника"}
            </button>
          </>
        }
      >
        <form className="space-y-4" id="worker-form" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="ui-label">Имя</span>
              <input
                className="admin-input"
                name="first_name"
                onChange={handleChange}
                placeholder="Павел"
                required
                value={form.first_name}
              />
            </label>
            <label className="block">
              <span className="ui-label">Фамилия</span>
              <input
                className="admin-input"
                name="last_name"
                onChange={handleChange}
                placeholder="Субботин"
                required
                value={form.last_name}
              />
            </label>
          </div>

          <label className="block">
            <span className="ui-label">Должность</span>
            <input
              className="admin-input"
              name="position"
              onChange={handleChange}
              placeholder="Парикмахер"
              required
              value={form.position}
            />
          </label>

          {modalError && (
            <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50 px-4 py-3 text-sm text-fuchsia-700">
              {modalError}
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
