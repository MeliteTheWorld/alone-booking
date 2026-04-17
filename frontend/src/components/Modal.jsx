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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-[2px]">
      <button
        aria-label="Закрыть окно"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <div
        className={`relative z-[1] w-full ${widthClassName} overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]`}
      >
        <div className="border-b border-slate-200 px-5 py-4 md:px-6">
          <div className="text-xl font-bold text-slate-900">{title}</div>
          {description && (
            <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
          )}
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-5 md:px-6">{children}</div>

        {footer && (
          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 md:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
