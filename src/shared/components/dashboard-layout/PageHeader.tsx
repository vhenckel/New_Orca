import { Fragment, type ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";

import type { BreadcrumbItem as BreadcrumbItemData } from "./types";

export type PageHeaderProps = {
  title: string;
  subtitle?: string;
  breadcrumb?: { items: BreadcrumbItemData[] };
  onBack?: () => void;
  backLabel?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  onBack,
  backLabel,
  actions,
  className,
}: PageHeaderProps) {
  const { t } = useI18n();
  const resolvedBackLabel = backLabel ?? t("common.back");
  const items = breadcrumb?.items ?? [];
  const showHeaderBlock = Boolean(title || subtitle || actions);

  return (
    <header className={cn("flex flex-col gap-4", className)}>
      {onBack && (
        <Button type="button" variant="ghost" size="sm" className="w-fit gap-1 px-0" onClick={onBack}>
          <ChevronLeft data-icon="inline-start" />
          {resolvedBackLabel}
        </Button>
      )}

      {items.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              return (
                <Fragment key={`${item.label}-${index}`}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : item.href ? (
                      <BreadcrumbLink asChild>
                        <Link to={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    ) : item.onClick ? (
                      <BreadcrumbLink asChild>
                        <button type="button" onClick={item.onClick} className="cursor-pointer">
                          {item.label}
                        </button>
                      </BreadcrumbLink>
                    ) : (
                      <span className="text-muted-foreground">{item.label}</span>
                    )}
                  </BreadcrumbItem>
                  {!isLast ? <BreadcrumbSeparator /> : null}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {showHeaderBlock && (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            {title ? <h1 className="text-xl font-semibold text-foreground">{title}</h1> : null}
            {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      )}
    </header>
  );
}
