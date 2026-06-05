import { ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import type { AppModuleDefinition } from "@/app/router/types";
import { useI18n } from "@/shared/i18n/useI18n";
import { ORCA_LOGO_LIGHT } from "@/shared/theme/brand-assets";
import { cn } from "@/shared/lib/utils";

interface AppSidebarProps {
  collapsed: boolean;
  modules: AppModuleDefinition[];
  onSidebarItemClick: (to: string) => void;
  onToggle: () => void;
}

function moduleNavIsActive(pathname: string, to: string): boolean {
  if (pathname === to) return true;
  if (to === "/") return false;
  return pathname.startsWith(`${to}/`);
}

export function AppSidebar({
  collapsed,
  modules,
  onSidebarItemClick,
  onToggle,
}: AppSidebarProps) {
  const { t } = useI18n();
  const location = useLocation();
  const visibleModules = modules.filter((module) => !module.hideInSidebar);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-52",
      )}
    >
      <div className="relative flex h-16 shrink-0 items-center justify-center border-b border-sidebar-border px-3 bg-sidebar-glow">
        <img
          src={ORCA_LOGO_LIGHT}
          alt="Orca"
          className={cn(
            "h-auto max-h-9 w-auto object-contain transition-all duration-300",
            collapsed ? "max-w-9" : "max-w-[140px]",
          )}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-1">
          {visibleModules.map((module) => {
            const to = module.sidebarLinkTo ?? module.basePath;
            const ModuleIcon = module.icon;
            const isActive = moduleNavIsActive(location.pathname, to);
            return (
              <NavLink
                key={module.key}
                to={to}
                onClick={() => onSidebarItemClick(to)}
                title={collapsed ? t(module.titleKey) : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center px-0",
                  isActive &&
                    "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <ModuleIcon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-sidebar-primary" : "text-sidebar-foreground",
                  )}
                />
                {!collapsed && <span className="truncate">{t(module.titleKey)}</span>}
              </NavLink>
            );
          })}
        </div>
      </div>

      <div className="border-t border-sidebar-border p-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
