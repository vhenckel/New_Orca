import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { AddPaymentFlowDialog } from "@/modules/debt-negotiation/components/AddPaymentFlowDialog";
import {
  DebtContactCard,
  DebtMetricsCard,
} from "@/modules/debt-negotiation/components/DebtOverviewCards";
import type { DealItem } from "@/modules/debt-negotiation/types/debt-detail";
import { useDebtDetail } from "@/modules/debt-negotiation/hooks";
import { hasPartialPaidOverdueInstallments } from "@/modules/debt-negotiation/utils/debtInstallmentAlert";
import { useI18n } from "@/shared/i18n/useI18n";
import { NegotiationStatusBadge } from "@/modules/debt-negotiation/components/NegotiationStatusBadge";
import {
  manageDebtStatus,
  type ManageDebtStatusNewStatus,
  type ManageDebtStatusResult,
} from "@/modules/debt-negotiation/services/manage-debt-status";
import { toast } from "@/shared/ui/sonner";
import { SidePanelLayout } from "@/shared/ui/side-panel-layout";
import {
  SidePanel,
  SidePanelContent,
  SidePanelTitle,
} from "@/shared/ui/side-panel";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";
import { Textarea } from "@/shared/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { cn } from "@/shared/lib/utils";
import { useAuth } from "@/shared/auth/AuthContext";
import { isSuperAdminUser } from "@/shared/auth/is-super-admin";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatAmount(value: number | null): string {
  if (value == null) return "-";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getInstallmentStatus(item: DealItem): "paid" | "onTime" | "overdue" {
  if (item.paidAt) return "paid";
  const due = new Date(item.dueAt).getTime();
  const now = Date.now();
  return due < now ? "overdue" : "onTime";
}


interface DebtDetailDialogProps {
  renegotiationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DebtDetailDialog({
  renegotiationId,
  open,
  onOpenChange,
}: DebtDetailDialogProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const canManageStatus = isSuperAdminUser(user);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [view, setView] = useState<"details" | "manageStatus">("details");
  const { data, isPending, error } = useDebtDetail(
    open ? renegotiationId : null,
  );

  const queryClient = useQueryClient();

  const [selectedNewStatus, setSelectedNewStatus] = useState<ManageDebtStatusNewStatus | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setView("details");
      setAddPaymentOpen(false);
      setSelectedNewStatus(null);
      setReason("");
      return;
    }
    // Sempre entra no drawer em "details"
    setView("details");
    setAddPaymentOpen(false);
    setSelectedNewStatus(null);
    setReason("");
  }, [open]);

  useEffect(() => {
    if (view !== "manageStatus") return;
    setSelectedNewStatus(null);
    setReason("");
  }, [view]);

  useEffect(() => {
    if (!canManageStatus && view === "manageStatus") {
      setView("details");
    }
  }, [canManageStatus, view]);

  const inManageStatus = canManageStatus && view === "manageStatus";

  const manageStatusOptions = useMemo(
    () =>
      [
        {
          value: "CANCELED" satisfies ManageDebtStatusNewStatus,
          label: t("pages.debtNegotiation.debts.status.cancelado"),
        },
        {
          value: "PAYMENT_CONFIRM" satisfies ManageDebtStatusNewStatus,
          label: t("pages.debtNegotiation.debts.status.confirmacaoPagamento"),
        },
      ] as const,
    [t],
  );

  const manageStatusMutation = useMutation({
    mutationFn: async (): Promise<ManageDebtStatusResult> => {
      if (!renegotiationId || !selectedNewStatus) {
        throw new Error("Missing renegotiationId/selectedNewStatus");
      }
      const idNum = Number(renegotiationId);
      if (!Number.isFinite(idNum) || idNum <= 0) {
        throw new Error("Invalid renegotiationId");
      }

      return manageDebtStatus({
        renegotiationIds: [idNum],
        newStatus: selectedNewStatus,
        reason: reason.trim() || undefined,
      });
    },
    onSuccess: (dataResult) => {
      // Invalidate queries to reflect the new status
      if (renegotiationId) {
        void queryClient.invalidateQueries({
          queryKey: ["renegotiation", "debt-detail", renegotiationId],
        });
      }
      void queryClient.invalidateQueries({
        queryKey: ["renegotiation", "debt-details"],
      });

      const changedCount = dataResult?.results?.filter((r) => r.changed)?.length ?? 0;
      toast.success(
        changedCount > 0
          ? t("pages.debtNegotiation.debts.manageStatus.toast.success")
          : t("pages.debtNegotiation.debts.manageStatus.toast.noChange"),
      );
      // Fechar drawer externo ao concluir a alteração
      onOpenChange(false);
    },
    onError: () => {
      toast.error(t("pages.debtNegotiation.debts.manageStatus.toast.error"));
    },
  });

  const showPartialPaidOverdueAlert = hasPartialPaidOverdueInstallments(
    data?.deal?.items,
  );
  const items = data?.deal?.items ?? [];
  const hasInstallments = items.length > 0;
  const paidInstallments = items.filter((item) => !!item.paidAt).length;

  const drawerFooterLeft =
    inManageStatus ? (
      <Button
        variant="outline"
        onClick={() => setView("details")}
        disabled={manageStatusMutation.isPending}
      >
        {t("common.back")}
      </Button>
    ) : (
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        {t("pages.debtNegotiation.debts.detail.back")}
      </Button>
    );

  const drawerFooterRight =
    inManageStatus ? (
      <Button
        onClick={() => manageStatusMutation.mutate()}
        disabled={manageStatusMutation.isPending || !selectedNewStatus}
      >
        {manageStatusMutation.isPending
          ? "..."
          : t("pages.debtNegotiation.debts.manageStatus.save")}
      </Button>
    ) : (
      <Button
        onClick={() => setAddPaymentOpen(true)}
        disabled={!data || !!error}
      >
        {t("pages.debtNegotiation.debts.detail.updateDebt")}
      </Button>
    );

  return (
    <>
      <SidePanel open={open} onOpenChange={onOpenChange}>
        <SidePanelContent size="xl">
          <SidePanelLayout
            header={
              <SidePanelTitle className="text-base">
                {inManageStatus
                  ? t("pages.debtNegotiation.debts.manageStatus.title")
                  : t("pages.debtNegotiation.debts.detail.title")}
              </SidePanelTitle>
            }
            footerLeft={drawerFooterLeft}
            footerRight={drawerFooterRight}
          >
            <div className="flex flex-col gap-3">
              {isPending && (
                <div className="rounded-lg border bg-background px-4 py-8 text-center text-sm text-muted-foreground">
                  {t("pages.debtNegotiation.debts.addPayment.loading")}
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {t("pages.debtNegotiation.debts.addPayment.errorLoadingDetail")}
                </div>
              )}
              {data && !error && (
                <>
                  {inManageStatus && (
                    <div className="flex flex-col gap-4">
                      <Card className="shadow-sm">
                        <CardContent className="space-y-0 pt-4">
                          <div className="flex items-center justify-between gap-3 px-1">
                            <div className="text-sm font-medium text-muted-foreground">
                              {t(
                                "pages.debtNegotiation.debts.manageStatus.currentStatus",
                              )}
                            </div>
                            <NegotiationStatusBadge
                              stageName={data.pipelineStageName}
                              showAlert={false}
                            />
                          </div>

                          <Separator className="mt-4" />

                          <div className="flex flex-col gap-1.5 pt-4 px-1">
                            <Label>
                              {t("pages.debtNegotiation.debts.manageStatus.newStatus")}
                            </Label>
                            <Select
                              value={selectedNewStatus ?? undefined}
                              onValueChange={(v) =>
                                setSelectedNewStatus(
                                  v as ManageDebtStatusNewStatus,
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t(
                                    "pages.debtNegotiation.debts.manageStatus.selectPlaceholder",
                                  )}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {manageStatusOptions.map((opt) => (
                                  <SelectItem
                                    key={opt.value}
                                    value={opt.value}
                                  >
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex flex-col gap-1.5 pt-4 px-1">
                            <Label>
                              {t(
                                "pages.debtNegotiation.debts.manageStatus.reasonOptional",
                              )}
                            </Label>
                            <Textarea
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              placeholder={t(
                                "pages.debtNegotiation.debts.manageStatus.reasonPlaceholder",
                              )}
                              rows={3}
                              maxLength={500}
                              className="resize-none"
                            />
                            <div className="text-xs text-muted-foreground">
                              {reason.length}/500
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  {view === "details" && (
                    <>
                      <div className="w-full flex items-center justify-end gap-2">
                        {canManageStatus && (
                          <Button
                            type="button"
                            variant="link"
                            className="h-auto px-0 text-sm"
                            onClick={() => setView("manageStatus")}
                            disabled={manageStatusMutation.isPending}
                          >
                            {t("pages.debtNegotiation.debts.manageStatus.alter")}
                          </Button>
                        )}
                        <NegotiationStatusBadge
                          stageName={data.pipelineStageName}
                          showAlert={showPartialPaidOverdueAlert}
                          alertMessage={t(
                            "pages.debtNegotiation.debts.detail.partialPaidOverdueAlert",
                          )}
                        />
                      </div>
                  <DebtContactCard debtData={data} showBlacklistIcon />
                  <DebtMetricsCard debtData={data} />

                  {hasInstallments && (
                    <Card className="shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase text-right tracking-wide text-muted-foreground">
                          <div className="text-xs text-muted-foreground">
                            {t("pages.debtNegotiation.debts.detail.installmentsPaid", {
                              paid: paidInstallments,
                              total: items.length,
                            })}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-0 pb-2">
                        <div className="card-surface overflow-x-auto border-0 rounded-none shadow-none">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>
                                  {t(
                                    "pages.debtNegotiation.debts.informPayment.col.installment",
                                  )}
                                </TableHead>
                                <TableHead>
                                  {t(
                                    "pages.debtNegotiation.debts.informPayment.col.dueDate",
                                  )}
                                </TableHead>
                                <TableHead>
                                  {t(
                                    "pages.debtNegotiation.debts.informPayment.col.paymentDate",
                                  )}
                                </TableHead>
                                <TableHead>
                                  {t(
                                    "pages.debtNegotiation.debts.informPayment.col.amount",
                                  )}
                                </TableHead>
                                <TableHead>
                                  {t(
                                    "pages.debtNegotiation.debts.informPayment.col.status",
                                  )}
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {items.map((item) => {
                                const status = getInstallmentStatus(item);
                                const isPaid = status === "paid";
                                const statusKey =
                                  status === "paid"
                                    ? "pages.debtNegotiation.debts.informPayment.status.paid"
                                    : status === "overdue"
                                      ? "pages.debtNegotiation.debts.informPayment.status.overdue"
                                      : "pages.debtNegotiation.debts.informPayment.status.onTime";
                                const statusClass =
                                  status === "paid"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : status === "overdue"
                                      ? "bg-destructive/10 text-destructive border-destructive/20"
                                      : "bg-sky-50 text-sky-700 border-sky-200";
                                return (
                                  <TableRow
                                    key={item.id}
                                    className={
                                      isPaid ? "opacity-90" : undefined
                                    }
                                  >
                                    <TableCell>{item.installment}</TableCell>
                                    <TableCell>
                                      {formatDate(item.dueAt)}
                                    </TableCell>
                                    <TableCell>
                                      {item.paidAt
                                        ? formatDate(item.paidAt)
                                        : "-"}
                                    </TableCell>
                                    <TableCell>
                                      {formatAmount(item.amount)}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          "text-xs whitespace-nowrap",
                                          statusClass,
                                        )}
                                      >
                                        {t(statusKey)}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                    </>
                  )}
                </>
              )}
            </div>
          </SidePanelLayout>
        </SidePanelContent>
      </SidePanel>

      <AddPaymentFlowDialog
        renegotiationId={renegotiationId}
        open={addPaymentOpen}
        onOpenChange={setAddPaymentOpen}
        onSuccess={() => {
          // Ao concluir o update, fechar também o drawer externo de detalhes.
          onOpenChange(false);
        }}
      />
    </>
  );
}
