import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  lightOnly?: boolean;
}

export function Logo({ className, showText = true, size = "md", lightOnly = false }: LogoProps) {
  const iconSizes = {
    sm: "size-6",
    md: "size-7",
    lg: "size-9",
    xl: "size-11",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-2xl",
  };

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 font-bold tracking-tight transition-opacity hover:opacity-90",
        className,
      )}
    >
      <div className={cn("relative flex items-center justify-center shrink-0", iconSizes[size])}>
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-full drop-shadow-xs">
          {/* Main Electric V Wing */}
          <path
            d="M5 8L18 30L31 8"
            stroke="url(#vm-grad-1)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner Cyan Accent Node */}
          <path
            d="M11 9L18 20L25 9"
            stroke="url(#vm-grad-2)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="vm-grad-1" x1="5" y1="8" x2="31" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3B82F6" />
              <stop offset="1" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="vm-grad-2" x1="11" y1="9" x2="25" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60A5FA" />
              <stop offset="1" stopColor="#38BDF8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <span
          className={cn(
            "font-extrabold tracking-tight",
            textSizes[size],
            lightOnly ? "text-white" : "text-foreground",
          )}
        >
          <span>Venture</span>
          <span className="text-primary font-black">Market</span>
        </span>
      )}
    </Link>
  );
}
