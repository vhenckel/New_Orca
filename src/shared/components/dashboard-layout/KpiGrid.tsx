import { cn } from "@/shared/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

import type { KpiItem } from "./types";

export type KpiGridProps = {
  items: KpiItem[];
  isLoading?: boolean;
  className?: string;
};

function skeletonCount(items: KpiItem[]) {
  if (items.length > 0) return items.length;
  return 2;
}

export function KpiGrid({ items, isLoading, className }: KpiGridProps) {
  if (isLoading) {
    const count = skeletonCount(items);
    return (
      <div
        className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}
        aria-busy="true"
        aria-label="Carregando indicadores"
      >
        {Array.from({ length: count }, (_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-3 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((item, index) => (
        <Card key={`${item.title}-${index}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "text-2xl font-bold",
                item.valueVariant === "primary" ? "text-primary" : "text-foreground",
              )}
            >
              {typeof item.value === "number" && item.isQuantity
                ? item.value.toLocaleString("pt-BR")
                : item.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
