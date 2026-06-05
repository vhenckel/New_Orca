import { OPERATIONAL_ALERTS } from "@/modules/admin/dashboard/data/adminDashboardMocks";
import type { AlertTone } from "@/modules/admin/dashboard/types";
import { actionCardClass } from "@/shared/lib/status-tones";
import { cn } from "@/shared/lib/utils";

function alertClass(tone: AlertTone) {
  if (tone === "danger") return actionCardClass("danger");
  if (tone === "warning") return actionCardClass("warning");
  return actionCardClass("info");
}

export function OperationalAlertsSection() {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-base font-semibold text-foreground">Alertas operacionais</h2>
        <p className="text-sm text-muted-foreground">Itens que merecem atenção da equipe</p>
      </div>
      <ul className="flex flex-col gap-2">
        {OPERATIONAL_ALERTS.map((alert) => {
          const Icon = alert.icon;
          return (
            <li
              key={alert.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3 text-sm",
                alertClass(alert.tone),
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{alert.message}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
