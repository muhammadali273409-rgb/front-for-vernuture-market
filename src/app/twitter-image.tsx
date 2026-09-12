import { renderBrandOgImage, OG_SIZE } from "./_brand/og-image";
import { getT } from "@/i18n/server";

export const alt = "VentureMarket — Buy, sell & discover businesses.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const t = await getT("common");
  return renderBrandOgImage(t("meta.ogTagline"), t("meta.ogHeadline"));
}
