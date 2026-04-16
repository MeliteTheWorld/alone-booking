export default function HeroStats() {
  const stats = [
    { value: "24/7", label: "онлайн-запись без звонков" },
    { value: "2 роли", label: "клиент и администратор" },
    { value: "MVP", label: "готов для защиты проекта" }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="surface p-5">
          <div className="font-display text-3xl font-bold text-slate-900">{stat.value}</div>
          <div className="muted mt-2">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
