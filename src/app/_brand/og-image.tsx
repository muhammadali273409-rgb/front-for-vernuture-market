import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

const BRAND_BLUE = "#3b6bff";
const INK = "#05070f";

/** Shared VentureMarket social-share composition, reused by opengraph-image and twitter-image. */
export function renderBrandOgImage(tagline: string, headline = "Buy, sell & discover businesses.") {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: `linear-gradient(135deg, ${INK} 0%, #0b1230 55%, #101a45 100%)`,
          fontFamily: "sans-serif",
        }}
      >
        {/* Mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 18,
              background: BRAND_BLUE,
            }}
          >
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6L9.5 17.5L14 8L17 14.5L20 6"
                stroke="#ffffff"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9.5" cy="17.5" r="1.5" fill="#ffffff" />
              <circle cx="17" cy="14.5" r="1.2" fill="#ffffff" />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#ffffff", letterSpacing: -1 }}>
            <span>Venture</span>
            <span style={{ color: BRAND_BLUE }}>Market</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 900 }}>
          <div style={{ display: "flex", fontSize: 60, fontWeight: 800, color: "#ffffff", lineHeight: 1.08, letterSpacing: -1.5 }}>
            {headline}
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#9aabd6", fontWeight: 500 }}>{tagline}</div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
