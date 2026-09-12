"use client";

import * as React from "react";
import Script from "next/script";
import { useTheme } from "next-themes";
import { env } from "@/lib/config/env";
import { cn } from "@/lib/utils";

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  cancel_on_tap_outside?: boolean;
  itp_support?: boolean;
  use_fedcm_for_prompt?: boolean;
}

interface GoogleButtonOptions {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  width?: number;
  shape?: "rectangular" | "pill" | "circle" | "square";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  logo_alignment?: "left" | "center";
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfig) => void;
          renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onCredential: (credential: string) => void;
  disabled?: boolean;
  label: string;
  loadingLabel: string;
}

/**
 * Renders Google's own official Sign In With Google button — not a custom
 * lookalike. This is a deliberate choice, not just a branding nicety: Google
 * Identity Services renders its button inside a cross-origin iframe, so a
 * synthetic click forwarded from an arbitrary custom element cannot reliably
 * reach it. Using Google's real button is the only way to guarantee the
 * actual account chooser (with every signed-in Google account and "Use
 * another account") opens on click, exactly as Google controls it — nothing
 * here fabricates that UI. Styling is limited to the options Google's API
 * exposes (theme/shape/size/text), re-rendered when the app's light/dark
 * theme changes so it stays visually consistent with the rest of the form.
 */
export function GoogleSignInButton({ onCredential, disabled, label, loadingLabel }: GoogleSignInButtonProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = React.useState(false);
  const { resolvedTheme } = useTheme();
  const onCredentialRef = React.useRef(onCredential);
  React.useEffect(() => {
    onCredentialRef.current = onCredential;
  });

  const clientId = env.googleClientId;

  React.useEffect(() => {
    if (!scriptLoaded || !clientId || !containerRef.current || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => onCredentialRef.current(response.credential),
      cancel_on_tap_outside: true,
    });

    // Google doesn't expose a live "update theme" call — the button is
    // re-rendered into the (cleared) container whenever the app theme flips.
    containerRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(containerRef.current, {
      type: "standard",
      theme: resolvedTheme === "dark" ? "filled_black" : "outline",
      size: "large",
      shape: "rectangular",
      text: "continue_with",
      logo_alignment: "left",
      width: 384,
    });
  }, [scriptLoaded, clientId, resolvedTheme]);

  // "Continue with Google" isn't offered at all when it isn't configured,
  // rather than rendering a button that can only ever fail.
  if (!clientId) return null;

  const ready = scriptLoaded && !disabled;

  return (
    <div className="relative w-full">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

      {/* Google's real button — interactive only once loaded and enabled. */}
      <div
        ref={containerRef}
        className={cn("flex w-full justify-center transition-opacity", !ready && "pointer-events-none opacity-0")}
      />

      {/* Loading / disabled placeholder, shown until Google's button is ready. */}
      {!ready && (
        <div
          className="absolute inset-0 flex h-10.5 w-full items-center justify-center gap-2 rounded-xl border border-border/80 bg-card text-xs font-semibold text-muted-foreground"
          aria-hidden="true"
        >
          {!scriptLoaded ? (
            <>
              <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>{loadingLabel}</span>
            </>
          ) : (
            <span>{label}</span>
          )}
        </div>
      )}
    </div>
  );
}
