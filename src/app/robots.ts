import type { MetadataRoute } from "next";

const BASE_URL = "https://front-for-vernuture-market-production.up.railway.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/admin"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
