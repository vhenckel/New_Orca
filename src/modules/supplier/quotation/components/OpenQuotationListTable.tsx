import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  getSupplierQuotationRowHref,
  saveSupplierQuotationListScroll,
} from "@/modules/supplier/quotation/lib/open-quotation-navigation";
import type { OpenQuotationListItem, OpenQuotationSortField } from "@/modules/supplier/quotation/types/open-quotation";
import { useInfiniteScrollSentinel } from "@/shared/hooks/useInfiniteScrollSentinel";
import { formatDateTimePtBr } from "@/shared/lib/format-datetime";
import { INFO_BADGE, SUCCESS_BADGE, WARNING_BADGE } from "@/shared/lib/status-tones";
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

function statusBadgeClass(status: OpenQuotationListItem["status"]) {
  if (status === "open") return INFO_BADGE;
  if (status === "sent") return SUCCESS_BADGE;
  return WARNING_BADGE;
}

function SortIcon({
  field,
  sort,
  order,
}: {
  field: OpenQuotationSortField;
  sort: string;
  order: string;
}) {
  if (sort !== field) return <ArrowUpDown className="ml-1 inline size-3.5 opacity-50" />;
  if (order === "ASC") return <ArrowUp className="ml-1 inline size-3.5" />;
  return <ArrowDown className="ml-1 inline size-3.5" />;
}

function rowActionKey(status: OpenQuotationListItem["status"]) {
  return status === "open"
    ? "modules.supplierPortal.quotation.list.actions.respond"
    : "modules.supplierPortal.quotation.list.actions.edit";
}

interface OpenQuotationListTableProps {
  rows: OpenQuotationListItem[];
  sort: string;
  order: string;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onSort: (field: OpenQuotationSortField) => void;
}

export function OpenQuotationListTable({
  rows,
  sort,
  order,
  scrollRef,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onSort,
}: OpenQuotationListTableProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const sentinelRef = useRef<HTMLTableRowElement>(null);

  useInfiniteScrollSentinel(sentinelRef, {
    enabled: hasNextPage && !isFetchingNextPage,
    onLoadMore,
    scrollRef,
  });

  const openRow = (row: OpenQuotationListItem) => {
    if (scrollRef.current) saveSupplierQuotationListScroll(scrollRef.current.scrollTop);
    navigate(getSupplierQuotationRowHref(row.id));
  };

  return (
    <div ref={scrollRef} className="max-h-[calc(100vh-16rem)] overflow-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow>
            <TableHead className="w-12">{t("modules.supplierPortal.quotation.list.table.index")}</TableHead>
            <TableHead>
              <button
                type="button"
                className="inline-flex items-center font-medium hover:text-foreground"
                onClick={() => onSort("name")}
              >
                {t("modules.supplierPortal.quotation.list.table.restaurant")}
                <SortIcon field="name" sort={sort} order={order} />
              </button>
            </TableHead>
            <TableHead>
              <button
                type="button"
                className="inline-flex items-center font-medium hover:text-foreground"
                onClick={() => onSort("deadline")}
              >
                {t("modules.supplierPortal.quotation.list.table.deadline")}
                <SortIcon field="deadline" sort={sort} order={order} />
              </button>
            </TableHead>
            <TableHead>{t("modules.supplierPortal.quotation.list.table.deliveryTime")}</TableHead>
            <TableHead>{t("modules.supplierPortal.quotation.list.table.observation")}</TableHead>
            <TableHead>{t("modules.supplierPortal.quotation.list.table.sentAt")}</TableHead>
            <TableHead className="w-[120px] text-right">
              {t("modules.supplierPortal.quotation.list.table.action")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                {t("modules.supplierPortal.quotation.list.emptyResults")}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow key={row.id} className="cursor-pointer" onClick={() => openRow(row)}>
                <TableCell className="tabular-nums text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTimePtBr(row.deadline)}
                </TableCell>
                <TableCell>{row.estimatedDeliveryTime || "—"}</TableCell>
                <TableCell className="max-w-[200px] truncate">{row.observation || "—"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTimePtBr(row.sentAt) || "—"}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className={statusBadgeClass(row.status)}>
                      {t(`modules.supplierPortal.quotation.list.status.${row.status}`)}
                    </Badge>
                    <Button type="button" size="sm" variant="secondary" onClick={() => openRow(row)}>
                      {t(rowActionKey(row.status))}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
          {hasNextPage ? (
            <TableRow ref={sentinelRef}>
              <TableCell colSpan={7} className="h-12 text-center text-sm text-muted-foreground">
                {isFetchingNextPage ? t("modules.supplierPortal.quotation.list.loadingMore") : null}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
