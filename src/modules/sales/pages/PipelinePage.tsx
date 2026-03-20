import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { ModulePlaceholderPage } from "@/shared/components/ModulePlaceholderPage";
import { useI18n } from "@/shared/i18n/useI18n";

export function PipelinePage() {
  const { t } = useI18n();

  return (
    <DashboardPageLayout
      title={t("pages.sales.pipeline.title")}
      subtitle={t("pages.sales.pipeline.description")}
      modulePageBreadcrumb={{
        moduleTitleKey: "modules.sales.title",
        moduleHref: "/sales",
        pageTitle: t("modules.sales.routes.pipeline.label"),
      }}
    >
      <ModulePlaceholderPage
        headerInLayout
        eyebrow={t("pages.sales.pipeline.eyebrow")}
        title={t("pages.sales.pipeline.title")}
        description={t("pages.sales.pipeline.description")}
        primaryActionLabel={t("pages.sales.pipeline.action")}
      />
    </DashboardPageLayout>
  );
}
