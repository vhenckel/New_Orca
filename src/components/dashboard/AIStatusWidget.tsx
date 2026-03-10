import { Bot, MessageSquare, TrendingUp } from "lucide-react";

export function AIStatusWidget() {
  return (
    <div className="card-surface p-5 opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">AI Agents</h3>
        <span className="relative ml-auto flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <span className="text-xs text-muted-foreground">Ativos</span>
          <p className="text-lg font-bold font-mono text-foreground">3</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Conversas</span>
          <p className="text-lg font-bold font-mono text-foreground">12</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Taxa de Sucesso</span>
          <p className="text-lg font-bold font-mono text-primary">68%</p>
        </div>
      </div>
    </div>
  );
}
