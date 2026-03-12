import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";
import { getStageI18nKey, statusBadgeClass } from "./statusBadgeClass";

export function StatusBadge({ stageName }: { stageName: string }) {
  const { t } = useI18n();
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusBadgeClass(stageName),
      )}
    >
      {t(getStageI18nKey(stageName))}
    </span>
  );
}
