import { Link } from "react-router-dom";

export default function BrandLogo({ to = "/", compact = false }) {
  return (
    <Link
      to={to}
      className="brand-logo inline-flex items-center gap-3 text-[#7c4ee4]"
    >
      <span
        className={`brand-logo-icon relative inline-flex shrink-0 overflow-hidden items-center justify-center rounded-[24px] bg-gradient-to-br from-[#8e63f5] to-[#6d43d7] ${
          compact ? "h-12 w-12 rounded-[16px]" : "h-16 w-16"
        }`}
      >
        <svg
          aria-hidden="true"
          className={`relative z-[1] ${compact ? "h-7 w-7" : "h-9 w-9"}`}
          fill="none"
          viewBox="0 0 64 64"
        >
          <rect
            x="14"
            y="14"
            width="36"
            height="36"
            rx="7"
            transform="rotate(45 32 32)"
            stroke="white"
            strokeWidth="5"
          />
        </svg>
      </span>
      <span 
        className={`brand-logo-text font-display font-bold uppercase tracking-[0.02em] ${
          compact ? "text-2xl sm:text-[1.75rem]" : "text-4xl md:text-6xl"
        }`}
      >
        ALONE 
      </span>
    </Link>
  );
}
