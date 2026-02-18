"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { OnboardingSidebar } from "./OnboardingSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const teamSizes = ["1-5", "6-20", "21-50", "50+"];

type WorkSpaceInfoProps = {
  onContinue?: (workspaceType: string) => void;
};

type DbUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
};

const slugifyWorkspaceUrl = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const WorkSpaceInfo = ({ onContinue }: WorkSpaceInfoProps) => {
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [workspaceName, setWorkspaceName] = useState("");
  const [selectedSize, setSelectedSize] = useState("1-5");
  const [workspaceType, setWorkspaceType] = useState("organization");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const workspaceUrl = slugifyWorkspaceUrl(workspaceName);

  useEffect(() => {
    const fetchDbUser = async () => {
      try {
        const response = await fetch("/api/me");
        if (response.ok) {
          const data = await response.json();
          setDbUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch user from DB:", error);
      } finally {
        setIsLoadingDb(false);
      }
    };

    if (isLoaded && user) {
      fetchDbUser();
    }
  }, [isLoaded, user]);

  const displayName = dbUser ? `${dbUser.firstName} ${dbUser.lastName || ""}`.trim() : (user?.fullName || user?.username || "Workspace User");
  const email = dbUser?.email || user?.primaryEmailAddress?.emailAddress || "No email available";
  const avatarFallback = displayName.charAt(0).toUpperCase();
  const displayImage = dbUser?.imageUrl || user?.imageUrl;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workspaceName,
          slug: workspaceUrl,
          size: selectedSize,
          type: workspaceType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onContinue?.(data._id);
      } else if (response.status === 409) {
        const data = await response.json();
        if (data?.workspaceId) {
          router.push(`/project/${data.workspaceId}`);
          return;
        }
        alert(data?.message || "Only one workspace is allowed per user.");
      } else {
        const errorData = await response.text();
        console.error("Failed to create workspace:", errorData);
        alert(`Error: ${errorData}`);
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#f6f6f8] font-sans text-slate-900">
        <OnboardingSidebar currentStep={1} />

        <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden p-8 lg:p-24">
          <div className="w-full max-w-xl">
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <Avatar className="h-10 w-10 border border-slate-200">
                <AvatarImage src={displayImage} alt={displayName} />
                <AvatarFallback className="bg-[#3b19e6] text-white font-bold">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {isLoaded && !isLoadingDb ? displayName : "Loading profile..."}
                </p>
                <p className="truncate text-xs text-slate-500">{isLoaded && !isLoadingDb ? email : ""}</p>
              </div>
            </div>

            <header className="mb-10 text-center lg:text-left">
              <h1 className="mb-3 text-3xl font-bold tracking-tight lg:text-4xl">
                Create your workspace
              </h1>
              <p className="text-lg text-slate-500">
                Tell us a bit about your team to get started.
              </p>
            </header>

            <form
              className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              onSubmit={handleSubmit}
            >
              <div className="space-y-2">
                <Label htmlFor="workspace-name" className="text-sm font-semibold">Workspace Name</Label>
                <Input
                  id="workspace-name"
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  required
                  value={workspaceName}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workspace-url" className="text-sm font-semibold">Workspace URL</Label>

                <div className="relative flex items-center">
                  <Input
                    id="workspace-url"
                    placeholder="acme-corp"
                    readOnly
                    value={workspaceUrl}
                  />
                  <div className="absolute right-3 border-l pl-3 text-sm text-slate-400">
                    .nexus.app
                  </div>
                </div>

                {workspaceUrl ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Preview:{" "}
                    <span className="font-medium text-[#3b19e6]">{workspaceUrl}.nexus.app</span>
                  </p>
                ) : null}
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold">Team Size</Label>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {teamSizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      className={`h-auto border py-3 text-sm transition-all ${selectedSize === size
                        ? "bg-[#3b19e6] text-white hover:bg-[#3b19e6]/90"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      onClick={() => setSelectedSize(size)}
                      type="button"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workspace-type" className="text-sm font-semibold">Workspace Type</Label>
                <Select value={workspaceType} onValueChange={setWorkspaceType}>
                  <SelectTrigger id="workspace-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organization">Organization</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col items-center gap-4 border-t border-slate-200 pt-6 sm:flex-row">
                <Button
                  className="w-full bg-[#3b19e6] px-8 py-3.5 font-bold text-white hover:bg-[#3015c4] sm:w-auto"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? "Creating..." : "Continue"}
                </Button>

                <Button
                  className="w-full text-slate-500 hover:text-slate-800 sm:w-auto"
                  disabled={isSubmitting}
                  type="button"
                  variant="ghost"
                >
                  Skip for now
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default WorkSpaceInfo;
