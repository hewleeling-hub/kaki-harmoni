"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const REFERRAL_OPTIONS = ["Instagram", "Facebook", "TikTok", "Friend", "Walk-in", "Other"];

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
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3">
          {bannerError}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Full name
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 focus:outline-none focus:ring-2"
          style={{ ["--tw-ring-color" as string]: "var(--lagoon)" }}
          placeholder="Amirah Zulkifli"
        />
        {fieldError?.field === "name" && (
          <p className="text-sm text-red-700 mt-1">{fieldError.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 focus:outline-none focus:ring-2"
          style={{ ["--tw-ring-color" as string]: "var(--lagoon)" }}
          placeholder="you@email.com"
        />
        {fieldError?.field === "email" && (
          <p className="text-sm text-red-700 mt-1">{fieldError.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">
          Phone
        </label>
        <input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 focus:outline-none focus:ring-2"
          style={{ ["--tw-ring-color" as string]: "var(--lagoon)" }}
          placeholder="012-345 6789"
        />
        {fieldError?.field === "phone" && (
          <p className="text-sm text-red-700 mt-1">{fieldError.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="referral" className="block text-sm font-medium mb-1">
          How did you hear about us?
        </label>
        <select
          id="referral"
          value={referralSource}
          onChange={(e) => setReferralSource(e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 focus:outline-none focus:ring-2"
          style={{ ["--tw-ring-color" as string]: "var(--lagoon)" }}
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
        className="w-full rounded-lg px-4 py-2.5 font-medium text-white transition disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ background: "var(--lagoon)" }}
      >
        {submitting && (
          <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
        )}
        {submitting ? "Signing up…" : "Reserve my spot"}
      </button>
    </form>
  );
}
