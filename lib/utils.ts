import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // Remove all non-word chars (except spaces and hyphens)
    .replace(/[\s_-]+/g, '-')      // Replace spaces and underscores with a single hyphen
    .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
}

// Resolve the inbox WebSocket endpoint from env or the current origin.
// Accepts a fully qualified URL in NEXT_PUBLIC_WS_URL (e.g. ws://localhost:5000/ws/inbox)
// and falls back to the app origin with the /ws/inbox path in the browser.
export function getInboxWsUrl(): string | undefined {
  if (typeof window === "undefined") return undefined;

  const rawEnv = process.env.NEXT_PUBLIC_WS_URL?.trim();
  const base = window.location.origin.replace(/^http/, "ws");

  // Use env value verbatim if provided (assumed full endpoint), otherwise build from origin.
  const candidate = rawEnv && rawEnv.length > 0 ? rawEnv : `${base.replace(/\/$/, "")}/ws/inbox`;

  try {
    return new URL(candidate, base).toString();
  } catch {
    return undefined;
  }
}
