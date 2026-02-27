"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  PanelLeftOpen,
  PanelLeftClose,
  Send,
  Sparkles,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TemplatePreview from "@/components/TemplatePreview";
import AgentResult from "@/components/AgentResult";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { templates, type Template } from "@/lib/templates";
import type { TemplateAgentResponse } from "@/types/template-agent";

type AgentState = {
  loading: boolean;
  error: string | null;
  result: TemplateAgentResponse | null;
};

export default function TemplatesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"preview" | "agent">("preview");
  const [selectedId, setSelectedId] = useState<string | undefined>(
    templates[0]?.id
  );
  const [projectDescription, setProjectDescription] = useState("");
  const [agentState, setAgentState] = useState<AgentState>({
    loading: false,
    error: null,
    result: null,
  });

  const filteredTemplates = useMemo(() => {
    const query = search.trim().toLowerCase();
    return templates.filter((template) => {
      if (!query) return true;
      return (
        template.title.toLowerCase().includes(query) ||
        template.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }, [search]);

  const selectedTemplate: Template | undefined =
    templates.find((template) => template.id === selectedId) ??
    filteredTemplates[0] ??
    templates[0];

  useEffect(() => {
    if (!filteredTemplates.length) return;
    if (!selectedId || !filteredTemplates.some((t) => t.id === selectedId)) {
      setSelectedId(filteredTemplates[0].id);
    }
  }, [filteredTemplates, selectedId]);

  const handleSubmit = async () => {
    if (!selectedTemplate || !projectDescription.trim()) {
      setAgentState((prev) => ({
        ...prev,
        error: "Please select a template and describe your project.",
      }));
      setActiveTab("agent");
      return;
    }

    setAgentState({ loading: true, error: null, result: null });
    setActiveTab("agent");

    try {
      const response = await fetch("/api/template-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          templateTitle: selectedTemplate.title,
          description: projectDescription.trim(),
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          payload?.error ||
          "Unable to generate instructions. Please try again in a moment.";
        setAgentState({ loading: false, error: message, result: null });
        return;
      }

      const valid =
        payload &&
        typeof payload.templateId === "string" &&
        typeof payload.reason === "string" &&
        typeof payload.implementationPrompt === "string" &&
        Array.isArray(payload.quickSteps) &&
        Array.isArray(payload.customizations);

      if (!valid) {
        setAgentState({
          loading: false,
          error: "Unexpected response format from the agent.",
          result: null,
        });
        return;
      }

      setAgentState({
        loading: false,
        error: null,
        result: payload as TemplateAgentResponse,
      });
      setActiveTab("agent");
    } catch (error) {
      console.error("template-agent", error);
      setAgentState({
        loading: false,
        error: "Something went wrong. Check your connection and try again.",
        result: null,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-foreground dark:bg-background">
      <div className="flex min-h-screen">
        <Sidebar
          templates={filteredTemplates}
          selectedId={selectedTemplate?.id}
          search={search}
          onSearch={setSearch}
          onSelect={(id) => {
            setSelectedId(id);
            setActiveTab("preview");
          }}
        />

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-white/80 px-4 py-3 backdrop-blur dark:bg-background/80 md:hidden">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen((open) => !open)}
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="h-5 w-5" />
                ) : (
                  <PanelLeftOpen className="h-5 w-5" />
                )}
              </Button>
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  Templates
                </p>
                <p className="text-sm font-semibold">
                  {selectedTemplate?.title ?? "Choose a template"}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">
              Notion-style agent
            </span>
          </header>

          {sidebarOpen && (
            <div className="md:hidden">
              <Sidebar
                templates={filteredTemplates}
                selectedId={selectedTemplate?.id}
                search={search}
                onSearch={setSearch}
                onSelect={(id) => {
                  setSelectedId(id);
                  setSidebarOpen(false);
                  setActiveTab("preview");
                }}
              />
            </div>
          )}

          <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
            <div className="mx-auto max-w-6xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                    Template Agent
                  </p>
                  <h1 className="text-2xl font-semibold leading-7">
                    Notion-style template library with AI setup
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    App Router
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                    Tailwind CSS
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100">
                    Production-ready
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border bg-white/80 p-4 shadow-sm ring-1 ring-border/80 backdrop-blur dark:bg-background">
                <Tabs
                  value={activeTab}
                  onValueChange={(value) =>
                    setActiveTab(value as "preview" | "agent")
                  }
                >
                  <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/70 p-1">
                    <TabsTrigger value="preview">Template Preview</TabsTrigger>
                    <TabsTrigger value="agent">AI Agent Setup</TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview" className="pt-4">
                    <TemplatePreview template={selectedTemplate} />
                  </TabsContent>
                  <TabsContent value="agent" className="pt-4">
                    <AgentResult
                      result={agentState.result}
                      isLoading={agentState.loading}
                      error={agentState.error}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </main>

          <div className="sticky bottom-0 z-30 border-t bg-white/90 px-4 py-4 backdrop-blur dark:bg-background/90">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 rounded-2xl border bg-muted/60 p-4 shadow-sm ring-1 ring-border/70 dark:bg-background">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Agent input
                </div>
                <span className="text-xs text-muted-foreground">
                  Selected: {selectedTemplate?.title}
                </span>
              </div>
              <Textarea
                value={projectDescription}
                onChange={(event) => setProjectDescription(event.target.value)}
                placeholder="Describe your project, goal, constraints, and tech stack..."
                className="min-h-[90px] resize-none rounded-xl border bg-white/90 text-sm focus-visible:ring-primary/60"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  The agent returns a Claude-powered JSON playbook and switches
                  to the AI tab automatically.
                </p>
                <Button
                  onClick={handleSubmit}
                  disabled={agentState.loading}
                  className="gap-2 rounded-full px-4"
                >
                  {agentState.loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send to Agent
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
