import { Bell, ChevronDown, LogOut, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";

import type { AppModuleDefinition, AppRouteDefinition } from "@/app/router/types";
import { useAuth } from "@/shared/auth/AuthContext";
import { getCompanyNameFromToken } from "@/shared/auth/jwt";
import { getStoredToken } from "@/shared/auth/token-store";
import { useI18n } from "@/shared/i18n/useI18n";
import { useNotifications } from "@/shared/notifications/useNotifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { ScrollArea } from "@/shared/ui/scroll-area";

interface TopBarProps {
  currentModule: AppModuleDefinition;
  currentRoute: AppRouteDefinition;
}

export function TopBar({ currentModule, currentRoute }: TopBarProps) {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const token = getStoredToken();
  const companyName = token ? getCompanyNameFromToken(token) : null;
  const {
    notifications,
    unreadCount,
    isLoading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    isMarkingAll,
  } = useNotifications();

  const parent = currentRoute.topBarParent;
  const parentTo =
    parent != null
      ? `${parent.path}${parent.preserveSearch ? location.search : ""}`
      : null;

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-border bg-card px-6">
      <div className="min-w-0 flex-1">
        <nav aria-label={t("app.topbar.breadcrumbNav")} className="flex min-w-0 items-center gap-2">
          <Link
            to={currentModule.sidebarLinkTo ?? currentModule.basePath}
            className="shrink-0 truncate text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t(currentModule.titleKey)}
          </Link>
          {parentTo != null && parent != null ? (
            <>
              <span className="hidden shrink-0 text-sm text-muted-foreground md:inline">/</span>
              <Link
                to={parentTo}
                className="min-w-0 max-w-[40%] truncate text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:max-w-[50%]"
              >
                {t(parent.labelKey)}
              </Link>
            </>
          ) : null}
          <span className="hidden shrink-0 text-sm text-muted-foreground md:inline">/</span>
          <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
            {t(currentRoute.labelKey)}
          </h1>
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label={t("app.notifications.title")}
            >
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 size-2 rounded-full bg-primary" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b px-3 py-2">
              <span className="text-sm font-medium">
                {t("app.notifications.title")}
              </span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => markAllAsRead()}
                  disabled={isMarkingAll}
                >
                  {t("app.notifications.markAllRead")}
                </button>
              )}
            </div>
            <ScrollArea className="max-h-80">
              <div className="divide-y">
                {notificationsLoading && (
                  <div className="px-3 py-4 text-xs text-muted-foreground">
                    {t("app.notifications.loading")}
                  </div>
                )}
                {!notificationsLoading && notifications.length === 0 && (
                  <div className="px-3 py-4 text-xs text-muted-foreground">
                    {t("app.notifications.empty")}
                  </div>
                )}
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-accent/60"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <span className="mt-1 size-2 rounded-full bg-primary" />
                    <div className="flex flex-1 flex-col gap-1">
                      <p className="text-xs font-medium text-foreground">
                        {notification.title}
                      </p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={t("app.topbar.userMenu")}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {user?.name?.charAt(0)?.toUpperCase() ?? "T"}
              </div>
              <div className="hidden max-w-[160px] flex-col md:flex">
                <span className="truncate text-sm font-medium text-foreground">
                  {user?.name ?? "—"}
                </span>
                {companyName && (
                  <span className="truncate text-xs text-muted-foreground">
                    {companyName}
                  </span>
                )}
              </div>
              <ChevronDown className="hidden size-3 text-muted-foreground md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link to="/config" className="flex items-center gap-2">
                <Settings2 className="size-4" />
                {t("app.topbar.preferences")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => logout()} className="gap-2">
              <LogOut className="size-4" />
              {t("app.topbar.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
