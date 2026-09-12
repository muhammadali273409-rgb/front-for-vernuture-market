"use client";

import * as React from "react";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useTranslation, persistLocale } from "@/i18n/client";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/settings";
import { useUiStore } from "@/stores/ui-store";
import { toast } from "sonner";

export default function SettingsPage() {
  const { t, i18n } = useTranslation(["settings", "auth"] as const);
  const { data: user } = useCurrentUser();
  const { preferredCurrency, setPreferredCurrency } = useUiStore();

  const locale = (i18n.language as Locale) in LOCALE_LABELS ? (i18n.language as Locale) : "tj";
  function setLocale(next: Locale) {
    persistLocale(next);
    void i18n.changeLanguage(next);
  }

  const [firstName, setFirstName] = React.useState(user?.profile?.firstName ?? "Alex");
  const [lastName, setLastName] = React.useState(user?.profile?.lastName ?? "Vance");
  const [company, setCompany] = React.useState(user?.profile?.company ?? "Apex Capital Ventures");
  const [bio, setBio] = React.useState(user?.profile?.bio ?? t("settings:demoBio"));

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    toast.success(t("settings:toastProfileUpdated"));
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("settings:page.title")} description={t("settings:page.description")} />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-flex">
          <TabsTrigger value="profile">{t("settings:tabs.profile")}</TabsTrigger>
          <TabsTrigger value="security">{t("settings:tabs.security")}</TabsTrigger>
          <TabsTrigger value="integrations">{t("settings:tabs.integrations")}</TabsTrigger>
          <TabsTrigger value="preferences">{t("settings:tabs.preferences")}</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="border border-border/80 bg-card">
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="text-base font-semibold">{t("settings:profileTab.identityTitle")}</CardTitle>
              <CardDescription className="text-xs">{t("settings:profileTab.identityDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("auth:firstName")}</Label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("auth:lastName")}</Label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-9 text-xs" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">{t("settings:profileTab.companyEntity")}</Label>
                  <Input value={company} onChange={(e) => setCompany(e.target.value)} className="h-9 text-xs" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">{t("settings:profileTab.professionalBio")}</Label>
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="text-xs" />
                </div>

                <Button type="submit" size="sm" className="h-9 gap-1.5 font-semibold text-xs mt-2">
                  <Save className="size-3.5" />
                  <span>{t("settings:saveChanges")}</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="border border-border/80 bg-card p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">{t("settings:securityTab.twoFactorTitle")}</h3>
                <p className="text-muted-foreground text-[11px]">{t("settings:securityTab.twoFactorDescription")}</p>
              </div>
              <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                {t("settings:securityTab.activeFido2")}
              </Badge>
            </div>

            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">{t("settings:securityTab.watermarkTitle")}</h3>
                <p className="text-muted-foreground text-[11px]">{t("settings:securityTab.watermarkDescription")}</p>
              </div>
              <Switch defaultChecked />
            </div>
          </Card>
        </TabsContent>

        {/* Connected Accounts */}
        <TabsContent value="integrations">
          <Card className="border border-border/80 bg-card divide-y divide-border/60">
            <div className="flex items-center justify-between p-4 text-xs">
              <div className="space-y-0.5">
                <h4 className="font-bold text-foreground">{t("settings:integrationsTab.stripeTitle")}</h4>
                <p className="text-muted-foreground text-[11px]">{t("settings:integrationsTab.stripeDescription")}</p>
              </div>
              <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 font-semibold text-[10px]">
                {t("settings:integrationsTab.connected")} ✓
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 text-xs">
              <div className="space-y-0.5">
                <h4 className="font-bold text-foreground">{t("settings:integrationsTab.analyticsTitle")}</h4>
                <p className="text-muted-foreground text-[11px]">{t("settings:integrationsTab.analyticsDescription")}</p>
              </div>
              <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 font-semibold text-[10px]">
                {t("settings:integrationsTab.connected")} ✓
              </Badge>
            </div>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences">
          <Card className="border border-border/80 bg-card p-5 space-y-4 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">{t("settings:preferencesTab.platformLanguage")}</Label>
              <div className="flex gap-2">
                {LOCALES.map((l) => (
                  <Button
                    key={l}
                    type="button"
                    variant={locale === l ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-xs font-semibold"
                    onClick={() => setLocale(l)}
                  >
                    {LOCALE_LABELS[l]}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label className="text-xs font-semibold">{t("settings:preferencesTab.displayCurrency")}</Label>
              <div className="flex gap-2">
                {(["USD", "EUR", "GBP", "TJS"] as const).map((curr) => (
                  <Button
                    key={curr}
                    type="button"
                    variant={preferredCurrency === curr ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-xs font-mono font-semibold"
                    onClick={() => setPreferredCurrency(curr)}
                  >
                    {curr}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
