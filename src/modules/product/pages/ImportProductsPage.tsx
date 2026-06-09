import { Download, LoaderCircle, Upload } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { downloadImportTemplate } from "@/modules/product/api/import-api";
import { useImportProducts } from "@/modules/product/hooks/useImportProducts";
import { useProductListSupportQueries } from "@/modules/product/hooks/useProductListSupportQueries";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { PageActionBar } from "@/shared/components/page-action-bar";
import { useApiUserRole } from "@/shared/auth/use-api-user";
import { useI18n } from "@/shared/i18n/useI18n";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Progress } from "@/shared/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { toast } from "@/shared/ui/sonner";

const MAX_FILE_BYTES = 2 * 1024 * 1024;

export function ImportProductsPage() {
  const { t } = useI18n();
  const role = useApiUserRole();
  const [file, setFile] = useState<File | null>(null);
  const [establishmentId, setEstablishmentId] = useState<string>("");
  const { upload, isUploading, progress, percentage, isProcessing, hasError } = useImportProducts();
  const { establishments } = useProductListSupportQueries(role);

  const handleDownloadTemplate = async () => {
    try {
      await downloadImportTemplate();
    } catch {
      toast.error(t("modules.product.import.toast.templateError"));
    }
  };

  const handleSubmit = () => {
    if (!file) {
      toast.error(t("modules.product.import.errors.fileRequired"));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error(t("modules.product.import.errors.fileTooLarge"));
      return;
    }
    upload({
      file,
      establishmentId: establishmentId || undefined,
    });
    setFile(null);
  };

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.product.import.title")}
      subtitle={t("modules.product.import.subtitle")}
    >
      <div className="flex flex-col gap-4">
        <Button variant="ghost" className="h-9 w-fit px-2 text-muted-foreground" asChild>
          <Link to="/products">{t("modules.product.list.pageTitle")}</Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{t("modules.product.import.cardTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {isProcessing ? (
              <div className="flex flex-col gap-2">
                <Label>{t("modules.product.import.progress")}</Label>
                <Progress value={percentage} />
                <p className="text-sm text-muted-foreground">
                  {t("modules.product.import.progressDetail", {
                    processed: progress?.processedRows ?? 0,
                    total: progress?.totalRows ?? 0,
                  })}
                </p>
              </div>
            ) : null}

            {hasError && progress?.rowErrors?.length ? (
              <Collapsible defaultOpen className="rounded-lg border">
                <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium">
                  {t("modules.product.import.rowErrorsTitle")}
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-col gap-2 px-4 pb-4 text-sm">
                  {progress.rowErrors.map((item, index) => (
                    <div key={index} className="rounded-md border p-3">
                      <p className="font-medium">
                        {t("modules.product.import.rowErrorsRows", {
                          rows: item.rows.join(", "),
                        })}
                      </p>
                      <ul className="mt-1 list-inside list-disc text-muted-foreground">
                        {item.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ) : null}

            {progress?.systemError ? (
              <p className="text-sm text-destructive">{progress.systemError}</p>
            ) : null}

            {establishments.length > 0 ? (
              <div className="flex flex-col gap-2">
                <Label>{t("modules.product.import.establishment")}</Label>
                <Select
                  value={establishmentId || "__none__"}
                  onValueChange={(v) => setEstablishmentId(v === "__none__" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("modules.product.import.establishmentPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">{t("modules.product.import.establishmentNone")}</SelectItem>
                    {establishments.map((est) => (
                      <SelectItem key={est.id} value={est.id}>
                        {est.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <Label htmlFor="import-file">{t("modules.product.import.file")}</Label>
              <Input
                id="import-file"
                type="file"
                accept=".csv,text/csv"
                disabled={isUploading || isProcessing}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-muted-foreground">{t("modules.product.import.fileHint")}</p>
            </div>

            <PageActionBar>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => void handleDownloadTemplate()}
              >
                <Download className="size-4" />
                {t("modules.product.import.downloadTemplate")}
              </Button>
              <Button
                type="button"
                className="gap-2 text-white"
                disabled={isUploading || isProcessing}
                onClick={handleSubmit}
              >
                {isUploading ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}
                {t("modules.product.import.submit")}
              </Button>
            </PageActionBar>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  );
}
