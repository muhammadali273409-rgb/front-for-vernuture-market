import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const BRAND_BLUE = "#1d4ed8";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND_BLUE,
          borderRadius: 7,
        }}
      >
        {/* Same mark as components/shared/logo.tsx — a stylized V/M acquisition path */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 6L9.5 17.5L14 8L17 14.5L20 6"
            stroke="#ffffff"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9.5" cy="17.5" r="1.6" fill="#ffffff" />
          <circle cx="17" cy="14.5" r="1.3" fill="#ffffff" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
