import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import ProfileBookingsTab from "../components/ProfileBookingsTab.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useConfirmDialog } from "../context/ConfirmDialogContext.jsx";
import { getLocalIsoDate } from "../utils/date.js";
import { avatarOptions, getAvatarByKey } from "../utils/avatars.js";

function formatDate(dateValue) {
  if (!dateValue) {
    return "Недоступно";
  }

  return new Date(dateValue).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function todayIso() {
  return getLocalIsoDate();
}

function buildClientStats(bookings) {
  const today = todayIso();
  return [
    {
      label: "Всего записей",
      value: bookings.length,
      helper: "в истории аккаунта"
    },
    {
      label: "Предстоящие",
      value: bookings.filter((booking) => booking.booking_date >= today && ["pending", "confirmed", "in_progress"].includes(booking.status)).length,
      helper: "актуальные визиты"
    },
    {
      label: "Завершённые",
      value: bookings.filter((booking) => booking.status === "completed").length,
      helper: "оказанные услуги"
    },
    {
      label: "Отменённые",
      value: bookings.filter((booking) => booking.status === "cancelled").length,
      helper: "отклонённые записи"
    }
  ];
}

function buildAdminStats(summary) {
  if (!summary) {
    return [];
  }

  return [
    {
      label: "Активные услуги",
      value: summary.services,
      helper: "видно клиенту"
    },
    {
      label: "Клиенты",
      value: summary.clients,
      helper: "в базе ALONE"
    },
    {
      label: "Активные записи",
      value: summary.activeBookings,
      helper: "в процессе работы"
    },
    {
      label: "Сегодня",
      value: summary.todayBookings,
      helper: "визитов на сегодня"
    }
  ];
}

const emptyPasswordForm = {
  current_password: "",
  new_password: "",
  confirm_password: ""
};

export default function ProfilePage() {
  const { user, isAdmin, refreshProfile, updateProfile } = useAuth();
  const confirm = useConfirmDialog();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    avatar_key: ""
  });
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const activeTab = !isAdmin && searchParams.get("tab") === "bookings" ? "bookings" : "overview";

  useEffect(() => {
    async function loadProfileData() {
      try {
        setError("");

        const profilePayload = await refreshProfile();
        setProfile(profilePayload);
        setForm({
          name: profilePayload.name || "",
          email: profilePayload.email || "",
          avatar_key: profilePayload.avatar_key || ""
        });

        if (isAdmin) {
          setSummary(await api.bookings.summary());
          setBookings([]);
        } else {
          setBookings(await api.bookings.getAll());
          setSummary(null);
        }
      } catch (loadError) {
        setError(loadError.message);
      }
    }

    loadProfileData();
  }, [isAdmin]);

  const stats = useMemo(
    () => (isAdmin ? buildAdminStats(summary) : buildClientStats(bookings)),
    [bookings, isAdmin, summary]
  );

  const tabs = isAdmin
    ? [{ id: "overview", label: "Профиль", helper: "личные данные" }]
    : [
        { id: "overview", label: "Профиль", helper: "личные данные" },
        { id: "bookings", label: "Записи", helper: "мои бронирования" }
      ];

  const recentItems = useMemo(() => {
    if (isAdmin) {
      return [
        { label: "Панель управления", value: "Используйте профиль для контроля личных данных аккаунта администратора." },
        { label: "Быстрый доступ", value: "Отсюда можно перейти в календарь и в управление услугами." }
      ];
    }

    return bookings.slice(0, 4).map((booking) => ({
      label: booking.service_name,
      value: `${formatDate(booking.booking_date)} • ${booking.booking_time.slice(0, 5)}`
    }));
  }, [bookings, isAdmin]);

  const handleProfileChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handlePasswordChange = (event) => {
    setPasswordForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (passwordForm.new_password && passwordForm.new_password !== passwordForm.confirm_password) {
        throw new Error("Подтверждение нового пароля не совпадает");
      }

      const approved = await confirm({
        title: passwordForm.new_password
          ? "Сохранить профиль и сменить пароль?"
          : "Сохранить изменения профиля?",
        description: passwordForm.new_password
          ? "Имя, email, аватар и новый пароль будут применены к вашему аккаунту."
          : "Обновлённые данные профиля будут сразу сохранены.",
        confirmText: "Да, сохранить",
        cancelText: "Нет"
      });

      if (!approved) {
        return;
      }

      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        name: form.name,
        email: form.email,
        avatar_key: form.avatar_key || null
      };

      if (passwordForm.new_password) {
        payload.current_password = passwordForm.current_password;
        payload.new_password = passwordForm.new_password;
      }

      const result = await updateProfile(payload);
      setProfile(result.user);
      setPasswordForm(emptyPasswordForm);
      setMessage("Профиль обновлён");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  };

  const setTab = (tabId) => {
    navigate(tabId === "overview" ? "/profile" : `/profile?tab=${tabId}`);
  };

  const selectedAvatar = getAvatarByKey(form.avatar_key || profile?.avatar_key);

  return (
    <div className="space-y-6">
      <div>
        <div>
          <div className="admin-chip">Профиль</div>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">
            {isAdmin ? "Профиль администратора" : "Личный профиль"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Здесь можно обновить личные данные аккаунта и быстро посмотреть ключевую сводку по активности.
          </p>
        </div>
      </div>

      {error && (
        <div className="admin-card border-fuchsia-200 bg-fuchsia-50 px-5 py-4 text-sm text-fuchsia-700">
          {error}
        </div>
      )}
      {message && (
        <div className="admin-card border-violet-200 bg-violet-50 px-5 py-4 text-sm text-violet-700">
          {message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div className="admin-card p-5" key={item.label}>
            <div className="text-sm font-medium text-slate-500">{item.label}</div>
            <div className="mt-3 text-3xl font-bold text-slate-900">{item.value}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">
              {item.helper}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <section className="admin-card p-4">
            <nav className="grid gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`admin-sidebar-link w-full justify-between ${
                    activeTab === tab.id ? "admin-sidebar-link-active" : ""
                  }`}
                  onClick={() => setTab(tab.id)}
                  type="button"
                >
                  <span>{tab.label}</span>
                  <span className="text-xs font-medium text-slate-400">
                    {tab.helper}
                  </span>
                </button>
              ))}
            </nav>
          </section>

          <section className="admin-card p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-violet-100 text-3xl font-bold text-violet-700">
                {selectedAvatar ? (
                  <img
                    alt={profile?.name || user?.name || "Аватар профиля"}
                    className="h-full w-full object-cover"
                    src={selectedAvatar.src}
                  />
                ) : (
                  (profile?.name || user?.name || "A").slice(0, 1).toUpperCase()
                )}
              </div>
              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                {profile?.name || user?.name}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {isAdmin ? "Администратор" : "Клиент"}
              </p>
            </div>

            <div className="mt-6 space-y-4 border-t border-slate-200 pt-5 text-sm">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Email</div>
                <div className="mt-1 font-medium text-slate-900">{profile?.email || user?.email}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Дата регистрации</div>
                <div className="mt-1 font-medium text-slate-900">{formatDate(profile?.created_at)}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Роль</div>
                <div className="mt-1 font-medium text-slate-900">
                  {isAdmin ? "Администратор системы" : "Клиентский аккаунт"}
                </div>
              </div>
            </div>
          </section>

          <section className="admin-card p-6">
            <h2 className="text-xl font-bold text-slate-900">Недавняя активность</h2>
            <div className="mt-4 space-y-3">
              {recentItems.length ? (
                recentItems.map((item) => (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" key={`${item.label}-${item.value}`}>
                    <div className="font-semibold text-slate-900">{item.label}</div>
                    <div className="mt-1 text-sm text-slate-500">{item.value}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  Пока нет данных для отображения.
                </div>
              )}
            </div>
          </section>
        </aside>

        <section className="admin-card p-6 md:p-8">
          {activeTab === "bookings" ? (
            <>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                  Мои записи
                </div>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                  Управление бронированиями
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Здесь можно переносить визиты, отменять их и следить за текущим статусом каждой записи.
                </p>
              </div>
              <div className="mt-8">
                <ProfileBookingsTab />
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                  Настройки аккаунта
                </div>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                  Личные данные и безопасность
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Обновите имя, email и пароль. Если пароль менять не нужно, просто оставьте поля безопасности пустыми.
                </p>
              </div>

              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <div className="mb-2 text-sm font-semibold text-slate-700">Имя</div>
                    <input
                      className="admin-input"
                      name="name"
                      onChange={handleProfileChange}
                      placeholder="Ваше имя"
                      required
                      value={form.name}
                    />
                  </label>
                  <label className="block">
                    <div className="mb-2 text-sm font-semibold text-slate-700">Email</div>
                    <input
                      className="admin-input"
                      name="email"
                      onChange={handleProfileChange}
                      placeholder="name@example.com"
                      required
                      type="email"
                      value={form.email}
                    />
                  </label>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <div className="text-sm font-semibold text-slate-900">
                    Аватар профиля
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {avatarOptions.map((avatar) => {
                      const isActive = form.avatar_key === avatar.key;

                      return (
                        <button
                          className={`rounded-[24px] border px-4 py-4 text-left ${
                            isActive
                              ? "border-violet-300 bg-violet-50"
                              : "border-slate-200 bg-white"
                          }`}
                          key={avatar.key}
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              avatar_key: avatar.key
                            }))
                          }
                          type="button"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 overflow-hidden rounded-full border border-slate-200 bg-violet-50">
                              <img
                                alt={avatar.label}
                                className="h-full w-full object-cover"
                                src={avatar.src}
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">
                                {avatar.label}
                              </div>
                              <div className="mt-1 text-sm text-slate-500">
                                {isActive ? "Выбрана для аккаунта" : "Нажмите, чтобы выбрать"}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <div className="text-sm font-semibold text-slate-900">Смена пароля</div>
                  <div className="mt-4 grid gap-5 md:grid-cols-3">
                    <label className="block">
                      <div className="mb-2 text-sm font-medium text-slate-600">Текущий пароль</div>
                      <input
                        className="admin-input"
                        name="current_password"
                        onChange={handlePasswordChange}
                        placeholder="Введите текущий пароль"
                        type="password"
                        value={passwordForm.current_password}
                      />
                    </label>
                    <label className="block">
                      <div className="mb-2 text-sm font-medium text-slate-600">Новый пароль</div>
                      <input
                        className="admin-input"
                        name="new_password"
                        onChange={handlePasswordChange}
                        placeholder="Минимум 6 символов"
                        type="password"
                        value={passwordForm.new_password}
                      />
                    </label>
                    <label className="block">
                      <div className="mb-2 text-sm font-medium text-slate-600">Подтверждение</div>
                      <input
                        className="admin-input"
                        name="confirm_password"
                        onChange={handlePasswordChange}
                        placeholder="Повторите новый пароль"
                        type="password"
                        value={passwordForm.confirm_password}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    className="admin-primary"
                    disabled={saving}
                    type="submit"
                  >
                    {saving ? "Сохраняем..." : "Сохранить изменения"}
                  </button>
                  <button
                    className="admin-secondary"
                    onClick={() => {
                      setForm({
                        name: profile?.name || user?.name || "",
                        email: profile?.email || user?.email || "",
                        avatar_key: profile?.avatar_key || user?.avatar_key || ""
                      });
                      setPasswordForm(emptyPasswordForm);
                      setError("");
                      setMessage("");
                    }}
                    type="button"
                  >
                    Сбросить
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
