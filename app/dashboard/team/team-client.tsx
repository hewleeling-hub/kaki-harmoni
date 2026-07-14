"use client";

import { useEffect, useState } from "react";

type Role = "owner" | "manager" | "staff";

type Member = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
  created_at: string;
};

const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner",
  manager: "Manager",
  staff: "Staff",
};

export default function TeamClient({
  currentUserId,
  currentRole,
}: {
  currentUserId: string;
  currentRole: Role;
}) {
  const [team, setTeam] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"manager" | "staff">("staff");
  const [inviting, setInviting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/team");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load the team.");
      setTeam(data.team);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the team.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, full_name: inviteName, role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send the invite.");
      setNotice(`Invite sent to ${inviteEmail}.`);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("staff");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the invite.");
    } finally {
      setInviting(false);
    }
  }

  async function changeRole(member: Member, role: Role) {
    setError(null);
    setNotice(null);
    const res = await fetch(`/api/team/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not update the role.");
      return;
    }
    await load();
  }

  async function remove(member: Member) {
    if (!confirm(`Remove ${member.email ?? "this teammate"} from the team?`)) return;
    setError(null);
    setNotice(null);
    const res = await fetch(`/api/team/${member.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not remove the teammate.");
      return;
    }
    await load();
  }

  const canEditOwners = currentRole === "owner";

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "rgba(201,124,93,0.12)", color: "#8a4a30" }}>
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "rgba(46,125,123,0.12)", color: "var(--lagoon-dark)" }}>
          {notice}
        </div>
      )}

      {/* Invite */}
      <form onSubmit={invite} className="rounded-2xl border border-black/5 bg-white/70 p-6 space-y-4">
        <h2 className="font-display text-xl font-semibold" style={{ color: "var(--lagoon)" }}>
          Invite a teammate
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            type="email"
            required
            placeholder="name@email.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Full name (optional)"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            className="rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as "manager" | "staff")}
            className="rounded-lg border border-black/10 px-3 py-2 text-sm bg-white"
          >
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={inviting}
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "var(--lagoon)" }}
        >
          {inviting ? "Sending…" : "Send invite"}
        </button>
        <p className="text-xs text-black/45">
          They&apos;ll get an email invitation to set a password and join. Staff can view leads and
          mark payments; managers can also delete leads and manage the team.
        </p>
      </form>

      {/* Roster */}
      <div className="rounded-2xl border border-black/5 bg-white/70 overflow-hidden">
        {loading ? (
          <p className="px-6 py-8 text-black/50 text-sm">Loading team…</p>
        ) : team.length === 0 ? (
          <p className="px-6 py-8 text-black/50 text-sm">No teammates yet.</p>
        ) : (
          <ul className="divide-y divide-black/5">
            {team.map((m) => {
              const isSelf = m.id === currentUserId;
              const lockOwner = m.role === "owner" && !canEditOwners;
              return (
                <li key={m.id} className="flex flex-wrap items-center gap-3 px-6 py-4">
                  <div className="flex-1 min-w-[180px]">
                    <p className="font-medium" style={{ color: "var(--ink)" }}>
                      {m.full_name || m.email || "—"}
                      {isSelf && <span className="text-black/40 font-normal"> (you)</span>}
                    </p>
                    <p className="text-sm text-black/50">{m.email}</p>
                  </div>

                  <select
                    value={m.role}
                    disabled={isSelf || lockOwner}
                    onChange={(e) => changeRole(m, e.target.value as Role)}
                    className="rounded-lg border border-black/10 px-3 py-1.5 text-sm bg-white disabled:opacity-50"
                    aria-label={`Role for ${m.email ?? "teammate"}`}
                  >
                    {canEditOwners && <option value="owner">Owner</option>}
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                    {!canEditOwners && m.role === "owner" && <option value="owner">Owner</option>}
                  </select>

                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(46,125,123,0.1)", color: "var(--lagoon-dark)" }}
                  >
                    {ROLE_LABEL[m.role]}
                  </span>

                  <button
                    onClick={() => remove(m)}
                    disabled={isSelf || lockOwner}
                    className="text-sm font-medium px-3 py-1.5 rounded-lg border border-black/10 hover:bg-black/5 disabled:opacity-40"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
