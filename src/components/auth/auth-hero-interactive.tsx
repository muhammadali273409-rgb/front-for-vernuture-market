"use client";

import * as React from "react";
import { ShieldCheck, Users, Zap, TrendingUp, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/i18n/client";

interface AuthHeroInteractiveProps {
  titleLine1?: string;
  titleLine2?: string;
  titleLine3?: string;
  description?: string;
  featureSecure?: string;
  featureCommunity?: string;
  featureFast?: string;
  marketLive?: string;
  activeDeals?: string;
  dealflow?: string;
  saasMna?: string;
  revenueMultiple?: string;
  verified?: string;
  buyerOffer?: string;
  loiAmount?: string;
}

export function AuthHeroInteractive({
  titleLine1,
  titleLine2,
  titleLine3,
  description,
  featureSecure,
  featureCommunity,
  featureFast,
  marketLive,
  activeDeals,
  dealflow,
  saasMna,
  revenueMultiple,
  verified,
  buyerOffer,
  loiAmount,
}: AuthHeroInteractiveProps) {
  const { t } = useTranslation("auth");
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Normalized -1 to 1
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const marketLiveLabel = marketLive || t("hero.marketLive", { defaultValue: "Бозори фаъол" });
  const activeDealsLabel = activeDeals || t("hero.activeDeals", { defaultValue: "142 Созиши фаъол" });
  const dealflowLabel = dealflow || t("hero.dealflow", { defaultValue: "$1.4B Ҳаҷми савдо" });
  const saasMnaLabel = saasMna || t("hero.saasMna", { defaultValue: "SaaS Хариду фурӯш" });
  const revenueMultipleLabel = revenueMultiple || t("hero.revenueMultiple", { defaultValue: "$12.4M Даромад · Коэф. 4.2x" });
  const verifiedLabel = verified || t("hero.verified", { defaultValue: "Тасдиқшуда" });
  const buyerOfferLabel = buyerOffer || t("hero.buyerOffer", { defaultValue: "Фонди стратегии Apex пешниҳод ирсол кард" });
  const loiAmountLabel = loiAmount || t("hero.loiAmount", { defaultValue: "$45M Пешниҳод" });
  const title1 = titleLine1 || t("hero.titleLine1", { defaultValue: "Имконияти" });
  const title2 = titleLine2 || t("hero.titleLine2", { defaultValue: "навбатии шумо" });
  const title3 = titleLine3 || t("hero.titleLine3", { defaultValue: "дар ин ҷост" });
  const desc = description || t("hero.description", { defaultValue: "" });
  const featSecure = featureSecure || t("hero.featureSecure", { defaultValue: "Муомилоти бехатар" });
  const featCommunity = featureCommunity || t("hero.featureCommunity", { defaultValue: "Ҷомеаи боэътимод" });
  const featFast = featureFast || t("hero.featureFast", { defaultValue: "Раванди зуд ва осон" });

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative z-20 flex flex-col justify-between h-full w-full select-none"
    >
      {/* Background Animated Aurora Luminous Orbs */}
      <div className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-blue-500/10 dark:bg-blue-600/20 blur-3xl animate-aurora" />
      <div className="pointer-events-none absolute top-1/2 -right-24 size-80 rounded-full bg-indigo-500/10 dark:bg-indigo-600/15 blur-3xl animate-pulse-glow" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 size-72 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 blur-3xl animate-float-slow" />

      {/* Top Section: Live Market Activity Ticker */}
      <div className="flex items-center gap-2 pt-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/95 dark:border-blue-500/30 dark:bg-blue-950/60 px-3.5 py-1.5 text-xs font-bold text-black dark:text-blue-200 backdrop-blur-xl shadow-xs transition-all hover:border-blue-600/40 hover:bg-white dark:hover:bg-blue-900/60">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-black text-black dark:text-white tracking-wide text-[11px] uppercase">
            {marketLiveLabel}
          </span>
          <span className="text-slate-400 dark:text-muted-foreground/50">·</span>
          <span className="text-blue-800 dark:text-blue-200 text-[11px] font-mono font-black">
            {activeDealsLabel}
          </span>
          <span className="text-slate-400 dark:text-muted-foreground/50">·</span>
          <span className="text-blue-700 dark:text-cyan-300 font-black text-[11px] font-mono">
            {dealflowLabel}
          </span>
        </div>
      </div>

      {/* Center Section: Headline & 3D Interactive Floating Deal Cards */}
      <div className="relative my-auto py-8 xl:py-12 space-y-6">
        <div className="space-y-3">
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl xl:text-6xl text-black dark:text-white leading-[1.08]">
            {title1} <br />
            <span className="text-black dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-slate-300 font-black">
              {title2}
            </span>{" "}
            <br />
            <span className="relative inline-block text-blue-700 dark:text-blue-400 drop-shadow-xs dark:drop-shadow-[0_0_25px_rgba(96,165,250,0.6)] font-black">
              {title3}
            </span>
          </h1>
        </div>

        <p className="text-sm xl:text-base text-black dark:text-slate-300 leading-relaxed max-w-lg font-bold">
          {desc}
        </p>

        {/* 2026 Interactive Floating Glass Deal Cards with gentle subtle Parallax */}
        <div className="relative pt-4 space-y-3 max-w-lg">
          {/* Floating Deal Card 1 */}
          <div
            style={{
              transform: `translate3d(${mousePos.x * 5}px, ${mousePos.y * 5}px, 0) rotateX(${
                -mousePos.y * 2
              }deg) rotateY(${mousePos.x * 2}deg)`,
              transition: "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
            className="group relative rounded-xl border border-slate-300 bg-white dark:border-white/15 dark:bg-white/[0.07] p-3.5 backdrop-blur-xl shadow-lg dark:shadow-2xl transition-all duration-300 hover:border-blue-500/60 hover:bg-white dark:hover:bg-white/[0.12]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-700 dark:bg-blue-600/30 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/30 group-hover:scale-105 transition-transform">
                  <TrendingUp className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-black dark:text-white">CloudScale AI</span>
                    <span className="rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 px-1.5 py-0.2 text-[9px] font-black dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30">
                      {saasMnaLabel}
                    </span>
                  </div>
                  <span className="text-[11px] text-black dark:text-slate-300 font-mono font-black">
                    {revenueMultipleLabel}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-950 dark:text-blue-300 bg-blue-100 dark:bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-300 dark:border-blue-400/20">
                  <CheckCircle2 className="size-3 text-blue-700 dark:text-cyan-400" />
                  {verifiedLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Floating Deal Card 2 */}
          <div
            style={{
              transform: `translate3d(${-mousePos.x * 4}px, ${-mousePos.y * 4}px, 0) rotateX(${
                mousePos.y * 1.5
              }deg) rotateY(${-mousePos.x * 1.5}deg)`,
              transition: "transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
            className="group relative rounded-xl border border-slate-300 bg-white dark:border-white/10 dark:bg-slate-900/60 p-3 backdrop-blur-lg shadow-md dark:shadow-xl transition-all duration-300 hover:border-indigo-400/50 hover:bg-white dark:hover:bg-slate-900/80 ml-4 max-w-[92%]"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-blue-600 dark:bg-cyan-400 animate-ping" />
                <span className="text-black dark:text-slate-200 font-black text-[11px]">
                  {buyerOfferLabel}
                </span>
              </div>
              <span className="text-blue-800 dark:text-cyan-400 font-mono font-black text-[11px]">
                {loiAmountLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: 3 Interactive Feature Badges */}
      <div className="grid grid-cols-3 gap-3 border-t border-slate-300 dark:border-white/10 pt-5">
        <div className="group relative flex flex-col items-start gap-2 rounded-xl p-2.5 transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/[0.08] hover:-translate-y-0.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white border border-slate-300 text-blue-700 shadow-xs dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-400/30 backdrop-blur-md transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-500/10 dark:group-hover:bg-blue-500/30 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <ShieldCheck className="size-5" />
          </div>
          <span className="text-xs font-black text-black dark:text-white group-hover:text-blue-800 dark:group-hover:text-blue-200 transition-colors">
            {featSecure}
          </span>
        </div>

        <div className="group relative flex flex-col items-start gap-2 rounded-xl p-2.5 transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/[0.08] hover:-translate-y-0.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white border border-slate-300 text-indigo-700 shadow-xs dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-400/30 backdrop-blur-md transition-all duration-300 group-hover:scale-105 group-hover:bg-indigo-500/10 dark:group-hover:bg-indigo-500/30 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <Users className="size-5" />
          </div>
          <span className="text-xs font-black text-black dark:text-white group-hover:text-indigo-800 dark:group-hover:text-indigo-200 transition-colors">
            {featCommunity}
          </span>
        </div>

        <div className="group relative flex flex-col items-start gap-2 rounded-xl p-2.5 transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/[0.08] hover:-translate-y-0.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white border border-slate-300 text-cyan-700 shadow-xs dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-400/30 backdrop-blur-md transition-all duration-300 group-hover:scale-105 group-hover:bg-cyan-500/10 dark:group-hover:bg-cyan-500/30 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Zap className="size-5" />
          </div>
          <span className="text-xs font-black text-black dark:text-white group-hover:text-cyan-800 dark:group-hover:text-cyan-200 transition-colors">
            {featFast}
          </span>
        </div>
      </div>
    </div>
  );
}
