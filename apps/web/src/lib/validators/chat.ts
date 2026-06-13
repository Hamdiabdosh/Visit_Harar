import { z } from "zod";

export const chatPageTypeSchema = z.enum([
  "home",
  "attraction",
  "guide",
  "news",
  "static",
  "book",
  "gallery",
  "other",
]);

export const chatPageContextSchema = z.object({
  pathname: z.string().min(1).max(500),
  pageType: chatPageTypeSchema,
  entitySlug: z.string().max(200).optional(),
  entityTitle: z.string().max(300).optional(),
});

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

export const sendChatInputSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(20),
  pageContext: chatPageContextSchema,
});

export type ChatPageContext = z.infer<typeof chatPageContextSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type SendChatInput = z.infer<typeof sendChatInputSchema>;
