export default function Button({ children, variant = "primary", onClick, className = "", ariaLabel, type }) {
  return (
    <button
      type={type || "button"}
      className={`button button-${variant} ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
