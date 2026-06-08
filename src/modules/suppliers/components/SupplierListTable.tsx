import { ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react";
import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  formatSupplierMoney,
  formatSupplierPhone,
} from "@/modules/suppliers/lib/supplier-list-display";
import {
  getSupplierRowHref,
  saveSupplierListScroll,
} from "@/modules/suppliers/lib/supplier-list-navigation";
import type { SupplierListItem, SupplierSortField } from "@/modules/suppliers/types/supplier-list";
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

interface SupplierListTableProps {
  role: ApiUserRole;
  rows: SupplierListItem[];
  sort: string;
  order: string;
  onToggleSort: (field: SupplierSortField) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onDelete?: (row: SupplierListItem) => void;
}

export function SupplierListTable({
  role,
  rows,
  sort,
  order,
  onToggleSort,
  scrollRef,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onDelete,
}: SupplierListTableProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const sentinelRef = useRef<HTMLTableRowElement>(null);
  const isAdmin = role === "admin";
  const colSpan = isAdmin ? 8 : 6;

  useInfiniteScrollSentinel(sentinelRef, {
    enabled: hasNextPage && !isFetchingNextPage,
    onLoadMore,
    scrollRef,
  });

  const openRow = (row: SupplierListItem) => {
    if (scrollRef.current) saveSupplierListScroll(scrollRef.current.scrollTop);
    navigate(getSupplierRowHref(row, role));
  };

  const sortButton = (field: SupplierSortField, label: string) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 gap-1 font-medium"
      onClick={() => onToggleSort(field)}
    >
      {label}
      <ArrowUpDown
        className={cn(
          "size-3.5",
          sort === field ? "text-foreground" : "text-muted-foreground",
        )}
      />
    </Button>
  );

  return (
    <div
      ref={scrollRef}
      className="max-h-[calc(100vh-16rem)] overflow-auto rounded-lg border border-border bg-card"
    >
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow>
            <TableHead className="w-16">{t("modules.suppliers.list.table.index")}</TableHead>
            <TableHead>{sortButton("name", t("modules.suppliers.list.table.company"))}</TableHead>
            <TableHead>
              {sortButton("responsible", t("modules.suppliers.list.table.representative"))}
            </TableHead>
            <TableHead>{t("modules.suppliers.list.table.minimumOrder")}</TableHead>
            <TableHead>{t("modules.suppliers.list.table.phone")}</TableHead>
            {isAdmin ? (
              <>
                <TableHead>{t("modules.suppliers.list.table.email")}</TableHead>
                <TableHead>
                  {sortButton("establishment_count", t("modules.suppliers.list.table.establishments"))}
                </TableHead>
              </>
            ) : null}
            <TableHead className="w-[100px] text-right">
              <span className="sr-only">{t("modules.suppliers.list.table.actions")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="h-24 text-center text-muted-foreground">
                {t("modules.suppliers.list.empty")}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow key={row.id} className="cursor-pointer" onClick={() => openRow(row)}>
                <TableCell className="font-medium tabular-nums">
                  <Link
                    to={getSupplierRowHref(row, role)}
                    className="text-primary underline-offset-4 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {index + 1}
                  </Link>
                </TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.responsibleName}</TableCell>
                <TableCell className="tabular-nums">
                  {formatSupplierMoney(row.minimumOrderValue)}
                </TableCell>
                <TableCell>{formatSupplierPhone(row.phone)}</TableCell>
                {isAdmin ? (
                  <>
                    <TableCell className="lowercase">{row.responsibleEmail}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/estabelecimentos?supplierId=${row.id}`}
                        className="font-medium tabular-nums text-primary underline-offset-4 hover:underline"
                      >
                        {row.establishmentCount}
                      </Link>
                    </TableCell>
                  </>
                ) : null}
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <TooltipProvider delayDuration={300}>
                    <div className="flex items-center justify-end gap-0.5">
                      {isAdmin ? (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-foreground"
                                onClick={() => openRow(row)}
                                aria-label={t("modules.suppliers.list.actions.edit")}
                              >
                                <Pencil className="size-4" aria-hidden />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {t("modules.suppliers.list.actions.edit")}
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
                                  aria-label={t("modules.suppliers.list.actions.delete")}
                                >
                                  <Trash2 className="size-4" aria-hidden />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t("modules.suppliers.list.actions.delete")}
                              </TooltipContent>
                            </Tooltip>
                          ) : null}
                        </>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-foreground"
                              onClick={() => openRow(row)}
                              aria-label={t("modules.suppliers.list.actions.view")}
                            >
                              <Eye className="size-4" aria-hidden />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t("modules.suppliers.list.actions.view")}</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))
          )}
          {hasNextPage ? (
            <TableRow ref={sentinelRef}>
              <TableCell colSpan={colSpan} className="h-12 text-center text-sm text-muted-foreground">
                {isFetchingNextPage ? t("modules.suppliers.list.loadingMore") : null}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
