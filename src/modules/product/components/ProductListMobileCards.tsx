import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ProductPills } from "@/modules/product/components/ProductPills";
import {
  formatAdminProductName,
  formatEstablishmentProductName,
  getAdminSegmentLabels,
  getBrandNames,
  getEstablishmentSegmentLabels,
} from "@/modules/product/lib/product-list-display";
import {
  getProductEditHref,
  saveProductListScroll,
} from "@/modules/product/lib/product-list-navigation";
import type {
  AdminProductListItem,
  EstablishmentProductListItem,
} from "@/modules/product/types/product-list";
import { useInfiniteScrollSentinel } from "@/shared/hooks/useInfiniteScrollSentinel";
import type { ApiUserRole } from "@/shared/auth/types";
import { useI18n } from "@/shared/i18n/useI18n";
import { Card, CardContent } from "@/shared/ui/card";

interface ProductListMobileCardsProps {
  role: ApiUserRole;
  adminRows: AdminProductListItem[];
  establishmentRows: EstablishmentProductListItem[];
  showEstablishmentColumn: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  hasDraft?: (entityId: string) => boolean;
}

export function ProductListMobileCards({
  role,
  adminRows,
  establishmentRows,
  showEstablishmentColumn,
  scrollRef,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  hasDraft,
}: ProductListMobileCardsProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isAdmin = role === "admin";
  const rows = isAdmin ? adminRows : establishmentRows;

  useInfiniteScrollSentinel(sentinelRef, {
    enabled: hasNextPage && !isFetchingNextPage,
    onLoadMore,
    scrollRef,
  });

  const openRow = (row: AdminProductListItem | EstablishmentProductListItem) => {
    if (scrollRef.current) saveProductListScroll(scrollRef.current.scrollTop);
    navigate(getProductEditHref(row, role));
  };

  if (rows.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        {t("modules.product.list.empty")}
      </p>
    );
  }

  return (
    <div ref={scrollRef} className="flex max-h-[calc(100vh-14rem)] flex-col gap-3 overflow-auto">
      {isAdmin
        ? adminRows.map((row, index) => (
            <Card
              key={row.id}
              className="cursor-pointer transition-colors hover:bg-muted/30"
              onClick={() => openRow(row)}
            >
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={getProductEditHref(row, role)}
                    className="font-medium tabular-nums text-primary underline-offset-4 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {index + 1}
                  </Link>
                  <span className="text-xs text-muted-foreground">{row.unitType}</span>
                </div>
                <p className="font-medium">{formatAdminProductName(row)}</p>
                <ProductPills
                  items={getBrandNames(row)}
                  variant="brand"
                  moreLabel={(n) => t("modules.product.list.moreCount", { count: n })}
                />
                <ProductPills
                  items={getAdminSegmentLabels(row)}
                  variant="segment"
                  moreLabel={(n) => t("modules.product.list.moreCount", { count: n })}
                />
                <span className="text-sm text-muted-foreground">
                  {t("modules.product.list.table.establishments")}: {row.establishmentCount}
                </span>
              </CardContent>
            </Card>
          ))
        : establishmentRows.map((row, index) => (
            <Card
              key={row.establishmentProductId}
              className="cursor-pointer transition-colors hover:bg-muted/30"
              onClick={() => openRow(row)}
            >
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={getProductEditHref(row, role)}
                    className="font-medium tabular-nums text-primary underline-offset-4 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {index + 1}
                  </Link>
                  <span className="text-xs text-muted-foreground">{row.unitType}</span>
                </div>
                <p className="font-medium">{formatEstablishmentProductName(row)}</p>
                {showEstablishmentColumn ? (
                  <p className="text-sm text-muted-foreground">{row.establishment?.name}</p>
                ) : null}
                <ProductPills
                  items={getBrandNames(row)}
                  variant="brand"
                  moreLabel={(n) => t("modules.product.list.moreCount", { count: n })}
                />
                <ProductPills
                  items={getEstablishmentSegmentLabels(row)}
                  variant="segment"
                  moreLabel={(n) => t("modules.product.list.moreCount", { count: n })}
                />
              </CardContent>
            </Card>
          ))}
      {hasNextPage ? (
        <div ref={sentinelRef} className="py-4 text-center text-sm text-muted-foreground">
          {isFetchingNextPage ? t("modules.product.list.loadingMore") : null}
        </div>
      ) : null}
    </div>
  );
}
