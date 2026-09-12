"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/client";

import { cn } from "@/lib/utils";

const subscribeNoop = () => () => {};

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useTranslation("common");
  // Client-only flag to avoid a hydration mismatch (next-themes only knows
  // the real theme after mount) without setState-in-effect.
  const mounted = React.useSyncExternalStore(subscribeNoop, () => true, () => false);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("toggleTheme")}
      className={cn("size-8", className)}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted && resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

