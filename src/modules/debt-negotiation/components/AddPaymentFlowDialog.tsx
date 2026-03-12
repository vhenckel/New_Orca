import { AddPaymentDialog } from "@/modules/debt-negotiation/components/AddPaymentDialog";
import { InformPaymentDialog } from "@/modules/debt-negotiation/components/InformPaymentDialog";
import { useDebtDetail } from "@/modules/debt-negotiation/hooks";
import { useI18n } from "@/shared/i18n/useI18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";

function hasDealItems(data: { deal?: { items?: unknown[] } } | undefined): boolean {
  return Boolean(data?.deal?.items?.length);
}

interface AddPaymentFlowDialogProps {
  renegotiationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
}: AddPaymentFlowDialogProps) {
  const { t } = useI18n();
  const { data, isPending, error } = useDebtDetail(open && renegotiationId ? renegotiationId : null);
  const showInform = data && !error && hasDealItems(data);

  if (!open || !renegotiationId) return null;

  if (isPending) {
    return (
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("pages.debtNegotiation.debts.addPayment.title")}</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center text-sm text-muted-foreground">Carregando…</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !data) {
    return (
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("pages.debtNegotiation.debts.addPayment.title")}</DialogTitle>
          </DialogHeader>
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Erro ao carregar detalhes da dívida.
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("pages.debtNegotiation.debts.informPayment.close")}
          </Button>
        </DialogContent>
      </Dialog>
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
    />
  );
}
