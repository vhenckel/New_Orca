import { Copy } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { OpenQuotationListFilters } from "@/modules/supplier/quotation/components/OpenQuotationListFilters";
import { OpenQuotationListMobileCards } from "@/modules/supplier/quotation/components/OpenQuotationListMobileCards";
import { OpenQuotationListSkeleton } from "@/modules/supplier/quotation/components/OpenQuotationListSkeleton";
import { OpenQuotationListTable } from "@/modules/supplier/quotation/components/OpenQuotationListTable";
import { copyQuotationsTsv } from "@/modules/supplier/quotation/api/open-quotations-api";
import { useOpenQuotationsInfiniteQuery } from "@/modules/supplier/quotation/hooks/useOpenQuotationsInfiniteQuery";
import {
  countActiveOpenQuotationFilters,
  openQuotationListFilterParsers,
  openQuotationListFilterUrlKeys,
  toOpenQuotationFetchParams,
} from "@/modules/supplier/quotation/lib/open-quotation-list-filters";
import { restoreSupplierQuotationListScroll } from "@/modules/supplier/quotation/lib/open-quotation-navigation";
import type { OpenQuotationSortField } from "@/modules/supplier/quotation/types/open-quotation";
import { useApiUserRole } from "@/shared/auth/use-api-user";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { useIsMobile } from "@/shared/hooks/useIsMobile";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/sonner";

export function SupplierQuotationsPage() {
  const { t } = useI18n();
  const role = useApiUserRole();
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copying, setCopying] = useState(false);
  const isAdmin = role === "admin";

  const [query, setQuery] = useQueryStates(openQuotationListFilterParsers, {
    urlKeys: openQuotationListFilterUrlKeys,
  });
  const fetchParams = useMemo(() => toOpenQuotationFetchParams(query), [query]);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useOpenQuotationsInfiniteQuery(fetchParams);

  const rows = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  const activeFilterCount = countActiveOpenQuotationFilters(query);

  useEffect(() => {
    if (isError) {
      toast.error(t("modules.supplierPortal.quotation.list.toast.loadError"));
    }
  }, [isError, t]);

  useLayoutEffect(() => {
    restoreSupplierQuotationListScroll(scrollRef.current);
  }, []);

  const handleCopy = async () => {
    setCopying(true);
    try {
      const tsv = await copyQuotationsTsv(fetchParams);
      await navigator.clipboard.writeText(tsv);
      toast.success(t("modules.supplierPortal.quotation.list.toast.copySuccess"));
    } catch {
      toast.error(t("modules.supplierPortal.quotation.list.toast.copyError"));
    } finally {
      setCopying(false);
    }
  };

  const handleSort = useCallback(
    (field: OpenQuotationSortField) => {
      const nextOrder =
        query.sort === field && query.order === "ASC" ? "DESC" : "ASC";
      void setQuery({ sort: field, order: nextOrder });
    },
    [query.sort, query.order, setQuery],
  );

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.supplierPortal.quotation.list.pageTitle")}
      subtitle={t("modules.supplierPortal.quotation.list.pageSubtitle")}
      headerActions={
        isAdmin ? (
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            disabled={copying}
            onClick={() => void handleCopy()}
          >
            <Copy className="size-4" />
            {t("modules.supplierPortal.quotation.list.copy")}
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <OpenQuotationListFilters
            appliedStatus={query.status}
            activeCount={activeFilterCount}
            onApply={(status) => void setQuery({ status: status || null })}
            onClear={() => void setQuery({ status: null, sort: null, order: null })}
          />
        </div>

        {isLoading ? (
          <OpenQuotationListSkeleton />
        ) : isMobile ? (
          <OpenQuotationListMobileCards
            rows={rows}
            scrollRef={scrollRef}
            hasNextPage={Boolean(hasNextPage)}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => void fetchNextPage()}
          />
        ) : (
          <OpenQuotationListTable
            rows={rows}
            sort={query.sort}
            order={query.order}
            scrollRef={scrollRef}
            hasNextPage={Boolean(hasNextPage)}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => void fetchNextPage()}
            onSort={handleSort}
          />
        )}
      </div>
    </DashboardPageLayout>
  );
}
