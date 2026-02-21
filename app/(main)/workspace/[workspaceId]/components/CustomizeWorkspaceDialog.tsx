"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export interface WorkspaceCustomizationPayload {
  name: string;
  type: "organization" | "personal";
  size: "1-5" | "6-20" | "21-50" | "50+";
  companySpaceEnabled: boolean;
}

interface CustomizeWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: WorkspaceCustomizationPayload;
  onSave: (payload: WorkspaceCustomizationPayload) => Promise<void> | void;
}

export default function CustomizeWorkspaceDialog({
  open,
  onOpenChange,
  initialValues,
  onSave,
}: CustomizeWorkspaceDialogProps) {
  const [name, setName] = useState(initialValues.name);
  const [type, setType] = useState<WorkspaceCustomizationPayload["type"]>(initialValues.type);
  const [size, setSize] = useState<WorkspaceCustomizationPayload["size"]>(initialValues.size);
  const [companySpaceEnabled, setCompanySpaceEnabled] = useState(initialValues.companySpaceEnabled);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initialValues.name);
    setType(initialValues.type);
    setSize(initialValues.size);
    setCompanySpaceEnabled(initialValues.companySpaceEnabled);
  }, [initialValues, open]);

  const handleSave = async () => {
    const normalizedName = name.trim();
    if (!normalizedName) return;

    setIsSaving(true);
    try {
      await onSave({
        name: normalizedName,
        type,
        size,
        companySpaceEnabled,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md rounded-xl border-slate-200 bg-white p-0 [font-family:Inter,ui-sans-serif,system-ui,sans-serif]"
      >
        <DialogHeader className="border-b border-slate-200/80 px-5 py-4">
          <DialogTitle className="text-base font-semibold text-slate-900">Customize Workspace</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          <div className="space-y-1.5">
            <label htmlFor="workspace-name" className="text-xs font-medium text-slate-600">
              Workspace Name
            </label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Acme Organization"
              className="h-9 rounded-lg border-slate-200 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Workspace Type</label>
            <Select value={type} onValueChange={(value) => setType(value as WorkspaceCustomizationPayload["type"])}>
              <SelectTrigger className="w-full rounded-lg border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="organization">Organization</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Team Size</label>
            <Select value={size} onValueChange={(value) => setSize(value as WorkspaceCustomizationPayload["size"])}>
              <SelectTrigger className="w-full rounded-lg border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-5">1-5</SelectItem>
                <SelectItem value="6-20">6-20</SelectItem>
                <SelectItem value="21-50">21-50</SelectItem>
                <SelectItem value="50+">50+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <div>
              <p className="text-sm font-medium text-slate-800">Company Space</p>
              <p className="text-xs text-slate-500">Show org-wide collaboration space in sidebar.</p>
            </div>
            <Switch checked={companySpaceEnabled} onCheckedChange={setCompanySpaceEnabled} />
          </div>
        </div>

        <DialogFooter className="border-t border-slate-200/80 px-5 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!name.trim() || isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

