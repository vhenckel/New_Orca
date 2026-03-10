import { cn } from "@/lib/utils";

const stages = [
  { label: "Registradas", value: 381, color: "bg-primary", width: "100%" },
  { label: "Em Cobrança", value: 340, color: "bg-primary/80", width: "89%" },
  { label: "Em Negociação", value: 47, color: "bg-primary/60", width: "12%" },
  { label: "Negociado", value: 14, color: "bg-primary/40", width: "4%" },
  { label: "Pago", value: 5, color: "bg-primary/25", width: "1.5%" },
];

export function NegotiationFunnel() {
  return (
    <div className="card-surface p-5 opacity-0 animate-fade-in" style={{ animationDelay: "500ms" }}>
      <h3 className="section-title mb-1">Funil de Negociação</h3>
      <p className="section-subtitle mb-4">Pipeline de recuperação</p>

      <div className="space-y-3">
        {stages.map((stage, i) => (
          <div key={i} className="group cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-foreground">{stage.label}</span>
              <span className="text-xs font-mono font-semibold text-foreground">{stage.value}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 group-hover:opacity-80",
                  stage.color
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
