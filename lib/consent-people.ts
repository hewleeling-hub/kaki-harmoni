import type { createAdminClient } from "@/lib/supabase/admin";

/**
 * Customers as PEOPLE, with whether each has agreed to receive offers.
 *
 * One entry per customer number, not per sign-up row: the same guest can own
 * several rows (signups dedupe on email, which is optional), and consent is a
 * fact about the person. Every row on one phone number shares a customer number
 * (see 0015), so that is the grouping key.
 *
 * A person counts as agreed if ANY of their rows says so — the same rule the
 * printed list uses, so the page and the paper can never disagree about who is
 * still to be asked.
 *
 * Works before the consent columns exist: it falls back to a plain read and
 * treats everyone as not agreed, which is true until 0025 is applied.
 */
export type ConsentPerson = {
  customer_no: number;
  name: string | null;
  phone: string | null;
  agreed: boolean;
  agreed_at: string | null;
  source: string | null;
};

type Row = {
  customer_no: number | null;
  name: string | null;
  phone: string | null;
  created_at: string;
  marketing_consent?: boolean | null;
  marketing_consent_at?: string | null;
  marketing_consent_source?: string | null;
};

export async function loadConsentPeople(
  admin: ReturnType<typeof createAdminClient>,
): Promise<ConsentPerson[]> {
  const full = await admin
    .from("signups")
    .select("customer_no, name, phone, created_at, marketing_consent, marketing_consent_at, marketing_consent_source")
    .not("customer_no", "is", null)
    .not("status", "like", "enquiry%");

  let rows: Row[];
  if (full.error) {
    const plain = await admin.from("signups").select("customer_no, name, phone, created_at").not("customer_no", "is", null)
    .not("status", "like", "enquiry%");
    rows = (plain.data ?? []) as Row[];
  } else {
    rows = (full.data ?? []) as Row[];
  }

  const people = new Map<number, { first: Row; person: ConsentPerson }>();
  for (const r of rows) {
    const no = r.customer_no as number;
    const agreed = r.marketing_consent === true;
    const existing = people.get(no);
    if (!existing) {
      people.set(no, {
        first: r,
        person: {
          customer_no: no,
          name: r.name,
          phone: r.phone,
          agreed,
          agreed_at: agreed ? (r.marketing_consent_at ?? null) : null,
          source: agreed ? (r.marketing_consent_source ?? null) : null,
        },
      });
      continue;
    }
    const p = existing.person;
    if (agreed && !p.agreed) {
      p.agreed = true;
      p.agreed_at = r.marketing_consent_at ?? null;
      p.source = r.marketing_consent_source ?? null;
    }
    // The oldest row's name and number: the ones the customer number was issued on.
    if (r.created_at < existing.first.created_at) {
      existing.first = r;
      p.name = r.name;
      p.phone = r.phone;
    }
  }

  return [...people.values()]
    .map((v) => v.person)
    .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", undefined, { sensitivity: "base" }));
}
