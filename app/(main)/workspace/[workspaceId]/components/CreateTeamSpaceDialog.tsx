"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type TeamSpaceVisibility = "open" | "closed" | "private";

interface CreateTeamSpaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (payload: { name: string; visibility: TeamSpaceVisibility }) => void;
}

const visibilityOptions: Array<{
  value: TeamSpaceVisibility;
  label: string;
  description: string;
}> = [
  { value: "open", label: "Open", description: "Anyone in the workspace can join." },
  { value: "closed", label: "Closed", description: "Members can request access." },
  { value: "private", label: "Private", description: "Invite-only and hidden by default." },
];

export default function CreateTeamSpaceDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateTeamSpaceDialogProps) {
  const [spaceName, setSpaceName] = useState("");
  const [visibility, setVisibility] = useState<TeamSpaceVisibility>("open");

  const handleCreate = () => {
    const normalizedName = spaceName.trim();
    if (!normalizedName) return;

    onCreate({ name: normalizedName, visibility });
    setSpaceName("");
    setVisibility("open");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSpaceName("");
    setVisibility("open");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md rounded-xl border-slate-200 bg-white p-0 [font-family:Inter,ui-sans-serif,system-ui,sans-serif]"
      >
        <DialogHeader className="border-b border-slate-200/80 px-5 py-4">
          <DialogTitle className="text-base font-semibold text-slate-900">Create Team Space</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          <div className="space-y-1.5">
            <label htmlFor="team-space-name" className="text-xs font-medium text-slate-600">
              Space Name
            </label>
            <Input
              id="team-space-name"
              value={spaceName}
              onChange={(event) => setSpaceName(event.target.value)}
              placeholder="e.g. Customer Success"
              className="h-9 rounded-lg border-slate-200 text-sm"
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-xs font-medium text-slate-600">Visibility</legend>
            <div className="space-y-2">
              {visibilityOptions.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 transition-colors",
                    visibility === option.value ? "border-blue-200 bg-blue-50/70" : "hover:bg-slate-50"
                  )}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={option.value}
                    checked={visibility === option.value}
                    onChange={() => setVisibility(option.value)}
                    className="mt-0.5 h-3.5 w-3.5 accent-blue-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{option.label}</p>
                    <p className="text-xs text-slate-500">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <DialogFooter className="border-t border-slate-200/80 px-5 py-4 sm:justify-end">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleCreate} disabled={!spaceName.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

