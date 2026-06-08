import { formatPackagingUnit } from "@/modules/buyer/quotation/lib/create-budget-mapper";
import type { QuotationDetailResponse } from "@/modules/supplier/quotation/types/quotation-api";
import type {
  SupplierQuotationDetail,
  SupplierQuotationDetailItem,
} from "@/modules/supplier/quotation/types/quotation-detail";

function formatEstablishmentAddress(
  establishment: QuotationDetailResponse["budget"]["establishment"],
): string {
  const addr = establishment.address;
  if (!addr) return establishment.name;
  const parts = [
    addr.street,
    addr.number,
    addr.complement,
    addr.neighborhood,
    addr.city,
    addr.state,
    addr.zipCode,
  ].filter(Boolean);
  return parts.join(", ");
}

function mapQuotationObservations(
  product: QuotationDetailResponse["budgetProducts"][number],
): Record<string, string> | undefined {
  const entries = product.quotations
    .filter((q) => q.observation?.trim())
    .map((q) => [q.brand.name, q.observation.trim()] as const);
  if (entries.length === 0) return undefined;
  return Object.fromEntries(entries);
}

function mapBudgetProduct(product: QuotationDetailResponse["budgetProducts"][number]): SupplierQuotationDetailItem {
  const existingQuotation = product.quotations[0];
  const requestedPackaging = formatPackagingUnit(product.packagingUnit ?? null);

  const item: SupplierQuotationDetailItem = {
    id: product.id,
    productId: product.productId,
    productName: product.name,
    requestedPackaging: requestedPackaging || "—",
    segments: product.segments.map((s) => s.name),
    quantity: product.quantity,
    unitLabel: product.unitType,
    isBlocked: product.isBlocked,
    establishmentObservation: product.observation || null,
    unitPrice: existingQuotation?.value,
    quotationObservations: mapQuotationObservations(product),
  };

  if (product.quoteAnyBrand) {
    item.brandPlaceholder = "any";
    item.fallbackHint = "Qualquer Marca";
  } else if (product.brands.length === 0) {
    item.brandPlaceholder = "none";
    item.fallbackHint = "Sem Marca";
  } else if (product.brands.length === 1) {
    item.requestedBrand = product.brands[0]?.name;
  } else if (product.brands.length > 1) {
    item.requestedBrands = product.brands.map((b) => b.name);
  }

  return item;
}

export function mapQuotationApiToDetailView(
  quotation: QuotationDetailResponse,
): SupplierQuotationDetail {
  const { budget, budgetProducts } = quotation;
  const establishment = budget.establishment;

  return {
    id: quotation.id,
    supplierId: quotation.supplierId,
    establishmentId: establishment.id,
    title: establishment.name,
    status: quotation.status,
    buyerName: establishment.name,
    buyerRepresentativeName: establishment.responsible.name,
    buyerContactEmail: establishment.responsible.email,
    buyerTaxId: establishment.cnpj,
    buyerPhone: establishment.phone,
    buyerAddressLine: formatEstablishmentAddress(establishment),
    buyerCity: establishment.address?.city ?? "",
    createdAt: budget.deadline,
    deadlineAt: budget.deadline,
    deliveryWindowLabel:
      quotation.deliveryDeadline ??
      quotation.estimatedDeliveryTime ??
      budget.deliveryTime ??
      "—",
    paymentMethodLabel: quotation.paymentMethod ?? "",
    paymentDeadlineLabel: quotation.paymentTerm ?? "",
    quotationValidUntilAt: quotation.expirationDate ?? "",
    generalNotes: quotation.observation ?? budget.observation ?? "",
    items: budgetProducts.map(mapBudgetProduct),
  };
}
