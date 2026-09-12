import { apiFetch } from "@/lib/api/client";

export interface BusinessInquiryInput {
  name: string;
  email: string;
  company: string;
  message: string;
}

export const salesApi = {
  submitInquiry: (input: BusinessInquiryInput) =>
    apiFetch<{ success: boolean }>("/leads/business", {
      method: "POST",
      body: input,
    }),
};
