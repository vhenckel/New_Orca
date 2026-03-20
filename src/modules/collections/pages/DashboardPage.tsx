import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { ModulePlaceholderPage } from "@/shared/components/ModulePlaceholderPage";
import { useI18n } from "@/shared/i18n/useI18n";

export function DashboardPage() {
  const { t } = useI18n();

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.collections.routes.dashboard.label")}
      subtitle={t("modules.collections.routes.dashboard.description")}
    >
      <ModulePlaceholderPage
        headerInLayout
        primaryActionLabel={t("pages.collections.dashboard.action")}
      />
    </DashboardPageLayout>
  );
}
