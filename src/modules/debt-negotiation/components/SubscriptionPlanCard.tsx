import { Zap } from "lucide-react";

import type { RenegotiationPlanLimit } from "@/modules/debt-negotiation/types/renegotiation-boxes";
import { getTrialExpirationMessage } from "@/modules/debt-negotiation/utils";
import type { TranslationKey } from "@/shared/i18n/config";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";

const DEFAULT_PLANS_PAGE_URL =
  "https://renegociacao.agentedeia.o2obots.com/#planos";

type SubscriptionPlanCardProps = {
  planType?: string;
  endDate?: string | null;
  debtsLimit?: RenegotiationPlanLimit;
  upgradeUrl?: string;
  delay?: number;
};

function limitPercent(limit?: RenegotiationPlanLimit): number {
  if (!limit || limit.total <= 0) return 0;
  const value = (limit.used / limit.total) * 100;
  return Math.max(0, Math.min(100, value));
}

function formatLimitValue(
  limit: RenegotiationPlanLimit | undefined,
  t: (key: TranslationKey) => string,
): string {
  if (!limit || limit.total <= 0) return "-";
  return `${limit.used} ${t("dashboard.subscription.plan.of")} ${limit.total}`;
}

export function SubscriptionPlanCard({
  planType,
  endDate,
  debtsLimit,
  upgradeUrl = DEFAULT_PLANS_PAGE_URL,
  delay = 0,
}: SubscriptionPlanCardProps) {
  const { t } = useI18n();

  const expirationMessage = getTrialExpirationMessage({ endDate, planType }, t);
  const progress = limitPercent(debtsLimit);

  return (
    <Card
      className="card-surface animate-fade-in opacity-0"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          {planType ?? t("dashboard.subscription.plan.fallbackName")}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 p-4 pt-0">
        {expirationMessage ? (
          <p className="text-xs font-medium text-destructive">
            {expirationMessage}
          </p>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <div className="text-sm text-foreground">
            {t("dashboard.subscription.plan.debtsLimit")}
          </div>
          <div className="flex items-center gap-3">
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-sm font-medium text-foreground">
              {formatLimitValue(debtsLimit, t)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <a href={upgradeUrl} target="_blank" rel="noreferrer">
            <Zap data-icon="inline-start" />
            {t("dashboard.subscription.plan.upgradeCta")}
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
