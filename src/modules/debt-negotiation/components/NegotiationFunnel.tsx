import { cn } from "@/shared/lib/utils";
import { useI18n } from "@/shared/i18n/useI18n";

export function NegotiationFunnel() {
  const { t } = useI18n();
  const stages = [
    { label: t("dashboard.funnel.registered"), value: 381, color: "bg-primary", width: "100%" },
    { label: t("dashboard.funnel.inCollection"), value: 340, color: "bg-primary/80", width: "89%" },
    { label: t("dashboard.funnel.inNegotiation"), value: 47, color: "bg-primary/60", width: "12%" },
    { label: t("dashboard.funnel.negotiated"), value: 14, color: "bg-primary/40", width: "4%" },
    { label: t("dashboard.funnel.paid"), value: 5, color: "bg-primary/25", width: "1.5%" },
  ];

  return (
    <div className="card-surface animate-fade-in p-5 opacity-0" style={{ animationDelay: "500ms" }}>
      <h3 className="mb-1 section-title">{t("dashboard.funnel.title")}</h3>
      <p className="mb-4 section-subtitle">{t("dashboard.funnel.subtitle")}</p>

      <div className="space-y-3">
        {stages.map((stage) => (
          <div key={stage.label} className="group cursor-pointer">
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
