import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
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
import { cn } from "@/shared/lib/utils";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";

interface ProductListTableProps {
  role: ApiUserRole;
  adminRows: AdminProductListItem[];
  establishmentRows: EstablishmentProductListItem[];
  showEstablishmentColumn: boolean;
  sort: string;
  order: string;
  onToggleNameSort: () => void;
  onToggleEstablishmentSort: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onDelete?: (row: AdminProductListItem) => void;
  hasDraft?: (entityId: string) => boolean;
}

export function ProductListTable({
  role,
  adminRows,
  establishmentRows,
  showEstablishmentColumn,
  sort,
  order,
  onToggleNameSort,
  onToggleEstablishmentSort,
  scrollRef,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onDelete,
  hasDraft,
}: ProductListTableProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const sentinelRef = useRef<HTMLTableRowElement>(null);
  const isAdmin = role === "admin";
  const rows = isAdmin ? adminRows : establishmentRows;
  const colSpan =
    5 + (isAdmin ? 1 : showEstablishmentColumn ? 1 : 0) + 1;

  useInfiniteScrollSentinel(sentinelRef, {
    enabled: hasNextPage && !isFetchingNextPage,
    onLoadMore,
    scrollRef,
  });

  const openRow = (row: AdminProductListItem | EstablishmentProductListItem) => {
    if (scrollRef.current) saveProductListScroll(scrollRef.current.scrollTop);
    navigate(getProductEditHref(row, role));
  };

  const rowEntityId = (row: AdminProductListItem | EstablishmentProductListItem) =>
    role === "establishment"
      ? (row as EstablishmentProductListItem).establishmentProductId
      : row.id;

  return (
    <div
      ref={scrollRef}
      className="max-h-[calc(100vh-16rem)] overflow-auto rounded-lg border border-border bg-card"
    >
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow>
            <TableHead className="w-16">{t("modules.product.list.table.index")}</TableHead>
            <TableHead>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 gap-1 font-medium"
                onClick={onToggleNameSort}
              >
                {t("modules.product.list.table.product")}
                <ArrowUpDown
                  className={cn(
                    "size-3.5",
                    sort === "name" ? "text-foreground" : "text-muted-foreground",
                  )}
                />
              </Button>
            </TableHead>
            <TableHead>{t("modules.product.list.table.unit")}</TableHead>
            <TableHead>{t("modules.product.list.table.brands")}</TableHead>
            <TableHead>{t("modules.product.list.table.segments")}</TableHead>
            {isAdmin ? (
              <TableHead>{t("modules.product.list.table.establishments")}</TableHead>
            ) : showEstablishmentColumn ? (
              <TableHead>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 gap-1 font-medium"
                  onClick={onToggleEstablishmentSort}
                >
                  {t("modules.product.list.table.establishment")}
                  <ArrowUpDown
                    className={cn(
                      "size-3.5",
                      sort === "establishmentId" ? "text-foreground" : "text-muted-foreground",
                    )}
                  />
                </Button>
              </TableHead>
            ) : null}
            <TableHead className="w-[100px] text-right">
              <span className="sr-only">{t("modules.product.list.table.actions")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="h-24 text-center text-muted-foreground">
                {t("modules.product.list.empty")}
              </TableCell>
            </TableRow>
          ) : isAdmin ? (
            adminRows.map((row, index) => (
              <TableRow key={row.id} className="cursor-pointer" onClick={() => openRow(row)}>
                <TableCell className="font-medium tabular-nums">
                  <Link
                    to={getProductEditHref(row, role)}
                    className="text-primary underline-offset-4 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {index + 1}
                  </Link>
                </TableCell>
                <TableCell className="font-medium">{formatAdminProductName(row)}</TableCell>
                <TableCell className="text-muted-foreground">{row.unitType}</TableCell>
                <TableCell>
                  <ProductPills
                    items={getBrandNames(row)}
                    variant="brand"
                    moreLabel={(n) => t("modules.product.list.moreCount", { count: n })}
                  />
                </TableCell>
                <TableCell>
                  <ProductPills
                    items={getAdminSegmentLabels(row)}
                    variant="segment"
                    moreLabel={(n) => t("modules.product.list.moreCount", { count: n })}
                  />
                </TableCell>
                <TableCell>
                  <span className="font-medium tabular-nums text-foreground">
                    {row.establishmentCount}
                  </span>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <TooltipProvider delayDuration={300}>
                    <div className="flex items-center justify-end gap-0.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="relative size-8 text-muted-foreground hover:text-foreground"
                            onClick={() => openRow(row)}
                            aria-label={t("modules.product.list.actions.edit")}
                          >
                            <Pencil className="size-4" aria-hidden />
                            {hasDraft?.(rowEntityId(row)) ? (
                              <span className="absolute right-1 top-1 size-1.5 rounded-full bg-primary" />
                            ) : null}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {hasDraft?.(rowEntityId(row))
                            ? t("modules.product.list.actions.editDraft")
                            : t("modules.product.list.actions.edit")}
                        </TooltipContent>
                      </Tooltip>
                      {onDelete ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-destructive"
                              onClick={() => onDelete(row)}
                              aria-label={t("modules.product.list.actions.delete")}
                            >
                              <Trash2 className="size-4" aria-hidden />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t("modules.product.list.actions.delete")}</TooltipContent>
                        </Tooltip>
                      ) : null}
                    </div>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))
          ) : (
            establishmentRows.map((row, index) => (
              <TableRow
                key={row.establishmentProductId}
                className="cursor-pointer"
                onClick={() => openRow(row)}
              >
                <TableCell className="font-medium tabular-nums">
                  <Link
                    to={getProductEditHref(row, role)}
                    className="text-primary underline-offset-4 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {index + 1}
                  </Link>
                </TableCell>
                <TableCell className="font-medium">{formatEstablishmentProductName(row)}</TableCell>
                <TableCell className="text-muted-foreground">{row.unitType}</TableCell>
                <TableCell>
                  <ProductPills
                    items={getBrandNames(row)}
                    variant="brand"
                    moreLabel={(n) => t("modules.product.list.moreCount", { count: n })}
                  />
                </TableCell>
                <TableCell>
                  <ProductPills
                    items={getEstablishmentSegmentLabels(row)}
                    variant="segment"
                    moreLabel={(n) => t("modules.product.list.moreCount", { count: n })}
                  />
                </TableCell>
                {showEstablishmentColumn ? (
                  <TableCell className="text-muted-foreground">{row.establishment?.name}</TableCell>
                ) : null}
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="relative size-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openRow(row)}
                          aria-label={t("modules.product.list.actions.edit")}
                        >
                          <Pencil className="size-4" aria-hidden />
                          {hasDraft?.(rowEntityId(row)) ? (
                            <span className="absolute right-1 top-1 size-1.5 rounded-full bg-primary" />
                          ) : null}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {hasDraft?.(rowEntityId(row))
                          ? t("modules.product.list.actions.editDraft")
                          : t("modules.product.list.actions.edit")}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))
          )}
          {hasNextPage ? (
            <TableRow ref={sentinelRef}>
              <TableCell colSpan={colSpan} className="h-12 text-center text-sm text-muted-foreground">
                {isFetchingNextPage ? t("modules.product.list.loadingMore") : null}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
