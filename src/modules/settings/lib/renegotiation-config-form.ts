import type { AgentApplyOver, RenegotiationConfigDto, RenegotiationConfigPayload } from "@/modules/settings/types";

export const MAX_COMPANY_DETAILS_LENGTH = 5000;

export function normalizeCompanyDetails(value: unknown): string | null {
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

export function parseNullableNumber(value: string): number | null {
  if (value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

export type RenegotiationFormState = RenegotiationConfigPayload & {
  applyOver: AgentApplyOver;
  prescriptionYears: number | null;
  lastUpdate: string | null;
};

export function dtoToFormState(dto: RenegotiationConfigDto): RenegotiationFormState {
  return {
    agentName: dto.agentName ?? "",
    companyDetails: dto.companyDetails ?? "",
    lateFee: dto.lateFee ?? null,
    monthlyInterest: dto.monthlyInterest ?? null,
    serviceFees: dto.serviceFees ?? null,
    cashDiscount: dto.cashDiscount ?? null,
    minInstallmentValue: dto.minInstallmentValue ?? null,
    maxInstallment: dto.maxInstallment ?? null,
    applyOver: (dto.applyOver === "corrected" ? "corrected" : "corrected") as AgentApplyOver,
    prescriptionYears: dto.prescriptionYears ?? null,
    lastUpdate: dto.lastUpdate ?? null,
  };
}

export function formStateToPayload(form: RenegotiationFormState): RenegotiationConfigPayload {
  return {
    agentName: form.agentName.trim(),
    companyDetails: normalizeCompanyDetails(form.companyDetails),
    lateFee: form.lateFee,
    monthlyInterest: form.monthlyInterest,
    serviceFees: form.serviceFees,
    cashDiscount: form.cashDiscount,
    minInstallmentValue: form.minInstallmentValue,
    maxInstallment: form.maxInstallment,
    prescriptionYears: form.prescriptionYears,
  };
}
