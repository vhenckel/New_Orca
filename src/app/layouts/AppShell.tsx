import type { PropsWithChildren } from "react";
import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import type { AppModuleDefinition, AppRouteDefinition } from "@/app/router/types";
import { cn } from "@/shared/lib/utils";

import { AppSidebar } from "./AppSidebar";
import {
  readSidebarCollapsedPreference,
  writeSidebarCollapsedPreference,
} from "./sidebar-preference";
import { TopBar } from "./TopBar";

interface AppShellProps extends PropsWithChildren {
  modules: AppModuleDefinition[];
}

function getFallbackRoute(module: AppModuleDefinition): AppRouteDefinition {
  return module.routes[0];
}

/** Verifica se pathname corresponde ao path da rota (suporta segmentos :param). */
function routePathMatches(routePath: string, pathname: string): boolean {
  const routeSegments = routePath.split("/").filter(Boolean);
  const pathSegments = pathname.split("/").filter(Boolean);
  if (routeSegments.length !== pathSegments.length) return false;
  return routeSegments.every(
    (seg, i) => seg.startsWith(":") || seg === pathSegments[i],
  );
}

export function AppShell({ children, modules }: AppShellProps) {
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsedPreference);

  const handleSidebarToggle = () => {
    setSidebarCollapsed((currentValue) => {
      const nextValue = !currentValue;
      writeSidebarCollapsedPreference(nextValue);
      return nextValue;
    });
  };

  const currentModule = useMemo(
    () =>
      modules.find((module) => location.pathname.startsWith(module.basePath)) ?? modules[0],
    [location.pathname, modules],
  );

  const currentRoute = useMemo(
    () =>
      currentModule?.routes.find(
        (route) =>
          route.path === location.pathname || routePathMatches(route.path, location.pathname),
      ) ?? (currentModule ? getFallbackRoute(currentModule) : null),
    [currentModule, location.pathname],
  );

  if (!currentModule || !currentRoute) {
    return <main className="flex min-h-screen flex-1 flex-col">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        collapsed={sidebarCollapsed}
        modules={modules}
        onToggle={handleSidebarToggle}
      />

      <div
        className={cn(
          "flex min-h-screen min-w-0 flex-1 flex-col transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-52",
        )}
      >
        <TopBar currentModule={currentModule} currentRoute={currentRoute} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto max-w-[2046px] p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
