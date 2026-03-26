import { ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink, matchPath, useLocation } from "react-router-dom";

import type { AppModuleDefinition } from "@/app/router/types";
import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";

/** Evita que `/debt-negotiation/contatos` marque também o módulo Renegociação (`/debt-negotiation`). */
function isModuleNavActive(module: AppModuleDefinition, pathname: string): boolean {
  const isContacts = Boolean(
    matchPath({ path: "/debt-negotiation/contacts/*", end: false }, pathname) ||
      matchPath({ path: "/debt-negotiation/contacts", end: true }, pathname),
  );

  if (module.key === "contact") return isContacts;

  if (module.key === "debt-negotiation") {
    const isDebtNegotiation = Boolean(
      matchPath({ path: "/debt-negotiation/*", end: false }, pathname) ||
        matchPath({ path: "/debt-negotiation", end: true }, pathname),
    );
    return isDebtNegotiation && !isContacts;
  }

  return Boolean(
    matchPath({ path: `${module.basePath}/*`, end: false }, pathname) ||
      matchPath({ path: module.basePath, end: true }, pathname),
  );
}

interface AppSidebarProps {
  collapsed: boolean;
  currentModule: AppModuleDefinition;
  modules: AppModuleDefinition[];
  onToggle: () => void;
}

export function AppSidebar({
  collapsed,
  currentModule,
  modules,
  onToggle,
}: AppSidebarProps) {
  const { t } = useI18n();
  const { pathname } = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-14 items-center justify-center border-b border-border bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] px-4">
        {collapsed ? (
          <img
            src="https://assets.o2ospot.com/spot/icons/o2ospot.svg"
            alt="O2OSPOT"
            className="mx-auto h-8 w-auto object-contain"
          />
        ) : (
          <img
            src="https://assets.o2ospot.com/spot/icons/o2ospot.svg"
            alt="O2OSPOT"
            className="mx-auto h-9 w-full max-w-[180px] object-contain"
          />
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t("app.sidebar.modules")}
            </p>
          )}
          {modules
            .filter((module) => !module.hideInSidebar)
            .map((module) => (
              <NavLink
                key={module.key}
                to={module.basePath}
                title={collapsed ? t(module.titleKey) : undefined}
                className={() =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                    collapsed && "justify-center px-0",
                    isModuleNavActive(module, pathname) &&
                      "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary",
                  )
                }
              >
                <module.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{t(module.titleKey)}</span>}
              </NavLink>
            ))}
        </div>

        {!currentModule.hideInSidebar && (
          <div className="mt-6 space-y-1">
            {!collapsed && (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t(currentModule.titleKey)}
              </p>
            )}
            {currentModule.routes
              .filter((route) => !route.hideInSidebar)
              .map((route) => (
                <NavLink
                  key={route.path}
                  to={route.path}
                  end={route.path === currentModule.basePath}
                  title={collapsed ? t(route.labelKey) : undefined}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                      collapsed && "justify-center px-0",
                      isActive && "bg-accent text-foreground",
                    )
                  }
                >
                  <route.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{t(route.labelKey)}</span>}
                </NavLink>
              ))}
          </div>
        )}
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
