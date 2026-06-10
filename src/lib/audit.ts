import { db } from "../../db/index";
import { auditLogs, user } from "../../drizzle/schema/index";
import { eq } from "drizzle-orm";
import { invalidateChatKnowledgeCache } from "@/lib/chat/knowledge-cache";

const KNOWLEDGE_MODULES = new Set([
  "attractions",
  "guides",
  "pages",
  "announcements",
  "contact",
  "hero",
  "gallery",
  "settings",
]);

export type AuditParams = {
  userId?: string | null;
  module: string;
  action: string;
  recordId?: string;
  recordTitle?: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
};

export function auditSnap<T extends object>(obj: T): Record<string, unknown> {
  return JSON.parse(JSON.stringify(obj)) as Record<string, unknown>;
}

export function fireAudit(params: AuditParams): void {
  if (KNOWLEDGE_MODULES.has(params.module)) {
    invalidateChatKnowledgeCache();
  }
  void logAction(params).catch(() => undefined);
}

export async function logAction(params: AuditParams): Promise<void> {
  try {
    let userName: string | null = null;
    let userEmail: string | null = null;
    if (params.userId) {
      const [u] = await db
        .select({ name: user.name, email: user.email })
        .from(user)
        .where(eq(user.id, params.userId))
        .limit(1);
      userName = u?.name ?? null;
      userEmail = u?.email ?? null;
    }

    await db.insert(auditLogs).values({
      userId: params.userId ?? null,
      userName,
      userEmail,
      module: params.module,
      action: params.action,
      recordId: params.recordId ?? null,
      recordTitle: params.recordTitle ?? null,
      before: params.before ?? null,
      after: params.after ?? null,
    });
  } catch (err) {
    console.error("[audit]", err);
  }
}
