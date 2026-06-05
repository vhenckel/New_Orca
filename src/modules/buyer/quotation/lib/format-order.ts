import { NO_SUPPLIER_ID } from "@/modules/buyer/quotation/lib/budget-order-constants";
import { formatProductNameWithPackaging } from "@/modules/buyer/quotation/lib/platform-product-display";
import type { BudgetOrder, BudgetOrderProduct } from "@/modules/buyer/quotation/types/view-budget";

export function formatOrderMoney(value?: number | null): string {
  if (value == null || !Number.isFinite(value)) return "0,00";
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatOrderQuantity(quantity: number): string {
  return quantity.toFixed(2).replace(".", ",");
}

function formatOrderPhone(phone?: string): string {
  return phone?.trim() ?? "";
}

export function formatOrderProductLabel(product: BudgetOrderProduct): string {
  return formatProductNameWithPackaging(
    { name: product.productName, packagingUnit: product.packagingUnit ?? null },
    "-",
  );
}

export function formatOrderBrandSuffix(product: Pick<BudgetOrderProduct, "brand">): string {
  const brand = product.brand?.trim();
  return brand ? ` (${brand})` : "";
}

function formatOrderProductLine(product: BudgetOrderProduct): string {
  const label = formatOrderProductLabel(product);
  return `${formatOrderQuantity(product.quantity)} (${product.unit}) - ${label}${formatOrderBrandSuffix(product)}`;
}

function formatOrderProductLineWithPrice(product: BudgetOrderProduct): string {
  const base = formatOrderProductLine(product);
  return `${base} R$ ${formatOrderMoney(product.productTotalPrice)} (R$ ${formatOrderMoney(
    product.pricePerUnit,
  )} / ${product.unit})`;
}

export interface FormatOrderLabels {
  noSupplierHeader: string;
  paymentNotInformed: string;
  observationNotInformed: string;
}

export function formatBudgetOrder(orders: BudgetOrder, labels: FormatOrderLabels): string {
  return orders
    .map((order, index) => {
      if (order.supplier.id === NO_SUPPLIER_ID) {
        return `${labels.noSupplierHeader}\n\n${order.products.map(formatOrderProductLine).join("\n\n")}`;
      }

      const productLines = order.products.map(formatOrderProductLineWithPrice).join("\n\n");

      return `${index + 1} - Pedido de compra - ${order.supplier.name}\n${formatOrderPhone(
        order.supplier.phone,
      )}\n${order.supplier.responsible.email}\n\n${productLines}\n\nTotal: R$ ${formatOrderMoney(
        order.totalPrice,
      )}\n\n\n${order.establishmentName} (${order.responsibleName})\n${formatOrderPhone(
        order.phone,
      )}\n\nPagamento: ${order.paymentMethod?.trim() || labels.paymentNotInformed}\nObservação: ${
        order.observation?.trim() || labels.observationNotInformed
      }\n_______________________________________`;
    })
    .join("\n\n");
}
