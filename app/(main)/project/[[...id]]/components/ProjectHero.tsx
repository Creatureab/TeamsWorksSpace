"use client";

import {
    ChevronRight,
    Home,
    Plus,
    Layout,
    ListTodo,
    Settings,
    MoreHorizontal,
    Calendar,
    Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProjectHeroProps {
    user: any;
    project: any;
    currentWorkspace: any;
}

export default function ProjectHero({ user, project, currentWorkspace }: ProjectHeroProps) {
    const projectTitle = project?.title || "Project";
    const workspaceName = currentWorkspace?.name || "Workspace";

    return (
        <main className="min-w-0 flex-1 overflow-y-auto bg-white dark:bg-[#0b0f17]">
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-8 dark:border-slate-800 dark:bg-[#0b0f17]/80">
                <div className="flex items-center gap-4 text-sm text-slate-500">
                    <SidebarTrigger />
                    <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        <ChevronRight className="h-3 w-3" />
                        <span className="font-medium text-slate-600 dark:text-slate-400">{workspaceName}</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="font-bold text-slate-900 dark:text-slate-100">{projectTitle}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                        <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    <Button className="bg-[#2b6cee] hover:bg-[#2b6cee]/90 h-8 text-xs font-bold px-3">
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Add Task
                    </Button>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
                <section className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20">
                            <Layout className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">{projectTitle}</h1>
                    </div>
                    {project.description && (
                        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
                            {project.description}
                        </p>
                    )}
                </section>

                <section>
                    <Tabs defaultValue="list" className="w-full">
                        <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-800">
                            <TabsList className="bg-transparent border-none space-x-6 h-auto p-0">
                                <TabsTrigger
                                    value="list"
                                    className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-0 data-[state=active]:border-[#2b6cee] data-[state=active]:bg-transparent data-[state=active]:text-[#2b6cee] shadow-none"
                                >
                                    <ListTodo className="h-4 w-4 mr-2" />
                                    List
                                </TabsTrigger>
                                <TabsTrigger
                                    value="board"
                                    className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-0 data-[state=active]:border-[#2b6cee] data-[state=active]:bg-transparent data-[state=active]:text-[#2b6cee] shadow-none"
                                >
                                    <Layout className="h-4 w-4 mr-2" />
                                    Board
                                </TabsTrigger>
                                <TabsTrigger
                                    value="calendar"
                                    className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-0 data-[state=active]:border-[#2b6cee] data-[state=active]:bg-transparent data-[state=active]:text-[#2b6cee] shadow-none"
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Calendar
                                </TabsTrigger>
                            </TabsList>
                            <div className="flex items-center gap-4 pb-3">
                                <Button variant="ghost" size="sm" className="hidden text-xs text-slate-500 sm:flex">
                                    <Filter className="h-3.5 w-3.5 mr-1.5" />
                                    Filter
                                </Button>
                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    {project.privacy || "Workspace"}
                                </Badge>
                            </div>
                        </div>

                        <TabsContent value="list" className="mt-0">
                            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-20 text-center dark:border-slate-800 dark:bg-slate-900/30">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-800">
                                    <ListTodo className="h-6 w-6 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold">No tasks yet</h3>
                                <p className="text-sm text-slate-500 mb-6">Start by adding your first task to the project.</p>
                                <Button className="bg-[#2b6cee]">Create Task</Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="board" className="mt-0">
                            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-20 text-center dark:border-slate-800 dark:bg-slate-900/30">
                                <p className="text-slate-500 font-medium">Board view coming soon...</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="calendar" className="mt-0">
                            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-20 text-center dark:border-slate-800 dark:bg-slate-900/30">
                                <p className="text-slate-500 font-medium">Calendar view coming soon...</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </section>
            </div>
        </main>
    );
}
