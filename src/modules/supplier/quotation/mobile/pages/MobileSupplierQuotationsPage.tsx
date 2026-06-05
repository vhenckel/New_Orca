import { useQueryStates } from "nuqs";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";

import { OpenQuotationListFilters } from "@/modules/supplier/quotation/components/OpenQuotationListFilters";
import { OpenQuotationListMobileCards } from "@/modules/supplier/quotation/components/OpenQuotationListMobileCards";
import { OpenQuotationListSkeleton } from "@/modules/supplier/quotation/components/OpenQuotationListSkeleton";
import { useOpenQuotationsInfiniteQuery } from "@/modules/supplier/quotation/hooks/useOpenQuotationsInfiniteQuery";
import {
  countActiveOpenQuotationFilters,
  openQuotationListFilterParsers,
  openQuotationListFilterUrlKeys,
  toOpenQuotationFetchParams,
} from "@/modules/supplier/quotation/lib/open-quotation-list-filters";
import {
  getMobileSupplierQuotationRowHref,
  restoreSupplierQuotationListScroll,
} from "@/modules/supplier/quotation/lib/open-quotation-navigation";
import { useI18n } from "@/shared/i18n/useI18n";
import { toast } from "@/shared/ui/sonner";

export function MobileSupplierQuotationsPage() {
  const { t } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-xl font-semibold">
          {t("modules.supplierPortal.quotation.list.pageTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("modules.supplierPortal.quotation.list.pageSubtitle")}
        </p>
      </div>

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
      ) : (
        <OpenQuotationListMobileCards
          rows={rows}
          scrollRef={scrollRef}
          hasNextPage={hasNextPage ?? false}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={() => void fetchNextPage()}
          buildRowHref={getMobileSupplierQuotationRowHref}
        />
      )}
    </div>
  );
}
