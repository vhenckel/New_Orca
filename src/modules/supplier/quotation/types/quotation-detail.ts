import type { OpenQuotationStatus } from "@/modules/supplier/quotation/types/open-quotation";

export type BrandPlaceholder = "none" | "any";

export interface SupplierQuotationDetailItem {
  id: string;
  productId: string;
  productName: string;
  requestedPackaging: string;
  segments: string[];
  quantity: number;
  unitLabel: string;
  isBlocked: boolean;
  establishmentObservation?: string | null;
  brandPlaceholder?: BrandPlaceholder;
  requestedBrand?: string;
  requestedBrands?: string[];
  fallbackHint?: string;
  selectedBrand?: string;
  unitPrice?: number;
  quotationObservations?: Record<string, string>;
}

export interface SupplierQuotationDetail {
  id: string;
  supplierId: string;
  establishmentId: string;
  title: string;
  status: OpenQuotationStatus;
  buyerName: string;
  buyerRepresentativeName: string;
  buyerContactEmail: string;
  buyerTaxId: string;
  buyerPhone: string;
  buyerAddressLine: string;
  buyerCity: string;
  createdAt: string;
  deadlineAt: string;
  deliveryWindowLabel: string;
  paymentMethodLabel: string;
  paymentDeadlineLabel: string;
  quotationValidUntilAt: string;
  generalNotes: string;
  items: SupplierQuotationDetailItem[];
}
