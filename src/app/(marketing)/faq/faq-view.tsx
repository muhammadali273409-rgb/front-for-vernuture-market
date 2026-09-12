"use client";

import * as React from "react";
import Link from "next/link";
import { HelpCircle, ChevronDown, ShieldCheck, DollarSign, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/client";
import { cn } from "@/lib/utils";

const FAQ_CATEGORIES = [
  { key: "buyers", icon: ShieldCheck, items: ["verifyData", "offerAccepted", "escrow"] },
  { key: "sellers", icon: DollarSign, items: ["cost", "confidential", "transferAssets"] },
  { key: "legal", icon: Lock, items: ["aiAudit", "apa"] },
] as const;

export function FaqView() {
  const { t } = useTranslation("faq");
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({
    "buyers-verifyData": true,
    "sellers-cost": true,
  });

  function toggle(id: string) {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <HelpCircle className="size-3.5" />
          <span>{t("eyebrow")}</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{t("title")}</h1>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="mt-12 space-y-10">
        {FAQ_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.key} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                <Icon className="size-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">{t(`categories.${cat.key}.title`)}</h2>
              </div>

              <div className="space-y-3">
                {cat.items.map((item) => {
                  const id = `${cat.key}-${item}`;
                  const isOpen = openItems[id];

                  return (
                    <Card key={item} className="border border-border/80 bg-card overflow-hidden">
                      <button
                        onClick={() => toggle(id)}
                        className="flex w-full items-center justify-between p-4 text-left font-semibold text-sm text-foreground hover:bg-muted/10 transition-colors"
                      >
                        <span>{t(`categories.${cat.key}.items.${item}.q`)}</span>
                        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
                      </button>
                      {isOpen && (
                        <CardContent className="px-4 pb-4 pt-0 text-xs leading-relaxed text-muted-foreground border-t border-border/40">
                          <p className="pt-3">{t(`categories.${cat.key}.items.${item}.a`)}</p>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-16 rounded-xl border border-border/80 bg-muted/20 p-8 text-center space-y-3">
        <h3 className="text-base font-bold text-foreground">{t("stillHaveQuestionsTitle")}</h3>
        <p className="text-xs text-muted-foreground">{t("stillHaveQuestionsDescription")}</p>
        <Button asChild size="sm" className="font-semibold text-xs mt-2">
          <Link href="/marketplace">{t("exploreActiveDeals")}</Link>
        </Button>
      </div>
    </div>
  );
}
