import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

interface AdminChartCardProps {
  title: string;
  subtitle?: string;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AdminChartCard({
  title,
  subtitle,
  headerAction,
  children,
  className,
}: AdminChartCardProps) {
  return (
    <Card className={cn("shadow-card", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {subtitle ? <CardDescription>{subtitle}</CardDescription> : null}
        </div>
        {headerAction}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
