import { DebtNegotiationDetailDrilldown } from "@/modules/debt-negotiation/pages/DebtNegotiationDetailDrilldown";
import { useRecoveredDetailsListQueryState } from "@/shared/lib/nuqs-filters";

export function RecoveredDetailsPage() {
  const listState = useRecoveredDetailsListQueryState();
  return <DebtNegotiationDetailDrilldown variant="recovered" listState={listState} />;
}
