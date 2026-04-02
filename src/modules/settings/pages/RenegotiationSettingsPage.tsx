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

import { RenegotiationConfigFormRow } from "@/modules/settings/components/RenegotiationConfigFormRow";
import { parseNullableNumber } from "@/modules/settings/lib/renegotiation-config-form";
import { useRenegotiationConfigForm } from "@/modules/settings/hooks/useRenegotiationConfigForm";

export function RenegotiationSettingsPage() {
  const { t } = useI18n();
  const { companyId } = useAuth();
  const {
    form,
    setForm,
    setIsDirty,
    isLoading,
    error,
    updateMutation,
    lateFeeWarning,
    monthlyInterestWarning,
    hasDebtValidationError,
    isDebtSectionDirty,
    saveSection,
  } = useRenegotiationConfigForm(companyId);

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.settings.routes.renegotiation.label")}
      subtitle={t("modules.settings.routes.renegotiation.description")}
    >
      <div className="space-y-4">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>
              {t("modules.settings.renegotiationConfig.errorLoading")}
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="w-full">
          {isLoading || !form ? (
            <div className="p-6 text-sm text-muted-foreground">
              {t("modules.settings.renegotiationConfig.loading")}
            </div>
          ) : (
            <div className="mx-auto w-full max-w-4xl pt-0">
              <Card className="flex flex-col overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {t("modules.settings.renegotiationConfig.debtSection.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("modules.settings.renegotiationConfig.debtSection.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid flex-1 gap-3 pt-0 md:grid-cols-2">
                  <RenegotiationConfigFormRow
                    label={t("modules.settings.renegotiationConfig.fields.lateFee.label")}
                    warning={lateFeeWarning}
                    info={t("modules.settings.renegotiationConfig.fields.lateFee.info")}
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
                            ? { ...prev, lateFee: parseNullableNumber(e.target.value) }
                            : prev,
                        );
                        setIsDirty(true);
                      }}
                    />
                  </RenegotiationConfigFormRow>

                  <RenegotiationConfigFormRow
                    label={t("modules.settings.renegotiationConfig.fields.monthlyInterest.label")}
                    warning={monthlyInterestWarning}
                    info={t("modules.settings.renegotiationConfig.fields.monthlyInterest.info")}
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
                                monthlyInterest: parseNullableNumber(e.target.value),
                              }
                            : prev,
                        );
                        setIsDirty(true);
                      }}
                    />
                  </RenegotiationConfigFormRow>

                  <RenegotiationConfigFormRow
                    label={t("modules.settings.renegotiationConfig.fields.serviceFees.label")}
                    info={t("modules.settings.renegotiationConfig.fields.serviceFees.info")}
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
                                serviceFees: parseNullableNumber(e.target.value),
                              }
                            : prev,
                        );
                        setIsDirty(true);
                      }}
                    />
                  </RenegotiationConfigFormRow>

                  <RenegotiationConfigFormRow
                    label={t("modules.settings.renegotiationConfig.fields.cashDiscount.label")}
                    info={t("modules.settings.renegotiationConfig.fields.cashDiscount.info")}
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
                                cashDiscount: parseNullableNumber(e.target.value),
                              }
                            : prev,
                        );
                        setIsDirty(true);
                      }}
                    />
                  </RenegotiationConfigFormRow>

                  <RenegotiationConfigFormRow
                    label={t("modules.settings.renegotiationConfig.fields.applyOver.label")}
                    info={t("modules.settings.renegotiationConfig.fields.applyOver.info")}
                    className="py-2"
                  >
                    <Select value={form.applyOver} disabled onValueChange={() => {}}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corrected">
                          {t("modules.settings.renegotiationConfig.fields.applyOver.corrected")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </RenegotiationConfigFormRow>

                  <RenegotiationConfigFormRow
                    label={t(
                      "modules.settings.renegotiationConfig.fields.minInstallmentValue.label",
                    )}
                    info={t(
                      "modules.settings.renegotiationConfig.fields.minInstallmentValue.info",
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
                                minInstallmentValue: parseNullableNumber(e.target.value),
                              }
                            : prev,
                        );
                        setIsDirty(true);
                      }}
                    />
                  </RenegotiationConfigFormRow>

                  <RenegotiationConfigFormRow
                    label={t("modules.settings.renegotiationConfig.fields.maxInstallment.label")}
                    info={t("modules.settings.renegotiationConfig.fields.maxInstallment.info")}
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
                                maxInstallment: parseNullableNumber(e.target.value),
                              }
                            : prev,
                        );
                        setIsDirty(true);
                      }}
                    />
                  </RenegotiationConfigFormRow>

                  <RenegotiationConfigFormRow
                    label={t(
                      "modules.settings.renegotiationConfig.fields.prescriptionYears.label",
                    )}
                    info={t(
                      "modules.settings.renegotiationConfig.fields.prescriptionYears.info",
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
                                prescriptionYears: parseNullableNumber(e.target.value),
                              }
                            : prev,
                        );
                        setIsDirty(true);
                      }}
                    />
                  </RenegotiationConfigFormRow>
                  <div className="md:col-span-2" />
                </CardContent>
                <CardFooter className="mt-auto justify-end border-t border-border/60 pt-4">
                  <Button
                    disabled={
                      !isDebtSectionDirty ||
                      hasDebtValidationError ||
                      updateMutation.isPending
                    }
                    onClick={() => saveSection("debt")}
                  >
                    {updateMutation.isPending
                      ? t("modules.settings.renegotiationConfig.actions.saving")
                      : t("modules.settings.renegotiationConfig.actions.save")}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardPageLayout>
  );
}
