"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/client";
import { formatDate } from "@/i18n/format";
import type { Locale } from "@/i18n/settings";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  useSubscription,
  useSelectFreePlan,
  useResumeSubscription,
} from "@/hooks/use-subscription";
import { PlanCard, type PlanCardStatus } from "@/components/pricing/plan-card";
import { CancelSubscriptionDialog } from "@/components/pricing/cancel-subscription-dialog";
import { ContactSalesDialog } from "@/components/pricing/contact-sales-dialog";
import { ComparisonTable } from "@/components/pricing/comparison-table";
import { PricingFaq } from "@/components/pricing/pricing-faq";
import type { PlanCode } from "@/types/domain";

const PLAN_TIERS: {
  code: PlanCode;
  i18nKey: "free" | "buyerPro" | "sellerPro" | "business";
  slug: string;
  featured?: boolean;
}[] = [
  { code: "FREE", i18nKey: "free", slug: "free" },
  { code: "BUYER_PRO", i18nKey: "buyerPro", slug: "buyer-pro", featured: true },
  { code: "SELLER_PRO", i18nKey: "sellerPro", slug: "seller-pro" },
  { code: "BUSINESS", i18nKey: "business", slug: "business" },
];

function slugToCode(slug: string | null): PlanCode | null {
  return PLAN_TIERS.find((p) => p.slug === slug)?.code ?? null;
}

function slugForCode(code: PlanCode): string {
  return PLAN_TIERS.find((p) => p.code === code)!.slug;
}

export function PricingView() {
  const { t, i18n } = useTranslation(["pricing", "common"] as const);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: subscription } = useSubscription();
  const selectFreeMutation = useSelectFreePlan();
  const resumeMutation = useResumeSubscription();

  const [selectedUiPlan, setSelectedUiPlan] = React.useState<PlanCode | null>(null);
  const [contactSalesOpen, setContactSalesOpen] = React.useState(false);
  const [cancelDialog, setCancelDialog] = React.useState<{ open: boolean; variant: "cancel" | "downgrade" }>({
    open: false,
    variant: "cancel",
  });
  const [freeConfirmVisible, setFreeConfirmVisible] = React.useState(false);

  const handledDeepLink = React.useRef(false);

  // Preserves the plan a guest selected through the login/register round-trip
  // (see the `next=` handling in `auth-form-card.tsx`) and reopens the right
  // step once the account is confirmed — never re-asks the user to pick again.
  React.useEffect(() => {
    if (handledDeepLink.current || userLoading) return;
    const code = slugToCode(searchParams.get("plan"));
    if (!code) return;
    // Syncing local UI selection from a one-time deep-link URL param, guarded by handledDeepLink.
    setSelectedUiPlan(code); // eslint-disable-line react-hooks/set-state-in-effect

    if (!user) return;

    if (searchParams.get("confirm") === "1" && code === "FREE") {
      setFreeConfirmVisible(true);
      handledDeepLink.current = true;
      router.replace(pathname);
    }
  }, [searchParams, user, userLoading, router, pathname]);

  function planName(code: PlanCode): string {
    const tier = PLAN_TIERS.find((p) => p.code === code)!;
    return t(`plans.${tier.i18nKey}.name`);
  }

  function getCardStatus(code: PlanCode): PlanCardStatus {
    if (code === "BUSINESS") {
      return subscription?.planCode === "BUSINESS" ? "current" : "contact";
    }
    if (!user || !subscription) return "select";
    if (subscription.planCode === code) return "current";
    if (subscription.planCode === "FREE") return "upgrade";
    if (code === "FREE") return "downgrade";
    return "switch";
  }

  function ctaLabelFor(code: PlanCode, status: PlanCardStatus): string {
    const tier = PLAN_TIERS.find((p) => p.code === code)!;
    switch (status) {
      case "current":
        return t("actions.currentPlan");
      case "upgrade":
        return t("actions.upgradeTo", { plan: planName(code) });
      case "downgrade":
        return t("actions.downgradeToFree");
      case "switch":
        return t("actions.switchTo", { plan: planName(code) });
      default:
        return t(`plans.${tier.i18nKey}.cta`);
    }
  }

  function roleRecommendedLabel(code: PlanCode): string | null {
    if (user?.role === "BUYER" && code === "BUYER_PRO") return t("badges.recommendedForBuyers");
    if (user?.role === "SELLER" && code === "SELLER_PRO") return t("badges.recommendedForSellers");
    return null;
  }

  function handleCta(code: PlanCode) {
    setSelectedUiPlan(code);
    const status = getCardStatus(code);
    if (status === "current") return;

    if (code === "BUSINESS") {
      setContactSalesOpen(true);
      return;
    }

    if (code === "FREE") {
      if (!user) {
        router.push(`/register?next=${encodeURIComponent(`${pathname}?plan=free&confirm=1`)}`);
        return;
      }
      if (status === "downgrade") {
        setCancelDialog({ open: true, variant: "downgrade" });
        return;
      }
      selectFreeMutation.mutate(undefined, {
        onSuccess: () => {
          toast.success(t("toasts.planActivated", { plan: planName("FREE") }));
          setFreeConfirmVisible(true);
        },
        onError: () => toast.error(t("common:somethingWentWrong")),
      });
      return;
    }

    // BUYER_PRO / SELLER_PRO: no payment processor is connected yet, so these
    // plans are sold the same way as BUSINESS — through Sales — rather than
    // pretending to charge a card that is never actually billed.
    if (!user) {
      const next = `${pathname}?plan=${slugForCode(code)}`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    setContactSalesOpen(true);
  }

  function manageActionFor(code: PlanCode, status: PlanCardStatus) {
    if (status !== "current" || code === "FREE" || code === "BUSINESS") return null;
    return {
      label: t("actions.manageSubscription"),
      onClick: () => setCancelDialog({ open: true, variant: "cancel" }),
    };
  }

  function noticeFor(status: PlanCardStatus) {
    if (status !== "current" || !subscription?.cancelAtPeriodEnd) return null;
    const date = subscription.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd, i18n.language as Locale) : "";
    return {
      text: t("cancelDialog.pendingNotice", { date }),
      actionLabel: t("cancelDialog.resume"),
      onAction: () =>
        resumeMutation.mutate(undefined, {
          onSuccess: () => toast.success(t("cancelDialog.toastResumed")),
        }),
    };
  }

  const currentPlanCode = subscription?.planCode ?? "FREE";

  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-16 sm:px-6">
      {/* Hero */}
      <div className="mx-auto max-w-2xl space-y-5 text-center">
        <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          {t("hero.eyebrow")}
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{t("hero.title")}</h1>
        <p className="text-muted-foreground">{t("hero.subtitle")}</p>
      </div>

      {freeConfirmVisible && (
        <Alert className="mx-auto max-w-2xl border-success/30 bg-success/5">
          <CheckCircle2 className="size-4 text-success" />
          <AlertTitle>{t("freeConfirm.title")}</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>{t("freeConfirm.description")}</span>
            <Button size="sm" className="font-semibold" onClick={() => router.push("/dashboard")}>
              {t("freeConfirm.cta")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Plan cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PLAN_TIERS.map((tier) => {
          const status = getCardStatus(tier.code);
          return (
            <PlanCard
              key={tier.code}
              code={tier.code}
              name={planName(tier.code)}
              price={t(`plans.${tier.i18nKey}.price`)}
              period={t(`plans.${tier.i18nKey}.period`)}
              description={t(`plans.${tier.i18nKey}.description`)}
              features={t(`plans.${tier.i18nKey}.features`, { returnObjects: true }) as string[]}
              status={status}
              ctaLabel={ctaLabelFor(tier.code, status)}
              featured={tier.featured}
              mostPopularLabel={tier.featured ? t("badges.mostPopular") : undefined}
              roleRecommendedLabel={roleRecommendedLabel(tier.code)}
              currentPlanLabel={t("badges.currentPlan")}
              selectedLabel={t("badges.selected")}
              isSelected={selectedUiPlan === tier.code}
              isPending={selectFreeMutation.isPending && tier.code === "FREE"}
              onSelectCard={() => setSelectedUiPlan(tier.code)}
              onCta={() => handleCta(tier.code)}
              manageAction={manageActionFor(tier.code, status)}
              notice={noticeFor(status)}
            />
          );
        })}
      </div>

      <ComparisonTable />
      <PricingFaq />

      <ContactSalesDialog open={contactSalesOpen} onOpenChange={setContactSalesOpen} />

      <CancelSubscriptionDialog
        open={cancelDialog.open}
        onOpenChange={(open) => setCancelDialog((s) => ({ ...s, open }))}
        variant={cancelDialog.variant}
        planName={planName(currentPlanCode)}
        periodEndDate={subscription?.currentPeriodEnd ?? null}
      />
    </div>
  );
}
