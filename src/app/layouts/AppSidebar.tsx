import { ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";

import type { AppModuleDefinition } from "@/app/router/types";
import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";

interface AppSidebarProps {
  collapsed: boolean;
  modules: AppModuleDefinition[];
  onToggle: () => void;
}

export function AppSidebar({
  collapsed,
  modules,
  onToggle,
}: AppSidebarProps) {
  const { t } = useI18n();
  const visibleModules = modules.filter((module) => !module.hideInSidebar);
  const primaryModule = visibleModules[0];
  const menuRoutes = primaryModule?.routes.filter((route) => !route.hideInSidebar) ?? [];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-14 items-center border-b border-border bg-card px-4">
        <div className={cn("flex items-center gap-2", collapsed && "justify-center w-full")}>
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            O
          </div>
          {!collapsed && <span className="text-lg font-semibold text-foreground">Orca</span>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {menuRoutes.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              end={route.path !== "/quotations"}
              title={collapsed ? t(route.labelKey) : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  collapsed && "justify-center px-0",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary",
                )
              }
            >
              <route.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{t(route.labelKey)}</span>}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
