"use client";

import { useEffect, useState, useCallback } from "react";
import { Rocket } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
  workspaceName?: string;
  workspaceId?: string | null;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  onCreate,
  workspaceName = "Workspace",
  workspaceId,
}: CreateProjectModalProps) {
  const [title, setTitle] = useState("Untitled Project");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("workspace");
  const [automation, setAutomation] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!title.trim()) {
      toast.error("Project title is required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          privacy,
          automation,
          workspaceId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create project");
      }

      const data = await response.json();
      toast.success("Project created successfully");
      onCreate(data);
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [title, description, privacy, automation, workspaceId, onCreate, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[800px] overflow-hidden rounded-2xl border border-white/10 bg-[#0f172b] p-0 text-white shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Enter the details for your new project.
          </DialogDescription>
        </DialogHeader>
        {/* Header Visual */}
        <div
          className="relative h-32 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=2070')",
            backgroundBlendMode: "overlay"
          }}
        >
          <div className="absolute inset-0 bg-slate-900/60" />
          <div className="absolute -bottom-6 left-8 flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-[#1e293b] shadow-lg z-10">
            <Rocket className="h-6 w-6 text-blue-500" />
          </div>
        </div>

        {/* Content Body */}
        <div className="px-8 pb-4 pt-10">
          <p className="mb-2 text-xs font-bold tracking-widest text-blue-400 uppercase">
            Creating in : <span className="underline cursor-pointer">{workspaceName}</span>
          </p>

          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-2 h-auto border-none bg-transparent p-0 text-3xl font-bold focus-visible:ring-0 placeholder:text-slate-500"
            placeholder="Untitled Project"
          />

          <Textarea
            placeholder="Add a description or project goals..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mb-4 min-h-[80px] border-none bg-transparent p-0 text-slate-400 focus-visible:ring-0 placeholder:text-slate-500"
          />

          <div className="my-6 border-t border-white/5" />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Privacy */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Project Privacy
              </Label>
              <Select value={privacy} onValueChange={setPrivacy}>
                <SelectTrigger className="w-full border-white/10 bg-[#1e293b] text-white focus:ring-blue-500/20">
                  <SelectValue placeholder="Select privacy" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-white/10 text-white">
                  <SelectItem value="workspace">Workspace (All members)</SelectItem>
                  <SelectItem value="private">Private (Only you)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Automation */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Automations
              </Label>
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#1e293b] px-4 py-2.5">
                <span className="text-sm text-slate-300">Default templates</span>
                <Switch
                  checked={automation}
                  onCheckedChange={setAutomation}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex items-center justify-between gap-4 border-t border-white/5 bg-[#0b1220]/50 px-8 py-6">
          <div className="hidden space-x-4 text-[10px] font-medium tracking-tight text-slate-500 md:block">
            <span className="rounded bg-white/5 px-1.5 py-0.5 border border-white/5">ESC</span> to cancel
            <span className="ml-2 rounded bg-white/5 px-1.5 py-0.5 border border-white/5">ENTER</span> to create
          </div>

          <div className="flex w-full gap-3 md:w-auto">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={onClose}
              className="flex-1 border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white md:flex-none md:px-6"
            >
              Cancel
            </Button>
            <Button
              disabled={isLoading}
              onClick={handleCreate}
              className="flex-1 bg-blue-600 font-bold text-white hover:bg-blue-700 md:flex-none md:px-8"
            >
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
