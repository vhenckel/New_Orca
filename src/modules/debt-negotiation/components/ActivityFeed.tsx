import { AlertCircle, Bot, CheckCircle2, MessageSquare } from "lucide-react";

import { useI18n } from "@/shared/i18n/useI18n";

const typeStyles = {
  success: "text-success",
  ai: "text-primary",
  warning: "text-warning",
  default: "text-muted-foreground",
};

export function ActivityFeed() {
  const { t } = useI18n();

  const activities = [
    {
      icon: CheckCircle2,
      text: t("dashboard.activity.item1"),
      time: t("dashboard.activity.time2m"),
      type: "success" as const,
    },
    {
      icon: Bot,
      text: t("dashboard.activity.item2"),
      time: t("dashboard.activity.time5m"),
      type: "ai" as const,
    },
    {
      icon: MessageSquare,
      text: t("dashboard.activity.item3"),
      time: t("dashboard.activity.time12m"),
      type: "default" as const,
    },
    {
      icon: Bot,
      text: t("dashboard.activity.item4"),
      time: t("dashboard.activity.time18m"),
      type: "ai" as const,
    },
    {
      icon: AlertCircle,
      text: t("dashboard.activity.item5"),
      time: t("dashboard.activity.time25m"),
      type: "warning" as const,
    },
    {
      icon: CheckCircle2,
      text: t("dashboard.activity.item6"),
      time: t("dashboard.activity.time32m"),
      type: "success" as const,
    },
  ];

  return (
    <div className="card-surface animate-fade-in p-5 opacity-0" style={{ animationDelay: "600ms" }}>
      <h3 className="mb-1 section-title">{t("dashboard.activity.title")}</h3>
      <p className="mb-4 section-subtitle">{t("dashboard.activity.subtitle")}</p>

      <div className="space-y-3">
        {activities.map((item) => (
          <div
            key={`${item.text}-${item.time}`}
            className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
          >
            <item.icon className={`mt-0.5 h-4 w-4 shrink-0 ${typeStyles[item.type]}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug text-foreground">{item.text}</p>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
