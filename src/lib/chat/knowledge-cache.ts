import { buildSiteKnowledgeSnapshot } from "./knowledge-snapshot";

const CACHE_TTL_MS = 5 * 60_000;

export type KnowledgeSnapshot = {
  text: string;
  tokenEstimate: number;
  builtAt: number;
};

let cached: KnowledgeSnapshot | null = null;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export async function getKnowledgeSnapshot(): Promise<KnowledgeSnapshot> {
  const now = Date.now();
  if (cached && now - cached.builtAt < CACHE_TTL_MS) {
    return cached;
  }
  const text = await buildSiteKnowledgeSnapshot();
  cached = {
    text,
    tokenEstimate: estimateTokens(text),
    builtAt: now,
  };
  return cached;
}

export function invalidateChatKnowledgeCache(): void {
  cached = null;
}
