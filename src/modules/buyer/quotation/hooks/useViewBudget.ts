import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchBudgetById,
  fetchBudgetProducts,
  fetchBudgetSummary,
  fetchBudgetSuppliers,
  finalizeBudget,
  selectCheapestQuotations,
} from "@/modules/buyer/quotation/api/budgets-api";

export const viewBudgetQueryKey = (budgetId: string) => ["budgets", "view", budgetId] as const;

export function useViewBudget(budgetId: string | undefined) {
  const enabled = Boolean(budgetId);
  const id = budgetId ?? "";

  const budgetQuery = useQuery({
    queryKey: [...viewBudgetQueryKey(id), "detail"],
    queryFn: () => fetchBudgetById(id),
    enabled,
  });

  const summaryQuery = useQuery({
    queryKey: [...viewBudgetQueryKey(id), "summary"],
    queryFn: () => fetchBudgetSummary(id),
    enabled,
  });

  const productsQuery = useQuery({
    queryKey: [...viewBudgetQueryKey(id), "products"],
    queryFn: () => fetchBudgetProducts(id),
    enabled,
  });

  const suppliersQuery = useQuery({
    queryKey: [...viewBudgetQueryKey(id), "suppliers"],
    queryFn: () => fetchBudgetSuppliers(id),
    enabled,
  });

  const isLoading =
    budgetQuery.isLoading ||
    summaryQuery.isLoading ||
    productsQuery.isLoading ||
    suppliersQuery.isLoading;

  const isError =
    budgetQuery.isError ||
    summaryQuery.isError ||
    productsQuery.isError ||
    suppliersQuery.isError;

  return {
    budget: budgetQuery.data,
    summary: summaryQuery.data,
    products: productsQuery.data ?? [],
    suppliers: suppliersQuery.data ?? [],
    isLoading,
    isError,
    budgetQuery,
    summaryQuery,
    productsQuery,
    suppliersQuery,
  };
}

export function useInvalidateViewBudget() {
  const queryClient = useQueryClient();
  return (budgetId: string) =>
    queryClient.invalidateQueries({ queryKey: viewBudgetQueryKey(budgetId) });
}

export function useFinalizeBudget(budgetId: string) {
  const invalidate = useInvalidateViewBudget();
  return useMutation({
    mutationFn: () => finalizeBudget(budgetId),
    onSuccess: () => invalidate(budgetId),
  });
}

export function useSelectCheapestQuotations(budgetId: string) {
  const invalidate = useInvalidateViewBudget();
  return useMutation({
    mutationFn: () => selectCheapestQuotations(budgetId),
    onSuccess: () => invalidate(budgetId),
  });
}
