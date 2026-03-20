import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { confirmDeal } from "@/modules/debt-negotiation/services/deal";
import { manageDebtStatus } from "@/modules/debt-negotiation/services/manage-debt-status";
import {
  DebtContactCard,
  DebtMetricsCard,
} from "@/modules/debt-negotiation/components/DebtOverviewCards";
import type { DebtDetailResponse } from "@/modules/debt-negotiation/types/debt-detail";
import { hasPartialPaidOverdueInstallments } from "@/modules/debt-negotiation/utils/debtInstallmentAlert";
import { NegotiationStatusBadge } from "@/modules/debt-negotiation/components/NegotiationStatusBadge";
import { useI18n } from "@/shared/i18n/useI18n";
import { SidePanelLayout } from "@/shared/ui/side-panel-layout";
import {
  SidePanel,
  SidePanelContent,
  SidePanelTitle,
} from "@/shared/ui/side-panel";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { toast } from "@/shared/ui/sonner";

export type DebtSettledValue = "no" | "yes";

interface AddPaymentDialogProps {
  renegotiationId: string;
  debtData: DebtDetailResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddPaymentDialog({
  renegotiationId,
  debtData,
  open,
  onOpenChange,
  onSuccess,
}: AddPaymentDialogProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const toastId = `confirm-deal-${renegotiationId}`;
  const [settled, setSettled] = useState<DebtSettledValue>("no");
  const [observation, setObservation] = useState("");
  const showPartialPaidOverdueAlert = hasPartialPaidOverdueInstallments(debtData.deal?.items);

  const mutation = useMutation({
    mutationFn: async () => {
      const confirmed = settled === "yes";
      const trimmedObservation = observation.trim();

      if (confirmed) {
        const idNum = Number(renegotiationId);
        if (!Number.isFinite(idNum) || idNum <= 0) {
          throw new Error("Invalid renegotiation id");
        }

        await manageDebtStatus({
          renegotiationIds: [idNum],
          newStatus: "PAYMENT_CONFIRM",
          reason: trimmedObservation || undefined,
        });

        return {
          success: true,
          message: "",
        };
      }

      return confirmDeal(renegotiationId, {
        confirmed,
        observation: trimmedObservation,
      });
    },
    onMutate: () => {
      toast.loading(t("pages.debtNegotiation.debts.addPayment.toast.sending"), {
        id: toastId,
      });
    },
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || t("pages.debtNegotiation.debts.addPayment.toast.error"), {
          id: toastId,
        });
        return;
      }

      toast.success(t("pages.debtNegotiation.debts.addPayment.toast.success"), { id: toastId });
      queryClient.invalidateQueries({
        queryKey: ["renegotiation", "debt-detail", renegotiationId],
      });
      queryClient.invalidateQueries({ queryKey: ["renegotiation", "debt-details"] });
      queryClient.invalidateQueries({
        queryKey: ["renegotiation", "pending-payment-confirmations"],
      });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : t("pages.debtNegotiation.debts.addPayment.toast.error"),
        { id: toastId },
      );
    },
  });

  const handleConfirm = () => {
    mutation.mutate();
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSettled("no");
      setObservation("");
      mutation.reset();
    }
    onOpenChange(next);
  };

  return (
    <SidePanel open={open} onOpenChange={handleOpenChange}>
      <SidePanelContent size="md">
        <SidePanelLayout
          header={
            <SidePanelTitle className="text-base">
              {t("pages.debtNegotiation.debts.addPayment.title")}
            </SidePanelTitle>
          }
          footerLeft={
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              {t("pages.debtNegotiation.debts.detail.back")}
            </Button>
          }
          footerRight={
            <Button onClick={handleConfirm} disabled={mutation.isPending}>
              {mutation.isPending ? "..." : t("pages.debtNegotiation.debts.addPayment.confirm")}
            </Button>
          }
        >
          <div className="flex flex-col gap-3">
            <div className="w-full flex items-center justify-end">
              <NegotiationStatusBadge
                stageName={debtData.pipelineStageName}
                showAlert={showPartialPaidOverdueAlert}
                alertMessage={t("pages.debtNegotiation.debts.detail.partialPaidOverdueAlert")}
              />
            </div>

            <DebtContactCard debtData={debtData} />
            <DebtMetricsCard debtData={debtData} />

            <Card className="shadow-sm">
              <CardContent className="space-y-4 pt-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm text-muted-foreground">
                    {t("pages.debtNegotiation.debts.addPayment.debtSettled")}
                  </Label>
                  <Select
                    value={settled}
                    onValueChange={(v) => setSettled(v as DebtSettledValue)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">
                        {t("pages.debtNegotiation.debts.addPayment.debtSettledNo")}
                      </SelectItem>
                      <SelectItem value="yes">
                        {t("pages.debtNegotiation.debts.addPayment.debtSettledYes")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm text-muted-foreground">
                    {t("pages.debtNegotiation.debts.addPayment.observations")}
                  </Label>
                  <Textarea
                    placeholder={t("pages.debtNegotiation.debts.addPayment.observationsPlaceholder")}
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {mutation.isError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                Erro ao confirmar. Tente novamente.
              </div>
            )}
          </div>
        </SidePanelLayout>
      </SidePanelContent>
    </SidePanel>
  );
}
