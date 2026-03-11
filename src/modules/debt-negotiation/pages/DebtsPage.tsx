import { ModulePlaceholderPage } from "@/shared/components/ModulePlaceholderPage";
import { useI18n } from "@/shared/i18n/useI18n";

export function DebtsPage() {
  const { t } = useI18n();

  return (
    <ModulePlaceholderPage
      eyebrow={t("pages.debtNegotiation.debts.eyebrow")}
      title={t("pages.debtNegotiation.debts.title")}
      description={t("pages.debtNegotiation.debts.description")}
      primaryActionLabel={t("pages.debtNegotiation.debts.action")}
    />
  );
}
