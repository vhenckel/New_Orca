import { NO_SUPPLIER_ID } from "@/modules/buyer/quotation/lib/budget-order-constants";
import type { BudgetOrder } from "@/modules/buyer/quotation/types/view-budget";

export function getOrdersBySupplierFilter(
  supplierId: string | undefined,
  orderData: BudgetOrder,
  productsWithNoSupplier: BudgetOrder,
  combinedOrder: BudgetOrder,
): BudgetOrder {
  if (supplierId === NO_SUPPLIER_ID) {
    return productsWithNoSupplier;
  }
  if (!supplierId) {
    return combinedOrder.length ? combinedOrder : [];
  }
  return orderData;
}
