import { DebtNegotiationDetailDrilldown } from "@/modules/debt-negotiation/pages/DebtNegotiationDetailDrilldown";
import { useNegotiatedDetailsListQueryState } from "@/shared/lib/nuqs-filters";

export function NegotiatedDetailsPage() {
  const listState = useNegotiatedDetailsListQueryState();
  return <DebtNegotiationDetailDrilldown variant="negotiated" listState={listState} />;
}
