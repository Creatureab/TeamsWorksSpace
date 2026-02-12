"use client";

import { useState } from "react";
import { Rocket } from "lucide-react";

const CreateProjectModal = () => { 
  const [automation, setAutomation] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-[900px] overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] text-white shadow-2xl">
        <div className="relative h-40 bg-gray-200">
          <div className="absolute -bottom-6 left-6 flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-[#1e293b] shadow-lg">
            <Rocket className="h-6 w-6 text-blue-500" />
          </div>
        </div>

        <div className="px-8 pb-6 pt-10">
          <p className="mb-2 text-xs text-blue-400">
            CREATING IN : <span className="underline">ACME WORKSPACE</span>
          </p>

          <h1 className="mb-2 text-3xl font-semibold">Untitled Project</h1>

          <p className="mb-8 text-slate-400">Add a description or project goals...</p>

          <div className="my-8 border-t border-white/10" />

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Project Privacy</label>
              <select className="w-full rounded-lg border border-white/10 bg-[#1e293b] px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Workspace (Visible to everyone)</option>
                <option>Private (Only you)</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Automations</label>
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#1e293b] px-4 py-2">
                <span className="text-sm text-slate-400">Default templates</span>

                <button
                  type="button"
                  onClick={() => setAutomation(!automation)}
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

        <div className="flex items-center justify-between border-t border-white/10 bg-[#0b1220] px-8 py-4">
          <div className="space-x-4 text-xs text-slate-500">
            <span>ESC to cancel</span>
            <span>ENTER to create</span>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="button"
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
export default CreateProjectModal;