export default function AuthInput({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  autoComplete,
  required = false,
  icon,
  suffix,
  hint
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="ui-label mb-0">{label}</span>
        {hint}
      </div>
      <div className="ui-input-shell">
        {icon && <span className="mr-3 text-slate-400">{icon}</span>}
        <input
          autoComplete={autoComplete}
          className=""
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          type={type}
          value={value}
        />
        {suffix && <div className="ml-3">{suffix}</div>}
      </div>
    </label>
  );
}
