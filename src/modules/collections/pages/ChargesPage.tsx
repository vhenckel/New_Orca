import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { ModulePlaceholderPage } from "@/shared/components/ModulePlaceholderPage";
import { useI18n } from "@/shared/i18n/useI18n";

export function ChargesPage() {
  const { t } = useI18n();

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.collections.routes.charges.label")}
      subtitle={t("modules.collections.routes.charges.description")}
    >
      <ModulePlaceholderPage
        headerInLayout
        primaryActionLabel={t("pages.collections.charges.action")}
      />
    </DashboardPageLayout>
  );
}
