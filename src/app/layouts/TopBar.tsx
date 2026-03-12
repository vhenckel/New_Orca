import { Bell, ChevronDown, Download, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";

import type { AppModuleDefinition, AppRouteDefinition } from "@/app/router/types";
import { DashboardDateRangePicker } from "@/shared/components/DashboardDateRangePicker";
import { useI18n } from "@/shared/i18n/useI18n";
import { useNotifications } from "@/shared/notifications/useNotifications";
import { Button } from "@/shared/ui/button";
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
  const {
    notifications,
    unreadCount,
    isLoading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    isMarkingAll,
  } = useNotifications();

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
        {currentModule.key === "debt-negotiation" &&
          (currentRoute.path === "/debt-negotiation" || currentRoute.path === "/debt-negotiation/debts") && (
          <DashboardDateRangePicker />
        )}
        <Button size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            {currentModule.key === "debt-negotiation" &&
            (currentRoute.path === "/debt-negotiation" || currentRoute.path === "/debt-negotiation/debts")
              ? t("app.topbar.importDebts")
              : t("app.topbar.importData")}
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label={t("app.notifications.title")}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
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
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <div className="flex-1 space-y-1">
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
