"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, Settings, ShieldCheck, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useLogout } from "@/hooks/use-auth-mutations";
import { useTranslation } from "@/i18n/client";
import { initials } from "@/lib/utils/format";

export function UserMenu() {
  const { t } = useTranslation(["auth", "navigation"] as const);
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const router = useRouter();

  if (!user) return null;

  const name =
    [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(" ") || user.email;
  // The Admin Panel is a separate experience (see app/admin/**); this is
  // just its entry point, gated on the server-verified role already on
  // `user` — hiding it here is a UX nicety, not the actual access control
  // (every /admin route and API re-verifies the role itself).
  const isAdmin = user.role === "ADMIN";

  function handleLogout() {
    // The mutation itself already guards against a duplicate in-flight
    // request, but bail out early too so a second click can't even queue one.
    if (logout.isPending) return;
    logout.mutate(undefined, {
      onSuccess: () => {
        toast.success(t("auth:logoutSuccess"));
        router.push("/login");
      },
      onError: () => {
        toast.error(t("auth:logoutFailed"));
      },
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="size-8">
            <AvatarImage src={user.profile?.avatarUrl ?? undefined} alt={name} />
            <AvatarFallback>{initials(user.profile?.firstName, user.profile?.lastName, user.email)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-medium">{name}</span>
          <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <UserIcon />
            {t("navigation:profile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <Settings />
            {t("navigation:settings")}
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <ShieldCheck />
              {t("navigation:admin")}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" disabled={logout.isPending} onSelect={handleLogout}>
          <LogOut />
          {logout.isPending ? t("auth:loggingOut") : t("auth:logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
