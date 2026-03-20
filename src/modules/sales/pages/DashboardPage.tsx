import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { ModulePlaceholderPage } from "@/shared/components/ModulePlaceholderPage";
import { useI18n } from "@/shared/i18n/useI18n";

export function DashboardPage() {
  const { t } = useI18n();

  return (
    <DashboardPageLayout
      title={t("pages.sales.dashboard.title")}
      subtitle={t("pages.sales.dashboard.description")}
      modulePageBreadcrumb={{
        moduleTitleKey: "modules.sales.title",
        moduleHref: "/sales",
        pageTitle: t("modules.sales.routes.dashboard.label"),
      }}
    >
      <ModulePlaceholderPage
        headerInLayout
        eyebrow={t("pages.sales.dashboard.eyebrow")}
        title={t("pages.sales.dashboard.title")}
        description={t("pages.sales.dashboard.description")}
        primaryActionLabel={t("pages.sales.dashboard.action")}
      />
    </DashboardPageLayout>
  );
}
