import { whatsappLink } from "@/config/business";
import {
  activeVoucherOffer,
  isLastDayToBuy,
  daysLeftToBuy,
  type VoucherOffer,
} from "@/config/promotions";

/**
 * The band announcing a voucher sale.
 *
 * Renders nothing when no voucher offer is on sale, so it can sit in the page
 * unconditionally and stop existing on its own once the window closes. Same
 * principle as PromoBanner: nobody has to remember to take it down.
 *
 * The date check runs server-side on every request, which works because the
 * homepage is dynamic. On a statically rendered page, set a `revalidate`.
 */
export function VoucherBanner({ now = new Date() }: { now?: Date }) {
  const offer = activeVoucherOffer(now);
  if (!offer) return null;
  return <VoucherBand offer={offer} lastDay={isLastDayToBuy(offer, now)} daysLeft={daysLeftToBuy(offer, now)} />;
}

function Term({ heading, value, sub }: { heading: string; value: string; sub?: string }) {
  return (
    <div className="flex-1 px-2 py-1 text-center sm:px-4">
      <p className="text-[14px] font-semibold uppercase tracking-wide text-brown/80">{heading}</p>
      <p className="mt-1 text-[17px] font-bold leading-snug text-[#7a5410] sm:text-[18px]">{value}</p>
      {sub && <p className="mt-0.5 text-[14px] text-muted">{sub}</p>}
    </div>
  );
}

function VoucherBand({
  offer,
  lastDay,
  daysLeft,
}: {
  offer: VoucherOffer;
  lastDay: boolean;
  daysLeft: number;
}) {
  /* Urgency only where it is literally true. On the final day the site can say
     so outright; before that it counts down honestly rather than shouting. */
  const urgency = lastDay
    ? "Last day to buy"
    : daysLeft <= 7
      ? `${daysLeft} days left to buy`
      : offer.badge;

  return (
    <section
      aria-labelledby="voucher-title"
      className="rounded-[22px] border border-gold/40 bg-[linear-gradient(150deg,#FBEFD6_0%,#F3E3C4_100%)] p-6 shadow-[var(--shadow-warm)] sm:p-8"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
        <span className="rounded-full bg-[#7a5410] px-4 py-1.5 text-[15px] font-bold uppercase tracking-wide text-[#FBEFD6] sm:text-[16px]">
          {urgency}
        </span>
        <p className="text-[18px] font-medium leading-snug text-brown sm:text-[20px]">
          Buy now, soak any time before the year is out.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2
          id="voucher-title"
          className="text-[26px] leading-tight text-olive-dark sm:text-[30px]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {offer.title}
        </h2>
        {offer.titleZh && (
          <span className="text-[20px] leading-tight text-olive-dark/80 sm:text-[22px]">
            {offer.titleZh}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          className="text-[40px] font-bold leading-none text-[#7a5410] sm:text-[48px]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {offer.price}
        </span>
        <span className="text-[18px] font-semibold text-brown sm:text-[20px]">{offer.unit}</span>
      </div>

      <p className="mt-3 text-[17px] leading-relaxed text-brown">{offer.buys}</p>

      {/* The three conditions from the poster, given the same weight they have
          there. These are the whole offer, not small print: a voucher bought
          after the 11th or used after the 31st is the one thing that turns a
          good promotion into an argument at the counter. */}
      <div className="mt-5 flex flex-col divide-y divide-gold/40 rounded-[18px] border border-gold/40 bg-ivory/70 sm:flex-row sm:divide-x sm:divide-y-0">
        <Term heading="Buy by" value={offer.sellUntilLabel} sub="只限在 11月11日 或之前购买" />
        <Term
          heading="Limit"
          value={`${offer.maxPerPerson} vouchers per person`}
          sub="每人最多购买 2 张"
        />
        <Term heading="Redeem by" value={offer.redeemByLabel} sub="兑换截止日期" />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href={whatsappLink(
            `Hi Kaki Harmoni! I'd like to buy the 11.11 Foot Spa Voucher at RM11 a session. How do I pay?`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center rounded-[26px] bg-[#7a5410] px-6 text-[17px] font-semibold text-[#FBEFD6] shadow-[var(--shadow-warm)] transition hover:brightness-110"
        >
          Buy on WhatsApp
        </a>
        <p className="text-[15px] leading-relaxed text-brown">
          Or buy one at the counter next time you&rsquo;re in.
        </p>
      </div>
    </section>
  );
}
