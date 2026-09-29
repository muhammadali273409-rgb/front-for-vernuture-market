import { apiFetch } from "@/lib/api/client";

export interface BusinessInquiryInput {
  name: string;
  email: string;
  company: string;
  message: string;
}

export const salesApi = {
  // NOT IN SWAGGER: no /leads/* path exists anywhere in the backend's OpenAPI
  // spec (confirmed against the full spec, 76 paths, none under /leads). This
  // call will 404 against https://venture-market.onrender.com. Needs a real
  // endpoint from the backend team — left in place rather than guessed at.
  submitInquiry: (input: BusinessInquiryInput) =>
    apiFetch<{ success: boolean }>("/leads/business", {
      method: "POST",
      body: input,
    }),
};
