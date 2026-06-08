import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  formatEstablishmentAddress,
  formatEstablishmentPhone,
} from "@/modules/admin/establishments/lib/establishment-list-display";
import type { EstablishmentListItem, EstablishmentSortField } from "@/modules/admin/establishments/types";
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

interface EstablishmentListTableProps {
  rows: EstablishmentListItem[];
  sort: string;
  order: string;
  onToggleSort: (field: EstablishmentSortField) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onDelete?: (row: EstablishmentListItem) => void;
}

export function EstablishmentListTable({
  rows,
  sort,
  order,
  onToggleSort,
  scrollRef,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onDelete,
}: EstablishmentListTableProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const sentinelRef = useRef<HTMLTableRowElement>(null);
  const colSpan = 8;

  useInfiniteScrollSentinel(sentinelRef, {
    enabled: hasNextPage && !isFetchingNextPage,
    onLoadMore,
    scrollRef,
  });

  const openRow = (row: EstablishmentListItem) => {
    navigate(`/estabelecimentos/editar-estabelecimento/${row.id}`);
  };

  const sortButton = (field: EstablishmentSortField, label: string) => (
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

  return (
    <div
      ref={scrollRef}
      className="max-h-[calc(100vh-16rem)] overflow-auto rounded-lg border border-border bg-card"
    >
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow>
            <TableHead className="w-16">{t("modules.admin.establishments.list.table.index")}</TableHead>
            <TableHead>
              {sortButton("name", t("modules.admin.establishments.list.table.name"))}
            </TableHead>
            <TableHead>{t("modules.admin.establishments.list.table.responsible")}</TableHead>
            <TableHead>{t("modules.admin.establishments.list.table.phone")}</TableHead>
            <TableHead>{t("modules.admin.establishments.list.table.address")}</TableHead>
            <TableHead>{t("modules.admin.establishments.list.table.paymentStatus")}</TableHead>
            <TableHead>{t("modules.admin.establishments.list.table.active")}</TableHead>
            <TableHead className="w-[100px] text-right">
              <span className="sr-only">{t("modules.admin.establishments.list.table.actions")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="h-24 text-center text-muted-foreground">
                {t("modules.admin.establishments.list.empty")}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow key={row.id} className="cursor-pointer" onClick={() => openRow(row)}>
                <TableCell className="font-medium tabular-nums">{index + 1}</TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.responsibleName}</TableCell>
                <TableCell>{formatEstablishmentPhone(row.phone)}</TableCell>
                <TableCell>{formatEstablishmentAddress(row.address)}</TableCell>
                <TableCell>{t(`modules.admin.establishments.status.${row.status}`)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      row.active
                        ? "border-success/20 bg-success/10 text-success"
                        : "border-muted bg-muted/50 text-muted-foreground"
                    }
                  >
                    {row.active
                      ? t("modules.admin.establishments.list.active.yes")
                      : t("modules.admin.establishments.list.active.no")}
                  </Badge>
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
                            aria-label={t("modules.admin.establishments.list.actions.edit")}
                          >
                            <Pencil className="size-4" aria-hidden />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("modules.admin.establishments.list.actions.edit")}</TooltipContent>
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
                              aria-label={t("modules.admin.establishments.list.actions.delete")}
                            >
                              <Trash2 className="size-4" aria-hidden />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {t("modules.admin.establishments.list.actions.delete")}
                          </TooltipContent>
                        </Tooltip>
                      ) : null}
                    </div>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))
          )}
          {hasNextPage ? (
            <TableRow ref={sentinelRef}>
              <TableCell colSpan={colSpan} className="h-12 text-center text-sm text-muted-foreground">
                {isFetchingNextPage ? t("modules.admin.establishments.list.loadingMore") : null}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
