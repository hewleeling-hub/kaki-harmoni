"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isCatalogueSlug, withOption } from "@/config/catalogue";
import { offerForSlug } from "@/config/business";

const REFERRAL_OPTIONS = ["Instagram", "Facebook", "TikTok", "Friend", "Walk-in", "Other"];

const inputClass =
  "w-full min-h-12 rounded-[14px] border border-line bg-ivory px-3.5 text-[16px] text-ink placeholder:text-muted/70 focus:outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-olive";
const labelClass = "block text-[15px] font-medium text-olive-dark mb-1.5";

export default function SignupForm() {
  const router = useRouter();
  // Which option they clicked on /prices, if any. It is carried in the URL the
  // whole way to checkout rather than stored, so an abandoned signup leaves
  // nothing behind and a shared link still works.
  const optionParam = useSearchParams().get("option");
  const option = isCatalogueSlug(optionParam) ? optionParam : null;
  const chosen = option ? offerForSlug(option) : null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [referralSource, setReferralSource] = useState("Instagram");
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<{ field?: string; message: string } | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);
    setBannerError(null);
    setSubmitting(true);

    if (!phone.trim()) {
      setFieldError({ field: "phone", message: "Phone number is required." });
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, referral_source: referralSource }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.signup_id) {
          // Returning visitor with the same email — take them straight back to their spot.
          router.push(withOption(`/confirmation/${data.signup_id}`, option));
          return;
        }
        if (data.field) {
          setFieldError({ field: data.field, message: data.error });
        } else {
          setBannerError(data.error || "Something went wrong. Please try again.");
        }
        setSubmitting(false);
        return;
      }

      router.push(withOption(`/confirmation/${data.signup.id}`, option));
    } catch {
      setBannerError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Reassurance that the tier they clicked on /prices came with them. They
          can still change it at the payment step, so this promises nothing the
          checkout won't honour. */}
      {chosen && (
        <div className="rounded-[14px] border border-olive/30 bg-beige/50 px-4 py-3">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-olive">
            You&apos;re reserving
          </p>
          <p className="mt-0.5 text-[16px] font-semibold text-olive-dark">
            {chosen.name} — RM{chosen.price}
          </p>
          <p className="mt-0.5 text-[14px] text-muted">
            {chosen.visits === 1 ? "1 visit" : `${chosen.visits} visits`} · you can change this
            before paying.
          </p>
        </div>
      )}

      {bannerError && (
        <div className="rounded-[14px] border border-[#e4b8ab] bg-[#f6e3dc] px-4 py-3 text-sm text-[#8a3b28]" role="alert">
          {bannerError}
        </div>
      )}

      <div>
        <label htmlFor="name" className={labelClass}>
          Full name
        </label>
        <input
          id="name"
          value={name}
          autoComplete="name"
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="Amirah Zulkifli"
        />
        {fieldError?.field === "name" && (
          <p className="mt-1 text-sm font-medium text-[#a8442f]" role="alert">
            {fieldError.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="you@email.com"
        />
        {fieldError?.field === "email" && (
          <p className="mt-1 text-sm font-medium text-[#a8442f]" role="alert">
            {fieldError.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
          placeholder="012-345 6789"
        />
        {fieldError?.field === "phone" && (
          <p className="mt-1 text-sm font-medium text-[#a8442f]" role="alert">
            {fieldError.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="referral" className={labelClass}>
          How did you hear about us?
        </label>
        <select
          id="referral"
          value={referralSource}
          onChange={(e) => setReferralSource(e.target.value)}
          className={inputClass}
        >
          {REFERRAL_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[26px] bg-olive px-4 font-semibold text-ivory transition duration-200 hover:bg-olive-dark disabled:opacity-60"
      >
        {submitting && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-ivory/40 border-t-ivory" />
        )}
        {submitting ? "Reserving…" : "Reserve my spot"}
      </button>
    </form>
  );
}
