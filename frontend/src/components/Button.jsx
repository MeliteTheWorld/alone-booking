import { Link } from "react-router-dom";

function joinClasses(...values) {
  return values.filter(Boolean).join(" ");
}

const variantClassMap = {
  primary: "ui-btn-primary",
  secondary: "ui-btn-secondary",
  outline: "ui-btn-outline",
  ghost: "ui-btn-ghost",
  danger: "ui-btn-danger",
  disabled: "ui-btn-disabled"
};

const sizeClassMap = {
  sm: "ui-btn-sm",
  md: "ui-btn-md",
  lg: "ui-btn-lg"
};

export default function Button({
  children,
  className = "",
  disabled = false,
  fullWidth = false,
  icon,
  loading = false,
  size = "md",
  to,
  type = "button",
  variant = "primary",
  ...props
}) {
  const normalizedVariant = disabled ? "disabled" : variant;
  const classes = joinClasses(
    "ui-btn",
    sizeClassMap[size] || sizeClassMap.md,
    variantClassMap[normalizedVariant] || variantClassMap.primary,
    fullWidth ? "w-full" : "",
    className
  );

  const content = (
    <>
      {loading ? (
        <span
          aria-hidden="true"
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </>
  );

  if (to) {
    if (disabled || loading) {
      return (
        <span aria-disabled="true" className={classes}>
          {content}
        </span>
      );
    }

    return (
      <Link className={classes} to={to} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} type={type} {...props}>
      {content}
    </button>
  );
}
