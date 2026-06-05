import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  getSupplierQuotationRowHref,
  saveSupplierQuotationListScroll,
} from "@/modules/supplier/quotation/lib/open-quotation-navigation";
import type { OpenQuotationListItem } from "@/modules/supplier/quotation/types/open-quotation";
import { useInfiniteScrollSentinel } from "@/shared/hooks/useInfiniteScrollSentinel";
import { formatDateTimePtBr } from "@/shared/lib/format-datetime";
import { INFO_BADGE, SUCCESS_BADGE, WARNING_BADGE } from "@/shared/lib/status-tones";
import { useI18n } from "@/shared/i18n/useI18n";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

function statusBadgeClass(status: OpenQuotationListItem["status"]) {
  if (status === "open") return INFO_BADGE;
  if (status === "sent") return SUCCESS_BADGE;
  return WARNING_BADGE;
}

interface OpenQuotationListMobileCardsProps {
  rows: OpenQuotationListItem[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  buildRowHref?: (quotationId: string) => string;
}

export function OpenQuotationListMobileCards({
  rows,
  scrollRef,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  buildRowHref = getSupplierQuotationRowHref,
}: OpenQuotationListMobileCardsProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useInfiniteScrollSentinel(sentinelRef, {
    enabled: hasNextPage && !isFetchingNextPage,
    onLoadMore,
    scrollRef,
  });

  const openRow = (row: OpenQuotationListItem) => {
    if (scrollRef.current) saveSupplierQuotationListScroll(scrollRef.current.scrollTop);
    navigate(buildRowHref(row.id));
  };

  if (rows.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        {t("modules.supplierPortal.quotation.list.emptyResults")}
      </p>
    );
  }

  return (
    <div ref={scrollRef} className="flex max-h-[calc(100vh-14rem)] flex-col gap-3 overflow-auto">
      {rows.map((row, index) => (
        <Card
          key={row.id}
          className="cursor-pointer"
          onClick={() => openRow(row)}
        >
          <CardContent className="flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">#{index + 1}</p>
                <p className="font-medium">{row.name}</p>
              </div>
              <Badge variant="outline" className={statusBadgeClass(row.status)}>
                {t(`modules.supplierPortal.quotation.list.status.${row.status}`)}
              </Badge>
            </div>
            <div className="grid gap-1 text-sm text-muted-foreground">
              <p>
                {t("modules.supplierPortal.quotation.list.table.deadline")}:{" "}
                {formatDateTimePtBr(row.deadline)}
              </p>
              <p>
                {t("modules.supplierPortal.quotation.list.table.deliveryTime")}:{" "}
                {row.estimatedDeliveryTime || "—"}
              </p>
              {row.observation ? (
                <p className="line-clamp-2">
                  {t("modules.supplierPortal.quotation.list.table.observation")}: {row.observation}
                </p>
              ) : null}
            </div>
            <Button type="button" size="sm" className="w-full">
              {row.status === "open"
                ? t("modules.supplierPortal.quotation.list.actions.respond")
                : t("modules.supplierPortal.quotation.list.actions.edit")}
            </Button>
          </CardContent>
        </Card>
      ))}
      {hasNextPage ? (
        <div ref={sentinelRef} className="py-3 text-center text-sm text-muted-foreground">
          {isFetchingNextPage ? t("modules.supplierPortal.quotation.list.loadingMore") : null}
        </div>
      ) : null}
    </div>
  );
}
