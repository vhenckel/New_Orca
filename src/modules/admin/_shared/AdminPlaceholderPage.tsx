import { Link } from "react-router-dom";

import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import type { TranslationKey } from "@/shared/i18n/config";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";

interface AdminPlaceholderPageProps {
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
}

export function AdminPlaceholderPage({ titleKey, subtitleKey }: AdminPlaceholderPageProps) {
  const { t } = useI18n();

  return (
    <DashboardPageLayout showPageHeader title={t(titleKey)} subtitle={t(subtitleKey)}>
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-card/40 p-8 text-center">
        <p className="text-sm text-muted-foreground">{t("modules.admin.placeholder.comingSoon")}</p>
        <Button variant="outline" asChild>
          <Link to="/admin/dashboard">{t("modules.admin.placeholder.backToDashboard")}</Link>
        </Button>
      </div>
    </DashboardPageLayout>
  );
}
