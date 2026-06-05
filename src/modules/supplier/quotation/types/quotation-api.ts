import type { OpenQuotationStatus } from "@/modules/supplier/quotation/types/open-quotation";

export interface QuotationPackagingUnit {
  unit: string;
  weight: number;
}

export interface QuotationBudgetProductBrand {
  id: string;
  name: string;
}

export interface QuotationBudgetProductQuotation {
  id: string;
  packagingUnit?: QuotationPackagingUnit | null;
  brand: { id: string; name: string };
  value: number;
  observation: string;
}

export interface QuotationBudgetProduct {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitType: string;
  packagingUnit?: QuotationPackagingUnit | null;
  observation: string;
  isBlocked: boolean;
  segments: { id: string; name: string }[];
  quoteAnyBrand: boolean;
  brands: QuotationBudgetProductBrand[];
  quotations: QuotationBudgetProductQuotation[];
}

export interface QuotationBudgetEstablishment {
  id: string;
  name: string;
  cnpj: string;
  responsible: { name: string; email: string };
  phone: string;
  address?: {
    zipCode: string;
    state: string;
    city: string;
    neighborhood: string;
    street: string;
    number: string;
    complement?: string;
  };
}

export interface QuotationBudget {
  id: string;
  deadline: string;
  deliveryTime?: string;
  observation?: string | null;
  establishment: QuotationBudgetEstablishment;
}

export interface QuotationDetailResponse {
  id: string;
  paymentMethod?: string;
  paymentTerm?: string;
  deliveryDeadline?: string;
  estimatedDeliveryTime?: string;
  expirationDate?: string;
  observation?: string;
  budget: QuotationBudget;
  status: OpenQuotationStatus;
  sentAt?: string | null;
  budgetProducts: QuotationBudgetProduct[];
  supplierId: string;
}

export interface SendQuotationItemPayload {
  productId: string;
  brandName: string;
  value: number;
  observation?: string | null;
  packagingUnit?: QuotationPackagingUnit;
}

export interface SendQuotationPayload {
  status: OpenQuotationStatus;
  paymentMethod?: string;
  paymentTerm?: string;
  deliveryDeadline?: string;
  expirationDate?: string;
  observation?: string | null;
  items?: SendQuotationItemPayload[];
}
