import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { ModulePlaceholderPage } from "@/shared/components/ModulePlaceholderPage";
import { useI18n } from "@/shared/i18n/useI18n";

export function ChargesPage() {
  const { t } = useI18n();

  return (
    <DashboardPageLayout
      title={t("pages.collections.charges.title")}
      subtitle={t("pages.collections.charges.description")}
      modulePageBreadcrumb={{
        moduleTitleKey: "modules.collections.title",
        moduleHref: "/collections",
        pageTitle: t("modules.collections.routes.charges.label"),
      }}
    >
      <ModulePlaceholderPage
        headerInLayout
        eyebrow={t("pages.collections.charges.eyebrow")}
        title={t("pages.collections.charges.title")}
        description={t("pages.collections.charges.description")}
        primaryActionLabel={t("pages.collections.charges.action")}
      />
    </DashboardPageLayout>
  );
}
