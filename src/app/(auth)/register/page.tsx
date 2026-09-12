import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthFormCard } from "@/components/auth/auth-form-card";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("auth");
  return {
    title: t("registerTitle"),
    description: t("registerSubtitle"),
  };
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="h-96 w-full max-w-[440px] animate-pulse rounded-2xl bg-muted" />}>
      <AuthFormCard initialTab="register" />
    </Suspense>
  );
}
