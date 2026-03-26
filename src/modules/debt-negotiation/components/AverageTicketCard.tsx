import { Info } from "lucide-react";

import { useI18n } from "@/shared/i18n/useI18n";
import { formatCurrency } from "@/shared/lib/format";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";

type AverageTicketCardProps = {
  value?: number | null;
  delay?: number;
};

export function AverageTicketCard({ value, delay = 0 }: AverageTicketCardProps) {
  const { t } = useI18n();

  return (
    <Card
      className="card-surface animate-fade-in opacity-0"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 p-4 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {t("dashboard.subscription.averageTicket.title")}
        </CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground/70 transition-colors hover:text-muted-foreground"
                aria-label={t("dashboard.subscription.averageTicket.tooltip")}
              >
                <Info />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("dashboard.subscription.averageTicket.tooltip")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>

      <CardContent className="flex min-h-20 items-center justify-center p-4 pt-0">
        <span className="text-4xl font-semibold tracking-tight text-foreground">
          {formatCurrency(value)}
        </span>
      </CardContent>
    </Card>
  );
}
