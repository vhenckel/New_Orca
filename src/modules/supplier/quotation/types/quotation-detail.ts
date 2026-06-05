import type { OpenQuotationStatus } from "@/modules/supplier/quotation/types/open-quotation";

export interface SupplierQuotationDetailItem {
  id: string;
  productId: string;
  productName: string;
  requestedPackaging: string;
  segments: string[];
  quantity: number;
  unitLabel: string;
  requestedBrand?: string;
  requestedBrands?: string[];
  fallbackHint?: string;
  selectedBrand?: string;
  unitPrice?: number;
}

export interface SupplierQuotationDetail {
  id: string;
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
