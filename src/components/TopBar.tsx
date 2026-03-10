import { Bell, Download, CalendarDays, ChevronDown, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-foreground">Renegociação de Dívidas</h1>
        <span className="section-subtitle hidden sm:inline">Rastreie, gerencie e preveja suas negociações</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Date range */}
        <button className="hidden items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent md:flex">
          <CalendarDays className="h-3.5 w-3.5" />
          01/03/2026 — 10/03/2026
        </button>

        {/* AI Status */}
        <div className="hidden items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground lg:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <Bot className="h-3.5 w-3.5" />
          3 agentes ativos
        </div>

        {/* Import CTA */}
        <Button size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Importar Dívidas</span>
        </Button>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
        </button>

        {/* User */}
        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            T
          </div>
          <span className="hidden md:inline">Trademaster</span>
          <ChevronDown className="hidden h-3 w-3 text-muted-foreground md:block" />
        </button>
      </div>
    </header>
  );
}
