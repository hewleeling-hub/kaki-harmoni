"use client";

import { useState } from "react";
import { referralOptions } from "@/config/business";

/**
 * "How did you hear about us?", asked AFTER the details are saved.
 *
 * It used to be a select in the signup form, sitting between the customer and
 * the button — a question that serves the shop, charged to the customer at the
 * exact moment they were deciding whether to bother. Here nothing is at stake:
 * they are already signed up, so answering is a favour rather than a toll, and
 * one tap does it instead of opening a dropdown.
 *
 * Skippable by simply not tapping. There is no "skip" control, because a
 * question with no consequence doesn't need an escape hatch — adding one would
 * make it look more obligatory than it is.
 */
export function ReferralPrompt({ signupId }: { signupId: string }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function pick(option: string) {
    if (chosen) return;
    setChosen(option);
    try {
      await fetch(`/api/signups/${signupId}/referral`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referral_source: option }),
      });
    } catch {
      // Deliberately silent. This is analytics for us, not a step for them —
      // a red error under a question they were doing us a favour by answering
      // would be worse than quietly losing one data point.
    }
    setDone(true);
  }

  if (done) {
    return (
      <p className="mt-2 text-xs text-muted" role="status">
        Thanks — good to know.
      </p>
    );
  }

  return (
    <div className="mt-2">
      <p className="text-xs font-medium text-muted">
        One last thing, if you don&apos;t mind — how did you hear about us?
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-1.5">
        {referralOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => pick(option)}
            disabled={chosen !== null}
            className="min-h-9 rounded-full border border-line px-3 text-xs font-medium text-brown transition hover:border-olive hover:text-olive-dark disabled:opacity-50"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
