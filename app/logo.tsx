export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <div className="font-display text-2xl font-semibold">
        <span style={{ color: "var(--lagoon)" }}>Kaki</span>{" "}
        <span className="italic" style={{ color: "var(--clay)" }}>Harmoni</span>
      </div>
      <p
        className="text-xs tracking-widest uppercase mt-0.5"
        style={{ color: "var(--lagoon)" }}
      >
        Relax. Refresh. Reconnect.
      </p>
    </div>
  );
}
