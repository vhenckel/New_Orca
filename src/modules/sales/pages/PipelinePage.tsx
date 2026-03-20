import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { ModulePlaceholderPage } from "@/shared/components/ModulePlaceholderPage";
import { useI18n } from "@/shared/i18n/useI18n";

export function PipelinePage() {
  const { t } = useI18n();

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.sales.routes.pipeline.label")}
      subtitle={t("modules.sales.routes.pipeline.description")}
    >
      <ModulePlaceholderPage
        headerInLayout
        primaryActionLabel={t("pages.sales.pipeline.action")}
      />
    </DashboardPageLayout>
  );
}
