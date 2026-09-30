"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLogin, useRegister, useGoogleLogin } from "@/hooks/use-auth-mutations";
import { ApiError, friendlyErrorMessage } from "@/lib/api/error";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { GoogleRoleSelectDialog } from "@/components/auth/google-role-select-dialog";
import { RoleChoiceCards } from "@/components/onboarding/role-choice-cards";
import {
  clearIntendedRole,
  parsePublicRole,
  rememberIntendedRole,
  useIntendedRole,
  type PublicRole,
} from "@/lib/auth/intended-role";
import { homePathForRole } from "@/lib/auth/roles";
import type { CurrentUser } from "@/types/domain";
import { useTranslation } from "@/i18n/client";
import type { TFunction } from "i18next";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AuthFormCardProps {
  initialTab?: "login" | "register";
  isModal?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

/**
 * Known backend error codes with a translated message in errors.json.
 * Anything else (including raw English exception text the backend might
 * send) falls back to errors:UNKNOWN_ERROR — never shown as raw untranslated
 * backend text.
 */
const KNOWN_ERROR_CODES = new Set([
  "AUTH_INVALID_CREDENTIALS",
  "AUTH_EMAIL_TAKEN",
  "AUTH_EMAIL_NOT_VERIFIED",
  "AUTH_ACCOUNT_SUSPENDED",
  "AUTH_UNAUTHORIZED",
  "AUTH_FORBIDDEN",
  "AUTH_INVALID_TOKEN",
  "AUTH_TOKEN_EXPIRED",
  "NETWORK_ERROR",
  "VALIDATION_ERROR",
  "RATE_LIMITED",
  "SERVER_ERROR",
]);

function translateAuthError(error: unknown, t: TFunction): string {
  if (error instanceof ApiError) {
    const code = KNOWN_ERROR_CODES.has(error.code) ? error.code : "UNKNOWN_ERROR";
    return t(`errors:${code}`);
  }
  if (error instanceof Error && (error.message === "Failed to fetch" || error.name === "TypeError")) {
    return t("errors:NETWORK_ERROR");
  }
  return t("errors:UNKNOWN_ERROR");
}

export function AuthFormCard({
  initialTab = "login",
  isModal = false,
  onClose,
  onSuccess,
}: AuthFormCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Explicit ?next= wins; otherwise each user lands in their own role's home.
  const nextParam = searchParams.get("next");

  const [activeTab, setActiveTab] = React.useState<"login" | "register">(initialTab);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [isSuccessState, setIsSuccessState] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Set only while a verified-but-unregistered Google identity is waiting on
  // a Buyer/Seller choice. Never persisted (not state, not storage) — it's
  // resubmitted once, then discarded whether the user continues or cancels.
  const [pendingGoogleCredential, setPendingGoogleCredential] = React.useState<string | null>(null);

  // Buyer/Seller picked on the landing page (?role=) or earlier in this tab.
  // Only used to create a *new* account — an existing account always keeps
  // the role stored on the backend.
  const rememberedRole = useIntendedRole();
  const [pickedRole, setPickedRole] = React.useState<PublicRole | null>(null);
  const selectedRole = pickedRole ?? parsePublicRole(searchParams.get("role")) ?? rememberedRole;

  function selectRole(role: PublicRole) {
    setPickedRole(role);
    rememberIntendedRole(role);
    setFormError(null);
  }

  // Form Fields
  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");

  const [fullName, setFullName] = React.useState("");
  const [registerEmail, setRegisterEmail] = React.useState("");
  const [registerPassword, setRegisterPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const { t } = useTranslation(["auth", "common"] as const);
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const googleLoginMutation = useGoogleLogin();

  const isSubmitting = loginMutation.isPending || registerMutation.isPending || googleLoginMutation.isPending;

  /**
   * An existing account always keeps the role stored on the backend — picking
   * the other card never converts it. Tell the user instead of silently
   * ignoring their pick.
   */
  function noteIfRoleDiffers(user: CurrentUser) {
    if (!selectedRole || user.role === selectedRole) return;
    if (user.role !== "BUYER" && user.role !== "SELLER") return;
    toast.info(
      t("auth:roleChoice.existingRoleKept", {
        role: t(user.role === "SELLER" ? "auth:roleSeller" : "auth:roleBuyer"),
      }),
    );
  }

  /** Signed in: drop the pre-auth choice and route by the role the backend returned. */
  function finishSignIn(user: CurrentUser) {
    clearIntendedRole();
    if (onSuccess) onSuccess();
    else router.push(nextParam || homePathForRole(user.role));
  }

  function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!loginEmail || !loginPassword) {
      setFormError(t("auth:validation.fillEmailAndPassword"));
      return;
    }

    loginMutation.mutate(
      { email: loginEmail, password: loginPassword },
      {
        onSuccess: (result) => {
          toast.success(t("auth:loginWelcomeToast"));
          noteIfRoleDiffers(result.user);
          finishSignIn(result.user);
        },
        onError: (error) => {
          // A real rejection (wrong password, unknown account, suspended,
          // ...) must show a real error — never a fake "success" that lets
          // an unauthenticated visitor believe they got into the dashboard.
          setFormError(translateAuthError(error, t));
        },
      },
    );
  }

  function handleGoogleCredential(credential: string) {
    setFormError(null);
    googleLoginMutation.mutate(
      // If a role was already chosen, send it: the backend uses it only to
      // create a brand-new account and ignores it for an existing one.
      { credential, role: selectedRole ?? undefined },
      {
        // The backend is the sole authority here: it already verified the
        // Google credential cryptographically, then either signed in the
        // matching existing account (role untouched) or, for a verified
        // identity it has never seen before, replied `needsRole: true`
        // without creating anything — that's the cue to ask Buyer/Seller.
        // This component never creates an account or assigns a role itself;
        // it only reacts to what the backend already decided.
        onSuccess: (result) => {
          if (result.needsRole) {
            setPendingGoogleCredential(credential);
            return;
          }
          toast.success(result.isNewUser ? t("auth:registerSuccess") : t("auth:loginWelcomeToast"));
          if (!result.isNewUser) noteIfRoleDiffers(result.user);
          finishSignIn(result.user);
        },
        onError: () => {
          setFormError(t("auth:googleAuthFailed"));
        },
      },
    );
  }

  function handleGoogleRoleContinue(role: "BUYER" | "SELLER") {
    if (!pendingGoogleCredential) return;
    setFormError(null);
    googleLoginMutation.mutate(
      { credential: pendingGoogleCredential, role },
      {
        onSuccess: (result) => {
          setPendingGoogleCredential(null);
          if (result.needsRole) return; // unreachable once a role is sent, kept for type-safety
          toast.success(t("auth:registerSuccess"));
          finishSignIn(result.user);
        },
        onError: () => {
          setPendingGoogleCredential(null);
          setFormError(t("auth:googleAuthFailed"));
        },
      },
    );
  }

  function handleGoogleRoleCancel() {
    // The user closed the role step without choosing — no account, no
    // session, no role was ever created for this Google identity.
    setPendingGoogleCredential(null);
  }

  function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!selectedRole) {
      setFormError(t("auth:roleChoice.required"));
      return;
    }

    if (!registerEmail || !registerPassword) {
      setFormError(t("auth:validation.fillRequiredFields"));
      return;
    }

    if (registerPassword !== confirmPassword) {
      setFormError(t("auth:validation.passwordsDoNotMatch"));
      return;
    }

    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.slice(1).join(" ") || "Member";

    registerMutation.mutate(
      {
        email: registerEmail,
        password: registerPassword,
        firstName,
        lastName,
        // Only BUYER or SELLER can be chosen here; the backend's RegisterDto
        // independently rejects anything else (e.g. "ADMIN") and stores the
        // role on the user record — the only place it is read from later.
        role: selectedRole,
      },
      {
        onSuccess: () => {
          clearIntendedRole();
          setIsSuccessState(true);
        },
        onError: (error) => {
          // Surface the backend's validation reason (e.g. password length).
          setFormError(friendlyErrorMessage(error, t, { showValidationDetail: true }));
        },
      },
    );
  }

  // 2026 Micro 3D Tilt State (without glare/spotlight)
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [mouseTilt, setMouseTilt] = React.useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle gentle micro-tilt (1.8 deg max)
    const rotateX = -((y - centerY) / centerY) * 1.8;
    const rotateY = ((x - centerX) / centerX) * 1.8;

    setMouseTilt({ rotateX, rotateY });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setMouseTilt({ rotateX: 0, rotateY: 0 });
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1400px) rotateX(${mouseTilt.rotateX}deg) rotateY(${mouseTilt.rotateY}deg) translateZ(0)`,
        transition: isHovered
          ? "transform 0.18s ease-out, box-shadow 0.3s ease"
          : "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.6s ease",
      }}
      className={cn(
        "relative w-full max-w-[440px] rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-2xl p-6 sm:p-8",
        "shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
        "dark:border-white/10 dark:bg-card/85 preserve-3d overflow-hidden",
      )}
    >
      {/* Modal Close Button if displayed in Modal */}
      {isModal && onClose && (
        <button
          onClick={onClose}
          className="relative z-20 absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 hover:rotate-90"
          aria-label={t("auth:closeModal")}
        >
          <X className="size-4" />
        </button>
      )}

      {/* Top Logo with subtle hover glow */}
      <div className="relative z-10 mb-6 flex justify-center group">
        <div className="transition-transform duration-300 group-hover:scale-105">
          <Logo size="lg" />
        </div>
      </div>

      {/* SUCCESS STATE */}
      {isSuccessState ? (
        <div className="relative z-10 flex flex-col items-center py-6 text-center space-y-4 animate-in fade-in-50 duration-500">
          <div className="flex size-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-8 ring-blue-500/5 animate-bounce">
            <CheckCircle2 className="size-9" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-foreground">{t("auth:registrationSuccessTitle")}</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              {t("auth:registrationSuccessDescription")}
            </p>
          </div>

          <Button
            onClick={() => {
              setIsSuccessState(false);
              setActiveTab("login");
            }}
            className="w-full h-10 font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm mt-2 animate-shimmer"
          >
            {t("auth:goToLogin")}
          </Button>
        </div>
      ) : (
        <div className="relative z-10">
          {/* Top Segmented Navigation Tabs (2026 Animated Pill Switcher) */}
          <div className="mb-6 relative flex rounded-xl bg-muted/60 p-1 border border-border/50">
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setFormError(null);
              }}
              className={cn(
                "relative z-10 flex-1 py-2 text-center text-xs font-bold transition-all duration-200 rounded-lg",
                activeTab === "login"
                  ? "text-blue-600 dark:text-blue-400 bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t("auth:login")}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("register");
                setFormError(null);
              }}
              className={cn(
                "relative z-10 flex-1 py-2 text-center text-xs font-bold transition-all duration-200 rounded-lg",
                activeTab === "register"
                  ? "text-blue-600 dark:text-blue-400 bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t("auth:register")}
            </button>
          </div>

          {/* Form Header */}
          <div className="mb-5 text-center">
            <h2 className="text-xl font-extrabold tracking-tight text-foreground">
              {activeTab === "login" ? t("auth:loginTitle") : t("auth:registerTitle")}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {activeTab === "login" ? t("auth:loginSubtitle") : t("auth:registerSubtitle")}
            </p>
          </div>

          {formError && (
            <Alert variant="destructive" className="mb-4 text-xs py-2 animate-in fade-in-50">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {/* TAB 1: LOGIN FORM */}
          {activeTab === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Optional here: an existing account signs in with its stored
                  role. The pick only matters if "Continue with Google"
                  creates a brand-new account. */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">{t("auth:roleChoice.question")}</p>
                <RoleChoiceCards
                  variant="compact"
                  selected={selectedRole}
                  onSelect={selectRole}
                  disabled={isSubmitting}
                />
                <p className="text-[11px] text-muted-foreground">{t("auth:roleChoice.loginHint")}</p>
              </div>

              {/* Email Address */}
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground group-focus-within:text-blue-500 transition-colors">
                  <Mail className="size-4" />
                </div>
                <Input
                  type="email"
                  placeholder={t("auth:emailAddress")}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="h-11 rounded-xl pl-10 text-xs font-medium border-border/80 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground group-focus-within:text-blue-500 transition-colors">
                  <Lock className="size-4" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth:password")}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="h-11 rounded-xl pl-10 pr-10 text-xs font-medium border-border/80 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? t("auth:hidePassword") : t("auth:showPassword")}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <Label htmlFor="remember-me" className="text-xs font-normal text-muted-foreground cursor-pointer select-none">
                    {t("auth:rememberMe")}
                  </Label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline transition-colors"
                >
                  {t("auth:forgotPassword")}
                </Link>
              </div>

              {/* Primary Sign In Button with 2026 Shimmer and Magnetic Glow */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.5)] transition-all duration-200 active:scale-[0.98] animate-shimmer"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span>{t("auth:signingIn")}</span>
                  </span>
                ) : (
                  <span>{t("auth:signIn")}</span>
                )}
              </Button>
            </form>
          ) : (
            /* TAB 2: REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">{t("auth:roleChoice.question")}</p>
                <RoleChoiceCards
                  variant="compact"
                  selected={selectedRole}
                  onSelect={selectRole}
                  disabled={isSubmitting}
                />
              </div>

              {/* Full Name */}
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground group-focus-within:text-blue-500 transition-colors">
                  <User className="size-4" />
                </div>
                <Input
                  type="text"
                  placeholder={t("auth:fullName")}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-10.5 rounded-xl pl-10 text-xs font-medium border-border/80 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all"
                  required
                />
              </div>

              {/* Email Address */}
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground group-focus-within:text-blue-500 transition-colors">
                  <Mail className="size-4" />
                </div>
                <Input
                  type="email"
                  placeholder={t("auth:emailAddress")}
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="h-10.5 rounded-xl pl-10 text-xs font-medium border-border/80 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground group-focus-within:text-blue-500 transition-colors">
                  <Lock className="size-4" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth:password")}
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="h-10.5 rounded-xl pl-10 pr-10 text-xs font-medium border-border/80 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? t("auth:hidePassword") : t("auth:showPassword")}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground group-focus-within:text-blue-500 transition-colors">
                  <Lock className="size-4" />
                </div>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("auth:confirmPassword")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10.5 rounded-xl pl-10 pr-10 text-xs font-medium border-border/80 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirmPassword ? t("auth:hidePassword") : t("auth:showPassword")}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {/* Create Account Button with 2026 Shimmer and Magnetic Glow */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.5)] transition-all duration-200 active:scale-[0.98] animate-shimmer mt-1"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span>{t("auth:creatingAccount")}</span>
                  </span>
                ) : (
                  <span>{t("auth:createAccount")}</span>
                )}
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border/80" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t("auth:or")}</span>
            <div className="h-px flex-1 bg-border/80" />
          </div>

          {/* Social Login: Continue with Google */}
          <GoogleSignInButton
            onCredential={handleGoogleCredential}
            disabled={isSubmitting}
            label={t("auth:continueWithGoogle")}
            loadingLabel={t("auth:googleSigningIn")}
          />

          {/* Bottom Switch Link */}
          <div className="mt-5 text-center text-xs text-muted-foreground">
            {activeTab === "login" ? (
              <p>
                {t("auth:noAccountQuestion")}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("register");
                    setFormError(null);
                  }}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline transition-colors ml-1"
                >
                  {t("auth:register")}
                </button>
              </p>
            ) : (
              <p>
                {t("auth:alreadyHaveAccountQuestion")}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    setFormError(null);
                  }}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline transition-colors ml-1"
                >
                  {t("auth:login")}
                </button>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Only shown for a verified Google identity that has no VentureMarket
          account yet — never for an existing account, which always signs in
          directly with its stored role. Buyer/Seller only; Admin is never a
          selectable option here or anywhere in this flow. */}
      <GoogleRoleSelectDialog
        open={pendingGoogleCredential !== null}
        initialRole={selectedRole}
        onCancel={handleGoogleRoleCancel}
        onContinue={handleGoogleRoleContinue}
        isSubmitting={googleLoginMutation.isPending}
      />
    </div>
  );
}

