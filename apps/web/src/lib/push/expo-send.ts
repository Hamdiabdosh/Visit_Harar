/** Send notifications via the Expo Push API. */

export type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  sound?: "default" | null;
};

type ExpoPushTicket = {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
};

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export async function sendExpoPushMessages(
  messages: ExpoPushMessage[],
): Promise<void> {
  if (!messages.length) return;

  const accessToken = process.env.EXPO_ACCESS_TOKEN?.trim();
  const headers: Record<string, string> = {
    accept: "application/json",
    "content-type": "application/json",
  };
  if (accessToken) {
    headers.authorization = `Bearer ${accessToken}`;
  }

  // Expo accepts up to 100 messages per request.
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(chunk),
      });
      if (!res.ok) {
        console.error("[push] Expo API HTTP", res.status, await res.text());
        continue;
      }
      const json = (await res.json()) as { data?: ExpoPushTicket[] };
      for (const ticket of json.data ?? []) {
        if (ticket.status === "error") {
          console.error("[push] ticket error:", ticket.message, ticket.details);
        }
      }
    } catch (err) {
      console.error("[push] send failed:", err);
    }
  }
}

export function isExpoPushConfigured(): boolean {
  // Works without EXPO_ACCESS_TOKEN; token improves reliability at scale.
  return true;
}
