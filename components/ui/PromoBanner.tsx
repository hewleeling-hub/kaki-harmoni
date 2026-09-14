import Link from "next/link";
import { businessConfig, whatsappLink } from "@/config/business";
import { activePromotion, isRunningToday, type Promotion } from "@/config/promotions";

/**
 * The band that announces a short-run offer.
 *
 * Renders nothing at all when no promotion is running, so it can sit in the
 * page unconditionally and simply stop existing when the day passes. That is
 * the point: nobody has to remember to take it down.
 *
 * The date check runs on the server on every request, which works because the
 * homepage is dynamic. On a statically rendered page, set a `revalidate` so the
 * check is re-run rather than frozen at build time.
 */
export function PromoBanner({ now = new Date() }: { now?: Date }) {
  const promo = activePromotion(now);
  if (!promo) return null;
  return <PromoBand promo={promo} today={isRunningToday(promo, now)} />;
}

function PromoBand({ promo, today }: { promo: Promotion; today: boolean }) {
  return (
    <section
      aria-labelledby="promo-title"
      className="rounded-[22px] border border-gold/40 bg-[linear-gradient(150deg,#FBEFD6_0%,#F3E3C4_100%)] p-6 shadow-[var(--shadow-warm)] sm:p-8"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-[#7a5410] px-3 py-1 text-[13px] font-semibold uppercase tracking-wide text-[#FBEFD6]">
          {/* "Today only" the day it runs; the date before that. Same fact, but
              the day itself is the one time urgency is literally true. */}
          {today ? "Today only" : promo.badge}
        </span>
        <p className="text-[15px] text-brown">{promo.line}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2
          id="promo-title"
          className="text-[26px] leading-tight text-olive-dark sm:text-[30px]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {promo.title}
        </h2>
        <span
          className="text-[34px] font-bold leading-none text-[#7a5410] sm:text-[40px]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {promo.price}
        </span>
      </div>

      <ul className="mt-4 flex flex-wrap gap-2">
        {promo.includes.map((item) => (
          <li
            key={item}
            className="rounded-full border border-gold/50 bg-ivory/70 px-3 py-1.5 text-[14px] text-brown"
          >
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/#reserve"
          className="inline-flex min-h-12 items-center rounded-full bg-olive px-5 text-base font-medium text-ivory shadow-[var(--shadow-warm)] transition hover:-translate-y-0.5 hover:bg-olive-dark"
        >
          Reserve your spot
        </Link>
        <a
          href={whatsappLink("Hi! I'd like to come in on Malaysia Day for the RM33 offer.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center rounded-full border border-olive bg-ivory px-5 text-base font-medium text-olive-dark transition hover:-translate-y-0.5 hover:bg-beige/50"
        >
          Ask us on WhatsApp
        </a>
      </div>

      <p className="mt-4 text-[13px] leading-relaxed text-muted">
        {promo.whenLabel}, at {businessConfig.address.name}. Walk in or reserve ahead — places are
        limited, so the day does fill up. Pay at the shop.
      </p>
    </section>
  );
}
