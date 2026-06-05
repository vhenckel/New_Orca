import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { fetchBudgetOrder } from "@/modules/buyer/quotation/api/budgets-api";
import { NO_SUPPLIER_ID } from "@/modules/buyer/quotation/lib/budget-order-constants";
import { getOrdersBySupplierFilter } from "@/modules/buyer/quotation/lib/budget-order-state";
import { formatBudgetOrder } from "@/modules/buyer/quotation/lib/format-order";
import { formatViewBudgetProductBrands } from "@/modules/buyer/quotation/lib/view-budget-display";
import type { BudgetOrder, BudgetViewProduct } from "@/modules/buyer/quotation/types/view-budget";

export const budgetOrderQueryKey = (budgetId: string, supplierId?: string) =>
  ["budgets", "order", budgetId, supplierId ?? "all"] as const;

export interface UseBudgetOrderLabels {
  noSupplierHeader: string;
  paymentNotInformed: string;
  observationNotInformed: string;
}

export function useBudgetOrder(
  budgetId: string,
  products: BudgetViewProduct[],
  enabled: boolean,
  labels: UseBudgetOrderLabels,
  noSupplierOptionLabel: string,
  anyBrandLabel: string,
) {
  const [supplierId, setSupplierId] = useState<string>("");

  const productsWithNoSupplier = useMemo((): BudgetOrder => {
    const withoutSupplier = products.filter((p) => !p.supplier?.trim());
    if (withoutSupplier.length === 0) return [];

    return [
      {
        id: NO_SUPPLIER_ID,
        supplier: {
          id: NO_SUPPLIER_ID,
          name: "Sem fornecedor",
          phone: "",
          responsible: { email: "" },
        },
        establishmentName: "",
        responsibleName: "",
        phone: "",
        totalPrice: 0,
        products: withoutSupplier.map((product) => ({
          productName: product.name,
          unit: product.unitType,
          packagingUnit: product.packagingUnit,
          quantity: product.quantity,
          productTotalPrice: 0,
          pricePerUnit: 0,
          brand: formatViewBudgetProductBrands(product, anyBrandLabel),
        })),
      },
    ];
  }, [products, anyBrandLabel]);

  const shouldFetchOrder =
    enabled && Boolean(budgetId) && (!supplierId || supplierId !== NO_SUPPLIER_ID);

  const orderQuery = useQuery({
    queryKey: budgetOrderQueryKey(
      budgetId,
      supplierId && supplierId !== NO_SUPPLIER_ID ? supplierId : undefined,
    ),
    queryFn: () =>
      fetchBudgetOrder(
        budgetId,
        supplierId && supplierId !== NO_SUPPLIER_ID ? supplierId : undefined,
      ),
    enabled: shouldFetchOrder,
  });

  const allOrdersQuery = useQuery({
    queryKey: budgetOrderQueryKey(budgetId),
    queryFn: () => fetchBudgetOrder(budgetId),
    enabled: enabled && Boolean(budgetId),
  });

  const combinedOrder = useMemo(() => {
    const data = orderQuery.data ?? [];
    if (!supplierId && data.length && productsWithNoSupplier.length) {
      return [...data, ...productsWithNoSupplier];
    }
    if (!supplierId && data.length) return data;
    if (!supplierId && productsWithNoSupplier.length) return productsWithNoSupplier;
    return [];
  }, [orderQuery.data, productsWithNoSupplier, supplierId]);

  const resolvedOrders = useMemo(
    () =>
      getOrdersBySupplierFilter(
        supplierId || undefined,
        orderQuery.data ?? [],
        productsWithNoSupplier,
        combinedOrder,
      ),
    [supplierId, orderQuery.data, productsWithNoSupplier, combinedOrder],
  );

  const orderText = useMemo(() => {
    if (!resolvedOrders.length) return "";
    return formatBudgetOrder(resolvedOrders, labels);
  }, [resolvedOrders, labels]);

  const supplierOptions = useMemo(() => {
    const orderData = allOrdersQuery.data ?? [];
    const options = orderData.map((item) => ({
      value: item.supplier.id,
      label: item.supplier.name,
    }));

    if (productsWithNoSupplier.length > 0) {
      return [{ value: NO_SUPPLIER_ID, label: noSupplierOptionLabel }, ...options];
    }
    return options;
  }, [allOrdersQuery.data, noSupplierOptionLabel, productsWithNoSupplier.length]);

  const isLoading = orderQuery.isLoading || allOrdersQuery.isLoading;
  const isError = orderQuery.isError || allOrdersQuery.isError;

  return {
    supplierId,
    setSupplierId,
    resolvedOrders,
    orderText,
    supplierOptions,
    isLoading,
    isError,
    orderQuery,
    allOrdersQuery,
  };
}
