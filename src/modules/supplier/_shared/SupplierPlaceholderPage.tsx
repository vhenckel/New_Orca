import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import type { TranslationKey } from "@/shared/i18n/config";
import { useI18n } from "@/shared/i18n/useI18n";

interface SupplierPlaceholderPageProps {
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
}

export function SupplierPlaceholderPage({
  titleKey,
  subtitleKey,
}: SupplierPlaceholderPageProps) {
  const { t } = useI18n();

  return (
    <DashboardPageLayout showPageHeader title={t(titleKey)} subtitle={t(subtitleKey)}>
      <div className="flex min-h-[40vh] items-center justify-center rounded-lg border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
        {t("modules.supplierPortal.placeholder.comingSoon")}
      </div>
    </DashboardPageLayout>
  );
}
