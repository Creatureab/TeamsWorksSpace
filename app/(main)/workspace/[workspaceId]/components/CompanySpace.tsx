"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LiveUpdateItem } from "@/lib/live-updates";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Clock3,
  Globe2,
  Layout,
  Radio,
  RefreshCcw,
  Sparkles,
  Users,
} from "lucide-react";

type CompanySpaceProps = {
  workspaceId: string;
  workspaceName: string;
  initialUpdates: LiveUpdateItem[];
  teamSpaces: Array<{ id: string; name: string; accessType?: string; members?: Array<unknown>; archived?: boolean }>;
  projectCount: number;
};

const typeStyle: Record<
  LiveUpdateItem["type"],
  { label: string; dot: string; text: string; bg: string }
> = {
  "team-space": {
    label: "Team space",
    dot: "bg-indigo-500",
    text: "text-indigo-700",
    bg: "bg-indigo-50",
  },
  project: {
    label: "Project",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  workspace: {
    label: "Workspace",
    dot: "bg-sky-500",
    text: "text-sky-700",
    bg: "bg-sky-50",
  },
};

const formatAgo = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

export default function CompanySpace({
  workspaceId,
  workspaceName,
  initialUpdates,
  teamSpaces,
  projectCount,
}: CompanySpaceProps) {
  const [updates, setUpdates] = useState<LiveUpdateItem[]>(initialUpdates);
  const [filter, setFilter] = useState<"all" | LiveUpdateItem["type"]>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<number>(Date.now());

  const visibleTeamSpaces = useMemo(
    () => teamSpaces.filter((ts) => !ts.archived),
    [teamSpaces]
  );

  const teamSpaceStats = useMemo(() => {
    const total = visibleTeamSpaces.length;
    const open = visibleTeamSpaces.filter((ts) => ts.accessType === "open").length;
    const closed = visibleTeamSpaces.filter((ts) => ts.accessType === "closed").length;
    const priv = visibleTeamSpaces.filter((ts) => ts.accessType === "private").length;
    return { total, open, closed, priv };
  }, [visibleTeamSpaces]);

  const filteredUpdates = useMemo(
    () => updates.filter((item) => (filter === "all" ? true : item.type === filter)),
    [updates, filter]
  );

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/live-updates`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to refresh");
      const data = await res.json();
      setUpdates(Array.isArray(data.updates) ? data.updates : []);
      setLastSync(Date.now());
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, [workspaceId]);

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-gradient-to-b from-[#0f1729] via-[#0f1729] to-[#0b1020] text-slate-50">
      <section className="relative border-b border-white/5 px-6 py-8 sm:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.2),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.18),transparent_35%)]" />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-tight text-emerald-100">
              <Radio className="h-3.5 w-3.5 text-emerald-200" />
              Live company space
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Workspace</p>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                {workspaceName} live updates
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200/80">
                One stream for everything happening across projects and team spaces. Stay in sync without opening
                every page.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <Badge variant="outline" className="border-emerald-300/40 bg-emerald-500/15 text-emerald-100">
                Live
              </Badge>
              <span>Auto-refreshing every minute</span>
              <span className="text-slate-400">·</span>
              <span>Last sync {formatAgo(new Date(lastSync).toISOString())}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isRefreshing}
              className="border-white/20 bg-white/5 text-slate-100 hover:bg-white/10"
            >
              <RefreshCcw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
            <Link href={`/workspace/${workspaceId}`}>
              <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-100">
                Back to workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none bg-white/5 text-slate-100 shadow-[0_15px_60px_rgba(0,0,0,0.25)] backdrop-blur-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Team spaces</p>
                  <p className="mt-1 text-2xl font-semibold">{teamSpaceStats.total}</p>
                </div>
                <Users className="h-5 w-5 text-indigo-200" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-300">
                <Badge variant="outline" className="border-indigo-300/30 text-indigo-100">
                  {teamSpaceStats.open} open
                </Badge>
                <Badge variant="outline" className="border-amber-300/30 text-amber-100">
                  {teamSpaceStats.closed} closed
                </Badge>
                <Badge variant="outline" className="border-rose-300/30 text-rose-100">
                  {teamSpaceStats.priv} private
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white/5 text-slate-100 shadow-[0_15px_60px_rgba(0,0,0,0.25)] backdrop-blur-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Projects</p>
                  <p className="mt-1 text-2xl font-semibold">{projectCount}</p>
                </div>
                <Layout className="h-5 w-5 text-emerald-200" />
              </div>
              <p className="mt-3 text-xs text-slate-300">Latest updates appear in the stream below.</p>
            </CardContent>
          </Card>

          <Card className="border-none bg-white/5 text-slate-100 shadow-[0_15px_60px_rgba(0,0,0,0.25)] backdrop-blur-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Coverage</p>
                  <p className="mt-1 text-2xl font-semibold">{filteredUpdates.length}</p>
                </div>
                <Globe2 className="h-5 w-5 text-sky-200" />
              </div>
              <p className="mt-3 text-xs text-slate-300">Filtered view of the live activity feed.</p>
            </CardContent>
          </Card>

          <Card className="border-none bg-white/5 text-slate-100 shadow-[0_15px_60px_rgba(0,0,0,0.25)] backdrop-blur-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Signal</p>
                  <p className="mt-1 text-2xl font-semibold">Real-time</p>
                </div>
                <Sparkles className="h-5 w-5 text-amber-200" />
              </div>
              <p className="mt-3 text-xs text-slate-300">Auto-refresh keeps this page current without reloads.</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All" },
              { key: "project", label: "Projects" },
              { key: "team-space", label: "Team spaces" },
              { key: "workspace", label: "Workspace" },
            ].map((item) => (
              <Button
                key={item.key}
                variant={filter === item.key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(item.key as typeof filter)}
                className={cn(
                  "h-8 rounded-full",
                  filter === item.key
                    ? "bg-white text-slate-900 hover:bg-white"
                    : "border-white/20 bg-white/5 text-slate-100 hover:bg-white/10"
                )}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Clock3 className="h-4 w-4" />
            <span>Showing {filteredUpdates.length} updates</span>
          </div>
        </div>

        <Card className="mt-6 border-none bg-white/5 text-slate-100 shadow-[0_20px_70px_rgba(0,0,0,0.28)] backdrop-blur-lg">
          <CardContent className="p-0">
            {filteredUpdates.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-slate-300">
                Nothing to show yet. Create a project or update a team space to see live activity.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredUpdates.map((item) => {
                  const style = typeStyle[item.type];
                  return (
                    <div key={item.id} className="group flex items-start gap-4 px-6 py-4 hover:bg-white/5">
                      <div
                        className={cn(
                          "mt-1 h-8 w-8 rounded-lg ring-1 ring-inset ring-white/10 flex items-center justify-center",
                          style.bg
                        )}
                      >
                        {item.type === "project" && <Layout className="h-4 w-4 text-emerald-700" />}
                        {item.type === "team-space" && <Users className="h-4 w-4 text-indigo-700" />}
                        {item.type === "workspace" && <Globe2 className="h-4 w-4 text-sky-700" />}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn("border-none text-[11px] font-semibold", style.bg, style.text)}
                          >
                            <span className={cn("mr-1 h-2 w-2 rounded-full", style.dot)} />
                            {style.label}
                          </Badge>
                          {item.badge ? (
                            <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-100">
                              {item.badge}
                            </Badge>
                          ) : null}
                          <span className="text-[11px] text-slate-400">{formatAgo(item.timestamp)}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                        </div>
                        {item.description ? (
                          <p className="text-[13px] text-slate-300">{item.description}</p>
                        ) : null}
                      </div>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-200 opacity-0 transition-all group-hover:opacity-100"
                        >
                          Open <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
      <Separator className="border-white/5" />
    </main>
  );
}
