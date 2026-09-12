import { z } from "zod";

export const createBusinessSchema = z.object({
  name: z.string().min(2, "validation:nameMinLength").max(150),
  description: z.string().max(5000).optional().or(z.literal("")),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  businessModel: z.string().max(80).optional().or(z.literal("")),
  foundedAt: z.string().optional().or(z.literal("")),
  country: z.string().max(2).optional().or(z.literal("")),
  website: z.string().url("validation:invalidUrl").optional().or(z.literal("")),
});
export type CreateBusinessValues = z.infer<typeof createBusinessSchema>;

export const listingDetailsSchema = z.object({
  headline: z.string().max(200).optional().or(z.literal("")),
  askingPrice: z.coerce.number().positive("validation:positiveAmountRequired").optional(),
  currency: z.string().length(3),
});
export type ListingDetailsValues = {
  headline?: string;
  askingPrice?: number;
  currency: string;
};

export const addMetricSchema = z.object({
  metricType: z.enum([
    "MRR",
    "ARR",
    "REVENUE",
    "EXPENSES",
    "PROFIT",
    "CUSTOMERS",
    "CHURN",
    "GROWTH",
    "TRAFFIC",
  ]),
  value: z.coerce.number().min(0, "validation:valueMustBeZeroOrGreater"),
  currency: z.string().length(3),
  period: z.string().min(1, "validation:periodRequired"),
});
export type AddMetricValues = {
  metricType: "MRR" | "ARR" | "REVENUE" | "EXPENSES" | "PROFIT" | "CUSTOMERS" | "CHURN" | "GROWTH" | "TRAFFIC";
  value: number;
  currency: string;
  period: string;
};
