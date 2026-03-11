import { ModulePlaceholderPage } from "@/shared/components/ModulePlaceholderPage";
import { useI18n } from "@/shared/i18n/useI18n";

export function ContactsPage() {
  const { t } = useI18n();

  return (
    <ModulePlaceholderPage
      eyebrow={t("pages.sales.contacts.eyebrow")}
      title={t("pages.sales.contacts.title")}
      description={t("pages.sales.contacts.description")}
      primaryActionLabel={t("pages.sales.contacts.action")}
    />
  );
}
