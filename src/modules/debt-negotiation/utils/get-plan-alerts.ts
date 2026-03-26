import type { TranslationKey } from "@/shared/i18n/config";
import type { TranslationVars } from "@/shared/i18n/I18nContext";

import type { RenegotiationPlanUsageResponse } from "@/modules/debt-negotiation/types/renegotiation-plan-usage";

type AlertKind = "debtsLimit" | "planExpired";

export interface PlanAlertMessage {
  kind: AlertKind;
  title: string;
  content: string;
  variant: "default" | "destructive";
}

type AlertStatus = {
  debtsLimit80: string | null;
  debtsLimit90: string | null;
  debtsLimit100: string | null;
  planExpired: string | null;
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function storageKey(companyId: number): string {
  return `renegotiation-alerts-${companyId}`;
}

function readAlertStatus(companyId: number): AlertStatus {
  const raw = localStorage.getItem(storageKey(companyId));
  const parsed = raw ? (JSON.parse(raw) as Partial<AlertStatus>) : {};
  return {
    debtsLimit80: parsed.debtsLimit80 ?? null,
    debtsLimit90: parsed.debtsLimit90 ?? null,
    debtsLimit100: parsed.debtsLimit100 ?? null,
    planExpired: parsed.planExpired ?? null,
  };
}

function writeAlertStatus(companyId: number, status: AlertStatus): void {
  localStorage.setItem(storageKey(companyId), JSON.stringify(status));
}

function clearAlertStatus(companyId: number): void {
  localStorage.removeItem(storageKey(companyId));
}

function getDebtsLimitAlert(
  planInfo: RenegotiationPlanUsageResponse,
  status: AlertStatus,
  t: (key: TranslationKey, vars?: TranslationVars) => string,
): PlanAlertMessage | null {
  const used = Number(planInfo.debtsLimit?.used || 0);
  const total = Number(planInfo.debtsLimit?.total || 0);
  if (!total || total <= 0) return null;

  const percent = Math.floor((used / total) * 100);
  const nowKey = todayKey();

  if (percent >= 100 && status.debtsLimit100 !== nowKey) {
    status.debtsLimit100 = nowKey;
    status.debtsLimit90 = nowKey;
    status.debtsLimit80 = nowKey;
    return {
      kind: "debtsLimit",
      variant: "destructive",
      title: t("dashboard.alerts.debtsLimit100.title"),
      content: t("dashboard.alerts.debtsLimit100.content"),
    };
  }

  if (percent >= 90 && status.debtsLimit90 !== nowKey) {
    status.debtsLimit90 = nowKey;
    status.debtsLimit80 = nowKey;
    return {
      kind: "debtsLimit",
      variant: "default",
      title: t("dashboard.alerts.debtsLimit90.title"),
      content: t("dashboard.alerts.debtsLimit90.content"),
    };
  }

  if (percent >= 80 && status.debtsLimit80 !== nowKey) {
    status.debtsLimit80 = nowKey;
    return {
      kind: "debtsLimit",
      variant: "default",
      title: t("dashboard.alerts.debtsLimit80.title"),
      content: t("dashboard.alerts.debtsLimit80.content"),
    };
  }

  return null;
}

function getPlanExpiredAlert(
  planInfo: RenegotiationPlanUsageResponse,
  status: AlertStatus,
  t: (key: TranslationKey, vars?: TranslationVars) => string,
): PlanAlertMessage | null {
  if (!planInfo.endDate) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const parsed = new Date(planInfo.endDate);
  if (Number.isNaN(parsed.getTime())) return null;
  const endDate = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  const daysToExpire = Math.floor((endDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

  const isExpiringSoon = daysToExpire >= 0 && daysToExpire <= 2;
  const isExpired = daysToExpire < 0;
  const nowKey = todayKey();

  if (isExpired) {
    return {
      kind: "planExpired",
      variant: "destructive",
      title: t("dashboard.alerts.planExpired.title"),
      content: t("dashboard.alerts.planExpired.content"),
    };
  }

  if (isExpiringSoon && status.planExpired !== nowKey) {
    status.planExpired = nowKey;
    return {
      kind: "planExpired",
      variant: "default",
      title: t("dashboard.alerts.planExpiringSoon.title"),
      content:
        daysToExpire === 0
          ? t("dashboard.alerts.planExpiringSoon.today")
          : t("dashboard.alerts.planExpiringSoon.inDays", { days: daysToExpire }),
    };
  }

  return null;
}

export function getPlanAlerts(
  planInfo: RenegotiationPlanUsageResponse | undefined,
  companyId: number,
  t: (key: TranslationKey, vars?: TranslationVars) => string,
): PlanAlertMessage[] {
  if (!planInfo) {
    clearAlertStatus(companyId);
    return [];
  }

  const status = readAlertStatus(companyId);
  const planExpired = getPlanExpiredAlert(planInfo, status, t);
  const debtsLimit = getDebtsLimitAlert(planInfo, status, t);
  const alerts = [planExpired, debtsLimit].filter(
    (v): v is PlanAlertMessage => v != null,
  );

  if (alerts.length === 0) {
    clearAlertStatus(companyId);
    return [];
  }

  writeAlertStatus(companyId, status);
  return alerts;
}
