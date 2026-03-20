import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { ModulePlaceholderPage } from "@/shared/components/ModulePlaceholderPage";
import { useI18n } from "@/shared/i18n/useI18n";

export function ContactsPage() {
  const { t } = useI18n();

  return (
    <DashboardPageLayout
      title={t("pages.sales.contacts.title")}
      subtitle={t("pages.sales.contacts.description")}
      modulePageBreadcrumb={{
        moduleTitleKey: "modules.sales.title",
        moduleHref: "/sales",
        pageTitle: t("modules.sales.routes.contacts.label"),
      }}
    >
      <ModulePlaceholderPage
        headerInLayout
        eyebrow={t("pages.sales.contacts.eyebrow")}
        title={t("pages.sales.contacts.title")}
        description={t("pages.sales.contacts.description")}
        primaryActionLabel={t("pages.sales.contacts.action")}
      />
    </DashboardPageLayout>
  );
}
