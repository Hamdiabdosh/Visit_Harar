import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  email: z.string().email("Valid email required").max(200),
  subject: z.string().min(3, "Subject is required").max(200),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
