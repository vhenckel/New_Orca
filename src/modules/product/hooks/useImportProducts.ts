import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import {
  fetchImportProgress,
  uploadProductsCsv,
  type ImportProgress,
} from "@/modules/product/api/import-api";
import { ApiError } from "@/shared/api/http-client";
import { useI18n } from "@/shared/i18n/useI18n";
import { captureError } from "@/shared/observability/sentry";
import { toast } from "@/shared/ui/sonner";

function handleImportFinished(
  progress: ImportProgress,
  t: (key: string, params?: Record<string, unknown>) => string,
  queryClient: ReturnType<typeof useQueryClient>,
  onDone: () => void,
) {
  if (progress.rowErrors?.length) {
    toast.error(t("modules.product.import.toast.rowErrors"));
  } else if ((progress.successRows ?? 0) > 0) {
    toast.success(
      t("modules.product.import.toast.success", {
        count: progress.successRows ?? 0,
      }),
    );
  } else {
    toast.error(t("modules.product.import.toast.empty"));
  }

  void queryClient.invalidateQueries({ queryKey: ["products", "list"] });
  void queryClient.invalidateQueries({ queryKey: ["establishment-products", "list"] });
  onDone();
}

export function useImportProducts() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [processId, setProcessId] = useState<string | undefined>();
  const [progress, setProgress] = useState<ImportProgress | undefined>();
  const completionHandled = useRef(false);

  const uploadMutation = useMutation({
    mutationFn: uploadProductsCsv,
    onSuccess: (data) => {
      completionHandled.current = false;
      setProcessId(data.processId);
      toast.success(data.message || t("modules.product.import.toast.started"));
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiError
          ? error.message
          : t("modules.product.import.toast.uploadError");
      toast.error(message);
    },
  });

  useEffect(() => {
    if (!processId) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const next = await fetchImportProgress(processId);
        if (cancelled) return;
        setProgress(next);

        if (next.isFinished && !completionHandled.current) {
          completionHandled.current = true;
          handleImportFinished(next, t, queryClient, () => {
            setProcessId(undefined);
            setProgress(undefined);
          });
          return;
        }
      } catch (error) {
        if (!cancelled) {
          const err =
            error instanceof Error
              ? error
              : new Error("Falha ao consultar progresso da importação");
          captureError(err, {
            tags: {
              subsystem: "import-polling",
              handled: "true",
            },
            extra: { processId },
            fingerprint: ["import-polling", processId],
          });
          toast.error(t("modules.product.import.toast.progressError"));
          setProcessId(undefined);
        }
      }
    };

    void poll();
    const interval = window.setInterval(() => void poll(), 1000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [processId, queryClient, t]);

  const isProcessing =
    Boolean(progress) &&
    !progress?.isFinished &&
    (progress?.status === "processing" || progress?.status === "pending");

  return {
    upload: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    progress,
    percentage: progress?.progress ?? 0,
    isProcessing: Boolean(processId) && (isProcessing || uploadMutation.isSuccess),
    hasError: Boolean(progress?.systemError) || (progress?.rowErrors?.length ?? 0) > 0,
    processId,
  };
}
