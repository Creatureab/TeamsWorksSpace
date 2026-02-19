"use client";

import {
  ChevronDown,
  CircleHelp,
  Folder,
  LayoutDashboard,
  Lock,
  LogOut,
  Moon,
  Plus,
  Search,
  Settings,
  Users,
  Star,
  Inbox,
  Sparkles,
  Command,
  Clock,
  Layout,
  CheckSquare,
  MoreHorizontal,
  Bell,
  Search as SearchIcon,
  Home,
  Sun,
} from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClerk } from "@clerk/nextjs";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: any;
  workspaces: any[];
  currentWorkspace: any;
  projects?: any[];
}

export default function Sidebar({ user, workspaces, currentWorkspace, projects = [] }: SidebarProps) {
  const initials = currentWorkspace?.name?.charAt(0) || "W";
  const { signOut } = useClerk();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeProjectSlug = searchParams.get("project");

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const menuItems = [
    { label: "Search", icon: SearchIcon, shortcut: "⌘K", action: () => { } },
    { label: "AI Assistant", icon: Sparkles, color: "text-purple-500", action: () => { } },
    { label: "Inbox", icon: Inbox, badge: 3, action: () => { } },
    { label: "All Updates", icon: Bell, action: () => { } },
  ];

  return (
    <ShadcnSidebar className="border-r border-slate-200 bg-[#fbfbfa] dark:border-slate-800 dark:bg-[#191919]">
      {/* Workspace Switcher */}
      <SidebarHeader className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex w-full items-center justify-between rounded-lg p-2 transition-all hover:bg-slate-200/50 dark:hover:bg-white/5">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-[#2b6cee] text-[10px] font-bold text-white shadow-sm uppercase">
                  {initials}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold leading-none text-slate-700 dark:text-gray-200 truncate max-w-[120px]">
                    {currentWorkspace?.name || "Workspace"}
                  </p>
                </div>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-slate-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="start" side="bottom">
            <DropdownMenuLabel className="text-xs text-gray-500">{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {workspaces.map((ws) => (
              <DropdownMenuItem key={ws._id} onClick={() => router.push(`/workspace/${ws._id}`)}>
                <div className="flex items-center gap-2 w-full">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-[8px] font-bold">
                    {ws.name.charAt(0)}
                  </div>
                  <span className="flex-1 truncate">{ws.name}</span>
                  {ws._id === currentWorkspace?._id && <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/onboarding')}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Create Workspace</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent className="px-3 gap-0">
        {/* Top Actions */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton className="h-8 hover:bg-slate-200/50 dark:hover:bg-white/5 group">
                    <item.icon className={cn("h-4 w-4", item.color || "text-slate-500")} />
                    <span className="text-sm font-medium text-slate-600 dark:text-gray-300">{item.label}</span>
                    {item.shortcut && (
                      <span className="ml-auto text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.shortcut}
                      </span>
                    )}
                    {item.badge && (
                      <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Favorites */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
            <Star size={12} /> Favorites
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="px-3 py-1 text-xs text-slate-400 italic">No favorites yet</div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Teamspaces Section */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[11px] font-semibold text-slate-500 uppercase flex items-center justify-between group">
            <div className="flex items-center gap-1.5">
              <Users size={12} /> Teamspaces
            </div>
            <button className="opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-800 rounded p-0.5 transition-all">
              <Plus size={14} />
            </button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-8 group">
                  <div className="flex h-4 w-4 items-center justify-center rounded bg-amber-500/10 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                    <Sparkles size={10} />
                  </div>
                  <span className="text-sm font-medium">Engineering</span>
                  <ChevronDown size={14} className="ml-auto text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-8 group">
                  <div className="flex h-4 w-4 items-center justify-center rounded bg-blue-500/10 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <Layout size={10} />
                  </div>
                  <span className="text-sm font-medium">Marketing</span>
                  <ChevronDown size={14} className="ml-auto text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-8 group">
                  <div className="flex h-4 w-4 items-center justify-center rounded bg-purple-500/10 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                    <CheckSquare size={10} />
                  </div>
                  <span className="text-sm font-medium">Product</span>
                  <ChevronDown size={14} className="ml-auto text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Workspace Content */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[11px] font-semibold text-slate-500 uppercase">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={(pathname === `/workspace/${currentWorkspace?._id}` || pathname === "/workspace" || pathname === "/") && !activeProjectSlug}
                  className="h-8"
                  onClick={() => router.push(`/workspace/${currentWorkspace?._id}`)}
                >
                  <Home className="h-4 w-4" />
                  <span className="text-sm">Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-8">
                  <CheckSquare className="h-4 w-4" />
                  <span className="text-sm">My Tasks</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-8">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Recent Pages</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[11px] font-semibold text-slate-500 uppercase flex items-center justify-between group">
            Projects
            <button
              onClick={() => router.push(`/createProject?workspaceId=${currentWorkspace?._id}&name=${currentWorkspace?.name}`)}
              className="opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-800 rounded p-0.5 transition-all"
            >
              <Plus size={14} />
            </button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.length > 0 ? (
                projects.map((project: any) => (
                  <SidebarMenuItem key={project._id}>
                    <SidebarMenuButton
                      isActive={activeProjectSlug === project.slug}
                      className="h-8 group"
                      onClick={() => router.push(`/workspace/${currentWorkspace?._id}?project=${project.slug}`)}
                    >
                      <Layout className={cn("h-4 w-4", activeProjectSlug === project.slug ? "text-blue-500" : "text-slate-400")} />
                      <span className="text-sm truncate flex-1">{project.title}</span>
                      <button className="opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-all">
                        <MoreHorizontal size={12} />
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                <div className="px-3 py-1 text-xs text-slate-400">No projects</div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Private Section */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[11px] font-semibold text-slate-500 uppercase">Private</SidebarGroupLabel>
          <button className="mx-3 mt-1 flex items-center gap-2 rounded-md border border-dashed border-slate-300 dark:border-slate-700 p-2 text-xs text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
            <Plus size={12} />
            New Page
          </button>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-slate-200 dark:border-slate-800 bg-[#fbfbfa] dark:bg-[#191919]">
        <div className="flex items-center gap-2 mb-3">
          <TooltipProvider>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-slate-200/50 dark:hover:bg-white/5 text-slate-500">
              <Settings size={14} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-slate-200/50 dark:hover:bg-white/5 text-slate-500">
              <CircleHelp size={14} />
            </Button>
            <Button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md hover:bg-slate-200/50 dark:hover:bg-white/5 text-slate-500"
            >
              <span className="sr-only">Toggle theme</span>
              {theme === "dark" ? (
                <Sun size={14} className="transition-all" />
              ) : (
                <Moon size={14} className="transition-all" />
              )}
            </Button>
          </TooltipProvider>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-lg p-1.5 transition-all hover:bg-slate-200/50 dark:hover:bg-white/5">
              <Avatar className="h-6 w-6 border border-slate-200 dark:border-slate-700">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback className="bg-[#2b6cee] text-[10px] text-white font-bold">
                  {user?.firstName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-left flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700 dark:text-gray-200 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" side="top">
            <DropdownMenuItem className="text-xs">Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-red-600" onClick={handleLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
