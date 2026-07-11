// TODO: sign up at resend.com, verify your sending domain (or use their test domain
// while developing), then set these two env vars in Vercel:
//   RESEND_API_KEY        - from resend.com/api-keys
//   SALES_TEAM_EMAIL       - where alerts should land, e.g. "hello@kakiharmoni.com"
//                            (comma-separate multiple addresses)
// Until both are set, alerts are silently skipped — nothing breaks.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SALES_TEAM_EMAIL = process.env.SALES_TEAM_EMAIL;
const FROM_ADDRESS = "Kaki Harmoni <alerts@kakiharmoni.com>";

export async function sendSalesAlert(subject: string, html: string) {
  if (!RESEND_API_KEY || !SALES_TEAM_EMAIL) {
    console.log("[email] Skipped — RESEND_API_KEY or SALES_TEAM_EMAIL not set:", subject);
    return;
  }

  const recipients = SALES_TEAM_EMAIL.split(",").map((e) => e.trim()).filter(Boolean);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: recipients,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.error("[email] Resend API error:", res.status, await res.text());
    }
  } catch (err) {
    // Never let an email failure break the signup/purchase flow.
    console.error("[email] Failed to send:", err);
  }
}

export function newSignupEmail(params: {
  name: string;
  email: string;
  phone: string | null;
  referral_source: string | null;
}) {
  return {
    subject: `New signup: ${params.name}`,
    html: `
      <h2>New Kaki Harmoni signup</h2>
      <p><strong>Name:</strong> ${params.name}</p>
      <p><strong>Email:</strong> ${params.email}</p>
      <p><strong>Phone:</strong> ${params.phone ?? "—"}</p>
      <p><strong>How they heard about us:</strong> ${params.referral_source ?? "—"}</p>
      <p><a href="https://kaki-harmoni.vercel.app/dashboard">View in dashboard →</a></p>
    `,
  };
}

export function purchaseConfirmedEmail(params: {
  name: string;
  email: string;
  amount: number;
  paymentMethod: string;
}) {
  return {
    subject: `Purchase confirmed: ${params.name} (RM${params.amount.toFixed(2)})`,
    html: `
      <h2>New Kaki Harmoni purchase</h2>
      <p><strong>Name:</strong> ${params.name}</p>
      <p><strong>Email:</strong> ${params.email}</p>
      <p><strong>Amount:</strong> RM${params.amount.toFixed(2)}</p>
      <p><strong>Payment method:</strong> ${params.paymentMethod} (pending your confirmation)</p>
      <p><a href="https://kaki-harmoni.vercel.app/dashboard">View in dashboard →</a></p>
    `,
  };
}
