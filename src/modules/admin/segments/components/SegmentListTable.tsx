import { ArrowUpDown, Pencil, PencilLine, Trash2 } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import { hasSegmentFormAutostore } from "@/modules/admin/segments/lib/segment-autostore";
import {
  buildApprovedProductsBySegmentUrl,
  buildPendingProductsBySegmentUrl,
  buildRejectedProductsBySegmentUrl,
  buildSuppliersBySegmentUrl,
  segmentHasLinkedEntities,
} from "@/modules/admin/segments/lib/segment-list-navigation";
import type { SegmentListItem, SegmentSortField } from "@/modules/admin/segments/types";
import { useApiUser } from "@/shared/auth/use-api-user";
import { useInfiniteScrollSentinel } from "@/shared/hooks/useInfiniteScrollSentinel";
import { cn } from "@/shared/lib/utils";
import { useI18n } from "@/shared/i18n/useI18n";
import { Badge } from "@/shared/ui/badge";
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

interface SegmentListTableProps {
  rows: SegmentListItem[];
  sort: string;
  onToggleSort: (field: SegmentSortField) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onDelete?: (row: SegmentListItem) => void;
}

export function SegmentListTable({
  rows,
  sort,
  onToggleSort,
  scrollRef,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onDelete,
}: SegmentListTableProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const apiUser = useApiUser();
  const sentinelRef = useRef<HTMLTableRowElement>(null);
  const colSpan = 6;

  useInfiniteScrollSentinel(sentinelRef, {
    enabled: hasNextPage && !isFetchingNextPage,
    onLoadMore,
    scrollRef,
  });

  const openRow = (row: SegmentListItem) => {
    navigate(`/segmentos/editar-segmento/${row.id}`, { state: row });
  };

  const sortButton = (field: SegmentSortField, label: string) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 gap-1 font-medium"
      onClick={() => onToggleSort(field)}
    >
      {label}
      <ArrowUpDown
        className={cn("size-3.5", sort === field ? "text-foreground" : "text-muted-foreground")}
      />
    </Button>
  );

  const stopNav = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <div
      ref={scrollRef}
      className="max-h-[calc(100vh-16rem)] overflow-auto rounded-lg border border-border bg-card"
    >
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow>
            <TableHead className="w-16">{t("modules.admin.segments.list.table.index")}</TableHead>
            <TableHead>{sortButton("name", t("modules.admin.segments.list.table.name"))}</TableHead>
            <TableHead className="text-center">{t("modules.admin.segments.list.table.active")}</TableHead>
            <TableHead className="text-center">
              {sortButton("supplierCount", t("modules.admin.segments.list.table.suppliers"))}
            </TableHead>
            <TableHead className="text-center">{t("modules.admin.segments.list.table.products")}</TableHead>
            <TableHead className="w-[100px] text-right">
              <span className="sr-only">{t("modules.admin.segments.list.table.actions")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="h-24 text-center text-muted-foreground">
                {t("modules.admin.segments.list.empty")}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => {
              const deleteDisabled = segmentHasLinkedEntities(row);
              const hasDraft =
                Boolean(apiUser?.id) &&
                hasSegmentFormAutostore(apiUser!.id, "edit", row.id);

              return (
                <TableRow key={row.id} className="cursor-pointer" onClick={() => openRow(row)}>
                  <TableCell className="font-medium tabular-nums">{index + 1}</TableCell>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={
                        row.active
                          ? "border-success/20 bg-success/10 text-success"
                          : "border-muted bg-muted/50 text-muted-foreground"
                      }
                    >
                      {row.active
                        ? t("modules.admin.segments.list.active.yes")
                        : t("modules.admin.segments.list.active.no")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center" onClick={stopNav}>
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 font-medium"
                      onClick={() => navigate(buildSuppliersBySegmentUrl(row.id))}
                    >
                      {row.supplierCount}
                    </Button>
                  </TableCell>
                  <TableCell className="text-center" onClick={stopNav}>
                    <div className="flex items-center justify-center gap-2 font-medium">
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-success"
                        title={t("modules.admin.segments.list.products.approved", {
                          count: row.productsActive,
                        })}
                        onClick={() => navigate(buildApprovedProductsBySegmentUrl(row.id))}
                      >
                        {row.productsActive}
                      </Button>
                      <span className="text-muted-foreground">/</span>
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-warning"
                        title={t("modules.admin.segments.list.products.pending", {
                          count: row.productsPending,
                        })}
                        onClick={() => navigate(buildPendingProductsBySegmentUrl(row.id))}
                      >
                        {row.productsPending}
                      </Button>
                      <span className="text-muted-foreground">/</span>
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-destructive"
                        title={t("modules.admin.segments.list.products.rejected", {
                          count: row.productsRejected,
                        })}
                        onClick={() => navigate(buildRejectedProductsBySegmentUrl(row.id))}
                      >
                        {row.productsRejected}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right" onClick={stopNav}>
                    <TooltipProvider delayDuration={300}>
                      <div className="flex items-center justify-end gap-0.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-foreground"
                              onClick={() => openRow(row)}
                              aria-label={t("modules.admin.segments.list.actions.edit")}
                            >
                              {hasDraft ? (
                                <PencilLine className="size-4" aria-hidden />
                              ) : (
                                <Pencil className="size-4" aria-hidden />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t("modules.admin.segments.list.actions.edit")}</TooltipContent>
                        </Tooltip>
                        {onDelete ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-muted-foreground hover:text-destructive"
                                  disabled={deleteDisabled}
                                  onClick={() => onDelete(row)}
                                  aria-label={t("modules.admin.segments.list.actions.delete")}
                                >
                                  <Trash2 className="size-4" aria-hidden />
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {deleteDisabled
                                ? t("modules.admin.segments.list.actions.deleteDisabled")
                                : t("modules.admin.segments.list.actions.delete")}
                            </TooltipContent>
                          </Tooltip>
                        ) : null}
                      </div>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              );
            })
          )}
          {hasNextPage ? (
            <TableRow ref={sentinelRef}>
              <TableCell colSpan={colSpan} className="h-12 text-center text-sm text-muted-foreground">
                {isFetchingNextPage ? t("modules.admin.segments.list.loadingMore") : null}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
