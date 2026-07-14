export default function Logo({
  className = "",
  size = "lg",
}: {
  className?: string;
  size?: "lg" | "sm";
}) {
  const wordmarkSize = size === "lg" ? "text-4xl md:text-5xl" : "text-2xl";
  return (
    <div className={className}>
      <div className={`font-display ${wordmarkSize} font-semibold leading-none`}>
        <span style={{ color: "var(--lagoon)" }}>Kaki</span>{" "}
        <span
          aria-label="Harmoni"
          style={{ color: "var(--clay)", whiteSpace: "nowrap" }}
        >
          Harm
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            style={{
              display: "inline-block",
              width: "0.62em",
              height: "0.62em",
              verticalAlign: "baseline",
              margin: "0 0.02em",
            }}
          >
            <path d="M12 21s-7.55-4.87-10.1-9.4C0.35 9.05 1.6 4.9 5.4 4.9c2.05 0 3.45 1.15 4.6 2.75C11.15 6.05 12.55 4.9 14.6 4.9c3.8 0 5.05 4.15 3.5 6.7C19.55 16.13 12 21 12 21z" />
          </svg>
          ni
        </span>
      </div>
      <p
        className="text-xs tracking-widest uppercase mt-2"
        style={{ color: "var(--lagoon)" }}
      >
        Relax. Refresh. Reconnect.
      </p>
    </div>
  );
}
