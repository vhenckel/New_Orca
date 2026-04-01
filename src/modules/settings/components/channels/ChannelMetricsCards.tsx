import {
  Ban,
  CheckCircle2,
  MessageCircle,
  Percent,
  TriangleAlert,
} from "lucide-react";

import type { ChannelListSummary } from "@/modules/settings/types/channel";
import { useI18n } from "@/shared/i18n/useI18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

function MetricCard({
  title,
  value,
  icon: Icon,
  valueClassName,
}: {
  title: string;
  value: string;
  icon: typeof CheckCircle2;
  valueClassName?: string;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4 shrink-0 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className={cn("text-2xl font-semibold tabular-nums", valueClassName)}>{value}</p>
      </CardContent>
    </Card>
  );
}

export function ChannelMetricsCards({ summary }: { summary: ChannelListSummary | null | undefined }) {
  const { t } = useI18n();
  const active = summary?.activeChannels ?? 0;
  const total = summary?.totalChannels ?? 0;
  const messages = summary?.totalMessagesToday ?? 0;
  const rate = summary?.averageSuccessRate;
  const atCap = summary?.channelsAtCapacity ?? 0;
  const blocked = summary?.totalBlockedMessagesToday ?? 0;

  const ratePct =
    rate == null ? null : rate <= 1 && rate >= 0 ? rate * 100 : rate;
  const rateLabel = ratePct == null ? "—" : `${ratePct.toFixed(1)}%`;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <MetricCard
        title={t("modules.settings.channels.metrics.active")}
        value={`${active}/${total || active || 0}`}
        icon={CheckCircle2}
        valueClassName="text-emerald-600 dark:text-emerald-400"
      />
      <MetricCard
        title={t("modules.settings.channels.metrics.messagesToday")}
        value={String(messages)}
        icon={MessageCircle}
      />
      <MetricCard
        title={t("modules.settings.channels.metrics.successRate")}
        value={rateLabel}
        icon={Percent}
        valueClassName="text-emerald-600 dark:text-emerald-400"
      />
      <MetricCard
        title={t("modules.settings.channels.metrics.atCapacity")}
        value={String(atCap)}
        icon={TriangleAlert}
      />
      <MetricCard
        title={t("modules.settings.channels.metrics.blockedToday")}
        value={String(blocked)}
        icon={Ban}
      />
    </div>
  );
}
