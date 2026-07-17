/**
 * ponytail: assert-based self-check for toMediaSrc / pickListImageUrl.
 * Run: bun apps/web/src/lib/media-url.selfcheck.ts
 */
import { pickListImageUrl, toMediaSrc } from "./media-url";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const abs =
  "https://visitharar.et/uploads/visit-harar/media/1784221478120-33922-thumb.webp";
const mangled =
  "/admin/https:/visitharar.et/uploads/visit-harar/media/1784221478120-33922-thumb.webp?denied=false";
const expected =
  "/uploads/visit-harar/media/1784221478120-33922-thumb.webp";

assert(toMediaSrc(abs) === expected, `abs → ${toMediaSrc(abs)}`);
assert(toMediaSrc(mangled) === expected, `mangled → ${toMediaSrc(mangled)}`);
assert(toMediaSrc(expected) === expected, "relative passthrough");
assert(
  pickListImageUrl(abs.replace("-thumb", ""), abs) === expected,
  "pickList prefers thumb",
);

console.log("media-url.selfcheck: ok");
