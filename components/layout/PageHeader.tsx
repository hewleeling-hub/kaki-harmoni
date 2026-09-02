import type { ReactNode } from "react";
import Image from "next/image";
import { Lotti } from "@/components/ui/Lotti";

/** Warm page header used across the customer sub-pages. */
export function PageHeader({
  title,
  subtitle,
  showLotti = false,
  image,
  children,
}: {
  title: string;
  subtitle?: string;
  /**
   * Off by default. The mascot used to sit in every one of these headers, so
   * you met the same drawing again at the top of Our Spa, Prices, Contact and
   * FAQ — it stopped being a greeting and became furniture. Lotti still
   * appears where she is doing a job: the homepage hero, About, Your Visit,
   * Experiences and the booking confirmation. Pass `showLotti` to bring her
   * back on a specific page.
   */
  showLotti?: boolean;
  /**
   * A real photo in the mascot's slot, for pages where a picture does a job
   * Lotti can't — Find Us needs the actual door, not a drawing of one. Unlike
   * Lotti it stays visible on mobile: people use the photo while stood outside.
   */
  image?: { src: string; alt: string; width: number; height: number };
  children?: ReactNode;
}) {
  return (
    <header className="fade-up mt-4 rounded-[24px] border border-line bg-[radial-gradient(circle_at_85%_20%,#EFD6BD_0%,#FFFDF8_70%)] p-6 shadow-[var(--shadow-warm)] sm:p-8">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-[30px] leading-tight text-olive-dark sm:text-[38px]">{title}</h1>
          {subtitle && <p className="mt-2 max-w-xl text-[18px] leading-relaxed text-muted">{subtitle}</p>}
        </div>
        {image ? (
          <div className="shrink-0">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              priority
              className="h-auto w-28 rounded-[16px] border border-line object-contain shadow-[var(--shadow-warm)] sm:w-44"
            />
          </div>
        ) : (
          showLotti && (
            <div className="hidden shrink-0 sm:block">
              <Lotti size={96} className="h-auto w-24" />
            </div>
          )
        )}
      </div>
      {children && <div className="mt-5">{children}</div>}
    </header>
  );
}
