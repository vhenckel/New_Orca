import { ModulePlaceholderPage } from "@/shared/components/ModulePlaceholderPage";
import { useI18n } from "@/shared/i18n/useI18n";

export function DashboardPage() {
  const { t } = useI18n();

  return (
    <ModulePlaceholderPage
      eyebrow={t("pages.collections.dashboard.eyebrow")}
      title={t("pages.collections.dashboard.title")}
      description={t("pages.collections.dashboard.description")}
      primaryActionLabel={t("pages.collections.dashboard.action")}
    />
  );
}
