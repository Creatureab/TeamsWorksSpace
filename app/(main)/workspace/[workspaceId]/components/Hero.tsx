"use client";

import {
  ArrowRight,
  ChevronRight,
  History,
  Home,
  Plus,
  Sparkles,
  Clock,
  FileText,
  Layout,
  Cloud,
  Target,
  Gavel
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type HeroProject = {
  _id: string;
  title: string;
  slug: string;
  updatedAt?: string;
};

interface HeroProps {
  user: {
    firstName?: string;
  } | null;
  currentWorkspace: {
    _id?: string;
    name?: string;
  } | null;
  projects?: HeroProject[];
  projectBasePath?: string;
  teamSpaceId?: string;
  searchQuery?: string | null;
}

const formatActivityTime = (updatedAt?: string) => {
  if (!updatedAt) return "Updated recently";

  const updatedDate = new Date(updatedAt);
  if (Number.isNaN(updatedDate.getTime())) return "Updated recently";

  const now = Date.now();
  const diffMs = now - updatedDate.getTime();
  const hourMs = 1000 * 60 * 60;
  const dayMs = hourMs * 24;

  if (diffMs < hourMs) return "Updated just now";
  if (diffMs < dayMs) return `Updated ${Math.floor(diffMs / hourMs)}h ago`;
  if (diffMs < dayMs * 7) return `Updated ${Math.floor(diffMs / dayMs)}d ago`;
  return `Updated ${updatedDate.toLocaleDateString()}`;
};

const recentlyVisited = [
  {
    title: "Engineering Docs",
    icon: FileText,
    iconColor: "text-red-500",
    bgColor: "bg-red-50/50 dark:bg-red-950/20",
    bannerColor: "bg-red-100/50 dark:bg-red-900/30",
    initial: "P",
    time: "12h ago"
  },
  {
    title: "@December 30, 2025 11:02 AM",
    icon: FileText,
    iconColor: "text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-900/50",
    bannerColor: "bg-gray-100/30 dark:bg-gray-800/30",
    initial: "A",
    time: "Feb 13"
  },
  {
    title: "Lawgistics Client Portal",
    icon: Gavel,
    iconColor: "text-gray-700 dark:text-gray-300",
    bgColor: "bg-stone-50 dark:bg-stone-900/50",
    bannerImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=200",
    initial: "A",
    time: "36m ago"
  },
  {
    title: "Getting Started",
    icon: Sparkles,
    iconColor: "text-yellow-500",
    emoji: "👋",
    bgColor: "bg-orange-50/30 dark:bg-orange-950/10",
    bannerColor: "bg-orange-100/20 dark:bg-orange-900/20",
    initial: "A",
    time: "Dec 19, 2025"
  },
  {
    title: "Resource Utilization",
    icon: Cloud,
    iconColor: "text-stone-400",
    bgColor: "bg-gray-50 dark:bg-gray-900/50",
    bannerColor: "bg-gray-100/30 dark:bg-gray-800/30",
    initial: "H",
    time: "1w ago",
    initialBg: "bg-pink-600"
  },
  {
    title: "Projects & Tasks",
    icon: Target,
    iconColor: "text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-900/50",
    bannerColor: "bg-gray-100/30 dark:bg-gray-800/30",
    initial: "H",
    time: "Dec 29, 2024",
    initialBg: "bg-pink-600"
  }
];

export default function Hero({ user, currentWorkspace, projects = [], searchQuery }: HeroProps) {
  const userName = user?.firstName || "there";
  const workspaceName = currentWorkspace?.name || "Workspace";
  const normalizedSearch = searchQuery?.trim();
  const hasSearchQuery = Boolean(normalizedSearch);
  const resultCount = projects.length;
  const resultLabel = resultCount === 1 ? "result" : "results";
  const searchMessage = hasSearchQuery
    ? `Showing ${resultCount} ${resultLabel} for "${normalizedSearch}"`
    : null;

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-white dark:bg-[#191919]">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white/80 dark:bg-[#191919]/80 px-4 py-3 backdrop-blur-md sm:px-8 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-gray-900 dark:text-gray-100">{workspaceName}</span>
          </div>
        </div>
        <Link href={`/createProject?name=${encodeURIComponent(workspaceName)}&workspaceId=${currentWorkspace?._id}`}>
          <Button size="sm" className="bg-[#2b6cee] hover:bg-[#2b6cee]/90 text-xs h-8">
            <Plus className="h-3.5 w-3.5 mr-1" />
            New Project
          </Button>
        </Link>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-12">
        <section className="mb-12">
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">Good morning, {userName}</h1>
        </section>

        {/* Recently Visited Section */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6 text-gray-500 dark:text-gray-400">
            <Clock size={16} />
            <h2 className="text-sm font-medium">Recently visited</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentlyVisited.map((item, idx) => (
              <Card key={idx} className="group overflow-hidden border-gray-200/60 dark:border-gray-800 bg-white dark:bg-[#202020] hover:shadow-md transition-all cursor-pointer rounded-xl">
                <div className={cn("h-16 w-full relative overflow-hidden", item.bannerColor)}>
                  {item.bannerImage && (
                    <img src={item.bannerImage} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                  )}
                  {item.emoji && (
                    <div className="absolute inset-0 flex items-center justify-center text-2xl pt-4">
                      {item.emoji}
                    </div>
                  )}
                </div>
                <CardContent className="p-4 pt-3 flex flex-col gap-3">
                  <div className="flex items-start gap-2">
                    {!item.emoji && (
                      <item.icon size={18} className={cn("mt-0.5 flex-shrink-0", item.iconColor)} />
                    )}
                    <h3 className="text-[13px] font-semibold leading-tight text-gray-800 dark:text-gray-200 line-clamp-2 min-h-[32px]">
                      {item.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 mt-auto">
                    <div className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white font-bold", item.initialBg || "bg-gray-200 dark:bg-gray-700")}>
                      {item.initial}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">{item.time}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                <History className="h-5 w-5 text-[#2b6cee]" />
                {hasSearchQuery ? "Search results" : "Recent Activity"}
              </h2>
              <Badge variant="outline" className="font-medium text-gray-500">Live Updates</Badge>
            </div>
            {hasSearchQuery && (
              <p className="mb-6 text-sm text-slate-500">{searchMessage}</p>
            )}
            {projects.length > 0 ? (
              <div className="space-y-2">
                {projects.slice(0, 5).map((project) => (
                  <Link
                    key={project._id}
                    href={`/workspace/${currentWorkspace?._id}?project=${encodeURIComponent(project.slug)}`}
                    className="block"
                  >
                    <Card className="group rounded-xl border-slate-200/90 bg-white p-0 shadow-none transition-all hover:border-[#2b6cee]/30 hover:bg-slate-50/70 dark:border-slate-800 dark:bg-[#202020] dark:hover:bg-white/5">
                      <CardContent className="flex items-center justify-between gap-3 p-3.5">
                        <div className="min-w-0 flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                            <Layout className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-slate-800 transition-colors group-hover:text-[#2b6cee] dark:text-slate-200">
                              {project.title}
                            </h3>
                            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                              {formatActivityTime(project.updatedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="hidden rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 sm:inline-flex dark:bg-slate-800 dark:text-slate-300"
                          >
                            Project
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-[#2b6cee]" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 py-16 flex flex-col items-center justify-center text-center dark:bg-[#202020]/50 rounded-2xl">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
                  <Sparkles className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">
                  {hasSearchQuery
                    ? `No projects matched "${normalizedSearch}". Try another keyword.`
                    : "No recent activity yet. Start by creating a project!"}
                </p>
              </Card>
            )}
          </section>

          <section>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Quick Links</h2>
            </div>
            <div className="space-y-3">
              {["User Guide", "Help Center", "Community"].map((link) => (
                <Card key={link} className="border-gray-100 dark:border-gray-800 bg-white dark:bg-[#202020] transition-all hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl">
                  <Link href="#" className="flex items-center justify-between p-4">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{link}</span>
                    <ArrowRight className="h-4 w-4 text-gray-300" />
                  </Link>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
