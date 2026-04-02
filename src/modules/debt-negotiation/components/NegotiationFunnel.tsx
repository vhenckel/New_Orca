import { useMemo } from "react";
import { cn } from "@/shared/lib/utils";
import { useI18n } from "@/shared/i18n/useI18n";
import { useRenegotiationBoxes } from "@/modules/debt-negotiation/hooks";
import { useRenegotiationDetails } from "@/modules/debt-negotiation/hooks";

function parseNum(s: string): number {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

export function NegotiationFunnel() {
  const { t } = useI18n();
  const { data: boxesData } = useRenegotiationBoxes();
  const { data: detailsData } = useRenegotiationDetails({ showValues: "quantity" });

  const stages = useMemo(() => {
    const registered = boxesData?.totalDebtCount.currentValue ?? 0;
    const inNegotiation = boxesData?.totalNegotiatedCount.currentValue ?? 0;
    const negotiated = (detailsData?.values ?? []).reduce(
      (acc, row) =>
        acc + parseNum(row.negotiated) + parseNum(row.negotiatedWithoutPayment),
      0,
    );
    const paid = boxesData?.totalRecoveredCount.currentValue ?? 0;
    const inCollection = Math.max(
      0,
      registered - inNegotiation - negotiated - paid,
    );

    const values = [registered, inCollection, inNegotiation, negotiated, paid];
    const max = Math.max(registered, 1);
    const keys = ["registered", "inCollection", "inNegotiation", "negotiated", "paid"] as const;

    return keys.map((key, i) => ({
      key,
      label: t(`dashboard.funnel.${key}`),
      value: values[i],
      width: `${Math.round((values[i] / max) * 100)}%`,
      color:
        key === "registered"
          ? "bg-primary"
          : key === "inCollection"
            ? "bg-primary/80"
            : key === "inNegotiation"
              ? "bg-primary/60"
              : key === "negotiated"
                ? "bg-primary/40"
                : "bg-primary/25",
    }));
  }, [boxesData, detailsData, t]);

  return (
    <div className="card-surface animate-fade-in p-5 opacity-0" style={{ animationDelay: "500ms" }}>
      <h3 className="mb-1 section-title">{t("dashboard.funnel.title")}</h3>
      <p className="mb-4 section-subtitle">{t("dashboard.funnel.subtitle")}</p>

      <div className="space-y-3">
        {stages.map((stage) => (
          <div key={stage.key} className="group cursor-pointer">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">{stage.label}</span>
              <span className="font-mono text-xs font-semibold text-foreground">{stage.value}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 group-hover:opacity-80",
                  stage.color,
                )}
                style={{ width: stage.width }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
