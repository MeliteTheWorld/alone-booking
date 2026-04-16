import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = window.localStorage.getItem("alone-install-dismissed");

    function handleBeforeInstallPrompt(event) {
      event.preventDefault();

      if (dismissed === "true") {
        return;
      }

      setDeferredPrompt(event);
      setVisible(true);
    }

    function handleInstalled() {
      setVisible(false);
      setDeferredPrompt(null);
      window.localStorage.removeItem("alone-install-dismissed");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const dismiss = () => {
    window.localStorage.setItem("alone-install-dismissed", "true");
    setVisible(false);
  };

  const install = async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-24 z-30 mx-auto max-w-md rounded-[28px] border border-violet-400/25 bg-[#0d0815]/95 p-4 text-white shadow-glow md:inset-x-auto md:bottom-4 md:right-8 md:w-[360px]">
      <div className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-200">
        Мобильное приложение
      </div>
      <h3 className="mt-2 font-display text-2xl font-bold">
        Установите ALONE
      </h3>
      <p className="mt-2 text-sm leading-6 text-violet-100/75">
        Откройте проект как приложение с главного экрана телефона и запускайте
        его в полноэкранном режиме.
      </p>
      <div className="mt-4 flex gap-3">
        <button
          className="inline-flex flex-1 items-center justify-center rounded-2xl bg-coral px-4 py-3 font-semibold text-white"
          onClick={install}
          type="button"
        >
          Установить
        </button>
        <button
          className="inline-flex items-center justify-center rounded-2xl border border-violet-400/20 px-4 py-3 font-semibold text-violet-100"
          onClick={dismiss}
          type="button"
        >
          Позже
        </button>
      </div>
    </div>
  );
}
