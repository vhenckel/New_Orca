import { Pencil, PencilLine } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  getSupplierQuotationRowHref,
  saveSupplierQuotationListScroll,
} from "@/modules/supplier/quotation/lib/open-quotation-navigation";
import { hasDraft } from "@/modules/supplier/quotation/lib/supplier-quotation-autostore";
import type { OpenQuotationListItem } from "@/modules/supplier/quotation/types/open-quotation";
import { useInfiniteScrollSentinel } from "@/shared/hooks/useInfiniteScrollSentinel";
import { formatDateTimePtBr } from "@/shared/lib/format-datetime";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

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
            <div>
              <p className="text-xs text-muted-foreground">#{index + 1}</p>
              <p className="font-medium">{row.name}</p>
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
            <Button type="button" size="sm" className="w-full gap-2">
              {hasDraft(row.id) ? (
                <PencilLine className="size-4" />
              ) : (
                <Pencil className="size-4" />
              )}
              {row.status === "sent"
                ? t("modules.supplierPortal.quotation.list.actions.edit")
                : t("modules.supplierPortal.quotation.list.actions.respond")}
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
