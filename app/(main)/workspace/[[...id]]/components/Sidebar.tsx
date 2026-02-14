import {
  ChevronDown,
  CircleHelp,
  FileText,
  Folder,
  LayoutDashboard,
  Lock,
  Moon,
  Plus,
  Search,
  Settings,
  Users,
} from "lucide-react";

const projects = [
  { label: "Q4 Roadmap", icon: LayoutDashboard, active: true, color: "text-slate-500" },
  { label: "Brand Refresh", icon: Folder, active: false, color: "text-amber-500" },
  { label: "Client Onboarding", icon: Folder, active: false, color: "text-emerald-500" },
];

const sharedItems = [
  { label: "Marketing Assets", icon: Users },
  { label: "Budget 2024.xlsx", icon: FileText },
];

const sidebarLinkClass =
  "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800";

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white/95 md:flex md:flex-col dark:border-slate-800 dark:bg-[#101622]/50">
      <div className="p-4">
        <button className="group flex w-full items-center justify-between rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#2b6cee] text-sm font-bold text-white">
              A
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold leading-none">Acme Corp</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pro Plan</p>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400 transition-colors group-hover:text-slate-600 dark:group-hover:text-slate-200" />
        </button>
      </div>

      <div className="mb-4 px-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-lg border-none bg-slate-100 py-1.5 pl-9 pr-4 text-sm text-slate-700 focus:ring-2 focus:ring-[#2b6cee] dark:bg-slate-800 dark:text-slate-200"
            placeholder="Search (Cmd+K)"
            type="text"
          />
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-2">
        <div>
          <div className="group mb-1 flex items-center justify-between px-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Projects
            </span>
            <button className="opacity-0 transition-opacity group-hover:opacity-100">
              <Plus className="h-4 w-4 text-slate-400 hover:text-[#2b6cee]" />
            </button>
          </div>
          <div className="space-y-0.5">
            {projects.map((item) => (
              <a
                key={item.label}
                className={`${sidebarLinkClass} ${
                  item.active ? "bg-[#2b6cee]/10 text-[#2b6cee]" : ""
                }`}
                href="#"
              >
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between px-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Shared with me
            </span>
          </div>
          <div className="space-y-0.5">
            {sharedItems.map((item) => (
              <a key={item.label} className={sidebarLinkClass} href="#">
                <item.icon className="h-4 w-4 text-slate-500" />
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between px-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Private
            </span>
          </div>
          <div className="mx-2 flex flex-col items-center justify-center space-y-2 rounded-xl border-2 border-dashed border-slate-200 px-3 py-4 text-center dark:border-slate-800">
            <Lock className="h-4 w-4 text-slate-300 dark:text-slate-700" />
            <p className="text-[11px] text-slate-500">Only visible to you</p>
            <button className="text-[11px] font-semibold text-[#2b6cee] hover:underline">
              Add Page
            </button>
          </div>
        </div>
      </nav>

      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div className="mb-4 flex items-center justify-between">
          <button className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
            <Settings className="h-4 w-4" />
          </button>
          <button className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
            <Moon className="h-4 w-4" />
          </button>
          <button className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
            <CircleHelp className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <img
            alt="User profile avatar"
            className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-slate-800"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRBNAVt9-TqJXuVIcG5SeW2pHeYFytl0_mOmrUPqT1M_ett-AqOkJsudUH44VK8YJAcCANKYt_EWBDZfKDjI2M4wgKTJohACrg5hno_F51mh_nYpl_oZE-wky1PyoTw-SuGF97vsifNP7ULI1s4ncbmQZNIOG_ZhLvs2PSRkZyzTbMX0j707dnNkHhZa2H-Ak7Pes0DzNdWjriCtKU25pDpifcp5S5C3yrwr6kwEH8Zb2ydggWCUPCeAedM33F_jX2w6jOxrtJi98"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Alex Johnson</p>
            <p className="truncate text-xs text-slate-500">alex@acme.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
