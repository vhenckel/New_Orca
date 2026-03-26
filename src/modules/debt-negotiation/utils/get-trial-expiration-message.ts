import type { TranslationKey } from "@/shared/i18n/config";
import type { TranslationVars } from "@/shared/i18n/I18nContext";

type TrialExpirationInput = {
  endDate?: string | null;
  planType?: string;
};

function toDateOnly(value: string): Date | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function diffInDays(from: Date, to: Date): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY);
}

export function getTrialExpirationMessage(
  input: TrialExpirationInput,
  t: (key: TranslationKey, vars?: TranslationVars) => string,
): string | null {
  const { endDate, planType } = input;
  if (!endDate || !planType || !planType.toLowerCase().includes("trial")) return null;

  const end = toDateOnly(endDate);
  if (!end) return null;

  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysToExpire = diffInDays(todayOnly, end);

  if (daysToExpire > 2) return null;
  if (daysToExpire < 0) return t("dashboard.subscription.plan.trialExpired");
  if (daysToExpire === 0) return t("dashboard.subscription.plan.trialExpiresToday");
  return t("dashboard.subscription.plan.trialExpiresInDays", {
    days: daysToExpire,
    planType,
  });
}
