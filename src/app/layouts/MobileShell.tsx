import type { PropsWithChildren } from "react";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import type { AppModuleDefinition, AppRouteDefinition } from "@/app/router/types";
import { MobileTopBar } from "./MobileTopBar";

interface MobileShellProps extends PropsWithChildren {
  modules: AppModuleDefinition[];
}

function getFallbackRoute(module: AppModuleDefinition): AppRouteDefinition {
  return module.routes[0];
}

function routePathMatches(routePath: string, pathname: string): boolean {
  const routeSegments = routePath.split("/").filter(Boolean);
  const pathSegments = pathname.split("/").filter(Boolean);
  if (routeSegments.length !== pathSegments.length) return false;
  return routeSegments.every(
    (seg, i) => seg.startsWith(":") || seg === pathSegments[i],
  );
}

export function MobileShell({ children, modules }: MobileShellProps) {
  const location = useLocation();

  const currentModule = useMemo(
    () => modules.find((m) => location.pathname.startsWith(m.basePath)) ?? modules[0],
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
    return <main className="min-h-svh flex-1 bg-background pb-safe">{children}</main>;
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <MobileTopBar currentModule={currentModule} currentRoute={currentRoute} />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden pb-4">
        <div className="mx-auto w-full max-w-lg flex-1 px-3 py-3">{children}</div>
      </main>
    </div>
  );
}
