import { Layers2, Pencil, Trash2 } from "lucide-react";
import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  formatBudgetResponses,
  formatBudgetTotal,
} from "@/modules/buyer/quotation/lib/budget-list-display";
import {
  canDeleteBudget,
  getBudgetRowHref,
  saveBudgetListScroll,
} from "@/modules/buyer/quotation/lib/budget-list-navigation";
import type { BudgetListItem } from "@/modules/buyer/quotation/types/budget";
import { useInfiniteScrollSentinel } from "@/shared/hooks/useInfiniteScrollSentinel";
import { formatDateTimePtBr } from "@/shared/lib/format-datetime";
import { INFO_BADGE, SUCCESS_BADGE } from "@/shared/lib/status-tones";
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

const BASE_TABLE_COL_SPAN = 7;

function statusBadgeClass(status: BudgetListItem["status"]) {
  if (status === "saved") return "border-border bg-muted text-muted-foreground";
  if (status === "open") return INFO_BADGE;
  return SUCCESS_BADGE;
}

interface BudgetListTableProps {
  rows: BudgetListItem[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  showEstablishment?: boolean;
  onLoadMore: () => void;
  onDuplicate: (row: BudgetListItem) => void;
  onDelete: (row: BudgetListItem) => void;
}

export function BudgetListTable({
  rows,
  scrollRef,
  hasNextPage,
  isFetchingNextPage,
  showEstablishment = false,
  onLoadMore,
  onDuplicate,
  onDelete,
}: BudgetListTableProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const sentinelRef = useRef<HTMLTableRowElement>(null);
  const tableColSpan = showEstablishment ? BASE_TABLE_COL_SPAN + 1 : BASE_TABLE_COL_SPAN;

  useInfiniteScrollSentinel(sentinelRef, {
    enabled: hasNextPage && !isFetchingNextPage,
    onLoadMore,
    scrollRef,
  });

  const openRow = (row: BudgetListItem) => {
    if (scrollRef.current) saveBudgetListScroll(scrollRef.current.scrollTop);
    navigate(getBudgetRowHref(row));
  };

  return (
    <div ref={scrollRef} className="max-h-[calc(100vh-16rem)] overflow-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow>
            <TableHead className="w-16">{t("modules.quotation.quotations.table.index")}</TableHead>
            {showEstablishment ? (
              <TableHead className="hidden sm:table-cell">
                {t("modules.quotation.quotations.table.establishment")}
              </TableHead>
            ) : null}
            <TableHead className="hidden md:table-cell">
              {t("modules.quotation.quotations.table.createdAt")}
            </TableHead>
            <TableHead className="hidden lg:table-cell">
              {t("modules.quotation.quotations.table.deadline")}
            </TableHead>
            <TableHead>{t("modules.quotation.quotations.table.status")}</TableHead>
            <TableHead className="hidden xl:table-cell">
              {t("modules.quotation.quotations.table.responses")}
            </TableHead>
            <TableHead className="text-right">
              {t("modules.quotation.quotations.table.total")}
            </TableHead>
            <TableHead className="w-[120px] text-right">
              <span className="sr-only">{t("modules.quotation.quotations.table.actions")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={tableColSpan} className="h-24 text-center text-muted-foreground">
                {t("modules.quotation.quotations.emptyResults")}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow key={row.id} className="cursor-pointer" onClick={() => openRow(row)}>
                <TableCell className="font-medium tabular-nums">
                  <Link
                    to={getBudgetRowHref(row)}
                    className="text-primary underline-offset-4 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {index + 1}
                  </Link>
                </TableCell>
                {showEstablishment ? (
                  <TableCell className="hidden sm:table-cell">{row.establishment.name}</TableCell>
                ) : null}
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {formatDateTimePtBr(row.createdAt)}
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {formatDateTimePtBr(row.deadline)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusBadgeClass(row.status)}>
                    {t(`modules.quotation.quotations.status.${row.status}`)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  {formatBudgetResponses(row)}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatBudgetTotal(row)}
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
                            className="size-8 text-muted-foreground hover:text-foreground"
                            onClick={() => openRow(row)}
                            aria-label={t("modules.quotation.quotations.actions.edit")}
                          >
                            <Pencil className="size-4" aria-hidden />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("modules.quotation.quotations.actions.edit")}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-foreground"
                            onClick={() => onDuplicate(row)}
                            aria-label={t("modules.quotation.quotations.actions.duplicate")}
                          >
                            <Layers2 className="size-4" aria-hidden />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("modules.quotation.quotations.actions.duplicate")}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "size-8",
                                canDeleteBudget(row)
                                  ? "text-muted-foreground hover:text-destructive"
                                  : "text-muted-foreground/40",
                              )}
                              disabled={!canDeleteBudget(row)}
                              onClick={() => onDelete(row)}
                              aria-label={t("modules.quotation.quotations.actions.delete")}
                            >
                              <Trash2 className="size-4" aria-hidden />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {canDeleteBudget(row)
                            ? t("modules.quotation.quotations.actions.delete")
                            : t("modules.quotation.quotations.actions.deleteDisabled")}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))
          )}
          {hasNextPage ? (
            <TableRow ref={sentinelRef}>
              <TableCell colSpan={tableColSpan} className="h-12 text-center text-sm text-muted-foreground">
                {isFetchingNextPage ? t("modules.quotation.quotations.loadingMore") : null}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
