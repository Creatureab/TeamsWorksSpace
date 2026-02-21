"use client";

import { Layers3 } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupContent,
} from "@/components/ui/sidebar";

type StepProps = {
    number: string;
    title: string;
    active?: boolean;
};

function Step({ number, title, active = false }: StepProps) {
    return (
        <div className={`flex items-start gap-4 transition-opacity ${active ? "opacity-100" : "opacity-50"}`}>
            <div
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${active ? "bg-[#3b19e6] text-white" : "bg-slate-200 text-slate-500"
                    }`}
            >
                {number}
            </div>
            <p className={`text-sm font-semibold transition-colors ${active ? "text-[#3b19e6]" : "text-slate-600"}`}>
                {title}
            </p>
        </div>
    );
}

interface OnboardingSidebarProps {
    currentStep: number;
}

export function OnboardingSidebar({ currentStep }: OnboardingSidebarProps) {
    return (
        <Sidebar className="border-r border-slate-200 bg-white" collapsible="none">
            <SidebarHeader className="p-10 pb-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3b19e6] text-white shadow-lg shadow-[#3b19e6]/20">
                        <Layers3 className="h-4 w-4" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">Nexus</span>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-10 py-6">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-6">
                            <SidebarMenuItem>
                                <Step number="1" title="Workspace Info" active={currentStep === 1} />
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Step number="2" title="Invite Team" active={currentStep === 2} />
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
