import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "validation:emailRequired").email("validation:invalidEmail"),
  password: z.string().min(1, "validation:passwordRequired"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().max(80).optional().or(z.literal("")),
    lastName: z.string().max(80).optional().or(z.literal("")),
    email: z.string().min(1, "validation:emailRequired").email("validation:invalidEmail"),
    password: z
      .string()
      .min(1, "validation:passwordRequired")
      .max(128, "validation:passwordTooLong"),
    confirmPassword: z.string().min(1, "validation:confirmPasswordRequired"),
    role: z.enum(["BUYER", "SELLER"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "validation:passwordsDoNotMatch",
    path: ["confirmPassword"],
  });
export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "validation:emailRequired").email("validation:invalidEmail"),
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(1, "validation:passwordRequired").max(128),
    confirmPassword: z.string().min(1, "validation:confirmPasswordRequired"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "validation:passwordsDoNotMatch",
    path: ["confirmPassword"],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
