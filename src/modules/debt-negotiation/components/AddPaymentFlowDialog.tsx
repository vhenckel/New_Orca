import { AddPaymentDialog } from "@/modules/debt-negotiation/components/AddPaymentDialog";
import { InformPaymentDialog } from "@/modules/debt-negotiation/components/InformPaymentDialog";
import { useDebtDetail } from "@/modules/debt-negotiation/hooks";
import { useI18n } from "@/shared/i18n/useI18n";
import { SidePanel, SidePanelContent, SidePanelTitle } from "@/shared/ui/side-panel";
import { SidePanelLayout } from "@/shared/ui/side-panel-layout";
import { Button } from "@/shared/ui/button";

function hasDealItems(data: { deal?: { items?: unknown[] } } | undefined): boolean {
  return Boolean(data?.deal?.items?.length);
}

interface AddPaymentFlowDialogProps {
  renegotiationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Abre ao clicar no ícone de cifrão "Adicionar pagamento".
 * Busca o detalhe da dívida e exibe:
 * - Sem deal → AddPaymentDialog (Dívida foi quitada? + Observações)
 * - Com deal.items → InformPaymentDialog (tabela de parcelas)
 */
export function AddPaymentFlowDialog({
  renegotiationId,
  open,
  onOpenChange,
  onSuccess,
}: AddPaymentFlowDialogProps) {
  const { t } = useI18n();
  const { data, isPending, error } = useDebtDetail(open && renegotiationId ? renegotiationId : null);
  const showInform = data && !error && hasDealItems(data);

  if (!open || !renegotiationId) return null;

  if (isPending) {
    return (
      <SidePanel open onOpenChange={onOpenChange}>
        <SidePanelContent size="md">
          <SidePanelLayout
            header={<SidePanelTitle>{t("pages.debtNegotiation.debts.addPayment.title")}</SidePanelTitle>}
          >
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t("pages.debtNegotiation.debts.addPayment.loading")}
            </div>
          </SidePanelLayout>
        </SidePanelContent>
      </SidePanel>
    );
  }

  if (error || !data) {
    return (
      <SidePanel open onOpenChange={onOpenChange}>
        <SidePanelContent size="md">
          <SidePanelLayout
            header={<SidePanelTitle>{t("pages.debtNegotiation.debts.addPayment.title")}</SidePanelTitle>}
          >
            <div className="flex flex-col gap-4">
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {t("pages.debtNegotiation.debts.addPayment.errorLoadingDetail")}
              </div>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t("pages.debtNegotiation.debts.informPayment.close")}
              </Button>
            </div>
          </SidePanelLayout>
        </SidePanelContent>
      </SidePanel>
    );
  }

  if (showInform) {
    return (
      <InformPaymentDialog debtData={data} open={open} onOpenChange={onOpenChange} />
    );
  }

  return (
    <AddPaymentDialog
      renegotiationId={renegotiationId}
      debtData={data}
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
    />
  );
}
