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
import { useRouter } from "next/navigation";
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
  SidebarHeader as ShadcnSidebarHeader,
} from "@/components/ui/sidebar";

interface SidebarProps {
  user: any;
  workspaces: any[];
  currentWorkspace: any;
  projects?: any[];
}

export default function Sidebar({ user, workspaces, currentWorkspace, projects = [] }: SidebarProps) {
  const initials = currentWorkspace?.name?.charAt(0) || "W";
  const { signOut } = useClerk();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <ShadcnSidebar className="border-r border-slate-200 bg-[#f9f9fb] dark:border-slate-800 dark:bg-[#0b0f17]">
      <SidebarHeader className="p-4">
        <button className="group flex w-full items-center justify-between rounded-xl bg-white p-2.5 shadow-sm border border-slate-200 transition-all hover:bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800 dark:hover:bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2b6cee] text-sm font-bold text-white shadow-sm shadow-[#2b6cee]/20 uppercase">
              {initials}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold leading-none text-slate-900 dark:text-slate-100 truncate max-w-[110px]">
                {currentWorkspace?.name || "Workspace"}
              </p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {currentWorkspace?.type === "organization" ? "Pro Plan" : "Personal"}
              </p>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-y-0.5" />
        </button>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <div className="mb-4 px-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2b6cee] transition-colors z-10" />
            <Input
              className="w-full bg-white pl-9 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              placeholder="Search..."
              type="text"
            />
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-widest text-slate-500/80">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive>
                  <a href="#" className="flex items-center gap-3">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Overview</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#" className="flex items-center gap-3">
                    <Folder className="h-4 w-4" />
                    <span>Documents</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#" className="flex items-center gap-3">
                    <Users className="h-4 w-4" />
                    <span>Team Members</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-widest text-slate-500/80">
            Projects
          </SidebarGroupLabel>
          <SidebarGroupAction
            onClick={() => router.push(`/createProject?workspaceId=${currentWorkspace._id}&name=${currentWorkspace.name}`)}
            className="hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">New Project</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.length > 0 ? (
                projects.map((project: any) => (
                  <SidebarMenuItem key={project._id}>
                    <SidebarMenuButton asChild>
                      <a href={`/project/${project._id}`} className="flex items-center gap-3">
                        <Folder className="h-4 w-4 text-[#2b6cee]" />
                        <span className="truncate">{project.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                <div className="px-3 py-2 text-[11px] text-slate-400 italic">No projects yet</div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-widest text-slate-500/80">
            Private
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="mx-2 flex flex-col items-center justify-center space-y-2 rounded-xl border border-dashed border-slate-200 bg-white/50 px-3 py-6 text-center dark:border-slate-800 dark:bg-slate-900/30">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <p className="text-[11px] font-medium text-slate-500">Only visible to you</p>
              <button className="text-[11px] font-bold text-[#2b6cee] transition-colors hover:text-[#2b6cee]/80">
                New Private Page
              </button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mb-4 flex items-center justify-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white hover:text-[#2b6cee] dark:hover:bg-slate-700">
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white hover:text-[#2b6cee] dark:hover:bg-slate-700">
                  <Moon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Dark Mode</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white hover:text-[#2b6cee] dark:hover:bg-slate-700">
                  <CircleHelp className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Help</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
              <div className="relative">
                <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700">
                  <AvatarImage src={user?.imageUrl} alt={user?.firstName} />
                  <AvatarFallback className="bg-[#2b6cee] text-white text-xs font-bold">
                    {user?.firstName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "User"}
                </p>
                <p className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {user?.email}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-y-0.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" side="top">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}

