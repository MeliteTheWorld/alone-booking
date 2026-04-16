import BrandLogo from "./BrandLogo.jsx";

export default function AuthLayout({
  title,
  subtitle,
  cardTitle,
  cardAction,
  footer,
  children
}) {
  return (
    <div className="mx-auto max-w-md py-3 md:py-6">
      <div className="text-center" data-reveal>
        <div className="flex justify-center">
          <BrandLogo compact />
        </div>
        <h1 className="mt-5 font-display text-3xl font-bold text-slate-900 md:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500 md:text-base">
          {subtitle}
        </p>
      </div>

      <div
        className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] md:p-7"
        data-reveal
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h2 className="text-left text-lg font-semibold text-slate-900">
            {cardTitle}
          </h2>
          {cardAction}
        </div>

        <div className="mt-6">{children}</div>
      </div>

      {footer && (
        <div className="mx-auto mt-5 max-w-md text-center text-sm text-slate-500">
          {footer}
        </div>
      )}
    </div>
  );
}
