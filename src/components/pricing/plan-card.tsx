"use client";

import { Check, Star, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PlanCode } from "@/types/domain";

export type PlanCardStatus = "select" | "upgrade" | "downgrade" | "switch" | "current" | "contact";

interface PlanCardProps {
  code: PlanCode;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  status: PlanCardStatus;
  ctaLabel: string;
  featured?: boolean;
  mostPopularLabel?: string;
  roleRecommendedLabel?: string | null;
  currentPlanLabel: string;
  selectedLabel: string;
  isSelected: boolean;
  isPending?: boolean;
  onSelectCard: () => void;
  onCta: () => void;
  manageAction?: { label: string; onClick: () => void } | null;
  notice?: { text: string; actionLabel: string; onAction: () => void } | null;
}

export function PlanCard({
  name,
  price,
  period,
  description,
  features,
  status,
  ctaLabel,
  featured,
  mostPopularLabel,
  roleRecommendedLabel,
  currentPlanLabel,
  selectedLabel,
  isSelected,
  isPending,
  onSelectCard,
  onCta,
  manageAction,
  notice,
}: PlanCardProps) {
  const isCurrent = status === "current";

  return (
    <Card
      className={cn(
        "relative flex flex-col border-2 border-border/70 bg-card transition-colors hover:border-primary/40",
        isCurrent && "border-success ring-2 ring-success/20",
        !isCurrent && isSelected && "border-primary ring-2 ring-primary/15",
        !isCurrent && !isSelected && featured && "border-primary/50",
      )}
    >
      {featured && !isCurrent && mostPopularLabel && (
        <div className="absolute -top-3 left-4">
          <Badge className="gap-1 bg-primary text-primary-foreground shadow-sm">
            <Star className="size-3" fill="currentColor" />
            {mostPopularLabel}
          </Badge>
        </div>
      )}

      <div
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        onClick={onSelectCard}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectCard();
          }
        }}
        className="flex flex-1 cursor-pointer flex-col gap-4 px-(--card-spacing) pt-(--card-spacing) outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-t-xl"
      >
        <div className="flex items-center justify-between gap-2 pt-1">
          <h3 className="text-lg font-bold text-foreground">{name}</h3>
          {isCurrent ? (
            <Badge variant="outline" className="gap-1 border-success/40 bg-success/10 text-success">
              <Check className="size-3" />
              {currentPlanLabel}
            </Badge>
          ) : (
            isSelected && (
              <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                <Check className="size-3.5" />
                {selectedLabel}
              </span>
            )
          )}
        </div>

        {roleRecommendedLabel && !isCurrent && (
          <Badge variant="outline" className="w-fit gap-1 border-primary/30 bg-primary/5 text-primary">
            <Sparkles className="size-3" />
            {roleRecommendedLabel}
          </Badge>
        )}

        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold tracking-tight text-foreground font-numeric">{price}</span>
          {period && <span className="text-sm font-medium text-muted-foreground">{period}</span>}
        </div>

        <p className="text-sm text-muted-foreground">{description}</p>

        <ul className="flex-1 space-y-2.5 text-sm">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="text-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2 px-(--card-spacing) pb-(--card-spacing) pt-4">
        {notice && (
          <div className="flex items-center justify-between gap-2 rounded-md bg-warning/10 px-2.5 py-2 text-xs text-warning">
            <span>{notice.text}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                notice.onAction();
              }}
              className="shrink-0 font-semibold underline underline-offset-2 hover:no-underline"
            >
              {notice.actionLabel}
            </button>
          </div>
        )}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onCta();
          }}
          disabled={isCurrent || isPending}
          variant={isCurrent ? "outline" : featured ? "default" : "outline"}
          className="h-10 w-full font-semibold"
        >
          {ctaLabel}
        </Button>
        {manageAction && (
          <Button variant="ghost" size="sm" className="h-8 w-full text-xs font-medium" onClick={manageAction.onClick}>
            {manageAction.label}
          </Button>
        )}
      </div>
    </Card>
  );
}
