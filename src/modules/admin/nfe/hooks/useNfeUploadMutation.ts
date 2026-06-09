import { useMutation } from "@tanstack/react-query";

import { buildNfeDownloadFilename, uploadNfeFiles } from "@/modules/admin/nfe/api/nfe-api";
import type { NfeUploadResult } from "@/modules/admin/nfe/types";
import { ApiError } from "@/shared/api/http-client";
import { useI18n } from "@/shared/i18n/useI18n";
import { toast } from "@/shared/ui/sonner";

export function useNfeUploadMutation() {
  const { t } = useI18n();

  return useMutation({
    mutationFn: async (files: File[]): Promise<NfeUploadResult> => {
      const csvText = await uploadNfeFiles(files);
      return {
        csvText,
        downloadFilename: buildNfeDownloadFilename(),
      };
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiError ? error.message : t("modules.admin.nfe.toast.uploadError");
      toast.error(t("modules.admin.nfe.toast.errorTitle"), { description: message });
    },
  });
}
