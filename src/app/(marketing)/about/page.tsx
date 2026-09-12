import { ShieldCheck, Handshake, Search } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { getT } from "@/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("about");
  return pageMetadata(t("metaTitle"), t("metaDescription"));
}

export default async function AboutPage() {
  const t = await getT("about");

  const values = [
    { icon: Search, key: "discovery" },
    { icon: ShieldCheck, key: "verification" },
    { icon: Handshake, key: "workspace" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">{t("intro")}</p>

      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        {values.map((value) => (
          <div key={value.key} className="space-y-2">
            <value.icon className="size-6 text-primary" />
            <h2 className="font-semibold">{t(`values.${value.key}Title`)}</h2>
            <p className="text-sm text-muted-foreground">{t(`values.${value.key}Description`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
