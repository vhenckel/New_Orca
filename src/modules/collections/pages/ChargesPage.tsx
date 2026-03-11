import { ModulePlaceholderPage } from "@/shared/components/ModulePlaceholderPage";
import { useI18n } from "@/shared/i18n/useI18n";

export function ChargesPage() {
  const { t } = useI18n();

  return (
    <ModulePlaceholderPage
      eyebrow={t("pages.collections.charges.eyebrow")}
      title={t("pages.collections.charges.title")}
      description={t("pages.collections.charges.description")}
      primaryActionLabel={t("pages.collections.charges.action")}
    />
  );
}
