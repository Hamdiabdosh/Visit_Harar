import { sanitizeRichHtml } from "@/lib/sanitize-html";

/** Strip CMS HTML to plain text for the knowledge snapshot. */
export function htmlToText(html: string | null | undefined): string {
  if (!html?.trim()) return "";
  const sanitized = sanitizeRichHtml(html);
  return sanitized
    .replace(/<\/(p|div|h[1-6]|li|blockquote|tr)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
