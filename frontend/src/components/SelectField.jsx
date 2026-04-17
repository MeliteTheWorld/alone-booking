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
          <div className="ui-menu absolute left-0 top-[calc(100%+10px)] z-30 w-full">
            <div className="ui-menu-header">
              {label || placeholder}
            </div>

            <div className="ui-menu-body max-h-72 overflow-y-auto">
              {options.map((option) => {
                const isActive = String(option.value) === String(value);

                return (
                  <button
                    key={option.value}
                    className={`ui-menu-item ${isActive ? "ui-menu-item-active" : ""}`}
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
