import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Info } from "lucide-react";

import { useI18n } from "@/shared/i18n/useI18n";
import { useAuth } from "@/shared/auth/AuthContext";

import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { toast } from "@/shared/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

import { useRenegotiationConfig } from "@/modules/agent/hooks/useRenegotiationConfig";
import { useUpdateRenegotiationConfig } from "@/modules/agent/hooks/useUpdateRenegotiationConfig";
import type {
  AgentApplyOver,
  RenegotiationConfigDto,
  RenegotiationConfigPayload,
} from "@/modules/agent/types";

const MAX_COMPANY_DETAILS_LENGTH = 5000;

function normalizeCompanyDetails(value: unknown): string | null {
  if (value == null) return null;
  // eslint-disable-next-line no-control-regex
  const controlCharsRegex = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
  const s = String(value)
    .trim()
    .replace(/\0/g, "")
    .replace(controlCharsRegex, "");
  if (!s) return null;
  return s.length > MAX_COMPANY_DETAILS_LENGTH
    ? s.slice(0, MAX_COMPANY_DETAILS_LENGTH)
    : s;
}

function parseNullableNumber(value: string): number | null {
  if (value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

type FormState = RenegotiationConfigPayload & {
  applyOver: AgentApplyOver;
  prescriptionYears: number | null;
  lastUpdate: string | null;
};

function FormRow({
  label,
  warning,
  info,
  children,
  className,
}: {
  label: ReactNode;
  warning?: string;
  info?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {info ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm cursor-help hover:bg-muted">
                <Info className="text-primary" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" align="center" className="max-w-xs">
              {info}
            </TooltipContent>
          </Tooltip>
        ) : null}
        {label}
      </div>
      <div className="min-w-0 pt-1">
        {children}
        {warning ? (
          <div className="mt-1 text-xs text-destructive">{warning}</div>
        ) : null}
      </div>
    </div>
  );
}

export function RenegotiationConfigPage() {
  const { t } = useI18n();
  const { companyId } = useAuth();

  const { data, isLoading, error } = useRenegotiationConfig(companyId);

  const [form, setForm] = useState<FormState | null>(null);
  const [initialForm, setInitialForm] = useState<FormState | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const updateMutation = useUpdateRenegotiationConfig(companyId);

  useEffect(() => {
    if (!data) return;

    const dto: RenegotiationConfigDto = data;
    const next: FormState = {
      agentName: dto.agentName ?? "",
      companyDetails: dto.companyDetails ?? "",
      lateFee: dto.lateFee ?? null,
      monthlyInterest: dto.monthlyInterest ?? null,
      serviceFees: dto.serviceFees ?? null,
      cashDiscount: dto.cashDiscount ?? null,
      minInstallmentValue: dto.minInstallmentValue ?? null,
      maxInstallment: dto.maxInstallment ?? null,
      applyOver: (dto.applyOver === "corrected"
        ? "corrected"
        : "corrected") as AgentApplyOver,
      prescriptionYears: dto.prescriptionYears ?? null,
      lastUpdate: dto.lastUpdate ?? null,
    };

    setForm(next);
    setInitialForm(next);
    setIsDirty(false);
  }, [data]);

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const lateFeeWarning = useMemo(() => {
    if (form?.lateFee == null) return undefined;
    return form.lateFee > 2
      ? t("modules.agent.renegotiationConfig.validation.maxLateFee")
      : undefined;
  }, [form?.lateFee, t]);

  const monthlyInterestWarning = useMemo(() => {
    if (form?.monthlyInterest == null) return undefined;
    return form.monthlyInterest > 1
      ? t("modules.agent.renegotiationConfig.validation.maxMonthlyInterest")
      : undefined;
  }, [form?.monthlyInterest, t]);

  const hasValidationError = Boolean(lateFeeWarning || monthlyInterestWarning);

  const isAgentSectionDirty = useMemo(() => {
    if (!form || !initialForm) return false;
    return (
      form.agentName !== initialForm.agentName ||
      form.companyDetails !== initialForm.companyDetails
    );
  }, [form, initialForm]);

  const isDebtSectionDirty = useMemo(() => {
    if (!form || !initialForm) return false;
    return (
      form.lateFee !== initialForm.lateFee ||
      form.monthlyInterest !== initialForm.monthlyInterest ||
      form.serviceFees !== initialForm.serviceFees ||
      form.cashDiscount !== initialForm.cashDiscount ||
      form.minInstallmentValue !== initialForm.minInstallmentValue ||
      form.maxInstallment !== initialForm.maxInstallment ||
      form.applyOver !== initialForm.applyOver ||
      form.prescriptionYears !== initialForm.prescriptionYears
    );
  }, [form, initialForm]);

  const handleSaveSection = (section: "agent" | "debt") => {
    if (!form || companyId == null) return;
    if (section === "debt" && hasValidationError) return;

    const payload: RenegotiationConfigPayload = {
      agentName: form.agentName,
      companyDetails: normalizeCompanyDetails(form.companyDetails),
      lateFee: form.lateFee,
      monthlyInterest: form.monthlyInterest,
      serviceFees: form.serviceFees,
      cashDiscount: form.cashDiscount,
      minInstallmentValue: form.minInstallmentValue,
      maxInstallment: form.maxInstallment,
    };

    const toastId =
      section === "agent"
        ? "agent-renegotiation-config-save-agent"
        : "agent-renegotiation-config-save-debt";
    toast.loading(t("modules.agent.renegotiationConfig.toast.saving"), {
      id: toastId,
    });
    updateMutation.mutate(payload, {
      onSuccess: () => {
        toast.success(t("modules.agent.renegotiationConfig.toast.success"), {
          id: toastId,
        });
        setInitialForm(form);
        setIsDirty(false);
      },
      onError: (err) => {
        toast.error(
          err instanceof Error
            ? err.message
            : t("modules.agent.renegotiationConfig.toast.error"),
          { id: toastId },
        );
      },
    });
  };

  return (
    <DashboardPageLayout
      title={t("modules.agent.title")}
      subtitle={t("modules.agent.description")}
    >
      <div className="space-y-4">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>
              {t("modules.agent.renegotiationConfig.errorLoading")}
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="w-full">
          {isLoading || !form ? (
            <div className="p-6 text-sm text-muted-foreground">
              {t("modules.agent.renegotiationConfig.loading")}
            </div>
          ) : (
            <>
              <div className="mx-auto grid w-full grid-cols-1 items-stretch gap-4 pt-0 md:grid-cols-3">
                <Card className="flex h-full flex-col overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {t("modules.agent.renegotiationConfig.agentSection.title")}
                    </CardTitle>
                    <CardDescription>
                      {t("modules.agent.renegotiationConfig.agentSection.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid flex-1 gap-3 pt-0">
                    <FormRow
                      label={t("modules.agent.renegotiationConfig.fields.agentName.label")}
                      info={t("modules.agent.renegotiationConfig.fields.agentName.info")}
                      className="py-2"
                    >
                      <Input
                        value={form.agentName}
                        onChange={(e) => {
                          setForm((prev) =>
                            prev
                              ? { ...prev, agentName: e.target.value }
                              : prev,
                          );
                          setIsDirty(true);
                        }}
                      />
                    </FormRow>

                    <FormRow
                      label={t(
                        "modules.agent.renegotiationConfig.fields.companyDetails.label",
                      )}
                      info={t(
                        "modules.agent.renegotiationConfig.fields.companyDetails.info",
                      )}
                      className="py-2"
                    >
                      <Textarea
                        value={form.companyDetails}
                        onChange={(e) => {
                          setForm((prev) =>
                            prev
                              ? { ...prev, companyDetails: e.target.value }
                              : prev,
                          );
                          setIsDirty(true);
                        }}
                        rows={6}
                        className="min-h-[220px] resize-none"
                      />
                    </FormRow>
                  </CardContent>
                  <CardFooter className="mt-auto justify-end border-t border-border/60 pt-4">
                    <Button
                      disabled={!isAgentSectionDirty || updateMutation.isPending}
                      onClick={() => handleSaveSection("agent")}
                    >
                      {updateMutation.isPending
                        ? t("modules.agent.renegotiationConfig.actions.saving")
                        : t("modules.agent.renegotiationConfig.actions.save")}
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="flex h-full flex-col overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {t("modules.agent.renegotiationConfig.debtSection.title")}
                    </CardTitle>
                    <CardDescription>
                      {t("modules.agent.renegotiationConfig.debtSection.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid flex-1 gap-3 pt-0 md:grid-cols-2">
                    <FormRow
                      label={t("modules.agent.renegotiationConfig.fields.lateFee.label")}
                      warning={lateFeeWarning}
                      info={t("modules.agent.renegotiationConfig.fields.lateFee.info")}
                      className="py-2"
                    >
                      <Input
                        type="number"
                        step={0.01}
                        min={0}
                        value={form.lateFee ?? ""}
                        onChange={(e) => {
                          setForm((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  lateFee: parseNullableNumber(e.target.value),
                                }
                              : prev,
                          );
                          setIsDirty(true);
                        }}
                      />
                    </FormRow>

                    <FormRow
                      label={t(
                        "modules.agent.renegotiationConfig.fields.monthlyInterest.label",
                      )}
                      warning={monthlyInterestWarning}
                      info={t(
                        "modules.agent.renegotiationConfig.fields.monthlyInterest.info",
                      )}
                      className="py-2"
                    >
                      <Input
                        type="number"
                        step={0.01}
                        min={0}
                        value={form.monthlyInterest ?? ""}
                        onChange={(e) => {
                          setForm((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  monthlyInterest: parseNullableNumber(
                                    e.target.value,
                                  ),
                                }
                              : prev,
                          );
                          setIsDirty(true);
                        }}
                      />
                    </FormRow>

                    <FormRow
                      label={t(
                        "modules.agent.renegotiationConfig.fields.serviceFees.label",
                      )}
                      info={t(
                        "modules.agent.renegotiationConfig.fields.serviceFees.info",
                      )}
                      className="py-2"
                    >
                      <Input
                        type="number"
                        step={0.1}
                        min={0}
                        max={100}
                        value={form.serviceFees ?? ""}
                        onChange={(e) => {
                          setForm((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  serviceFees: parseNullableNumber(
                                    e.target.value,
                                  ),
                                }
                              : prev,
                          );
                          setIsDirty(true);
                        }}
                      />
                    </FormRow>

                    <FormRow
                      label={t(
                        "modules.agent.renegotiationConfig.fields.cashDiscount.label",
                      )}
                      info={t(
                        "modules.agent.renegotiationConfig.fields.cashDiscount.info",
                      )}
                      className="py-2"
                    >
                      <Input
                        type="number"
                        step={0.1}
                        min={0}
                        max={100}
                        value={form.cashDiscount ?? ""}
                        onChange={(e) => {
                          setForm((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  cashDiscount: parseNullableNumber(
                                    e.target.value,
                                  ),
                                }
                              : prev,
                          );
                          setIsDirty(true);
                        }}
                      />
                    </FormRow>

                    <FormRow
                      label={t(
                        "modules.agent.renegotiationConfig.fields.applyOver.label",
                      )}
                      info={t(
                        "modules.agent.renegotiationConfig.fields.applyOver.info",
                      )}
                      className="py-2"
                    >
                      <Select
                        value={form.applyOver}
                        disabled
                        onValueChange={() => {}}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="corrected">
                            {t(
                              "modules.agent.renegotiationConfig.fields.applyOver.corrected",
                            )}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormRow>

                    <FormRow
                      label={t(
                        "modules.agent.renegotiationConfig.fields.minInstallmentValue.label",
                      )}
                      info={t(
                        "modules.agent.renegotiationConfig.fields.minInstallmentValue.info",
                      )}
                      className="py-2"
                    >
                      <Input
                        type="number"
                        step={0.01}
                        min={0}
                        value={form.minInstallmentValue ?? ""}
                        onChange={(e) => {
                          setForm((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  minInstallmentValue: parseNullableNumber(
                                    e.target.value,
                                  ),
                                }
                              : prev,
                          );
                          setIsDirty(true);
                        }}
                      />
                    </FormRow>

                    <FormRow
                      label={t(
                        "modules.agent.renegotiationConfig.fields.maxInstallment.label",
                      )}
                      info={t(
                        "modules.agent.renegotiationConfig.fields.maxInstallment.info",
                      )}
                      className="py-2"
                    >
                      <Input
                        type="number"
                        step={1}
                        min={0}
                        value={form.maxInstallment ?? ""}
                        onChange={(e) => {
                          setForm((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  maxInstallment: parseNullableNumber(
                                    e.target.value,
                                  ),
                                }
                              : prev,
                          );
                          setIsDirty(true);
                        }}
                      />
                    </FormRow>

                    <FormRow
                      label={t(
                        "modules.agent.renegotiationConfig.fields.prescriptionYears.label",
                      )}
                      info={t(
                        "modules.agent.renegotiationConfig.fields.prescriptionYears.info",
                      )}
                      className="py-2"
                    >
                      <Input
                        type="number"
                        step={1}
                        min={1}
                        max={30}
                        value={form.prescriptionYears ?? ""}
                        onChange={(e) => {
                          setForm((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  prescriptionYears: parseNullableNumber(
                                    e.target.value,
                                  ),
                                }
                              : prev,
                          );
                          setIsDirty(true);
                        }}
                      />
                    </FormRow>
                    <div className="md:col-span-2" />
                  </CardContent>
                  <CardFooter className="mt-auto justify-end border-t border-border/60 pt-4">
                      <Button
                        disabled={
                          !isDebtSectionDirty ||
                          hasValidationError ||
                          updateMutation.isPending
                        }
                        onClick={() => handleSaveSection("debt")}
                      >
                        {updateMutation.isPending
                          ? t("modules.agent.renegotiationConfig.actions.saving")
                          : t("modules.agent.renegotiationConfig.actions.save")}
                      </Button>
                  </CardFooter>
                </Card>

                <div className="hidden md:block" />
              </div>

            </>
          )}
        </div>
      </div>
    </DashboardPageLayout>
  );
}
