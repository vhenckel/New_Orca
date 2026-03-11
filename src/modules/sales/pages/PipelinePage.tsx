import { ModulePlaceholderPage } from "@/shared/components/ModulePlaceholderPage";
import { useI18n } from "@/shared/i18n/useI18n";

export function PipelinePage() {
  const { t } = useI18n();

  return (
    <ModulePlaceholderPage
      eyebrow={t("pages.sales.pipeline.eyebrow")}
      title={t("pages.sales.pipeline.title")}
      description={t("pages.sales.pipeline.description")}
      primaryActionLabel={t("pages.sales.pipeline.action")}
    />
  );
}
