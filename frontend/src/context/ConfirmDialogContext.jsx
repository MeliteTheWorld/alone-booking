import { createContext, useCallback, useContext, useState } from "react";
import Modal from "../components/Modal.jsx";

const ConfirmDialogContext = createContext(null);

export function ConfirmDialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setDialog({
        title: options.title || "Подтверждение действия",
        description:
          options.description || "Вы действительно хотите это сделать?",
        content: options.content || null,
        confirmText: options.confirmText || "Да",
        cancelText: options.cancelText || "Нет",
        tone: options.tone || "default",
        resolve
      });
    });
  }, []);

  const closeDialog = (result) => {
    if (!dialog) {
      return;
    }

    dialog.resolve(result);
    setDialog(null);
  };

  return (
    <ConfirmDialogContext.Provider value={confirm}>
      {children}
      <Modal
        description={dialog?.description}
        footer={
          <>
            <button
              className="admin-secondary min-w-[120px]"
              onClick={() => closeDialog(false)}
              type="button"
            >
              {dialog?.cancelText || "Нет"}
            </button>
            <button
              className={
                dialog?.tone === "danger"
                  ? "inline-flex min-w-[120px] items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 font-semibold text-white"
                  : "admin-primary min-w-[120px]"
              }
              onClick={() => closeDialog(true)}
              type="button"
            >
              {dialog?.confirmText || "Да"}
            </button>
          </>
        }
        onClose={() => closeDialog(false)}
        open={Boolean(dialog)}
        title={dialog?.title}
        widthClassName="max-w-lg"
      >
        {dialog?.content}
      </Modal>
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);

  if (!context) {
    throw new Error("useConfirmDialog must be used within ConfirmDialogProvider");
  }

  return context;
}
