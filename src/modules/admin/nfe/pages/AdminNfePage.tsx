import { Download, LoaderCircle, Upload } from "lucide-react";
import { useEffect, useState } from "react";

import { NfeFileDropzone } from "@/modules/admin/nfe/components/NfeFileDropzone";
import { useNfeUploadMutation } from "@/modules/admin/nfe/hooks/useNfeUploadMutation";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { PageActionBar } from "@/shared/components/page-action-bar";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { FieldError, FieldGroup } from "@/shared/ui/field";
import { toast } from "@/shared/ui/sonner";

export function AdminNfePage() {
  const { t } = useI18n();
  const [files, setFiles] = useState<File[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string | null>(null);

  const { mutate: upload, isPending } = useNfeUploadMutation();

  const clearDownloadLink = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
      setDownloadFilename(null);
    }
  };

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const handleFilesChange = (nextFiles: File[]) => {
    if (nextFiles.length > 0 && downloadUrl) {
      clearDownloadLink();
    }
    setFiles(nextFiles);
    setValidationError(null);
  };

  const handleSubmit = () => {
    if (files.length === 0) {
      setValidationError(t("modules.admin.nfe.errors.fileRequired"));
      return;
    }

    upload(files, {
      onSuccess: (result) => {
        clearDownloadLink();
        const blob = new Blob([result.csvText], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setDownloadFilename(result.downloadFilename);
        toast.success(t("modules.admin.nfe.toast.successTitle"), {
          description: t("modules.admin.nfe.toast.successDescription"),
        });
        setFiles([]);
      },
    });
  };

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.admin.nfe.title")}
      subtitle={t("modules.admin.nfe.description")}
    >
      <Card>
        <CardContent className="flex flex-col gap-6 pt-6">
          <FieldGroup>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium leading-none">{t("modules.admin.nfe.selectFilesTitle")}</p>
              <p className="text-sm text-muted-foreground">{t("modules.admin.nfe.filesHint")}</p>
            </div>

            <NfeFileDropzone files={files} disabled={isPending} onFilesChange={handleFilesChange} />

            {validationError ? <FieldError>{validationError}</FieldError> : null}

            <PageActionBar>
              {downloadUrl && downloadFilename ? (
                <Button variant="outline" asChild>
                  <a href={downloadUrl} download={downloadFilename}>
                    <Download data-icon="inline-start" />
                    {t("modules.admin.nfe.downloadCsv")}
                  </a>
                </Button>
              ) : null}
              <Button type="button" disabled={isPending} onClick={handleSubmit}>
                {isPending ? (
                  <LoaderCircle className="animate-spin" data-icon="inline-start" />
                ) : (
                  <Upload data-icon="inline-start" />
                )}
                {t("modules.admin.nfe.submit")}
              </Button>
            </PageActionBar>
          </FieldGroup>
        </CardContent>
      </Card>
    </DashboardPageLayout>
  );
}
