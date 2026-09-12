"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/i18n/client";
import { cn } from "@/lib/utils";

interface FaqItem {
  q: string;
  a: string;
}

export function PricingFaq() {
  const { t } = useTranslation("pricing");
  const items = t("faq.items", { returnObjects: true }) as FaqItem[];
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">{t("faq.title")}</h2>
      <div className="space-y-3">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <Card key={item.q} className="overflow-hidden border border-border/80 bg-card">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between p-4 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted/10"
              >
                <span>{item.q}</span>
                <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <CardContent className="border-t border-border/40 px-4 pb-4 pt-0 text-sm leading-relaxed text-muted-foreground">
                  <p className="pt-3">{item.a}</p>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
