import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export function createContentHash(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function slugify(input: string): string {
  const value = input
    .trim()
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return value || "edition";
}

export function stripHtml(input: string): string {
  return input
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateText(input: string, maxLength: number): string {
  if (input.length <= maxLength) {
    return input;
  }

  return `${input.slice(0, maxLength).trimEnd()}…`;
}

export function formatDate(input: string, locale: string, timeZone?: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "short",
    timeZone
  }).format(new Date(input));
}

export function formatDateShort(input: string, locale: string, timeZone?: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone
  }).format(new Date(input));
}

export function extractCoverImage(html: string): string | null {
  const matches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map(
    (match) => match[1]
  );

  const httpsImage = matches.find((url) => url.startsWith("https://"));
  return httpsImage ?? matches[0] ?? null;
}

export async function ensureDirectory(filePath: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
}

export async function writeTextFile(filePath: string, content: string): Promise<void> {
  await ensureDirectory(filePath);
  await writeFile(filePath, content, "utf8");
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await writeTextFile(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

export function getPreferredSlug(link: string, fallbackTitle: string): string {
  try {
    const url = new URL(link);
    const segments = url.pathname.split("/").filter(Boolean);
    const last = segments.at(-1);

    if (last) {
      return slugify(last);
    }
  } catch {
    // Fall back to title slug when link is missing or invalid.
  }

  return slugify(fallbackTitle);
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
