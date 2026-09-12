import { FaqView } from "./faq-view";
import { pageMetadata } from "@/lib/seo";
import { getT } from "@/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("faq");
  return pageMetadata(t("metaTitle"), t("metaDescription"));
}

export default function FaqPage() {
  return <FaqView />;
}
