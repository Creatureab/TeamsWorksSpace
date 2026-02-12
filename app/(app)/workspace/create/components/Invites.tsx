"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Link2, MailPlus, Trash2 } from "lucide-react";

type Role = "Member" | "Admin" | "Viewer";

type PendingInvite = {
  id: string;
  email: string;
  invitedAt: string;
  role: Role;
  initials: string;
};

type InvitesPageProps = {
  onClose?: () => void;
  onSubmit?: () => void;
};

const initialPendingInvites: PendingInvite[] = [
  {
    id: "1",
    email: "james.k@outlook.com",
    invitedAt: "Invited 2 hours ago",
    role: "Member",
    initials: "JK",
  },
  {
    id: "2",
    email: "linda.blake@techcorp.io",
    invitedAt: "Invited yesterday",
    role: "Admin",
    initials: "LB",
  },
  {
    id: "3",
    email: "t.miller@freelance.net",
    invitedAt: "Invited 3 days ago",
    role: "Viewer",
    initials: "TM",
  },
];

const initialEmails = ["alex@design.com", "sarah.m@company.co"];

const getInitials = (email: string) => {
  const localPart = email.split("@")[0] || "";
  const cleaned = localPart.replace(/[^a-zA-Z]/g, "");
  return (cleaned.slice(0, 2) || "NA").toUpperCase();
};

const getRoleStyles = (role: Role) => {
  if (role === "Admin") {
    return "bg-[#1f3565] text-[#79a8ff]";
  }
  if (role === "Viewer") {
    return "bg-[#24304a] text-[#9aa9c4]";
  }
  return "bg-[#2b3855] text-[#b6c9ee]";
};

const InvitesPage = ({ onClose, onSubmit }: InvitesPageProps) => {
  const [emails, setEmails] = useState<string[]>(initialEmails);
  const [emailInput, setEmailInput] = useState("");
  const [role, setRole] = useState<Role>("Member");
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>(
    initialPendingInvites
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const parsedInputEmails = useMemo(() => {
    return emailInput
      .split(/[,\n;]+/)
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
  }, [emailInput]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = setTimeout(() => setToastMessage(null), 2800);
    return () => clearTimeout(timeout);
  }, [toastMessage]);

  const addEmails = (rawEmails: string[]) => {
    if (rawEmails.length === 0) {
      return;
    }

    const existing = new Set(emails.map((email) => email.toLowerCase()));
    const toAdd = rawEmails.filter((email) => !existing.has(email));

    if (toAdd.length === 0) {
      return;
    }

    setEmails((prev) => [...prev, ...toAdd]);
  };

  const removeEmail = (target: string) => {
    setEmails((prev) => prev.filter((email) => email !== target));
  };

  const sendInvites = () => {
    if (emails.length === 0) {
      return;
    }

    const newInvites = emails.map((email) => ({
      id: `${email}-${Date.now()}`,
      email,
      invitedAt: "Invited just now",
      role,
      initials: getInitials(email),
    }));

    setPendingInvites((prev) => [...newInvites, ...prev]);
    setToastMessage(
      `Invites sent successfully to ${emails.length} recipient${
        emails.length > 1 ? "s" : ""
      }`
    );
    setEmails([]);
    setEmailInput("");
  };

  const resendInvite = (email: string) => {
    setToastMessage(`Invite resent to ${email}`);
  };

  const deleteInvite = (id: string) => {
    setPendingInvites((prev) => prev.filter((invite) => invite.id !== id));
  };

  const copyInviteLink = async () => {
    const inviteLink = "https://nexus.app/invite/acme-projects";

    try {
      await navigator.clipboard.writeText(inviteLink);
      setToastMessage("Invite link copied");
    } catch {
      setToastMessage("Could not copy link");
    }
  };

  return (
    <div className="relative min-h-screen px-4 py-14 text-slate-100">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-[#1c2a3e] shadow-[0_28px_90px_rgba(0,0,0,0.6)]">
        <div className="px-6 pb-6 pt-5 sm:px-8">
          <div className="mb-7 flex items-start gap-3">
            <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-[#162742] text-[#4f7bff]">
              <MailPlus className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-black">
                Invite team members
              </h2>
              <p className="text-sm text-black">
                Invite people to collaborate in Acme Projects
              </p>
            </div>
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.11em] text-black">
              Email Addresses
            </label>
            <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-lg border border-[#223754] bg-[#0d1730] px-3 py-2">
              {emails.map((email) => (
                <button
                  className="inline-flex items-center gap-1 rounded-md border border-[#28426b] bg-[#13284a] px-2 py-1 text-xs text-[#83a8ff]"
                  key={email}
                  onClick={() => removeEmail(email)}
                  type="button"
                >
                  {email}
                  <span aria-hidden className="text-[#6e8ecc]">
                    x
                  </span>
                </button>
              ))}

              <input
                className="min-w-[180px] flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                onBlur={() => {
                  addEmails(parsedInputEmails);
                  setEmailInput("");
                }}
                onChange={(event) => setEmailInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === ",") {
                    event.preventDefault();
                    addEmails(parsedInputEmails);
                    setEmailInput("");
                  }
                }}
                placeholder="Add emails..."
                value={emailInput}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.11em] text-black">
                Role
              </label>
              <select
                className="h-11 w-full rounded-lg border border-[#223754] bg-[#0d1730] px-3 text-sm text-slate-100 outline-none focus:border-[#3a66ff]"
                onChange={(event) => setRole(event.target.value as Role)}
                value={role}
              >
                <option value="Member">Member (Full editing access)</option>
                <option value="Admin">Admin (Manage team and settings)</option>
                <option value="Viewer">Viewer (Read-only access)</option>
              </select>
            </div>

            <button
              className="h-11 rounded-lg bg-[#3273ff] px-6 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(86,130,255,0.2),0_8px_22px_rgba(50,115,255,0.35)] transition hover:bg-[#2d67e0]"
              onClick={sendInvites}
              type="button"
            >
              Send Invites
            </button>
          </div>
        </div>

        <div className="border-y border-[#1d2f49]">
          <div className="border-b border-[#1d2f49] px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-black sm:px-8">
            Pending Invitations ({pendingInvites.length})
          </div>

          {pendingInvites.map((invite) => (
            <div
              className="flex items-center justify-between gap-4 border-b border-[#182841] px-6 py-3 last:border-b-0 sm:px-8"
              key={invite.id}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#21304a] text-[10px] font-semibold text-black">
                  {invite.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-200">{invite.email}</p>
                  <p className="text-xs text-slate-500">{invite.invitedAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${getRoleStyles(
                    invite.role
                  )}`}
                >
                  {invite.role}
                </span>
                <button
                  className="text-xs font-semibold text-[#6fa0ff] hover:text-[#8eb4ff]"
                  onClick={() => resendInvite(invite.email)}
                  type="button"
                >
                  Resend
                </button>
                <button
                  className="text-slate-500 hover:text-slate-300"
                  onClick={() => deleteInvite(invite.id)}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-6 py-4 sm:px-8">
          <button
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200"
            onClick={copyInviteLink}
            type="button"
          >
            <Link2 className="h-4 w-4" />
            Copy invite link
          </button>
          <div className="flex items-center gap-3">
            <button
              className="text-sm text-slate-400 hover:text-slate-200"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
            <button
              className="rounded-lg bg-[#3273ff] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#2d67e0]"
              onClick={onSubmit}
              type="button"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {toastMessage ? (
        <div className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      ) : null}
    </div>
  );
};

export default InvitesPage;
