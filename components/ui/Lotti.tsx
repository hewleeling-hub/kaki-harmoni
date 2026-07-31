import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Lotti — the Kaki Harmoni lotus mascot. Uses the real artwork at
 * /public/lotti.png (single pose). `size` controls the rendered width.
 */
export function Lotti({
  className = "",
  size = 208,
  priority = false,
  alt = "Lotti, the Kaki Harmoni lotus mascot, soaking her feet with a coffee",
}: {
  className?: string;
  size?: number;
  priority?: boolean;
  alt?: string;
}) {
  return (
    <Image
      src="/lotti.png"
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={`object-contain ${className}`}
    />
  );
}

/** Lotti with a handwritten-style speech message beside her. */
export function LottiCard({
  message,
  className = "",
  children,
}: {
  message?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Lotti size={112} className="w-24 shrink-0 sm:w-28" />
      <div className="relative rounded-[20px] rounded-bl-sm border border-line bg-ivory px-4 py-3 shadow-[var(--shadow-warm)]">
        {message && (
          <p className="text-[17px] italic text-brown" style={{ fontFamily: "var(--font-heading)" }}>
            {message}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
