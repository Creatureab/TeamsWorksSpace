"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, CheckCircle2, Copy, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { TemplateAgentResponse } from "@/types/template-agent";

type AgentResultProps = {
  result?: TemplateAgentResponse | null;
  isLoading: boolean;
  error?: string | null;
};

export default function AgentResult({ result, isLoading, error }: AgentResultProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [result?.implementationPrompt]);

  const handleCopy = async () => {
    if (!result?.implementationPrompt) return;
    try {
      await navigator.clipboard.writeText(result.implementationPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Generating tailored instructions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-800/50 dark:bg-rose-900/30 dark:text-rose-100">
        <AlertTriangle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/40 p-8 text-center text-sm text-muted-foreground">
        Describe your project below to get a tailored setup prompt for the selected template.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border border-primary/20 bg-white/90 shadow-sm backdrop-blur dark:bg-background">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">
              Why this template
            </CardTitle>
          </div>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
            {result.templateId}
          </span>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-foreground">
          {result.reason}
        </CardContent>
      </Card>

      <Card className="border bg-white/90 shadow-sm backdrop-blur dark:bg-background">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-semibold">
            Implementation prompt
          </CardTitle>
          <Button
            variant={copied ? "secondary" : "outline"}
            size="sm"
            className="gap-2"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </CardHeader>
        <CardContent>
          <pre className="max-h-72 overflow-y-auto rounded-lg bg-muted/70 p-4 text-sm leading-relaxed text-foreground">
            {result.implementationPrompt}
          </pre>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border bg-white/90 shadow-sm backdrop-blur dark:bg-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Quick steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-6">
            {result.quickSteps.map((step, index) => (
              <div key={step} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                <span className="text-muted-foreground">{index + 1}. {step}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border bg-white/90 shadow-sm backdrop-blur dark:bg-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Customizations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-6">
            {result.customizations.map((item) => (
              <div key={item} className="flex items-start gap-2">
                <Separator orientation="vertical" className="h-5 bg-primary/60" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
