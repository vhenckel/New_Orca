import { Bot } from "lucide-react";

import { useI18n } from "@/shared/i18n/useI18n";

export function AIStatusWidget() {
  const { t } = useI18n();

  return (
    <div className="card-surface animate-fade-in p-5 opacity-0" style={{ animationDelay: "200ms" }}>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{t("dashboard.aiAgents.title")}</h3>
        <span className="relative ml-auto flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <span className="text-xs text-muted-foreground">{t("dashboard.aiAgents.active")}</span>
          <p className="font-mono text-lg font-bold text-foreground">3</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">{t("dashboard.aiAgents.conversations")}</span>
          <p className="font-mono text-lg font-bold text-foreground">12</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">{t("dashboard.aiAgents.successRate")}</span>
          <p className="font-mono text-lg font-bold text-primary">68%</p>
        </div>
      </div>
    </div>
  );
}
