import { useEffect, useMemo, useRef, useState } from "react";

function ChevronIcon({ open = false }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-4 w-4 ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default function SelectField({
  label,
  value,
  options,
  placeholder = "Выберите значение",
  onChange,
  renderValue,
  renderOption
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selectedOption = useMemo(
    () => options.find((option) => String(option.value) === String(value)) || null,
    [options, value]
  );

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <label className="block">
      {label && <span className="ui-label">{label}</span>}

      <div className="ui-field-wrap" ref={rootRef}>
        <button
          className="ui-select-field text-left"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          {selectedOption
            ? renderValue
              ? renderValue(selectedOption)
              : selectedOption.label
            : placeholder}
        </button>
        <span className="ui-field-icon">
          <ChevronIcon open={open} />
        </span>

        {open && (
          <div className="absolute left-0 top-[calc(100%+10px)] z-30 w-full overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.14)]">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              {label || placeholder}
            </div>

            <div className="max-h-72 overflow-y-auto p-2">
              {options.map((option) => {
                const isActive = String(option.value) === String(value);

                return (
                  <button
                    key={option.value}
                    className={`w-full rounded-2xl px-4 py-3 text-left ${
                      isActive ? "bg-violet-50 text-violet-700" : "text-slate-700 hover:bg-slate-50"
                    }`}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    type="button"
                  >
                    {renderOption ? renderOption(option, isActive) : option.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </label>
  );
}
