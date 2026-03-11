import { ModulePlaceholderPage } from "@/shared/components/ModulePlaceholderPage";
import { useI18n } from "@/shared/i18n/useI18n";

export function ContactsPage() {
  const { t } = useI18n();

  return (
    <ModulePlaceholderPage
      eyebrow={t("pages.collections.contacts.eyebrow")}
      title={t("pages.collections.contacts.title")}
      description={t("pages.collections.contacts.description")}
      primaryActionLabel={t("pages.collections.contacts.action")}
    />
  );
}
