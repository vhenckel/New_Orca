import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { usePayoutInvoice } from "@/modules/finance/hooks/usePayoutInvoice";
import { useUpdatePayoutStatus } from "@/modules/finance/hooks/useUpdatePayoutStatus";
import {
  uploadPayoutInvoicePdf,
  uploadPayoutInvoiceXml,
} from "@/modules/finance/services/payouts";
import type { PayoutDayDto, PayoutStatus } from "@/modules/finance/types/payouts";
import { PayoutInvoiceAttached } from "@/modules/finance/components/PayoutInvoiceAttached";
import { Button } from "@/shared/ui/button";
import { useI18n } from "@/shared/i18n/useI18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { toast } from "@/shared/ui/sonner";
import { Textarea } from "@/shared/ui/textarea";

interface PayoutChangesModalProps {
  open: boolean;
  payout: PayoutDayDto | null;
  readOnly?: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayoutChangesModal({
  open,
  payout,
  readOnly = false,
  onOpenChange,
}: PayoutChangesModalProps) {
  const { t } = useI18n();
  const payoutId = payout?.payoutId ?? null;
  const { data: invoiceData, refetch: refetchInvoice } = usePayoutInvoice(payoutId, open && !!payoutId);
  const { mutateAsync: mutateStatus, isPending } = useUpdatePayoutStatus(payoutId);

  const [status, setStatus] = useState<PayoutStatus>("pending");
  const [scheduledDate, setScheduledDate] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const [notes, setNotes] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [clearPdf, setClearPdf] = useState(false);
  const [clearXml, setClearXml] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [invoiceFiles, setInvoiceFiles] = useState<File[]>([]);

  const hasPdf = !!invoiceData?.pdfUrl && !clearPdf;
  const hasXml = !!invoiceData?.xmlUrl && !clearXml;
  const statusOptions = useMemo(
    () => [
      { value: "pending" as PayoutStatus, label: t("components.finance.payoutStatus.pending.label") },
      { value: "paid" as PayoutStatus, label: t("components.finance.payoutStatus.paid.label") },
      { value: "canceled" as PayoutStatus, label: t("components.finance.payoutStatus.canceled.label") },
    ],
    [t],
  );

  useEffect(() => {
    if (!open || !payout) return;
    setStatus((payout.status as PayoutStatus) ?? "pending");
    setScheduledDate(payout.date ? payout.date.slice(0, 10) : "");
    setPaidAt("");
    setNotes("");
    setPreviewOpen(false);
    setClearPdf(false);
    setClearXml(false);
    setInvoiceFiles([]);
  }, [open, payout]);

  const modalSubtitle = useMemo(
    () =>
      readOnly
        ? t("components.finance.payoutChangesModal.subtitle.readOnly")
        : t("components.finance.payoutChangesModal.subtitle.edit"),
    [readOnly, t],
  );

  async function handleSubmit() {
    if (!payoutId) return;
    try {
      setUploading(true);
      for (const file of invoiceFiles) {
        const lower = file.name.toLowerCase();
        if (lower.endsWith(".xml")) await uploadPayoutInvoiceXml(payoutId, file);
        if (lower.endsWith(".pdf")) await uploadPayoutInvoicePdf(payoutId, file);
      }
      await mutateStatus({
        status,
        notes: notes.trim() ? { text: notes.trim() } : undefined,
        scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
        paidAt: paidAt ? new Date(paidAt).toISOString() : undefined,
        clearInvoicePdf: clearPdf || undefined,
        clearInvoiceXml: clearXml || undefined,
      });
      toast.success(t("components.finance.payoutChangesModal.success"));
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("components.finance.payoutChangesModal.error"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("components.finance.payoutChangesModal.title")}</DialogTitle>
          <DialogDescription>{modalSubtitle}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>{t("components.finance.payoutChangesModal.scheduledDate")}</Label>
            <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} disabled />
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("components.finance.payoutChangesModal.status")}</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as PayoutStatus)} disabled={readOnly}>
              <SelectTrigger>
                <SelectValue placeholder={t("components.finance.payoutChangesModal.status.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("components.finance.payoutChangesModal.paidAt")}</Label>
            <Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} disabled={readOnly} />
          </div>

          {hasPdf || hasXml ? (
            <PayoutInvoiceAttached
              invoiceData={invoiceData}
              hasPdf={hasPdf}
              hasXml={hasXml}
              readOnly={readOnly}
              previewOpen={previewOpen}
              onPreviewChange={(next) => {
                setPreviewOpen(next);
                if (next) void refetchInvoice();
              }}
              onClearPdf={() => setClearPdf(true)}
              onClearXml={() => setClearXml(true)}
            />
          ) : null}

          {!readOnly ? (
            <div className="flex flex-col gap-2">
              <Label>
                {hasPdf || hasXml
                  ? t("components.finance.payoutChangesModal.invoice.replace")
                  : t("components.finance.payoutChangesModal.invoice")}
              </Label>
              <Input
                type="file"
                accept=".pdf,.xml"
                multiple
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []).filter((file) => {
                    const lower = file.name.toLowerCase();
                    return lower.endsWith(".pdf") || lower.endsWith(".xml");
                  });
                  setInvoiceFiles(files.slice(-2));
                }}
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <Label>{t("components.finance.payoutChangesModal.notes")}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("components.finance.payoutChangesModal.notes.placeholder")}
              disabled={readOnly}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.actions.cancel")}
          </Button>
          {!readOnly ? (
            <Button type="button" onClick={handleSubmit} disabled={isPending || uploading}>
              {isPending || uploading ? <Loader2 data-icon="inline-start" className="mr-2 animate-spin" /> : null}
              {t("components.finance.payoutChangesModal.save")}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
