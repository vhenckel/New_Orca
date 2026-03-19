import { Badge } from "@/shared/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import type { PayoutStatus } from "@/modules/finance/types/payouts";
import { useI18n } from "@/shared/i18n/useI18n";

const statusStyle: Record<PayoutStatus, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  canceled: "bg-muted text-muted-foreground border-border",
};

export function PayoutStatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const normalized = status in statusStyle ? (status as PayoutStatus) : null;
  if (!normalized) return <Badge variant="outline" className="w-full justify-center">{status}</Badge>;

  const statusLabel: Record<PayoutStatus, string> = {
    pending: t("components.finance.payoutStatus.pending.label"),
    paid: t("components.finance.payoutStatus.paid.label"),
    canceled: t("components.finance.payoutStatus.canceled.label"),
  };
  const statusDescription: Record<PayoutStatus, string> = {
    pending: t("components.finance.payoutStatus.pending.description"),
    paid: t("components.finance.payoutStatus.paid.description"),
    canceled: t("components.finance.payoutStatus.canceled.description"),
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className={`w-full justify-center ${statusStyle[normalized]}`}>
          {statusLabel[normalized]}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{statusDescription[normalized]}</TooltipContent>
    </Tooltip>
  );
}
