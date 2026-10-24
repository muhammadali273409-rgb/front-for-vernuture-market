"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/i18n/client";
import type { DealFlowMutations } from "@/hooks/use-deal-flow";
import type { DueDiligenceCategory } from "@/types/domain";

const DD_CATEGORIES: DueDiligenceCategory[] = [
  "FINANCIAL",
  "LEGAL",
  "BUSINESS",
  "CUSTOMERS",
  "TECHNOLOGY",
  "IP",
  "OPERATIONS",
];

/** Mirrors ALLOWED_MIME_TYPES in the backend's documents.service.ts. */
const FILE_ACCEPT = ".pdf,.docx,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.webp,.zip";
const MAX_FILE_BYTES = 25 * 1024 * 1024;

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mutations: DealFlowMutations;
}

function FileField({
  id,
  label,
  accept,
  file,
  onChange,
}: {
  id: string;
  label: string;
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const { t } = useTranslation("deals");
  const tooLarge = file !== null && file.size > MAX_FILE_BYTES;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="cursor-pointer text-xs"
      />
      {tooLarge && <p className="text-xs text-destructive">{t("flow.form.fileTooLarge")}</p>}
    </div>
  );
}

/** Buyer: ask the seller for evidence — one request, one or more items. */
export function DueDiligenceRequestDialog({ open, onOpenChange, mutations }: DialogProps) {
  const { t } = useTranslation("deals");
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<DueDiligenceCategory>("FINANCIAL");
  const [items, setItems] = React.useState<string[]>([""]);
  const create = mutations.createDueDiligenceRequest;

  const cleanItems = items.map((i) => i.trim()).filter(Boolean);
  const canSubmit = title.trim().length > 0 && cleanItems.length > 0 && !create.isPending;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    create.mutate(
      { title: title.trim(), category, items: cleanItems },
      {
        onSuccess: () => {
          setTitle("");
          setItems([""]);
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t("flow.form.ddRequestTitle")}</DialogTitle>
            <DialogDescription>{t("flow.form.ddRequestDescription")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="dd-title">{t("flow.form.ddRequestName")}</Label>
            <Input
              id="dd-title"
              value={title}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("flow.form.ddRequestNamePlaceholder")}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("flow.form.ddCategory")}</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as DueDiligenceCategory)}>
              <SelectTrigger className="w-full" aria-label={t("flow.form.ddCategory")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DD_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {t(`flow.ddCategory.${c}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("flow.form.ddItems")}</Label>
            {items.map((value, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  aria-label={t("flow.form.ddItemLabel", { n: idx + 1 })}
                  value={value}
                  onChange={(e) => setItems((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)))}
                  placeholder={t("flow.form.ddItemPlaceholder")}
                />
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t("flow.form.removeItem")}
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setItems((prev) => [...prev, ""])}>
              <Plus className="size-3.5" />
              {t("flow.form.addItem")}
            </Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("flow.form.cancel")}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {create.isPending ? t("flow.form.sending") : t("flow.form.sendRequest")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Seller: answer one item in writing and/or with a document. */
export function AnswerItemDialog({
  open,
  onOpenChange,
  mutations,
  item,
}: DialogProps & { item: { id: string; description: string } | null }) {
  const { t } = useTranslation("deals");
  const [response, setResponse] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const answer = mutations.answerDueDiligenceItem;
  const canSubmit =
    item !== null && (response.trim() !== "" || file !== null) && !(file && file.size > MAX_FILE_BYTES) && !answer.isPending;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !item) return;
    answer.mutate(
      { itemId: item.id, response, file },
      {
        onSuccess: () => {
          setResponse("");
          setFile(null);
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t("flow.form.answerTitle")}</DialogTitle>
            <DialogDescription>{item?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="dd-response">{t("flow.form.answerText")}</Label>
            <Textarea
              id="dd-response"
              value={response}
              maxLength={4000}
              rows={4}
              onChange={(e) => setResponse(e.target.value)}
              placeholder={t("flow.form.answerPlaceholder")}
            />
          </div>
          <FileField id="dd-file" label={t("flow.form.attachDocument")} accept={FILE_ACCEPT} file={file} onChange={setFile} />
          <p className="text-xs text-muted-foreground">{t("flow.form.answerHint")}</p>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("flow.form.cancel")}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {answer.isPending ? t("flow.form.sending") : t("flow.form.sendAnswer")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Either party: start the purchase agreement. */
export function CreateAgreementDialog({
  open,
  onOpenChange,
  mutations,
  defaultTitle,
}: DialogProps & { defaultTitle: string }) {
  const { t } = useTranslation("deals");
  const [title, setTitle] = React.useState(defaultTitle);
  const create = mutations.createAgreement;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || create.isPending) return;
    create.mutate(title.trim(), { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t("flow.form.agreementTitle")}</DialogTitle>
            <DialogDescription>{t("flow.form.agreementDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="agreement-title">{t("flow.form.agreementName")}</Label>
            <Input
              id="agreement-title"
              value={title}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("flow.form.cancel")}
            </Button>
            <Button type="submit" disabled={!title.trim() || create.isPending}>
              {create.isPending ? t("flow.form.sending") : t("flow.form.createAgreement")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Either party: upload the contract (PDF) or link it as a new version. */
export function AgreementVersionDialog({
  open,
  onOpenChange,
  mutations,
  agreementId,
}: DialogProps & { agreementId: string | null }) {
  const { t } = useTranslation("deals");
  const [file, setFile] = React.useState<File | null>(null);
  const [url, setUrl] = React.useState("");
  const add = mutations.addAgreementVersion;
  const urlValid = url.trim() === "" || /^https?:\/\/\S+$/i.test(url.trim());
  const canSubmit =
    agreementId !== null &&
    (file !== null || url.trim() !== "") &&
    urlValid &&
    !(file && file.size > MAX_FILE_BYTES) &&
    !add.isPending;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !agreementId) return;
    add.mutate(
      { agreementId, file, contentUrl: url.trim() || undefined },
      {
        onSuccess: () => {
          setFile(null);
          setUrl("");
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t("flow.form.versionTitle")}</DialogTitle>
            <DialogDescription>{t("flow.form.versionDescription")}</DialogDescription>
          </DialogHeader>
          <FileField id="agreement-file" label={t("flow.form.contractFile")} accept=".pdf,.docx" file={file} onChange={setFile} />
          <div className="space-y-1.5">
            <Label htmlFor="agreement-url">{t("flow.form.contractUrl")}</Label>
            <Input
              id="agreement-url"
              type="url"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://"
              aria-invalid={!urlValid}
            />
            {!urlValid && <p className="text-xs text-destructive">{t("flow.form.urlInvalid")}</p>}
          </div>
          <p className="text-xs text-muted-foreground">{t("flow.form.versionHint")}</p>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("flow.form.cancel")}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {add.isPending ? t("flow.form.uploading") : t("flow.form.addVersion")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Buyer, manual payments: "I have paid", with an optional transfer reference. */
export function MarkPaidDialog({
  open,
  onOpenChange,
  mutations,
  amountLabel,
  instructions,
}: DialogProps & { amountLabel: string; instructions: string }) {
  const { t } = useTranslation("deals");
  const [reference, setReference] = React.useState("");
  const markPaid = mutations.markPaid;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (markPaid.isPending) return;
    markPaid.mutate(reference.trim() || undefined, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t("flow.form.markPaidTitle")}</DialogTitle>
            <DialogDescription>{t("flow.form.markPaidDescription", { amount: amountLabel })}</DialogDescription>
          </DialogHeader>
          {instructions && (
            <div className="whitespace-pre-line rounded-md border border-border/60 bg-muted/30 p-3 text-xs">
              {instructions}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="payment-reference">{t("flow.form.paymentReference")}</Label>
            <Input
              id="payment-reference"
              value={reference}
              maxLength={200}
              onChange={(e) => setReference(e.target.value)}
              placeholder={t("flow.form.paymentReferencePlaceholder")}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("flow.form.cancel")}
            </Button>
            <Button type="submit" disabled={markPaid.isPending}>
              {markPaid.isPending ? t("flow.form.sending") : t("flow.action.markPaid")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
