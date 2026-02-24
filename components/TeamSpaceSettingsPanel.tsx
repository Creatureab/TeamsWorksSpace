"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Settings,
    Users,
    Plus,
    Loader2,
    Trash2,
    Lock,
    Globe,
    EyeOff,
    ChevronDown,
    UserPlus,
    ArrowLeft,
} from "lucide-react";

interface Member {
    clerkId: string;
    name: string;
    email: string;
    imageUrl: string;
    role: "owner" | "member" | "guest";
    joinedAt: string;
}

interface TeamSpaceSettingsPanelProps {
    workspaceId: string;
    teamSpace: {
        id: string;
        name: string;
        description: string;
        icon: string;
        accessType: "open" | "closed" | "private";
        archived: boolean;
    };
    initialMembers: Member[];
    currentUserClerkId: string;
}

export function TeamSpaceSettingsPanel({
    workspaceId,
    teamSpace,
    initialMembers,
    currentUserClerkId,
}: TeamSpaceSettingsPanelProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("general");
    const [isSaving, setIsSaving] = useState(false);
    const [members, setMembers] = useState<Member[]>(initialMembers);

    // General Tab State
    const [name, setName] = useState(teamSpace.name);
    const [description, setDescription] = useState(teamSpace.description || "");
    const [icon, setIcon] = useState(teamSpace.icon || "🏠");
    const [accessType, setAccessType] = useState(teamSpace.accessType);

    // Invitation State
    const [isInviting, setIsInviting] = useState(false);
    const [inviteSearch, setInviteSearch] = useState("");
    const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);
    const [inviteRole, setInviteRole] = useState<"member" | "guest">("member");

    useEffect(() => {
        if (isInviting) {
            fetch(`/api/workspaces/${workspaceId}/members`)
                .then(res => res.json())
                .then(data => {
                    // Filter out users who are already members of this team space
                    const filtered = data.members.filter((wm: any) =>
                        !members.some(m => m.clerkId === wm.clerkId)
                    );
                    setWorkspaceMembers(filtered);
                })
                .catch(err => console.error("Failed to fetch workspace members", err));
        }
    }, [isInviting, workspaceId, members]);

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/workspaces/${workspaceId}/team-spaces/${teamSpace.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description, icon, accessType }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save changes");
            }

            toast.success("Team space updated");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleArchive = async () => {
        if (!confirm("Are you sure you want to archive this team space?")) return;

        setIsSaving(true);
        try {
            const res = await fetch(`/api/workspaces/${workspaceId}/team-spaces/${teamSpace.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ archived: true }),
            });

            if (!res.ok) throw new Error("Failed to archive");

            toast.success("Team space archived");
            router.push(`/workspace/${workspaceId}`);
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRoleChange = async (targetClerkId: string, newRole: "owner" | "member" | "guest") => {
        if (newRole === 'owner') {
            if (!confirm(`This will give ${members.find(m => m.clerkId === targetClerkId)?.name} full owner access. Continue?`)) return;
        }

        // Optimistic Update
        const oldMembers = [...members];
        setMembers(prev => prev.map(m => m.clerkId === targetClerkId ? { ...m, role: newRole } : m));

        try {
            const res = await fetch(`/api/workspaces/${workspaceId}/team-spaces/${teamSpace.id}/members/${targetClerkId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update role");
            }

            toast.success("Role updated");
        } catch (error: any) {
            toast.error(error.message);
            setMembers(oldMembers); // Rollback
        }
    };

    const handleRemoveMember = async (targetClerkId: string) => {
        if (!confirm("Remove this member from the team space?")) return;

        // Optimistic Update
        const oldMembers = [...members];
        setMembers(prev => prev.filter(m => m.clerkId !== targetClerkId));

        try {
            const res = await fetch(`/api/workspaces/${workspaceId}/team-spaces/${teamSpace.id}/members/${targetClerkId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to remove member");
            }

            toast.success("Member removed");
        } catch (error: any) {
            toast.error(error.message);
            setMembers(oldMembers); // Rollback
        }
    };

    const handleInviteUser = async (targetUser: any) => {
        try {
            const res = await fetch(`/api/workspaces/${workspaceId}/team-spaces/${teamSpace.id}/members`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clerkId: targetUser.clerkId, role: inviteRole }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to invite user");
            }

            toast.success(`${targetUser.name} added to ${teamSpace.name}`);
            setIsInviting(false);
            setInviteSearch("");

            // Refresh members list
            const membersRes = await fetch(`/api/workspaces/${workspaceId}/team-spaces/${teamSpace.id}/members`);
            const membersData = await membersRes.json();
            setMembers(membersData.members);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const filteredWorkspaceMembers = workspaceMembers.filter(m =>
        m.name.toLowerCase().includes(inviteSearch.toLowerCase()) ||
        m.email.toLowerCase().includes(inviteSearch.toLowerCase())
    );

    return (
        <div className="flex-1 overflow-auto bg-slate-50/50">
            <div className="mx-auto max-w-4xl px-6 py-10">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 text-slate-500">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{teamSpace.name} Settings</h1>
                            <p className="text-sm text-slate-500">Manage access and settings for this team space</p>
                        </div>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-slate-200/50 p-1">
                        <TabsTrigger value="general" className="gap-2 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Settings className="h-4 w-4" />
                            General
                        </TabsTrigger>
                        <TabsTrigger value="members" className="gap-2 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Users className="h-4 w-4" />
                            Members ({members.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="mt-6 space-y-6">
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="text-sm font-semibold">Team Space Name</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Engineering, Marketing..."
                                        className="max-w-md focus-visible:ring-blue-500"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                                    <Input
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="What is this space for?"
                                        className="max-w-2xl focus-visible:ring-blue-500"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-sm font-semibold">Icon</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-[100px] justify-between text-lg">
                                                {icon}
                                                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-64 p-2">
                                            <div className="grid grid-cols-6 gap-2">
                                                {["🏠", "🚀", "🎨", "📁", "📊", "💡", "🛠️", "📣", "👥", "⚙️", "🔒", "✅"].map(e => (
                                                    <button
                                                        key={e}
                                                        onClick={() => setIcon(e)}
                                                        className="flex h-8 w-8 items-center justify-center rounded hover:bg-slate-100"
                                                    >
                                                        {e}
                                                    </button>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="grid gap-4">
                                    <Label className="text-sm font-semibold">Access Type</Label>
                                    <div className="grid gap-4">
                                        <div className={`cursor-pointer rounded-lg border p-4 transition-all ${accessType === 'open' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setAccessType('open')}>
                                            <div className="flex gap-3">
                                                <div className={`mt-0.5 rounded-md p-1.5 ${accessType === 'open' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                    <Globe className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">Open</p>
                                                    <p className="text-xs text-slate-500">All workspace members can see and join freely</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`cursor-pointer rounded-lg border p-4 transition-all ${accessType === 'closed' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setAccessType('closed')}>
                                            <div className="flex gap-3">
                                                <div className={`mt-0.5 rounded-md p-1.5 ${accessType === 'closed' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                    <Lock className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">Closed</p>
                                                    <p className="text-xs text-slate-500">Everyone can see this space but content is invite-only</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`cursor-pointer rounded-lg border p-4 transition-all ${accessType === 'private' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setAccessType('private')}>
                                            <div className="flex gap-3">
                                                <div className={`mt-0.5 rounded-md p-1.5 ${accessType === 'private' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                    <EyeOff className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">Private</p>
                                                    <p className="text-xs text-slate-500">Only members know this space exists</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-4">
                                    <Button onClick={handleSaveChanges} disabled={isSaving} className="bg-blue-600 px-8 hover:bg-blue-700">
                                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-red-200 bg-red-50/30 p-6">
                            <h3 className="text-sm font-bold text-red-900">Danger Zone</h3>
                            <p className="mt-1 text-xs text-red-600">Archive this team space to hide it from all members. It can be unarchived later.</p>
                            <Button onClick={handleArchive} disabled={isSaving} variant="outline" className="mt-4 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Archive Team Space
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="members" className="mt-6">
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between bg-slate-50/50 px-6 py-4 border-b border-slate-200">
                                <h3 className="text-sm font-semibold text-slate-900">Team Space Members</h3>
                                <Popover open={isInviting} onOpenChange={setIsInviting}>
                                    <PopoverTrigger asChild>
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-2">
                                            <UserPlus className="h-3.5 w-3.5" />
                                            Invite
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 p-0" align="end">
                                        <div className="p-4 border-b border-slate-100">
                                            <h4 className="text-sm font-bold">Invite to {teamSpace.name}</h4>
                                            <p className="text-xs text-slate-500 mt-1">Search within workspace members</p>
                                        </div>
                                        <div className="p-2">
                                            <Input
                                                placeholder="Name or email..."
                                                value={inviteSearch}
                                                onChange={(e) => setInviteSearch(e.target.value)}
                                                className="h-8 text-xs"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="max-h-60 overflow-y-auto p-1">
                                            {filteredWorkspaceMembers.length > 0 ? (
                                                filteredWorkspaceMembers.map(wm => (
                                                    <button
                                                        key={wm.clerkId}
                                                        onClick={() => handleInviteUser(wm)}
                                                        className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-slate-100 transition-colors"
                                                    >
                                                        <Avatar className="h-7 w-7">
                                                            <AvatarImage src={wm.imageUrl} />
                                                            <AvatarFallback className="text-[10px]">{wm.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-semibold truncate">{wm.name}</p>
                                                            <p className="text-[10px] text-slate-500 truncate">{wm.email}</p>
                                                        </div>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="py-8 text-center text-xs text-slate-500">
                                                    {inviteSearch ? "No members found" : "Start typing to search..."}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-[10px] font-semibold text-slate-500">Initial Role</span>
                                                <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                                                    <SelectTrigger className="h-7 text-[10px] w-28">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="member">Member</SelectItem>
                                                        <SelectItem value="guest">Guest</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {members.map((member) => (
                                    <div key={member.clerkId} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-slate-200">
                                                <AvatarImage src={member.imageUrl} />
                                                <AvatarFallback className="bg-slate-800 text-xs text-white uppercase tracking-tighter">
                                                    {member.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{member.name} {member.clerkId === currentUserClerkId && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded ml-1 font-bold">You</span>}</p>
                                                <p className="text-xs text-slate-500">{member.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <Select
                                                value={member.role}
                                                disabled={member.clerkId === currentUserClerkId || isSaving}
                                                onValueChange={(val: any) => handleRoleChange(member.clerkId, val)}
                                            >
                                                <SelectTrigger className="h-8 w-28 text-xs border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="owner">Owner</SelectItem>
                                                    <SelectItem value="member">Member</SelectItem>
                                                    <SelectItem value="guest">Guest</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" disabled={member.clerkId === currentUserClerkId}>
                                                        <ChevronDown className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem
                                                        onClick={() => handleRemoveMember(member.clerkId)}
                                                        className="text-red-600 focus:text-red-700 focus:bg-red-50 gap-2"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Remove from space
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
