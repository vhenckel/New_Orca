import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { ModulePlaceholderPage } from "@/shared/components/ModulePlaceholderPage";
import { useI18n } from "@/shared/i18n/useI18n";

export function DashboardPage() {
  const { t } = useI18n();

  return (
    <DashboardPageLayout
      title={t("pages.collections.dashboard.title")}
      subtitle={t("pages.collections.dashboard.description")}
      modulePageBreadcrumb={{
        moduleTitleKey: "modules.collections.title",
        moduleHref: "/collections",
        pageTitle: t("modules.collections.routes.dashboard.label"),
      }}
    >
      <ModulePlaceholderPage
        headerInLayout
        eyebrow={t("pages.collections.dashboard.eyebrow")}
        title={t("pages.collections.dashboard.title")}
        description={t("pages.collections.dashboard.description")}
        primaryActionLabel={t("pages.collections.dashboard.action")}
      />
    </DashboardPageLayout>
  );
}
