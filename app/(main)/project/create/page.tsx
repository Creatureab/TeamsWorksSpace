"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CreateProjectResponse = {
  _id?: string;
  title?: string;
  workspace?: string;
};

export default function CreateProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const workspaceId = searchParams.get("workspaceId")?.trim() || "";
  const teamSpaceId = searchParams.get("teamSpaceId")?.trim() || "";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<"Workspace" | "Private">("Workspace");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return Boolean(workspaceId && title.trim() && !isSubmitting);
  }, [workspaceId, title, isSubmitting]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!workspaceId) {
      setError("Missing workspaceId. Open this page from a workspace.");
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Project name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          description: description.trim() || undefined,
          privacy,
          workspaceId,
          teamSpaceId: teamSpaceId || undefined,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Failed to create project");
      }

      const project = (await res.json()) as CreateProjectResponse;
      if (!project?._id) {
        throw new Error("Project created but missing id");
      }

      router.push(`/project/${project._id}`);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create project";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-0px)] bg-[#f6f6f8] text-slate-900 dark:bg-[#101622] dark:text-slate-100">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Create a project</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Projects live inside a workspace and can have sub-pages like Tasks.
          </p>
        </div>

        {!workspaceId ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm dark:border-slate-800 dark:bg-[#0b0f17]">
            <div className="font-semibold">No workspace selected</div>
            <div className="mt-1 text-slate-500 dark:text-slate-400">
              Open this page from inside a workspace so we know where to create the project.
            </div>
            <div className="mt-4">
              <Button asChild>
                <Link href="/workspace">Go to workspaces</Link>
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0b0f17]"
          >
            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold">Project name</label>
                <div className="mt-2">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Website redesign"
                    aria-invalid={Boolean(error && !title.trim())}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold">Description (optional)</label>
                <div className="mt-2">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this project about?"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold">Privacy</label>
                <div className="mt-2">
                  <Select value={privacy} onValueChange={(v) => setPrivacy(v as typeof privacy)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select privacy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Workspace">Workspace</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
                  {error}
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-3">
                <Button type="button" variant="ghost" asChild disabled={isSubmitting}>
                  <Link href={`/workspace/${encodeURIComponent(workspaceId)}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={!canSubmit}>
                  {isSubmitting ? "Creating..." : "Create project"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}