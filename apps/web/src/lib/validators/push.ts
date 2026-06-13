import { z } from "zod";
import { emailSchema } from "./common";

const expoPushTokenSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^ExponentPushToken\[/, "Invalid Expo push token");

export const pushRegisterSchema = z.object({
  expo_push_token: expoPushTokenSchema,
  visitor_email: emailSchema.optional(),
  notify_bookings: z.boolean().optional(),
  notify_events: z.boolean().optional(),
  platform: z.enum(["ios", "android", "web"]).optional(),
});

export const pushUnregisterSchema = z.object({
  expo_push_token: expoPushTokenSchema,
});

export type PushRegisterInput = z.infer<typeof pushRegisterSchema>;
