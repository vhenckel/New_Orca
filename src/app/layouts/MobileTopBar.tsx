import { Inbox, LogOut, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

import type { AppModuleDefinition, AppRouteDefinition } from "@/app/router/types";
import { useAuth } from "@/shared/auth/AuthContext";
import { getCompanyNameFromToken } from "@/shared/auth/jwt";
import { getStoredToken } from "@/shared/auth/token-store";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/ui/sheet";

interface MobileTopBarProps {
  currentModule: AppModuleDefinition;
  currentRoute: AppRouteDefinition;
}

export function MobileTopBar({ currentModule, currentRoute }: MobileTopBarProps) {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const token = getStoredToken();
  const companyName = token ? getCompanyNameFromToken(token) : null;

  const listPath = currentModule.basePath;
  const parent = currentRoute.topBarParent;
  const backPath = parent != null ? parent.path : listPath;
  const showBack = Boolean(currentRoute.hideInSidebar);

  return (
    <header className="sticky top-0 z-20 flex h-12 items-center justify-between gap-2 border-b border-border bg-card px-3">
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          {showBack ? (
            <Button
              asChild
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 px-1.5"
            >
              <Link to={backPath}>{t("app.mobile.backToList")}</Link>
            </Button>
          ) : null}
          <h1 className="min-w-0 truncate text-sm font-semibold text-foreground">
            {t(currentRoute.labelKey)}
          </h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9"
          onClick={() => setOpen(true)}
          aria-label={t("app.mobile.menuLabel")}
        >
          <Menu className="size-5" />
        </Button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-sm">
          <SheetHeader className="border-b border-border p-4 text-left">
            <SheetTitle className="text-base">{t("app.mobile.menuTitle")}</SheetTitle>
            <p className="line-clamp-2 text-left text-sm font-medium text-foreground">
              {user?.name ?? "—"}
            </p>
            {companyName ? (
              <p className="line-clamp-2 text-left text-xs text-muted-foreground">{companyName}</p>
            ) : null}
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-0 p-2">
            <Button
              asChild
              variant="ghost"
              className="h-11 w-full justify-start gap-2 font-normal"
            >
              <Link to={listPath} onClick={() => setOpen(false)}>
                <Inbox className="size-4" aria-hidden />
                {t("modules.supplierPortal.quotation.title")}
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full justify-start gap-2 font-normal text-destructive hover:text-destructive"
              onClick={() => {
                setOpen(false);
                logout();
              }}
            >
              <LogOut className="size-4" aria-hidden />
              {t("app.topbar.logout")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
