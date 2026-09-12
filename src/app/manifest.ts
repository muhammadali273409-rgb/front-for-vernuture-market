import type { MetadataRoute } from "next";
import { getT } from "@/i18n/server";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const t = await getT("common");

  return {
    name: t("meta.title"),
    short_name: "VentureMarket",
    description: t("meta.description"),
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#1d4ed8",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
