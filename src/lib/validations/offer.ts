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

export const messageSchema = z.object({
  body: z.string().min(1, "validation:messageRequired").max(8000),
});
export type MessageValues = z.infer<typeof messageSchema>;
