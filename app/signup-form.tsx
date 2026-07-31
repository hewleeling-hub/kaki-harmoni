"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const REFERRAL_OPTIONS = ["Instagram", "Facebook", "TikTok", "Friend", "Walk-in", "Other"];

const inputClass =
  "w-full min-h-12 rounded-[14px] border border-line bg-ivory px-3.5 text-[16px] text-ink placeholder:text-muted/70 focus:outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-olive";
const labelClass = "block text-[15px] font-medium text-olive-dark mb-1.5";

export default function SignupForm() {
  const router = useRouter();
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
          router.push(`/confirmation/${data.signup_id}`);
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

      router.push(`/confirmation/${data.signup.id}`);
    } catch {
      setBannerError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
