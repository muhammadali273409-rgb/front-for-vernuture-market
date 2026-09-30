"use client";

import { ArrowRight, Briefcase, Check, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/client";
import { cn } from "@/lib/utils";
import type { PublicRole } from "@/lib/auth/intended-role";

/**
 * The two public roles. ADMIN is intentionally not representable here —
 * it can't be picked anywhere in the public flow, and the backend rejects
 * it on registration regardless of what a client sends.
 */
const ROLES: {
  role: PublicRole;
  icon: typeof ShoppingCart;
  key: "buyer" | "seller";
}[] = [
  { role: "BUYER", icon: ShoppingCart, key: "buyer" },
  { role: "SELLER", icon: Briefcase, key: "seller" },
];

const FEATURE_COUNT = 5;

interface RoleChoiceCardsProps {
  selected: PublicRole | null;
  onSelect: (role: PublicRole) => void;
  /** Full cards (landing): feature list + a CTA. Compact (register form): title + tagline only. */
  variant?: "full" | "compact";
  /** Full variant only: called by the card's CTA. */
  onContinue?: (role: PublicRole) => void;
  disabled?: boolean;
}

export function RoleChoiceCards({
  selected,
  onSelect,
  variant = "full",
  onContinue,
  disabled,
}: RoleChoiceCardsProps) {
  const { t } = useTranslation("auth");
  const compact = variant === "compact";

  return (
    <div
      role="radiogroup"
      aria-label={t("roleChoice.question")}
      className={cn("grid gap-3", compact ? "grid-cols-2" : "gap-4 sm:grid-cols-2")}
    >
      {ROLES.map(({ role, icon: Icon, key }) => {
        const isSelected = selected === role;
        return (
          <div
            key={role}
            role="radio"
            aria-checked={isSelected}
            tabIndex={disabled ? -1 : 0}
            onClick={() => !disabled && onSelect(role)}
            onKeyDown={(e) => {
              if (disabled) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(role);
              }
            }}
            className={cn(
              "group relative flex cursor-pointer flex-col rounded-2xl border bg-card text-left outline-none transition-all duration-200",
              "hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary/50",
              compact ? "gap-1.5 p-3" : "gap-4 p-6",
              isSelected
                ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/40"
                : "border-border/80",
              disabled && "pointer-events-none opacity-60",
            )}
          >
            {isSelected && (
              <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3" />
              </span>
            )}

            <span
              className={cn(
                "flex items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15",
                compact ? "size-8" : "size-12",
              )}
            >
              <Icon className={compact ? "size-4" : "size-6"} />
            </span>

            <div className="space-y-1">
              <p className={cn("font-bold text-foreground", compact ? "text-sm" : "text-lg")}>
                {t(`roleChoice.${key}.title`)}
              </p>
              <p className={cn("text-muted-foreground", compact ? "text-[11px] leading-snug" : "text-sm")}>
                {t(`roleChoice.${key}.tagline`)}
              </p>
            </div>

            {!compact && (
              <>
                <ul className="space-y-1.5 text-sm text-foreground/80">
                  {Array.from({ length: FEATURE_COUNT }, (_, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="size-3.5 shrink-0 text-primary" />
                      {t(`roleChoice.${key}.features.${i + 1}`)}
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  className="mt-auto w-full font-semibold"
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(role);
                    onContinue?.(role);
                  }}
                >
                  {t(`roleChoice.${key}.cta`)}
                  <ArrowRight className="size-4" />
                </Button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
