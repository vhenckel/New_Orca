import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpDown, Pencil } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import type { SolicitationListItem, SolicitationSortField } from "@/modules/product/types/pending-product";
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

interface PendingProductListTableProps {
  rows: SolicitationListItem[];
  sort: string;
  order: string;
  onToggleSort: (field: SolicitationSortField) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

function statusVariant(status: string): "default" | "secondary" | "destructive" {
  if (status === "pending") return "secondary";
  if (status === "rejected") return "destructive";
  return "default";
}

export function PendingProductListTable({
  rows,
  sort,
  order,
  onToggleSort,
  scrollRef,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: PendingProductListTableProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const sentinelRef = useRef<HTMLTableRowElement>(null);
  const colSpan = 7;

  useInfiniteScrollSentinel(sentinelRef, {
    enabled: hasNextPage && !isFetchingNextPage,
    onLoadMore,
    scrollRef,
  });

  const openRow = (row: SolicitationListItem) => {
    navigate(`/products/pending/${row.id}/edit`);
  };

  const getStatusLabel = (status: string) => {
    if (status === "pending") return t("modules.product.pending.status.pending");
    if (status === "rejected") return t("modules.product.pending.status.rejected");
    return t("modules.product.pending.status.approved");
  };

  const sortButton = (field: SolicitationSortField, label: string, className?: string) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("-ml-3 h-8 gap-1 font-medium", className)}
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
            <TableHead className="w-16">{t("modules.product.pending.list.table.index")}</TableHead>
            <TableHead>{sortButton("name", t("modules.product.pending.list.table.name"))}</TableHead>
            <TableHead className="text-center">
              {t("modules.product.pending.list.table.establishment")}
            </TableHead>
            <TableHead className="text-center">
              {sortButton("type", t("modules.product.pending.list.table.type"), "mx-auto")}
            </TableHead>
            <TableHead className="text-center">
              {sortButton("status", t("modules.product.pending.list.table.status"), "mx-auto")}
            </TableHead>
            <TableHead className="text-center">
              {sortButton(
                "createdAt",
                t("modules.product.pending.list.table.createdAt"),
                "mx-auto",
              )}
            </TableHead>
            <TableHead className="w-[80px] text-right">
              <span className="sr-only">{t("modules.product.list.table.actions")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="h-24 text-center text-muted-foreground">
                {t("modules.product.pending.list.empty")}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow key={row.id} className="cursor-pointer" onClick={() => openRow(row)}>
                <TableCell className="font-medium tabular-nums">{index + 1}</TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {row.establishment?.name}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">
                    {row.type === "product_creation"
                      ? t("modules.product.pending.type.product")
                      : t("modules.product.pending.type.brand")}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={statusVariant(row.status)}>
                    {getStatusLabel(row.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {format(new Date(row.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openRow(row)}
                          aria-label={t("modules.product.pending.list.actions.edit")}
                        >
                          <Pencil className="size-4" aria-hidden />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {t("modules.product.pending.list.actions.edit")}
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
