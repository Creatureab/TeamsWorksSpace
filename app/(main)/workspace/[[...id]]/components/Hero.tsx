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

const quickActions = [
  {
    title: "Create a Project",
    body: "Start a new team workspace from scratch with custom permissions.",
    cta: "Get started",
    icon: FolderPlus,
    iconClass: "bg-[#2b6cee]/10 text-[#2b6cee]",
    ctaClass: "text-[#2b6cee]",
    cardClass:
      "bg-white hover:border-[#2b6cee]/50 hover:shadow-xl hover:shadow-[#2b6cee]/5 dark:bg-slate-900",
  },
  {
    title: "Browse Templates",
    body: "Kickstart your productivity with pre-built professional layouts.",
    cta: "View gallery",
    icon: Sparkles,
    iconClass: "bg-amber-500/10 text-amber-500",
    ctaClass: "text-amber-500",
    cardClass:
      "bg-white hover:border-[#2b6cee]/50 hover:shadow-xl hover:shadow-[#2b6cee]/5 dark:bg-slate-900",
  },
  {
    title: "Invite Team",
    body: "Collaboration is better together. Bring your team on board.",
    cta: "Send invites",
    icon: Plus,
    iconClass: "bg-white/20 text-white",
    ctaClass: "text-white",
    cardClass: "border-[#2b6cee] bg-[#2b6cee] text-white",
  },
];

const recentActivity = [
  {
    title: "Updated 'Q4 Roadmap'",
    body: "You modified the content in Project Timeline",
    time: "2 mins ago",
    icon: FolderPlus,
    iconClass: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "Task Completed",
    body: "Sarah marked 'Finalize UI Mockups' as done",
    time: "1 hour ago",
    icon: CheckCircle2,
    iconClass: "bg-emerald-500/10 text-emerald-500",
  },
  {
    title: "New Comment",
    body: "Michael commented on 'Brand Refresh'",
    time: "3 hours ago",
    icon: MessageCircle,
    iconClass: "bg-violet-500/10 text-violet-500",
  },
];

const templates = [
  {
    title: "Sprint Planner",
    subtitle: "Agile Methodology",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCfIYSp2vhRD3HcIg5xagwqVUOXQWd4MfrKdO0R9fV9mgDmRJpg5KC1ZuS3cO1f16-kNqSO9cCirqo6a3hXcF597EFO_y-e8XX_YMWzxYZHxEbaUDLJixDUsKBcd-Sq4sUyczldmYdm_ihE7s40gVRPq7dWWWFG1ZqXiVorDEUBf80GZ4wwTfaEyoGIWb6LcC-bvRo7e2f97pnRMU4U3GWe-PUUL62KXImNhDt3-GYMI-sN0PygMSfSMHwvHTIT5BjeO5eXRlgsdO0",
  },
  {
    title: "Content Calendar",
    subtitle: "Marketing Team",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAGz-nji8wBZM7kXpVHfWbZPDuYNXDRSHZJH7rKNdQinhIgPFT5X3EJlKyuG5zyka60kSP884pz8fS7X5T88oxBValSeEidzeUSaLIsvI9FeiqcOObtqZLh7DVSO7YqNSC1eo4yrU8mJ8LQ1m34luE4fo6cWFROVN1kqkMWZTCM4RyhrmA4Z2gJHXJdrLf-E4sCNeZKZQN5iKltf34-f_9LTN1bCVpoqL2V6q1vjJlX3BFHa0at9A9oZTplinDKBAH0nDSQ1cHrdOk",
  },
];

export default function Hero() {
  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-[#f6f6f8] dark:bg-[#101622]">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-[#f6f6f8]/80 px-4 py-4 backdrop-blur-md sm:px-8 dark:bg-[#101622]/80">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-slate-900 dark:text-slate-100">Workspace Overview</span>
        </div>
        <Link
          className="flex items-center gap-2 rounded-lg bg-[#2b6cee] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[#2b6cee]/20 transition-all hover:bg-[#2b6cee]/90"
          href="/createProject"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
        <section className="mb-12">
          <h1 className="mb-2 text-3xl font-bold sm:text-4xl">Good morning, Alex!</h1>
          <p className="text-base text-slate-500 dark:text-slate-400 sm:text-lg">
            Welcome to Acme Corp Workspace. Here&apos;s what&apos;s happening today.
          </p>
        </section>

        <section className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((card) => (
            <div
              key={card.title}
              className={`group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 p-6 transition-all dark:border-slate-800 ${card.cardClass}`}
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${card.iconClass}`}
              >
                <card.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{card.title}</h3>
              <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{card.body}</p>
              <span
                className={`flex items-center gap-1 text-sm font-medium transition-all group-hover:gap-2 ${card.ctaClass}`}
              >
                {card.cta}
                <ArrowRight className="h-3 w-3" />
              </span>
              {card.title === "Invite Team" && (
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
              )}
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <History className="h-5 w-5 text-[#2b6cee]" />
                Recent Activity
              </h2>
              <button className="text-sm font-medium text-[#2b6cee] hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/50"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded ${item.iconClass}`}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.body}</p>
                  </div>
                  <span className="text-[11px] text-slate-400">{item.time}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Featured Templates</h2>
            </div>
            <div className="space-y-4">
              {templates.map((template) => (
                <div
                  key={template.title}
                  className="group relative aspect-video cursor-pointer overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
                >
                  <img
                    alt={`${template.title} template preview`}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    src={template.image}
                  />
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-sm font-semibold text-white">{template.title}</p>
                    <p className="text-xs text-white/60">{template.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
