import { Plus } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteBudget } from "@/modules/buyer/quotation/api/budgets-api";
import { BudgetListFilters } from "@/modules/buyer/quotation/components/BudgetListFilters";
import { BudgetListMobileCards } from "@/modules/buyer/quotation/components/BudgetListMobileCards";
import { BudgetListSkeleton } from "@/modules/buyer/quotation/components/BudgetListSkeleton";
import { BudgetListTable } from "@/modules/buyer/quotation/components/BudgetListTable";
import {
  budgetsQueryKey,
  useBudgetsInfiniteQuery,
} from "@/modules/buyer/quotation/hooks/useBudgetsInfiniteQuery";
import { useMyEstablishments } from "@/modules/buyer/quotation/hooks/useCreateBudgetApis";
import {
  budgetListFilterParsers,
  budgetListFilterUrlKeys,
  clearBudgetListFilters,
  countActiveBudgetFilters,
  toBudgetFetchParams,
} from "@/modules/buyer/quotation/lib/budget-list-filters";
import { restoreBudgetListScroll } from "@/modules/buyer/quotation/lib/budget-list-navigation";
import type { BudgetListItem } from "@/modules/buyer/quotation/types/budget";
import { useApiUserRole } from "@/shared/auth/use-api-user";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { useIsMobile } from "@/shared/hooks/useIsMobile";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/sonner";

export function QuotationsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const role = useApiUserRole();
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useQueryStates(budgetListFilterParsers, {
    urlKeys: budgetListFilterUrlKeys,
  });
  const fetchParams = useMemo(() => toBudgetFetchParams(query), [query]);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBudgetsInfiniteQuery(fetchParams);

  const rows = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  const { data: establishments = [] } = useMyEstablishments();
  const showEstablishmentFilter = role === "admin" && establishments.length > 0;
  const activeFilterCount = countActiveBudgetFilters(query, {
    includeEstablishment: showEstablishmentFilter,
  });

  useEffect(() => {
    if (isError) {
      toast.error(t("modules.quotation.quotations.toast.loadError"));
    }
  }, [isError, t]);

  useLayoutEffect(() => {
    restoreBudgetListScroll(scrollRef.current);
  }, []);

  // Estabelecimento com uma org: escopo vem do backend; não gravar establishmentId na URL.
  useEffect(() => {
    if (role !== "establishment" || query.establishmentId === "") return;
    void setQuery({ establishmentId: null });
  }, [role, query.establishmentId, setQuery]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBudget(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: budgetsQueryKey(fetchParams) });
      const previous = queryClient.getQueryData(budgetsQueryKey(fetchParams));
      queryClient.setQueryData(budgetsQueryKey(fetchParams), (old: typeof data) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.filter((item) => item.id !== id),
            total: Math.max(0, page.total - 1),
          })),
        };
      });
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(budgetsQueryKey(fetchParams), context.previous);
      }
      toast.error(t("modules.quotation.quotations.toast.deleteError"));
    },
    onSuccess: () => {
      toast.success(t("modules.quotation.quotations.toast.deleted"));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });

  const handleDuplicate = (row: BudgetListItem) => {
    navigate(`/quotations/new?duplicate=${encodeURIComponent(row.id)}`);
  };

  const handleDelete = (row: BudgetListItem) => {
    deleteMutation.mutate(row.id);
  };

  const handleApplyFilters = (draft: { status: string; establishmentId: string }) => {
    void setQuery({
      status: draft.status || null,
      establishmentId:
        showEstablishmentFilter && draft.establishmentId ? draft.establishmentId : null,
    });
  };

  const handleClearFilters = () => {
    const cleared = clearBudgetListFilters();
    void setQuery({
      status: cleared.status || null,
      establishmentId: cleared.establishmentId || null,
    });
  };

  const canCreateBudget = role === "admin" || role === "establishment";

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.quotation.quotations.pageTitle")}
      subtitle={t("modules.quotation.quotations.pageSubtitle")}
      headerActions={
        canCreateBudget ? (
          <Button asChild className="gap-2 text-white">
            <Link to="/quotations/new">
              <Plus className="size-4" />
              {t("modules.quotation.quotations.addButton")}
            </Link>
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <BudgetListFilters
            applied={{
              status: query.status,
              establishmentId: showEstablishmentFilter ? query.establishmentId : "",
            }}
            establishments={establishments}
            showEstablishmentFilter={showEstablishmentFilter}
            activeCount={activeFilterCount}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />
        </div>

        {isLoading ? (
          <BudgetListSkeleton />
        ) : isMobile ? (
          <BudgetListMobileCards
            rows={rows}
            scrollRef={scrollRef}
            hasNextPage={Boolean(hasNextPage)}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => void fetchNextPage()}
          />
        ) : (
          <BudgetListTable
            rows={rows}
            scrollRef={scrollRef}
            hasNextPage={Boolean(hasNextPage)}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => void fetchNextPage()}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        )}
      </div>
    </DashboardPageLayout>
  );
}
