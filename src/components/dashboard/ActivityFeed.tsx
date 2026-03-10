import { Bot, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react";

const activities = [
  {
    icon: CheckCircle2,
    text: "Pagamento confirmado do contrato #29391",
    time: "Há 2 min",
    type: "success" as const,
  },
  {
    icon: Bot,
    text: "Agente IA iniciou negociação com Maria Silva",
    time: "Há 5 min",
    type: "ai" as const,
  },
  {
    icon: MessageSquare,
    text: "João Oliveira negociou R$ 1.200",
    time: "Há 12 min",
    type: "default" as const,
  },
  {
    icon: Bot,
    text: "Agente IA enviou proposta para Carlos Souza",
    time: "Há 18 min",
    type: "ai" as const,
  },
  {
    icon: AlertCircle,
    text: "Devedor Ana Santos não respondeu em 48h",
    time: "Há 25 min",
    type: "warning" as const,
  },
  {
    icon: CheckCircle2,
    text: "Acordo firmado com Pedro Lima — R$ 850",
    time: "Há 32 min",
    type: "success" as const,
  },
];

const typeStyles = {
  success: "text-success",
  ai: "text-primary",
  warning: "text-warning",
  default: "text-muted-foreground",
};

export function ActivityFeed() {
  return (
    <div className="card-surface p-5 opacity-0 animate-fade-in" style={{ animationDelay: "600ms" }}>
      <h3 className="section-title mb-1">Atividade Recente</h3>
      <p className="section-subtitle mb-4">Atualizações em tempo real</p>

      <div className="space-y-3">
        {activities.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
          >
            <item.icon className={`mt-0.5 h-4 w-4 shrink-0 ${typeStyles[item.type]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-snug">{item.text}</p>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
