"use client";

import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  MessageCircle,
  FolderPlus,
  History,
  Home,
  Plus,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HeroProps {
  user: any;
  currentWorkspace: any;
}

const quickActions = [
  {
    title: "Create Project",
    body: "Start a new team workspace from scratch.",
    cta: "Get started",
    icon: FolderPlus,
    iconClass: "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
    ctaClass: "text-blue-600",
    cardClass: "bg-white dark:bg-slate-900",
  },
  {
    title: "Templates",
    body: "Kickstart with pre-built layouts.",
    cta: "View gallery",
    icon: Sparkles,
    iconClass: "bg-amber-50 text-amber-600 dark:bg-amber-900/20",
    ctaClass: "text-amber-600",
    cardClass: "bg-white dark:bg-slate-900",
  },
  {
    title: "Invite Team",
    body: "Collaboration is better together.",
    cta: "Send invites",
    icon: Plus,
    iconClass: "bg-white/20 text-white",
    ctaClass: "text-white",
    cardClass: "bg-[#2b6cee] text-white",
  },
];

import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Hero({ user, currentWorkspace }: HeroProps) {
  const userName = user?.firstName || "there";
  const workspaceName = currentWorkspace?.name || "Workspace";

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-[#f6f6f8] dark:bg-[#101622]">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-[#f6f6f8]/80 px-4 py-4 backdrop-blur-md sm:px-8 dark:bg-[#101622]/80">
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-slate-900 dark:text-slate-100">{workspaceName}</span>
          </div>
        </div>
        <Link href={`/createProject?name=${encodeURIComponent(workspaceName)}&workspaceId=${currentWorkspace?._id}`}>
          <Button className="bg-[#2b6cee] hover:bg-[#2b6cee]/90">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </Link>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
        <section className="mb-10">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Good morning, {userName}!</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Welcome back to {workspaceName}. Here is what is happening today.
          </p>
        </section>

        <section className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {quickActions.map((card) => (
            <Card
              key={card.title}
              className={`group flex flex-col overflow-hidden border-slate-200 transition-all hover:shadow-md dark:border-slate-800 ${card.cardClass}`}
            >
              <CardHeader className="pb-2">
                <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${card.iconClass}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl">{card.title}</CardTitle>
                <CardDescription className={card.cardClass.includes("bg-[#2b6cee]") ? "text-blue-100" : "text-slate-500"}>
                  {card.body}
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto pt-4">
                <Button
                  variant="ghost"
                  className={`group/btn h-auto p-0 font-bold transition-all hover:bg-transparent ${card.ctaClass} dark:hover:text-white`}
                >
                  {card.cta}
                  <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <History className="h-5 w-5 text-[#2b6cee]" />
                Recent Activity
              </h2>
              <Badge variant="outline" className="font-medium">Live Updates</Badge>
            </div>
            <Card className="border-dashed border-2 py-12 flex flex-col items-center justify-center text-center dark:bg-slate-900/50">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Sparkles className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">No recent activity yet. Start by creating a project!</p>
            </Card>
          </section>

          <section>
            <div className="mb-4">
              <h2 className="text-lg font-bold">Quick Links</h2>
            </div>
            <div className="space-y-3">
              {["User Guide", "Help Center", "Community"].map((link) => (
                <Card key={link} className="border-slate-200 bg-white transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/50">
                  <Link href="#" className="flex items-center justify-between p-4">
                    <span className="text-sm font-semibold">{link}</span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
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
