import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s · Admin · VentureMarket",
  },
  // Internal moderation tooling and its login page: never expose to search engines.
  robots: { index: false, follow: false },
};

// Deliberately no auth check here — this layout also wraps /admin/login,
// which must be reachable while signed out. The real role check lives in
// app/admin/(protected)/layout.tsx, applied only to the actual panel routes.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
