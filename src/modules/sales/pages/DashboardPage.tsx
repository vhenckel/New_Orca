import { ModulePlaceholderPage } from "@/shared/components/ModulePlaceholderPage";
import { useI18n } from "@/shared/i18n/useI18n";

export function DashboardPage() {
  const { t } = useI18n();

  return (
    <ModulePlaceholderPage
      eyebrow={t("pages.sales.dashboard.eyebrow")}
      title={t("pages.sales.dashboard.title")}
      description={t("pages.sales.dashboard.description")}
      primaryActionLabel={t("pages.sales.dashboard.action")}
    />
  );
}
