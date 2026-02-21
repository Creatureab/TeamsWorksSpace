import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Link2, MailPlus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

type Role = "Member" | "Admin" | "Viewer";

type PendingInvite = {
  id: string;
  email: string;
  invitedAt: string;
  role: Role;
  initials: string;
};

type InvitesPageProps = {
  workspaceId: string;
  onClose?: () => void;
  onSubmit?: () => void;
};

const initialPendingInvites: PendingInvite[] = [];

const initialEmails: string[] = [];

const getInitials = (email: string) => {
  const localPart = email.split("@")[0] || "";
  const cleaned = localPart.replace(/[^a-zA-Z]/g, "");
  return (cleaned.slice(0, 2) || "NA").toUpperCase();
};

const getRoleBadgeVariant = (role: Role) => {
  if (role === "Admin") return "destructive";
  if (role === "Viewer") return "secondary";
  return "outline";
};

const InvitesPage = ({ workspaceId, onClose, onSubmit }: InvitesPageProps) => {
  const [emails, setEmails] = useState<string[]>(initialEmails);
  const [emailInput, setEmailInput] = useState("");
  const [role, setRole] = useState<Role>("Member");
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>(
    initialPendingInvites
  );
  const [isSending, setIsSending] = useState(false);

  const parsedInputEmails = useMemo(() => {
    return emailInput
      .split(/[,\n;]+/)
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
  }, [emailInput]);


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

  const sendInvites = async () => {
    if (emails.length === 0) {
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails,
          role,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update local list from returned workspace pendingInvites
        const newInvitesFromBackend = data.pendingInvites.map((inv: any) => ({
          id: inv._id,
          email: inv.email,
          invitedAt: "Invited just now",
          role: inv.role as Role,
          initials: getInitials(inv.email),
        }));

        setPendingInvites(newInvitesFromBackend);
        toast.success(`Invites sent to ${emails.length} recipients`);
        setEmails([]);
        setEmailInput("");
      } else {
        const errorText = await response.text();
        toast.error(`Error: ${errorText}`);
      }
    } catch (error) {
      toast.error("Failed to send invites");
    } finally {
      setIsSending(false);
    }
  };

  const resendInvite = (email: string) => {
    toast.success(`Invite resent to ${email}`);
  };

  const deleteInvite = (id: string) => {
    setPendingInvites((prev) => prev.filter((invite) => invite.id !== id));
    toast.info("Invitation removed");
  };

  const copyInviteLink = async () => {
    const inviteLink = "https://nexus.app/invite/acme-projects";

    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f8fafc] dark:bg-[#020617] px-4 py-14">
      <Card className="mx-auto w-full max-w-3xl border-slate-200 dark:border-slate-800 shadow-xl dark:bg-[#0b1220]">
        <CardHeader className="flex flex-row items-start gap-4 px-6 pt-8 pb-4 sm:px-8">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
            <MailPlus className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">Invite team members</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">Invite people to collaborate in Acme Projects</p>
          </div>
        </CardHeader>

        <CardContent className="px-6 sm:px-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Email Addresses
            </label>
            <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070b14] px-3 py-2 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
              {emails.map((email) => (
                <Badge
                  variant="secondary"
                  className="gap-1.5 pl-2 pr-1 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none"
                  key={email}
                >
                  {email}
                  <button onClick={() => removeEmail(email)} className="rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}

              <input
                className="min-w-[180px] flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-slate-200"
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

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Role
              </label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger className="h-11 dark:border-slate-800 dark:bg-[#070b14]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#0b1220] dark:border-slate-800">
                  <SelectItem value="Member">Member (Full access)</SelectItem>
                  <SelectItem value="Admin">Admin (Full manage)</SelectItem>
                  <SelectItem value="Viewer">Viewer (Read only)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-lg shadow-blue-500/20"
              disabled={isSending || emails.length === 0}
              onClick={sendInvites}
            >
              {isSending ? "Sending..." : "Send Invites"}
            </Button>
          </div>

          <Separator className="my-8 bg-slate-200 dark:bg-slate-800" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pending Invitations ({pendingInvites.length})
              </h3>
            </div>

            <div className="space-y-1">
              {pendingInvites.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400 italic">No pending invitations</div>
              ) : (
                pendingInvites.map((invite) => (
                  <div
                    className="flex items-center justify-between gap-4 rounded-xl border border-transparent hover:border-slate-100 dark:hover:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 px-4 py-3 transition-all"
                    key={invite.id}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-800">
                        <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                          {invite.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{invite.email}</p>
                        <p className="text-xs text-slate-500">{invite.invitedAt}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant={getRoleBadgeVariant(invite.role)} className="h-6 text-[10px] font-bold uppercase px-2">
                        {invite.role}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-8 text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold" onClick={() => resendInvite(invite.email)}>
                        Resend
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => deleteInvite(invite.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between px-6 py-6 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30">
          <Button variant="ghost" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 gap-2" onClick={copyInviteLink}>
            <Link2 className="h-4 w-4" />
            <span>Copy link</span>
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} className="dark:border-slate-800">
              Close
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8" onClick={onSubmit}>
              Submit
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InvitesPage;
