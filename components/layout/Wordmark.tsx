import Link from "next/link";

/** Warm "Kaki Harm♥ni" wordmark (olive + brown), with tagline. */
export function Wordmark({ showTagline = true }: { showTagline?: boolean }) {
  return (
    <Link href="/" aria-label="Kaki Harmoni — home" className="inline-flex flex-col items-center leading-none">
      <span className="text-3xl font-normal tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
        <span className="text-teal">Kaki</span>{" "}
        <span aria-label="Harmoni" className="text-coral" style={{ whiteSpace: "nowrap" }}>
          Harm
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            style={{
              display: "inline-block",
              width: "0.6em",
              height: "0.6em",
              verticalAlign: "baseline",
              margin: "0 0.02em",
              color: "#e18464",
            }}
          >
            <path d="M12 21s-7.55-4.87-10.1-9.4C0.35 9.05 1.6 4.9 5.4 4.9c2.05 0 3.45 1.15 4.6 2.75C11.15 6.05 12.55 4.9 14.6 4.9c3.8 0 5.05 4.15 3.5 6.7C19.55 16.13 12 21 12 21z" />
          </svg>
          ni
        </span>
      </span>
      {showTagline && (
        <span className="mt-1 block text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-teal">
          Relax · Refresh · Reconnect
        </span>
      )}
    </Link>
  );
}
