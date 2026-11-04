import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { activeVoucherOffer } from "@/config/promotions";
import EnquiriesClient from "./enquiries-client";

export const metadata = {
  title: "Enquiries — Kaki Harmoni",
  robots: { index: false, follow: false },
};

// Every role: whoever answers the chats is the one who logs and chases them.
export default async function EnquiriesPage() {
  const user = await requireStaff();
  if (!user) redirect("/login");

  // Resolved on the server so the draft quotes the offer that is on sale right
  // now, with its real dates, rather than a copy that goes stale.
  const offer = activeVoucherOffer();
  const voucher = offer
    ? { price: offer.price, sellUntilLabel: offer.sellUntilLabel, redeemByLabel: offer.redeemByLabel }
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
          Enquiries
        </h1>
        <p className="text-black/60 mt-1">
          People who messaged on WhatsApp or Messenger. Log them here, then chase anyone who has gone quiet.
        </p>
      </div>
      <EnquiriesClient voucher={voucher} />
    </div>
  );
}
