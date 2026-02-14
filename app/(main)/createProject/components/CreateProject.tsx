"use client";

import { useEffect, useState, useCallback } from "react";
import { Rocket } from "lucide-react";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    title: string;
    description: string;
    privacy: string;
    automation: boolean;
  }) => void;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  onCreate,
}: CreateProjectModalProps) {
  const [title, setTitle] = useState("Untitled Project");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("workspace");
  const [automation, setAutomation] = useState(true);

  const handleCreate = useCallback(() => {
    onCreate({ title, description, privacy, automation });
    onClose();
  }, [title, description, privacy, automation, onCreate, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") {
        const target = e.target as HTMLElement;
        if (target.tagName !== "TEXTAREA") {
          handleCreate();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleCreate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-[900px] overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] text-white shadow-2xl">
        {/* Header */}
        <div className="relative h-40 bg-gradient-to-r from-slate-800 to-slate-700">
          <div className="absolute -bottom-6 left-6 flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-[#1e293b] shadow-lg">
            <Rocket className="h-6 w-6 text-blue-500" />
          </div>
        </div>

        {/* Body */}
        <div className="px-8 pb-6 pt-10">
          <p className="mb-2 text-xs text-blue-400">
            CREATING IN :{" "}
            <span className="underline">ACME WORKSPACE</span>
          </p>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-2 w-full bg-transparent text-3xl font-semibold outline-none placeholder:text-slate-500"
          />

          <textarea
            placeholder="Add a description or project goals..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mb-6 w-full resize-none bg-transparent text-slate-400 outline-none placeholder:text-slate-500"
            rows={3}
          />

          <div className="my-6 border-t border-white/10" />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Privacy */}
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Project Privacy
              </label>
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#1e293b] px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="workspace">
                  Workspace (Visible to everyone)
                </option>
                <option value="private">Private (Only you)</option>
              </select>
            </div>

            {/* Automation */}
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Automations
              </label>
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#1e293b] px-4 py-2">
                <span className="text-sm text-slate-400">
                  Default templates
                </span>

                <button
                  type="button"
                  onClick={() => setAutomation((prev) => !prev)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    automation ? "bg-blue-600" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      automation ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 bg-[#0b1220] px-8 py-4">
          <div className="space-x-4 text-xs text-slate-500">
            <span>ESC to cancel</span>
            <span>ENTER to create</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              onClick={handleCreate}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium transition hover:bg-blue-700"
            >
              Create Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
