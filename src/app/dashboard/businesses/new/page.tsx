"use client";

/* eslint-disable @next/next/no-img-element -- local object-URL previews of picked files */

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Rocket, Save, X } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import {
  IMAGE_ACCEPT,
  MAX_GALLERY_IMAGES,
  isAcceptedImage,
} from "@/components/business/business-image-manager";
import { useCategories } from "@/hooks/use-listings";
import { useCreateBusiness } from "@/hooks/use-businesses";
import { businessesApi } from "@/lib/api/businesses";
import { queryKeys } from "@/lib/query/keys";
import {
  amountOrUndefined,
  createProjectSchema,
  type CreateProjectValues,
} from "@/lib/validations/business";
import { toast } from "sonner";
import { friendlyErrorMessage } from "@/lib/api/error";
import { useTranslation } from "@/i18n/client";

type SubmitMode = "draft" | "publish";

interface PickedImage {
  file: File;
  preview: string;
}

function toPicked(file: File): PickedImage {
  return { file, preview: URL.createObjectURL(file) };
}

export default function NewBusinessPage() {
  const { t } = useTranslation(["business", "errors", "common"]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: categories = [], isSuccess: categoriesLoaded } = useCategories();
  const noCategories = categoriesLoaded && categories.length === 0;
  const createBusiness = useCreateBusiness();

  const [submitting, setSubmitting] = React.useState<SubmitMode | null>(null);
  const [logo, setLogo] = React.useState<PickedImage | null>(null);
  const [gallery, setGallery] = React.useState<PickedImage[]>([]);
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);

  // Release the object URLs of previews when they're replaced or the page unmounts.
  const previewsRef = React.useRef<string[]>([]);
  React.useEffect(() => {
    previewsRef.current = [logo?.preview, ...gallery.map((g) => g.preview)].filter(Boolean) as string[];
  }, [logo, gallery]);
  React.useEffect(() => () => previewsRef.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const form = useForm<CreateProjectValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      businessModel: "",
      foundedAt: "",
      country: "",
      city: "",
      website: "",
      headline: "",
      askingPrice: "",
      currency: "USD",
      annualRevenue: "",
    },
  });

  function pickLogo(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!isAcceptedImage(file)) {
      toast.error(t("project.imageInvalid"));
      return;
    }
    if (logo) URL.revokeObjectURL(logo.preview);
    setLogo(toPicked(file));
  }

  function pickGallery(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    const valid = files.filter(isAcceptedImage);
    if (valid.length < files.length) toast.error(t("project.imageInvalid"));
    setGallery((current) => [
      ...current,
      ...valid.slice(0, MAX_GALLERY_IMAGES - current.length).map(toPicked),
    ]);
  }

  function removeGalleryImage(index: number) {
    setGallery((current) => {
      URL.revokeObjectURL(current[index].preview);
      return current.filter((_, i) => i !== index);
    });
  }

  /**
   * Create → upload media → (optionally) publish. The project always exists
   * after the first step, so later failures leave a draft the seller can fix
   * from the project page rather than losing their input.
   */
  async function submit(values: CreateProjectValues, mode: SubmitMode) {
    setSubmitting(mode);
    let businessId: string | null = null;
    try {
      const business = await createBusiness.mutateAsync({
        name: values.name,
        description: values.description || undefined,
        categoryId: values.categoryId || undefined,
        businessModel: values.businessModel || undefined,
        foundedAt: values.foundedAt || undefined,
        country: values.country || undefined,
        city: values.city || undefined,
        website: values.website || undefined,
        headline: values.headline || undefined,
        askingPrice: amountOrUndefined(values.askingPrice),
        currency: values.currency,
        annualRevenue: amountOrUndefined(values.annualRevenue),
      });
      businessId = business.id;
    } catch (error) {
      toast.error(friendlyErrorMessage(error, t, { showValidationDetail: true }));
      setSubmitting(null);
      return;
    }

    const uploads: { file: File; kind: "LOGO" | "GALLERY" }[] = [
      ...(logo ? [{ file: logo.file, kind: "LOGO" as const }] : []),
      ...gallery.map((g) => ({ file: g.file, kind: "GALLERY" as const })),
    ];
    let failedUploads = 0;
    for (const upload of uploads) {
      try {
        await businessesApi.uploadImage(businessId, upload.file, upload.kind);
      } catch {
        failedUploads += 1;
      }
    }
    if (failedUploads > 0) toast.error(t("project.someImagesFailed"));

    if (mode === "publish") {
      try {
        await businessesApi.publish(businessId);
        toast.success(t("project.toastPublished"));
      } catch (error) {
        toast.error(t("project.publishFailedSavedDraft", { reason: friendlyErrorMessage(error, t) }));
      }
    } else {
      toast.success(t("project.toastCreatedDraft"));
    }

    queryClient.invalidateQueries({ queryKey: queryKeys.myBusinesses });
    queryClient.invalidateQueries({ queryKey: ["listings"] });
    router.push(`/dashboard/businesses/${businessId}`);
  }

  const busy = submitting !== null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={t("project.createPageTitle")} description={t("project.createPageDescription")} />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => submit(values, "publish"))}
          className="space-y-6"
        >
          {/* ── Project details ───────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("project.sections.basics")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("businessName")} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t("seller.businessNamePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="headline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("seller.headline")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("seller.headlinePlaceholder")} maxLength={200} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("description")} *</FormLabel>
                    <FormControl>
                      <Textarea rows={6} placeholder={t("seller.descriptionPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("industry")} / {t("category")} *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={noCategories}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("seller.selectCategoryPlaceholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {noCategories && <FormDescription>{t("seller.noCategoriesHint")}</FormDescription>}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("businessModel")} *</FormLabel>
                      <FormControl>
                        <Input placeholder={t("seller.businessModelPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="foundedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("founded")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("website")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("seller.websitePlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* ── Location ──────────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("project.sections.location")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("seller.countryCode")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("seller.countryCodePlaceholder")}
                          maxLength={2}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormDescription>{t("seller.countryCodeHint")}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("project.city")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("project.cityPlaceholder")} maxLength={100} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* ── Pricing & financials ──────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("project.sections.financials")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="askingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("askingPrice")} *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step="1"
                          placeholder={t("project.askingPricePlaceholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("seller.currency")}</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="annualRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("project.annualRevenue")}</FormLabel>
                      <FormControl>
                        <Input type="number" inputMode="decimal" min={0} step="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{t("project.annualRevenueHint")}</p>
            </CardContent>
          </Card>

          {/* ── Logo & images ─────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("project.sections.media")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="flex size-24 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 transition-colors hover:border-primary/50"
                  aria-label={logo ? t("project.replaceLogo") : t("project.uploadLogo")}
                >
                  {logo ? (
                    <img src={logo.preview} alt="" className="size-full object-cover" />
                  ) : (
                    <ImagePlus className="size-6 text-muted-foreground" />
                  )}
                </button>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{t("project.logo")}</p>
                  <p className="text-xs text-muted-foreground">{t("project.logoHint")}</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                    {logo ? t("project.replaceLogo") : t("project.uploadLogo")}
                  </Button>
                </div>
                <input ref={logoInputRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={pickLogo} />
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">
                      {t("project.gallery")}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        ({gallery.length}/{MAX_GALLERY_IMAGES})
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">{t("project.galleryHint")}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={gallery.length >= MAX_GALLERY_IMAGES}
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    <ImagePlus className="size-4" />
                    {t("project.addImages")}
                  </Button>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept={IMAGE_ACCEPT}
                    multiple
                    className="hidden"
                    onChange={pickGallery}
                  />
                </div>
                {gallery.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {gallery.map((image, index) => (
                      <div
                        key={image.preview}
                        className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted/30"
                      >
                        <img src={image.preview} alt="" className="size-full object-cover" />
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="absolute right-1.5 top-1.5 size-7"
                          onClick={() => removeGalleryImage(index)}
                          aria-label={t("project.removeImage")}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">{t("seller.publishRequirements")}</p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => router.push("/dashboard/businesses")}
            >
              {t("common:cancel")}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={form.handleSubmit((values) => submit(values, "draft"))}
            >
              <Save className="size-4" />
              {submitting === "draft" ? t("project.savingEllipsis") : t("project.saveDraft")}
            </Button>
            <Button type="submit" disabled={busy}>
              <Rocket className="size-4" />
              {submitting === "publish" ? t("seller.publishingEllipsis") : t("project.publishNow")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
