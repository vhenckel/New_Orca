import { useCallback, useState } from "react";

type DebtListDialog =
  | { kind: "detail"; renegotiationId: string }
  | { kind: "payment"; renegotiationId: string }
  | { kind: "conversation"; contactId: number; contactName: string }
  | null;

export function useDebtListDialogs() {
  const [dialog, setDialog] = useState<DebtListDialog>(null);

  const openDetail = useCallback((renegotiationId: string) => {
    setDialog({ kind: "detail", renegotiationId });
  }, []);

  const openAddPaymentFlow = useCallback((renegotiationId: string) => {
    setDialog({ kind: "payment", renegotiationId });
  }, []);

  const openConversation = useCallback((contactId: number, contactName: string) => {
    setDialog({ kind: "conversation", contactId, contactName });
  }, []);

  const closeDetail = useCallback((open: boolean) => {
    if (!open) setDialog((d) => (d?.kind === "detail" ? null : d));
  }, []);

  const closePayment = useCallback((open: boolean) => {
    if (!open) setDialog((d) => (d?.kind === "payment" ? null : d));
  }, []);

  const closeConversation = useCallback((open: boolean) => {
    if (!open) setDialog((d) => (d?.kind === "conversation" ? null : d));
  }, []);

  return {
    dialog,
    openDetail,
    openAddPaymentFlow,
    openConversation,
    closeDetail,
    closePayment,
    closeConversation,
  };
}
