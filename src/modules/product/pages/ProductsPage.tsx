import { Copy, Plus, Search, Upload } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { copyProductsTsv, deleteProduct } from "@/modules/product/api/products-api";
import { ProductModuleNav } from "@/modules/product/components/ProductModuleNav";
import { ProductDeleteConfirmDialog } from "@/modules/product/components/ProductDeleteConfirmDialog";
import { hasProductFormAutostore } from "@/modules/product/lib/product-autostore";
import { ProductListFilters } from "@/modules/product/components/ProductListFilters";
import { ProductListMobileCards } from "@/modules/product/components/ProductListMobileCards";
import { ProductListSkeleton } from "@/modules/product/components/ProductListSkeleton";
import { ProductListTable } from "@/modules/product/components/ProductListTable";
import { dedupeEstablishmentProducts } from "@/modules/product/lib/dedupe-establishment-products";
import {
  clearProductListFilters,
  countActiveAdminProductFilters,
  countActiveEstablishmentProductFilters,
  productListFilterParsers,
  productListFilterUrlKeys,
  toAdminProductsFetchParams,
  toEstablishmentProductsFetchParams,
} from "@/modules/product/lib/product-list-filters";
import { restoreProductListScroll } from "@/modules/product/lib/product-list-navigation";
import {
  establishmentProductsQueryKey,
  useEstablishmentProductsInfiniteQuery,
} from "@/modules/product/hooks/useEstablishmentProductsInfiniteQuery";
import { useProductListSupportQueries } from "@/modules/product/hooks/useProductListSupportQueries";
import {
  productsQueryKey,
  useProductsInfiniteQuery,
} from "@/modules/product/hooks/useProductsInfiniteQuery";
import type {
  AdminProductListItem,
  SortOrder,
} from "@/modules/product/types/product-list";
import { useApiUser, useApiUserRole } from "@/shared/auth/use-api-user";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { useIsMobile } from "@/shared/hooks/useIsMobile";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "@/shared/ui/sonner";

function toggleSort(
  currentSort: string,
  currentOrder: string,
  field: string,
): { sort: string; order: SortOrder } {
  if (currentSort !== field) return { sort: field, order: "ASC" };
  return { sort: field, order: currentOrder === "ASC" ? "DESC" : "ASC" };
}

export function ProductsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const apiUser = useApiUser();
  const role = useApiUserRole();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [copying, setCopying] = useState(false);
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAdmin = role === "admin";
  const isEstablishment = role === "establishment";

  const [query, setQuery] = useQueryStates(productListFilterParsers, {
    urlKeys: productListFilterUrlKeys,
  });

  const adminFetchParams = useMemo(() => toAdminProductsFetchParams(query), [query]);
  const establishmentFetchParams = useMemo(
    () => toEstablishmentProductsFetchParams(query),
    [query],
  );

  const adminList = useProductsInfiniteQuery(adminFetchParams, { enabled: isAdmin });
  const establishmentList = useEstablishmentProductsInfiniteQuery(establishmentFetchParams, {
    enabled: isEstablishment,
  });

  const setActiveQuery = setQuery;
  const listState = isAdmin ? adminList : establishmentList;
  const fetchParams = isAdmin ? adminFetchParams : establishmentFetchParams;
  const queryKey = isAdmin
    ? productsQueryKey(adminFetchParams)
    : establishmentProductsQueryKey(establishmentFetchParams);

  const { segments, establishments } = useProductListSupportQueries(role);

  const showEstablishmentFilter = isEstablishment && establishments.length > 1;
  const showEstablishmentColumn = showEstablishmentFilter;

  const adminRows = useMemo(
    () => adminList.data?.pages.flatMap((page) => page.data) ?? [],
    [adminList.data],
  );

  const establishmentRows = useMemo(() => {
    const flat = establishmentList.data?.pages.flatMap((page) => page.data) ?? [];
    return dedupeEstablishmentProducts(flat);
  }, [establishmentList.data]);

  const total = listState.data?.pages[0]?.total ?? 0;

  const activeFilterCount = isAdmin
    ? countActiveAdminProductFilters(query)
    : countActiveEstablishmentProductFilters(query, {
        includeEstablishment: showEstablishmentFilter,
      });

  useEffect(() => {
    if (listState.isError) {
      toast.error(t("modules.product.list.toast.loadError"));
    }
  }, [listState.isError, t]);

  useLayoutEffect(() => {
    restoreProductListScroll(scrollRef.current);
  }, []);

  useEffect(() => {
    if (!isEstablishment || query.establishmentId === "") return;
    if (establishments.length <= 1) {
      void setQuery({ establishmentId: null });
    }
  }, [isEstablishment, query.establishmentId, establishments.length, setQuery]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: typeof adminList.data) => {
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
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error(t("modules.product.list.toast.deleteError"));
    },
    onSuccess: () => {
      toast.success(t("modules.product.list.toast.deleteSuccess"));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["products", "list"] });
    },
  });

  const handleDeleteRequest = (row: AdminProductListItem) => {
    setDeleteTarget({ id: row.id, name: row.name });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSettled: () => setDeleteTarget(null),
    });
  };

  const hasDraft = (entityId: string) =>
    apiUser?.id
      ? hasProductFormAutostore(apiUser.id, "edit", entityId)
      : false;

  const handleNameSearch = (value: string) => {
    void setActiveQuery({ name: value || null });
  };

  const handleToggleNameSort = () => {
    const next = toggleSort(query.sort, query.order, "name");
    void setActiveQuery({ sort: next.sort, order: next.order });
  };

  const handleToggleEstablishmentSort = () => {
    const next = toggleSort(query.sort, query.order, "establishmentId");
    void setActiveQuery({ sort: next.sort, order: next.order });
  };

  const handleClearFilters = () => {
    if (isAdmin) {
      const cleared = clearProductListFilters();
      void setQuery({
        brand: cleared.brand || null,
        weight: cleared.weight || null,
        segmentId: cleared.segmentId || null,
      });
    } else {
      const cleared = clearProductListFilters();
      void setQuery({
        establishmentId: cleared.establishmentId || null,
      });
    }
  };

  const onAddProduct = () => {
    navigate("/products/create");
  };

  const onImportProducts = () => {
    navigate("/products/import");
  };

  const handleCopy = async () => {
    if (!isAdmin) return;
    setCopying(true);
    try {
      const tsv = await copyProductsTsv(adminFetchParams);
      await navigator.clipboard.writeText(tsv);
      toast.success(t("modules.product.list.toast.copySuccess"));
    } catch {
      toast.error(t("modules.product.list.toast.copyError"));
    } finally {
      setCopying(false);
    }
  };

  if (role !== "admin" && role !== "establishment") {
    return null;
  }

  const headerActions = (
    <div className="flex flex-wrap gap-2">
      {isAdmin ? (
        <>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            disabled={copying}
            onClick={() => void handleCopy()}
          >
            <Copy className="size-4" />
            {t("modules.product.list.copy")}
          </Button>
          <Button type="button" variant="outline" className="gap-2" onClick={onImportProducts}>
            <Upload className="size-4" />
            {t("modules.product.list.importProducts")}
          </Button>
        </>
      ) : null}
      <Button type="button" className="gap-2 text-white" onClick={onAddProduct}>
        <Plus className="size-4" />
        {t("modules.product.list.addProduct")}
      </Button>
    </div>
  );

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.product.list.pageTitle")}
      subtitle={t("modules.product.list.pageSubtitle", { count: total })}
      headerActions={headerActions}
    >
      <div className="flex flex-col gap-4">
        {isAdmin ? <ProductModuleNav /> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={t("modules.product.list.searchPlaceholder")}
              value={query.name}
              onChange={(e) => handleNameSearch(e.target.value)}
            />
          </div>
          <ProductListFilters
            role={role}
            adminApplied={{
              brand: query.brand,
              weight: query.weight,
              segmentId: query.segmentId,
            }}
            establishmentApplied={{
              establishmentId: query.establishmentId,
            }}
            segments={segments}
            establishments={establishments}
            showEstablishmentFilter={showEstablishmentFilter}
            activeCount={activeFilterCount}
            onApplyAdmin={(draft) => {
              void setQuery({
                brand: draft.brand || null,
                weight: draft.weight || null,
                segmentId: draft.segmentId || null,
              });
            }}
            onApplyEstablishment={(draft) => {
              void setQuery({
                establishmentId:
                  showEstablishmentFilter && draft.establishmentId
                    ? draft.establishmentId
                    : null,
              });
            }}
            onClear={handleClearFilters}
          />
        </div>

        {listState.isLoading ? (
          <ProductListSkeleton />
        ) : isMobile ? (
          <ProductListMobileCards
            role={role}
            adminRows={adminRows}
            establishmentRows={establishmentRows}
            showEstablishmentColumn={showEstablishmentColumn}
            scrollRef={scrollRef}
            hasNextPage={Boolean(listState.hasNextPage)}
            isFetchingNextPage={listState.isFetchingNextPage}
            onLoadMore={() => void listState.fetchNextPage()}
            hasDraft={hasDraft}
          />
        ) : (
          <ProductListTable
            role={role}
            adminRows={adminRows}
            establishmentRows={establishmentRows}
            showEstablishmentColumn={showEstablishmentColumn}
            sort={query.sort}
            order={query.order}
            onToggleNameSort={handleToggleNameSort}
            onToggleEstablishmentSort={handleToggleEstablishmentSort}
            scrollRef={scrollRef}
            hasNextPage={Boolean(listState.hasNextPage)}
            isFetchingNextPage={listState.isFetchingNextPage}
            onLoadMore={() => void listState.fetchNextPage()}
            onDelete={isAdmin ? handleDeleteRequest : undefined}
            hasDraft={hasDraft}
          />
        )}
      </div>

      {deleteTarget ? (
        <ProductDeleteConfirmDialog
          productName={deleteTarget.name}
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          onConfirm={handleDeleteConfirm}
          isPending={deleteMutation.isPending}
        />
      ) : null}
    </DashboardPageLayout>
  );
}
