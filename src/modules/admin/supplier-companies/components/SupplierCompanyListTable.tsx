import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import type { SupplierCompanyListItem, SupplierCompanySortField } from "@/modules/admin/supplier-companies/types";
import { formatSupplierMoney } from "@/modules/suppliers/lib/supplier-list-display";
import { useInfiniteScrollSentinel } from "@/shared/hooks/useInfiniteScrollSentinel";
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

interface SupplierCompanyListTableProps {
  rows: SupplierCompanyListItem[];
  sort: string;
  onToggleSort: (field: SupplierCompanySortField) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onDelete?: (row: SupplierCompanyListItem) => void;
}

export function SupplierCompanyListTable({
  rows,
  sort,
  onToggleSort,
  scrollRef,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onDelete,
}: SupplierCompanyListTableProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const sentinelRef = useRef<HTMLTableRowElement>(null);
  const colSpan = 5;

  useInfiniteScrollSentinel(sentinelRef, {
    enabled: hasNextPage && !isFetchingNextPage,
    onLoadMore,
    scrollRef,
  });

  return (
    <div ref={scrollRef} className="max-h-[calc(100vh-280px)] overflow-auto rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 gap-1 font-medium"
                onClick={() => onToggleSort("name")}
              >
                {t("modules.admin.supplierCompanies.table.name")}
                <ArrowUpDown className="size-3.5" />
              </Button>
            </TableHead>
            <TableHead>{t("modules.admin.supplierCompanies.table.minimumOrder")}</TableHead>
            <TableHead>{t("modules.admin.supplierCompanies.table.customization")}</TableHead>
            <TableHead>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 gap-1 font-medium"
                onClick={() => onToggleSort("supplierCount")}
              >
                {t("modules.admin.supplierCompanies.table.suppliers")}
                <ArrowUpDown className="size-3.5" />
              </Button>
            </TableHead>
            <TableHead className="w-[120px] text-right">{t("modules.admin.supplierCompanies.table.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="h-24 text-center text-muted-foreground">
                {t("modules.admin.supplierCompanies.list.empty")}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const canDelete = row.supplierCount === 0;
              return (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/supplier-companies/${row.id}/edit`)}
                >
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{formatSupplierMoney(row.minimumOrderValue)}</TableCell>
                  <TableCell>
                    {row.allowSupplierMinimumOrderCustomization
                      ? t("modules.admin.supplierCompanies.table.customizationAllowed")
                      : t("modules.admin.supplierCompanies.table.customizationBlocked")}
                  </TableCell>
                  <TableCell>{row.supplierCount}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/supplier-companies/${row.id}/edit`)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                disabled={!canDelete}
                                onClick={() => onDelete?.(row)}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {!canDelete ? (
                            <TooltipContent>
                              {t("modules.admin.supplierCompanies.list.deleteDisabled")}
                            </TooltipContent>
                          ) : null}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
          {hasNextPage ? (
            <TableRow ref={sentinelRef}>
              <TableCell colSpan={colSpan} className="h-12 text-center text-sm text-muted-foreground">
                {isFetchingNextPage ? "…" : null}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
