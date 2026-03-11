import { ModulePlaceholderPage } from "@/shared/components/ModulePlaceholderPage";
import { useI18n } from "@/shared/i18n/useI18n";

export function ContactsPage() {
  const { t } = useI18n();

  return (
    <ModulePlaceholderPage
      eyebrow={t("pages.debtNegotiation.contacts.eyebrow")}
      title={t("pages.debtNegotiation.contacts.title")}
      description={t("pages.debtNegotiation.contacts.description")}
      primaryActionLabel={t("pages.debtNegotiation.contacts.action")}
    />
  );
}
