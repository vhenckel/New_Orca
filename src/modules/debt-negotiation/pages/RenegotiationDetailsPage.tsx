import { DebtNegotiationDetailDrilldown } from "@/modules/debt-negotiation/pages/DebtNegotiationDetailDrilldown";
import { useRenegotiationDetailsListQueryState } from "@/shared/lib/nuqs-filters";

export function RenegotiationDetailsPage() {
  const listState = useRenegotiationDetailsListQueryState();
  return <DebtNegotiationDetailDrilldown variant="renegotiation" listState={listState} />;
}
