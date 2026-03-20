import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { ModulePlaceholderPage } from "@/shared/components/ModulePlaceholderPage";
import { useI18n } from "@/shared/i18n/useI18n";

export function ContactsPage() {
  const { t } = useI18n();

  return (
    <DashboardPageLayout
      title={t("pages.collections.contacts.title")}
      subtitle={t("pages.collections.contacts.description")}
      modulePageBreadcrumb={{
        moduleTitleKey: "modules.collections.title",
        moduleHref: "/collections",
        pageTitle: t("modules.collections.routes.contacts.label"),
      }}
    >
      <ModulePlaceholderPage
        headerInLayout
        eyebrow={t("pages.collections.contacts.eyebrow")}
        title={t("pages.collections.contacts.title")}
        description={t("pages.collections.contacts.description")}
        primaryActionLabel={t("pages.collections.contacts.action")}
      />
    </DashboardPageLayout>
  );
}
