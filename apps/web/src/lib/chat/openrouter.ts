import { getServerConfig } from "@/lib/config.server";
import { createError } from "@/lib/errors";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenRouterResponse = {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
};

export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  const { openRouterApiKey, appUrl } = getServerConfig();

  if (!openRouterApiKey) {
    throw createError("INTERNAL", "Chat is not configured.");
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": appUrl ?? "https://visitharar.et",
        "X-Title": "Visit Harar",
      },
      body: JSON.stringify({ messages }),
    },
  );

  if (!response.ok) {
    const body = (await response
      .json()
      .catch(() => ({}))) as OpenRouterResponse;
    throw createError(
      "INTERNAL",
      body.error?.message ?? `OpenRouter request failed (${response.status})`,
    );
  }

  const data = (await response.json()) as OpenRouterResponse;
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw createError("INTERNAL", "Empty response from chat provider.");
  }
  return content;
}

export function isChatConfigured(): boolean {
  return Boolean(getServerConfig().openRouterApiKey);
}
