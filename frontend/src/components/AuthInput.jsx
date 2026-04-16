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
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        {hint}
      </div>
      <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100">
        {icon && <span className="mr-3 text-slate-400">{icon}</span>}
        <input
          autoComplete={autoComplete}
          className="w-full border-0 bg-transparent p-0 text-sm text-slate-900 outline-none placeholder:text-slate-400"
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
