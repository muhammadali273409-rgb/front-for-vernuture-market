"use client";

/* eslint-disable @next/next/no-img-element -- images are short-lived signed URLs from the private bucket */

import * as React from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteBusinessImage, useUploadBusinessImage } from "@/hooks/use-businesses";
import { toast } from "sonner";
import { friendlyErrorMessage } from "@/lib/api/error";
import { useTranslation } from "@/i18n/client";
import type { BusinessImage, BusinessImageKind } from "@/types/domain";

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_GALLERY_IMAGES = 10;

/** Mirrors the backend's image rules so obviously bad files never get uploaded. */
export function isAcceptedImage(file: File): boolean {
  return IMAGE_ACCEPT.split(",").includes(file.type) && file.size <= MAX_IMAGE_BYTES;
}

interface BusinessImageManagerProps {
  businessId: string;
  images: BusinessImage[];
  disabled?: boolean;
}

/** Logo + gallery management for an existing project (dashboard "Media" tab). */
export function BusinessImageManager({ businessId, images, disabled = false }: BusinessImageManagerProps) {
  const { t } = useTranslation(["business", "errors"]);
  const upload = useUploadBusinessImage(businessId);
  const remove = useDeleteBusinessImage(businessId);
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingKind, setUploadingKind] = React.useState<BusinessImageKind | null>(null);

  const logo = images.find((i) => i.kind === "LOGO");
  const gallery = images.filter((i) => i.kind === "GALLERY");
  const galleryFull = gallery.length >= MAX_GALLERY_IMAGES;

  async function uploadFiles(files: File[], kind: BusinessImageKind) {
    const valid = files.filter(isAcceptedImage);
    if (valid.length < files.length) toast.error(t("project.imageInvalid"));
    if (valid.length === 0) return;

    setUploadingKind(kind);
    try {
      // Sequential so gallery positions follow the order the files were picked in.
      for (const file of valid.slice(0, kind === "LOGO" ? 1 : MAX_GALLERY_IMAGES - gallery.length)) {
        await upload.mutateAsync({ file, kind });
      }
      toast.success(t("project.toastImageUploaded"));
    } catch (error) {
      toast.error(friendlyErrorMessage(error, t, { showValidationDetail: true }));
    } finally {
      setUploadingKind(null);
    }
  }

  function handleSelected(kind: BusinessImageKind) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      event.target.value = "";
      void uploadFiles(files, kind);
    };
  }

  function handleRemove(imageId: string) {
    remove.mutate(imageId, {
      onSuccess: () => toast.success(t("project.toastImageRemoved")),
      onError: (error) => toast.error(friendlyErrorMessage(error, t)),
    });
  }

  const busy = disabled || uploadingKind !== null;

  return (
    <div className="space-y-8">
      {/* Logo */}
      <section className="space-y-3">
        <div>
          <h3 className="font-medium">{t("project.logo")}</h3>
          <p className="text-xs text-muted-foreground">{t("project.logoHint")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex size-24 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/30">
            {logo ? (
              <img src={logo.url} alt={t("project.logo")} className="size-full object-cover" />
            ) : (
              <ImagePlus className="size-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => logoInputRef.current?.click()}
            >
              {uploadingKind === "LOGO" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {uploadingKind === "LOGO"
                ? t("project.uploadingEllipsis")
                : logo
                  ? t("project.replaceLogo")
                  : t("project.uploadLogo")}
            </Button>
            {logo && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy || remove.isPending}
                onClick={() => handleRemove(logo.id)}
              >
                <Trash2 className="size-4" />
                {t("project.removeImage")}
              </Button>
            )}
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            className="hidden"
            onChange={handleSelected("LOGO")}
          />
        </div>
      </section>

      {/* Gallery */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="font-medium">
              {t("project.gallery")}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                ({gallery.length}/{MAX_GALLERY_IMAGES})
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">{t("project.galleryHint")}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy || galleryFull}
            onClick={() => galleryInputRef.current?.click()}
          >
            {uploadingKind === "GALLERY" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImagePlus className="size-4" />
            )}
            {uploadingKind === "GALLERY" ? t("project.uploadingEllipsis") : t("project.addImages")}
          </Button>
          <input
            ref={galleryInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            multiple
            className="hidden"
            onChange={handleSelected("GALLERY")}
          />
        </div>

        {gallery.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
            {t("project.noImages")}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {gallery.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted/30"
              >
                <img src={image.url} alt="" className="size-full object-cover" />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-1.5 top-1.5 size-7 opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                  disabled={busy || remove.isPending}
                  onClick={() => handleRemove(image.id)}
                  aria-label={t("project.removeImage")}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
