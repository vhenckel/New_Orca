import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  formatBudgetResponses,
  formatBudgetTotal,
} from "@/modules/buyer/quotation/lib/budget-list-display";
import {
  getBudgetRowHref,
  saveBudgetListScroll,
} from "@/modules/buyer/quotation/lib/budget-list-navigation";
import type { BudgetListItem } from "@/modules/buyer/quotation/types/budget";
import { useInfiniteScrollSentinel } from "@/shared/hooks/useInfiniteScrollSentinel";
import { formatDateTimePtBr } from "@/shared/lib/format-datetime";
import { INFO_BADGE, SUCCESS_BADGE } from "@/shared/lib/status-tones";
import { useI18n } from "@/shared/i18n/useI18n";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";

function statusBadgeClass(status: BudgetListItem["status"]) {
  if (status === "saved") return "border-border bg-muted text-muted-foreground";
  if (status === "open") return INFO_BADGE;
  return SUCCESS_BADGE;
}

interface BudgetListMobileCardsProps {
  rows: BudgetListItem[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

export function BudgetListMobileCards({
  rows,
  scrollRef,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: BudgetListMobileCardsProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useInfiniteScrollSentinel(sentinelRef, {
    enabled: hasNextPage && !isFetchingNextPage,
    onLoadMore,
    scrollRef,
  });

  const openRow = (row: BudgetListItem) => {
    if (scrollRef.current) saveBudgetListScroll(scrollRef.current.scrollTop);
    navigate(getBudgetRowHref(row));
  };

  if (rows.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        {t("modules.quotation.quotations.emptyResults")}
      </p>
    );
  }

  return (
    <div ref={scrollRef} className="flex max-h-[calc(100vh-14rem)] flex-col gap-3 overflow-auto">
      {rows.map((row, index) => (
        <Card
          key={row.id}
          className="cursor-pointer transition-colors hover:bg-muted/30"
          onClick={() => openRow(row)}
        >
          <CardContent className="flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <Link
                to={getBudgetRowHref(row)}
                className="font-medium tabular-nums text-primary underline-offset-4 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {index + 1}
              </Link>
              <Badge variant="outline" className={statusBadgeClass(row.status)}>
                {t(`modules.quotation.quotations.status.${row.status}`)}
              </Badge>
            </div>
            <div className="grid gap-1 text-sm text-muted-foreground">
              <p>
                {t("modules.quotation.quotations.table.createdAt")}: {formatDateTimePtBr(row.createdAt)}
              </p>
              <p>
                {t("modules.quotation.quotations.table.deadline")}: {formatDateTimePtBr(row.deadline)}
              </p>
              <p>
                {t("modules.quotation.quotations.table.responses")}: {formatBudgetResponses(row)}
              </p>
              <p className="font-semibold text-foreground">
                {t("modules.quotation.quotations.table.total")}: {formatBudgetTotal(row)}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
      {hasNextPage ? (
        <div ref={sentinelRef} className="py-3 text-center text-sm text-muted-foreground">
          {isFetchingNextPage ? t("modules.quotation.quotations.loadingMore") : null}
        </div>
      ) : null}
    </div>
  );
}
