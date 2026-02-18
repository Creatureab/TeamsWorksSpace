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
