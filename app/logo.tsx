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
        <span className="italic" style={{ color: "var(--clay)" }}>Harmoni</span>
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
