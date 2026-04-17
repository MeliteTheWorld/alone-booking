import { startTransition, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthInput from "../components/AuthInput.jsx";
import AuthLayout from "../components/AuthLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function normalizeMode(mode) {
  return mode === "register" ? "register" : "login";
}

function EmailIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m5 8 7 5 7-5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 19a7 7 0 0 1 14 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function PasswordIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M8 10V8a4 4 0 1 1 8 0v2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <path
          d="M3 3 21 21M10.6 10.7A3 3 0 0 0 13.3 13.4M9.9 5.2A11.4 11.4 0 0 1 12 5c4.9 0 8.9 2.9 10 7-0.4 1.5-1.3 2.9-2.6 4M6 6.2C4 7.5 2.6 9.4 2 12c1.1 4.1 5.1 7 10 7 1.7 0 3.2-.3 4.6-.9"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M2 12c1.2-4.2 5.1-7 10-7s8.8 2.8 10 7c-1.2 4.2-5.1 7-10 7S3.2 16.2 2 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function AuthPage({ initialMode = "login" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, adminLogin, register } = useAuth();
  const requestedMode = normalizeMode(
    new URLSearchParams(location.search).get("mode") ?? initialMode
  );
  const [mode, setMode] = useState(requestedMode);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [adminAccess, setAdminAccess] = useState(false);

  useEffect(() => {
    setMode(requestedMode);
    setLoginError("");
    setRegisterError("");
    setAdminAccess(false);
  }, [requestedMode]);

  const switchMode = (nextMode) => {
    startTransition(() => {
      const normalizedMode = normalizeMode(nextMode);
      setMode(normalizedMode);
      setLoginError("");
      setRegisterError("");
      setAdminAccess(false);
      navigate(`/auth?mode=${normalizedMode}`, {
        replace: true,
        state: location.state
      });
    });
  };

  const handleLoginChange = (event) => {
    setLoginForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleRegisterChange = (event) => {
    setRegisterForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setLoginError("");

    try {
      await (adminAccess
        ? adminLogin({ password: loginForm.password })
        : login(loginForm));
      navigate(adminAccess ? "/admin" : location.state?.from || "/services");
    } catch (submitError) {
      setLoginError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setRegisterError("");

    try {
      await register(registerForm);
      navigate("/services");
    } catch (submitError) {
      setRegisterError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const enableAdminAccess = () => {
    setAdminAccess(true);
    setLoginError("");
    setLoginForm((current) => ({
      ...current,
      email: "",
      password: ""
    }));
  };

  const disableAdminAccess = () => {
    setAdminAccess(false);
    setLoginError("");
    setLoginForm((current) => ({
      ...current,
      password: ""
    }));
  };

  const isLogin = mode === "login";

  return (
    <AuthLayout
      cardAction={
        adminAccess ? null : (
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                isLogin
                  ? "bg-[#8e63f5] text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              onClick={() => switchMode("login")}
              type="button"
            >
              Вход
            </button>
            <button
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                !isLogin
                  ? "bg-[#8e63f5] text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              onClick={() => switchMode("register")}
              type="button"
            >
              Регистрация
            </button>
          </div>
        )
      }
      cardTitle={isLogin ? "Вход в аккаунт" : "Регистрация"}
      footer={
        isLogin ? (
          <>
            Нет аккаунта?{" "}
            <button
              className="font-semibold text-violet-600 hover:text-violet-700"
              onClick={() => switchMode("register")}
              type="button"
            >
              Зарегистрироваться
            </button>
          </>
        ) : (
          <>
            Уже есть аккаунт?{" "}
            <button
              className="font-semibold text-violet-600 hover:text-violet-700"
              onClick={() => switchMode("login")}
              type="button"
            >
              Войти
            </button>
          </>
        )
      }
      subtitle={
        isLogin
          ? adminAccess
            ? "Введите пароль администратора для входа в рабочую панель."
            : "Войдите в аккаунт клиента, чтобы записываться на услуги"
          : "Создайте профиль клиента, чтобы записываться на услуги"
      }
      title={isLogin ? (adminAccess ? "Вход администратора" : "С возвращением") : "Создайте аккаунт"}
    >
      <div
        className={`relative overflow-hidden ${
          isLogin ? "min-h-[580px] md:min-h-[540px]" : "min-h-[560px] md:min-h-[500px]"
        }`}
      >
        <div
          className={`absolute inset-0 ${
            isLogin
              ? "translate-x-0 opacity-100"
              : "-translate-x-6 pointer-events-noneц opacity-0"
          }`}
        >
          <form className="space-y-5" onSubmit={handleLoginSubmit}>
            {!adminAccess && (
              <AuthInput
                autoComplete="email"
                icon={<EmailIcon />}
                label="Email"
                name="email"
                onChange={handleLoginChange}
                placeholder="name@example.com"
                required
                type="email"
                value={loginForm.email}
              />
            )}

            {adminAccess && (
              <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-700">
                Используется встроенный логин администратора. Введите только пароль.
              </div>
            )}

            <AuthInput
              autoComplete={adminAccess ? "one-time-code" : "current-password"}
              hint={
                adminAccess ? null : (
                  <button
                    className="text-xs font-semibold text-violet-600 transition hover:text-violet-700"
                    type="button"
                  >
                    Забыли пароль?
                  </button>
                )
              }
              icon={<PasswordIcon />}
              label="Пароль"
              name="password"
              onChange={handleLoginChange}
              placeholder="Введите пароль"
              required
              suffix={
                <button
                  className="text-slate-400 transition hover:text-slate-600"
                  onClick={() => setShowLoginPassword((current) => !current)}
                  type="button"
                >
                  <EyeIcon open={showLoginPassword} />
                </button>
              }
              type={showLoginPassword ? "text" : "password"}
              value={loginForm.password}
            />

            <label className="flex items-center gap-3 text-sm text-slate-500">
              <input
                checked={rememberMe}
                className="h-4 w-4 rounded border-slate-300 bg-white text-violet-500 focus:ring-violet-500"
                onChange={(event) => setRememberMe(event.target.checked)}
                type="checkbox"
              />
              <span>Запомнить меня на 30 дней</span>
            </label>

            {loginError && (
              <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50 px-4 py-3 text-sm text-fuchsia-700">
                {loginError}
              </div>
            )}

            <button
              className="w-full rounded-2xl bg-[#8e63f5] px-5 py-3.5 font-semibold text-white transition hover:bg-[#7c4ee4]"
              disabled={submitting}
              type="submit"
            >
              {submitting
                ? adminAccess
                  ? "Проверяем пароль..."
                  : "Входим..."
                : adminAccess
                  ? "Войти в админку"
                  : "Войти"}
            </button>

            {adminAccess && (
              <button
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={disableAdminAccess}
                type="button"
              >
                Вернуться к обычному входу
              </button>
            )}
          </form>

          {!adminAccess && (
            <>
              <div className="my-6 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                <div className="h-px flex-1 bg-slate-200" />
                <span>или войти как админ</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                className="inline-flex min-h-[58px] w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={enableAdminAccess}
                type="button"
              >
                <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M12 3 18 5v5c0 4-2.6 7.7-6 9-3.4-1.3-6-5-6-9V5l6-2Z"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                  <path
                    d="m9.5 11.7 1.7 1.8 3.3-3.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
                Вход для администратора
              </button>
            </>
          )}
        </div>

        <div
          className={`absolute inset-0 ${
            !isLogin
              ? "translate-x-0 opacity-100"
              : "translate-x-6 pointer-events-none opacity-0"
          }`}
        >
          <form className="space-y-5" onSubmit={handleRegisterSubmit}>
            <AuthInput
              autoComplete="name"
              icon={<UserIcon />}
              label="Имя"
              name="name"
              onChange={handleRegisterChange}
              placeholder="Ваше имя"
              required
              value={registerForm.name}
            />

            <AuthInput
              autoComplete="email"
              icon={<EmailIcon />}
              label="Email"
              name="email"
              onChange={handleRegisterChange}
              placeholder="name@example.com"
              required
              type="email"
              value={registerForm.email}
            />

            <AuthInput
              autoComplete="new-password"
              icon={<PasswordIcon />}
              label="Пароль"
              name="password"
              onChange={handleRegisterChange}
              placeholder="Минимум 6 символов"
              required
              suffix={
                <button
                  className="text-slate-400 transition hover:text-slate-600"
                  onClick={() => setShowRegisterPassword((current) => !current)}
                  type="button"
                >
                  <EyeIcon open={showRegisterPassword} />
                </button>
              }
              type={showRegisterPassword ? "text" : "password"}
              value={registerForm.password}
            />

            {registerError && (
              <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50 px-4 py-3 text-sm text-fuchsia-700">
                {registerError}
              </div>
            )}

            <button
              className="w-full rounded-2xl bg-[#8e63f5] px-5 py-3.5 font-semibold text-white transition hover:bg-[#7c4ee4]"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Создаём аккаунт..." : "Создать аккаунт"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
            После регистрации клиент сразу получает доступ к бронированию,
            переносу и отмене своих записей.
          </div>
        </div>
      </div>

    </AuthLayout>
  );
}
