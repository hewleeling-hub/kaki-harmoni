export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`font-display text-2xl italic font-semibold ${className}`}>
      <span style={{ color: "var(--lagoon)" }}>Kaki</span>{" "}
      <span style={{ color: "var(--clay)" }}>Harmoni</span>
    </div>
  );
}
