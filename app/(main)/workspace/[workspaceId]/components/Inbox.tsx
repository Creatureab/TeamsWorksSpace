"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Inbox, Mail, Clock3, Check, X, RefreshCcw } from "lucide-react";
import { useEffect } from "react";
import { useInboxWebSocket } from "@/hooks/useInboxWebSocket";

export type InboxInvite = {
  workspaceId: string;
  workspaceName: string;
  role: string;
  invitedAt?: string;
};

interface InboxProps {
  initialInvites: InboxInvite[];
  workspaceId?: string;
  userEmail?: string;
}

const formatAgo = (value?: string) => {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export function InboxView({ initialInvites, workspaceId, userEmail }: InboxProps) {
  const [invites, setInvites] = useState<InboxInvite[]>(initialInvites);
  const [isLoading, setIsLoading] = useState(false);

  const syncBadge = (count: number) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("inbox:updated", { detail: { count } }));
  };

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : "";
      const res = await fetch(`/api/inbox${params}`);
      if (!res.ok) throw new Error("Failed to load inbox");
      const data = await res.json();
      const next = data.invites || [];
      setInvites(next);
      syncBadge(next.length);
      toast.success("Inbox updated");
    } catch (err) {
      console.error(err);
      toast.error("Could not refresh inbox");
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  const handleWsMessage = useCallback(
    (msg: { type: string; workspaceId?: string }) => {
      if (msg.type === "inbox" && (!workspaceId || msg.workspaceId === workspaceId)) {
        // refresh on incoming signal to stay consistent with server state
        refresh();
      }
    },
    [workspaceId, refresh]
  );

  useInboxWebSocket({
    email: userEmail,
    workspaceId,
    onMessage: handleWsMessage,
  });

  const filteredInvites = useMemo(() => {
    if (!workspaceId) return invites;
    return invites.filter((inv) => inv.workspaceId === workspaceId);
  }, [invites, workspaceId]);

  const acceptInvite = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/inbox/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: id }),
      });
      if (!res.ok) throw new Error("Failed to accept invite");
      setInvites((prev) => {
        const next = prev.filter((inv) => inv.workspaceId !== id);
        syncBadge(next.length);
        return next;
      });
      toast.success("Joined workspace");
    } catch (err) {
      console.error(err);
      toast.error("Could not accept invite");
    } finally {
      setIsLoading(false);
    }
  };

  const declineInvite = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/inbox/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: id }),
      });
      if (!res.ok) throw new Error("Failed to decline invite");
      setInvites((prev) => {
        const next = prev.filter((inv) => inv.workspaceId !== id);
        syncBadge(next.length);
        return next;
      });
      toast("Invite dismissed");
    } catch (err) {
      console.error(err);
      toast.error("Could not decline invite");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-white dark:bg-[#0b0f17]">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-8 dark:border-slate-800 dark:bg-[#0b0f17]/80">
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <Inbox className="h-5 w-5" />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Inbox</p>
            <p className="text-[12px] text-slate-500 dark:text-slate-400">Workspace invites sent to your email</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8" onClick={refresh} disabled={isLoading}>
            <RefreshCcw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
        {filteredInvites.length === 0 ? (
          <Card className="border-dashed border-2 py-12 text-center dark:border-slate-800 dark:bg-[#151b2a]">
            <CardContent className="flex flex-col items-center gap-3">
              <Mail className="h-10 w-10 text-slate-300" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No invites in your inbox right now.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Ask a teammate to invite your email.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredInvites.map((invite) => (
              <Card key={invite.workspaceId} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131a27]">
                <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {invite.workspaceName}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                          {invite.role}
                        </Badge>
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <Clock3 className="h-3 w-3" />
                          {formatAgo(invite.invitedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="h-8 bg-[#2b6cee] hover:bg-[#2b6cee]/90"
                      onClick={() => acceptInvite(invite.workspaceId)}
                      disabled={isLoading}
                    >
                      <Check className="h-4 w-4 mr-1" /> Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => declineInvite(invite.workspaceId)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4 mr-1" /> Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
