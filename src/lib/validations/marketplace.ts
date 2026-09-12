import { z } from "zod";

export const searchListingsSchema = z.object({
  categoryId: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minMrr: z.coerce.number().nonnegative().optional(),
  verified: z.coerce.boolean().optional(),
  country: z.string().optional(),
  sortBy: z.enum(["createdAt", "price", "mrr"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  cursor: z.string().optional(),
});
export type SearchListingsValues = z.infer<typeof searchListingsSchema>;
