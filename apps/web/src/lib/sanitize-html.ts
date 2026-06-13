import sanitizeHtml from "sanitize-html";

const CMS_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "h2",
    "h3",
    "h4",
    "ul",
    "ol",
    "li",
    "a",
    "blockquote",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
  },
};

/** Sanitize CMS HTML for safe dangerouslySetInnerHTML (no jsdom — low memory at build/runtime). */
export function sanitizeRichHtml(html: string): string {
  return sanitizeHtml(html ?? "", CMS_OPTIONS);
}
