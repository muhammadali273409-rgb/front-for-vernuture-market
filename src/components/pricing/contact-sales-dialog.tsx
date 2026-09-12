"use client";

import * as React from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/i18n/client";
import { useContactSales } from "@/hooks/use-subscription";
import { useCurrentUser } from "@/hooks/use-current-user";

interface ContactSalesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  company?: string;
  message?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactSalesDialog({ open, onOpenChange }: ContactSalesDialogProps) {
  const { t } = useTranslation("pricing");
  const { data: user } = useCurrentUser();
  const inquiryMutation = useContactSales();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitted, setSubmitted] = React.useState(false);

  // Reset the form when the dialog transitions to open, adjusted during
  // render (not in an effect) per React's "adjusting state when a prop
  // changes" pattern — this dialog stays mounted across opens/closes, so it
  // can't rely on a fresh mount the way `CheckoutDialog` does.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSubmitted(false);
      setErrors({});
      setName(user?.profile ? `${user.profile.firstName ?? ""} ${user.profile.lastName ?? ""}`.trim() : "");
      setEmail(user?.email ?? "");
      setCompany(user?.profile?.company ?? "");
      setMessage("");
    }
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!name.trim()) next.name = t("contactSales.validation.nameRequired");
    if (!EMAIL_PATTERN.test(email)) next.email = t("contactSales.validation.emailInvalid");
    if (!company.trim()) next.company = t("contactSales.validation.companyRequired");
    if (!message.trim()) next.message = t("contactSales.validation.messageRequired");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    inquiryMutation.mutate(
      { name, email, company, message },
      { onSuccess: () => setSubmitted(true) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success ring-8 ring-success/5">
              <CheckCircle2 className="size-7" />
            </div>
            <h3 className="text-lg font-bold text-foreground">{t("contactSales.successTitle")}</h3>
            <p className="text-sm text-muted-foreground">{t("contactSales.successDescription")}</p>
            <Button onClick={() => onOpenChange(false)} className="mt-2 w-full font-semibold">
              {t("contactSales.close")}
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("contactSales.title")}</DialogTitle>
              <DialogDescription>{t("contactSales.description")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="sales-name" className="text-xs font-semibold">
                  {t("contactSales.name")}
                </Label>
                <Input id="sales-name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sales-email" className="text-xs font-semibold">
                  {t("contactSales.email")}
                </Label>
                <Input
                  id="sales-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sales-company" className="text-xs font-semibold">
                  {t("contactSales.company")}
                </Label>
                <Input
                  id="sales-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  aria-invalid={!!errors.company}
                />
                {errors.company && <p className="text-xs text-destructive">{errors.company}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sales-message" className="text-xs font-semibold">
                  {t("contactSales.message")}
                </Label>
                <Textarea
                  id="sales-message"
                  rows={3}
                  placeholder={t("contactSales.messagePlaceholder")}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  aria-invalid={!!errors.message}
                />
                {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
              </div>
              <Button type="submit" disabled={inquiryMutation.isPending} className="h-10 w-full font-semibold">
                {inquiryMutation.isPending ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="size-3.5 animate-spin" />
                    {t("contactSales.sending")}
                  </span>
                ) : (
                  t("contactSales.submit")
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
