import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getKnowledgeSnapshot } from "@/lib/chat/knowledge-cache";
import { chatCompletion, isChatConfigured } from "@/lib/chat/openrouter";
import { buildSystemPrompt } from "@/lib/chat/prompts";
import { createError, isAppError } from "@/lib/errors";
import { sendChatInputSchema } from "@/lib/validators/chat";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

function checkRateLimit(ip: string): void {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    throw createError(
      "VALIDATION_ERROR",
      "Too many messages. Please wait a moment and try again.",
    );
  }
  entry.count += 1;
}

export const getChatEnabled = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ enabled: boolean }> => {
    return { enabled: isChatConfigured() };
  },
);

export const sendChatMessage = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => sendChatInputSchema.parse(raw))
  .handler(async ({ data }): Promise<{ reply: string }> => {
    try {
      if (!isChatConfigured()) {
        throw createError("INTERNAL", "Chat is not configured.");
      }

      const request = getRequest();
      checkRateLimit(getClientIp(request));

      const snapshot = await getKnowledgeSnapshot();
      const systemPrompt = buildSystemPrompt(snapshot.text, data.pageContext);

      const reply = await chatCompletion([
        { role: "system", content: systemPrompt },
        ...data.messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ]);

      return { reply };
    } catch (err) {
      if (isAppError(err)) throw err;
      throw createError(
        "INTERNAL",
        err instanceof Error ? err.message : "Failed to send message",
      );
    }
  });
