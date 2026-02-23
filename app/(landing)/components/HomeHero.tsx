"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles, Layout } from "lucide-react";
import Link from "next/link";

const mockRows = [
  { task: "Mobile Beta Fixes", status: "Done", assignee: "Sarah K.", due: "Aug 12" },
  {
    task: "API Documentation",
    status: "In Progress",
    assignee: "Mike J.",
    due: "Aug 28",
  },
  { task: "Payment Integration", status: "To Do", assignee: "Alex R.", due: "Sep 15" },
];

const trustedBy = ["STRUCT", "NIMBUS", "CORE.AI", "LUMINA", "ASSETLY"];

function StatusPill({ status }: { status: string }) {
  if (status === "Done") {
    return (
      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
        Done
      </span>
    );
  }

  if (status === "In Progress") {
    return (
      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">
        In Progress
      </span>
    );
  }

  return (
    <span className="rounded-full bg-slate-700/50 px-2 py-0.5 text-[10px] font-bold text-slate-400">
      To Do
    </span>
  );
}

const HomeHero = () => {
  return (
    <div className="relative overflow-hidden pb-20 pt-32 bg-white dark:bg-[#0b0f17] transition-colors duration-500">
      <div className="grid-pattern pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.07]" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-[#3b19e6]/5 dark:bg-[#3b19e6]/10 blur-[120px]" />

      <section className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#3b19e6]/20 bg-[#3b19e6]/10 px-3 py-1 text-xs font-semibold text-[#3b19e6]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#3b19e6]" />
          v2.0 is now live
        </div>

        <h1 className="mx-auto mb-6 max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-gray-900 md:text-7xl dark:text-white">
          One workspace. <span className="text-[#3b19e6]">Every team. Total control.</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-600 md:text-xl dark:text-gray-400">
          Write, plan, and collaborate in a single tool. Combine document editing
          with powerful task management to keep your team in sync.
        </p>

        <div className="mb-16 flex items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="bg-[#3b19e6] hover:bg-[#3015c4] text-white px-8 h-12 text-base font-semibold shadow-xl shadow-[#3b19e6]/20">
              Get started free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="px-8 h-12 text-base font-semibold border-gray-200 dark:border-white/10 dark:hover:bg-white/5">
              Sign in
            </Button>
          </Link>
        </div>

        <div className="relative mx-auto max-w-6xl text-left">
          <div className="mockup-shadow group overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#151a24] shadow-2xl transition-all duration-500">
            <div className="flex h-11 items-center gap-2 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 px-4 dark:bg-slate-900/50">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400/50" />
                <span className="h-3 w-3 rounded-full bg-amber-400/50" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/50" />
              </div>
              <div className="mx-auto rounded-md border border-gray-200 dark:border-white/5 bg-white dark:bg-white/5 px-3 py-1 text-[10px] font-medium text-gray-500">
                workspace.so/production/roadmap
              </div>
            </div>

            <div className="flex h-[540px]">
              <aside className="hidden w-64 flex-col border-r border-gray-100 dark:border-white/10 bg-gray-50/30 dark:bg-slate-900/30 p-4 lg:flex">
                <div className="mb-8 flex items-center gap-2 px-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-[#3b19e6] text-[10px] font-bold text-white">
                    AC
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Acme Corp</span>
                </div>
                <div className="space-y-1">
                  <div className="rounded-md bg-[#3b19e6]/10 px-2 py-1.5 text-sm font-medium text-[#3b19e6]">
                    Q3 Roadmap
                  </div>
                  <div className="rounded-md px-2 py-1.5 text-sm text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
                    Product Specs
                  </div>
                  <div className="rounded-md px-2 py-1.5 text-sm text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
                    Team Meeting Notes
                  </div>
                </div>
              </aside>

              <div className="flex flex-1 flex-col">
                <div className="flex h-14 items-center justify-between border-b border-gray-100 dark:border-white/10 px-6 md:px-8">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Q3 Roadmap</span>
                    <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                      In Progress
                    </span>
                  </div>
                  <Button
                    className="h-auto rounded-lg bg-[#3b19e6] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3015c4]"
                    size="sm"
                  >
                    Share
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-white dark:bg-[#0b0f17]/50">
                  <div className="mb-2 text-sm font-medium text-[#3b19e6]">
                    Target: Sep 30, 2023
                  </div>
                  <h2 className="mb-6 text-3xl font-bold md:text-4xl text-gray-900 dark:text-white">
                    Product Launch Roadmap
                  </h2>
                  <p className="mb-8 leading-relaxed text-gray-500 dark:text-slate-400">
                    This document outlines key milestones for the Q3 release with a
                    focus on collaborative engine stability and mobile rollout.
                  </p>

                  <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm">
                    <div className="grid grid-cols-4 gap-4 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      <span>Task Name</span>
                      <span>Status</span>
                      <span>Assignee</span>
                      <span>Due Date</span>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-white/10">
                      {mockRows.map((row) => (
                        <div key={row.task} className="grid grid-cols-4 gap-4 p-4 text-sm">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">{row.task}</span>
                          <span>
                            <StatusPill status={row.status} />
                          </span>
                          <span className="text-gray-500 dark:text-slate-400">{row.assignee}</span>
                          <span className="text-xs text-gray-400 dark:text-slate-500">{row.due}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 flex gap-4">
                    <Card className="w-1/2 border-[#3b19e6]/20 bg-[#3b19e6]/5 dark:bg-[#3b19e6]/10 py-4 shadow-none">
                      <CardHeader className="px-4 pb-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#3b19e6]">Velocity Trend</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4">
                        <div className="flex h-16 items-end gap-1.5 mt-2">
                          <span className="h-[40%] w-full rounded-t bg-[#3b19e6]/40" />
                          <span className="h-[65%] w-full rounded-t bg-[#3b19e6]/40" />
                          <span className="h-[55%] w-full rounded-t bg-[#3b19e6]/40" />
                          <span className="h-[90%] w-full rounded-t bg-[#3b19e6]/40" />
                          <span className="h-[75%] w-full rounded-t bg-[#3b19e6]" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="w-1/2 border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-slate-800/30 py-4 shadow-none">
                      <CardContent className="flex h-full flex-col justify-center px-4">
                        <div className="mb-1 text-[10px] font-bold uppercase text-gray-400">
                          Total Completion
                        </div>
                        <div className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">74%</div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                          <div className="h-full w-[74%] bg-[#3b19e6]" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel absolute -right-8 top-1/2 hidden w-48 -translate-y-1/2 rotate-3 rounded-2xl border border-gray-200 dark:border-white/20 bg-white/90 dark:bg-[#151a24]/90 p-4 shadow-2xl backdrop-blur-xl xl:block">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white shadow-lg shadow-amber-500/20">
                !
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-900 dark:text-white">New Comment</p>
                <p className="text-[9px] text-gray-500 dark:text-slate-400">Sarah mentioned you</p>
              </div>
            </div>
            <div className="h-1 w-full rounded-full bg-gray-100 dark:bg-white/10" />
          </div>

          <div className="glass-panel absolute -bottom-8 -left-8 hidden w-64 -rotate-2 rounded-2xl border border-gray-200 dark:border-white/20 bg-white/90 dark:bg-[#151a24]/90 p-5 shadow-2xl backdrop-blur-xl xl:block">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400">Collaborators</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                Online
              </span>
            </div>
            <div className="space-y-3 text-[11px]">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                David Miller
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Elena Rodriguez
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-slate-600" />
                James Wilson
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 border-t border-gray-100 dark:border-slate-200/20 pt-12">
          <p className="mb-10 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500">
            Trusted by the world&apos;s most innovative teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 text-gray-400 dark:text-slate-500 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
            {trustedBy.map((brand) => (
              <div key={brand} className="text-lg font-bold tracking-tighter">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section >
    </div >
  );
}
export default HomeHero; 