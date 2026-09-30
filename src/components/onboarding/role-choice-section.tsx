"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoleChoiceCards } from "@/components/onboarding/role-choice-cards";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useTranslation } from "@/i18n/client";
import { homePathForRole, isSellerRole } from "@/lib/auth/roles";
import { rememberIntendedRole, useIntendedRole, type PublicRole } from "@/lib/auth/intended-role";

/**
 * Landing-page onboarding: "How do you want to use VentureMarket?".
 * Signed-out visitors pick Buyer or Seller and continue to registration.
 * Signed-in users are never asked again — their role comes from the
 * backend user record, and they get a link into their own workspace.
 */
export function RoleChoiceSection() {
  const { t } = useTranslation("auth");
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();
  const selected = useIntendedRole();

  function select(role: PublicRole) {
    rememberIntendedRole(role);
  }

  if (isLoading) {
    return <div className="h-72 w-full max-w-3xl animate-pulse rounded-2xl bg-muted/50" aria-hidden />;
  }

  if (user) {
    const workspace =
      user.role === "ADMIN"
        ? t("roleChoice.signedIn.admin")
        : isSellerRole(user.role)
          ? t("roleChoice.signedIn.seller")
          : t("roleChoice.signedIn.buyer");
    return (
      <div className="flex flex-col items-center gap-3">
        <Button asChild size="lg" className="h-11 px-6 text-sm font-semibold">
          <Link href={homePathForRole(user.role)}>
            {t("roleChoice.signedIn.cta", { workspace })}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl space-y-5">
      <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        {t("roleChoice.question")}
      </h2>
      <RoleChoiceCards
        selected={selected}
        onSelect={select}
        onContinue={(role) => router.push(`/register?role=${role}`)}
      />
      <p className="text-sm text-muted-foreground">
        {t("roleChoice.haveAccount")}{" "}
        <Link
          href={selected ? `/login?role=${selected}` : "/login"}
          className="font-semibold text-primary hover:underline"
        >
          {t("login")}
        </Link>
      </p>
    </div>
  );
}
