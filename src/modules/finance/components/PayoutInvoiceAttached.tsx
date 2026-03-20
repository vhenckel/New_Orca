import type { ReactNode } from "react";
import { CheckCircle2, FileCode2, FileText, Trash2 } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/ui/accordion";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { useI18n } from "@/shared/i18n/useI18n";
import type { PayoutInvoiceDto } from "@/modules/finance/types/payouts";

interface PayoutInvoiceAttachedProps {
  invoiceData?: PayoutInvoiceDto;
  hasPdf: boolean;
  hasXml: boolean;
  previewOpen: boolean;
  readOnly?: boolean;
  onClearPdf: () => void;
  onClearXml: () => void;
  onPreviewChange: (open: boolean) => void;
}

function InvoiceItem({
  label,
  url,
  readOnly,
  icon,
  onClear,
  removeAria,
  downloadLabel,
}: {
  label: string;
  url: string;
  readOnly: boolean;
  icon: ReactNode;
  onClear: () => void;
  removeAria: string;
  downloadLabel: string;
}) {
  return (
    <Card className="flex items-center gap-3 border-blue-300 p-4">
      <div className="text-blue-600">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium">
          {label} <CheckCircle2 className="ml-1 inline h-4 w-4 text-blue-600" />
        </p>
        <a href={url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">
          {downloadLabel}
        </a>
      </div>
      {!readOnly ? (
        <Button type="button" variant="ghost" size="icon" onClick={onClear} aria-label={removeAria}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ) : null}
    </Card>
  );
}

export function PayoutInvoiceAttached({
  invoiceData,
  hasPdf,
  hasXml,
  previewOpen,
  readOnly = false,
  onClearPdf,
  onClearXml,
  onPreviewChange,
}: PayoutInvoiceAttachedProps) {
  const { t } = useI18n();
  if (!hasPdf && !hasXml) return null;

  return (
    <div className="space-y-3">
      {hasPdf && invoiceData?.pdfUrl ? (
        <InvoiceItem
          label={t("components.finance.payoutInvoiceAttached.pdf")}
          url={invoiceData.pdfUrl}
          readOnly={readOnly}
          onClear={onClearPdf}
          icon={<FileText className="h-6 w-6" />}
          removeAria={t("components.finance.payoutInvoiceAttached.removeAria", {
            label: t("components.finance.payoutInvoiceAttached.pdf"),
          })}
          downloadLabel={t("components.finance.payoutInvoiceAttached.download")}
        />
      ) : null}
      {hasXml && invoiceData?.xmlUrl ? (
        <InvoiceItem
          label={t("components.finance.payoutInvoiceAttached.xml")}
          url={invoiceData.xmlUrl}
          readOnly={readOnly}
          onClear={onClearXml}
          icon={<FileCode2 className="h-6 w-6" />}
          removeAria={t("components.finance.payoutInvoiceAttached.removeAria", {
            label: t("components.finance.payoutInvoiceAttached.xml"),
          })}
          downloadLabel={t("components.finance.payoutInvoiceAttached.download")}
        />
      ) : null}
      {hasPdf && invoiceData?.pdfUrl ? (
        <Accordion
          type="single"
          collapsible
          value={previewOpen ? "preview" : ""}
          onValueChange={(value) => onPreviewChange(value === "preview")}
        >
          <AccordionItem value="preview">
            <AccordionTrigger>{t("components.finance.payoutInvoiceAttached.preview")}</AccordionTrigger>
            <AccordionContent>
              <iframe
                title={t("components.finance.payoutInvoiceAttached.previewTitle")}
                src={invoiceData.pdfUrl}
                className="h-80 w-full rounded border"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : null}
    </div>
  );
}
