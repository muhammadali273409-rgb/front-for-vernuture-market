import type { Metadata } from "next";
import { Logo } from "@/components/shared/logo";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { AuthHeroInteractive } from "@/components/auth/auth-hero-interactive";
import { getT, getServerLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("auth");
  return {
    title: {
      default: t("loginTitle"),
      template: "%s · VentureMarket",
    },
    description: t("hero.description"),
  };
}

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();
  const t = await getT("auth", locale);

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background selection:bg-blue-500 selection:text-white">
      {/* LEFT SIDE: Brand Hero Showcase (Visible on Desktop / Large screens) */}
      <div className="relative hidden w-full lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between overflow-hidden bg-slate-100 border-r border-border/80 text-foreground dark:bg-slate-950 dark:border-white/10 dark:text-white p-10 xl:p-14">
        {/* Architectural Skyscraper Background Image with clear visibility in both light and dark modes */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105 opacity-40 dark:opacity-40"
          style={{
            backgroundImage: "url('/images/auth-bg.jpg')",
          }}
        />

        {/* Cinematic Gradient Overlays (preserves background skyscraper while ensuring high text contrast) */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-100/90 via-slate-100/60 to-slate-100/30 dark:from-slate-950 dark:via-slate-950/80 dark:to-slate-950/50" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-100/90 via-slate-100/50 to-transparent dark:from-slate-950/90 dark:via-slate-950/40 dark:to-transparent" />

        {/* Top Header inside Hero Panel */}
        <div className="relative z-30 flex items-center justify-between">
          <Logo size="lg" />
          <div className="flex items-center gap-2">
            <LanguageSwitcher className="text-foreground hover:bg-black/5 dark:text-white dark:hover:text-white/90 dark:hover:bg-white/10 backdrop-blur-md rounded-xl" />
            <ThemeToggle className="text-foreground hover:bg-black/5 dark:text-white dark:hover:text-white/90 dark:hover:bg-white/10 backdrop-blur-md rounded-xl" />
          </div>
        </div>

        {/* Center & Bottom: Interactive 2026 Hero Showcase */}
        <AuthHeroInteractive
          titleLine1={t("hero.titleLine1")}
          titleLine2={t("hero.titleLine2")}
          titleLine3={t("hero.titleLine3")}
          description={t("hero.description")}
          featureSecure={t("hero.featureSecure")}
          featureCommunity={t("hero.featureCommunity")}
          featureFast={t("hero.featureFast")}
          marketLive={t("hero.marketLive")}
          activeDeals={t("hero.activeDeals")}
          dealflow={t("hero.dealflow")}
          saasMna={t("hero.saasMna")}
          revenueMultiple={t("hero.revenueMultiple")}
          verified={t("hero.verified")}
          buyerOffer={t("hero.buyerOffer")}
          loiAmount={t("hero.loiAmount")}
        />
      </div>

      {/* RIGHT SIDE: Auth Card Container with 2026 cyber grid & ambient lighting */}
      <div className="relative flex min-h-screen flex-1 flex-col items-center justify-center p-4 sm:p-8 lg:p-12 bg-white dark:bg-background overflow-hidden">
        {/* Ambient Subtle Background Dots & Glow */}
        <div className="pointer-events-none absolute inset-0 bg-cyber-grid-light dark:bg-cyber-grid-dark opacity-70" />
        <div className="pointer-events-none absolute top-10 right-10 size-96 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 left-10 size-96 rounded-full bg-indigo-500/5 blur-3xl" />

        {/* Mobile-only header with logo and controls */}
        <div className="relative z-20 mb-6 flex w-full max-w-[440px] items-center justify-between lg:hidden">
          <Logo size="md" />
          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className="relative z-20 w-full flex justify-center perspective-1000">
          {children}
        </div>

        {/* Bottom Tagline & Mini Brand Bar */}
        <div className="relative z-20 mt-8 text-center text-xs text-muted-foreground">
          <p className="font-semibold tracking-wider text-foreground">
            VentureMarket · <span className="text-blue-600 dark:text-blue-400">{t("footer.tagline")}</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{t("footer.copyright", { year: 2026 })}</p>
        </div>
      </div>
    </div>
  );
}


