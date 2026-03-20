import { StatusBadge } from "@/modules/debt-negotiation/components/StatusBadge";

export const DEBT_NEGOTIATION_STATUS_BADGE_WIDTH_PX = 200;

type NegotiationStatusBadgeProps = {
  stageName: string;
  showAlert?: boolean;
  alertMessage?: string;
};

/**
 * Wrapper "único" para badge de status da renegociação.
 * Garante tamanho/captura de layout consistentes em tabela e telas internas.
 */
export function NegotiationStatusBadge({
  stageName,
  showAlert = false,
  alertMessage,
}: NegotiationStatusBadgeProps) {
  return (
    <StatusBadge
      stageName={stageName}
      showAlert={showAlert}
      alertMessage={alertMessage ?? ""}
      columnWidthClamp={{
        min: DEBT_NEGOTIATION_STATUS_BADGE_WIDTH_PX,
        max: DEBT_NEGOTIATION_STATUS_BADGE_WIDTH_PX,
      }}
    />
  );
}

