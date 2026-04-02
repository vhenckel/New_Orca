import { useCallback, useEffect, useMemo, useState } from "react";

import { useI18n } from "@/shared/i18n/useI18n";
import { toast } from "@/shared/ui/sonner";

import {
  dtoToFormState,
  formStateToPayload,
  type RenegotiationFormState,
} from "@/modules/settings/lib/renegotiation-config-form";
import { useRenegotiationConfig } from "@/modules/settings/hooks/useRenegotiationConfig";
import { useUpdateRenegotiationConfig } from "@/modules/settings/hooks/useUpdateRenegotiationConfig";

export function useRenegotiationConfigForm(companyId: number | null | undefined) {
  const { t } = useI18n();
  const { data, isLoading, error } = useRenegotiationConfig(companyId);
  const [form, setForm] = useState<RenegotiationFormState | null>(null);
  const [initialForm, setInitialForm] = useState<RenegotiationFormState | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const updateMutation = useUpdateRenegotiationConfig(companyId);

  useEffect(() => {
    if (!data) return;
    const next = dtoToFormState(data);
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
    return form.lateFee > 2 ? t("modules.settings.renegotiationConfig.validation.maxLateFee") : undefined;
  }, [form?.lateFee, t]);

  const monthlyInterestWarning = useMemo(() => {
    if (form?.monthlyInterest == null) return undefined;
    return form.monthlyInterest > 1
      ? t("modules.settings.renegotiationConfig.validation.maxMonthlyInterest")
      : undefined;
  }, [form?.monthlyInterest, t]);

  const agentNameWarning = useMemo(() => {
    if (form?.agentName.trim()) return undefined;
    return t("modules.settings.renegotiationConfig.validation.agentNameRequired");
  }, [form?.agentName, t]);

  const hasDebtValidationError = Boolean(lateFeeWarning || monthlyInterestWarning);

  const isAgentSectionDirty = useMemo(() => {
    if (!form || !initialForm) return false;
    return (
      form.agentName !== initialForm.agentName || form.companyDetails !== initialForm.companyDetails
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

  const saveSection = useCallback(
    (section: "agent" | "debt") => {
      if (!form || companyId == null) return;
      if (section === "agent") {
        if (agentNameWarning) return;
      } else if (hasDebtValidationError) {
        return;
      }

      const payload = formStateToPayload(form);
      const toastId =
        section === "agent"
          ? "agent-renegotiation-config-save-agent"
          : "agent-renegotiation-config-save-debt";
      toast.loading(t("modules.settings.renegotiationConfig.toast.saving"), { id: toastId });
      updateMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t("modules.settings.renegotiationConfig.toast.success"), { id: toastId });
          setInitialForm(form);
          setIsDirty(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : t("modules.settings.renegotiationConfig.toast.error"),
            { id: toastId },
          );
        },
      });
    },
    [
      agentNameWarning,
      companyId,
      form,
      hasDebtValidationError,
      t,
      updateMutation,
    ],
  );

  return {
    form,
    setForm,
    setIsDirty,
    isLoading,
    error,
    updateMutation,
    lateFeeWarning,
    monthlyInterestWarning,
    agentNameWarning,
    hasDebtValidationError,
    isAgentSectionDirty,
    isDebtSectionDirty,
    saveSection,
  };
}
