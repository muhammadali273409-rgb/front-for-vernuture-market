import { z } from "zod";

export const offerSchema = z.object({
  amount: z.coerce.number().positive("validation:amountGreaterThanZero"),
  currency: z.string().length(3),
  terms: z.string().max(4000).optional().or(z.literal("")),
});
export type OfferValues = {
  amount: number;
  currency: string;
  terms?: string;
};

export const MESSAGE_MAX_LENGTH = 5000;

export const messageSchema = z.object({
  // Mirrors the backend (MESSAGE_MAX_LENGTH): trimmed, 1–5000 characters.
  body: z.string().trim().min(1, "validation:messageRequired").max(MESSAGE_MAX_LENGTH, "validation:messageTooLong"),
});
export type MessageValues = z.infer<typeof messageSchema>;
