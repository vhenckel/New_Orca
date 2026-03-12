import { Link } from "react-router-dom";

import { usePendingPaymentConfirmations } from "@/modules/debt-negotiation/hooks/usePendingPaymentConfirmations";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";

const DEBTS_CONFIRMATION_PATH = "/debt-negotiation/debts?statuses=11";

export function PendingPaymentBanner() {
  const { t } = useI18n();
  const { data } = usePendingPaymentConfirmations(true);

  if (!data?.hasPending) return null;

  return (
    <div className="flex w-full items-center justify-between gap-4 bg-destructive px-6 py-3 text-destructive-foreground">
      <p className="text-sm font-medium">
        {t("pages.debtNegotiation.pendingBanner.message")}
      </p>
      <Button asChild size="sm" variant="secondary" className="shrink-0">
        <Link to={DEBTS_CONFIRMATION_PATH}>{t("pages.debtNegotiation.pendingBanner.viewDebts")}</Link>
      </Button>
    </div>
  );
}
