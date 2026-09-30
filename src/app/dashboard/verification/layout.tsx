import { requireSellerRole } from "@/lib/auth/require-role";

export default async function SellerOnlyLayout({ children }: { children: React.ReactNode }) {
  await requireSellerRole();
  return children;
}
