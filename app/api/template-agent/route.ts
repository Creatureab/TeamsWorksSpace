import { NextResponse } from "next/server";
import { z } from "zod";
import type { TemplateAgentResponse } from "@/types/template-agent";

const requestSchema = z.object({
  templateId: z.string().min(1),
  description: z.string().min(6),
  templateTitle: z.string().optional(),
});

const responseSchema = z.object({
  templateId: z.string(),
  reason: z.string(),
  implementationPrompt: z.string(),
  quickSteps: z.array(z.string()),
  customizations: z.array(z.string()),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing ANTHROPIC_API_KEY" },
      { status: 500 }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { templateId, description, templateTitle } = parsed.data;

  const systemPrompt = [
    "You are a Notion-style Template Agent for Next.js teams.",
    "Return ONLY valid JSON matching the schema:",
    "{ templateId, reason, implementationPrompt, quickSteps, customizations }.",
    "Values must be concise and actionable. Keep implementationPrompt under 1800 characters.",
    "Do not include markdown, bullet markers, or additional keys.",
  ].join(" ");

  try {
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      cache: "no-store",
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        temperature: 0.4,
        system: systemPrompt,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Template ID: ${templateId}\nTemplate title: ${templateTitle ?? "N/A"}\nProject description: ${description}`,
              },
            ],
          },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      const detail = await anthropicResponse.text();
      return NextResponse.json(
        { error: "Upstream model error", detail },
        { status: anthropicResponse.status }
      );
    }

    const message = await anthropicResponse.json();
    const contentText = message?.content?.[0]?.text;

    if (typeof contentText !== "string") {
      return NextResponse.json(
        { error: "Invalid response format from model" },
        { status: 502 }
      );
    }

    let parsedModelJson: unknown;
    try {
      parsedModelJson = JSON.parse(contentText);
    } catch {
      return NextResponse.json(
        { error: "Model response was not valid JSON" },
        { status: 502 }
      );
    }

    const validated = responseSchema.safeParse(parsedModelJson);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Model payload failed validation", details: validated.error.flatten() },
        { status: 502 }
      );
    }

    const body: TemplateAgentResponse = validated.data;
    return NextResponse.json(body);
  } catch (error) {
    console.error("[TEMPLATE_AGENT]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
