import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  open,
  title,
  description,
  children,
  footer,
  onClose,
  widthClassName = "max-w-2xl"
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/30 p-3 backdrop-blur-[2px] sm:items-center sm:p-4">
      <button
        aria-label="Закрыть окно"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <div
        className={`relative z-[1] w-full ${widthClassName} overflow-hidden rounded-[28px] border bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]`}
        style={{ borderColor: "var(--ui-border)" }}
      >
        <div className="border-b px-4 py-4 sm:px-5 md:px-6" style={{ borderColor: "var(--ui-border)" }}>
          <div className="text-xl font-bold text-slate-950">{title}</div>
          {description && (
            <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
          )}
        </div>

        {children ? (
          <div className="max-h-[78vh] overflow-y-auto px-4 py-4 sm:max-h-[70vh] sm:px-5 sm:py-5 md:px-6">{children}</div>
        ) : null}

        {footer && (
          <div
            className="flex flex-col-reverse gap-3 border-t bg-slate-50 px-4 py-4 sm:flex-row sm:flex-wrap sm:justify-end sm:px-5 md:px-6"
            style={{ borderColor: "var(--ui-border)" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
