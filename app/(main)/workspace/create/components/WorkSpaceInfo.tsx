"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layers3 } from "lucide-react";
import { useState, useEffect } from "react";

const teamSizes = ["1-5", "6-20", "21-50", "50+"];

type StepProps = {
  number: string;
  title: string;
  active?: boolean;
};

type WorkSpaceInfoProps = {
  onContinue?: (workspaceType: string) => void;
};

const slugifyWorkspaceUrl = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

function Step({ number, title, active = false }: StepProps) {
  return (
    <div className={`flex items-start gap-4 ${active ? "" : "opacity-50"}`}>
      <div
        className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${active ? "bg-[#3b19e6] text-white" : "bg-slate-200 text-slate-500"
          }`}
      >
        {number}
      </div>
      <p className={`font-semibold ${active ? "text-[#3b19e6]" : ""}`}>{title}</p>
    </div>
  );
}

const WorkSpaceInfo = ({ onContinue }: WorkSpaceInfoProps) => {
  const { isLoaded, user } = useUser();
  const [dbUser, setDbUser] = useState<any>(null);
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
    <div className="flex min-h-screen bg-[#f6f6f8] font-sans text-slate-900">
      <aside className="hidden w-80 flex-col border-r border-slate-200 bg-white p-10 lg:flex">
        <div className="mb-16 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3b19e6] text-white">
            <Layers3 className="h-4 w-4" />
          </div>
          <span className="text-xl font-bold tracking-tight">Nexus</span>
        </div>

        <nav className="flex-1 space-y-8">
          <Step active number="1" title="Workspace Info" />
          <Step number="2" title="Invite Team" />
        </nav>
      </aside>

      <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden p-8 lg:p-24">
        <div className="w-full max-w-xl">
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            {(isLoaded && displayImage) ? (
              <div
                aria-hidden
                className="h-10 w-10 rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url(${displayImage})` }}
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3b19e6]/10 text-sm font-bold text-[#3b19e6]">
                {avatarFallback}
              </div>
            )}
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
              <label className="block text-sm font-semibold" htmlFor="workspace-name">
                Workspace Name
              </label>
              <Input
                id="workspace-name"
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="e.g. Acme Corp"
                required
                value={workspaceName}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold" htmlFor="workspace-url">
                Workspace URL
              </label>

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
              <label className="block text-sm font-semibold">Team Size</label>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {teamSizes.map((size) => (
                  <button
                    key={size}
                    className={`rounded-lg border px-4 py-3 text-sm transition-all ${selectedSize === size
                      ? "border-[#3b19e6] bg-[#3b19e6]/10 font-semibold text-[#3b19e6]"
                      : "border-slate-200 bg-white text-slate-600"
                      }`}
                    onClick={() => setSelectedSize(size)}
                    type="button"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold" htmlFor="workspace-type">
                Workspace Type
              </label>
              <select
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-[#3b19e6] focus-visible:ring-[3px] focus-visible:ring-[#3b19e6]/20"
                id="workspace-type"
                onChange={(event) => setWorkspaceType(event.target.value)}
                value={workspaceType}
              >
                <option value="organization">Organization</option>
              </select>
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
  );
};
export default WorkSpaceInfo;
