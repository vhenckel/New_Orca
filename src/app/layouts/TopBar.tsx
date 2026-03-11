import { Bell, Bot, ChevronDown, Download, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";

import type { AppModuleDefinition, AppRouteDefinition } from "@/app/router/types";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

interface TopBarProps {
  currentModule: AppModuleDefinition;
  currentRoute: AppRouteDefinition;
}

export function TopBar({ currentModule, currentRoute }: TopBarProps) {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {t(currentModule.titleKey)}
          </span>
          <span className="hidden text-xs text-muted-foreground md:inline">/</span>
          <h1 className="truncate text-sm font-semibold text-foreground">{t(currentRoute.labelKey)}</h1>
        </div>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">
          {t(currentRoute.descriptionKey)}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground lg:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <Bot className="h-3.5 w-3.5" />
          {t("app.topbar.activeAgents")}
        </div>

        <Button size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t("app.topbar.importData")}</span>
        </Button>

        <button
          type="button"
          className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={t("app.topbar.userMenu")}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                T
              </div>
              <span className="hidden md:inline">Trademaster</span>
              <ChevronDown className="hidden h-3 w-3 text-muted-foreground md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                {t("app.topbar.preferences")}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
