import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().max(80).optional().or(z.literal("")),
  lastName: z.string().max(80).optional().or(z.literal("")),
  bio: z.string().max(2000).optional().or(z.literal("")),
  country: z.string().max(2).optional().or(z.literal("")),
  company: z.string().max(200).optional().or(z.literal("")),
  website: z.string().url("validation:invalidUrl").optional().or(z.literal("")),
  timezone: z.string().max(80).optional().or(z.literal("")),
});
export type ProfileValues = z.infer<typeof profileSchema>;
