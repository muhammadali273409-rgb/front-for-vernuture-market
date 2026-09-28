"use client";

import { useEffect } from "react";
import "./globals.css";

/**
 * Catches errors thrown by the root layout itself (e.g. locale/provider
 * setup) — error.tsx only wraps segments *below* the root layout, not the
 * layout itself. Must render its own <html>/<body> and can't rely on
 * AppProviders (i18n, theme, etc.), since those live inside the layout this
 * file replaces when it's active.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: "100svh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "1.5rem",
            textAlign: "center",
            fontFamily:
              "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
            background: "#fafafa",
            color: "#0a0a0a",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>
              Something went wrong
            </h1>
            <p style={{ color: "#6b7280", maxWidth: "24rem", marginTop: "0.5rem" }}>
              An unexpected error occurred while loading VentureMarket. Please try again.
            </p>
          </div>
          <button
            onClick={retry}
            style={{
              background: "#1d4ed8",
              color: "#ffffff",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.5rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
