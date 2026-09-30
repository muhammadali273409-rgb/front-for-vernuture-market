"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
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
import { useCategories } from "@/hooks/use-listings";
import { useCreateBusiness } from "@/hooks/use-businesses";
import { createBusinessSchema, type CreateBusinessValues } from "@/lib/validations/business";
import { toast } from "sonner";
import { friendlyErrorMessage } from "@/lib/api/error";
import { useTranslation } from "@/i18n/client";

export default function NewBusinessPage() {
  const { t } = useTranslation(["business", "errors", "common"]);
  const router = useRouter();
  const { data: categories = [], isSuccess: categoriesLoaded } = useCategories();
  const noCategories = categoriesLoaded && categories.length === 0;
  const createBusiness = useCreateBusiness();

  const form = useForm<CreateBusinessValues>({
    resolver: zodResolver(createBusinessSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      businessModel: "",
      foundedAt: "",
      country: "",
      website: "",
    },
  });

  function onSubmit(values: CreateBusinessValues) {
    createBusiness.mutate(
      {
        name: values.name,
        description: values.description || undefined,
        categoryId: values.categoryId || undefined,
        businessModel: values.businessModel || undefined,
        foundedAt: values.foundedAt || undefined,
        country: values.country || undefined,
        website: values.website || undefined,
      },
      {
        onSuccess: (business) => router.push(`/dashboard/businesses/${business.id}`),
        onError: (error) =>
          toast.error(friendlyErrorMessage(error, t, { showValidationDetail: true })),
      },
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title={t("seller.createBusinessPageTitle")}
        description={t("seller.createBusinessPageDescription")}
      />

      <Card>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("businessName")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("seller.businessNamePlaceholder")} {...field} />
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
                    <FormLabel>{t("description")}</FormLabel>
                    <FormControl>
                      <Textarea rows={5} placeholder={t("seller.descriptionPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("category")}</FormLabel>
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
                      <FormLabel>{t("businessModel")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("seller.businessModelPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

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

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={createBusiness.isPending}>
                  {createBusiness.isPending ? t("seller.creatingEllipsis") : t("seller.createBusiness")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={createBusiness.isPending}
                  onClick={() => router.push("/dashboard/businesses")}
                >
                  {t("common:cancel")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
